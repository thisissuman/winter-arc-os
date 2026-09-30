import { AuthForm } from "@/features/auth/auth-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";
export const metadata = { title: "Create account" };
export default function SignupPage() { return <AuthForm kind="signup" configured={isSupabaseConfigured()} />; }
