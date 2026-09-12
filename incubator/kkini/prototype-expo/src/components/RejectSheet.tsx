// 끼니 Expo 프로토타입 — 거절 사유 시트 (RE)
// requirements.md 6.2절 / ux/flows.md 3절 "RE — 거절 사유 시트 (DC 화면 위 모달)" 기준 — 정식 구현 아님.
// RE-R03 사유를 1탭으로 고른다 (오늘은 아님 / 최근에 먹음 / 안 좋아함 / 지금은 못 만듦) + 건너뛰기.
//        건너뛴 거절도 RE-R02(같은 날 재등장 없음)는 그대로 적용된다.
// HTML 판은 div 백드롭이었고 여기서는 네이티브 Modal이다 (동작은 같다).

import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { COPY, REJECT_REASONS, RejectionReason } from '../engine';
import { MAX_WIDTH, RADIUS, ff, useTheme } from '../theme';
import { Btn } from './Btn';

interface Props {
  visible: boolean;
  onPick: (reason: RejectionReason | null) => void;
  onClose: () => void;
}

export function RejectSheet({ visible, onPick, onClose }: Props) {
  const { c, fontsLoaded, font } = useTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <Pressable testID="reject-backdrop" style={styles.backdrop} onPress={onClose}>
        <Pressable
          testID="reject-sheet"
          accessibilityViewIsModal
          style={[styles.sheet, { backgroundColor: c.surface, borderColor: c.line }]}
          onPress={() => { /* 시트 안쪽 탭은 닫지 않는다 */ }}
        >
          <Text style={[styles.title, { color: c.ink, fontFamily: ff(font.serifBold, fontsLoaded) }]}>
            {COPY.reSheetTitle}
          </Text>
          <View style={styles.stack}>
            {REJECT_REASONS.map((r) => (
              <Btn
                key={r.code || 'skip'}
                testID={`re-${r.code || 'skip'}`}
                label={r.label}
                onPress={() => onPick(r.code)}
              />
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 26, 23, 0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16
  },
  sheet: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    borderWidth: 1,
    borderRadius: RADIUS.card,
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  stack: { gap: 8 }
});
