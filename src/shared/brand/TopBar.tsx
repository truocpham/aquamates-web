import type { ReactNode } from 'react';
import { View, useWindowDimensions } from 'react-native';

import { Text } from '../ui/Text';
import { spacing } from '../ui/theme';
import { Logo } from './Logo';

/** Width from which the wordmark joins the mark. */
export const WORDMARK_MIN_WIDTH = 768;

/** Top bar: the mark, plus the T-MEN wordmark at 768 px and up. `right` holds screen actions. */
export function TopBar({ right }: { right?: ReactNode }) {
  const { width } = useWindowDimensions();
  const wide = width >= WORDMARK_MIN_WIDTH;
  return (
    <View
      testID="top-bar"
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, width: '100%' }}
    >
      <Logo variant="mark" width={48} />
      {wide ? (
        <Text testID="top-bar-wordmark" variant="heading">
          T-MEN
        </Text>
      ) : null}
      <View style={{ flex: 1 }} />
      {right}
    </View>
  );
}
