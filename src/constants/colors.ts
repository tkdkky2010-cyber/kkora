export const Colors = {
  // 배경
  bgPrimary: '#08080c',
  bgCard: '#14141e',
  bgElevated: '#1c1c2a',

  // 액센트
  green: '#3ddc84',
  red: '#e24b4a',
  gold: '#f0b429',

  // 텍스트
  textPrimary: '#e8e8ec',
  textSub: '#6b6b7b',
  textDisabled: '#3a3a4a',

  // 보더
  border: 'rgba(255, 255, 255, 0.06)',

  // 브랜드
  kakaoYellow: '#FEE500',

  // 유틸
  transparent: 'transparent',
  white: '#ffffff',
  black: '#000000',
} as const;

export type ColorKey = keyof typeof Colors;
