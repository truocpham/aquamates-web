import { View } from 'react-native';

import { useSession } from '@/features/auth/hooks/useSession';
import { t } from '@/shared/i18n';
import { Button } from '@/shared/ui';
import { HomeScreen } from '@/shared/ui/HomeScreen';

export default function Index() {
  const { signOut } = useSession();
  return (
    <View style={{ flex: 1 }}>
      <HomeScreen />
      <View style={{ position: 'absolute', top: 16, right: 16 }}>
        <Button title={t('signIn.signOut')} variant="secondary" onPress={() => signOut('logout')} />
      </View>
    </View>
  );
}
