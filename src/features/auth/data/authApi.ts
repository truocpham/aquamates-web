import { authRedirectUrl } from '@/shared/authRedirect';
import { t } from '@/shared/i18n';
import { supabase } from '@/shared/supabase';

import type { Membership } from '../logic/authLogic';

/** Redirects the browser to Facebook; the session is completed on /auth-callback by detectSessionInUrl. */
export async function signInWithFacebook(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: { redirectTo: authRedirectUrl() },
  });
  if (error) throw new Error(t('signIn.reason.failed'));
}

/** Emails a magic link. The link must be opened in this browser (the PKCE verifier lives in localStorage). */
export async function signInWithMagicLink(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: authRedirectUrl(), shouldCreateUser: true },
  });
  if (error) throw new Error(t('signIn.magicLink.error'));
}

export async function getMembership(): Promise<Membership> {
  const { data, error } = await supabase.rpc('my_membership');
  if (error) throw new Error(t('error.membership'));
  return ((data as NonNullable<Membership>[] | null) ?? [])[0] ?? null;
}
