import { useQuery } from '@tanstack/react-query';

import { fetchEvent } from '../data/eventsApi';

export const useEvent = (id: string) => useQuery({ queryKey: ['events', id], queryFn: () => fetchEvent(id) });
