import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { setLanguage } from '@/shared/i18n';
import { ThemeProvider } from '@/shared/ui';

import { AdminMembersScreen } from './components/AdminMembersScreen';

jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) }));
let mockMembership: { role: string; status: string } | null = { role: 'admin', status: 'active' };
const mockRemove = jest.fn(async (_id: string) => {});
const mockList = jest.fn();
jest.mock('./data/authApi', () => ({
  getMembership: async () => mockMembership,
  listMembers: () => mockList(),
  removeMember: (id: string) => mockRemove(id),
}));
jest.mock('./hooks/useSession', () => ({
  useSession: () => ({ status: 'signedIn', session: { user: { id: 'me' } }, signOut: jest.fn() }),
}));

const members = [
  { user_id: 'me', display_name: 'Mia', avatar_url: null, role: 'admin', status: 'active' },
  { user_id: 'u2', display_name: 'Bob', avatar_url: null, role: 'member', status: 'active' },
];

const setup = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <ThemeProvider>
        <AdminMembersScreen />
      </ThemeProvider>
    </QueryClientProvider>,
  );

beforeEach(async () => {
  jest.clearAllMocks();
  mockMembership = { role: 'admin', status: 'active' };
  mockList.mockResolvedValue(members);
  await setLanguage('en');
});

test('admin lists members and removes one after confirming', async () => {
  await setup();
  expect(await screen.findByText('Bob (member)')).toBeTruthy();
  expect(screen.queryByText('Remove Mia')).toBeNull();
  await fireEvent.press(screen.getByText('Remove Bob'));
  expect(mockRemove).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByText('Confirm'));
  await waitFor(() => expect(mockRemove).toHaveBeenCalledWith('u2'));
});

test.each([
  ['member', { role: 'member', status: 'active' }],
  ['removed admin', { role: 'admin', status: 'removed' }],
])('non-admin (%s) is blocked and members are not loaded', async (_n, m) => {
  mockMembership = m;
  await setup();
  expect(await screen.findByText('Only admins can manage members.')).toBeTruthy();
  expect(mockList).not.toHaveBeenCalled();
  expect(screen.queryByText('Members')).toBeNull();
});
