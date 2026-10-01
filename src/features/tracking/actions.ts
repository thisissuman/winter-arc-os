"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAccount } from "@/lib/auth/session";
import type { FormState } from "@/lib/auth/validation";
import type { HabitLog, HabitLogInput, MetricIncrementInput, MetricLog, MetricLogInput, MutationResult } from "./types";
import {
  associationSchema, challengeSchema, definitionActionSchema, frequencySchema, habitLogSchema,
  habitSchema, metricIncrementSchema, metricLogSchema, metricSchema, onboardingSchema,
  permanentDeleteSchema, scoreCategorySchema, scorePolicySchema, selectChallengeSchema,
} from "./validation";

type RpcError = { code?: string; message?: string };
type RpcName = "save_tracking_challenge" | "associate_tracking_challenge" | "save_tracking_habit" | "save_tracking_metric" | "save_tracking_frequency" | "write_tracking_habit_log" | "write_tracking_metric_log" | "increment_tracking_metric" | "save_tracking_score_category" | "save_tracking_score_policy" | "archive_tracking_definition" | "delete_tracking_definition" | "complete_tracking_onboarding";
function errorResult(error: RpcError): { message: string; code: "validation" | "conflict" | "storage" } {
  if (error.code === "40001" || error.code === "23505" || error.code === "23P01") return { code: "conflict", message: "This entry changed or conflicts with another rule. Reload and try again." };
  if (["23514", "23503", "22P02", "22007", "42501"].includes(error.code ?? "")) return { code: "validation", message: "This record or date is not available for that change. Review the form and retry." };
  return { code: "storage", message: "Could not save this change. Check your connection and try again." };
}
function formError(error: z.ZodError): FormState {
  return { status: "error", message: error.issues[0]?.message ?? "Review the highlighted values and retry." };
}
function formSuccess(message: string): FormState { revalidatePath("/", "layout"); return { status: "success", message }; }
function raw(form: FormData) { return Object.fromEntries(form.entries()); }
function lists(form: FormData) { return { ...raw(form), habitIds: form.getAll("habitIds"), metricIds: form.getAll("metricIds"), frequencyTargetIds: form.getAll("frequencyTargetIds") }; }
function habitFields(form: FormData) { return { ...raw(form), weekdays: form.getAll("weekdays") }; }
function parseJson(value: FormDataEntryValue | null): unknown { try { return typeof value === "string" ? JSON.parse(value) : null; } catch { return null; } }
async function call<T>(name: RpcName, args: Record<string, unknown>): Promise<{ data: T | null; error: RpcError | null }> {
  const { supabase } = await requireAccount();
  const client = supabase as unknown as { rpc: (name: RpcName, args: Record<string, unknown>) => Promise<{ data: T | null; error: RpcError | null }> };
  try { return await client.rpc(name, args); }
  catch { return { data: null, error: { code: "NETWORK" } }; }
}
async function submitForm(name: RpcName, input: Record<string, unknown>, success: string): Promise<FormState> {
  const { error } = await call<unknown>(name, { p_input: input });
  return error ? { status: "error", message: errorResult(error).message } : formSuccess(success);
}
export async function saveChallenge(_previous: FormState, form: FormData): Promise<FormState> {
  const parsed = challengeSchema.safeParse(lists(form));
  return parsed.success ? submitForm("save_tracking_challenge", parsed.data, "Challenge saved.") : formError(parsed.error);
}
export async function associateTrackers(_previous: FormState, form: FormData): Promise<FormState> {
  const parsed = associationSchema.safeParse(lists(form));
  return parsed.success ? submitForm("associate_tracking_challenge", parsed.data, "Challenge trackers saved.") : formError(parsed.error);
}
export async function selectChallenge(_previous: FormState, form: FormData): Promise<FormState> {
  const parsed = selectChallengeSchema.safeParse(raw(form));
  if (!parsed.success) return formError(parsed.error);
  const { supabase, userId } = await requireAccount();
  const client = supabase;
  if (parsed.data.challengeId) {
    const owned = await client.from("challenges").select("id").eq("id", parsed.data.challengeId).eq("user_id", userId).neq("status", "archived").maybeSingle();
    if (owned.error || !owned.data) return { status: "error", message: "Choose an available challenge." };
  }
  const { data, error } = await client.from("user_preferences").update({ selected_challenge_id: parsed.data.challengeId }).eq("user_id", userId).select("user_id").single();
  return error || !data ? { status: "error", message: "Could not switch challenges. Try again." } : formSuccess(parsed.data.challengeId ? "Challenge selected." : "Personal tracking selected.");
}
export async function saveHabit(_previous: FormState, form: FormData): Promise<FormState> {
  const parsed = habitSchema.safeParse(habitFields(form));
  return parsed.success ? submitForm("save_tracking_habit", parsed.data, "Habit saved.") : formError(parsed.error);
}
export async function saveMetric(_previous: FormState, form: FormData): Promise<FormState> {
  const parsed = metricSchema.safeParse(raw(form));
  return parsed.success ? submitForm("save_tracking_metric", parsed.data, "Metric saved.") : formError(parsed.error);
}
export async function saveFrequencyTarget(_previous: FormState, form: FormData): Promise<FormState> {
  const parsed = frequencySchema.safeParse(raw(form));
  return parsed.success ? submitForm("save_tracking_frequency", parsed.data, "Frequency target saved.") : formError(parsed.error);
}
export async function saveScoreCategory(_previous: FormState, form: FormData): Promise<FormState> {
  const parsed = scoreCategorySchema.safeParse(raw(form));
  return parsed.success ? submitForm("save_tracking_score_category", parsed.data, "Scoring category saved.") : formError(parsed.error);
}
export async function saveScorePolicy(_previous: FormState, form: FormData): Promise<FormState> {
  const parsed = scorePolicySchema.safeParse({ ...raw(form), weights: parseJson(form.get("weights")), items: parseJson(form.get("items")) });
  return parsed.success ? submitForm("save_tracking_score_policy", parsed.data, "A new score policy version was saved.") : formError(parsed.error);
}
export async function completeOnboarding(_previous: FormState, form: FormData): Promise<FormState> {
  const parsed = onboardingSchema.safeParse(raw(form));
  return parsed.success ? submitForm("complete_tracking_onboarding", parsed.data, parsed.data.applyStarter ? "Calendar and starter definitions saved. No history was added." : "Calendar preferences saved.") : formError(parsed.error);
}
export async function saveTrackingPreferences(_previous: FormState, form: FormData): Promise<FormState> {
  const checked = z.preprocess((value) => value === "on", z.boolean());
  const parsed = z.object({ privacyMode: checked, hidePrivateToday: checked }).safeParse(raw(form));
  if (!parsed.success) return formError(parsed.error);
  const { supabase, userId } = await requireAccount();
  const { data, error } = await supabase.from("user_preferences").update({ privacy_mode: parsed.data.privacyMode, hide_private_today: parsed.data.hidePrivateToday }).eq("user_id", userId).select("user_id").single();
  return error || !data ? { status: "error", message: "Privacy settings could not be saved." } : formSuccess("Privacy settings saved.");
}
async function definitionAction(form: FormData, kind: "habit" | "metric" | "frequency" | "challenge", mode: "archive" | "delete"): Promise<FormState> {
  const parsed = (mode === "delete" ? permanentDeleteSchema : definitionActionSchema).safeParse(raw(form));
  if (!parsed.success) return formError(parsed.error);
  const result = await call<unknown>(mode === "archive" ? "archive_tracking_definition" : "delete_tracking_definition", { p_kind: kind, p_id: parsed.data.id, p_expected_at: parsed.data.expectedUpdatedAt });
  return result.error ? { status: "error", message: errorResult(result.error).message } : formSuccess(mode === "archive" ? "Archived. History remains available." : "Permanently deleted with its history.");
}
export async function archiveChallenge(_previous: FormState, form: FormData) { return definitionAction(form, "challenge", "archive"); }
export async function deleteChallenge(_previous: FormState, form: FormData) { return definitionAction(form, "challenge", "delete"); }
export async function archiveHabit(_previous: FormState, form: FormData) { return definitionAction(form, "habit", "archive"); }
export async function deleteHabit(_previous: FormState, form: FormData) { return definitionAction(form, "habit", "delete"); }
export async function archiveMetric(_previous: FormState, form: FormData) { return definitionAction(form, "metric", "archive"); }
export async function deleteMetric(_previous: FormState, form: FormData) { return definitionAction(form, "metric", "delete"); }
export async function archiveFrequencyTarget(_previous: FormState, form: FormData) { return definitionAction(form, "frequency", "archive"); }
export async function deleteFrequencyTarget(_previous: FormState, form: FormData) { return definitionAction(form, "frequency", "delete"); }

