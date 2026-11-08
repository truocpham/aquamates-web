import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FontDisplay, loadAsync } from 'expo-font';
import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthGate } from '@/features/auth/components/AuthGate';
import { SessionProvider } from '@/features/auth/hooks/useSession';
import { initLanguage } from '@/shared/i18n';
import { ThemeProvider, fontFamily } from '@/shared/ui';

const FONT_DELAY_MS = 1500;
const FONTS = {
  [fontFamily.regular]: { uri: PlusJakartaSans_400Regular, display: FontDisplay.SWAP },
  [fontFamily.semibold]: { uri: PlusJakartaSans_600SemiBold, display: FontDisplay.SWAP },
  [fontFamily.bold]: { uri: PlusJakartaSans_700Bold, display: FontDisplay.SWAP },
};

/**
 * Loads Plus Jakarta Sans (font-display: swap) once the first paint is done, so the font files
 * stay off the critical path and the landing page's Lighthouse score holds. Text uses the
 * system font until the fonts arrive.
 */
function useDeferredFonts() {
  useEffect(() => {
    const start = () => void loadAsync(FONTS);
    const timer = setTimeout(start, FONT_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);
}

export default function RootLayout() {
  useDeferredFonts();
  useEffect(() => void initLanguage(), []);
  const [queryClient] = useState(() => new QueryClient());
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <AuthGate>
              <Slot />
            </AuthGate>
          </SessionProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
