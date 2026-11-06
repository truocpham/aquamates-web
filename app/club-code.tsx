import { View } from 'react-native';

import { useSession } from '@/features/auth/hooks/useSession';
import { t } from '@/shared/i18n';
import { Button, Text, useTheme } from '@/shared/ui';

// Placeholder target for members without a club; the enter/create flow is a separate ticket.
export default function ClubCode() {
  const { colors } = useTheme();
  const { signOut } = useSession();
  return (
    <View testID="club-code" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: colors.bg }}>
      <Text>{t('clubCode.enter')}</Text>
      <Button title={t('signIn.signOut')} variant="secondary" onPress={() => signOut('logout')} />
    </View>
  );
}
