import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { EventDetailScreen } from './components/EventDetailScreen';

const mockSet = jest.fn();
let mockStart = '2999-01-01T18:30:00Z';
jest.mock('@/features/auth/hooks/useSession', () => ({ useSession: () => ({ session: { user: { id: 'u1' } } }) }));
jest.mock('@/features/auth/hooks/useMembership', () => ({ useMembership: () => ({ data: null }) }));
jest.mock('./data/eventsApi', () => ({
  fetchEvent: () =>
    Promise.resolve({
      id: 'e1', category: 'swimming', title: 'Swim', description: '', location: 'Pool', starts_at: mockStart,
      notes: null, cancelled_at: null, creator: null, rsvps: [{ user_id: 'u1', status: 'maybe', profile: { display_name: 'Me' } }],
    }),
  setRsvp: (...a: unknown[]) => mockSet(...a),
}));

const show = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <EventDetailScreen id="e1" />
    </QueryClientProvider>,
  );

test('changes RSVP before start', async () => {
  mockSet.mockResolvedValue(undefined);
  await show();
  fireEvent.press(await screen.findByText('RSVP Going'));
  await waitFor(() => expect(mockSet).toHaveBeenCalledWith('e1', 'u1', 'going'));
});

test('controls disabled after start', async () => {
  mockSet.mockClear();
  mockStart = '2000-01-01T18:30:00Z';
  await show();
  fireEvent.press(await screen.findByText('RSVP Going'));
  expect(mockSet).not.toHaveBeenCalled();
  expect(await screen.findByText('RSVPs are closed.')).toBeTruthy();
});
