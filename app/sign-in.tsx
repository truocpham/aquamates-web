import { useLocalSearchParams } from 'expo-router';

import { SignInScreen } from '@/features/auth/components/SignInScreen';

export default function SignIn() {
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  return <SignInScreen reason={reason} />;
}
