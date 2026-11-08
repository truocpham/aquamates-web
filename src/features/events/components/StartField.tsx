import { createElement } from 'react';
import { Platform } from 'react-native';

import { TextInput, borderWidth, fontFamily, fontSize, radius, spacing, useTheme } from '@/shared/ui';

type Props = { label: string; value: string; onChange: (v: string) => void };

/** Native date and time input on web (value "YYYY-MM-DDTHH:mm", device-local); plain text elsewhere. */
export function StartField({ label, value, onChange }: Props) {
  const { colors } = useTheme();
  if (Platform.OS !== 'web') return <TextInput accessibilityLabel={label} value={value} onChangeText={onChange} autoCapitalize="none" />;
  return createElement('input', {
    type: 'datetime-local',
    'aria-label': label,
    value,
    onChange: (e: { target: { value: string } }) => onChange(e.target.value),
    style: {
      border: `${borderWidth.hairline}px solid ${colors.border}`,
      borderRadius: radius.input,
      background: colors.raised,
      color: colors.text,
      fontFamily: fontFamily.regular,
      fontSize: fontSize.md,
      padding: spacing.md,
    },
  });
}
