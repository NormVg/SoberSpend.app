import { createClient } from '@supabase/supabase-js';

import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/constants/api';

// Create Supabase client for React Native (Expo Go compatible)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // In Expo Go, AsyncStorage requires a native rebuild,
    // so we fall back to in-memory storage for testing
    detectSessionInUrl: false,
  },
});
