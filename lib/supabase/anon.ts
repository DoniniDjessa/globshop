import "server-only";

import { createClient } from "@supabase/supabase-js";

export function getAnonSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL as string | undefined;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string | undefined;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase env vars (SUPABASE_URL, SUPABASE_ANON_KEY) are missing");
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}


