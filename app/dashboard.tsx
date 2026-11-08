import { View } from 'react-native';

import { DashboardScreen } from '@/features/dashboard/DashboardScreen';
import { TopBar } from '@/shared/brand';
import { Screen, spacing } from '@/shared/ui';

export default function Dashboard() {
  return (
    <Screen>
      <TopBar />
      <View style={{ flex: 1, padding: spacing.lg, width: '100%', maxWidth: 1100, alignSelf: 'center' }}>
        <DashboardScreen />
      </View>
    </Screen>
  );
}
