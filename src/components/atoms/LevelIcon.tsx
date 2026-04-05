import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LevelIcon as LevelIconType } from '../../constants/levels';
import { Colors } from '../../constants/colors';

interface LevelIconProps {
  icon: LevelIconType;
  size?: 'small' | 'large';
}

const ICON_FAMILIES = {
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome5,
} as const;

export function LevelIcon({ icon, size = 'large' }: LevelIconProps) {
  const isLarge = size === 'large';
  const iconSize = isLarge ? 40 : 20;
  const containerSize = isLarge ? 80 : 40;

  const IconComponent = ICON_FAMILIES[icon.family];

  return (
    <View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 2,
          backgroundColor: icon.color + '15',
          borderColor: icon.color + '30',
        },
      ]}
    >
      <IconComponent
        name={icon.name as any}
        size={iconSize}
        color={icon.color}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
});
