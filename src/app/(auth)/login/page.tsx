import { AuthForm } from "@/features/auth/auth-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";
export const metadata = { title: "Sign in" };
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const { notice } = await searchParams;
  const message = notice === "invalid-link" ? "That link is invalid or has expired. Request a fresh confirmation or recovery email." : notice === "verification-unavailable" ? "Email verification is unavailable. Try your link again shortly." : notice === "account-deleted" ? "Account and workspace data deleted." : undefined;
  return <AuthForm kind="login" configured={isSupabaseConfigured()} notice={message} />;
}
