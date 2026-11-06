import { createClient } from '@supabase/supabase-js';

import { config } from './config';
import { secureStoreAdapter } from './secureStorage';

export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: {
    storage: secureStoreAdapter,
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
