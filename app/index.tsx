import { View } from 'react-native';

import { useSession } from '@/features/auth/hooks/useSession';
import { LandingScreen } from '@/features/landing/LandingScreen';
import { t } from '@/shared/i18n';
import { Button } from '@/shared/ui';
import { HomeScreen } from '@/shared/ui/HomeScreen';

export default function Index() {
  const { status, signOut } = useSession();
  // Signed-in members see home; everyone else (including while loading) gets the public landing page.
  if (status !== 'signedIn') return <LandingScreen />;
  return (
    <View style={{ flex: 1 }}>
      <HomeScreen />
      <View style={{ position: 'absolute', top: 16, right: 16 }}>
        <Button title={t('signIn.signOut')} variant="secondary" onPress={() => signOut('logout')} />
      </View>
    </View>
  );
}
