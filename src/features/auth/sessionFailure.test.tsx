import { act, render, screen } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Index from '../../../app/index';
import { SessionProvider } from './hooks/useSession';

type Listener = (event: string, session: unknown) => void;
const mockState: { load: () => Promise<unknown>; clear: jest.Mock; listener: Listener | null } = {
  load: () => Promise.resolve({}),
  clear: jest.fn(),
  listener: null,
};

jest.mock('@/shared/lazySupabase', () => ({ loadSupabase: () => mockState.load() }));
jest.mock('@/shared/preHydration', () => ({ clearSessionHint: () => mockState.clear() }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));

const client = (getSession: () => Promise<unknown>) => ({
  auth: {
    getSession,
    onAuthStateChange: (cb: Listener) => {
      mockState.listener = cb;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    },
    signOut: jest.fn(),
  },
});

async function setup() {
  await render(
    <QueryClientProvider client={new QueryClient()}>
      <SessionProvider>
        <Index />
      </SessionProvider>
    </QueryClientProvider>,
  );
}

const pass = (ms: number) =>
  act(async () => {
    jest.advanceTimersByTime(ms);
  });

beforeEach(() => {
  jest.useFakeTimers();
  mockState.clear = jest.fn();
  mockState.listener = null;
});
afterEach(() => jest.useRealTimers());

test('a failed import (chunk 404, offline) shows the landing and clears the hint', async () => {
  mockState.load = () => Promise.reject(new Error('Loading chunk failed'));
  await setup();
  await act(async () => {});
  expect(mockState.clear).toHaveBeenCalled();
  expect(screen.getByText('Your club, organised.')).toBeTruthy();
});

test('a rejected getSession shows the landing and clears the hint', async () => {
  mockState.load = () => Promise.resolve(client(() => Promise.reject(new Error('boom'))));
  await setup();
  await act(async () => {});
  expect(mockState.clear).toHaveBeenCalled();
  expect(screen.getByText('Your club, organised.')).toBeTruthy();
});

test('a hanging import resolves to signed out after the timeout', async () => {
  mockState.load = () => new Promise(() => {});
  await setup();
  await act(async () => {});
  expect(mockState.clear).not.toHaveBeenCalled();
  await pass(5000);
  expect(mockState.clear).toHaveBeenCalled();
  expect(screen.getByText('Your club, organised.')).toBeTruthy();
});

test('a hanging getSession resolves to signed out after the timeout', async () => {
  mockState.load = () => Promise.resolve(client(() => new Promise(() => {})));
  await setup();
  await act(async () => {});
  expect(mockState.clear).not.toHaveBeenCalled();
  await pass(5000);
  expect(mockState.clear).toHaveBeenCalled();
  expect(screen.getByText('Your club, organised.')).toBeTruthy();
});

test('a session that arrives after the timeout still switches to signed in', async () => {
  let resolve!: (v: unknown) => void;
  mockState.load = () => Promise.resolve(client(() => new Promise((r) => (resolve = r))));
  await setup();
  await act(async () => {});
  await pass(5000);
  expect(screen.getByText('Your club, organised.')).toBeTruthy();
  await act(async () => {
    resolve({ data: { session: { user: { id: 'u1' } } } });
  });
  expect(screen.queryByText('Your club, organised.')).toBeNull();
  expect(mockState.clear).toHaveBeenCalled();
});

test('a late session does not override an expiry that happened meanwhile', async () => {
  let resolve!: (v: unknown) => void;
  mockState.load = () => Promise.resolve(client(() => new Promise((r) => (resolve = r))));
  await setup();
  await act(async () => {});
  await pass(5000);
  await act(async () => mockState.listener!('SIGNED_OUT', null));
  await act(async () => {
    resolve({ data: { session: { user: { id: 'u1' } } } });
  });
  expect(screen.getByText('Your club, organised.')).toBeTruthy();
  expect(mockState.clear).toHaveBeenCalled();
});
