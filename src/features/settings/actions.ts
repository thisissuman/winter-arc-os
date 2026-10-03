"use server";

import { preferencesSchema } from "./validation";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireAccount } from "@/lib/auth/session";
import { profileSchema, type FormState } from "@/lib/auth/validation";

export async function updateProfile(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const parsed = profileSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return { status: "error", message: "Use a name up to 80 characters." };
  const { supabase, userId } = await requireAccount();
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({ display_name: parsed.data.displayName })
      .eq("user_id", userId)
      .select("user_id")
      .single();
    if (error || !data)
      return {
        status: "error",
        message: "Your profile could not be saved. Try again.",
      };
  } catch {
    return {
      status: "error",
      message:
        "Your profile could not be saved. Check your connection and retry.",
    };
  }
  revalidatePath("/", "layout");
  return { status: "success", message: "Profile saved." };
}

export async function updatePreferences(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const parsed = preferencesSchema.safeParse({
    ...Object.fromEntries(form),
    privacy: form.get("privacy") ?? "false",
  });
  if (!parsed.success)
    return {
      status: "error",
      message: "Choose a valid theme, timezone, and week start.",
    };
  const { supabase, userId } = await requireAccount();
  const { theme, timezone, weekStartsOn, privacy } = parsed.data;
  const { data, error } = await supabase
    .from("user_preferences")
    .update({
      theme,
      timezone,
      week_starts_on: weekStartsOn,
      privacy_mode: privacy === "true",
    })
    .eq("user_id", userId)
    .select("user_id")
    .single();
  if (error || !data)
    return {
      status: "error",
      message: "Preferences could not be saved. Try again.",
    };
  (await cookies()).set("winter-arc-theme", theme, {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 31536000,
  });
  revalidatePath("/", "layout");
  return {
    status: "success",
    message: "Preferences saved. Existing habit dates are retained.",
  };
}
