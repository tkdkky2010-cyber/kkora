import React from 'react';
import { StyleSheet } from 'react-native';
import { Card } from '../atoms/Card';
import { Text } from '../atoms/Text';
import { Colors } from '../../constants/colors';

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  valueColor?: string;
}

export function StatCard({
  label,
  value,
  unit,
  valueColor = Colors.textPrimary,
}: StatCardProps) {
  return (
    <Card style={styles.card}>
      <Text variant="caption" color={Colors.textSub} style={{ marginBottom: 8 }}>
        {label}
      </Text>
      <Text variant="h2" color={valueColor}>
        {value}
        {unit && (
          <Text variant="caption" color={Colors.textSub}>{unit}</Text>
        )}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
});
