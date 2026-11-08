import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getMembership, getProfile, updateDisplayName } from '../data/authApi';
import { useSession } from './useSession';

export function useMembership() {
  const { status } = useSession();
  return useQuery({ queryKey: ['auth', 'membership'], queryFn: getMembership, enabled: status === 'signedIn' });
}

export function useProfile() {
  const { session } = useSession();
  const id = session?.user.id ?? '';
  return useQuery({ queryKey: ['auth', 'profile', id], queryFn: () => getProfile(id), enabled: !!id });
}

export function useUpdateDisplayName() {
  const { session } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => updateDisplayName(session?.user.id ?? '', name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth', 'profile'] }),
  });
}
