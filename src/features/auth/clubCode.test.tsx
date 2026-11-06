import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ClubCodeScreen } from './components/ClubCodeScreen';

const mockExists = jest.fn();
const mockBootstrap = jest.fn();
const mockJoin = jest.fn();
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) }));
jest.mock('./data/authApi', () => ({
  clubExists: () => mockExists(),
  bootstrapClub: (c: string) => mockBootstrap(c),
  joinClub: (c: string) => mockJoin(c),
  
}));
const mockSignOut = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace }) }));
jest.mock('./hooks/useSession', () => ({
  useSession: () => ({ status: 'signedIn', session: { user: { id: 'u1' } }, signOut: mockSignOut }),
}));

const rpcError = (code: string) => ({ code: 'P0001', message: `x (${code})` });
let client: QueryClient;
const setup = async () => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  jest.spyOn(client, 'invalidateQueries');
  await render(
    <QueryClientProvider client={client}>
      <ClubCodeScreen />
    </QueryClientProvider>,
  );
};
const type = (v: string) => fireEvent.changeText(screen.getByLabelText('Club code'), v);
const invalidatedMembership = () =>
  expect(client.invalidateQueries).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['auth', 'membership'] }));

// The first test pays the cold render cost; slow CI runners exceed the 5s default.
jest.setTimeout(30000);

beforeEach(() => jest.clearAllMocks());

test('first user creates the club: short code blocked, valid code bootstraps', async () => {
  mockExists.mockResolvedValue(false);
  mockBootstrap.mockResolvedValue(undefined);
  await setup();
  await screen.findByText('Create the club');
  await type('abc');
  await fireEvent.press(screen.getByText('Create club'));
  expect(mockBootstrap).not.toHaveBeenCalled();
  await type('abcdef');
  await fireEvent.press(screen.getByText('Create club'));
  await waitFor(() => expect(mockBootstrap).toHaveBeenCalledWith('abcdef'));
  await waitFor(invalidatedMembership);
  await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/'));
});

test('wrong code is refused, right code joins', async () => {
  mockExists.mockResolvedValue(true);
  mockJoin.mockRejectedValueOnce(rpcError('bad_code')).mockResolvedValueOnce(undefined);
  await setup();
  await screen.findByText('Enter club code');
  await type('nope');
  await fireEvent.press(screen.getByText('Join club'));
  expect(await screen.findByText('Wrong club code.')).toBeTruthy();
  await type('secret');
  await fireEvent.press(screen.getByText('Join club'));
  await waitFor(() => expect(mockJoin).toHaveBeenLastCalledWith('secret'));
  await waitFor(invalidatedMembership);
  await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/'));
});

test('losing the first-admin race shows the join form', async () => {
  mockExists.mockResolvedValueOnce(false).mockResolvedValue(true);
  mockBootstrap.mockRejectedValue(rpcError('club_exists'));
  await setup();
  await screen.findByText('Create the club');
  await type('abcdef');
  await fireEvent.press(screen.getByText('Create club'));
  expect(await screen.findByText('Enter club code')).toBeTruthy();
  expect(screen.getByText('The club was just created. Enter its code.')).toBeTruthy();
});

test('removed user is signed out', async () => {
  mockExists.mockResolvedValue(true);
  mockJoin.mockRejectedValue(rpcError('removed'));
  await setup();
  await screen.findByText('Enter club code');
  await type('secret');
  await fireEvent.press(screen.getByText('Join club'));
  await waitFor(() => expect(mockSignOut).toHaveBeenCalledWith('removed'));
});

test('network failure shows the connection message and stays on the screen', async () => {
  mockExists.mockResolvedValue(true);
  mockJoin.mockRejectedValue(new Error('offline'));
  await setup();
  await screen.findByText('Enter club code');
  await type('secret');
  await fireEvent.press(screen.getByText('Join club'));
  expect(await screen.findByText('Something went wrong. Check your connection and try again.')).toBeTruthy();
  expect(mockReplace).not.toHaveBeenCalled();
});

test('club check failure shows an error with retry', async () => {
  mockExists.mockRejectedValueOnce(new Error('x')).mockResolvedValue(true);
  await setup();
  await screen.findByText('Could not check the club.');
  await fireEvent.press(screen.getByText('Retry'));
  await screen.findByText('Enter club code');
});
