import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSession } from '@/features/auth/hooks/useSession';

import { setRsvp } from '../data/eventsApi';

export function useSetRsvp(eventId: string) {
  const qc = useQueryClient();
  const { session } = useSession();
  return useMutation({
    mutationFn: (status: 'going' | 'maybe' | 'not_going') => setRsvp(eventId, session!.user.id, status),
    onSettled: () => qc.invalidateQueries({ queryKey: ['events', eventId] }),
  });
}
