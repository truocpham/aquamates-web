import { View } from 'react-native';

import { useSession } from '@/features/auth/hooks/useSession';
import { LandingScreen } from '@/features/landing/LandingScreen';
import { t } from '@/shared/i18n';
import { Button, useTheme } from '@/shared/ui';
import { HomeScreen } from '@/shared/ui/HomeScreen';

export default function Index() {
  const { status, signOut } = useSession();
  const { colors } = useTheme();
  // Session unknown: neutral themed splash, no landing content, so signed-in members never see a flash of it.
  if (status === 'loading') return <View testID="splash" style={{ flex: 1, backgroundColor: colors.bg }} />;
  if (status === 'signedOut') return <LandingScreen />;
  return (
    <View style={{ flex: 1 }}>
      <HomeScreen />
      <View style={{ position: 'absolute', top: 16, right: 16 }}>
        <Button title={t('signIn.signOut')} variant="secondary" onPress={() => signOut('logout')} />
      </View>
    </View>
  );
}
