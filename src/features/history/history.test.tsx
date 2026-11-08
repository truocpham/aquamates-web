import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react-native';

import { HistoryScreen } from './HistoryScreen';
import { toHistory, type HistoryEvent } from './historyLogic';

jest.mock('expo-router', () => ({
  Link: ({ children, href }: { children: React.ReactElement; href: string }) =>
    require('react').cloneElement(children, { accessibilityHint: href }),
}));
jest.mock('@/features/auth/hooks/useSession', () => ({ useSession: () => ({ session: { user: { id: 'me' } } }) }));
const mockSelect = jest.fn();
jest.mock('@/shared/lazySupabase', () => ({
  loadSupabase: async () => ({ from: () => ({ select: () => ({ lt: () => ({ order: () => mockSelect() }) }) }) }),
}));

const ev = (id: string, o: Partial<HistoryEvent>): HistoryEvent => ({
  id,
  category: 'swimming',
  title: `E${id}`,
  location: null,
  starts_at: `2020-01-0${id}T10:00:00Z`,
  cancelled_at: null,
  creator_id: 'other',
  rsvps: [],
  ...o,
});
const data = [
  ev('1', { rsvps: [{ user_id: 'me', status: 'going' }] }),
  ev('2', { rsvps: [{ user_id: 'me', status: 'not_going' }] }),
  ev('3', { creator_id: 'me' }),
  ev('4', { rsvps: [{ user_id: 'me', status: 'maybe' }], cancelled_at: '2020-01-01T00:00:00Z' }),
  ev('5', {}),
];

test('toHistory keeps own events, newest first, with status', () => {
  expect(toHistory(data, 'me').map((r) => [r.id, r.status])).toEqual([
    ['4', 'cancelled'],
    ['3', 'created'],
    ['1', 'going'],
  ]);
});

const setup = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <HistoryScreen />
    </QueryClientProvider>,
  );

test('signed-in member sees past events and RSVPs', async () => {
  mockSelect.mockResolvedValue({ data, error: null });
  await setup();
  expect(await screen.findByText('E1')).toBeTruthy();
  expect(screen.getByText('Going')).toBeTruthy();
  expect(screen.getByText('Created')).toBeTruthy();
  expect(screen.getByText('Cancelled')).toBeTruthy();
  expect(screen.queryByText('E5')).toBeNull();
  expect(screen.getAllByRole('link')[2].props.accessibilityHint).toBe('/event/1');
});

test('empty state', async () => {
  mockSelect.mockResolvedValueOnce({ data: [], error: null });
  await setup();
  expect(await screen.findByText('No activity yet.')).toBeTruthy();
});
