import { StyleSheet, Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from './ThemeProvider';
import { familyForWeight, fontSize, fontWeight } from './theme';

/** All app text goes through here so it renders in Plus Jakarta Sans. */
export function Text({ variant = 'body', style, ...rest }: TextProps & { variant?: 'body' | 'title' | 'heading' | 'muted' | 'error' }) {
  const { colors } = useTheme();
  const variants = {
    body: { fontSize: fontSize.md, color: colors.text },
    title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
    heading: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text },
    muted: { fontSize: fontSize.sm, color: colors.muted },
    error: { fontSize: fontSize.sm, color: colors.dangerText },
  } as const;
  const { fontWeight: weight, ...flat } = StyleSheet.flatten([variants[variant], style]) as TextStyle;
  return <RNText {...rest} style={[flat, { fontFamily: familyForWeight(weight) }]} />;
}
