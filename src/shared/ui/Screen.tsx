import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from './ThemeProvider';
import { spacing } from './theme';

/** Safe-area wrapper. Inside the tab bar pass `edges={['top']}`: the bar covers the bottom. */
export function Screen({ children, edges = ['top', 'bottom'] }: { children: ReactNode; edges?: ('top' | 'bottom')[] }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        paddingTop: edges.includes('top') ? insets.top : 0,
        paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
        paddingHorizontal: spacing.lg,
      }}
    >
      {children}
    </View>
  );
}
