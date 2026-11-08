import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { DashboardScreen } from './DashboardScreen';
import { computeParticipation } from './logic/participation';
import { computeTotals, type PastEvent } from './logic/totals';


const mockFetch = jest.fn();
jest.mock('@/shared/lazySupabase', () => ({
  loadSupabase: async () => ({
    from: () => ({ select: () => ({ is: () => ({ lte: async () => ({ data: await mockFetch(), error: null }) }) }) }),
  }),
}));
jest.mock('@/features/auth/hooks/useSession', () => ({ useSession: () => ({ session: { user: { id: 'me' } } }) }));

const ev = (
  category: PastEvent['category'],
  starts_at: string,
  status?: 'going' | 'maybe',
  cancelled_at: string | null = null,
): PastEvent => ({
  category,
  starts_at,
  cancelled_at,
  rsvps: status ? [{ user_id: 'me', status }] : [],
});
const now = new Date('2026-06-01T00:00:00Z');
const data = [
  ev('swimming', '2026-05-01T00:00:00Z', 'going'),
  ev('swimming', '2026-05-02T00:00:00Z', 'maybe'),
  ev('swimming', '2026-05-03T00:00:00Z', 'going', '2026-05-02T00:00:00Z'), // cancelled
  ev('beer_social', '2026-05-04T00:00:00Z', 'going'),
  ev('beer_social', '2026-05-05T00:00:00Z'),
  ev('beer_social', '2999-01-01T00:00:00Z', 'going'), // upcoming
];

test('totals exclude cancelled and upcoming', () => {
  expect(computeTotals(data, 'me', now)).toEqual({ swimming: 2, beerSocial: 2, attended: 2 });
});

beforeEach(() => {
  jest.resetAllMocks();
  jest.useFakeTimers({ doNotFake: ['setTimeout', 'setInterval', 'setImmediate', 'clearTimeout', 'clearInterval', 'clearImmediate', 'nextTick', 'queueMicrotask'], now });
});
afterEach(() => jest.useRealTimers());

test('screen shows totals', async () => {
  mockFetch.mockResolvedValue(data);
  await render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <DashboardScreen />
    </QueryClientProvider>,
  );
  expect(await screen.findByText('Swimming events: 2', {}, { timeout: 5000 })).toBeTruthy();
  expect(screen.getByText('Beer & Social events: 2')).toBeTruthy();
  expect(screen.getByText('Events you attended: 2')).toBeTruthy();
});

describe('participation', () => {
  const at = new Date(2026, 4, 13, 12); // Wednesday, local
  const evs = [
    ev('swimming', new Date(2026, 4, 10, 23, 59).toISOString(), 'going'), // Sunday: previous week
    ev('swimming', new Date(2026, 4, 11, 0, 0).toISOString(), 'going'), // Monday: this week
    ev('swimming', new Date(2026, 3, 30, 23, 59).toISOString(), 'going'), // April, still Q2
    ev('swimming', new Date(2026, 2, 31, 23, 59).toISOString(), 'going'), // Q1
    ev('swimming', new Date(2025, 11, 31, 23, 59).toISOString(), 'going'), // previous year
    ev('swimming', new Date(2026, 4, 12).toISOString(), 'maybe'),
  ];
  const last = (p: Parameters<typeof computeParticipation>[2]) =>
    computeParticipation(evs, 'me', p, at, 2).map((b) => [b.start, b.count]);
  test('week', () => expect(last('week')).toEqual([['2026-05-04', 1], ['2026-05-11', 1]]));
  test('month', () => expect(last('month')).toEqual([['2026-04-01', 1], ['2026-05-01', 2]]));
  test('quarter', () => expect(last('quarter')).toEqual([['2026-01-01', 1], ['2026-04-01', 3]]));
  test('year', () => expect(last('year')).toEqual([['2025-01-01', 1], ['2026-01-01', 4]]));
});

test('screen switches period', async () => {
  mockFetch.mockResolvedValue(data);
  await render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <DashboardScreen />
    </QueryClientProvider>,
  );
  await fireEvent.press(await screen.findByText('year', {}, { timeout: 5000 }));
  expect(screen.getByText('2026-01-01: 2')).toBeTruthy();
});
