import { act, render, screen } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Text } from 'react-native';

import { SessionProvider, useSession } from './hooks/useSession';

type Listener = (event: string, session: unknown) => void;
const mockState: { listener: Listener | null; session: unknown; signOut: jest.Mock; getSession: () => Promise<unknown> } = {
  listener: null,
  session: null,
  signOut: jest.fn(),
  getSession: () => Promise.resolve({ data: { session: mockState.session } }),
};

jest.mock('@/shared/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => mockState.getSession(),
      onAuthStateChange: (cb: Listener) => {
        mockState.listener = cb;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      },
      signOut: (...args: unknown[]) => mockState.signOut(...args),
    },
  },
}));

const latest: { current: ReturnType<typeof useSession> | null } = { current: null };
function Probe() {
  const s = useSession();
  useEffect(() => {
    latest.current = s;
  });
  return <Text testID="status">{s.status + ':' + (s.reason ?? '')}</Text>;
}

async function setup() {
  await render(
    <QueryClientProvider client={new QueryClient()}>
      <SessionProvider>
        <Probe />
      </SessionProvider>
    </QueryClientProvider>,
  );
}

const status = () => screen.getByTestId('status').props.children;

beforeEach(() => {
  mockState.session = null;
  mockState.getSession = () => Promise.resolve({ data: { session: mockState.session } });
  mockState.signOut = jest.fn().mockResolvedValue({ error: null });
});

test('loads, then is signed out with no stored session', async () => {
  await setup();
  await act(async () => {});
  expect(status()).toBe('signedOut:');
});

test('restores a stored session on load', async () => {
  mockState.session = { user: { id: 'u1' } };
  await setup();
  await act(async () => {});
  expect(status()).toBe('signedIn:');
});

test('becomes signed in when sign-in completes (Facebook or magic link)', async () => {
  await setup();
  await act(async () => {});
  await act(async () => mockState.listener!('SIGNED_IN', { user: { id: 'u1' } }));
  expect(status()).toBe('signedIn:');
});

test('sign-out clears the session and records the reason', async () => {
  mockState.session = { user: { id: 'u1' } };
  await setup();
  await act(async () => {});
  await act(async () => {
    await latest.current!.signOut('logout');
  });
  expect(mockState.signOut).toHaveBeenCalledWith(undefined);
  expect(latest.current!.session).toBeNull();
  expect(status()).toBe('signedOut:logout');
});

test('after account deletion only the local session is cleared', async () => {
  mockState.session = { user: { id: 'u1' } };
  await setup();
  await act(async () => {});
  await act(async () => {
    await latest.current!.signOut('deleted');
  });
  expect(mockState.signOut).toHaveBeenCalledWith({ scope: 'local' });
});

test('a SIGNED_OUT the app did not start means the session expired', async () => {
  mockState.session = { user: { id: 'u1' } };
  await setup();
  await act(async () => {});
  await act(async () => mockState.listener!('SIGNED_OUT', null));
  expect(status()).toBe('signedOut:expired');
});

describe('bounded initial session check', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('a rejected getSession resolves to signed out', async () => {
    mockState.getSession = () => Promise.reject(new Error('network'));
    await setup();
    await act(async () => {});
    expect(status()).toBe('signedOut:');
  });

  test('a hung getSession resolves to signed out after the timeout', async () => {
    mockState.getSession = () => new Promise(() => {});
    await setup();
    expect(status()).toBe('loading:');
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(status()).toBe('signedOut:');
  });

  test('a late session after the timeout switches to signed in', async () => {
    let resolve!: (v: unknown) => void;
    mockState.getSession = () => new Promise((r) => (resolve = r));
    await setup();
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(status()).toBe('signedOut:');
    await act(async () => resolve({ data: { session: { user: { id: 'u1' } } } }));
    expect(status()).toBe('signedIn:');
  });
});
