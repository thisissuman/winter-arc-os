"use server";

import { revalidatePath } from "next/cache";
import { requireAccount } from "@/lib/auth/session";
import type { FormState } from "@/lib/auth/validation";
import { copyWorkoutSchema, deleteWorkoutSchema, exerciseSchema, fitnessSetupSchema, sleepSchema, workoutSchema } from "./validation";
import type { Exercise, SleepLog, Workout } from "@/features/tracking/types";

export type FitnessState = FormState & { id?: string };
type RpcName = "save_fitness_sleep" | "save_fitness_exercise" | "save_fitness_workout" | "copy_fitness_workout" | "delete_fitness_workout" | "setup_fitness";
type RpcError = { code?: string; message?: string };
async function call<T>(name: RpcName, args: Record<string, unknown>): Promise<{ data: T | null; error: RpcError | null }> {
  const { supabase } = await requireAccount();
  const client = supabase as unknown as { rpc: (name: RpcName, args: Record<string, unknown>) => Promise<{ data: T | null; error: RpcError | null }> };
  try { return await client.rpc(name, args); } catch { return { data: null, error: { code: "NETWORK" } }; }
}
function failure(error: RpcError): FitnessState {
  if (["40001", "23505"].includes(error.code ?? "")) return { status: "error", message: "This record changed or conflicts with another entry. Reload and try again." };
  if (["23514", "23503", "22P02", "22007", "42501"].includes(error.code ?? "")) return { status: "error", message: "This date or related record is unavailable. Review the form and retry." };
  return { status: "error", message: "Could not save. Check your connection and retry." };
}
const success = (message: string, id?: string): FitnessState => { revalidatePath("/", "layout"); return { status: "success", message, id }; };

export async function setupFitness(_previous: FitnessState, form: FormData): Promise<FitnessState> {
  const raw = form.get("sleepTarget");
  const parsed = fitnessSetupSchema.safeParse({ sleepTarget: raw === "" || raw == null ? null : Number(raw) });
  if (!parsed.success) return { status: "error", message: "Use a positive sleep target up to 24 hours, or leave it empty." };
  const { error } = await call<null>("setup_fitness", { p_input: parsed.data });
  return error ? failure(error) : success("Fitness definitions are ready. No measurements or workouts were added.");
}

export async function saveSleep(_previous: FitnessState, form: FormData): Promise<FitnessState> {
  const parsed = sleepSchema.safeParse({
    date: form.get("date"), expectedRevision: form.get("expectedRevision"), clear: form.get("clear") === "true",
    sleepStartAt: form.get("sleepStartAt"), wakeAt: form.get("wakeAt"), durationSeconds: form.get("durationSeconds"),
    quality: form.get("quality"), notes: form.get("notes") ?? "",
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Review the sleep entry." };
  const { error } = await call<SleepLog>("save_fitness_sleep", { p_input: parsed.data });
  return error ? failure(error) : success(parsed.data.clear ? "Sleep entry removed." : "Sleep entry saved.");
}

export async function saveExercise(_previous: FitnessState, form: FormData): Promise<FitnessState> {
  const parsed = exerciseSchema.safeParse({
    id: form.get("id"), expectedUpdatedAt: form.get("expectedUpdatedAt"), name: form.get("name"), muscleGroup: form.get("muscleGroup"), archive: form.get("archive") === "true",
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Review the exercise." };
  const { data, error } = await call<Exercise>("save_fitness_exercise", { p_input: parsed.data });
  return error ? failure(error) : success(parsed.data.archive ? "Exercise archived; workout history remains." : "Exercise saved.", data?.id);
}

export async function saveWorkout(_previous: FitnessState, form: FormData): Promise<FitnessState> {
  let exercises: unknown;
  try { exercises = JSON.parse(String(form.get("exercises") ?? "[]")); } catch { exercises = null; }
  const parsed = workoutSchema.safeParse({
    id: form.get("id"), expectedRevision: form.get("expectedRevision"), date: form.get("date"), name: form.get("name"),
    durationSeconds: form.get("durationSeconds"), notes: form.get("notes") ?? "", status: form.get("status"),
    challengeId: form.get("challengeId"), exercises,
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Review the workout." };
  const { data, error } = await call<Workout>("save_fitness_workout", { p_input: parsed.data });
  return error ? failure(error) : data ? success("Workout saved.", data.id) : { status: "error", message: "The save returned no workout. Reload before retrying." };
}

export async function copyWorkout(input: unknown): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  const parsed = copyWorkoutSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Choose a valid workout and date." };
  const { data, error } = await call<string>("copy_fitness_workout", { p_source_id: parsed.data.sourceId, p_date: parsed.data.date, p_operation_id: parsed.data.operationId });
  if (error) return { ok: false, message: failure(error).message ?? "Copy failed." };
  if (!data) return { ok: false, message: "The copy returned no workout. Reload before retrying." };
  revalidatePath("/", "layout");
  return { ok: true, id: data };
}

export async function deleteWorkout(input: unknown): Promise<{ ok: true } | { ok: false; message: string }> {
  const parsed = deleteWorkoutSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Choose a valid workout." };
  const { error } = await call<null>("delete_fitness_workout", { p_id: parsed.data.id, p_expected_revision: parsed.data.expectedRevision });
  if (error) return { ok: false, message: failure(error).message ?? "Delete failed." };
  revalidatePath("/", "layout");
  return { ok: true };
}
