import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateEvent } from '../data/eventsApi';
import type { EventForm } from '../logic/eventForm';

export function useUpdateEvent(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (f: EventForm) => updateEvent(id, f),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}
