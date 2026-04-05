import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '../atoms/Text';
import { Colors } from '../../constants/colors';
import { AppConfig } from '../../constants/config';

interface AmountSelectorProps {
  selectedAmount: number;
  onSelect: (amount: number) => void;
  disabled?: boolean;
}

function formatAmount(amount: number): string {
  return (amount / 1000).toFixed(0) + ',000원';
}

export function AmountSelector({
  selectedAmount,
  onSelect,
  disabled = false,
}: AmountSelectorProps) {
  return (
    <View style={styles.container}>
      {AppConfig.amounts.map((amount) => {
        const isSelected = selectedAmount === amount;
        return (
          <TouchableOpacity
            key={amount}
            style={[
              styles.option,
              isSelected && styles.optionSelected,
              disabled && styles.optionDisabled,
            ]}
            onPress={() => onSelect(amount)}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Text
              variant="body"
              color={isSelected ? Colors.green : Colors.textSub}
              style={{ fontWeight: isSelected ? '700' : '400' }}
            >
              {formatAmount(amount)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionSelected: {
    borderColor: Colors.green,
    backgroundColor: Colors.green + '10',
  },
  optionDisabled: {
    opacity: 0.4,
  },
});
