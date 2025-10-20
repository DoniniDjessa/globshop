import "server-only";

import { createClient } from "@supabase/supabase-js";

export function getServerSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL as string | undefined;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase env vars (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are missing");
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}


