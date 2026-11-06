import { useQuery } from '@tanstack/react-query';

import { getMembership } from '../data/authApi';
import { useSession } from './useSession';

export function useMembership() {
  const { status } = useSession();
  return useQuery({ queryKey: ['auth', 'membership'], queryFn: getMembership, enabled: status === 'signedIn' });
}
