import type { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { supabase } from '@/shared/supabase';

import type { SignInReason } from '../logic/authLogic';

type SessionValue = {
  status: 'loading' | 'signedOut' | 'signedIn';
  session: Session | null;
  /** Why the user is signed out, for the sign-in message; null on a fresh load. */
  reason: SignInReason | null;
  signOut: (reason: 'logout' | 'removed' | 'deleted') => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<{ loaded: boolean; session: Session | null; reason: SignInReason | null }>({
    loaded: false,
    session: null,
    reason: null,
  });
  const userInitiated = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setState((s) => (s.loaded ? s : { ...s, loaded: true, session: data.session }));
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // Not started by us (refresh token revoked or expired): expiry.
        if (!userInitiated.current) {
          queryClient.clear();
          setState({ loaded: true, session: null, reason: 'expired' });
        }
      } else {
        setState((s) => ({ loaded: true, session, reason: session ? null : s.reason }));
      }
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient]);

  const signOut = useCallback(
    async (reason: 'logout' | 'removed' | 'deleted') => {
      userInitiated.current = true;
      try {
        // After deletion the server session is already gone: sign out locally and ignore its 401/404.
        await supabase.auth.signOut(reason === 'deleted' ? { scope: 'local' } : undefined);
      } finally {
        userInitiated.current = false;
      }
      queryClient.clear();
      setState({ loaded: true, session: null, reason });
    },
    [queryClient],
  );

  const value = useMemo<SessionValue>(
    () => ({
      status: !state.loaded ? 'loading' : state.session ? 'signedIn' : 'signedOut',
      session: state.session,
      reason: state.reason,
      signOut,
    }),
    [state, signOut],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const v = useContext(SessionContext);
  if (!v) throw new Error('useSession outside SessionProvider');
  return v;
}
