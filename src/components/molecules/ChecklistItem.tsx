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
}

export function ChecklistItem({
  label,
  checked,
  onToggle,
  disabled = false,
  autoDetected = false,
}: ChecklistItemProps) {
  return (
    <TouchableOpacity
      style={[styles.container, checked && styles.checked]}
      onPress={onToggle}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text variant="caption" color={Colors.bgPrimary}>✓</Text>}
      </View>
      <View style={styles.labelContainer}>
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
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 52,
  },
  checked: {
    borderColor: Colors.green + '30',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.textDisabled,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  labelContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.elementGap,
  },
});
