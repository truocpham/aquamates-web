import { View } from 'react-native';

import { HistoryScreen } from '@/features/history/HistoryScreen';
import { TopBar } from '@/shared/brand';
import { Screen, spacing } from '@/shared/ui';

export default function History() {
  return (
    <Screen>
      <TopBar />
      <View style={{ flex: 1, padding: spacing.lg, width: '100%', maxWidth: 1100, alignSelf: 'center' }}>
        <HistoryScreen />
      </View>
    </Screen>
  );
}
