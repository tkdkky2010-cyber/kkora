import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { Colors } from '../../constants/colors';

interface BadgeProps {
  label: string;
  color?: string;
}

export function Badge({ label, color = Colors.green }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '20' }]}>
      <Text variant="badge" color={color}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
});
