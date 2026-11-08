import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { getLanguage, setLanguage } from '@/shared/i18n';
import { ThemeProvider } from '@/shared/ui';

import { SettingsScreen } from './components/SettingsScreen';

const mockUpdate = jest.fn(async (_id: string, _name: string) => {});
const mockStore = new Map<string, string>();
jest.mock('../../shared/secureStorage', () => ({
  secureStoreAdapter: {
    getItem: async (k: string) => mockStore.get(k) ?? null,
    setItem: async (k: string, v: string) => void mockStore.set(k, v),
    removeItem: async (k: string) => void mockStore.delete(k),
  },
}));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) }));
jest.mock('./data/authApi', () => ({
  getProfile: async () => ({ display_name: 'Mia', avatar_url: null }),
  updateDisplayName: (id: string, n: string) => mockUpdate(id, n),
}));
jest.mock('./hooks/useSession', () => ({
  useSession: () => ({ status: 'signedIn', session: { user: { id: 'u1' } }, signOut: jest.fn() }),
}));

jest.setTimeout(30000);

const setup = async () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <ThemeProvider>
        <SettingsScreen />
      </ThemeProvider>
    </QueryClientProvider>,
  );

beforeEach(async () => {
  mockStore.clear();
  await setLanguage('en');
});

it('saves a changed name for the signed-in user', async () => {
  await setup();
  const input = await screen.findByDisplayValue('Mia');
  await fireEvent.changeText(input, '  Mia T  ');
  await fireEvent.press(screen.getByText('Save name'));
  await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith('u1', 'Mia T'));
});

it('rejects an empty name', async () => {
  await setup();
  await fireEvent.changeText(await screen.findByDisplayValue('Mia'), '   ');
  expect(screen.getByText('Name must be 1-50 characters.')).toBeTruthy();
});

it('switches language at once and persists it', async () => {
  await setup();
  await fireEvent.press(await screen.findByText('Tiếng Việt'));
  await waitFor(() => expect(screen.getByText('Ngôn ngữ')).toBeTruthy());
  expect(getLanguage()).toBe('vi');
  expect(mockStore.get('aquamates.language')).toBe('vi');
});

it('switches theme and persists it', async () => {
  await setup();
  await fireEvent.press(await screen.findByText('Dark'));
  await waitFor(() => expect(mockStore.get('aquamates.theme')).toBe('dark'));
});
