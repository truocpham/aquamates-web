function required(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing env var ${name}`);
  return value;
}

// EXPO_PUBLIC_* must be read as literal property accesses so Metro inlines them.
export const config = {
  supabaseUrl: required(process.env.EXPO_PUBLIC_SUPABASE_URL, 'EXPO_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: required(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY, 'EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  enableTestLogin: process.env.EXPO_PUBLIC_ENABLE_TEST_LOGIN === 'true' && __DEV__,
};
