import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../atoms/Text';
import { LevelIcon } from '../atoms/LevelIcon';
import { Colors } from '../../constants/colors';
import { SleepLevel } from '../../constants/levels';

interface LevelBadgeProps {
  level: SleepLevel;
  streak: number;
  playerNumber?: number;
  size?: 'small' | 'large';
}

export function LevelBadge({ level, streak, playerNumber = 0, size = 'large' }: LevelBadgeProps) {
  const isLarge = size === 'large';
  const isNumberPhase = level.requiredDays === 0;

  const displayName = isNumberPhase
    ? level.name.replace('???', String(playerNumber))
    : level.name;

  return (
    <View style={styles.container}>
      <LevelIcon icon={level.icon} size={size} />
      <Text
        variant={isLarge ? 'h2' : 'body'}
        style={{ fontWeight: '700', marginTop: isLarge ? 12 : 6 }}
      >
        {displayName}
      </Text>
      <Text
        variant="caption"
        color={Colors.textSub}
        style={{ marginTop: 4 }}
      >
        {streak > 0 ? `${streak}일 연속 성공` : '아직 시작 전'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});
