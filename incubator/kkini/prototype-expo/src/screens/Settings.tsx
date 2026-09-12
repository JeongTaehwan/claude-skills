// 끼니 Expo 프로토타입 — 설정 화면 (PR + 개발용)
// requirements.md 6.4절 / ux/flows.md 3절 "PR — 취향·제약" / open-questions.md 추천 답 기준.
// requirements.md 미승인 초안(2026-09-12) 전제 — 정식 구현 아님.
//
// PR-R01 저장 항목은 다섯 가지다: 절대 제외 / 싫어하는 것 / 1인 예산 상한 / 조리 가능 여부 / 같이 먹는 인원.
// PR-R03 프로필이 비었을 때는 "제약 없음"이 아니라 "아직 입력 안 함"으로 쓴다 (PR-OQ-02 추천: 3상태).
// PR-R04 프로필 변경은 다음 결정부터 적용된다 — 눈앞의 오늘 카드를 소급해 바꾸지 않는다.
// PR-R05 입력은 전부 건너뛸 수 있다. 필수 항목은 0개다.
// 저장 버튼은 없다 — 필드 단위 즉시 저장 (flows 3절, [미정 PR-OQ-03]).

import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CATALOG, CATALOG_VERSION } from '../catalog';
import {
  ALLERGENS, ALLERGEN_SLUG, Answered, COPY, DISLIKE_TAGS, KkiniState, SETTINGS,
  TAG_SLUG, TIER_KRW, declared, iso, makeSampleLogs, todayKey, unset
} from '../engine';
import { RADIUS, ff, useTheme } from '../theme';
import { Btn } from '../components/Btn';

interface Props {
  state: KkiniState;
  mutate: (fn: (s: KkiniState) => void) => void;
  onGoToday: () => void;
}

