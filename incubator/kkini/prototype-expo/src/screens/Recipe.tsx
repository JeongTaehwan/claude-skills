// 끼니 v1 프로토타입 — 레시피·조리법 (RC, MVP 핵심 산출물)
// requirements.md v1 미승인 초안 + open-questions.md 추천 답 기준 프로토타입. 정식 구현 아님.
//
// RC-R02 재료마다 수량·단위·단가·소계 네 가지를 쓴다.
// RC-R03 재료 수량은 사용자가 입력한 인분으로 환산된 값이다 (C10, IN-OQ-03 추천).
// RC-R04 재료비 합계는 소계의 합이며 같은 결정의 카드 금액과 반드시 같다.
// RC-R05 단가가 추정치인 재료는 "추정"으로 표시하고, 하나라도 추정이면 합계도 추정이다.
// RC-R06 조리 단계는 번호가 붙은 순서 목록이고 각 단계는 한 문장이다.
// RC-R07 조리 시간을 분 단위로 표시한다 (손질~완성 총시간, 대기는 별도 — RC-OQ-01 추천).
// RC-R08 본문은 우리가 직접 쓴 것만 싣는다 — 여기 실린 것은 사람 검수 전 초안이다 (배지 참조).
// RC-R10 집에 재료가 있는지는 검증하지 않는다. "없는 재료는 사야 해요"를 명시한다.
// 인분 변경 시 수량·금액이 다시 계산된다 (화면 안 스테퍼).

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  COPY, CostBreakdown, Decision, Recipe as RecipeType, SETTINGS,
  comma, money, moneyShort, overBudgetText
} from '../engine';
import { RADIUS, ff, useTheme } from '../theme';
import { Btn } from '../components/Btn';
import { Stepper } from '../components/Stepper';

interface Props {
  recipe: RecipeType;
  decision: Decision;
  cost: CostBreakdown;
  servings: number;
  budgetKrw: number | null;
  onChangeServings: (n: number) => void;
  onBack: () => void;
}

