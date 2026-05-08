import { createClient } from '@supabase/supabase-js';

const getEnvValue = (key: string) => {
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key] as string;
  }

  if (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.[key]) {
    return (import.meta as any).env[key] as string;
  }

  return '';
};

const supabaseUrl = getEnvValue('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvValue('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[supabaseClient] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
