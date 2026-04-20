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
import { SLEEP_LEVELS, SleepLevel, getLevelIndex, getDaysToNextLevel } from '../../constants/levels';
import { useLevelTheme } from '../../contexts/LevelThemeContext';

interface LevelInfoModalProps {
  visible: boolean;
  onClose: () => void;
  currentLevel: SleepLevel;
  streak?: number;
  playerNumber?: number;
}

export function LevelInfoModal({
  visible,
  onClose,
  currentLevel,
  streak = 0,
  playerNumber = 0,
}: LevelInfoModalProps) {
  const { theme, setTheme } = useLevelTheme();
  const currentIdx = getLevelIndex(currentLevel);
  const daysToNext = getDaysToNextLevel(streak);

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
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }}
            >
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text variant="caption" color={Colors.textSub} style={{ marginBottom: 12 }}>
            연속 성공일에 따라 레벨이 올라갑니다
            {daysToNext !== null && streak > 0 && ` · 다음 레벨까지 ${daysToNext}일`}
          </Text>

          {/* V1 / V2 테마 탭 */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, theme === 'v1' && styles.tabActive]}
              onPress={() => setTheme('v1')}
              activeOpacity={0.8}
            >
              <Text
                variant="body"
                color={theme === 'v1' ? Colors.textPrimary : Colors.textSub}
                style={{ fontWeight: theme === 'v1' ? '700' : '400' }}
              >
                컬러
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, theme === 'v2' && styles.tabActive]}
              onPress={() => setTheme('v2')}
              activeOpacity={0.8}
            >
              <Text
                variant="body"
                color={theme === 'v2' ? Colors.textPrimary : Colors.textSub}
                style={{ fontWeight: theme === 'v2' ? '700' : '400' }}
              >
                블랙
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {SLEEP_LEVELS.map((sl, idx) => {
              const isCurrent = currentIdx === idx;
              const isLocked = idx > currentIdx;
              const isNumberPhase = sl.requiredDays === 0;
              const displayName = isNumberPhase && playerNumber > 0 && isCurrent
                ? `${sl.name} #${playerNumber}`
                : sl.name;

              return (
                <View
                  key={idx}
                  style={[styles.levelItem, isCurrent && styles.levelItemCurrent]}
                >
                  <LevelIcon level={sl} size="small" static locked={isLocked} />
                  <View style={styles.levelItemText}>
                    <Text
                      variant="body"
                      color={isLocked ? Colors.textSub : Colors.textPrimary}
                      style={{ fontWeight: isCurrent ? '700' : '400' }}
                    >
                      {displayName}
                      {isCurrent && '  (현재)'}
                      {isLocked && '  🔒'}
                    </Text>
                    <Text variant="caption" color={Colors.textDisabled}>
                      {sl.requiredDays === 0 ? '시작' : `${sl.requiredDays}일 연속 성공`}
                      {' · '}
                      {sl.description}
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
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    padding: 4,
    backgroundColor: Colors.bgElevated,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.bgCard,
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
