import type { ReactNode } from 'react';
import { View } from 'react-native';

import { TopBar } from '../brand';
import { Text } from './Text';
import { useTheme } from './ThemeProvider';

export function HomeScreen({ children }: { children?: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View testID="home" style={{ flex: 1, backgroundColor: colors.bg }}>
      <TopBar />
      {children ?? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>T-MEN</Text>
        </View>
      )}
    </View>
  );
}
