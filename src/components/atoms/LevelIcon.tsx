import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Easing } from 'react-native';
import { SleepLevel } from '../../constants/levels';
import { useLevelTheme } from '../../contexts/LevelThemeContext';

interface LevelIconProps {
  level: SleepLevel;
  size?: 'small' | 'medium' | 'large';
  /** 정적으로 표시 (모달 내 미리보기 등) */
  static?: boolean;
  /** 잠금 상태 (미달 레벨) — 그레이스케일 처리 */
  locked?: boolean;
}

const SIZE_MAP = {
  small: 40,
  medium: 64,
  large: 120,
} as const;

export function LevelIcon({ level, size = 'large', static: isStatic = false, locked = false }: LevelIconProps) {
  const { theme } = useLevelTheme();
  const boxSize = SIZE_MAP[size];

  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isStatic) return;

    // 아이들 애니메이션: 스케일 펄스 + 위아래 플로팅 동시 실행
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.06,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -6,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();
    float.start();

    return () => {
      pulse.stop();
      float.stop();
    };
  }, [isStatic, scale, translateY]);

  return (
    <View style={[styles.container, { width: boxSize, height: boxSize }]}>
      <Animated.View
        style={{
          width: boxSize,
          height: boxSize,
          transform: [{ scale }, { translateY }],
          opacity: locked ? 0.35 : 1,
        }}
      >
        <Image
          source={level.images[theme]}
          style={styles.image}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
