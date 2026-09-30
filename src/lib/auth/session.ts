import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const requireAccount = cache(async () => {
  if (!isSupabaseConfigured()) redirect("/login");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims.sub) redirect("/login");
  const userId = data.claims.sub;
  const [profile, preferences] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", userId).single(),
    supabase.from("user_preferences").select("*").eq("user_id", userId).single(),
  ]);
  if (profile.error || preferences.error) throw new Error("Account setup could not be loaded. Confirm that foundation migrations are applied, then retry.");
  return { supabase, userId, email: String(data.claims.email ?? ""), profile: profile.data, preferences: preferences.data };
});
