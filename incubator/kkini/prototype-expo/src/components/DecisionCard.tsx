// 끼니 Expo 프로토타입 — 결정 카드 (DC)
// requirements.md 6.1절 / ux/flows.md 4절 와이어프레임 / open-questions.md 추천 답 기준 — 정식 구현 아님.
// DC-R01 음식을 1개만 보여준다. 2번째 후보를 같은 화면에 노출하지 않는다.
// DC-R02 음식명·갈래·이유 한 줄을 모두 포함한다. 셋 중 하나라도 없으면 카드를 띄우지 않는다.
// DC-R09 미확정은 "오늘 저녁 추천", 확정은 "오늘은 <음식>으로 정했다".
// RE-R01 거절 버튼은 정확히 1개. HI-R01 확인 버튼 1개. 확정이면 버튼 0개 (flows (c)).

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BRANCH_LABEL, COPY, SETTINGS, StoredDecision, ro } from '../engine';
import { RADIUS, ff, useTheme } from '../theme';
import { Btn } from './Btn';

interface Props {
  decision: StoredDecision;
  rejectCountToday: number;
  onReject: () => void;
  onAdopt: () => void;
}

export function DecisionCard({ decision: d, rejectCountToday, onReject, onAdopt }: Props) {
  const { c, fontsLoaded, font } = useTheme();
  const adopted = d.status === 'adopted';
  const limitReached = rejectCountToday >= SETTINGS.rejectLimitPerDay;

  return (
    <View
      testID="decision-card"
      style={[styles.card, { backgroundColor: c.surface, borderColor: c.line }]}
    >
      {/* DC-R09 — 두 상태의 문구는 같을 수 없다 */}
      <Text
        testID="dc-eyebrow"
        style={[styles.eyebrow, { color: c.muted, fontFamily: ff(font.sansMedium, fontsLoaded) }]}
      >
        {adopted ? `오늘은 ${d.foodName}${ro(d.foodName)} 정했다` : COPY.dcHeaderProposed}
      </Text>

      {/* DC-R02 ① 음식명 */}
      <Text
        testID="dc-food"
        style={[styles.foodname, { color: c.ink, fontFamily: ff(font.serifBold, fontsLoaded) }]}
      >
        {d.foodName}
      </Text>

      {/* DC-R02 ② 갈래 */}
      <View style={styles.chipRow}>
        <Text
          testID="dc-branch"
          style={[styles.chip, { color: c.muted, borderColor: c.line, fontFamily: ff(font.sansRegular, fontsLoaded) }]}
        >
          {BRANCH_LABEL[d.branch]}
        </Text>
      </View>

      {/* DC-R02 ③ 이유 한 줄 — 확정 뒤에도 남긴다 (flows 와이어프레임과 다름, README 3절) */}
      <Text
        testID="dc-reason"
        style={[styles.reason, { color: c.ink, fontFamily: ff(font.serifRegular, fontsLoaded) }]}
      >
        {d.reason}
      </Text>

      {/* review #1: 표본 부족일 때 맥락 규칙 문구는 두 번째 줄로 내린다 */}
      {d.reasonSecondary ? (
        <Text
          testID="dc-reason-2"
          style={[styles.reason2, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}
        >
          {d.reasonSecondary}
        </Text>
      ) : null}

      {/* review #3 / MO-R05: 해 먹기 갈래는 재료 보유를 검증하지 않는다 — 전제를 카드에 명시한다 */}
      {d.branch === 'home' ? (
        <Text
          testID="dc-premise"
          style={[styles.premise, { color: c.muted, borderTopColor: c.line, fontFamily: ff(font.sansRegular, fontsLoaded) }]}
        >
          {COPY.moPremiseHome}
        </Text>
      ) : null}

      {adopted ? (
        <Text
          testID="dc-decided-note"
          style={[styles.decidedNote, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}
        >
          {COPY.dcDecidedNote}
        </Text>
      ) : (
        <View style={styles.actions}>
          {limitReached ? (
            /* RE-R05 — 거절 버튼 자리가 상한 문구로 바뀐다 (flows 흐름 (d)) */
            <View
              testID="reject-limit-note"
              style={[styles.limitNote, { borderColor: c.line }]}
            >
              <Text
                style={[styles.limitText, { color: c.warn, fontFamily: ff(font.sansRegular, fontsLoaded) }]}
              >
                {COPY.reLimit}
              </Text>
            </View>
          ) : (
            <Btn testID="btn-reject" label={COPY.reReject} onPress={onReject} style={styles.half} />
          )}
          <Btn testID="btn-adopt" label={COPY.hiAdopt} onPress={onAdopt} primary style={styles.half} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: RADIUS.card,
    paddingTop: 22,
    paddingHorizontal: 18,
    paddingBottom: 18
  },
  eyebrow: { fontSize: 12, letterSpacing: 1.6, marginBottom: 10 },
  foodname: { fontSize: 38, lineHeight: 45, fontWeight: '700', marginBottom: 10 },
  chipRow: { flexDirection: 'row' },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 3,
    fontSize: 13,
    overflow: 'hidden'
  },
  reason: { fontSize: 16, lineHeight: 24, marginTop: 14 },
  reason2: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  premise: { fontSize: 12, marginTop: 12, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
  decidedNote: { fontSize: 13, lineHeight: 19, marginTop: 18 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 18 },
  half: { flex: 1 },
  limitNote: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: RADIUS.ctl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  limitText: { fontSize: 12, textAlign: 'center' }
});
