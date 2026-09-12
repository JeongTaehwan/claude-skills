// 끼니 Expo 프로토타입 — 상태 박스 (로딩 / 실패 / 후보 0개 / 빈 값)
// requirements.md 6.6절 상태 어휘 표 / open-questions.md 추천 답 기준 — 정식 구현 아님.
// 문구는 engine.ts의 COPY에서만 온다 — "모든 화면이 같은 말을 쓴다"가 6.6의 요구다.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BlockedBy, COPY, SETTINGS } from '../engine';
import { RADIUS, ff, useTheme } from '../theme';
import { Btn } from './Btn';

interface Props {
  testID: string;
  title: string;
  sub?: string;
  blockedBy?: BlockedBy;            // DC-R07: 어떤 조건이 몇 개를 걸렀는지 숫자로 보여준다
  action?: { label: string; onPress: () => void; testID: string };
}

export function StateBox({ testID, title, sub, blockedBy, action }: Props) {
  const { c, fontsLoaded, font } = useTheme();

  /* review #6 — 실제 필터가 세는 4항목만 보여준다.
     ux/flows.md 와이어프레임의 "예산 초과"·"조리 불가"는 점수 가감이라 걸린 개수를 셀 수 없다. */
  const rows: [string, number][] = blockedBy
    ? [
        ['갈래에 안 맞음', blockedBy.branch],
        ['절대 제외에 걸림', blockedBy.absolute],
        ['오늘 거절함', blockedBy.todayReject],
        [`최근 ${SETTINGS.recentWindowDays}일 안에 먹음`, blockedBy.recent]
      ]
    : [];

  return (
    <View testID={testID} style={[styles.box, { backgroundColor: c.surface, borderColor: c.line }]}>
      <Text style={[styles.title, { color: c.ink, fontFamily: ff(font.serifBold, fontsLoaded) }]}>
        {title}
      </Text>
      {sub ? (
        <Text style={[styles.sub, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
          {sub}
        </Text>
      ) : null}

      {rows.length ? (
        <View testID="blocked-list" style={styles.list}>
          {rows.map(([label, n]) => (
            <View key={label} style={[styles.row, { borderBottomColor: c.line }]}>
              <Text style={[styles.rowLabel, { color: c.ink, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
                {label}
              </Text>
              <Text style={[styles.rowNum, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
                {n}개
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {action ? (
        <Btn
          testID={action.testID}
          label={action.label}
          onPress={action.onPress}
          primary
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

export { COPY };

const styles = StyleSheet.create({
  box: { borderWidth: 1, borderRadius: RADIUS.card, paddingVertical: 26, paddingHorizontal: 18 },
  title: { fontSize: 24, fontWeight: '700' },
  sub: { fontSize: 13, lineHeight: 19, marginTop: 8 },
  list: { marginTop: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  rowLabel: { fontSize: 14 },
  rowNum: { fontSize: 14, fontVariant: ['tabular-nums'] },
  action: { marginTop: 18 }
});
