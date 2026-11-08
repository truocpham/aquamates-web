import { useMutation, useQueryClient } from '@tanstack/react-query';

import { cancelEvent } from '../data/eventsApi';

export function useCancelEvent(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => cancelEvent(eventId),
    onSettled: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}
