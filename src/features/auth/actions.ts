"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { applicationOrigin } from "@/lib/auth/origin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { loginSchema, signupSchema, recoverySchema, passwordSchema, type FormState } from "@/lib/auth/validation";

const unavailable: FormState = { status: "error", message: "Account service is unavailable. Check configuration or try again shortly." };
function invalid(error: z.ZodError): FormState {
  return { status: "error", message: "Check the highlighted fields.", fieldErrors: z.flattenError(error).fieldErrors };
}

export async function login(_previous: FormState, form: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return invalid(parsed.error);
  if (!isSupabaseConfigured()) return unavailable;
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) return { status: "error", message: "Unable to sign in. Check your email and password, and confirm your email if you recently signed up." };
    const { data: preferences } = await supabase.from("user_preferences").select("theme").single();
    if (preferences && ["dark", "light", "system"].includes(preferences.theme)) {
      (await cookies()).set("winter-arc-theme", preferences.theme, { path: "/", sameSite: "lax", httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 31536000 });
    }
  } catch { return unavailable; }
  revalidatePath("/", "layout");
  redirect("/today");
}

export async function signup(_previous: FormState, form: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return invalid(parsed.error);
  if (!isSupabaseConfigured()) return unavailable;
  try {
    const supabase = await createClient();
    const { email, password, displayName } = parsed.data;
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { display_name: displayName }, emailRedirectTo: `${applicationOrigin()}/auth/confirm` },
    });
    if (error) return { status: "error", message: "Unable to create an account. Try again shortly or sign in if you already have an account." };
  } catch { return unavailable; }
  return { status: "success", message: "Check your email for a confirmation link. If you already have an account, sign in instead." };
}

export async function requestRecovery(_previous: FormState, form: FormData): Promise<FormState> {
  const parsed = recoverySchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return invalid(parsed.error);
  if (!isSupabaseConfigured()) return unavailable;
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${applicationOrigin()}/auth/confirm?next=/reset-password`,
    });
    if (error) return { status: "error", message: "The recovery email could not be requested. Try again shortly." };
  } catch { return unavailable; }
  return { status: "success", message: "If an account matches this email, a recovery link will arrive shortly." };
}

export async function resetPassword(_previous: FormState, form: FormData): Promise<FormState> {
  const parsed = passwordSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return invalid(parsed.error);
  if (!isSupabaseConfigured()) return unavailable;
  try {
    const supabase = await createClient();
    const { data, error: identityError } = await supabase.auth.getUser();
    if (identityError || !data.user) return { status: "error", message: "Your recovery session expired. Request a new link." };
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) return { status: "error", message: "Password could not be updated. Choose a different password or request a fresh link." };
    const { error: signoutError } = await supabase.auth.signOut({ scope: "others" });
    if (signoutError) return { status: "success", message: "Password updated. Other sessions could not be closed; sign out from those devices." };
  } catch { return unavailable; }
  revalidatePath("/", "layout");
  redirect("/today");
}

export async function logout(): Promise<FormState> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) return { status: "error", message: "Sign out failed. Try again." };
    (await cookies()).delete("winter-arc-theme");
  } catch { return unavailable; }
  revalidatePath("/", "layout");
  redirect("/login");
}
