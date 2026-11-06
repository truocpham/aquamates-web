import { Pressable } from 'react-native';

import { Text } from './Text';
import { useTheme } from './ThemeProvider';
import { borderWidth, fontWeight, opacity, radius, spacing } from './theme';

export function Button({
  title,
  onPress,
  disabled,
  variant = 'primary',
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const { colors } = useTheme();
  const primary = variant === 'primary';
  const outline = variant === 'danger' ? colors.dangerText : colors.brand;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.pill,
        alignItems: 'center',
        borderWidth: borderWidth.hairline,
        borderColor: primary ? colors.accentBorder : outline,
        backgroundColor: primary ? colors.accent : 'transparent',
        opacity: disabled ? opacity.disabled : 1,
      }}
    >
      <Text style={{ color: primary ? colors.onAccent : outline, fontWeight: primary ? fontWeight.bold : fontWeight.semibold }}>{title}</Text>
    </Pressable>
  );
}
