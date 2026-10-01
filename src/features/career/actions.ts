"use server";

import { revalidatePath } from "next/cache";
import { requireAccount } from "@/lib/auth/session";
import type { FormState } from "@/lib/auth/validation";
import type { FocusTimer, StudyCategory, StudySession } from "@/features/tracking/types";
import { careerSetupSchema, controlTimerSchema, startTimerSchema, studyCategorySchema, studySessionSchema } from "./validation";

export type CareerState = FormState & { id?: string };
type RpcName = "setup_career" | "save_study_category" | "save_study_session" | "start_focus_timer" | "control_focus_timer";
type RpcError = { code?: string; message?: string };
async function call<T>(name: RpcName, args: Record<string, unknown>): Promise<{ data: T | null; error: RpcError | null; privacyMode: boolean }> {
  const { supabase, preferences } = await requireAccount();
  const client = supabase as unknown as { rpc: (name: RpcName, args: Record<string, unknown>) => Promise<{ data: T | null; error: RpcError | null }> };
  try { return { ...await client.rpc(name, args), privacyMode: preferences.privacy_mode }; } catch { return { data: null, error: { code: "NETWORK" }, privacyMode: preferences.privacy_mode }; }
}
function presentTimer(timer: FocusTimer, privacyMode: boolean): FocusTimer {
  return privacyMode ? { ...timer, topic: "", notes: "", segments: [] } : timer;
}
function failure(error: RpcError): CareerState {
  if (error.code === "40001") return { status: "error", message: "This record changed in another tab. Reload and try again." };
  if (error.code === "23505") return { status: "error", message: "A timer or category with this name is already active. Refresh to see the latest state." };
  if (["23514", "23503", "22P02", "22007", "42501"].includes(error.code ?? "")) return { status: "error", message: error.message?.slice(0, 180) ?? "Review the study entry and retry." };
  return { status: "error", message: "Could not save. Check your connection; the timer remains unsaved until the server confirms." };
}
function success(message: string, id?: string): CareerState { revalidatePath("/", "layout"); return { status: "success", message, id }; }

export async function setupCareer(_previous: CareerState, form: FormData): Promise<CareerState> {
  const parsed = careerSetupSchema.safeParse({ dailyMinutes: form.get("dailyMinutes"), weeklyMinutes: form.get("weeklyMinutes") });
  if (!parsed.success) return { status: "error", message: "Use positive study targets up to 10,080 minutes, or leave them empty." };
  const { error } = await call<null>("setup_career", { p_input: parsed.data });
  return error ? failure(error) : success("Study tracking is ready. No sessions were added.");
}

export async function saveStudyCategory(_previous: CareerState, form: FormData): Promise<CareerState> {
  const parsed = studyCategorySchema.safeParse({ id: form.get("id"), expectedUpdatedAt: form.get("expectedUpdatedAt"), categoryId: form.get("categoryId"), name: form.get("name"), position: form.get("position") ?? "0", archive: form.get("archive") === "true" });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Review the category." };
  const { data, error } = await call<StudyCategory>("save_study_category", { p_input: parsed.data });
  return error ? failure(error) : success(parsed.data.archive ? "Category archived; study history remains." : "Category saved.", data?.id);
}

export async function saveStudySession(_previous: CareerState, form: FormData): Promise<CareerState> {
  const parsed = studySessionSchema.safeParse({
    id: form.get("id"), expectedRevision: form.get("expectedRevision"), categoryId: form.get("categoryId"), challengeId: form.get("challengeId"),
    date: form.get("date"), durationSeconds: form.get("durationSeconds"), startAt: form.get("startAt"), endAt: form.get("endAt"),
    topic: form.get("topic") ?? "", notes: form.get("notes") ?? "", delete: form.get("delete") === "true",
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Review the study session." };
  const { data, error } = await call<StudySession>("save_study_session", { p_input: parsed.data });
  return error ? failure(error) : success(parsed.data.delete ? "Manual session deleted." : "Study session saved.", data?.id);
}

export type TimerResult = { ok: true; timer: FocusTimer; sessionId?: string } | { ok: false; message: string };
export async function readActiveTimer(): Promise<FocusTimer | null> {
  const { supabase, userId, preferences } = await requireAccount();
  const { data, error } = await supabase.from("focus_timers").select("*").eq("user_id", userId).in("status", ["running", "paused"]).limit(1).maybeSingle();
  if (error) throw new Error("Could not read the active timer.");
  return data ? { ...presentTimer(data as FocusTimer, preferences.privacy_mode), segments: [] } : null;
}
export async function startFocusTimer(input: unknown): Promise<TimerResult> {
  const parsed = startTimerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Choose a category." };
  const { data, error, privacyMode } = await call<FocusTimer>("start_focus_timer", { p_input: parsed.data });
  if (error) return { ok: false, message: failure(error).message ?? "Start failed." };
  if (!data) return { ok: false, message: "The server did not confirm the timer. Refresh before retrying." };
  revalidatePath("/", "layout");
  return { ok: true, timer: presentTimer(data, privacyMode) };
}
export async function controlFocusTimer(input: unknown): Promise<TimerResult> {
  const parsed = controlTimerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "The timer state is invalid. Refresh and retry." };
  const { data, error, privacyMode } = await call<{ timer: FocusTimer; session?: StudySession }>("control_focus_timer", { p_id: parsed.data.id, p_action: parsed.data.action, p_expected_revision: parsed.data.expectedRevision });
  if (error) return { ok: false, message: failure(error).message ?? "Timer update failed." };
  if (!data?.timer) return { ok: false, message: "The server did not confirm the timer change. Refresh and retry." };
  revalidatePath("/", "layout");
  return { ok: true, timer: presentTimer(data.timer, privacyMode), sessionId: data.session?.id };
}
