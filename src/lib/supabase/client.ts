import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnvironment } from "./env";
import type { Database } from "@/types/database";

export function createClient() {
  const { url, key } = supabaseEnvironment();
  return createBrowserClient<Database>(url, key);
}
