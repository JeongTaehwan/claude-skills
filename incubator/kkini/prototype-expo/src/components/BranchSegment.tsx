// 끼니 v1 프로토타입 — 갈래 세그먼트 (MO)
// requirements.md v1 미승인 초안 + open-questions.md 추천 답 기준 프로토타입. 정식 구현 아님.
// MO-R01 갈래는 정확히 2개다: 해 먹기 / 시켜 먹기. 나가서 먹기는 화면에 없다.
// MO-R02 기본 선택은 해 먹기다.
// MO-R03 갈래를 바꾸면 결정은 다시 계산된다 (호출자가 재계산을 부른다).

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BRANCHES, BRANCH_LABEL, Branch } from '../engine';
import { RADIUS, ff, useTheme } from '../theme';

interface Props {
  current: Branch;
  disabled?: boolean;     // 애니메이션 재생 중에는 갈래 칩도 비활성 (ux 3절)
  onChange: (b: Branch) => void;
}

export function BranchSegment({ current, disabled, onChange }: Props) {
  const { c, fontsLoaded, font } = useTheme();
  return (
    <View accessibilityRole="tablist" accessibilityLabel="갈래" style={[styles.wrap, { borderColor: c.line }]}>
      {BRANCHES.map((b) => {
        const selected = b === current;
        return (
          <Pressable
            key={b}
            testID={`branch-${b}`}
            accessibilityRole="tab"
            accessibilityState={{ selected, disabled: !!disabled }}
            aria-selected={selected}          /* RN 0.86의 ARIA prop — 웹에서도 aria-selected가 나온다 */
            disabled={disabled}
            onPress={() => onChange(b)}
            style={({ pressed }) => [
              styles.chip,
              selected ? { backgroundColor: c.ink } : null,
              { opacity: disabled ? 0.5 : pressed ? 0.8 : 1 }
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: selected ? c.bg : c.ink, fontFamily: ff(font.sansMedium, fontsLoaded) }
              ]}
              numberOfLines={1}
            >
              {BRANCH_LABEL[b]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', borderWidth: 1, borderRadius: RADIUS.ctl, padding: 4, gap: 6 },
  chip: {
    flex: 1, minHeight: 48, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4
  },
  label: { fontSize: 14, fontWeight: '500' }
});
