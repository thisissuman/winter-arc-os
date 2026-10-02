"use server";

import { revalidatePath } from "next/cache";
import { requireAccount } from "@/lib/auth/session";
import type { FormState } from "@/lib/auth/validation";
import { organizationSchema } from "./data-validation";

export type OrganizationState = FormState & { updatedAt?: string };
export async function saveOrganization(_previous: OrganizationState, form: FormData): Promise<OrganizationState> {
  const intent = form.get("intent");
  const parsed = organizationSchema.safeParse({
    ...Object.fromEntries(form), archived: intent === "archive" || intent !== "restore" && form.get("archived") === "true",
  });
  if (!parsed.success) return { status: "error", message: "Use a name up to 80 characters and a valid order and life area." };
  const { supabase, userId } = await requireAccount();
  const value = parsed.data;
  try {
    if (value.kind === "category" && value.areaId) {
      const { data, error } = await supabase.from("life_areas").select("id").eq("user_id", userId).eq("id", value.areaId).maybeSingle();
      if (error || !data) return { status: "error", message: "Choose one of your available life areas." };
    }
    const fields = {
      name: value.name, position: value.position, archived_at: value.archived ? new Date().toISOString() : null,
    };
    const result = value.kind === "area"
      ? value.id
        ? await supabase.from("life_areas").update(fields).eq("user_id", userId).eq("id", value.id).eq("updated_at", value.expectedUpdatedAt).select("updated_at").maybeSingle()
        : await supabase.from("life_areas").insert({ ...fields, user_id: userId }).select("updated_at").single()
      : value.id
        ? await supabase.from("categories").update({ ...fields, life_area_id: value.areaId || null }).eq("user_id", userId).eq("id", value.id).eq("updated_at", value.expectedUpdatedAt).select("updated_at").maybeSingle()
        : await supabase.from("categories").insert({ ...fields, life_area_id: value.areaId || null, user_id: userId }).select("updated_at").single();
    if (result.error) return { status: "error", message: "Could not save. Check your connection and selected life area." };
    if (!result.data) return { status: "error", message: "This item changed elsewhere. Reload and try again." };
    revalidatePath("/", "layout");
    return { status: "success", message: value.archived ? "Archived. Existing history remains linked." : "Organization saved.", updatedAt: result.data.updated_at };
  } catch { return { status: "error", message: "Could not save. Check your connection and retry." }; }
}
