import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { View } from 'react-native';

import { Logo, TopBar } from '@/shared/brand';
import { t, useLanguage } from '@/shared/i18n';
import { Button, Screen, spacing, Text, TextInput } from '@/shared/ui';

import { signInWithFacebook, signInWithMagicLink } from '../data/authApi';
import { reasonMessage, validEmail } from '../logic/authLogic';

export function SignInScreen({ reason }: { reason?: string }) {
  useLanguage();
  const [email, setEmail] = useState('');
  const [invalid, setInvalid] = useState(false);
  const facebook = useMutation({ mutationFn: signInWithFacebook });
  const magic = useMutation({ mutationFn: signInWithMagicLink });
  const pending = facebook.isPending || magic.isPending;
  const message = facebook.isError ? reasonMessage('failed') : reasonMessage(reason);

  const sendLink = () => {
    const valid = validEmail(email);
    setInvalid(!valid);
    if (valid) magic.mutate(valid);
  };

  return (
    <Screen>
      <TopBar />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: '100%', maxWidth: 400, gap: spacing.lg }}>
          <View style={{ alignItems: 'center', paddingBottom: spacing.lg }}>
            <Logo variant="full" width={150} />
          </View>
          {message ? (
            <Text variant="error" accessibilityRole="alert">
              {message}
            </Text>
          ) : null}
          <Button title={t('signIn.facebook')} onPress={() => facebook.mutate()} disabled={pending} />
          <View accessibilityLabel={t('signIn.appleSoon')} style={{ gap: spacing.xs }}>
            <Button title={t('signIn.apple')} variant="secondary" onPress={() => {}} disabled />
            <Text variant="muted" style={{ textAlign: 'center' }}>
              {t('signIn.appleSoon')}
            </Text>
          </View>
          <Text variant="muted" style={{ textAlign: 'center' }}>
            {t('signIn.or')}
          </Text>
          {magic.isSuccess ? (
            <View style={{ gap: spacing.md }}>
              <Text accessibilityRole="alert">{t('signIn.magicLink.sent', { email: validEmail(email) ?? email })}</Text>
              <Button title={t('signIn.magicLink.another')} variant="secondary" onPress={() => magic.reset()} />
            </View>
          ) : (
            <View style={{ gap: spacing.md }}>
              <Text variant="muted">{t('signIn.email.label')}</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                editable={!pending}
                accessibilityLabel={t('signIn.email.label')}
                onSubmitEditing={sendLink}
              />
              {invalid ? (
                <Text variant="error" accessibilityRole="alert">
                  {t('signIn.magicLink.invalid')}
                </Text>
              ) : null}
              {magic.isError ? (
                <Text variant="error" accessibilityRole="alert">
                  {t('signIn.magicLink.error')}
                </Text>
              ) : null}
              <Button
                title={magic.isPending ? t('signIn.magicLink.sending') : t('signIn.magicLink.send')}
                onPress={sendLink}
                disabled={pending}
              />
            </View>
          )}
        </View>
      </View>
    </Screen>
  );
}
