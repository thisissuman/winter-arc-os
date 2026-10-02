"use server";

import { revalidatePath } from "next/cache";
import { requireAccount } from "@/lib/auth/session";
import { businessDate } from "@/features/tracking/dates";
import type { FormState } from "@/lib/auth/validation";
import { monthlyReflectionSchema, weeklyReviewSchema } from "./validation";

export type ReflectionState = FormState & { revision?: number };
type SaveFunction = "save_weekly_review" | "save_monthly_reflection";
function errorMessage(code?: string, message?: string) {
  if (code === "40001" || code === "23505") return "This review changed elsewhere. Reload and try again.";
  if (["23514", "22007", "22P02"].includes(code ?? "")) return message?.slice(0, 180) ?? "Review the period and ratings.";
  return "Could not save the review. Check your connection and retry.";
}
async function save(name: SaveFunction, input: Record<string, string | number | null>): Promise<ReflectionState> {
  const { supabase, preferences } = await requireAccount();
  if (String(input.periodStart) > businessDate(preferences.timezone)) return { status: "error", message: "Choose a current or past period." };
  const { data, error } = await supabase.rpc(name, { p_input: input });
  if (error || !data || typeof data !== "object" || Array.isArray(data))
    return { status: "error", message: errorMessage(error?.code, error?.message) };
  const revision = Number(data.revision);
  revalidatePath("/reflection");
  revalidatePath(name === "save_weekly_review" ? `/reflection/weekly/${input.periodStart}` : `/reflection/monthly/${String(input.periodStart).slice(0, 7)}`);
  return { status: "success", message: "Reflection saved.", revision: Number.isFinite(revision) ? revision : undefined };
}
const field = (form: FormData, name: string) => form.get(name) ?? "";
export async function saveWeeklyReview(_previous: ReflectionState, form: FormData): Promise<ReflectionState> {
  const parsed = weeklyReviewSchema.safeParse({
    periodStart: field(form, "periodStart"), expectedRevision: field(form, "expectedRevision"),
    wins: field(form, "wins"), difficulties: field(form, "difficulties"),
    lessons: field(form, "lessons"), nextWeekChanges: field(form, "nextWeekChanges"),
    energy: field(form, "energy"), focus: field(form, "focus"), motivation: field(form, "motivation"),
    stress: field(form, "stress"), mood: field(form, "mood"),
  });
  return parsed.success ? save("save_weekly_review", parsed.data) : { status: "error", message: parsed.error.issues[0]?.message ?? "Review the weekly entry." };
}
export async function saveMonthlyReflection(_previous: ReflectionState, form: FormData): Promise<ReflectionState> {
  const parsed = monthlyReflectionSchema.safeParse({
    periodStart: field(form, "periodStart"), expectedRevision: field(form, "expectedRevision"),
    biggestWins: field(form, "biggestWins"), biggestFailures: field(form, "biggestFailures"),
    habitsImproved: field(form, "habitsImproved"), habitsSlipped: field(form, "habitsSlipped"),
    fitnessProgress: field(form, "fitnessProgress"), careerProgress: field(form, "careerProgress"),
    changesNextMonth: field(form, "changesNextMonth"), notes: field(form, "notes"),
  });
  return parsed.success ? save("save_monthly_reflection", parsed.data) : { status: "error", message: parsed.error.issues[0]?.message ?? "Review the monthly entry." };
}
