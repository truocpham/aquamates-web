/**
 * Loads the Supabase client on demand. supabase-js is a large dependency that the public landing
 * page does not need, so it is split into its own chunk and fetched after first paint.
 */
export const loadSupabase = () => import('./supabase').then((m) => m.supabase);
