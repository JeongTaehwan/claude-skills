// 끼니 Expo 프로토타입 — 버튼
// requirements.md 미승인 초안(2026-09-12) + open-questions.md 추천 답 기준 — 정식 구현 아님.
// 버튼 높이 48 이상, 눌림 표시는 opacity만 (프로토타입에 애니메이션을 넣지 않는다).

import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { RADIUS, ff, useTheme } from '../theme';

interface Props {
  label: string;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
  testID?: string;
  style?: ViewStyle;
  small?: boolean;
}

export function Btn({ label, onPress, primary, disabled, testID, style, small }: Props) {
  const { c, fontsLoaded, font } = useTheme();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        small ? styles.small : null,
        {
          backgroundColor: primary ? c.accent : c.surface,
          borderColor: primary ? c.accent : c.line,
          opacity: disabled ? 0.5 : pressed ? 0.78 : 1
        },
        style
      ]}
    >
      <Text
        style={[
          styles.label,
          small ? styles.labelSmall : null,
          {
            color: disabled ? c.muted : primary ? c.accentInk : c.ink,
            fontFamily: ff(primary ? font.sansSemiBold : font.sansMedium, fontsLoaded)
          }
        ]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: RADIUS.ctl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  small: { minHeight: 44, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  label: { fontSize: 15, fontWeight: '500', textAlign: 'center' },
  labelSmall: { fontSize: 12 }
});
