"use server";
import { revalidatePath } from "next/cache";
import { requireAccount } from "@/lib/auth/session";
import { completionSchema, habitSchema, identitySchema } from "./validation";
import type { FormState } from "@/lib/auth/validation";
function refresh() {
  revalidatePath("/today");
  revalidatePath("/habits");
}
function failure(code?: string): FormState {
  return {
    status: "error",
    message:
      code === "PT409"
        ? "This habit changed elsewhere. Reload and try again."
        : "Could not save. Check your connection and try again.",
  };
}
export async function saveHabit(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const parsed = habitSchema.safeParse({
    id: form.get("id") || undefined,
    name: form.get("name"),
    weekdays: form.getAll("weekday").map(Number),
    expectedRevision: Number(form.get("revision") ?? 0),
  });
  if (!parsed.success)
    return {
      status: "error",
      message: "Check the name and schedule.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  const { supabase, preferences } = await requireAccount();
  if (preferences.privacy_mode)
    return {
      status: "error",
      message: "Turn off Privacy Mode to edit habit names.",
    };
  const { error } = await supabase.rpc("save_habit", {
    p_name: parsed.data.name,
    p_weekdays: parsed.data.weekdays,
    p_habit_id: parsed.data.id,
    p_expected_revision: parsed.data.expectedRevision,
  });
  if (error) return failure(error.code);
  refresh();
  return {
    status: "success",
    message: parsed.data.id
      ? "Habit saved. Schedule changes begin tomorrow."
      : "Habit created. You can start today.",
  };
}
export async function setCompletion(input: unknown): Promise<FormState> {
  const parsed = completionSchema.safeParse(input);
  if (!parsed.success)
    return { status: "error", message: "Choose an available date." };
  const { supabase } = await requireAccount();
  const { error } = await supabase.rpc("set_habit_completion", {
    p_habit_id: parsed.data.habitId,
    p_business_date: parsed.data.businessDate,
    p_completed: parsed.data.completed,
    p_expected_revision: parsed.data.expectedRevision,
  });
  if (error) return failure(error.code);
  refresh();
  return { status: "success" };
}
export async function removeHabit(
  input: unknown,
  permanent: boolean,
  confirmation?: string,
): Promise<FormState> {
  const parsed = identitySchema.safeParse(input);
  if (!parsed.success || (permanent && confirmation !== "DELETE HABIT"))
    return { status: "error", message: "Confirm which habit to delete." };
  const { supabase } = await requireAccount();
  const result = permanent
    ? await supabase.rpc("delete_habit", {
        p_habit_id: parsed.data.habitId,
        p_expected_revision: parsed.data.expectedRevision,
        p_confirmation: "DELETE HABIT",
      })
    : await supabase.rpc("archive_habit", {
        p_habit_id: parsed.data.habitId,
        p_expected_revision: parsed.data.expectedRevision,
      });
  if (result.error) return failure(result.error.code);
  refresh();
  return {
    status: "success",
    message: permanent
      ? "Habit permanently deleted."
      : "Archived from tomorrow. History is retained.",
  };
}
