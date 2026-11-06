import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthGate } from '@/features/auth/components/AuthGate';
import { SessionProvider } from '@/features/auth/hooks/useSession';
import { ThemeProvider, fontFamily } from '@/shared/ui';

export default function RootLayout() {
  // Fonts load in the background; text falls back to the system font until ready.
  useFonts({
    [fontFamily.regular]: PlusJakartaSans_400Regular,
    [fontFamily.semibold]: PlusJakartaSans_600SemiBold,
    [fontFamily.bold]: PlusJakartaSans_700Bold,
  });
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
