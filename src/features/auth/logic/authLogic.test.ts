import { callbackFailed, gateRedirect, gateTarget, reasonMessage, validEmail } from './authLogic';

const idle = { isPending: false, isError: false, data: undefined };

describe('gateTarget', () => {
  test('waits while the session loads', () => {
    expect(gateTarget({ status: 'loading', reason: null, membership: idle }).kind).toBe('pending');
  });
  test('signed out goes to sign-in, keeping the reason', () => {
    expect(gateTarget({ status: 'signedOut', reason: null, membership: idle })).toEqual({ kind: 'redirect', href: '/sign-in' });
    expect(gateTarget({ status: 'signedOut', reason: 'logout', membership: idle })).toEqual({
      kind: 'redirect',
      href: '/sign-in?reason=logout',
    });
  });
  test('signed in waits for, and reports a failure of, the membership check', () => {
    expect(gateTarget({ status: 'signedIn', reason: null, membership: { ...idle, isPending: true } }).kind).toBe('pending');
    expect(gateTarget({ status: 'signedIn', reason: null, membership: { ...idle, isError: true } }).kind).toBe('error');
  });
  test('no club goes to the club code screen', () => {
    expect(gateTarget({ status: 'signedIn', reason: null, membership: { ...idle, data: null } })).toEqual({
      kind: 'redirect',
      href: '/club-code',
    });
  });
  test('active member goes home; removed member is signed out', () => {
    const active = { ...idle, data: { role: 'member', status: 'active' } as const };
    expect(gateTarget({ status: 'signedIn', reason: null, membership: active })).toEqual({ kind: 'redirect', href: '/' });
    const removed = { ...idle, data: { role: 'member', status: 'removed' } as const };
    expect(gateTarget({ status: 'signedIn', reason: null, membership: removed }).kind).toBe('signOutRemoved');
  });
});

describe('gateRedirect', () => {
  test('active members only leave auth routes, so deep links survive', () => {
    const home = { kind: 'redirect', href: '/' } as const;
    expect(gateRedirect(home, '/events/1', false)).toBeNull();
    expect(gateRedirect(home, '/sign-in', true)).toBe('/');
    expect(gateRedirect(home, '/auth-callback', true)).toBe('/');
  });
  test('does not redirect to the page it is already on', () => {
    expect(gateRedirect({ kind: 'redirect', href: '/sign-in?reason=logout' }, '/sign-in', true)).toBeNull();
    expect(gateRedirect({ kind: 'redirect', href: '/club-code' }, '/', false)).toBe('/club-code');
  });
  test('pending targets never redirect', () => {
    expect(gateRedirect({ kind: 'pending' }, '/sign-in', true)).toBeNull();
  });
});

test('validEmail trims and rejects malformed addresses', () => {
  expect(validEmail('  a@b.co ')).toBe('a@b.co');
  expect(validEmail('nope')).toBeNull();
  expect(validEmail('a@b')).toBeNull();
  expect(validEmail('')).toBeNull();
});

test('callbackFailed sees errors in the query or the hash', () => {
  expect(callbackFailed('?code=abc', '')).toBe(false);
  expect(callbackFailed('?error=access_denied', '')).toBe(true);
  expect(callbackFailed('', '#error_code=otp_expired&error_description=x')).toBe(true);
});

test('reasonMessage knows only the listed reasons', () => {
  expect(reasonMessage('logout')).toBe('You signed out.');
  expect(reasonMessage('bogus')).toBeNull();
  expect(reasonMessage(undefined)).toBeNull();
});
