import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Text } from '../atoms/Text';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

interface ChecklistItemProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  autoDetected?: boolean;
  onHelp?: () => void;
}

export function ChecklistItem({
  label,
  checked,
  onToggle,
  disabled = false,
  autoDetected = false,
  onHelp,
}: ChecklistItemProps) {
  return (
    <View style={[styles.container, checked && styles.checked]}>
      {/* 체크 영역 (터치 가능) */}
      <TouchableOpacity
        style={styles.checkArea}
        onPress={onToggle}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked && <Text variant="caption" color={Colors.bgPrimary}>✓</Text>}
        </View>
        <Text
          variant="body"
          color={checked ? Colors.textPrimary : Colors.textSub}
          style={{ flex: 1 }}
        >
          {label}
        </Text>
        {autoDetected && (
          <Text variant="badge" color={Colors.green}>자동감지</Text>
        )}
      </TouchableOpacity>

      {/* 도움말 버튼 (체크 영역 밖, 별도 터치) */}
      {onHelp && (
        <TouchableOpacity
          onPress={onHelp}
          style={styles.helpButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View style={styles.helpCircle}>
            <Text variant="badge" color={Colors.textSub}>?</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 52,
  },
  checked: {
    borderColor: Colors.green + '30',
  },
  checkArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingLeft: 16,
    paddingRight: 8,
    gap: Spacing.elementGap,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.textDisabled,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  checkboxChecked: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  helpButton: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
