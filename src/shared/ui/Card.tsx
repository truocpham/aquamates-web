import { View, type ViewProps } from 'react-native';

import { useTheme } from './ThemeProvider';
import { borderWidth, radius, spacing } from './theme';

/** Raised card; `category` adds the 4px left bar in that category's colour. */
export function Card({ style, category, ...rest }: ViewProps & { category?: 'swimming' | 'beer_social' }) {
  const { colors } = useTheme();
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: colors.raised,
          borderRadius: radius.card,
          borderWidth: borderWidth.hairline,
          borderColor: colors.border,
          padding: spacing.lg,
          gap: spacing.sm,
        },
        category ? { borderLeftWidth: borderWidth.accent, borderLeftColor: colors[category] } : null,
        style,
      ]}
    />
  );
}
