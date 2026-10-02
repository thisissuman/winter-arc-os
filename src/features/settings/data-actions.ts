"use server";

import { revalidatePath } from "next/cache";
import { requireAccount } from "@/lib/auth/session";
import type { FormState } from "@/lib/auth/validation";
import { workspaceDeletionSchema } from "./data-validation";
import { verifyCurrentPassword } from "./verify-password";

export async function deleteWorkspaceData(_previous: FormState, form: FormData): Promise<FormState> {
  const parsed = workspaceDeletionSchema.safeParse({ password: form.get("password"), confirmation: form.get("confirmation") });
  if (!parsed.success) return { status: "error", message: "Enter your current password and type DELETE MY DATA." };
  const { supabase, userId } = await requireAccount();
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || data.user?.id !== userId || !data.user.email) return { status: "error", message: "Sign in again before deleting data." };
    if (!await verifyCurrentPassword(userId, data.user.email, parsed.data.password))
      return { status: "error", message: "Password verification failed. Check your current password." };
    const { error: deletionError } = await supabase.rpc("delete_workspace_data", { p_confirmation: parsed.data.confirmation });
    if (deletionError) return { status: "error", message: "Could not delete workspace data. Check your connection and retry." };
    revalidatePath("/", "layout");
    return { status: "success", message: "Workspace data deleted. Your account and preferences are retained." };
  } catch { return { status: "error", message: "Could not delete workspace data. Check your connection and retry." }; }
}
