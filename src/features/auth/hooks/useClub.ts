import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { bootstrapClub, clubExists, joinClub } from '../data/authApi';
import { useSession } from './useSession';

export function useClubExists() {
  const { status } = useSession();
  return useQuery({ queryKey: ['auth', 'clubExists'], queryFn: clubExists, enabled: status === 'signedIn' });
}

function useClubMutation(fn: (code: string) => Promise<void>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth', 'membership'] }),
  });
}

export const useBootstrapClub = () => useClubMutation(bootstrapClub);
export const useJoinClub = () => useClubMutation(joinClub);
