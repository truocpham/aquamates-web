import { Pressable } from 'react-native';

import { Text } from './Text';
import { useTheme } from './ThemeProvider';
import { opacity, size, spacing } from './theme';

/** Tappable row of the Profile menu: a label on the card, danger rows in the danger text colour. */
export function MenuRow({
  title,
  onPress,
  disabled,
  tone = 'default',
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'default' | 'danger';
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{
        minHeight: size.control,
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        opacity: disabled ? opacity.disabled : 1,
      }}
    >
      <Text style={{ color: tone === 'danger' ? colors.dangerText : colors.text }}>{title}</Text>
    </Pressable>
  );
}
