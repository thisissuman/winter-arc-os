"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireAccount } from "@/lib/auth/session";
import { appearanceSchema, profileSchema, type FormState } from "@/lib/auth/validation";

export async function updateProfile(_previous: FormState, form: FormData): Promise<FormState> {
  const parsed = profileSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { status: "error", message: "Enter a name between 1 and 80 characters." };
  const { supabase, userId } = await requireAccount();
  try {
    const { data, error } = await supabase.from("profiles").update({ display_name: parsed.data.displayName }).eq("user_id", userId).select("user_id").single();
    if (error || !data) return { status: "error", message: "Your profile could not be saved. Try again." };
  } catch { return { status: "error", message: "Your profile could not be saved. Check your connection and retry." }; }
  revalidatePath("/", "layout");
  return { status: "success", message: "Profile saved." };
}

export async function updateAppearance(_previous: FormState, form: FormData): Promise<FormState> {
  const parsed = appearanceSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { status: "error", message: "Choose a valid appearance." };
  const { supabase, userId } = await requireAccount();
  try {
    const { data, error } = await supabase.from("user_preferences").update({ theme: parsed.data.theme }).eq("user_id", userId).select("user_id").single();
    if (error || !data) return { status: "error", message: "Appearance could not be saved. Try again." };
    (await cookies()).set("winter-arc-theme", parsed.data.theme, { path: "/", sameSite: "lax", httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 31536000 });
  } catch { return { status: "error", message: "Appearance could not be saved. Check your connection and retry." }; }
  revalidatePath("/", "layout");
  return { status: "success", message: "Appearance saved." };
}
