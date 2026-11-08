import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { useSession } from '@/features/auth/hooks/useSession';
import { UpcomingList } from '@/features/events';
import { LandingScreen } from '@/features/landing/LandingScreen';
import { t } from '@/shared/i18n';
import { clearSessionHint } from '@/shared/preHydration';
import { Button, spacing } from '@/shared/ui';
import { HomeScreen } from '@/shared/ui/HomeScreen';

export default function Index() {
  const { status, signOut } = useSession();
  const router = useRouter();
  // Once the session is known, the pre-hydration hint (see app/+html.tsx) has done its job.
  useEffect(() => {
    if (status !== 'loading') clearSessionHint();
  }, [status]);
  // Signed-in members see home; everyone else (including while loading) gets the public landing page.
  if (status !== 'signedIn') return <LandingScreen />;
  return (
    <View style={{ flex: 1 }}>
      <HomeScreen>
        <View style={{ flex: 1, gap: spacing.md, padding: spacing.lg, width: '100%', maxWidth: 1100, alignSelf: 'center' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm }}>
            <Button title={t('tabs.dashboard')} variant="secondary" onPress={() => router.push('/dashboard')} />
            <Button title={t('tabs.history')} variant="secondary" onPress={() => router.push('/history')} />
            <Button title={t('home.newEvent')} onPress={() => router.push('/event/new')} />
          </View>
          <UpcomingList />
        </View>
      </HomeScreen>
      <View style={{ position: 'absolute', top: 16, right: 16 }}>
        <Button title={t('signIn.signOut')} variant="secondary" onPress={() => signOut('logout')} />
      </View>
    </View>
  );
}
