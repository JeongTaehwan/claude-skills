// 끼니 v1 프로토타입 — 숫자 스테퍼 (인분)
// requirements.md v1 미승인 초안 + open-questions.md 추천 답 기준 프로토타입. 정식 구현 아님.
// IN-R05 인분은 1 이상의 정수로 받는다. 기본 2, 상한 6 (IN-OQ-03 추천).

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RADIUS, ff, useTheme } from '../theme';

interface Props {
  value: number; min: number; max: number;
  suffix?: string;
  testIDPrefix: string;
  onChange: (v: number) => void;
}

export function Stepper({ value, min, max, suffix, testIDPrefix, onChange }: Props) {
  const { c, fontsLoaded, font } = useTheme();
  const btn = (label: string, delta: number, id: string) => {
    const next = value + delta;
    const off = next < min || next > max;
    return (
      <Pressable
        testID={id}
        accessibilityRole="button"
        accessibilityLabel={label === '-' ? '하나 줄이기' : '하나 늘리기'}
        accessibilityState={{ disabled: off }}
        disabled={off}
        onPress={() => onChange(next)}
        style={({ pressed }) => [
          styles.btn,
          { borderColor: c.line, backgroundColor: c.surface, opacity: off ? 0.4 : pressed ? 0.7 : 1 }
        ]}
      >
        <Text style={[styles.btnLabel, { color: c.ink, fontFamily: ff(font.sansMedium, fontsLoaded) }]}>
          {label}
        </Text>
      </Pressable>
    );
  };
  return (
    <View style={styles.row}>
      {btn('−', -1, `${testIDPrefix}-minus`)}
      <Text
        testID={`${testIDPrefix}-value`}
        style={[styles.value, { color: c.ink, fontFamily: ff(font.serifBold, fontsLoaded) }]}
      >
        {value}{suffix || ''}
      </Text>
      {btn('+', 1, `${testIDPrefix}-plus`)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8 },
  btn: {
    width: 52, height: 48, borderWidth: 1, borderRadius: RADIUS.ctl,
    alignItems: 'center', justifyContent: 'center'
  },
  btnLabel: { fontSize: 20, lineHeight: 24 },
  value: { fontSize: 22, minWidth: 84, textAlign: 'center', fontVariant: ['tabular-nums'] }
});
