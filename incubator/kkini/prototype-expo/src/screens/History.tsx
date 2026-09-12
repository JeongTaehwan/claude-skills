// 끼니 Expo 프로토타입 — 먹은 기록 화면 (HI)
// requirements.md 6.5절 / ux/flows.md 3절 "HI — 먹은 기록" / open-questions.md 추천 답 기준.
// requirements.md 미승인 초안(2026-09-12) 전제 — 정식 구현 아님.
//
// HI-R03 날짜·음식·갈래·확인 여부 네 가지를 보여준다. 확인 여부를 감추지 않는다.
// HI-R04 기록이 0건일 때는 "아직 기록이 없다" — "0회 먹음"으로 쓰지 않는다.
// HI-R06 기록은 개별 삭제할 수 있다. 삭제하면 반복 회피 계산에서도 즉시 빠진다.
// HI-R07 확인 기한은 결정 생성 후 다음 날 정오까지다.
// HI-OQ-03 추천 — 그 확인 버튼은 결정 카드가 아니라 이 화면에 있다.

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BRANCH_LABEL, COPY, KkiniState, MealLog, iso } from '../engine';
import { ff, useTheme } from '../theme';
import { Btn } from '../components/Btn';
import { StateBox } from '../components/StateBox';

interface Props {
  state: KkiniState;
  mutate: (fn: (s: KkiniState) => void) => void;
}

export function History({ state, mutate }: Props) {
  const { c, fontsLoaded, font } = useTheme();

  const logs = state.mealLogs.slice().sort((a, b) =>
    a.kkiniDate < b.kkiniDate ? 1
      : a.kkiniDate > b.kkiniDate ? -1
        : new Date(b.adoptedAt).getTime() - new Date(a.adoptedAt).getTime()
  );

  function confirmLog(m: MealLog) {
    mutate((s) => {
      const t = s.mealLogs.find((x) => x.id === m.id);
      if (!t) return;
      t.confirm.state = 'confirmed';
      t.confirm.at = iso(new Date());
    });
  }
  function deleteLog(m: MealLog) {
    // tombstone 없이 하드 삭제 — "즉시 반복 회피에서 빠진다"가 요구사항이다 (HI-R06)
    mutate((s) => { s.mealLogs = s.mealLogs.filter((x) => x.id !== m.id); });
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: c.ink, fontFamily: ff(font.serifBold, fontsLoaded) }]}>
        먹은 기록
      </Text>
      <Text style={[styles.sub, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
        날짜 · 음식 · 갈래 · 확인 여부
      </Text>

      <View testID="history-live" accessibilityLiveRegion="polite">
        {!logs.length ? (
          <StateBox testID="history-empty" title={COPY.hiEmpty} sub={COPY.hiEmptySub} />
        ) : (
          <View testID="history-list">
            {logs.map((m) => {
              const p = m.kkiniDate.split('-');
              const confirmed = m.confirm.state === 'confirmed';
              const canConfirm =
                m.confirm.state === 'unconfirmed' &&
                Date.now() <= new Date(m.confirmDeadline).getTime();
              return (
                <View
                  key={m.id}
                  testID="log-row"
                  style={[styles.row, { borderBottomColor: c.line }]}
                >
                  <View style={styles.rowMain}>
                    <View style={styles.rowTop}>
                      {/* HI-R03 ① 날짜 */}
                      <Text style={[styles.date, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
                        {+p[1]}/{+p[2]}
                      </Text>
                      {/* HI-R03 ② 음식 */}
                      <Text style={[styles.name, { color: c.ink, fontFamily: ff(font.serifRegular, fontsLoaded) }]}>
                        {m.foodName}
                      </Text>
                    </View>
                    <View style={styles.rowMeta}>
                      {/* HI-R03 ③ 갈래 */}
                      <Text style={[styles.meta, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
                        {BRANCH_LABEL[m.branch]}
                      </Text>
                      {/* HI-R03 ④ 확인 여부 — "확인 안 됨"은 "안 먹음"이 아니다 (HI-R02 / 6.6) */}
                      <Text
                        testID={confirmed ? 'log-confirmed' : 'log-unconfirmed'}
                        style={[styles.meta, { color: confirmed ? c.good : c.warn, fontFamily: ff(font.sansRegular, fontsLoaded) }]}
                      >
                        {confirmed ? COPY.hiConfirmed : COPY.hiUnconfirmed}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.rowActs}>
                    {canConfirm ? (
                      <Btn
                        testID="log-confirm-btn"
                        label={COPY.hiAdopt}
                        onPress={() => confirmLog(m)}
                        small
                      />
                    ) : null}
                    <Btn testID="log-delete-btn" label="삭제" onPress={() => deleteLog(m)} small />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <Text style={[styles.note, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
        확인 기한은 결정 다음 날 정오까지다. 기한이 지난 건은 "{COPY.hiUnconfirmed}"으로 굳는다 — "안 먹음"이 아니다.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: 24 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  sub: { fontSize: 13, marginBottom: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  rowMain: { flex: 1, gap: 4 },
  rowTop: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  rowMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  date: { fontSize: 13, minWidth: 38, fontVariant: ['tabular-nums'] },
  name: { fontSize: 17, flexShrink: 1 },
  meta: { fontSize: 12 },
  rowActs: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  note: { fontSize: 12, lineHeight: 18, marginTop: 14 }
});
