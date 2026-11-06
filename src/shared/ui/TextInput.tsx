import { useState } from 'react';
import { TextInput as RNTextInput, type TextInputProps } from 'react-native';

import { useTheme } from './ThemeProvider';
import { borderWidth, fontFamily, fontSize, radius, spacing } from './theme';

export function TextInput({ style, onFocus, onBlur, ...rest }: TextInputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <RNTextInput
      placeholderTextColor={colors.muted}
      {...rest}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={[
        {
          borderWidth: borderWidth.hairline,
          borderColor: focused ? colors.brand : colors.border,
          borderRadius: radius.input,
          backgroundColor: colors.raised,
          color: colors.text,
          fontFamily: fontFamily.regular,
          fontSize: fontSize.md,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.md,
        },
        style,
      ]}
    />
  );
}
