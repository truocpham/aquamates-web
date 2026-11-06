import { fireEvent, render, screen } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { SignInScreen } from './components/SignInScreen';

const mockOAuth = jest.fn();
const mockOtp = jest.fn();

jest.mock('@/shared/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: (...a: unknown[]) => mockOAuth(...a),
      signInWithOtp: (...a: unknown[]) => mockOtp(...a),
    },
  },
}));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));

async function setup(reason?: string) {
  await render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
      <SignInScreen reason={reason} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  mockOAuth.mockReset().mockResolvedValue({ error: null });
  mockOtp.mockReset().mockResolvedValue({ error: null });
});

test('Facebook button starts OAuth with the callback redirect', async () => {
  await setup();
  await fireEvent.press(screen.getByText('Continue with Facebook'));
  await screen.findByText('Continue with Facebook');
  expect(mockOAuth).toHaveBeenCalled();
  const arg = mockOAuth.mock.calls[0][0];
  expect(arg.provider).toBe('facebook');
  expect(arg.options.redirectTo).toMatch(/\/auth-callback$/);
});

test('Apple is shown disabled and marked coming soon', async () => {
  await setup();
  expect(screen.getByText('Continue with Apple')).toBeTruthy();
  expect(screen.getAllByText('Coming soon').length).toBeGreaterThan(0);
  await fireEvent.press(screen.getByText('Continue with Apple'));
  expect(mockOAuth).not.toHaveBeenCalled();
});

test('a failed Facebook start shows the error state', async () => {
  mockOAuth.mockResolvedValue({ error: new Error('x') });
  await setup();
  await fireEvent.press(screen.getByText('Continue with Facebook'));
  await screen.findByText('Sign-in failed or was cancelled. Try again.');
});

test('magic link: invalid email is rejected without calling Supabase', async () => {
  await setup();
  await fireEvent.changeText(screen.getByLabelText('Email'), 'nope');
  await fireEvent.press(screen.getByText('Email me a sign-in link'));
  expect(screen.getByText('Enter a valid email address.')).toBeTruthy();
  expect(mockOtp).not.toHaveBeenCalled();
});

test('magic link: sends to the trimmed email and shows the sent state', async () => {
  await setup();
  await fireEvent.changeText(screen.getByLabelText('Email'), ' me@example.com ');
  await fireEvent.press(screen.getByText('Email me a sign-in link'));
  await screen.findByText(/We sent a sign-in link to me@example.com/);
  const arg = mockOtp.mock.calls[0][0];
  expect(arg.email).toBe('me@example.com');
  expect(arg.options.emailRedirectTo).toMatch(/\/auth-callback$/);
});

test('magic link: a send failure shows the error state', async () => {
  mockOtp.mockResolvedValue({ error: new Error('rate limit') });
  await setup();
  await fireEvent.changeText(screen.getByLabelText('Email'), 'me@example.com');
  await fireEvent.press(screen.getByText('Email me a sign-in link'));
  await screen.findByText('Could not send the link. Check the address and try again.');
});

test('shows why the member was signed out', async () => {
  await setup('expired');
  expect(screen.getByText('Your session expired. Sign in again.')).toBeTruthy();
});
