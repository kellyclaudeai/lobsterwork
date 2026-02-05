import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// We don't currently check in generated Supabase types, so we use the default
// `SupabaseClient<Database = any>` type here.
let cachedAdminClient: SupabaseClient | null = null;

export function createAdminClient() {
  if (cachedAdminClient) return cachedAdminClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase admin environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    );
  }

  cachedAdminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  return cachedAdminClient;
}
