// 끼니 v1 프로토타입 — 결정 카드 + 가운데 등장 애니메이션 (DC · MO)
// requirements.md v1 미승인 초안 + open-questions.md 추천 답 기준 프로토타입. 정식 구현 아님.
//
// DC-R01 음식을 1개만 보여준다. 2번째 후보를 같은 화면에 노출하지 않는다.
// DC-R02 음식명·갈래·이유 한 줄·인분·금액을 모두 포함한다. 하나라도 없으면 카드를 띄우지 않는다.
// DC-R04 카드는 화면 중앙에 등장 애니메이션과 함께 나타나고, 끝나기 전에는 어떤 버튼도 눌리지 않는다.
// DC-R08 예산 판정("예산 안" / "예산 <금액> 초과") — 초과여도 카드를 내놓는다.
// DC-R09 금액에 추정 단가가 섞이면 "추정"을 표시한다.
// DC-R10 해 먹기 카드에는 레시피로 가는 경로가 정확히 1개 있다.
// MO-R04·R06·R07·R09 시켜 먹기는 예상 가격대 + 배달앱 버튼 + 매장 필터 안내로 끝난다.
//
// 애니메이션은 ux/flows.md 3절 명세를 옮긴 것이다.
//   0 로딩(호출자가 그린다) → 1 슬롯 사이클링 → 2 스프링 착지 → 3 디테일 페이드인
//   1단계 교체 간격 60→70→90→120→160ms, 2단계 220ms, 3단계 120ms(2단계와 50ms 겹침)
//   reduce-motion이면 1·3단계를 생략하고 150ms 페이드만 한다.
//   ux 3절의 "1단계 360ms"·"상한 700ms"는 같은 절의 간격 목록과 산술이 맞지 않는다 → README 편차·미정 참조.

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import {
  ANIM, BRANCH_LABEL, COPY, Decision, comma, money, overBudgetText, priceRange
} from '../engine';
import { RADIUS, ff, useTheme } from '../theme';
import { Btn } from './Btn';

interface Props {
  decision: Decision;
  budgetKrw: number | null;      // 초과 문구에 쓸 입력 예산 (없으면 판정 문구를 쓰지 않는다, IN-R10)
  confirmed: boolean;            // 이미 "이걸로 먹었다"를 눌렀는가
  reduceMotion: boolean;
  slotNames: string[];           // 슬롯 사이클링에 쓸 다른 후보 이름들
  onRoll: () => void;            // RE-R01 다시 돌리기
  onConfirm: () => void;         // HI-R01 이걸로 먹었다
  onRecipe: () => void;          // DC-R10 레시피 보기 (해 먹기만)
  onOpenDeliveryApp: () => void; // MO-R04 배달앱에서 찾기 (시켜 먹기만)
  addressKnown: boolean;
}

type Phase = 'cycle' | 'land' | 'done';

