import {
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome5,
} from '@expo/vector-icons';
import type { IconFamily } from '../../constants/levels';

interface IconProps {
  family: IconFamily;
  name: string;
  size?: number;
  color?: string;
}

const ICON_FAMILIES = {
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome5,
} as const;

export function Icon({ family, name, size = 24, color = '#e8e8ec' }: IconProps) {
  const IconComponent = ICON_FAMILIES[family];
  return <IconComponent name={name as any} size={size} color={color} />;
}
