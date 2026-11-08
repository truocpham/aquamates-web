import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSession } from '@/features/auth/hooks/useSession';

import { createEvent } from '../data/eventsApi';
import type { EventForm } from '../logic/eventForm';

export function useCreateEvent() {
  const qc = useQueryClient();
  const { session } = useSession();
  return useMutation({
    mutationFn: (f: EventForm) => createEvent(f, session!.user.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}
