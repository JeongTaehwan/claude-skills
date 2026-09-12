// 끼니 Expo 프로토타입 — 오늘 화면 (DC + MO + RE)
// requirements.md 6.1~6.3절 / ux/flows.md 2절 흐름 (a)(b)(c)(d) / open-questions.md 추천 답 기준.
// requirements.md 미승인 초안(2026-09-12) 전제 — 정식 구현 아님.
//
// DC-R04 앱을 연 뒤 결정 카드까지 필요한 사용자 입력은 0회다.
// DC-R05 계산 중에는 "고르는 중"을 쓰고 직전에 보던 결정을 남겨두지 않는다.
// DC-R10 프로필도 기록도 전부 비어 있어도 결정 카드는 나온다.
// DC-R11 결정 카드가 화면에 나타난 시각을 기록한다.
// MO-R04 갈래를 바꾸면 오늘의 결정은 다시 계산된다. 바뀐 갈래는 그날 안에서 유지된다.

import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CATALOG } from '../catalog';
import {
  BlockedBy, Branch, COPY, KkiniState, RejectionReason, StoredDecision,
  currentBranch, adoptedToday, decide, iso, kkiniDate, makeMealLog, makeRejection,
  rejectionsToday, savedDecision, todayKey
} from '../engine';
import { RADIUS, ff, useTheme } from '../theme';
import { BranchSegment } from '../components/BranchSegment';
import { DecisionCard } from '../components/DecisionCard';
import { RejectSheet } from '../components/RejectSheet';
import { StateBox } from '../components/StateBox';

type TodayView =
  | { kind: 'loading' }
  | { kind: 'decision'; decision: StoredDecision }
  | { kind: 'empty'; blockedBy: BlockedBy }
  | { kind: 'error' };

interface Props {
  state: KkiniState;
  mutate: (fn: (s: KkiniState) => void) => void;
  storageOk: boolean;
  onGoSettings: () => void;
}

