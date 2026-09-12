// 끼니 v1 프로토타입 — 오늘 (IN → DC/MO → RC 흐름)
// requirements.md v1 미승인 초안 + open-questions.md 추천 답 기준 프로토타입. 정식 구현 아님.
//
// IN-R01 세 값이 없으면 카드를 계산하지 않는다 → 입력 화면이 먼저 온다.
// DC-R04 카드는 화면 중앙에 애니메이션과 함께 나타난다 (ux/flows.md 3절).
// DC-R05 계산 중에는 "고르는 중"을 쓰고 직전 카드를 남겨두지 않는다.
// DC-R06 실패는 "지금은 정해줄 수 없다" + 다시 시도. 임의의 음식을 대신 내놓지 않는다.
// DC-R07 후보 0개는 "조건에 맞는 게 없다" + 걸린 조건별 개수.
// DC-R13 카드가 나타난 시각을 기록한다.
// RE-R01·R02·R05 다시 돌리기 1개, 같은 자리·같은 애니메이션, 입력은 다시 묻지 않는다.
// RE-R04 상한을 두지 않는다 (RE-OQ-02 추천).
// MO-R03 갈래를 바꾸면 결정은 다시 계산된다 — 갈래는 입력 화면에서 바꾼다.
// MO-R04 시켜 먹기는 배달앱 웹 URL을 연다. 비공식 스킴은 쓰지 않는다 (architecture 6절).

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Linking, StyleSheet, Text, View } from 'react-native';
import { CATALOG_VERSION, DELIVERY_MENUS, INGREDIENTS, RECIPES, UNITS } from '../catalog';
import {
  ANIM, Answered, BlockedBy, Branch, COPY, Decision, Inputs, KkiniState, SETTINGS,
  answeredOr, cost, declared, draw, iso, makeMealLog, pushDecision, recentItemIds, unset
} from '../engine';
import { ff, useTheme } from '../theme';
import { DecisionCard } from '../components/DecisionCard';
import { StateBox } from '../components/StateBox';
import { Input } from './Input';
import { Recipe } from './Recipe';

type Stage =
  | { k: 'input' }
  | { k: 'loading' }
  | { k: 'card'; decision: Decision; animKey: number; slots: string[] }
  | { k: 'empty'; blockedBy: BlockedBy }
  | { k: 'error' }
  | { k: 'recipe'; decision: Decision };

interface Props {
  state: KkiniState;
  mutate: (fn: (s: KkiniState) => void) => void;
  storageOk: boolean;
  onGoSettings: () => void;
}

const DELIVERY_APP_URL = 'https://www.baemin.com';   // architecture 6절: 웹 URL만 쓴다

