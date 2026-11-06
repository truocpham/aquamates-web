import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { callbackFailed } from '@/features/auth/logic/authLogic';
import { t } from '@/shared/i18n';
import { Text, useTheme } from '@/shared/ui';

/**
 * Landing page of the Facebook and magic-link redirects. supabase-js (detectSessionInUrl) exchanges the code in the
 * URL for a session; AuthGate then moves a signed-in member on to home or the club code screen.
 */
export default function AuthCallback() {
  const { colors } = useTheme();
  const loc = globalThis.location;
  if (loc && callbackFailed(loc.search, loc.hash)) return <Redirect href="/sign-in?reason=failed" />;
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <Text>{t('signIn.completing')}</Text>
    </View>
  );
}
