import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { t, useLanguage } from '@/shared/i18n';
import { Button, Card, Screen, spacing, Text, TextInput } from '@/shared/ui';

import { useBootstrapClub, useClubExists, useJoinClub } from '../hooks/useClub';
import { useSession } from '../hooks/useSession';
import { MIN_CODE_LENGTH, parseRpcError } from '../logic/authLogic';

const centered = { flex: 1, alignItems: 'center', justifyContent: 'center' } as const;
const cardStyle = { width: '100%', maxWidth: 440, gap: spacing.lg } as const;

export function ClubCodeScreen() {
  useLanguage();
  const router = useRouter();
  const exists = useClubExists();
  const bootstrap = useBootstrapClub();
  const join = useJoinClub();
  const { signOut } = useSession();
  const qc = useQueryClient();
  const [code, setCode] = useState('');

  const creating = exists.data === false;
  const mutation = creating ? bootstrap : join;
  const reason = mutation.isError ? parseRpcError(mutation.error) : null;
  const lost = bootstrap.isError && parseRpcError(bootstrap.error) === 'club_exists';

  useEffect(() => {
    if (reason === 'removed') void signOut('removed');
    // Lost the first-admin race: the club exists now, so show the join form.
    if (reason === 'club_exists') void qc.invalidateQueries({ queryKey: ['auth', 'clubExists'] });
  }, [reason, signOut, qc]);

  const submit = () => mutation.mutate(code, { onSuccess: () => router.replace('/' as never) });

  if (exists.isPending) {
    return (
      <Screen>
        <View style={centered}>
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  if (exists.isError) {
    return (
      <Screen>
        <View style={centered}>
          <Card style={cardStyle}>
            <Text variant="error" accessibilityRole="alert">
              {t('error.club')}
            </Text>
            <Button title={t('common.retry')} onPress={() => exists.refetch()} />
          </Card>
        </View>
      </Screen>
    );
  }

  const tooShort = creating && code.length < MIN_CODE_LENGTH;
  const message =
    reason === 'bad_code'
      ? t('clubCode.wrong')
      : reason === 'unknown'
        ? t('clubCode.connection')
        : lost && !creating
          ? t('clubCode.justCreated')
          : null;

  return (
    <Screen>
      <View style={centered}>
        <Card testID={creating ? 'create-club-card' : 'join-club-card'} style={cardStyle}>
          <Text variant="title">{creating ? t('clubCode.create') : t('clubCode.enter')}</Text>
          {creating ? <Text>{t('clubCode.firstMember', { min: MIN_CODE_LENGTH })}</Text> : null}
          <TextInput
            accessibilityLabel={t('clubCode.label')}
            value={code}
            onChangeText={setCode}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!mutation.isPending}
            onSubmitEditing={() => {
              if (code && !tooShort && !mutation.isPending) submit();
            }}
          />
          {message ? (
            <Text variant="error" accessibilityRole="alert">
              {message}
            </Text>
          ) : null}
          <Button
            title={creating ? t('clubCode.createButton') : t('clubCode.joinButton')}
            disabled={tooShort || !code || mutation.isPending}
            onPress={submit}
          />
          <Button title={t('signIn.signOut')} variant="secondary" onPress={() => signOut('logout')} />
        </Card>
      </View>
    </Screen>
  );
}
