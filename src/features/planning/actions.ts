"use server";

import { revalidatePath } from "next/cache";
import { requireAccount } from "@/lib/auth/session";
import type { FormState } from "@/lib/auth/validation";
import type { MutationResult } from "@/features/tracking/types";
import type { GoalMilestone, PlanningGoal, PlanningTask } from "./types";
import { carrySchema, goalSchema, milestoneSchema, taskOrderSchema, taskSchema, taskStatusSchema } from "./validation";

export type PlanningState = FormState & { id?: string; count?: number };
type RpcName = "save_planning_task" | "set_planning_task_status" | "move_planning_task" | "carry_planning_tasks" | "save_planning_goal" | "save_goal_milestone";
type RpcError = { code?: string; message?: string };
async function call<T>(name: RpcName, args: Record<string, unknown>): Promise<{ data: T | null; error: RpcError | null }> {
  const { supabase } = await requireAccount();
  const client = supabase as unknown as { rpc: (name: RpcName, args: Record<string, unknown>) => Promise<{ data: T | null; error: RpcError | null }> };
  try { return await client.rpc(name, args); } catch { return { data: null, error: { code: "NETWORK" } }; }
}
function failure(error: RpcError): string {
  if (error.code === "40001") return "This record changed elsewhere. Reload and try again.";
  if (["23514", "23503", "23502", "22P02", "22007", "42501"].includes(error.code ?? "")) return error.message?.slice(0, 180) ?? "Review the planning entry and retry.";
  return "Could not save. Check your connection and retry.";
}
function saved(message: string, id?: string, count?: number): PlanningState { revalidatePath("/", "layout"); return { status: "success", message, id, count }; }
async function presentTask(task: PlanningTask): Promise<PlanningTask> {
  const { preferences } = await requireAccount();
  return preferences.privacy_mode && task.is_private ? { ...task, title: "Private task", notes: "" } : task;
}

export async function savePlanningTask(_previous: PlanningState, form: FormData): Promise<PlanningState> {
  const minutesToSeconds = (value: FormDataEntryValue | null) => value === null || value === "" ? null : Number(value) * 60;
  const parsed = taskSchema.safeParse({ id: form.get("id"), expectedRevision: form.get("expectedRevision"), title: form.get("title"), notes: form.get("notes") ?? "",
    date: form.get("date"), status: form.get("status"), priority: form.get("priority"), categoryId: form.get("categoryId"), goalId: form.get("goalId"),
    challengeId: form.get("challengeId"), estimatedSeconds: minutesToSeconds(form.get("estimatedMinutes")), actualSeconds: minutesToSeconds(form.get("actualMinutes")),
    isPrivate: form.get("isPrivate"), delete: form.get("delete") === "true" });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Review the task." };
  const { data, error } = await call<PlanningTask>("save_planning_task", { p_input: parsed.data });
  return error ? { status: "error", message: failure(error) } : saved(parsed.data.delete ? "Task deleted." : "Task saved.", data?.id);
}

export async function setPlanningTaskStatus(input: unknown): Promise<MutationResult<PlanningTask>> {
  const parsed = taskStatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "validation", message: "Choose a valid task status." };
  const { data, error } = await call<PlanningTask>("set_planning_task_status", { p_id: parsed.data.id, p_status: parsed.data.status, p_expected_revision: parsed.data.expectedRevision });
  if (error || !data) return { ok: false, code: error?.code === "40001" ? "conflict" : "storage", message: failure(error ?? {}) };
  revalidatePath("/", "layout");
  return { ok: true, data: await presentTask(data) };
}

export async function movePlanningTask(input: unknown): Promise<MutationResult<PlanningTask>> {
  const parsed = taskOrderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "validation", message: "Choose a valid reorder action." };
  const { data, error } = await call<PlanningTask>("move_planning_task", { p_id: parsed.data.id, p_direction: parsed.data.direction, p_expected_revision: parsed.data.expectedRevision });
  if (error || !data) return { ok: false, code: error?.code === "40001" ? "conflict" : "storage", message: failure(error ?? {}) };
  revalidatePath("/", "layout");
  return { ok: true, data: await presentTask(data) };
}

export async function carryPlanningTasks(_previous: PlanningState, form: FormData): Promise<PlanningState> {
  const parsed = carrySchema.safeParse({ operationId: form.get("operationId"), sourceDate: form.get("sourceDate"), targetDate: form.get("targetDate"), mode: form.get("mode") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Review the carry-forward dates." };
  const { data, error } = await call<{ result_ids: string[] }>("carry_planning_tasks", { p_operation_id: parsed.data.operationId,
    p_source_date: parsed.data.sourceDate, p_target_date: parsed.data.targetDate, p_mode: parsed.data.mode });
  if (error || !data) return { status: "error", message: failure(error ?? {}) };
  return saved(`${data.result_ids.length} unfinished ${data.result_ids.length === 1 ? "task" : "tasks"} ${parsed.data.mode === "move" ? "moved" : "copied"}.`, undefined, data.result_ids.length);
}

export async function savePlanningGoal(_previous: PlanningState, form: FormData): Promise<PlanningState> {
  const parsed = goalSchema.safeParse({ id: form.get("id"), expectedRevision: form.get("expectedRevision"), title: form.get("title"), description: form.get("description") ?? "",
    categoryId: form.get("categoryId"), challengeId: form.get("challengeId"), targetDate: form.get("targetDate"), status: form.get("status"),
    progressMode: form.get("progressMode"), manualPercent: form.get("manualPercent") ?? "0", metricId: form.get("metricId"),
    metricAggregation: form.get("metricAggregation"), metricStartDate: form.get("metricStartDate"), metricEndDate: form.get("metricEndDate"),
    metricBaseline: form.get("metricBaseline"), metricTarget: form.get("metricTarget"), isPrivate: form.get("isPrivate") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Review the goal." };
  const { data, error } = await call<PlanningGoal>("save_planning_goal", { p_input: parsed.data });
  return error ? { status: "error", message: failure(error) } : saved(parsed.data.status === "archived" ? "Goal archived; its history remains." : "Goal saved.", data?.id);
}

export async function saveGoalMilestone(_previous: PlanningState, form: FormData): Promise<PlanningState> {
  const parsed = milestoneSchema.safeParse({ id: form.get("id"), goalId: form.get("goalId"), expectedRevision: form.get("expectedRevision"),
    title: form.get("title"), completed: form.get("completed"), delete: form.get("delete") === "true" });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Review the milestone." };
  const { data, error } = await call<GoalMilestone>("save_goal_milestone", { p_input: parsed.data });
  return error ? { status: "error", message: failure(error) } : saved(parsed.data.delete ? "Milestone deleted." : "Milestone saved.", data?.id);
}
