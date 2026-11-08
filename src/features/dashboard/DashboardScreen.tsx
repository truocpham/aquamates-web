import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';

import { useSession } from '@/features/auth/hooks/useSession';
import { t, useLanguage } from '@/shared/i18n';
import { loadSupabase } from '@/shared/lazySupabase';
import { Button, Card, Chip, Text, useTheme, radius, size, spacing } from '@/shared/ui';

import { computeParticipation, type Period } from './logic/participation';
import { computeTotals, type PastEvent } from './logic/totals';

async function fetchPastEvents(): Promise<PastEvent[]> {
  const { data, error } = await (await loadSupabase())
    .from('events')
    .select('category, starts_at, cancelled_at, rsvps(user_id, status)')
    .is('cancelled_at', null)
    .lte('starts_at', new Date().toISOString());
  if (error) throw new Error(t('error.dashboard'));
  return data as unknown as PastEvent[];
}

export function DashboardScreen() {
  useLanguage();
  const { colors } = useTheme();
  const [period, setPeriod] = useState<Period>('week');
  const userId = useSession().session?.user.id ?? '';
  const q = useQuery({ queryKey: ['dashboard', 'totals'], queryFn: fetchPastEvents });
  if (q.isPending) return <ActivityIndicator accessibilityLabel={t('dashboard.loading')} color={colors.brand} />;
  if (q.isError)
    return (
      <Card>
        <Text>{t('error.dashboard')}</Text>
        <Button title={t('common.retry')} variant="secondary" onPress={() => q.refetch()} />
      </Card>
    );
  const totals = computeTotals(q.data, userId);
  const bars = computeParticipation(q.data, userId, period);
  const max = Math.max(1, ...bars.map((b) => b.count));
  return (
    <ScrollView contentContainerStyle={{ gap: spacing.md }}>
      <Card>
        <Text variant="heading">{t('dashboard.totals')}</Text>
        <Text>{t('dashboard.swimming', { n: totals.swimming })}</Text>
        <Text>{t('dashboard.beerSocial', { n: totals.beerSocial })}</Text>
        <Text>{t('dashboard.attended', { n: totals.attended })}</Text>
      </Card>
      <Card>
        <Text variant="heading">{t('dashboard.participation')}</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {(['week', 'month', 'quarter', 'year'] as const).map((p) => (
            <Chip key={p} label={t(`period.${p}`)} selected={p === period} onPress={() => setPeriod(p)} />
          ))}
        </View>
        {bars.map((b) => (
          <View key={b.start} style={{ gap: spacing.xs }}>
            <Text variant="muted">{`${b.start}: ${b.count}`}</Text>
            <View
              style={{
                height: size.bar,
                width: `${(b.count / max) * 100}%`,
                backgroundColor: colors.brand,
                borderRadius: radius.md,
              }}
            />
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}
