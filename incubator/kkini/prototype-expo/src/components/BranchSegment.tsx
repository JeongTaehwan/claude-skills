// 끼니 Expo 프로토타입 — 갈래 전환 세그먼트 (MO)
// requirements.md 6.3절 / open-questions.md KK-OQ-01·KK-OQ-02 추천 답 기준 — 정식 구현 아님.
// MO-R01 갈래는 정확히 3개다. 이 목록은 화면에서 줄지 않는다.
// MO-R03 비활성 갈래는 숨기지 않고 "아직 없음"으로 표시한다.
// MO-R04 갈래를 바꾸면 오늘의 결정은 다시 계산된다 (호출자가 재계산을 부른다).

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BRANCH_LABEL, Branch, COPY } from '../engine';
import { RADIUS, ff, useTheme } from '../theme';

const ALL_BRANCHES: Branch[] = ['home', 'out', 'delivery'];   // MO-R01: 3개 고정

interface Props {
  current: Branch;
  locked: boolean;          // 확정 뒤에는 바꿀 대상이 없다 (flows (c)) — README 3절에 근거 없음으로 적었다
  onChange: (b: Branch) => void;
}

export function BranchSegment({ current, locked, onChange }: Props) {
  const { c, fontsLoaded, font } = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel="오늘의 갈래"
      style={[styles.wrap, { borderColor: c.line }]}
    >
      {ALL_BRANCHES.map((b) => {
        const inactive = b === 'delivery';   // KK-OQ-02 추천: C(배달)는 MVP 밖
        const selected = b === current;
        const disabled = inactive || locked;
        return (
          <Pressable
            key={b}
            testID={`branch-${b}`}
            accessibilityRole="tab"
            accessibilityState={{ selected, disabled }}
            disabled={disabled}
            onPress={() => onChange(b)}
            style={({ pressed }) => [
              styles.chip,
              selected ? { backgroundColor: c.ink } : null,
              { opacity: pressed && !disabled ? 0.8 : 1 }
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  color: selected ? c.bg : inactive || locked ? c.muted : c.ink,
                  fontFamily: ff(font.sansMedium, fontsLoaded)
                }
              ]}
              numberOfLines={1}
            >
              {BRANCH_LABEL[b]}
            </Text>
            {inactive ? (
              <Text
                testID="branch-delivery-sub"
                style={[styles.sub, { color: selected ? c.bg : c.muted, fontFamily: ff(font.sansRegular, fontsLoaded) }]}
                numberOfLines={1}
              >
                {COPY.moInactive}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: RADIUS.ctl,
    padding: 4,
    gap: 6,
    marginBottom: 14
  },
  chip: {
    flex: 1,
    minHeight: 48,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    paddingVertical: 4
  },
  label: { fontSize: 13, fontWeight: '500' },
  sub: { fontSize: 10, marginTop: 1 }
});
