import { useState } from 'react';
import { View } from 'react-native';

import { TopBar } from '@/shared/brand';
import { setLanguage, t, useLanguage, type Language } from '@/shared/i18n';
import { Button, Card, Chip, Screen, Text, TextInput, spacing, useTheme } from '@/shared/ui';
import type { ThemeChoice } from '@/shared/ui/theme';

import { useProfile, useUpdateDisplayName } from '../hooks/useMembership';
import { validDisplayName } from '../logic/authLogic';

const LANGUAGES: Language[] = ['en', 'vi'];
const THEMES: ThemeChoice[] = ['system', 'light', 'dark'];

/** Settings: edit profile name, choose language and theme (same options as mobile). */
export function SettingsScreen() {
  const language = useLanguage();
  const { choice, setChoice } = useTheme();
  const profile = useProfile();
  const update = useUpdateDisplayName();
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? profile.data?.display_name ?? '';
  const name = validDisplayName(value);

  return (
    <View testID="settings" style={{ flex: 1 }}>
      <TopBar />
      <Screen edges={[]}>
        <View style={{ gap: spacing.lg, paddingVertical: spacing.lg }}>
          <Text variant="heading" accessibilityRole="header">
            {t('settings.title')}
          </Text>
          <Card>
            <TextInput accessibilityLabel={t('profile.nameLabel')} value={value} onChangeText={setDraft} maxLength={50} />
            {name ? null : <Text variant="error">{t('profile.nameInvalid')}</Text>}
            {profile.isError ? <Text variant="error">{t('error.profile')}</Text> : null}
            {update.isError ? <Text variant="error">{update.error.message}</Text> : null}
            <Button
              title={t('profile.saveName')}
              disabled={!name || update.isPending || name === profile.data?.display_name}
              onPress={() => name && update.mutate(name, { onSuccess: () => setDraft(null) })}
            />
          </Card>
          <Card>
            <Text variant="muted" accessibilityRole="header">
              {t('settings.language')}
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {LANGUAGES.map((l) => (
                <Chip key={l} label={t(`settings.language.${l}`)} selected={language === l} onPress={() => void setLanguage(l)} />
              ))}
            </View>
          </Card>
          <Card>
            <Text variant="muted" accessibilityRole="header">
              {t('settings.theme')}
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {THEMES.map((c) => (
                <Chip key={c} label={t(`settings.theme.${c}`)} selected={choice === c} onPress={() => void setChoice(c)} />
              ))}
            </View>
          </Card>
        </View>
      </Screen>
    </View>
  );
}