export function Today({ state, mutate, storageOk, onGoSettings }: Props) {
  const { c, fontsLoaded, font } = useTheme();

  // IN-R07/R08 — 지난번 값으로 시작한다. 갈래는 매번 고른다 (기본 해 먹기, MO-R02)
  const saved = state.lastInputs;
  const [branch, setBranch] = useState<Branch>('home');
  const [servings, setServings] = useState<number>(
    saved ? saved.servings : answeredOr(state.profile.defaultServings, SETTINGS.servingsDefault)
  );
  const [budget, setBudget] = useState<Answered<number>>(
    saved ? saved.budgetKrw : state.profile.defaultBudgetKrw
  );
  const [stage, setStage] = useState<Stage>({ k: 'input' });
  const [reduceMotion, setReduceMotion] = useState(false);
  const animKey = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const address = state.profile.address;

  useEffect(() => {
    let alive = true;
    // ux/flows.md 3절: reduce-motion이면 사이클링을 생략하고 150ms 페이드로 대체한다
    try {
      AccessibilityInfo.isReduceMotionEnabled().then((v) => { if (alive) setReduceMotion(!!v); });
    } catch (e) { /* 지원하지 않는 플랫폼이면 조용히 기본값을 쓴다 */ }
    return () => { alive = false; };
  }, []);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  // 개발용 "실패 상태 미리보기" — 누르면 바로 실패 화면을 보여준다 (DC-R06 문구 확인용)
  useEffect(() => {
    if (state.devFailMode) setStage({ k: 'error' });
  }, [state.devFailMode]);

  const saveInputs = useCallback((next: Partial<Inputs>) => {
    // IN-R07: 예산·인분·주소는 마지막 값이 저장된다. 갈래는 저장하지 않는다 (IN-OQ-02 추천)
    mutate((s) => {
      s.lastInputs = {
        branch: next.branch ?? branch,
        budgetKrw: next.budgetKrw ?? budget,
        servings: next.servings ?? servings,
        address: s.profile.address.status === 'declared' ? s.profile.address.value : undefined,
        savedAt: iso(new Date())
      };
    });
  }, [branch, budget, servings, mutate]);

  const roll = useCallback((useBranch: Branch, useServings: number, useBudget: Answered<number>) => {
    if (timer.current) clearTimeout(timer.current);
    setStage({ k: 'loading' });   // DC-R05: 직전 카드를 남기지 않는다

    timer.current = setTimeout(() => {
      const now = new Date();
      const inputs: Inputs = {
        branch: useBranch, budgetKrw: useBudget, servings: useServings,
        address: address.status === 'declared' ? address.value : undefined,
        savedAt: iso(now)
      };
      let res;
      try {
        // devFailMode는 위 effect가 실패 화면을 직접 띄운다 — 여기서 던지면 "다시 시도"가
        // 같은 렌더의 옛 state를 보고 다시 실패해 빠져나올 수 없다
        res = draw({
          recipes: RECIPES, menus: DELIVERY_MENUS, ingredients: INGREDIENTS, units: UNITS,
          profile: state.profile, inputs,
          logs: state.mealLogs, recentIds: recentItemIds(state),
          catalogVersion: CATALOG_VERSION, now
        });
      } catch (e) {
        setStage({ k: 'error' });   // DC-R06
        return;
      }
      if (res.kind === 'empty') { setStage({ k: 'empty', blockedBy: res.blockedBy }); return; }
      if (res.kind === 'error') { setStage({ k: 'error' }); return; }

      const d = res.decision;
      d.shownAt = iso(new Date());   // DC-R13
      mutate((s) => { pushDecision(s, d); });

      // 슬롯 사이클링에 쓸 다른 후보 이름들 (뽑힌 것은 마지막에만 나온다)
      const src = useBranch === 'home' ? RECIPES.map((r) => r.name) : DELIVERY_MENUS.map((m) => m.name);
      const slots: string[] = [];
      for (let i = 0; i < ANIM.cycleIntervals.length; i++) {
        const cand = src[Math.floor(Math.random() * src.length)];
        slots.push(cand === d.name && src.length > 1 ? src[(src.indexOf(cand) + 1) % src.length] : cand);
      }
      animKey.current += 1;
      setStage({ k: 'card', decision: d, animKey: animKey.current, slots });
    }, ANIM.loadingMs);
  }, [address, state, mutate]);

  function submitInput() {
    saveInputs({ branch, budgetKrw: budget, servings });
    roll(branch, servings, budget);
  }

  function confirmDecision(d: Decision) {
    // HI-R01/R02 — 미확인 상태로 기록을 만든다. HI-OQ-01 추천: 레시피 열람 여부도 남긴다
    const opened = recipeOpened.current[d.id] === true;
    mutate((s) => {
      const target = s.decisions.find((x) => x.id === d.id);
      if (target) target.status = 'confirmed';
      if (!s.mealLogs.some((m) => m.decisionId === d.id)) {
        s.mealLogs.push(makeMealLog(d, opened, new Date()));
      }
    });
  }

  const recipeOpened = useRef<Record<string, boolean>>({});

  function openRecipe(d: Decision) {
    recipeOpened.current[d.id] = true;
    setStage({ k: 'recipe', decision: d });
  }

  function openDeliveryApp() {
    // architecture 6절: 웹 URL만 쓴다. 비공식 스킴(baemin:// 등)은 전제하지 않는다
    Linking.openURL(DELIVERY_APP_URL).catch(() => { /* 열 수 없으면 조용히 무시한다 */ });
  }

  const budgetValue = budget.status === 'declared' ? budget.value : null;
  const confirmedIds = state.decisions.filter((d) => d.status === 'confirmed').map((d) => d.id);

  /* ── 화면 ── */

  if (stage.k === 'recipe') {
    const d = stage.decision;
    const r = RECIPES.find((x) => x.id === d.itemId);
    if (!r) { setStage({ k: 'error' }); return null; }
    const cb = cost(r, servings, INGREDIENTS, UNITS, new Date());
    return (
      <Recipe
        recipe={r}
        decision={d}
        cost={cb}
        servings={servings}
        budgetKrw={budgetValue}
        onChangeServings={(n) => { setServings(n); saveInputs({ servings: n }); }}
        onBack={() => {
          // RC-R04: 인분을 바꿨으면 카드 금액도 같아야 한다 → 카드를 현재 인분으로 다시 만든다
          if (d.servings !== servings) { roll(branch, servings, budget); return; }
          animKey.current += 1;
          setStage({ k: 'card', decision: d, animKey: animKey.current, slots: [] });
        }}
      />
    );
  }

  return (
    <View style={styles.flex}>
      {!storageOk ? (
        <Text
          testID="storage-warn"
          style={[styles.warn, { color: c.warn, borderColor: c.line, fontFamily: ff(font.sansRegular, fontsLoaded) }]}
        >
          {COPY.storageFail}
        </Text>
      ) : null}

      <View style={styles.flex} accessibilityLiveRegion="polite">
        {stage.k === 'input' ? (
          <Input
            branch={branch}
            servings={servings}
            budget={budget}
            address={address}
            hadSavedValues={!!saved}
            onChangeBranch={(b) => setBranch(b)}
            onChangeServings={(n) => setServings(n)}
            onChangeBudget={(b) => setBudget(b)}
            onChangeAddress={(a) => mutate((s) => {
              s.profile.address = a;                      // 주소의 유일한 보관 위치 (architecture 3절)
              s.profile.updatedAt = iso(new Date());
            })}
            onSubmit={submitInput}
          />
        ) : null}

        {stage.k === 'loading' ? (
          <StateBox testID="state-loading" title={COPY.dcLoading} center />
        ) : null}

        {stage.k === 'error' ? (
          <StateBox
            testID="state-error"
            title={COPY.dcError}
            sub="조금 뒤에 다시 눌러 보면 된다"
            center
            action={{
              label: COPY.dcErrorRetry, testID: 'btn-retry',
              onPress: () => {
                mutate((s) => { s.devFailMode = false; });
                // IN-R01 — 세 값이 없으면 계산하지 않는다. 예산이 비었으면 입력 화면으로 돌린다
                if (budget.status === 'declared') roll(branch, servings, budget);
                else setStage({ k: 'input' });
              }
            }}
          />
        ) : null}

        {stage.k === 'empty' ? (
          <StateBox
            testID="state-empty"
            title={COPY.dcEmpty}
            sub="못 먹는 것은 후보가 0개가 되어도 풀지 않는다"
            blockedBy={stage.blockedBy}
            center
            action={{ label: COPY.dcEmptyLink, testID: 'btn-fix-conditions', onPress: onGoSettings }}
          />
        ) : null}

        {stage.k === 'card' ? (
          <View style={styles.flex}>
            <DecisionCard
              key={stage.animKey}          /* ux 3절: 잔상이 겹치지 않게 매번 새로 그린다 */
              decision={stage.decision}
              budgetKrw={budgetValue}
              confirmed={confirmedIds.indexOf(stage.decision.id) >= 0}
              reduceMotion={reduceMotion}
              slotNames={stage.slots}
              addressKnown={address.status === 'declared'}
              onRoll={() => roll(branch, servings, budget)}         // RE-R01·R05
              onConfirm={() => confirmDecision(stage.decision)}     // HI-R01
              onRecipe={() => openRecipe(stage.decision)}           // DC-R10
              onOpenDeliveryApp={openDeliveryApp}                   // MO-R04
            />
            <Text
              testID="btn-back-input"
              accessibilityRole="button"
              onPress={() => setStage({ k: 'input' })}
              style={[styles.link, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}
            >
              예산·인분·갈래 고치기
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  warn: {
    fontSize: 12, lineHeight: 18, borderWidth: 1, borderStyle: 'dashed',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10
  },
  link: { fontSize: 13, textAlign: 'center', paddingVertical: 12, textDecorationLine: 'underline' }
});
