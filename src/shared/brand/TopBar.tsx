import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '../ui/Text';
import { spacing } from '../ui/theme';
import { Logo } from './Logo';

/** Width from which the wordmark joins the mark; the media query in app/+html.tsx uses the same value. */
export const WORDMARK_MIN_WIDTH = 768;

/**
 * Top bar: the mark, plus the T-MEN wordmark at 768 px and up. The wordmark is always rendered and
 * hidden below 768 px by a CSS rule in app/+html.tsx, so the prerendered HTML and the first client
 * render are identical at every width. `right` holds screen actions.
 */
export function TopBar({ right }: { right?: ReactNode }) {
  return (
    <View
      testID="top-bar"
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, width: '100%' }}
    >
      <Logo variant="mark" width={48} />
      <Text testID="top-bar-wordmark" variant="heading">
        T-MEN
      </Text>
      <View style={{ flex: 1 }} />
      {right}
    </View>
  );
}
