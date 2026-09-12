// 끼니 v1 프로토타입 — 취향·제약 / 설정 (PR) + 개발용
// requirements.md v1 미승인 초안 + open-questions.md 추천 답 기준 프로토타입. 정식 구현 아님.
//
// PR-R01 저장 항목은 다섯 가지다: 절대 제외 / 싫어하는 것 / 기본 예산 / 기본 인분 / 집주소.
// PR-R02 절대 제외에 걸린 음식은 어떤 경우에도 카드에 나오지 않는다 (후보 0개가 되어도 풀지 않는다).
// PR-R03 예산 초과는 제외 사유가 아니다 — 예산은 표시 정보다.
// PR-R04 비었을 때는 "제약 없음"이 아니라 "아직 입력 안 함" (PR-OQ-02 추천: 3상태).
// PR-R05 변경은 다음 결정부터 적용된다.
// PR-R06 필수 항목은 0개다.
// PR-R07 집주소는 언제든 지울 수 있다. 지우면 시켜 먹기는 "주소 없음"으로 돌아간다.
// 설정은 PR과 같은 데이터를 보여주는 진입점이다 — 별도 화면을 만들지 않는다 (ux 4절).

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { DELIVERY_MENUS, RECIPES } from '../catalog';
import { CATALOG_VERSION, INGREDIENTS } from '../catalog';
import {
  ALLERGENS, ALLERGEN_SLUG, Answered, BUDGET_CHOICES, COPY, DISLIKE_TAGS, KkiniState,
  SETTINGS, TAG_SLUG, comma, declared, iso, makeSampleLogs, todayKey, unset
} from '../engine';
import { RADIUS, ff, useTheme } from '../theme';
import { Btn } from '../components/Btn';
import { Stepper } from '../components/Stepper';

interface Props {
  state: KkiniState;
  mutate: (fn: (s: KkiniState) => void) => void;
  onGoToday: () => void;
}