export async function logHabit(input: HabitLogInput): Promise<MutationResult<HabitLog | null>> {
  const parsed = habitLogSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "validation", message: parsed.error.issues[0]?.message ?? "Check this habit entry." };
  const { data, error } = await call<HabitLog>("write_tracking_habit_log", { p_input: parsed.data });
  if (error) return { ok: false, ...errorResult(error) };
  if (!data) { revalidatePath("/", "layout"); return { ok: true, data: null }; }
  const { supabase } = await requireAccount();
  const { data: owner } = await supabase.from("habits").select("is_private").eq("id", data.habit_id).maybeSingle();
  const { preferences } = await requireAccount();
  revalidatePath("/", "layout");
  return { ok: true, data: preferences.privacy_mode && owner?.is_private !== false ? { ...data, notes: "" } : data };
}
export async function saveMetricValue(input: MetricLogInput): Promise<MutationResult<MetricLog | null>> {
  const parsed = metricLogSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "validation", message: parsed.error.issues[0]?.message ?? "Check this measurement." };
  const { data, error } = await call<MetricLog>("write_tracking_metric_log", { p_input: parsed.data });
  if (error) return { ok: false, ...errorResult(error) };
  if (!data) { revalidatePath("/", "layout"); return { ok: true, data: null }; }
  const { supabase, preferences } = await requireAccount();
  const { data: owner } = await supabase.from("metric_definitions").select("is_private").eq("id", data.metric_id).maybeSingle();
  revalidatePath("/", "layout");
  return { ok: true, data: preferences.privacy_mode && owner?.is_private !== false ? { ...data, notes: "" } : data };
}
export async function incrementMetric(input: MetricIncrementInput): Promise<MutationResult<MetricLog>> {
  const parsed = metricIncrementSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "validation", message: parsed.error.issues[0]?.message ?? "Check this addition." };
  const { data, error } = await call<MetricLog>("increment_tracking_metric", { p_input: parsed.data });
  if (error) return { ok: false, ...errorResult(error) };
  if (!data) return { ok: false, code: "storage", message: "The addition did not return a saved value. Refresh before retrying." };
  const { supabase, preferences } = await requireAccount();
  const { data: owner } = await supabase.from("metric_definitions").select("is_private").eq("id", data.metric_id).maybeSingle();
  revalidatePath("/", "layout");
  return { ok: true, data: preferences.privacy_mode && owner?.is_private !== false ? { ...data, notes: "" } : data };
}
