import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../constants/colors';

interface ToggleProps {
  value: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
}

const TOGGLE_WIDTH = 64;
const TOGGLE_HEIGHT = 36;
const THUMB_SIZE = 28;
const TRACK_PADDING = 4;

export function Toggle({ value, onToggle, disabled = false }: ToggleProps) {
  const translateX = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? 1 : 0,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();
  }, [value]);

  const thumbTranslateX = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [TRACK_PADDING, TOGGLE_WIDTH - THUMB_SIZE - TRACK_PADDING],
  });

  const trackColor = value ? Colors.green : Colors.bgElevated;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => !disabled && onToggle(!value)}
      disabled={disabled}
      style={[
        styles.track,
        { backgroundColor: trackColor },
        disabled && styles.disabled,
      ]}
    >
      <Animated.View
        style={[
          styles.thumb,
          { transform: [{ translateX: thumbTranslateX }] },
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TOGGLE_WIDTH,
    height: TOGGLE_HEIGHT,
    borderRadius: TOGGLE_HEIGHT / 2,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: Colors.white,
  },
  disabled: {
    opacity: 0.4,
  },
});
