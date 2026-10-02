import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { supabaseEnvironment } from "./env";

export function isAccountDeletionConfigured() {
  const key = process.env.SUPABASE_SECRET_KEY;
  return Boolean(key && !key.startsWith("replace-"));
}

/** Privileged access is isolated to verified self-deletion, never ordinary queries. */
export function createAdminClient() {
  if (!isAccountDeletionConfigured()) throw new Error("Account deletion is not configured.");
  const { url } = supabaseEnvironment();
  if (process.env.SUPABASE_URL && process.env.SUPABASE_URL !== url) throw new Error("Supabase project URL mismatch.");
  return createClient<Database>(url, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
