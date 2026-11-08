import { t, useLanguage } from '@/shared/i18n';

import { useCreateEvent } from '../hooks/useCreateEvent';
import { EventFormView } from './EventFormView';

export function NewEventScreen({ onCreated }: { onCreated?: (id: string) => void }) {
  useLanguage();
  const create = useCreateEvent();
  return (
    <EventFormView
      heading={t('form.newHeading')}
      submitLabel={t('form.createButton')}
      pending={create.isPending}
      error={create.isError ? create.error.message : undefined}
      done={create.isSuccess ? t('form.created') : undefined}
      onSubmit={(f) => create.mutate(f, { onSuccess: (id) => onCreated?.(id) })}
    />
  );
}
