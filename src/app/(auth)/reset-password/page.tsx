import { redirect } from "next/navigation";
import { AuthForm } from "@/features/auth/auth-form";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
export const metadata = { title: "Reset password" };
export default async function ResetPage() {
  if (!isSupabaseConfigured()) redirect("/forgot-password");
  const { data, error } = await (await createClient()).auth.getClaims();
  if (error || !data?.claims.sub) redirect("/forgot-password");
  return <AuthForm kind="reset" configured />;
}
