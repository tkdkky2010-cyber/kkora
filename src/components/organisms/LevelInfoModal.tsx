import React from 'react';
import {
  Modal,
  View,
  ScrollView,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../atoms/Text';
import { LevelIcon } from '../atoms/LevelIcon';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { SLEEP_LEVELS, SleepLevel, getLevelIndex } from '../../constants/levels';

interface LevelInfoModalProps {
  visible: boolean;
  onClose: () => void;
  currentLevel: SleepLevel;
  playerNumber?: number;
}

export function LevelInfoModal({
  visible,
  onClose,
  currentLevel,
  playerNumber = 247,
}: LevelInfoModalProps) {
  const currentIdx = getLevelIndex(currentLevel);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={() => {}}>
          <View style={styles.header}>
            <Text variant="h2">레벨 시스템</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text variant="caption" color={Colors.textSub} style={{ marginBottom: 20 }}>
            연속 성공일에 따라 레벨이 올라갑니다
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {SLEEP_LEVELS.map((sl, idx) => {
              const isCurrent = currentIdx === idx;
              const displayName = sl.requiredDays === 0
                ? sl.name.replace('???', String(playerNumber))
                : sl.name;

              return (
                <View
                  key={idx}
                  style={[styles.levelItem, isCurrent && styles.levelItemCurrent]}
                >
                  <LevelIcon icon={sl.icon} size="small" />
                  <View style={styles.levelItemText}>
                    <Text
                      variant="body"
                      color={isCurrent ? Colors.textPrimary : Colors.textSub}
                      style={{ fontWeight: isCurrent ? '700' : '400' }}
                    >
                      {displayName}
                      {isCurrent && '  (현재)'}
                    </Text>
                    <Text variant="caption" color={Colors.textDisabled}>
                      {sl.requiredDays === 0 ? '시작' : `${sl.requiredDays}일 연속 성공`}
                    </Text>
                  </View>
                </View>
              );
            })}

            <View style={styles.ruleBox}>
              <Text variant="caption" color={Colors.textSub} style={{ lineHeight: 20 }}>
                {'• 실패 시 연속 성공일 즉시 초기화\n• 같은 주 2회 실패 시 1단계 강등\n• 다시 달성하면 레벨 복구'}
              </Text>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    paddingHorizontal: Spacing.screenPadding,
  },
  content: {
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    padding: Spacing.cardPadding,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  levelItemCurrent: {
    backgroundColor: Colors.bgElevated,
  },
  levelItemText: {
    flex: 1,
    gap: 2,
  },
  ruleBox: {
    marginTop: 16,
    padding: 14,
    backgroundColor: Colors.bgElevated,
    borderRadius: 12,
  },
});
