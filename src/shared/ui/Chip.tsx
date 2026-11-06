import { Pressable } from 'react-native';

import { Text } from './Text';
import { useTheme } from './ThemeProvider';
import { borderWidth, opacity, radius, spacing } from './theme';

export function Chip({ label, selected, disabled, onPress }: { label: string; selected?: boolean; disabled?: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        borderWidth: borderWidth.hairline,
        borderColor: selected ? colors.accentBorder : colors.border,
        backgroundColor: selected ? colors.accent : colors.card,
        opacity: disabled ? opacity.disabled : 1,
      }}
    >
      <Text style={selected ? { color: colors.onAccent } : undefined}>{label}</Text>
    </Pressable>
  );
}
