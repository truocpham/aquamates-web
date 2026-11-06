import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { secureStoreAdapter } from '../secureStorage';
import { THEME_STORAGE_KEY, resolveScheme, themes, type ThemeChoice, type ThemeColors, type ThemeScheme } from './theme';

export type Theme = {
  /** Active token set. */
  colors: ThemeColors;
  /** Active mode after resolving the saved choice and the phone setting. */
  scheme: ThemeScheme;
  /** Saved choice (system, light, dark). */
  choice: ThemeChoice;
  /** False until the saved choice has been read from the device. */
  ready: boolean;
  /** Switches now and saves the choice on the device. */
  setChoice: (next: ThemeChoice) => Promise<void>;
};

const defaultTheme: Theme = { colors: themes.light, scheme: 'light', choice: 'system', ready: true, setChoice: async () => {} };
const ThemeContext = createContext<Theme>(defaultTheme);

function parseChoice(saved: string | null): ThemeChoice {
  return saved === 'light' || saved === 'dark' ? saved : 'system';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const phone = useColorScheme();
  const [choice, setChoiceState] = useState<ThemeChoice>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    secureStoreAdapter
      .getItem(THEME_STORAGE_KEY)
      .catch(() => null)
      .then((saved) => {
        if (cancelled) return;
        setChoiceState(parseChoice(saved));
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setChoice = useCallback(async (next: ThemeChoice) => {
    setChoiceState(next);
    await secureStoreAdapter.setItem(THEME_STORAGE_KEY, next);
  }, []);

  const value = useMemo<Theme>(() => {
    const scheme = resolveScheme(choice, phone);
    return { colors: themes[scheme], scheme, choice, ready, setChoice };
  }, [choice, phone, ready, setChoice]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** The active token set and mode; re-renders when the choice or the phone setting changes. */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}
