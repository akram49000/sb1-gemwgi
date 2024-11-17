import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and ensure both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(
    'Invalid Supabase URL format. Please ensure VITE_SUPABASE_URL is a valid URL.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);