export function Settings({ state, mutate, onGoToday }: Props) {
  const { c, fontsLoaded, font } = useTheme();
  const p = state.profile;

  /* PR-R04 — 이 시각 이후 생성된 결정부터 적용된다 */
  function touch(fn: (s: KkiniState) => void) {
    mutate((s) => { fn(s); s.profile.updatedAt = iso(new Date()); });
  }

  function statusText<T>(a: Answered<T>, fmt: (v: T) => string): string {
    return a.status === 'unset' ? COPY.prUnset : fmt(a.value);   // PR-R03
  }

  const absMode: 'unset' | 'none' | 'some' =
    p.absoluteExclusions.status === 'unset' ? 'unset'
      : p.absoluteExclusions.value.length ? 'some' : 'none';

  function setAbsMode(mode: 'unset' | 'none' | 'some') {
    touch((s) => {
      if (mode === 'unset') s.profile.absoluteExclusions = unset<string[]>();
      else if (mode === 'none') s.profile.absoluteExclusions = declared<string[]>([]);
      else if (s.profile.absoluteExclusions.status !== 'declared') {
        s.profile.absoluteExclusions = declared<string[]>([]);
      }
    });
  }
  function toggleAllergen(a: string) {
    touch((s) => {
      const cur = s.profile.absoluteExclusions;
      const list = cur.status === 'declared' ? cur.value.slice() : [];
      const i = list.indexOf(a);
      if (i >= 0) list.splice(i, 1); else list.push(a);
      s.profile.absoluteExclusions = declared(list);
    });
  }
  function toggleDislike(t: string) {
    touch((s) => {
      const cur = s.profile.dislikes;
      const list = cur.status === 'declared' ? cur.value.slice() : [];
      const i = list.indexOf(t);
      if (i >= 0) list.splice(i, 1); else list.push(t);
      s.profile.dislikes = declared(list);
    });
  }

  /* 개발용 — 첫 실행은 진짜 콜드 스타트다. 정식 구현에는 이 버튼이 없다 */
  function devSeed() {
    mutate((s) => { s.mealLogs = makeSampleLogs(CATALOG); });   // 기존 기록을 예시 7건으로 대체한다
  }
  function devFail() {
    mutate((s) => { s.devFailMode = true; });
    onGoToday();
  }
  function devResetToday() {
    const t = todayKey();
    mutate((s) => {
      s.devFailMode = false;
      s.decisions = s.decisions.filter((d) => d.kkiniDate !== t);
      s.rejections = s.rejections.filter((r) => r.kkiniDate !== t);
      s.mealLogs = s.mealLogs.filter((m) => m.kkiniDate !== t);
      delete s.branchByDate[t];
    });
    onGoToday();
  }

  const dislikeList = p.dislikes.status === 'declared' ? p.dislikes.value : [];
  const absList = p.absoluteExclusions.status === 'declared' ? p.absoluteExclusions.value : [];

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
        <FieldHead
          label="못 먹는 것 (절대 제외)"
          status={statusText(p.absoluteExclusions, (v) => (v.length ? '있음 — ' + v.join(', ') : '없음'))}
          unsetFlag={p.absoluteExclusions.status === 'unset'}
        />
        <View style={styles.radios}>
          {([['unset', COPY.prUnset], ['none', '없음'], ['some', '있음 (아래에서 고른다)']] as const).map(
            ([mode, label]) => (
              <Choice
                key={mode}
                testID={`pr-abs-${mode}`}
                label={label}
                selected={absMode === mode}
                role="radio"
                onPress={() => setAbsMode(mode)}
              />
            )
          )}
        </View>
        {p.absoluteExclusions.status === 'declared' ? (
          <View testID="pr-allergens" style={styles.grid}>
            {ALLERGENS.map((a) => (
              <Choice
                key={a}
                testID={`pr-allergen-${ALLERGEN_SLUG[a]}`}
                label={a}
                selected={absList.indexOf(a) >= 0}
                role="checkbox"
                half
                onPress={() => toggleAllergen(a)}
              />
            ))}
          </View>
        ) : null}
        <Note>
          여기 고른 것은 어떤 경우에도 추천에 나오지 않는다. 후보가 0개가 되어도 풀지 않는다.
        </Note>
      </View>

      {/* PR-R01 ② 싫어하는 것 — 감점, 제외 아님 (RE-R04) */}
      <View style={[styles.field, { borderBottomColor: c.line }]}>
        <FieldHead
          label="싫어하는 것"
          status={statusText(p.dislikes, (v) => (v.length ? v.join(', ') : '없음'))}
          unsetFlag={p.dislikes.status === 'unset'}
        />
        <View testID="pr-dislikes" style={styles.grid}>
          {DISLIKE_TAGS.map((t) => (
            <Choice
              key={t}
              testID={`pr-dislike-${TAG_SLUG[t]}`}
              label={t}
              selected={dislikeList.indexOf(t) >= 0}
              role="checkbox"
              half
              onPress={() => toggleDislike(t)}
            />
          ))}
        </View>
        <Note>고른 갈래의 음식은 점수가 깎일 뿐 목록에서 사라지지 않는다.</Note>
      </View>

      {/* PR-R01 ③ 1인 예산 상한 */}
      <View style={[styles.field, { borderBottomColor: c.line }]}>
        <FieldHead
          label="1인 예산 상한"
          status={statusText(p.budgetMaxKrw, (v) => v.toLocaleString('ko-KR') + '원 이하')}
          unsetFlag={p.budgetMaxKrw.status === 'unset'}
        />
        <View style={styles.grid}>
          <Choice
            testID="pr-budget-unset"
            label={COPY.prUnset}
            selected={p.budgetMaxKrw.status === 'unset'}
            role="radio"
            half
            onPress={() => touch((s) => { s.profile.budgetMaxKrw = unset<number>(); })}
          />
          {[8000, 12000, 16000, 20000, 30000].map((v) => (
            <Choice
              key={v}
              testID={`pr-budget-${v}`}
              label={v.toLocaleString('ko-KR') + '원'}
              selected={p.budgetMaxKrw.status === 'declared' && p.budgetMaxKrw.value === v}
              role="radio"
              half
              onPress={() => touch((s) => { s.profile.budgetMaxKrw = declared(v); })}
            />
          ))}
        </View>
      </View>

      {/* PR-R01 ④ 조리 가능 여부 */}
      <View style={[styles.field, { borderBottomColor: c.line }]}>
        <FieldHead
          label="조리 가능 여부"
          status={statusText(p.canCook, (v) => (v ? '해 먹을 수 있다' : '지금은 못 만든다'))}
          unsetFlag={p.canCook.status === 'unset'}
        />
        <View style={styles.radios}>
          <Choice
            testID="pr-cancook-unset"
            label={COPY.prUnset}
            selected={p.canCook.status === 'unset'}
            role="radio"
            onPress={() => touch((s) => { s.profile.canCook = unset<boolean>(); })}
          />
          <Choice
            testID="pr-cancook-yes"
            label="해 먹을 수 있다"
            selected={p.canCook.status === 'declared' && p.canCook.value}
            role="radio"
            onPress={() => touch((s) => { s.profile.canCook = declared(true); })}
          />
          <Choice
            testID="pr-cancook-no"
            label="지금은 못 만든다"
            selected={p.canCook.status === 'declared' && !p.canCook.value}
            role="radio"
            onPress={() => touch((s) => { s.profile.canCook = declared(false); })}
          />
        </View>
      </View>

      {/* PR-R01 ⑤ 같이 먹는 인원 */}
      <View style={[styles.field, { borderBottomColor: c.line }]}>
        <FieldHead
          label="같이 먹는 인원"
          status={statusText(p.partySize, (v) => (v >= 3 ? '3명 이상' : v + '명'))}
          unsetFlag={p.partySize.status === 'unset'}
        />
        <View style={styles.grid}>
          <Choice
            testID="pr-party-unset"
            label={COPY.prUnset}
            selected={p.partySize.status === 'unset'}
            role="radio"
            half
            onPress={() => touch((s) => { s.profile.partySize = unset<number>(); })}
          />
          {([[1, '나 혼자'], [2, '2명'], [3, '3명 이상']] as const).map(([v, label]) => (
            <Choice
              key={v}
              testID={`pr-party-${v}`}
              label={label}
              selected={p.partySize.status === 'declared' && p.partySize.value === v}
              role="radio"
              half
              onPress={() => touch((s) => { s.profile.partySize = declared(v); })}
            />
          ))}
        </View>
        {/* review #10 — 수집만 되고 4절 로직이 읽지 않는다. 화면에 그 사실을 적는다 */}
        <Note>저장만 된다 — 오늘의 결정 계산은 이 값을 읽지 않는다 (리뷰 #10).</Note>
      </View>

      <View style={styles.devbox}>
        <Text style={[styles.title, { color: c.ink, fontFamily: ff(font.serifBold, fontsLoaded) }]}>
          개발용
        </Text>
        <Text style={[styles.sub, { color: c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}>
          프로토타입 확인용 버튼이다. 정식 구현에는 없다.
        </Text>
        <View style={styles.stack}>
          <Btn testID="dev-seed" label="예시 기록 7건 넣기" onPress={devSeed} />
          <Btn testID="dev-fail" label="실패 상태 미리보기" onPress={devFail} />
          <Btn testID="dev-reset" label="오늘 초기화" onPress={devResetToday} />
        </View>
        <Note>
          카탈로그 {CATALOG.length}종 (판본 {CATALOG_VERSION}) · 하루 경계 0{SETTINGS.dayBoundaryHour}:00 ·
          저녁 {SETTINGS.dinnerWindow[0]}~{SETTINGS.dinnerWindow[1]}시 ·
          최근 창 {SETTINGS.recentWindowDays}일 · 거절 상한 {SETTINGS.rejectLimitPerDay}회 ·
          예산 등급 상한 1={TIER_KRW[1]}원 2={TIER_KRW[2]}원 3={TIER_KRW[3]}원
        </Note>
        <Note>"예시 기록 7건 넣기"는 기존 기록을 예시 7건으로 대체한다.</Note>
      </View>
    </ScrollView>
  );
}

function FieldHead({ label, status, unsetFlag }: { label: string; status: string; unsetFlag: boolean }) {
  const { c, fontsLoaded, font } = useTheme();
  return (
    <>
      <Text style={[styles.fieldLabel, { color: c.ink, fontFamily: ff(font.sansMedium, fontsLoaded) }]}>
        {label}
      </Text>
      <Text
        testID={`status-${label}`}
        style={[styles.fieldStatus, { color: unsetFlag ? c.warn : c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}
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
      <View
        style={[
          styles.mark,
          role === 'radio' ? styles.markRound : null,
          { borderColor: selected ? c.accent : c.line, backgroundColor: selected ? c.accent : 'transparent' }
        ]}
      />
      <Text
        style={[styles.choiceLabel, { color: c.ink, fontFamily: ff(font.sansRegular, fontsLoaded) }]}
        numberOfLines={1}
      >
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
  fieldLabel: { fontSize: 15, fontWeight: '500' },
  fieldStatus: { fontSize: 12, marginTop: 2 },
  radios: { marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 40, paddingRight: 10 },
  choiceHalf: { width: '50%' },
  choiceLabel: { fontSize: 14, flexShrink: 1 },
  mark: { width: 18, height: 18, borderWidth: 1.5, borderRadius: 4 },
  markRound: { borderRadius: 9 },
  note: { fontSize: 12, lineHeight: 18, marginTop: 10 },
  devbox: { marginTop: 22 },
  stack: { gap: 8, marginTop: 4 }
});