export function Settings({ state, mutate, onGoToday }: Props) {
  const { c, fontsLoaded, font } = useTheme();
  const p = state.profile;
  const [addrDraft, setAddrDraft] = useState(p.address.status === 'declared' ? p.address.value : '');

  function touch(fn: (s: KkiniState) => void) {
    mutate((s) => { fn(s); s.profile.updatedAt = iso(new Date()); });   // PR-R05
  }
  function statusText<T>(a: Answered<T>, fmt: (v: T) => string): string {
    return a.status === 'unset' ? COPY.prUnset : fmt(a.value);          // PR-R04
  }

  const absMode: 'unset' | 'none' | 'some' =
    p.absoluteExclusions.status === 'unset' ? 'unset'
      : p.absoluteExclusions.value.length ? 'some' : 'none';
  const absList = p.absoluteExclusions.status === 'declared' ? p.absoluteExclusions.value : [];
  const dislikeList = p.dislikes.status === 'declared' ? p.dislikes.value : [];

  function setAbsMode(mode: 'unset' | 'none' | 'some') {
    touch((s) => {
      if (mode === 'unset') s.profile.absoluteExclusions = unset<string[]>();
      else if (mode === 'none') s.profile.absoluteExclusions = declared<string[]>([]);
      else if (s.profile.absoluteExclusions.status !== 'declared') {
        s.profile.absoluteExclusions = declared<string[]>([]);
      }
    });
  }
  function toggleIn(list: string[], v: string): string[] {
    const out = list.slice();
    const i = out.indexOf(v);
    if (i >= 0) out.splice(i, 1); else out.push(v);
    return out;
  }

  /* 개발용 — 첫 실행은 진짜 콜드 스타트다. 정식 구현에는 이 버튼이 없다 */
  function devSeed() {
    mutate((s) => { s.mealLogs = makeSampleLogs(RECIPES, DELIVERY_MENUS); });
  }
  function devFail() {
    mutate((s) => { s.devFailMode = true; });
    onGoToday();
  }
  function devReset() {
    const t = todayKey();
    mutate((s) => {
      s.devFailMode = false;
      s.decisions = s.decisions.filter((d) => d.createdAt.slice(0, 10) !== t);
      s.mealLogs = s.mealLogs.filter((m) => m.dateKey !== t);
      s.lastInputs = null;
    });
    onGoToday();
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: c.ink, fontFamily: ff(font.serifBold, fontsLoaded) }]}>
        취향·제약
      </Text>
      <Text style={[styles.sub, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
        필수 항목은 없다. 바꾸면 바로 저장되고 다음 결정부터 적용된다.
      </Text>

      {/* PR-R01 ① 절대 제외 — 3상태 */}
      <View style={[styles.field, { borderBottomColor: c.line }]}>
        <Head label="못 먹는 것 (절대 제외)" status={statusText(p.absoluteExclusions, (v) =>
          v.length ? '있음 — ' + v.join(', ') : '없음')} unsetFlag={p.absoluteExclusions.status === 'unset'} />
        <View style={styles.radios}>
          {([['unset', COPY.prUnset], ['none', '없음'], ['some', '있음 (아래에서 고른다)']] as const).map(([m, label]) => (
            <Choice key={m} testID={`pr-abs-${m}`} label={label} selected={absMode === m}
              role="radio" onPress={() => setAbsMode(m)} />
          ))}
        </View>
        {p.absoluteExclusions.status === 'declared' ? (
          <View testID="pr-allergens" style={styles.grid}>
            {ALLERGENS.map((a) => (
              <Choice key={a} testID={`pr-allergen-${ALLERGEN_SLUG[a]}`} label={a} half role="checkbox"
                selected={absList.indexOf(a) >= 0}
                onPress={() => touch((s) => { s.profile.absoluteExclusions = declared(toggleIn(absList, a)); })} />
            ))}
          </View>
        ) : null}
        <Note>여기 고른 것은 어떤 경우에도 추천에 나오지 않는다. 후보가 0개가 되어도 풀지 않는다.</Note>
      </View>

      {/* PR-R01 ② 싫어하는 것 — 감점, 제외 아님 */}
      <View style={[styles.field, { borderBottomColor: c.line }]}>
        <Head label="싫어하는 것" status={statusText(p.dislikes, (v) => v.length ? v.join(', ') : '없음')}
          unsetFlag={p.dislikes.status === 'unset'} />
        <View testID="pr-dislikes" style={styles.grid}>
          {DISLIKE_TAGS.map((t) => (
            <Choice key={t} testID={`pr-dislike-${TAG_SLUG[t]}`} label={t} half role="checkbox"
              selected={dislikeList.indexOf(t) >= 0}
              onPress={() => touch((s) => { s.profile.dislikes = declared(toggleIn(dislikeList, t)); })} />
          ))}
        </View>
        <Note>고른 것은 점수가 깎일 뿐 목록에서 사라지지 않는다. 예산 초과도 마찬가지다 (PR-R03).</Note>
      </View>

      {/* PR-R01 ③ 기본 예산 */}
      <View style={[styles.field, { borderBottomColor: c.line }]}>
        <Head label="기본 예산" status={statusText(p.defaultBudgetKrw, (v) => comma(v) + '원')}
          unsetFlag={p.defaultBudgetKrw.status === 'unset'} />
        <View style={styles.grid}>
          <Choice testID="pr-budget-unset" label={COPY.prUnset} half role="radio"
            selected={p.defaultBudgetKrw.status === 'unset'}
            onPress={() => touch((s) => { s.profile.defaultBudgetKrw = unset<number>(); })} />
          {BUDGET_CHOICES.map((v) => (
            <Choice key={v} testID={`pr-budget-${v}`} label={comma(v) + '원'} half role="radio"
              selected={p.defaultBudgetKrw.status === 'declared' && p.defaultBudgetKrw.value === v}
              onPress={() => touch((s) => { s.profile.defaultBudgetKrw = declared(v); })} />
          ))}
        </View>
        <Note>입력 화면의 "지난번 값"과는 별개로 저장된다 — 어느 쪽이 이기는지는 아직 정해지지 않았다(README 미정).</Note>
      </View>

      {/* PR-R01 ④ 기본 인분 */}
      <View style={[styles.field, { borderBottomColor: c.line }]}>
        <Head label="기본 인분" status={statusText(p.defaultServings, (v) => v + '인분')}
          unsetFlag={p.defaultServings.status === 'unset'} />
        <Stepper
          value={p.defaultServings.status === 'declared' ? p.defaultServings.value : SETTINGS.servingsDefault}
          min={SETTINGS.servingsMin} max={SETTINGS.servingsMax} suffix="인분"
          testIDPrefix="pr-servings"
          onChange={(n) => touch((s) => { s.profile.defaultServings = declared(n); })}
        />
        <Choice testID="pr-servings-unset" label={COPY.prUnset} role="radio"
          selected={p.defaultServings.status === 'unset'}
          onPress={() => touch((s) => { s.profile.defaultServings = unset<number>(); })} />
      </View>

      {/* PR-R01 ⑤ 집주소 (PR-R07) */}
      <View style={[styles.field, { borderBottomColor: c.line }]}>
        <Head label="집주소" status={statusText(p.address, (v) => v || COPY.prUnset)}
          unsetFlag={p.address.status === 'unset'} />
        <TextInput
          testID="pr-address-field"
          value={addrDraft}
          onChangeText={setAddrDraft}
          onBlur={() => touch((s) => {
            s.profile.address = addrDraft.trim() ? declared(addrDraft.trim()) : unset<string>();
          })}
          placeholder="예: 서울 마포구 망원동"
          placeholderTextColor={c.muted}
          accessibilityLabel="집주소"
          style={[styles.input, { borderColor: c.line, color: c.ink, backgroundColor: c.surface }]}
        />
        <View style={styles.rowBtns}>
          <Btn testID="pr-address-save" label="저장" small onPress={() => touch((s) => {
            s.profile.address = addrDraft.trim() ? declared(addrDraft.trim()) : unset<string>();
          })} />
          <Btn testID="pr-address-clear" label="주소 지우기" small onPress={() => {
            setAddrDraft('');
            touch((s) => { s.profile.address = unset<string>(); });
          }} />
        </View>
        <Note>
          기기에만 저장하고 서버로 보내지 않는다. 시켜 먹기에서 배달 가능한 매장을 거르는 데만 쓸 값이지만,
          지금은 매장 데이터가 없어 {COPY.moNoFilter}
        </Note>
      </View>

      <View style={styles.devbox}>
        <Text style={[styles.title, { color: c.ink, fontFamily: ff(font.serifBold, fontsLoaded) }]}>개발용</Text>
        <Text style={[styles.sub, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
          프로토타입 확인용 버튼이다. 정식 구현에는 없다.
        </Text>
        <View style={styles.stack}>
          <Btn testID="dev-seed" label="예시 기록 7건 넣기" onPress={devSeed} />
          <Btn testID="dev-fail" label="실패 상태 미리보기" onPress={devFail} />
          <Btn testID="dev-reset" label="오늘 초기화" onPress={devReset} />
        </View>
        <Note>
          카탈로그 레시피 {RECIPES.length}개 · 재료 {INGREDIENTS.length}종 · 배달 메뉴 {DELIVERY_MENUS.length}종
          (판본 {CATALOG_VERSION}) · 하루 경계 0{SETTINGS.dayBoundaryHour}:00 ·
          인분 {SETTINGS.servingsMin}~{SETTINGS.servingsMax} · 단가 기준일 {SETTINGS.agedDays}일 경과 시 추정
        </Note>
        <Note>레시피는 전부 검수 전 초안(reviewedAt: null)이다. RC-R09대로면 후보에 들어갈 수 없다 — 프로토타입 편차.</Note>
        <Note>"예시 기록 7건 넣기"는 기존 기록을 예시 7건으로 대체한다.</Note>
      </View>
    </ScrollView>
  );
}

function Head({ label, status, unsetFlag }: { label: string; status: string; unsetFlag: boolean }) {
  const { c, fontsLoaded, font } = useTheme();
  return (
    <>
      <Text style={[styles.label, { color: c.ink, fontFamily: ff(font.sansMedium, fontsLoaded) }]}>{label}</Text>
      <Text
        testID={`status-${label}`}
        style={[styles.status, { color: unsetFlag ? c.warn : c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}
      >
        {status}
      </Text>
    </>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  const { c, fontsLoaded, font } = useTheme();
  return (
    <Text style={[styles.note, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
      {children}
    </Text>
  );
}

function Choice(
  { testID, label, selected, onPress, role, half }:
  { testID: string; label: string; selected: boolean; onPress: () => void; role: 'radio' | 'checkbox'; half?: boolean }
) {
  const { c, fontsLoaded, font } = useTheme();
  return (
    <Pressable
      testID={testID}
      accessibilityRole={role}
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.choice, half ? styles.choiceHalf : null, { opacity: pressed ? 0.75 : 1 }]}
    >
      <View style={[
        styles.mark, role === 'radio' ? styles.markRound : null,
        { borderColor: selected ? c.accent : c.line, backgroundColor: selected ? c.accent : 'transparent' }
      ]} />
      <Text style={[styles.choiceLabel, { color: c.ink, fontFamily: ff(font.sansRegular, fontsLoaded) }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: 28 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  sub: { fontSize: 13, marginBottom: 14 },
  field: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  label: { fontSize: 15, fontWeight: '500' },
  status: { fontSize: 12, marginTop: 2 },
  radios: { marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 40, paddingRight: 10 },
  choiceHalf: { width: '50%' },
  choiceLabel: { fontSize: 14, flexShrink: 1 },
  mark: { width: 18, height: 18, borderWidth: 1.5, borderRadius: 4 },
  markRound: { borderRadius: 9 },
  note: { fontSize: 12, lineHeight: 18, marginTop: 10 },
  input: { marginTop: 10, minHeight: 48, borderWidth: 1, borderRadius: RADIUS.ctl, paddingHorizontal: 12, fontSize: 15 },
  rowBtns: { flexDirection: 'row', gap: 8, marginTop: 8 },
  devbox: { marginTop: 22 },
  stack: { gap: 8, marginTop: 4 }
});
