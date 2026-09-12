// 끼니 v1 프로토타입 — 먹은 기록 (HI)
// requirements.md v1 미승인 초안 + open-questions.md 추천 답 기준 프로토타입. 정식 구현 아님.
//
// HI-R02 확인하지 않은 결정은 "확인 안 됨"으로 표시한다 — "안 먹음"이 아니다.
// HI-R03 날짜·음식·갈래·인분·금액·확인 여부를 보여준다. 확인 여부를 감추지 않는다.
// HI-R04 0건이면 "아직 기록이 없다". "0회 먹음"으로 쓰지 않는다.
// HI-R06 개별 삭제할 수 있고, 삭제하면 반복 회피 계산에서 즉시 빠진다.
// HI-R07 확인 기한은 결정 생성 후 다음 날 정오까지다 (HI-OQ-03 UX 가정: 목록 행에도 확인 버튼).

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BRANCH_LABEL, COPY, KkiniState, MealLog, iso, money } from '../engine';
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
    a.dateKey < b.dateKey ? 1
      : a.dateKey > b.dateKey ? -1
        : Date.parse(b.confirmDeadline) - Date.parse(a.confirmDeadline)
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
        날짜 · 음식 · 갈래 · 인분 · 금액 · 확인 여부
      </Text>

      <View testID="history-live" accessibilityLiveRegion="polite">
        {!logs.length ? (
          <StateBox
            testID="history-empty"
            title={COPY.hiEmpty}
            sub={`카드에서 "${COPY.hiConfirm}"를 누르면 여기에 쌓인다`}
          />
        ) : (
          <View testID="history-list">
            {logs.map((m) => {
              const p = m.dateKey.split('-');
              const confirmed = m.confirm.state === 'confirmed';
              const canConfirm = m.confirm.state === 'unconfirmed' &&
                Date.now() <= Date.parse(m.confirmDeadline);
              return (
                <View key={m.id} testID="log-row" style={[styles.row, { borderBottomColor: c.line }]}>
                  <View style={styles.main}>
                    <View style={styles.top}>
                      <Text style={[styles.date, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
                        {+p[1]}/{+p[2]}
                      </Text>
                      <Text style={[styles.name, { color: c.ink, fontFamily: ff(font.serifRegular, fontsLoaded) }]}>
                        {m.name}
                      </Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={[styles.meta, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
                        {BRANCH_LABEL[m.branch]}
                      </Text>
                      <Text style={[styles.meta, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
                        {m.servings}인분
                      </Text>
                      <Text style={[styles.meta, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
                        {m.costKrw !== null ? money(m.costKrw, m.isEstimate) : '금액 없음'}
                      </Text>
                      <Text
                        testID={confirmed ? 'log-confirmed' : 'log-unconfirmed'}
                        style={[styles.meta, { color: confirmed ? c.good : c.warn, fontFamily: ff(font.sansRegular, fontsLoaded) }]}
                      >
                        {confirmed ? COPY.hiConfirmed : COPY.hiUnconfirmed}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.acts}>
                    {canConfirm ? (
                      <Btn testID="log-confirm-btn" label={COPY.hiConfirm} onPress={() => confirmLog(m)} small />
                    ) : null}
                    <Btn testID="log-delete-btn" label={COPY.hiDelete} onPress={() => deleteLog(m)} small />
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
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth
  },
  main: { flex: 1, gap: 4 },
  top: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  date: { fontSize: 13, minWidth: 38, fontVariant: ['tabular-nums'] },
  name: { fontSize: 17, flexShrink: 1 },
  meta: { fontSize: 12, fontVariant: ['tabular-nums'] },
  acts: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  note: { fontSize: 12, lineHeight: 18, marginTop: 14 }
});
