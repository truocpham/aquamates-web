import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { EditEventScreen } from './components/EditEventScreen';
import { EventDetailScreen } from './components/EventDetailScreen';

const mockUpdate = jest.fn();
let mockUser = 'u1';
let mockRole: 'admin' | 'member' = 'member';
let mockStart = '2999-01-01T18:30:00Z';
jest.mock('expo-router', () => ({ Link: ({ children }: { children: string }) => require('react').createElement(require('react-native').Text, null, children) }));
jest.mock('@/features/auth/hooks/useSession', () => ({
  useSession: () => ({ session: { user: { id: mockUser } } }),
}));
jest.mock('@/features/auth/hooks/useMembership', () => ({
  useMembership: () => ({ data: { role: mockRole, status: 'active' } }),
}));
jest.mock('./data/eventsApi', () => ({
  fetchEvent: () =>
    Promise.resolve({
      id: 'e1', creator_id: 'u1', category: 'swimming', title: 'Swim', description: 'Laps', location: 'Pool',
      starts_at: mockStart, notes: null, cancelled_at: null, creator: null, rsvps: [],
    }),
  updateEvent: (...a: unknown[]) => mockUpdate(...a),
}));

const wrap = (ui: React.ReactElement) =>
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{ui}</QueryClientProvider>);

beforeEach(() => {
  jest.clearAllMocks();
  mockUser = 'u1';
  mockRole = 'member';
  mockStart = '2999-01-01T18:30:00Z';
});

test('creator sees edit control; saving sends changed fields', async () => {
  mockUpdate.mockResolvedValue(undefined);
  const onSaved = jest.fn();
  await wrap(<EditEventScreen id="e1" onSaved={onSaved} />);
  await screen.findByLabelText('Title');
  await fireEvent.changeText(screen.getByLabelText('Title'), 'Evening swim');
  await fireEvent.press(screen.getByText('Save changes'));
  await waitFor(() => expect(onSaved).toHaveBeenCalled());
  expect(mockUpdate.mock.calls[0][0]).toBe('e1');
  expect(mockUpdate.mock.calls[0][1]).toMatchObject({ title: 'Evening swim', location: 'Pool', category: 'swimming' });
});

test('edit link shown to creator and admin, hidden to others and after start', async () => {
  await wrap(<EventDetailScreen id="e1" />);
  expect(await screen.findByText('Edit event')).toBeTruthy();
});

test('admin who is not creator sees edit', async () => {
  mockUser = 'u2';
  mockRole = 'admin';
  await wrap(<EventDetailScreen id="e1" />);
  expect(await screen.findByText('Edit event')).toBeTruthy();
});

test('other member sees no edit', async () => {
  mockUser = 'u2';
  await wrap(<EventDetailScreen id="e1" />);
  await screen.findByText('Swim');
  expect(screen.queryByText('Edit event')).toBeNull();
});

test('no edit after start', async () => {
  mockStart = '2000-01-01T18:30:00Z';
  await wrap(<EventDetailScreen id="e1" />);
  await screen.findByText('Swim');
  expect(screen.queryByText('Edit event')).toBeNull();
});

test('server refusal is shown', async () => {
  mockUpdate.mockRejectedValue(new Error('Could not save changes.'));
  await wrap(<EditEventScreen id="e1" />);
  await screen.findByLabelText('Title');
  await fireEvent.press(screen.getByText('Save changes'));
  expect(await screen.findByText('Could not save changes.')).toBeTruthy();
});
