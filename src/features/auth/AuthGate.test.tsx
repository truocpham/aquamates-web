import { render } from '@testing-library/react-native';

import { AuthGate, PUBLIC_ROUTES } from './components/AuthGate';

const mockReplace = jest.fn();
let mockPath = '/';
let mockStatus: 'loading' | 'signedOut' | 'signedIn' = 'signedOut';

jest.mock('expo-router', () => ({
  usePathname: () => mockPath,
  useRouter: () => ({ replace: mockReplace }),
}));
jest.mock('./hooks/useSession', () => ({
  useSession: () => ({ status: mockStatus, reason: null, signOut: jest.fn() }),
}));
jest.mock('./hooks/useMembership', () => ({
  useMembership: () => ({ isPending: false, isError: false, data: { role: 'member', status: 'active' } }),
}));

async function visit(path: string, status: typeof mockStatus) {
  mockPath = path;
  mockStatus = status;
  await render(<AuthGate>{null}</AuthGate>);
}

beforeEach(() => mockReplace.mockReset());

test('only the landing page is public', () => {
  expect(PUBLIC_ROUTES).toEqual(['/']);
});

test('signed out: the landing page stays put', async () => {
  await visit('/', 'signedOut');
  expect(mockReplace).not.toHaveBeenCalled();
});

test.each(['/home', '/events', '/club-code', '/settings'])('signed out: %s redirects to sign-in', async (path) => {
  await visit(path, 'signedOut');
  expect(mockReplace).toHaveBeenCalledWith('/sign-in');
});

test('signed in: the landing route is not redirected', async () => {
  await visit('/', 'signedIn');
  expect(mockReplace).not.toHaveBeenCalled();
});
