import { createClient } from '@supabase/supabase-js';

// In Workers, secrets/env vars come from `c.env`, not `process.env`.
// This helper builds a fresh client per-request using the bound env.
export function getSupabase(env) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ SUPABASE_URL or SUPABASE_SERVICE_KEY missing from Worker env');
  }
  return createClient(supabaseUrl || '', supabaseKey || '');
}
