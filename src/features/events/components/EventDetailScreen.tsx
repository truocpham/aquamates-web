import { Link } from 'expo-router';
import { ScrollView, View, useWindowDimensions } from 'react-native';

import { useMembership } from '@/features/auth/hooks/useMembership';
import { useSession } from '@/features/auth/hooks/useSession';
import { ExpensePanel } from '@/features/expenses';
import { formatDateTime, t, useLanguage } from '@/shared/i18n';
import { Avatar, Button, Card, Chip, Text, fontFamily, fontSize, spacing, useTheme } from '@/shared/ui';

import { useCancelEvent } from '../hooks/useCancelEvent';
import { useEvent } from '../hooks/useEvent';
import { useSetRsvp } from '../hooks/useSetRsvp';

const STATUSES = ['going', 'maybe', 'not_going'] as const;
/** Desktop width from which event info and RSVP sit in two columns (docs/design/web-figma.md). */
const TWO_COLUMNS_MIN_WIDTH = 1280;

export function EventDetailScreen({ id }: { id: string }) {
  useLanguage();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { data: e, isPending, isError, error } = useEvent(id);
  const { session } = useSession();
  const rsvp = useSetRsvp(id);
  const cancel = useCancelEvent(id);
  const { data: membership } = useMembership();
  if (isPending) return <Text variant="muted">{t('common.loading')}</Text>;
  if (isError) return <Text variant="error" accessibilityRole="alert">{error.message}</Text>;
  const locked = !!e.cancelled_at || new Date(e.starts_at) <= new Date();
  const manager = membership?.role === 'admin' || e.creator_id === session?.user.id;
  const canCancel = !e.cancelled_at && manager;
  const canEdit = !locked && manager;
  const mine = e.rsvps.find((r) => r.user_id === session?.user.id)?.status;
  const info = (
    <View style={{ flex: 1, gap: spacing.md }}>
      <Card category={e.category}>
        <Text>{t('event.category', { value: t(`category.${e.category}`) })}</Text>
        <Text>{t('event.starts', { value: formatDateTime(e.starts_at) })}</Text>
        <Text>{t('event.location', { value: e.location ?? '' })}</Text>
        <Text variant="muted">{t('event.createdBy', { name: e.creator?.display_name ?? t('common.unknown') })}</Text>
        <Text>{e.description}</Text>
        {e.notes ? <Text>{t('event.notes', { value: e.notes })}</Text> : null}
      </Card>
      {canEdit ? (
        <Link href={{ pathname: '/event/edit/[id]', params: { id } }} style={{ color: colors.brand, fontSize: fontSize.md, fontFamily: fontFamily.semibold }}>
          {t('event.edit')}
        </Link>
      ) : null}
      {canCancel ? <Button title={t('event.cancel')} variant="danger" disabled={cancel.isPending} onPress={() => cancel.mutate()} /> : null}
      {cancel.isError ? <Text variant="error" accessibilityRole="alert">{cancel.error.message}</Text> : null}
    </View>
  );
  const respond = (
    <View style={{ flex: 1, gap: spacing.md }}>
      <Text variant="heading">{t('event.yourRsvp')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {STATUSES.map((s) => (
          <Chip key={s} label={t('event.rsvp', { status: t(`rsvp.${s}`) })} selected={mine === s} disabled={locked || rsvp.isPending} onPress={() => rsvp.mutate(s)} />
        ))}
      </View>
      {locked ? <Text variant="muted">{t('event.rsvpClosed')}</Text> : null}
      {rsvp.isError ? <Text variant="error" accessibilityRole="alert">{rsvp.error.message}</Text> : null}
      <ExpensePanel eventId={id} creatorId={e.creator_id} going={e.rsvps.filter((r) => r.status === 'going').length} />
      <Text variant="heading">{t('event.participants')}</Text>
      <Card>
        {e.rsvps.length === 0 ? <Text variant="muted">{t('event.noResponses')}</Text> : null}
        {e.rsvps.map((r) => (
          <View key={r.user_id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Avatar name={r.profile?.display_name ?? t('common.member')} url={r.profile?.avatar_url} />
            <Text style={{ flex: 1 }}>{r.profile?.display_name ?? t('common.member')}</Text>
            <Text variant="muted">{t(`rsvp.${r.status}`)}</Text>
          </View>
        ))}
      </Card>
    </View>
  );
  return (
    <ScrollView contentContainerStyle={{ paddingVertical: spacing.lg, gap: spacing.md, width: '100%', maxWidth: 1100, alignSelf: 'center' }}>
      <Text variant="title">{e.title}</Text>
      {e.cancelled_at ? <Text variant="error">{t('event.cancelled')}</Text> : null}
      <View style={{ flexDirection: width >= TWO_COLUMNS_MIN_WIDTH ? 'row' : 'column', gap: spacing.xl }}>
        {info}
        {respond}
      </View>
    </ScrollView>
  );
}
