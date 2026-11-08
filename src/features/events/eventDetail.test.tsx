import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react-native';

import { EventDetailScreen } from './components/EventDetailScreen';

jest.mock('@/features/auth/hooks/useSession', () => ({ useSession: () => ({ session: null }) }));
jest.mock('@/features/auth/hooks/useMembership', () => ({ useMembership: () => ({ data: null }) }));
jest.mock('./data/eventsApi', () => ({
  fetchEvent: jest.fn().mockResolvedValue({
    id: 'e1',
    category: 'swimming',
    title: 'Sunday swim',
    description: 'Laps',
    location: 'City pool',
    starts_at: '2999-01-01T18:30:00Z',
    notes: 'Bring a towel',
    cancelled_at: null,
    creator: { display_name: 'Alice' },
    rsvps: [
      { user_id: 'u1', status: 'going', profile: { display_name: 'Bob', avatar_url: 'https://x/bob.png' } },
      { user_id: 'u2', status: 'maybe', profile: { display_name: 'Cara', avatar_url: null } },
      { user_id: 'u3', status: 'not_going', profile: { display_name: 'Dan', avatar_url: null } },
    ],
  }),
}));

test('shows all fields, creator, category and participant statuses', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await render(
    <QueryClientProvider client={client}>
      <EventDetailScreen id="e1" />
    </QueryClientProvider>,
  );
  for (const t of ['Sunday swim', 'Category: Swimming', 'Location: City pool', 'Created by: Alice', 'Laps', 'Notes: Bring a towel', 'Bob', 'Going', 'Cara', 'Maybe', 'Dan', 'Not going'])
    expect(await screen.findByText(t)).toBeTruthy();
  expect(screen.getByLabelText('Bob avatar')).toBeTruthy(); // picture
  expect(screen.getByText('C')).toBeTruthy(); // initials fallback
});
