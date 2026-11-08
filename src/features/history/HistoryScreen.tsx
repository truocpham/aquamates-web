import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView } from 'react-native';

import { useSession } from '@/features/auth/hooks/useSession';
import { formatDateTime, t, useLanguage } from '@/shared/i18n';
import { loadSupabase } from '@/shared/lazySupabase';
import { Button, Card, Text, useTheme, spacing } from '@/shared/ui';

import { toHistory, type HistoryEvent } from './historyLogic';

async function fetchPast(): Promise<HistoryEvent[]> {
  const { data, error } = await (await loadSupabase())
    .from('events')
    .select('id, category, title, location, starts_at, cancelled_at, creator_id, rsvps(user_id, status)')
    .lt('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: false });
  if (error) throw new Error(t('error.history'));
  return data as unknown as HistoryEvent[];
}

export function HistoryScreen() {
  useLanguage();
  const { colors } = useTheme();
  const { session } = useSession();
  const uid = session?.user.id ?? '';
  const q = useQuery({ queryKey: ['history', uid], queryFn: fetchPast, enabled: !!uid });
  const rows = q.data ? toHistory(q.data, uid) : [];
  if (q.isPending) return <ActivityIndicator accessibilityLabel={t('history.loading')} color={colors.brand} />;
  if (q.isError)
    return (
      <Card>
        <Text>{t('error.history')}</Text>
        <Button title={t('common.retry')} variant="secondary" onPress={() => q.refetch()} />
      </Card>
    );
  if (rows.length === 0)
    return (
      <Card>
        <Text variant="heading">{t('history.empty')}</Text>
        <Text variant="muted">{t('history.emptyHint')}</Text>
      </Card>
    );
  return (
    <ScrollView contentContainerStyle={{ gap: spacing.md }}>
      {rows.map((e) => (
        <Link key={e.id} href={`/event/${e.id}`} asChild>
          <Pressable accessibilityRole="link">
            <Card category={e.category}>
              <Text variant="heading">{e.title}</Text>
              <Text variant="muted">
                {formatDateTime(e.starts_at)}
                {e.location ? ` · ${e.location}` : ''}
              </Text>
              <Text>{t(`history.status.${e.status}`)}</Text>
            </Card>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}
