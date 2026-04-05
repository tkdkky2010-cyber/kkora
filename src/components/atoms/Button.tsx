import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Text } from './Text';
import { Colors } from '../../constants/colors';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? Colors.bgPrimary : Colors.textPrimary}
        />
      ) : (
        <Text
          variant="body"
          color={
            isDisabled
              ? Colors.textDisabled
              : isPrimary
                ? Colors.bgPrimary
                : Colors.textPrimary
          }
          style={{ fontWeight: '700' }}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  primary: {
    height: 56,
    backgroundColor: Colors.green,
  },
  secondary: {
    height: 48,
    backgroundColor: Colors.transparent,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
  },
  disabled: {
    opacity: 0.4,
  },
});
