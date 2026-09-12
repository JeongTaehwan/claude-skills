// 끼니 v1 프로토타입 — 입력 화면 (IN)
// requirements.md v1 미승인 초안 + open-questions.md 추천 답 기준 프로토타입. 정식 구현 아님.
//
// IN-R01 갈래·예산·인분 세 값을 알기 전에는 카드를 계산하지 않는다.
// IN-R02 갈래는 사용자가 고른다 (KK-OQ-01 추천).
// IN-R03 집주소는 시켜 먹기를 고른 경우에만 묻는다.
// IN-R04 예산은 금액 하나(원)로 받고, 해 먹기는 그 금액이 재료비 기준임을 문구로 쓴다.
// IN-R05 인분은 1 이상의 정수 (기본 2, 상한 6 — IN-OQ-03 추천).
// IN-R06 한 화면에서 끝난다. 화면 수는 1개다.
// IN-R07·R08 예산·인분·주소는 마지막 값이 채워져 있고 "지난번 값"으로 표시된다. 갈래는 매번 고른다.
// IN-R09 값이 없으면 "제한 없음"이 아니라 "아직 입력 안 함"으로 쓴다.
// IN-R12 집주소는 시켜 먹기에서 **필수 입력**이다 (사람 2차 진술: "시켜먹는 건 집주소 입력 필요").
//        비어 있으면 "돌리기"를 비활성화하고 6.9의 "주소를 아직 몰라요"를 쓴다.
//        주소가 있어도 매장 필터는 동작하지 않는다 (MO-R07) — 그 사실은 카드가 쓴다.
// IN-R13·R14 주소는 기기 로컬에만, 동·읍·면 단위까지 (IN-OQ-01 추천).
// 순서는 갈래 → 인분 → 예산 → 주소 (IN-OQ-02 추천).

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  Answered, BUDGET_CHOICES, Branch, COPY, SETTINGS, comma, declared, unset
} from '../engine';
import { RADIUS, ff, useTheme } from '../theme';
import { Btn } from '../components/Btn';
import { BranchSegment } from '../components/BranchSegment';
import { Stepper } from '../components/Stepper';

interface Props {
  branch: Branch;
  servings: number;
  budget: Answered<number>;
  address: Answered<string>;
  hadSavedValues: boolean;          // 지난번 값이 실제로 저장돼 있었는가 (IN-R08)
  onChangeBranch: (b: Branch) => void;
  onChangeServings: (n: number) => void;
  onChangeBudget: (b: Answered<number>) => void;
  onChangeAddress: (a: Answered<string>) => void;
  onSubmit: () => void;
}

