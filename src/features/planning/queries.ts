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
  const maskedGoals = new Set(goals.filter(item => item.is_private).map(item => item.id));
  return { tasks: (preferences.privacy_mode ? tasks.map(item => item.is_private ? { ...item, title: "Private task", notes: "" } : item) : tasks) as PlanningSnapshot["tasks"],
    goals: (preferences.privacy_mode ? goals.map(item => item.is_private ? { ...item, title: "Private goal", description: "" } : item) : goals) as PlanningSnapshot["goals"],
    milestones: preferences.privacy_mode ? milestones.map(item => maskedGoals.has(item.goal_id) ? { ...item, title: "Private milestone" } : item) : milestones,
    categories, challenges: challenges as PlanningSnapshot["challenges"],
    metrics: (preferences.privacy_mode ? metrics.map(item => item.is_private ? { ...item, name: "Private tracker", description: "" } : item) : metrics) as PlanningSnapshot["metrics"],
    metricLogs: preferences.privacy_mode ? metricLogs.map(item => metrics.some(metric => metric.id === item.metric_id && metric.is_private) ? { ...item, notes: "" } : item) : metricLogs,
    sleepLogs: preferences.privacy_mode ? sleepLogs.map(item => ({ ...item, notes: "" })) : sleepLogs,
    studySessions: (preferences.privacy_mode ? studySessions.map(item => ({ ...item, topic: "", notes: "" })) : studySessions) as PlanningSnapshot["studySessions"],
    today: businessDate(preferences.timezone), timezone: preferences.timezone, weekStartsOn: preferences.week_starts_on, privacyMode: preferences.privacy_mode };
}
