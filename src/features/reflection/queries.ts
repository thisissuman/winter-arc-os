import "server-only";
import { requireAccount } from "@/lib/auth/session";
import { buildInsightReport } from "@/features/insights/domain";
import { addDays } from "@/features/tracking/dates";
import { loadTrackingSnapshot } from "@/features/tracking/queries";
import type { Database } from "@/types/database";

type Tables = Database["public"]["Tables"];
export type WeeklyReview = Tables["weekly_reviews"]["Row"];
export type MonthlyReflection = Tables["monthly_reflections"]["Row"];
type ReviewTable = "weekly_reviews" | "monthly_reflections";

export class ReflectionSetupError extends Error {
  constructor() { super("Reflection needs its versioned database migration."); this.name = "ReflectionSetupError"; }
}
function check(error: { code?: string } | null) {
  if (error?.code === "42P01" || error?.code === "PGRST205") throw new ReflectionSetupError();
  if (error) throw new Error("Reflections could not be loaded. Check your connection and retry.");
}
export async function listReflections(): Promise<{ weekly: WeeklyReview[]; monthly: MonthlyReflection[] }> {
  const { supabase, userId } = await requireAccount();
  const read = async <T extends ReviewTable>(table: T, dateColumn: "week_start" | "month_start"): Promise<Tables[T]["Row"][]> => {
    const result: Tables[T]["Row"][] = [];
    for (let offset = 0;;) {
      const { data, error, count } = await supabase.from(table as "weekly_reviews").select("*", { count: "exact" }).eq("user_id", userId).order(dateColumn as "week_start", { ascending: false }).range(offset, offset + 199);
      check(error);
      if (!data || count === null) throw new Error("Reflections could not be loaded completely.");
      result.push(...data as unknown as Tables[T]["Row"][]);
      offset += data.length;
      if (offset >= count) return result;
      if (!data.length) throw new Error("Reflections changed while loading. Retry.");
    }
  };
  const [weekly, monthly] = await Promise.all([read("weekly_reviews", "week_start"), read("monthly_reflections", "month_start")]);
  return { weekly, monthly };
}
export async function getWeeklyReview(weekStart: string): Promise<WeeklyReview | null> {
  const { supabase, userId } = await requireAccount();
  const { data, error } = await supabase.from("weekly_reviews").select("*").eq("user_id", userId).eq("week_start", weekStart).maybeSingle();
  check(error);
  return data;
}
export async function getMonthlyReflection(monthStart: string): Promise<MonthlyReflection | null> {
  const { supabase, userId } = await requireAccount();
  const { data, error } = await supabase.from("monthly_reflections").select("*").eq("user_id", userId).eq("month_start", monthStart).maybeSingle();
  check(error);
  return data;
}
export async function loadReflectionReport(from: string, fullEnd: string, today: string) {
  const through = fullEnd < today ? fullEnd : today;
  const readFrom = from > "0001-01-29" ? addDays(from, -28) : from;
  const snapshot = await loadTrackingSnapshot({ from: readFrom, to: through, compact: true });
  return { report: buildInsightReport(snapshot, { from, to: through, challengeId: null, categoryId: null }), through };
}
