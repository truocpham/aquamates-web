import { t } from '@/shared/i18n';

export type SignInReason = 'expired' | 'logout' | 'failed' | 'removed' | 'deleted';
export type Membership = { role: 'admin' | 'member'; status: 'active' | 'removed' } | null;

const SIGN_IN_REASONS: string[] = ['expired', 'logout', 'failed', 'removed', 'deleted'];

/** Message for a delete-account failure; `code` is the Edge Function error. */
export function deleteErrorMessage(code: string): string {
  return code === 'last_admin' ? t('error.lastAdmin') : t('error.deleteFailed');
}

export function reasonMessage(reason: string | undefined): string | null {
  return reason && SIGN_IN_REASONS.includes(reason) ? t(`signIn.reason.${reason as SignInReason}`) : null;
}

export const MIN_CODE_LENGTH = 6;

export type RpcError = 'club_exists' | 'bad_code' | 'removed' | 'last_admin' | 'bad_name' | 'unknown';

/** Maps a supabase RPC error (P0001, code in trailing parentheses) to a known reason. */
export function parseRpcError(e: unknown): RpcError {
  const { code, message } = (e ?? {}) as { code?: string; message?: string };
  if (code !== 'P0001') return 'unknown';
  const m = /\((\w+)\)\s*$/.exec(message ?? '')?.[1];
  return m === 'club_exists' || m === 'bad_code' || m === 'removed' || m === 'last_admin' || m === 'bad_name' ? m : 'unknown';
}

/** Trimmed display name when it is 1-50 characters, else null. */
export function validDisplayName(input: string): string | null {
  const name = input.trim();
  return name.length >= 1 && name.length <= 50 ? name : null;
}

/** Trimmed email when it looks like one, else null. */
export function validEmail(input: string): string | null {
  const email = input.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

/** True when the callback URL carries an auth error (query for PKCE, hash for implicit flows). */
export function callbackFailed(search: string, hash: string): boolean {
  const q = new URLSearchParams(search.replace(/^\?/, ''));
  const h = new URLSearchParams(hash.replace(/^#/, ''));
  return [q, h].some((p) => p.has('error') || p.has('error_description') || p.has('error_code'));
}

export type GateTarget =
  | { kind: 'pending' }
  | { kind: 'error' }
  | { kind: 'signOutRemoved' }
  | { kind: 'redirect'; href: string };

export function gateTarget(args: {
  status: 'loading' | 'signedOut' | 'signedIn';
  reason: SignInReason | null;
  membership: { isPending: boolean; isError: boolean; data: Membership | undefined };
}): GateTarget {
  const { status, reason, membership } = args;
  if (status === 'loading') return { kind: 'pending' };
  if (status === 'signedOut') return { kind: 'redirect', href: reason ? `/sign-in?reason=${reason}` : '/sign-in' };
  if (membership.isPending) return { kind: 'pending' };
  if (membership.isError) return { kind: 'error' };
  if (membership.data == null) return { kind: 'redirect', href: '/club-code' };
  if (membership.data.status === 'removed') return { kind: 'signOutRemoved' };
  return { kind: 'redirect', href: '/' };
}

/** Where the gate should send the user now, or null. An active member (href '/') only leaves auth routes, so deep links survive. */
export function gateRedirect(target: GateTarget, pathname: string, inAuth: boolean): string | null {
  if (target.kind !== 'redirect') return null;
  if (target.href === '/' && !inAuth) return null;
  return target.href.split('?')[0] === pathname ? null : target.href;
}
