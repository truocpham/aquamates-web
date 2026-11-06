import { usePathname, useRouter } from 'expo-router';
import { useEffect, type ReactNode } from 'react';

import { useMembership } from '../hooks/useMembership';
import { useSession } from '../hooks/useSession';
import { gateRedirect, gateTarget } from '../logic/authLogic';

const AUTH_ROUTES = ['/sign-in', '/auth-callback'];

/** Sends signed-out users to sign-in, and signed-in users to home or the club code screen. */
export function AuthGate({ children }: { children: ReactNode }) {
  const { status, reason, signOut } = useSession();
  const membership = useMembership();
  const pathname = usePathname();
  const router = useRouter();
  const target = gateTarget({ status, reason, membership });
  const inAuth = AUTH_ROUTES.includes(pathname);

  useEffect(() => {
    if (target.kind === 'signOutRemoved') {
      signOut('removed');
      return;
    }
    const href = gateRedirect(target, pathname, inAuth);
    if (href) router.replace(href as never);
  }, [target.kind, target.kind === 'redirect' ? target.href : '', pathname, inAuth, router, signOut]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
