import { AuthForm } from "@/features/auth/auth-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";
export const metadata = { title: "Recover account" };
export default function RecoveryPage() { return <AuthForm kind="recovery" configured={isSupabaseConfigured()} />; }
