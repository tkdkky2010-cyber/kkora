import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../atoms/Text';
import { Colors } from '../../constants/colors';

interface TimerDisplayProps {
  hours: number;
  minutes: number;
  seconds: number;
  label?: string;
  color?: string;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function TimerDisplay({
  hours,
  minutes,
  seconds,
  label,
  color = Colors.textPrimary,
}: TimerDisplayProps) {
  return (
    <View style={styles.container}>
      {label && (
        <Text variant="caption" color={Colors.textSub} style={{ marginBottom: 8 }}>
          {label}
        </Text>
      )}
      <Text
        variant="largeNumber"
        color={color}
        style={styles.time}
      >
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  time: {
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
});