export function DecisionCard(p: Props) {
  const { c, fontsLoaded, font } = useTheme();
  const d = p.decision;

  const [phase, setPhase] = useState<Phase>(p.reduceMotion ? 'land' : 'cycle');
  const [slot, setSlot] = useState<string>(
    p.reduceMotion ? d.name : (p.slotNames.length ? p.slotNames[0] : d.name)
  );

  const surface = useRef(new Animated.Value(0)).current;   // 카드 배경 opacity
  const scale = useRef(new Animated.Value(p.reduceMotion ? 1 : 0.92)).current;
  const detail = useRef(new Animated.Value(0)).current;     // 디테일 opacity
  const detailY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const land = () => {
      if (cancelled) return;
      setSlot(d.name);
      setPhase('land');
      // 2단계 착지 — scale 0.92 → 1.04 → 1.00, opacity 0 → 1 (오버슈트, "딱"의 순간)
      Animated.parallel([
        Animated.timing(surface, { toValue: 1, duration: 130, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.04, duration: 130, easing: Easing.out(Easing.quad), useNativeDriver: true
          }),
          Animated.timing(scale, {
            toValue: 1.0, duration: ANIM.landingMs - 130, easing: Easing.inOut(Easing.quad), useNativeDriver: true
          })
        ])
      ]).start();
      // 3단계 — 2단계 끝나기 50ms 전에 시작한다
      timers.push(setTimeout(() => {
        if (cancelled) return;
        Animated.parallel([
          Animated.timing(detail, { toValue: 1, duration: ANIM.detailMs, useNativeDriver: true }),
          Animated.timing(detailY, { toValue: 0, duration: ANIM.detailMs, useNativeDriver: true })
        ]).start(() => { if (!cancelled) setPhase('done'); });
      }, Math.max(0, ANIM.landingMs - ANIM.detailOverlapMs)));
    };

    if (p.reduceMotion) {
      // reduce-motion 대체: 1단계 생략, 스케일 없이 150ms 페이드, 3단계 생략(동시 등장)
      scale.setValue(1);
      detailY.setValue(0);
      Animated.parallel([
        Animated.timing(surface, { toValue: 1, duration: ANIM.reducedMs, useNativeDriver: true }),
        Animated.timing(detail, { toValue: 1, duration: ANIM.reducedMs, useNativeDriver: true })
      ]).start(() => { if (!cancelled) setPhase('done'); });
      return () => { cancelled = true; };
    }

    // 1단계 슬롯 사이클링 — 금액·이유줄·버튼은 아직 안 보인다
    let i = 0;
    const step = () => {
      if (cancelled) return;
      if (i >= ANIM.cycleIntervals.length) { land(); return; }
      const names = p.slotNames.length ? p.slotNames : [d.name];
      setSlot(names[i % names.length]);
      const wait = ANIM.cycleIntervals[i];
      i += 1;
      timers.push(setTimeout(step, wait));
    };
    step();

    return () => { cancelled = true; timers.forEach(clearTimeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const locked = phase !== 'done';           // ux 3절: 1단계 시작부터 3단계 끝까지 버튼 비활성
  const isHome = d.branch === 'home';

  // 금액 줄 — ux/flows.md 5절 와이어프레임: "2인분 · 8,200원 · 예산 안"
  const amountText = isHome
    ? (d.costKrw !== null ? money(d.costKrw, d.isEstimate) : '')
    : (d.priceRangeKrw ? priceRange(d.priceRangeKrw[0], d.priceRangeKrw[1]) : '');
  const metaParts = [`${d.servings}인분`, amountText];
  if (isHome && d.cookMinutes) metaParts.push(`${d.cookMinutes}분`);
  if (d.budgetVerdict === 'within') metaParts.push(COPY.dcWithin);

  return (
    <View style={styles.centerWrap}>
      <Animated.View style={[styles.cardOuter, { transform: [{ scale }] }]}>
        {/* 카드 배경 — 1단계에서는 보이지 않고 2단계 착지에서 함께 떠오른다 */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            styles.surface,
            { backgroundColor: c.surface, borderColor: c.line, opacity: surface }
          ]}
        />
        <View style={styles.cardInner}>
          {/* DC-R02 ① 음식명 — 1단계에서 이 텍스트만 빠르게 바뀐다 */}
          <Text
            testID="dc-food"
            style={[styles.foodname, { color: c.ink, fontFamily: ff(font.serifBold, fontsLoaded) }]}
            numberOfLines={2}
          >
            {slot}
          </Text>

          <Animated.View style={{ opacity: detail, transform: [{ translateY: detailY }] }}>
            {/* DC-R02 ② 갈래 */}
            <View style={styles.chipRow}>
              <Text
                testID="dc-branch"
                style={[styles.chip, { color: c.muted, borderColor: c.line, fontFamily: ff(font.sansRegular, fontsLoaded) }]}
              >
                {BRANCH_LABEL[d.branch]}
              </Text>
              {/* RC-R09 편차 — 검수 전 초안은 항상 이 배지를 띄운다 */}
              {!d.reviewed ? (
                <Text
                  testID="dc-draft-badge"
                  style={[styles.chip, { color: c.warn, borderColor: c.warn, fontFamily: ff(font.sansRegular, fontsLoaded) }]}
                >
                  {COPY.dcDraftBadge}
                </Text>
              ) : null}
            </View>

            {/* DC-R02 ③ 이유 한 줄 */}
            <Text
              testID="dc-reason"
              style={[styles.reason, { color: c.ink, fontFamily: ff(font.serifRegular, fontsLoaded) }]}
            >
              “{d.reason}”
            </Text>
            {/* DC-R11 표본 부족 보조 줄 (architecture 5.4: 이유 줄이 아니라 보조 줄) */}
            {d.subNote ? (
              <Text
                testID="dc-subnote"
                style={[styles.subNote, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}
              >
                {d.subNote}
              </Text>
            ) : null}

            {/* DC-R02 ④⑤ 인분 · 금액 (+ 예산 안 / 조리 시간) */}
            <Text
              testID="dc-meta"
              style={[styles.meta, { color: c.ink, fontFamily: ff(font.sansMedium, fontsLoaded) }]}
            >
              {metaParts.filter(Boolean).join(' · ')}
            </Text>
            {!isHome ? (
              <Text
                testID="dc-price-label"
                style={[styles.small, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}
              >
                {COPY.moPriceLabel} · 실제 결제 금액과 다를 수 있어요
              </Text>
            ) : null}
            {/* DC-R08 예산 초과 — 카드를 막지 않고 한 줄 더 붙인다 */}
            {d.budgetVerdict === 'over' && p.budgetKrw !== null ? (
              <Text
                testID="dc-over-budget"
                style={[styles.over, { color: c.warn, fontFamily: ff(font.sansMedium, fontsLoaded) }]}
              >
                {overBudgetText(p.budgetKrw)}
              </Text>
            ) : null}

            {/* MO-R07·R09 · 6.9 주소 없음 / 매장 필터 없음 */}
            {!isHome ? (
              <View style={[styles.noteBox, { borderColor: c.line }]}>
                <Text
                  testID="mo-no-filter"
                  style={[styles.small, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}
                >
                  {p.addressKnown ? COPY.moNoFilter : COPY.inAddressNone}
                </Text>
                <Text style={[styles.small, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
                  {COPY.moNoRecipe}
                </Text>
              </View>
            ) : null}

            {p.confirmed ? (
              <Text
                testID="dc-confirmed-note"
                style={[styles.small, { color: c.good, marginTop: 14, fontFamily: ff(font.sansMedium, fontsLoaded) }]}
              >
                기록에 남겼다 — 기록 탭에서 확인할 수 있다
              </Text>
            ) : null}

            {/* 버튼: 다시 돌리기 + (레시피 보기 | 배달앱에서 찾기) + 이걸로 먹었다 = 3개 */}
            <View style={styles.actions}>
              <Btn testID="btn-roll" label={COPY.reRoll} onPress={p.onRoll} disabled={locked} style={styles.flex} />
              {isHome ? (
                <Btn testID="btn-recipe" label={COPY.dcRecipe} onPress={p.onRecipe} disabled={locked} style={styles.flex} />
              ) : (
                <Btn testID="btn-delivery-app" label={COPY.moOpenApp} onPress={p.onOpenDeliveryApp} disabled={locked} style={styles.flex} />
              )}
            </View>
            <Btn
              testID="btn-confirm"
              label={COPY.hiConfirm}
              onPress={p.onConfirm}
              primary
              disabled={locked || p.confirmed}
              style={styles.wide}
            />
          </Animated.View>
        </View>
      </Animated.View>
      {/* 스모크 테스트·접근성용 — 3단계가 끝난 시점에만 존재한다 */}
      {phase === 'done' ? <View testID="dc-ready" style={styles.hidden} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centerWrap: { flex: 1, justifyContent: 'center' },     // DC-R04: 화면 중앙
  cardOuter: { borderRadius: RADIUS.card },
  surface: { borderRadius: RADIUS.card, borderWidth: 1 },
  cardInner: { paddingVertical: 22, paddingHorizontal: 18 },
  foodname: { fontSize: 38, lineHeight: 46, fontWeight: '700', textAlign: 'center' },
  chipRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12, flexWrap: 'wrap' },
  chip: {
    borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3,
    fontSize: 12, overflow: 'hidden'
  },
  reason: { fontSize: 16, lineHeight: 24, marginTop: 16, textAlign: 'center' },
  subNote: { fontSize: 12, marginTop: 6, textAlign: 'center' },
  meta: { fontSize: 15, marginTop: 14, textAlign: 'center', fontVariant: ['tabular-nums'] },
  small: { fontSize: 12, lineHeight: 18, textAlign: 'center' },
  over: { fontSize: 13, marginTop: 6, textAlign: 'center' },
  noteBox: {
    marginTop: 12, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, gap: 2
  },
  actions: { flexDirection: 'row', gap: 8, marginTop: 20 },
  flex: { flex: 1 },
  wide: { marginTop: 8 },
  hidden: { width: 0, height: 0 }
});
