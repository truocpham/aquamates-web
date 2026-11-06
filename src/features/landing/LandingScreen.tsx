import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { t } from '@/shared/i18n';
import { Button, Card, Text, fontSize, spacing, useTheme } from '@/shared/ui';

const FEATURES = ['events', 'expenses', 'history'] as const;
const MAX_WIDTH = 1120;
const FEATURE_MIN_WIDTH = 220;

/**
 * Public landing page: text only, no images, so it stays light. The layout reflows with
 * flex-wrap instead of reading the window width, so the server-rendered HTML matches the
 * first client render at 375, 768 and 1280.
 */
export function LandingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <ScrollView testID="landing" style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}>
      <View style={{ width: '100%', maxWidth: MAX_WIDTH, padding: spacing.xl, gap: spacing.xl }}>
        <Text style={{ color: colors.brand }} variant="heading" accessibilityRole="header">
          AquaMates
        </Text>
        <View style={{ gap: spacing.lg, paddingVertical: spacing.xl }}>
          <Text variant="title" accessibilityRole="header" style={{ fontSize: fontSize.xxl }}>
            {t('landing.title')}
          </Text>
          <Text style={{ color: colors.muted }}>{t('landing.subtitle')}</Text>
          <View style={{ alignSelf: 'flex-start', minWidth: FEATURE_MIN_WIDTH }}>
            <Button title={t('landing.cta')} onPress={() => router.push('/sign-in')} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }}>
          {FEATURES.map((f) => (
            <Card key={f} style={{ flexGrow: 1, flexBasis: FEATURE_MIN_WIDTH }}>
              <Text variant="heading">{t(`landing.feature.${f}.title`)}</Text>
              <Text style={{ color: colors.muted }}>{t(`landing.feature.${f}.body`)}</Text>
            </Card>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
