import { authRedirectUrl } from '@/shared/authRedirect';
import { t } from '@/shared/i18n';
import { loadSupabase as client } from '@/shared/lazySupabase';

import type { Membership } from '../logic/authLogic';

/** Redirects the browser to Facebook; the session is completed on /auth-callback by detectSessionInUrl. */
export async function signInWithFacebook(): Promise<void> {
  const { error } = await (await client()).auth.signInWithOAuth({
    provider: 'facebook',
    options: { redirectTo: authRedirectUrl() },
  });
  if (error) throw new Error(t('signIn.reason.failed'));
}

/** Emails a magic link. The link must be opened in this browser (the PKCE verifier lives in localStorage). */
export async function signInWithMagicLink(email: string): Promise<void> {
  const { error } = await (await client()).auth.signInWithOtp({
    email,
    options: { emailRedirectTo: authRedirectUrl(), shouldCreateUser: true },
  });
  if (error) throw new Error(t('signIn.magicLink.error'));
}

export async function getProfile(userId: string): Promise<{ display_name: string; avatar_url: string | null }> {
  const { data, error } = await (await client()).from('profiles').select('display_name, avatar_url').eq('id', userId).single();
  if (error) throw new Error(t('error.profile'));
  return data;
}

export async function updateDisplayName(userId: string, name: string): Promise<void> {
  const { error } = await (await client()).from('profiles').update({ display_name: name }).eq('id', userId);
  if (error) throw new Error(t('error.saveName'));
}

export async function clubExists(): Promise<boolean> {
  const { data, error } = await (await client()).rpc('club_exists');
  if (error) throw new Error(t('error.club'));
  return !!data;
}

// These throw the raw RPC error so callers can parseRpcError it.
export async function bootstrapClub(code: string): Promise<void> {
  const { error } = await (await client()).rpc('bootstrap_club', { code });
  if (error) throw error;
}

export async function joinClub(code: string): Promise<void> {
  const { error } = await (await client()).rpc('join_club', { code });
  if (error) throw error;
}

export type Member = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  role: 'admin' | 'member';
  status: 'active' | 'removed';
};

export async function listMembers(): Promise<Member[]> {
  const { data, error } = await (await client()).rpc('list_members');
  if (error) throw new Error(t('error.members'));
  return (data as Member[] | null) ?? [];
}

/** Soft removal (status becomes 'removed'); throws the raw RPC error so callers can parseRpcError it. */
export async function removeMember(userId: string): Promise<void> {
  const { error } = await (await client()).rpc('remove_member', { user_id: userId });
  if (error) throw error;
}

export async function getMembership(): Promise<Membership> {
  const { data, error } = await (await client()).rpc('my_membership');
  if (error) throw new Error(t('error.membership'));
  return ((data as NonNullable<Membership>[] | null) ?? [])[0] ?? null;
}

/** Calls the delete-account Edge Function (no Apple code on web). Throws Error(code) with the function's `error` code, or 'unknown'. */
export async function deleteAccount(): Promise<void> {
  const { error } = await (await client()).functions.invoke('delete-account', { body: {} });
  if (!error) return;
  let code = 'unknown';
  try {
    code = (await (error as { context?: Response }).context?.json())?.error ?? 'unknown';
  } catch {
    // network failure or a non-JSON body
  }
  throw new Error(code);
}
