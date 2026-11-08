import { StyleSheet, Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from './ThemeProvider';
import { familyForWeight, fontSize, fontWeight, headingFamily } from './theme';

/** All app text goes through here so it renders in Plus Jakarta Sans (Baloo 2 for display, title and heading). */
export function Text({ variant = 'body', style, ...rest }: TextProps & { variant?: 'body' | 'display' | 'title' | 'heading' | 'muted' | 'error' }) {
  const { colors } = useTheme();
  const variants = {
    body: { fontSize: fontSize.md, color: colors.text },
    display: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text },
    title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
    heading: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text },
    muted: { fontSize: fontSize.sm, color: colors.muted },
    error: { fontSize: fontSize.sm, color: colors.dangerText },
  } as const;
  const { fontWeight: weight, ...flat } = StyleSheet.flatten([variants[variant], style]) as TextStyle;
  const fun = variant === 'display' || variant === 'title' || variant === 'heading';
  const family = fun ? (weight === fontWeight.bold ? headingFamily.bold : headingFamily.semibold) : familyForWeight(weight);
  return <RNText {...rest} style={[flat, { fontFamily: family }]} />;
}
