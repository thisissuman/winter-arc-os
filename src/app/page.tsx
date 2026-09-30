import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
export default async function Home() {
  if (!isSupabaseConfigured()) redirect("/login");
  const { data, error } = await (await createClient()).auth.getClaims();
  redirect(!error && data?.claims.sub ? "/today" : "/login");
}
