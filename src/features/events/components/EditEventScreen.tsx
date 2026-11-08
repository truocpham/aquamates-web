import { useMembership } from '@/features/auth/hooks/useMembership';
import { useSession } from '@/features/auth/hooks/useSession';
import { t, useLanguage } from '@/shared/i18n';
import { Text } from '@/shared/ui';

import { useEvent } from '../hooks/useEvent';
import { useUpdateEvent } from '../hooks/useUpdateEvent';
import { toForm } from '../logic/eventForm';
import { EventFormView } from './EventFormView';

export function EditEventScreen({ id, onSaved }: { id: string; onSaved?: () => void }) {
  useLanguage();
  const { data: e, isPending, isError, error } = useEvent(id);
  const update = useUpdateEvent(id);
  const { session } = useSession();
  const { data: membership, isPending: memberPending } = useMembership();
  if (isPending || memberPending) return <Text variant="muted">{t('common.loading')}</Text>;
  if (isError) return <Text variant="error" accessibilityRole="alert">{error.message}</Text>;
  const manager = membership?.role === 'admin' || e.creator_id === session?.user.id;
  if (!manager || e.cancelled_at || new Date(e.starts_at) <= new Date()) {
    return <Text variant="error" accessibilityRole="alert">{t('event.editBlocked')}</Text>;
  }
  return (
    <EventFormView
      heading={t('form.editHeading')}
      submitLabel={t('form.saveChanges')}
      initial={toForm(e)}
      pending={update.isPending}
      error={update.isError ? update.error.message : undefined}
      onSubmit={(f) => update.mutate(f, { onSuccess: () => onSaved?.() })}
    />
  );
}
