// The single place that decides where Supabase sends the browser back after Facebook or magic-link sign-in.
// Every URL this can return must also be in the Supabase dashboard (Authentication > URL Configuration >
// Redirect URLs); see README "Auth redirect URLs".

export const AUTH_CALLBACK_PATH = '/auth-callback';

export const PRODUCTION_ORIGIN = 'https://aquamates-web.pages.dev';

/** Origins we accept: local dev server, Cloudflare Pages PR previews (<branch>.aquamates-web.pages.dev), production. */
const ALLOWED_ORIGINS: RegExp[] = [
  /^http:\/\/localhost:\d+$/,
  /^https:\/\/[a-z0-9-]+\.aquamates-web\.pages\.dev$/,
  /^https:\/\/aquamates-web\.pages\.dev$/,
];

export function isAllowedOrigin(origin: string): boolean {
  return ALLOWED_ORIGINS.some((re) => re.test(origin));
}

/** Callback URL for the current origin; an unknown origin falls back to production so it can never be an open redirect. */
export function authRedirectUrl(origin: string | undefined = globalThis.location?.origin): string {
  return `${origin && isAllowedOrigin(origin) ? origin : PRODUCTION_ORIGIN}${AUTH_CALLBACK_PATH}`;
}
