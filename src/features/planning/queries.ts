import "server-only";
import { requireAccount } from "@/lib/auth/session";
import { businessDate } from "@/features/tracking/dates";
import type { Database } from "@/types/database";
import type { PlanningSnapshot } from "./types";

export class PlanningSetupError extends Error {
  constructor() { super("Planning needs its versioned database migration."); this.name = "PlanningSetupError"; }
}
type Tables = Database["public"]["Tables"];
type PlanningReadTable = "tasks" | "goals" | "goal_milestones" | "categories" | "challenges" | "metric_definitions" | "metric_logs" | "sleep_logs" | "study_sessions";

export async function loadPlanningSnapshot(): Promise<PlanningSnapshot> {
  const { supabase, userId, preferences } = await requireAccount();
  const read = async <T extends PlanningReadTable>(table: T): Promise<Tables[T]["Row"][]> => {
    const rows: Tables[T]["Row"][] = [];
    let offset = 0;
    for (;;) {
      // The selected tables share owned user_id/id columns. Paginate beyond PostgREST's default row cap.
      const { data, error, count } = await supabase.from(table as "tasks").select("*", { count: "exact" }).eq("user_id", userId).order("id").range(offset, offset + 499);
      if (error?.code === "42P01" || error?.code === "PGRST205") throw new PlanningSetupError();
      if (error || !data || count == null) throw new Error("Planning could not be loaded. Check your connection and retry.");
      rows.push(...data as unknown as Tables[T]["Row"][]);
      offset += data.length;
      if (offset >= count) break;
      if (data.length === 0) throw new Error("Planning changed while loading. Retry to load a consistent view.");
    }
    return rows;
  };
  const [tasks, goals, milestones, categories, challenges, metrics, metricLogs, sleepLogs, studySessions] = await Promise.all([
    read("tasks"), read("goals"), read("goal_milestones"), read("categories"), read("challenges"),
    read("metric_definitions"), read("metric_logs"), read("sleep_logs"), read("study_sessions"),
  ]);
  return { tasks: tasks as PlanningSnapshot["tasks"], goals: goals as PlanningSnapshot["goals"], milestones: milestones as PlanningSnapshot["milestones"],
    categories, challenges: challenges as PlanningSnapshot["challenges"], metrics: metrics as PlanningSnapshot["metrics"],
    metricLogs, sleepLogs, studySessions: studySessions as PlanningSnapshot["studySessions"],
    today: businessDate(preferences.timezone), timezone: preferences.timezone, weekStartsOn: preferences.week_starts_on, privacyMode: preferences.privacy_mode };
}
