import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';

import { useProfile } from '@/features/auth/hooks/useMembership';
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

/** Tinted pill card: icon chip, one big number, label. */
function StatCard({ icon, tone, n, label }: { icon: string; tone: string; n: number; label: string }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexGrow: 1,
        flexBasis: 150,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.lg,
        borderRadius: radius.round,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: `${tone}22`,
      }}
    >
      <View
        style={{ width: size.control, height: size.control, borderRadius: size.control / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: `${tone}33` }}
      >
        <Text accessibilityElementsHidden importantForAccessibility="no">{icon}</Text>
      </View>
      <View style={{ flexShrink: 1 }}>
        <Text variant="display" style={{ color: tone }}>{n}</Text>
        <Text variant="muted">{label}</Text>
      </View>
    </View>
  );
}

export function DashboardScreen() {
  useLanguage();
  const router = useRouter();
  const name = useProfile().data?.display_name;
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
  const empty = totals.swimming + totals.beerSocial === 0;
  const barTones = [colors.swimming, colors.beer_social, colors.success];
  const max = Math.max(1, ...bars.map((b) => b.count));
  return (
    <ScrollView contentContainerStyle={{ gap: spacing.md }}>
      <View style={{ gap: spacing.xs }}>
        <Text variant="title">{name ? t('dashboard.greeting', { name }) : t('dashboard.greetingAnon')}</Text>
        {empty ? null : <Text variant="muted">{t('dashboard.summary', { n: totals.attended })}</Text>}
      </View>
      {empty ? (
        <Card style={{ alignItems: 'center', borderRadius: radius.round, padding: spacing.xl }}>
          <Text variant="display">🏊</Text>
          <Text variant="heading">{t('dashboard.emptyTitle')}</Text>
          <Text variant="muted">{t('dashboard.emptyBody')}</Text>
          <Button title={t('dashboard.emptyCta')} onPress={() => router.push('/')} />
        </Card>
      ) : (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
            <StatCard icon="🏊" tone={colors.swimming} n={totals.swimming} label={t('dashboard.swimming')} />
            <StatCard icon="🍻" tone={colors.beer_social} n={totals.beerSocial} label={t('dashboard.beerSocial')} />
            <StatCard icon="🎉" tone={colors.success} n={totals.attended} label={t('dashboard.attended')} />
          </View>
      <Card>
        <Text variant="heading">{t('dashboard.participation')}</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {(['week', 'month', 'quarter', 'year'] as const).map((p) => (
            <Chip key={p} label={t(`period.${p}`)} selected={p === period} onPress={() => setPeriod(p)} />
          ))}
        </View>
        {bars.map((b, i) => (
          <View key={b.start} style={{ gap: spacing.xs }}>
            <Text variant="muted">{`${b.start}: ${b.count}`}</Text>
            <View
              style={{
                height: size.bar,
                width: `${(b.count / max) * 100}%`,
                backgroundColor: barTones[i % barTones.length],
                borderRadius: radius.md,
              }}
            />
          </View>
        ))}
      </Card>
        </>
      )}
    </ScrollView>
  );
}
