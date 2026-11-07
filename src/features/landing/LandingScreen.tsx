import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { Logo, TopBar, WaveDivider } from '@/shared/brand';
import { t } from '@/shared/i18n';
import { Button, Card, Text, fontSize, spacing, useTheme } from '@/shared/ui';

const FEATURES = ['events', 'expenses', 'history'] as const;
const MAX_WIDTH = 1120;
const FEATURE_MIN_WIDTH = 220;
const HERO_LOGO_WIDTH = 280;

/**
 * Public landing page: top bar, centered hero with the full logo and tagline, wave divider,
 * three feature cards and a footer. The logo and waves are small inline SVG data URIs, so there
 * are no extra requests. The layout reflows with flex-wrap instead of reading the window width,
 * so the server-rendered HTML matches the first client render at 375, 768 and 1280.
 */
export function LandingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <ScrollView testID="landing" style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' }}>
        <TopBar />
      </View>
      <View style={{ width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.lg }}>
        <Logo variant="full" width={HERO_LOGO_WIDTH} />
        <Text variant="title" accessibilityRole="header" style={{ fontSize: fontSize.xxl, textAlign: 'center' }}>
          {t('landing.title')}
        </Text>
        <Text style={{ color: colors.muted, textAlign: 'center', maxWidth: 560 }}>{t('landing.subtitle')}</Text>
        <View style={{ minWidth: FEATURE_MIN_WIDTH }}>
          <Button title={t('landing.cta')} onPress={() => router.push('/sign-in')} />
        </View>
      </View>
      <WaveDivider />
      <View style={{ backgroundColor: colors.raised, alignItems: 'center', paddingBottom: spacing.xl }}>
        <View
          style={{ width: '100%', maxWidth: MAX_WIDTH, padding: spacing.xl, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }}
        >
          {FEATURES.map((f) => (
            <Card key={f} style={{ flexGrow: 1, flexBasis: FEATURE_MIN_WIDTH }}>
              <Text variant="heading">{t(`landing.feature.${f}.title`)}</Text>
              <Text style={{ color: colors.muted }}>{t(`landing.feature.${f}.body`)}</Text>
            </Card>
          ))}
        </View>
      </View>
      <View testID="landing-footer" style={{ backgroundColor: colors.raised }}>
        <WaveDivider fill="card" />
        <View style={{ backgroundColor: colors.card, alignItems: 'center', padding: spacing.xl }}>
          <Text variant="muted" style={{ textAlign: 'center' }}>
            {t('landing.footer')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
