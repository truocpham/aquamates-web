import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { EventDetailScreen } from './components/EventDetailScreen';

const mockCancel = jest.fn();
let mockEvent: Record<string, unknown>;
let mockRole: string | null = null;
jest.mock('@/features/auth/hooks/useSession', () => ({
  useSession: () => ({ session: { user: { id: 'u1' } } }),
}));
jest.mock('@/features/auth/hooks/useMembership', () => ({
  useMembership: () => ({ data: mockRole ? { role: mockRole, status: 'active' } : null }),
}));
jest.mock('./data/eventsApi', () => ({
  fetchEvent: () => Promise.resolve(mockEvent),
  cancelEvent: (...a: unknown[]) => mockCancel(...a),
}));

const base = {
  id: 'e1', category: 'swimming', title: 'Swim', description: '', location: 'Pool', starts_at: '2999-01-01T18:30:00Z',
  notes: null, cancelled_at: null, creator_id: 'u1', creator: null, rsvps: [],
};
const show = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <EventDetailScreen id="e1" />
    </QueryClientProvider>,
  );

test('creator cancels', async () => {
  mockEvent = base;
  mockCancel.mockResolvedValue(undefined);
  await show();
  fireEvent.press(await screen.findByText('Cancel event'));
  await waitFor(() => expect(mockCancel).toHaveBeenCalledWith('e1'));
});

test('admin who is not creator sees cancel', async () => {
  mockEvent = { ...base, creator_id: 'other' };
  mockRole = 'admin';
  await show();
  expect(await screen.findByText('Cancel event')).toBeTruthy();
});

test('non-creator member cannot cancel', async () => {
  mockEvent = { ...base, creator_id: 'other' };
  mockRole = 'member';
  await show();
  await screen.findByText('Swim');
  expect(screen.queryByText('Cancel event')).toBeNull();
});

test('cancelled event is marked, locked, no cancel button', async () => {
  mockEvent = { ...base, cancelled_at: '2026-10-28T00:00:00Z' };
  await show();
  expect(await screen.findByText('Cancelled')).toBeTruthy();
  expect(screen.queryByText('Cancel event')).toBeNull();
  expect(screen.getByText('RSVPs are closed.')).toBeTruthy();
});
