import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { formatDateTime, t, useLanguage } from '@/shared/i18n';
import { Button, Card, Chip, Text, useTheme, spacing } from '@/shared/ui';

import { fetchUpcoming } from '../data/eventsApi';
import { CHIPS, filterUpcoming, type Chip as ChipKey } from '../logic/upcoming';

export function UpcomingList() {
  useLanguage();
  const { colors } = useTheme();
  const [chip, setChip] = useState<ChipKey>('all');
  const q = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: fetchUpcoming,
  });
  const rows = q.data ? filterUpcoming(q.data, chip) : [];
  return (
    <View style={{ flex: 1, gap: spacing.md }}>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {CHIPS.map((c) => (
          <Chip key={c.key} label={t(`filter.${c.key}`)} selected={chip === c.key} onPress={() => setChip(c.key)} />
        ))}
      </View>
      {q.isPending ? (
        <ActivityIndicator accessibilityLabel={t('events.loading')} color={colors.brand} />
      ) : q.isError ? (
        <Card>
          <Text>{t('error.events')}</Text>
          <Button title={t('common.retry')} variant="secondary" onPress={() => q.refetch()} />
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <Text variant="heading">{t('events.empty')}</Text>
          <Text variant="muted">{t('events.emptyHint')}</Text>
        </Card>
      ) : (
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
                </Card>
              </Pressable>
            </Link>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