export function Today({ state, mutate, storageOk, onGoSettings }: Props) {
  const { c, fontsLoaded, font } = useTheme();
  const [view, setView] = useState<TodayView>({ kind: 'loading' });
  const [sheetOpen, setSheetOpen] = useState(false);

  const day = todayKey();
  const branch = currentBranch(state, day);
  const saved = savedDecision(state, day, branch);
  const rejectCount = rejectionsToday(state, day).length;

  // 재계산 트리거 — architecture 4.4-3: 갈래 변경(MO-R04)과 거절(RE-R02)뿐이다.
  // 프로필을 바꿔도 이미 저장된 오늘 결정은 그대로 둔다 (PR-R04).
  const trigger = [
    branch, String(state.devFailMode), String(rejectCount),
    saved ? saved.id : 'none', saved ? saved.status : '-'
  ].join('|');

  useEffect(() => {
    if (state.devFailMode) { setView({ kind: 'error' }); return; }   // 개발용: 실패 상태 미리보기

    const now = new Date();
    const existing = savedDecision(state, kkiniDate(now), branch);
    if (existing) {
      // 0단계 (C1, DC-OQ-03 추천) — 다시 열어도 같은 카드. 계산 자체를 하지 않는다
      setView({ kind: 'decision', decision: existing });
      if (!existing.shownAt) {
        // DC-R11 — 노출 시각 기록 (지표 S1의 시작점)
        mutate((s) => {
          const d = savedDecision(s, kkiniDate(new Date()), branch);
          if (d && !d.shownAt) d.shownAt = iso(new Date());
        });
      }
      return;
    }

    setView({ kind: 'loading' });   // DC-R05: 직전 카드를 남기지 않는다
    let cancelled = false;
    const t = setTimeout(() => {
      if (cancelled) return;
      let res;
      try {
        res = decide(CATALOG, state, branch, new Date());
      } catch (e) {
        setView({ kind: 'error' });   // DC-R06: 임의의 음식을 대신 내놓지 않는다
        return;
      }
      if (res.kind === 'empty') { setView({ kind: 'empty', blockedBy: res.blockedBy }); return; }
      if (res.kind === 'error') { setView({ kind: 'error' }); return; }
      const decided = res.decision;
      if (res.isNew) {
        decided.shownAt = iso(new Date());   // DC-R11
        mutate((s) => { s.decisions.push(decided); });
      }
      setView({ kind: 'decision', decision: decided });
    }, 220);
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  /* MO-R04 — 갈래 변경. 바뀐 갈래는 그날 안에서 유지된다 */
  function changeBranch(b: Branch) {
    if (b === branch || b === 'delivery') return;   // MO-R03: 배달은 아직 없음
    mutate((s) => { s.branchByDate[todayKey()] = b; });
  }

  /* RE-R02/R03/R06 — 거절하면 즉시 새 결정, 방금 거절한 음식은 같은 날 다시 나오지 않는다 */
  function reject(reason: RejectionReason | null) {
    setSheetOpen(false);
    mutate((s) => {
      const d = savedDecision(s, todayKey(), currentBranch(s));
      if (!d || d.status !== 'proposed') return;
      d.status = 'rejected';
      s.rejections.push(makeRejection(d, reason, new Date()));
    });
  }

  /* HI-R01 / DC-R09 — 채택. 기록은 미확인 상태로 시작한다 (HI-R02) */
  function adopt() {
    mutate((s) => {
      const d = savedDecision(s, todayKey(), currentBranch(s));
      if (!d || d.status !== 'proposed') return;
      d.status = 'adopted';
      s.mealLogs.push(makeMealLog(d, new Date()));
    });
  }

  const showColdHint = state.profile.absoluteExclusions.status === 'unset';   // PR-OQ-02 추천

  return (
    <View style={styles.wrap}>
      <BranchSegment current={branch} locked={!!adoptedToday(state, day)} onChange={changeBranch} />

      {!storageOk ? (
        <Text
          testID="storage-warn"
          style={[styles.storageWarn, { color: c.warn, borderColor: c.line, fontFamily: ff(font.sansRegular, fontsLoaded) }]}
        >
          {COPY.storageFail}
        </Text>
      ) : null}

      {/* 상태 문구 영역 — 화면이 바뀌면 읽어 준다 */}
      <View testID="today-live" accessibilityLiveRegion="polite">
        {view.kind === 'loading' ? (
          <StateBox testID="state-loading" title={COPY.dcLoading} sub={COPY.dcLoadingSub} />
        ) : null}

        {view.kind === 'error' ? (
          <StateBox
            testID="state-error"
            title={COPY.dcError}
            sub={COPY.dcErrorSub}
            action={{
              label: COPY.dcErrorRetry,   // DC-OQ-04 추천: 자동 재시도는 하지 않는다
              testID: 'btn-retry',
              onPress: () => mutate((s) => { s.devFailMode = false; })
            }}
          />
        ) : null}

        {view.kind === 'empty' ? (
          <StateBox
            testID="state-empty"
            title={COPY.dcEmpty}
            sub={COPY.dcEmptySub}
            blockedBy={view.blockedBy}
            action={{ label: COPY.dcEmptyLink, testID: 'btn-fix-conditions', onPress: onGoSettings }}
          />
        ) : null}

        {view.kind === 'decision' ? (
          <DecisionCard
            decision={view.decision}
            rejectCountToday={rejectCount}
            onReject={() => setSheetOpen(true)}
            onAdopt={adopt}
          />
        ) : null}
      </View>

      {showColdHint ? (
        <Pressable testID="btn-cold-hint" onPress={onGoSettings} style={styles.hint}>
          <Text style={[styles.hintText, { color: c.accent, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
            {COPY.coldHint}
          </Text>
        </Pressable>
      ) : null}

      <RejectSheet visible={sheetOpen} onPick={reject} onClose={() => setSheetOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  storageWarn: {
    fontSize: 12,
    lineHeight: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: RADIUS.ctl,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12
  },
  hint: { minHeight: 44, justifyContent: 'center', marginTop: 10 },
  hintText: { fontSize: 13, textDecorationLine: 'underline' }
});
