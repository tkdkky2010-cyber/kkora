import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from '../atoms/Text';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

interface WarBroadcastProps {
  message: string;
  type?: 'info' | 'danger' | 'success';
  visible: boolean;
}

const TYPE_COLORS = {
  info: Colors.textSub,
  danger: Colors.red,
  success: Colors.green,
};

/**
 * 전투 방송 — 챌린지 중 실시간 알림 배너
 * ex) "방금 3명이 탈락했습니다", "생존률 80% 돌파!"
 */
export function WarBroadcast({ message, type = 'info', visible }: WarBroadcastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, opacity, translateY]);

  const color = TYPE_COLORS[type];

  return (
    <Animated.View
      style={[
        styles.container,
        { borderLeftColor: color },
        { opacity, transform: [{ translateY }] },
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Text variant="caption" color={color} style={{ fontWeight: '600' }}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgElevated,
    borderLeftWidth: 3,
    borderRadius: 8,
    paddingHorizontal: Spacing.cardPadding,
    paddingVertical: 12,
    marginHorizontal: Spacing.screenPadding,
  },
});