export function Recipe(p: Props) {
  const { c, fontsLoaded, font } = useTheme();
  const r = p.recipe;
  const waitMinutes = r.steps.reduce((a, s) => a + (s.wait ? (s.minutes || 0) : 0), 0);

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <View style={styles.head}>
        <Text style={[styles.title, { color: c.ink, fontFamily: ff(font.serifBold, fontsLoaded) }]}>
          {r.name}
        </Text>
        <View style={styles.chipRow}>
          <Text style={[styles.chip, { color: c.muted, borderColor: c.line, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
            {p.servings}인분
          </Text>
          {/* RC-R07 */}
          <Text
            testID="rc-cookminutes"
            style={[styles.chip, { color: c.muted, borderColor: c.line, fontFamily: ff(font.sansRegular, fontsLoaded) }]}
          >
            {r.cookMinutes}분
          </Text>
          {waitMinutes ? (
            <Text style={[styles.chip, { color: c.muted, borderColor: c.line, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
              {COPY.rcWait} {waitMinutes}분 포함
            </Text>
          ) : null}
          {/* RC-R09 편차 — 검수 전 초안임을 항상 밝힌다 */}
          {!p.decision.reviewed ? (
            <Text
              testID="rc-draft-badge"
              style={[styles.chip, { color: c.warn, borderColor: c.warn, fontFamily: ff(font.sansRegular, fontsLoaded) }]}
            >
              {COPY.dcDraftBadge}
            </Text>
          ) : null}
        </View>
        <Text style={[styles.draftNote, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
          이 레시피는 에이전트가 쓴 초안이고 사람 검수를 아직 받지 않았다. 그대로 조리하지 말고 확인하고 쓰라.
        </Text>
      </View>

      {/* 인분 변경 — 수량·금액이 다시 계산된다 (RC-R03) */}
      <View style={[styles.section, { borderTopColor: c.line }]}>
        <Text style={[styles.sectionTitle, { color: c.ink, fontFamily: ff(font.sansMedium, fontsLoaded) }]}>
          인분
        </Text>
        <Stepper
          value={p.servings}
          min={SETTINGS.servingsMin}
          max={r.servingsMax ?? SETTINGS.servingsMax}
          suffix="인분"
          testIDPrefix="rc-servings"
          onChange={p.onChangeServings}
        />
      </View>

      {/* 재료 표 (RC-R02) */}
      <View style={[styles.section, { borderTopColor: c.line }]}>
        <Text style={[styles.sectionTitle, { color: c.ink, fontFamily: ff(font.sansMedium, fontsLoaded) }]}>
          재료
        </Text>
        <View style={[styles.trHead, { borderBottomColor: c.line }]}>
          <Text style={[styles.thName, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>재료</Text>
          <Text style={[styles.thQty, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>수량</Text>
          <Text style={[styles.thSum, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>소계</Text>
        </View>
        {p.cost.lines.map((l) => (
          <View key={l.ingredientId} testID="rc-ing-row" style={[styles.tr, { borderBottomColor: c.line }]}>
            <View style={styles.tdName}>
              <Text style={[styles.name, { color: c.ink, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
                {l.name}
                {l.optional ? <Text style={{ color: c.muted }}>{' · ' + COPY.rcOptional}</Text> : null}
                {l.pantry ? <Text style={{ color: c.muted }}>{' · ' + COPY.rcPantry}</Text> : null}
              </Text>
              {/* RC-R02 단가 — 구매 단위 원문을 그대로 보여준다 */}
              <Text style={[styles.unitPrice, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
                {l.unitPriceText}
              </Text>
            </View>
            <Text style={[styles.tdQty, { color: c.ink, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
              {formatQty(l.qty)}{l.unit}
            </Text>
            <Text style={[styles.tdSum, { color: l.optional ? c.muted : c.ink, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
              {l.optional ? '—' : moneyShort(l.subtotalKrw, l.isEstimate)}
            </Text>
          </View>
        ))}

        {/* RC-R04 합계 = 카드 금액 */}
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: c.ink, fontFamily: ff(font.sansMedium, fontsLoaded) }]}>
            {COPY.rcTotal}
          </Text>
          <Text
            testID="rc-total"
            style={[styles.totalValue, { color: c.ink, fontFamily: ff(font.serifBold, fontsLoaded) }]}
          >
            {money(p.cost.totalKrw, p.cost.isEstimate)}
          </Text>
        </View>
        {p.budgetKrw !== null ? (
          <Text
            testID="rc-verdict"
            style={[
              styles.verdict,
              {
                color: p.cost.totalKrw <= p.budgetKrw ? c.good : c.warn,
                fontFamily: ff(font.sansMedium, fontsLoaded)
              }
            ]}
          >
            {p.cost.totalKrw <= p.budgetKrw
              ? `${COPY.dcWithin} (예산 ${comma(p.budgetKrw)}원)`
              : overBudgetText(p.budgetKrw)}
          </Text>
        ) : null}
        {p.cost.isEstimate ? (
          <Text style={[styles.note, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
            {COPY.dcEstimate}이 섞인 이유: {p.cost.estimateReasons.join(' · ')}. 단가 기준일은 카탈로그에 적혀 있다.
          </Text>
        ) : null}
        {/* RC-R10 */}
        <Text testID="rc-buy-note" style={[styles.note, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
          {COPY.rcBuyNote} 이 금액은 쓴 만큼만 계산한 값이라, 양념을 병째 사야 하면 실제 장보기 금액은 더 커진다.
        </Text>
      </View>

      {/* 조리 단계 (RC-R06) */}
      <View style={[styles.section, { borderTopColor: c.line }]}>
        <Text style={[styles.sectionTitle, { color: c.ink, fontFamily: ff(font.sansMedium, fontsLoaded) }]}>
          만드는 법
        </Text>
        {r.steps.map((s, i) => (
          <View key={i} testID="rc-step-row" style={styles.step}>
            <Text style={[styles.stepNo, { color: c.accent, fontFamily: ff(font.serifBold, fontsLoaded) }]}>
              {i + 1}
            </Text>
            <View style={styles.stepBody}>
              <Text style={[styles.stepText, { color: c.ink, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
                {s.text}
              </Text>
              {s.minutes ? (
                <Text style={[styles.stepMeta, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
                  {s.wait ? `${COPY.rcWait} ` : ''}{s.minutes}분
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>

      <Btn testID="rc-back" label={COPY.rcBack} onPress={p.onBack} style={styles.back} />
    </ScrollView>
  );
}

function formatQty(q: number): string {
  if (Math.abs(q - Math.round(q)) < 1e-9) return String(Math.round(q));
  return String(Math.round(q * 100) / 100);
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: 28 },
  head: { paddingTop: 4, paddingBottom: 14 },
  title: { fontSize: 28, fontWeight: '700' },
  chipRow: { flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  chip: {
    borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3,
    fontSize: 12, overflow: 'hidden'
  },
  draftNote: { fontSize: 12, lineHeight: 18, marginTop: 10 },
  section: { paddingTop: 16, paddingBottom: 6, borderTopWidth: StyleSheet.hairlineWidth },
  sectionTitle: { fontSize: 15, fontWeight: '500', marginBottom: 6 },
  trHead: { flexDirection: 'row', paddingBottom: 6, borderBottomWidth: StyleSheet.hairlineWidth, marginTop: 6 },
  thName: { flex: 1, fontSize: 11 },
  thQty: { width: 66, fontSize: 11, textAlign: 'right' },
  thSum: { width: 92, fontSize: 11, textAlign: 'right' },
  tr: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth },
  tdName: { flex: 1, paddingRight: 6 },
  name: { fontSize: 14 },
  unitPrice: { fontSize: 11, marginTop: 2, fontVariant: ['tabular-nums'] },
  tdQty: { width: 66, fontSize: 13, textAlign: 'right', fontVariant: ['tabular-nums'] },
  tdSum: { width: 92, fontSize: 13, textAlign: 'right', fontVariant: ['tabular-nums'] },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14 },
  totalLabel: { fontSize: 15 },
  totalValue: { fontSize: 20, fontVariant: ['tabular-nums'] },
  verdict: { fontSize: 13, marginTop: 4, textAlign: 'right' },
  note: { fontSize: 12, lineHeight: 18, marginTop: 10 },
  step: { flexDirection: 'row', gap: 12, paddingVertical: 9 },
  stepNo: { fontSize: 18, width: 20, textAlign: 'right' },
  stepBody: { flex: 1 },
  stepText: { fontSize: 14, lineHeight: 22 },
  stepMeta: { fontSize: 11, marginTop: 3 },
  back: { marginTop: 22 }
});
