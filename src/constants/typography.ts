import { TextStyle } from 'react-native';

export const Typography = {
  largeNumber: {
    fontSize: 48,
    fontWeight: '900' as TextStyle['fontWeight'],
  },
  h1: {
    fontSize: 28,
    fontWeight: '900' as TextStyle['fontWeight'],
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as TextStyle['fontWeight'],
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  caption: {
    fontSize: 13,
    fontWeight: '300' as TextStyle['fontWeight'],
  },
  badge: {
    fontSize: 11,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
} as const;

export type TypographyVariant = keyof typeof Typography;
