import { authRedirectUrl, isAllowedOrigin, PRODUCTION_ORIGIN } from './authRedirect';

test('local, preview and production origins get their own callback URL', () => {
  expect(authRedirectUrl('http://localhost:8081')).toBe('http://localhost:8081/auth-callback');
  expect(authRedirectUrl('https://pr-12.aquamates-web.pages.dev')).toBe('https://pr-12.aquamates-web.pages.dev/auth-callback');
  expect(authRedirectUrl(PRODUCTION_ORIGIN)).toBe(`${PRODUCTION_ORIGIN}/auth-callback`);
});

test('unknown origins fall back to production', () => {
  expect(authRedirectUrl('https://evil.example')).toBe(`${PRODUCTION_ORIGIN}/auth-callback`);
  expect(authRedirectUrl('https://aquamates-web.pages.dev.evil.example')).toBe(`${PRODUCTION_ORIGIN}/auth-callback`);
  expect(authRedirectUrl(undefined)).toBe(`${PRODUCTION_ORIGIN}/auth-callback`);
  expect(isAllowedOrigin('http://localhost.evil.example')).toBe(false);
});
