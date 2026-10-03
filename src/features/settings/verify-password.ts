import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseEnvironment } from "@/lib/supabase/env";

/** Verify now, without replacing the caller's cookie session or persisting credentials. */
export async function verifyCurrentPassword(
  userId: string,
  email: string,
  password: string,
): Promise<boolean> {
  const { url, key } = supabaseEnvironment();
  const client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (error || data.user?.id !== userId) return false;
  try {
    await client.auth.signOut({ scope: "local" });
  } catch {
    /* Ephemeral session is never stored. */
  }
  return true;
}
