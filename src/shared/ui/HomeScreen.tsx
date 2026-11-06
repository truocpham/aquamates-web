import { View } from 'react-native';

import { Text } from './Text';
import { useTheme } from './ThemeProvider';

export function HomeScreen() {
  const { colors } = useTheme();
  return (
    <View testID="home" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <Text>AquaMates</Text>
    </View>
  );
}