export function Input(p: Props) {
  const { c, fontsLoaded, font } = useTheme();
  const [addrDraft, setAddrDraft] = useState<string>(
    p.address.status === 'declared' ? p.address.value : ''
  );

  const isDelivery = p.branch === 'delivery';
  const addressKnown = p.address.status === 'declared' && !!p.address.value.trim();
  // IN-R01 — 갈래·예산·인분 세 값이 다 있어야 계산이 시작된다.
  // IN-R12 — 시켜 먹기면 집주소까지 있어야 한다. 건너뛸 수 없다.
  const budgetReady = p.budget.status === 'declared';
  const ready = budgetReady && p.servings >= SETTINGS.servingsMin && (!isDelivery || addressKnown);
  const missing = !budgetReady ? '예산을 고르면 돌릴 수 있어요'
    : isDelivery && !addressKnown ? COPY.inAddressNone + ' — 시켜 먹기는 집주소가 있어야 돌릴 수 있어요'
      : '';

  const lastTag = p.hadSavedValues ? ' ' + COPY.inLastValue : '';

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: c.ink, fontFamily: ff(font.serifBold, fontsLoaded) }]}>
        {COPY.inTitle}
      </Text>

      {/* ① 갈래 (IN-R02, MO-R01·R02) */}
      <View style={[styles.field, { borderBottomColor: c.line }]}>
        <Text style={[styles.label, { color: c.ink, fontFamily: ff(font.sansMedium, fontsLoaded) }]}>
          {COPY.inBranch}
        </Text>
        <View style={styles.segWrap}>
          <BranchSegment current={p.branch} onChange={p.onChangeBranch} />
        </View>
      </View>

      {/* ② 인분 (IN-R05) */}
      <View style={[styles.field, { borderBottomColor: c.line }]}>
        <Text style={[styles.label, { color: c.ink, fontFamily: ff(font.sansMedium, fontsLoaded) }]}>
          {COPY.inServings}
          <Text style={[styles.lastTag, { color: c.muted }]}>{lastTag}</Text>
        </Text>
        <Stepper
          value={p.servings}
          min={SETTINGS.servingsMin}
          max={SETTINGS.servingsMax}
          suffix="인분"
          testIDPrefix="in-servings"
          onChange={p.onChangeServings}
        />
        <Text style={[styles.help, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
          최대 {SETTINGS.servingsMax}인분까지
        </Text>
      </View>

      {/* ③ 예산 (IN-R04, IN-R09·R10) */}
      <View style={[styles.field, { borderBottomColor: c.line }]}>
        <Text style={[styles.label, { color: c.ink, fontFamily: ff(font.sansMedium, fontsLoaded) }]}>
          {COPY.inBudget}
          <Text style={[styles.lastTag, { color: c.muted }]}>{lastTag}</Text>
        </Text>
        <Text
          testID="in-budget-status"
          style={[
            styles.status,
            { color: p.budget.status === 'unset' ? c.warn : c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }
          ]}
        >
          {p.budget.status === 'declared' ? comma(p.budget.value) + '원' : COPY.inEmpty}
        </Text>
        <View style={styles.chips}>
          <Pressable
            testID="in-budget-unset"
            accessibilityRole="radio"
            accessibilityState={{ checked: p.budget.status === 'unset' }}
            onPress={() => p.onChangeBudget(unset<number>())}
            style={({ pressed }) => [
              styles.choice,
              {
                borderColor: p.budget.status === 'unset' ? c.accent : c.line,
                backgroundColor: p.budget.status === 'unset' ? c.accent : c.surface,
                opacity: pressed ? 0.75 : 1
              }
            ]}
          >
            <Text style={[
              styles.choiceLabel,
              {
                color: p.budget.status === 'unset' ? c.accentInk : c.ink,
                fontFamily: ff(font.sansRegular, fontsLoaded)
              }
            ]}>{COPY.inEmpty}</Text>
          </Pressable>
          {BUDGET_CHOICES.map((v) => {
            const on = p.budget.status === 'declared' && p.budget.value === v;
            return (
              <Pressable
                key={v}
                testID={`in-budget-${v}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                onPress={() => p.onChangeBudget(declared(v))}
                style={({ pressed }) => [
                  styles.choice,
                  {
                    borderColor: on ? c.accent : c.line,
                    backgroundColor: on ? c.accent : c.surface,
                    opacity: pressed ? 0.75 : 1
                  }
                ]}
              >
                <Text style={[
                  styles.choiceLabel,
                  { color: on ? c.accentInk : c.ink, fontFamily: ff(font.sansRegular, fontsLoaded) }
                ]}>
                  {comma(v)}원
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={[styles.help, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
          {p.branch === 'home' ? COPY.inBudgetHelp : '시켜 먹기 예산은 메뉴 가격대와 비교해요'}
        </Text>
      </View>

      {/* ④ 집주소 — 시켜 먹기에서만 (IN-R03·R11·R12·R13·R14) */}
      {isDelivery ? (
        <View style={[styles.field, { borderBottomColor: c.line }]}>
          <Text style={[styles.label, { color: c.ink, fontFamily: ff(font.sansMedium, fontsLoaded) }]}>
            {COPY.inAddress}
            <Text style={[styles.lastTag, { color: c.warn }]}>{' 필수'}</Text>
            <Text style={[styles.lastTag, { color: c.muted }]}>{lastTag}</Text>
          </Text>
          <Text
            testID="in-address-status"
            style={[
              styles.status,
              {
                color: p.address.status === 'unset' ? c.warn : c.muted,
                fontFamily: ff(font.sansRegular, fontsLoaded)
              }
            ]}
          >
            {p.address.status === 'declared' && p.address.value ? p.address.value : COPY.inAddressNone}
          </Text>
          <TextInput
            testID="in-address-field"
            value={addrDraft}
            onChangeText={setAddrDraft}
            onBlur={() => p.onChangeAddress(addrDraft.trim() ? declared(addrDraft.trim()) : unset<string>())}
            onSubmitEditing={() => p.onChangeAddress(addrDraft.trim() ? declared(addrDraft.trim()) : unset<string>())}
            placeholder="예: 서울 마포구 망원동"
            placeholderTextColor={c.muted}
            accessibilityLabel="집주소"
            style={[styles.input, { borderColor: c.line, color: c.ink, backgroundColor: c.surface }]}
          />
          <View style={styles.addrActions}>
            <Btn
              testID="in-address-save"
              label="주소 저장"
              onPress={() => p.onChangeAddress(addrDraft.trim() ? declared(addrDraft.trim()) : unset<string>())}
              small
            />
          </View>
          <Text style={[styles.help, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
            {COPY.inAddressHelp} 기기에만 저장하고 서버로 보내지 않아요. 동·읍·면까지만 적으면 돼요.
            시켜 먹기는 주소를 건너뛸 수 없어요.
          </Text>
          <Text style={[styles.help, { color: c.warn, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
            {COPY.moNoFilter}
          </Text>
        </View>
      ) : null}

      <Btn
        testID="in-submit"
        label={COPY.inSubmit}
        onPress={p.onSubmit}
        primary
        disabled={!ready}
        style={styles.submit}
      />
      {!ready ? (
        <Text
          testID="in-blocked-note"
          style={[styles.help, { color: c.warn, fontFamily: ff(font.sansRegular, fontsLoaded) }]}
        >
          {missing}
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: 28 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 6 },
  field: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  label: { fontSize: 15, fontWeight: '500' },
  lastTag: { fontSize: 12, fontWeight: '400' },
  status: { fontSize: 13, marginTop: 2 },
  help: { fontSize: 12, lineHeight: 18, marginTop: 8 },
  segWrap: { marginTop: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  choice: { minHeight: 44, borderWidth: 1, borderRadius: RADIUS.ctl, paddingHorizontal: 12, justifyContent: 'center' },
  choiceLabel: { fontSize: 13 },
  input: {
    marginTop: 10, minHeight: 48, borderWidth: 1, borderRadius: RADIUS.ctl,
    paddingHorizontal: 12, fontSize: 15
  },
  addrActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  submit: { marginTop: 22 }
});
