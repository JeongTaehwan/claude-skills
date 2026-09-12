// 끼니 v1 프로토타입 — 상태 박스 (로딩 / 실패 / 후보 0개 / 빈 값)
// requirements.md v1 미승인 초안 + open-questions.md 추천 답 기준 프로토타입. 정식 구현 아님.
// requirements.md v1 6.9절 상태 어휘 표 — 문구는 engine.ts의 COPY에서만 온다.
// DC-R07 후보 0개면 어떤 조건이 몇 개를 걸렀는지 숫자로 보여준다 (DC-OQ-05 추천: 제약을 풀지 않는다).

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BlockedBy, SETTINGS } from '../engine';
import { RADIUS, ff, useTheme } from '../theme';
import { Btn } from './Btn';

interface Props {
  testID: string;
  title: string;
  sub?: string;
  blockedBy?: BlockedBy;
  action?: { label: string; onPress: () => void; testID: string };
  center?: boolean;
}

export function StateBox({ testID, title, sub, blockedBy, action, center }: Props) {
  const { c, fontsLoaded, font } = useTheme();

  // 필터가 실제로 세는 항목만 보여준다 (architecture 5.1의 blockedBy 키와 1:1)
  const rows: [string, number][] = blockedBy
    ? [
        ['갈래에 안 맞음', blockedBy.branch],
        ['못 먹는 것에 걸림', blockedBy.absolute],
        [`${SETTINGS.servingsMax}인분을 넘음`, blockedBy.servings],
        ['방금 나온 것', blockedBy.recent]
      ]
    : [];

  return (
    <View style={center ? styles.center : undefined}>
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
          <Btn testID={action.testID} label={action.label} onPress={action.onPress} primary style={styles.action} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  box: { borderWidth: 1, borderRadius: RADIUS.card, paddingVertical: 26, paddingHorizontal: 18 },
  title: { fontSize: 24, fontWeight: '700' },
  sub: { fontSize: 13, lineHeight: 19, marginTop: 8 },
  list: { marginTop: 16 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', gap: 12,
    paddingVertical: 7, borderBottomWidth: StyleSheet.hairlineWidth
  },
  rowLabel: { fontSize: 14 },
  rowNum: { fontSize: 14, fontVariant: ['tabular-nums'] },
  action: { marginTop: 18 }
});
