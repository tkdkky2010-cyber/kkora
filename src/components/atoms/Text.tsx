import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { Typography, TypographyVariant } from '../../constants/typography';
import { Colors } from '../../constants/colors';

interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: string;
  allowFontScaling?: boolean;
  children: React.ReactNode;
}

export function Text({
  variant = 'body',
  color = Colors.textPrimary,
  allowFontScaling = true,
  style,
  children,
  ...rest
}: TextProps) {
  return (
    <RNText
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={1.3}
      style={[
        { color },
        Typography[variant],
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}
