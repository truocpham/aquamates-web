import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { UpcomingList } from './components/UpcomingList';
import { filterUpcoming } from './logic/upcoming';

jest.mock('expo-router', () => ({
  Link: ({ children, href }: { children: React.ReactElement; href: string }) =>
    require('react').cloneElement(children, { accessibilityHint: href }),
}));

const mockFetch = jest.fn();
jest.mock('./data/eventsApi', () => ({ fetchUpcoming: () => mockFetch() }));

const rows = [
  {
    id: '1',
    category: 'swimming',
    title: 'Swim A',
    location: null,
    starts_at: '2999-01-01T10:00:00Z',
  },
  {
    id: '2',
    category: 'beer_social',
    title: 'Beer B',
    location: 'Pub',
    starts_at: '2999-01-02T10:00:00Z',
  },
] as const;

const setup = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <UpcomingList />
    </QueryClientProvider>,
  );

test('filterUpcoming by chip keeps order', () => {
  expect(filterUpcoming([...rows], 'all').map((r) => r.id)).toEqual(['1', '2']);
  expect(filterUpcoming([...rows], 'beer_social').map((r) => r.id)).toEqual(['2']);
});

test('loading, then list filtered by chip', async () => {
  let release: (v: unknown) => void = () => {};
  mockFetch.mockReturnValue(new Promise((r) => (release = r)));
  await setup();
  expect(screen.getByLabelText('Loading events')).toBeTruthy();
  release([...rows]);
  expect(await screen.findByText('Swim A')).toBeTruthy();
  expect(screen.getByText('Beer B')).toBeTruthy();
  await fireEvent.press(screen.getByText('Swimming'));
  expect(screen.queryByText('Beer B')).toBeNull();
  await fireEvent.press(screen.getByText('Beer & Social'));
  expect(screen.queryByText('Swim A')).toBeNull();
});

test('empty state', async () => {
  mockFetch.mockResolvedValue([]);
  await setup();
  expect(await screen.findByText('No upcoming events.')).toBeTruthy();
});

test('error state with retry', async () => {
  mockFetch.mockRejectedValueOnce(new Error('x'));
  await setup();
  expect(await screen.findByText('Could not load events.')).toBeTruthy();
  mockFetch.mockResolvedValue([...rows]);
  await fireEvent.press(screen.getByText('Retry'));
  expect(await screen.findByText('Swim A')).toBeTruthy();
});

test('rows link to event detail', async () => {
  mockFetch.mockResolvedValue([...rows]);
  await setup();
  expect((await screen.findAllByRole('link'))[0].props.accessibilityHint).toBe('/event/1');
});
