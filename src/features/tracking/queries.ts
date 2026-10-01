import "server-only";
import { requireAccount } from "@/lib/auth/session";
import { businessDateSchema } from "./validation";
import type { TrackingSnapshot } from "./types";
import type { Database } from "@/types/database";

export class TrackingSetupError extends Error {
  constructor() {
    super("Core tracking needs its Phase 2 database migration. Apply the reviewed migration to the configured development project, regenerate database types, and retry.");
    this.name = "TrackingSetupError";
  }
}
type Tables = Database["public"]["Tables"];
type TrackingTable = Exclude<keyof Tables, "profiles" | "user_preferences" | "tracking_operations">;
type ReadError = { code?: string; message?: string };
function readError(error: ReadError): never {
  if (error.code === "42P01" || error.code === "PGRST205") throw new TrackingSetupError();
  throw new Error("Tracking could not be loaded. Check your connection and retry.");
}
function captureDate(timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((value) => value.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

/** Request-scoped, owner-filtered reads; pagination follows exact counts, never a server row cap. */
export async function loadTrackingSnapshot({ from, to }: { from?: string; to?: string } = {}): Promise<TrackingSnapshot> {
  if (from != null) businessDateSchema.parse(from);
  if (to != null) businessDateSchema.parse(to);
  if (from && to && from > to) throw new Error("Choose a date range whose end follows its start.");
  const { supabase, userId, preferences } = await requireAccount();
  const today = captureDate(preferences.timezone);
  const through = to ?? today;
  const read = async <T extends TrackingTable>(table: T, dateColumn?: "business_date"): Promise<Tables[T]["Row"][]> => {
    const rows: Tables[T]["Row"][] = [];
    let offset = 0;
    for (;;) {
      // The generic table union prevents PostgREST's conditional column type from narrowing.
      // All tables in this reader have the same owned user_id and id columns.
      let query = supabase.from(table as "habits").select("*", { count: "exact" }).eq("user_id", userId).order("id").range(offset, offset + 499);
      if (dateColumn) {
        query = query.lte(dateColumn, through);
        if (from) query = query.gte(dateColumn, from);
      }
      const { data, error, count } = await query;
      if (error) readError(error);
      if (!data || count == null) throw new Error("Tracking could not be read completely. Retry.");
      rows.push(...data as unknown as Tables[T]["Row"][]);
      offset += data.length;
      if (offset >= count) break;
      if (data.length === 0) throw new Error("Tracking changed while loading. Retry to load a consistent view.");
    }
    return rows;
  };
  const [challenges, challengeHabits, challengeMetrics, challengeTargets, habits, schedules, habitLogs, metrics, metricTargets, metricLogs, frequencyTargets, frequencyRules, scoreCategories, scorePolicies, scoreWeights, scoreItems, categories, lifeAreas] = await Promise.all([
    read("challenges"), read("challenge_habits"), read("challenge_metrics"), read("challenge_targets"),
    read("habits"), read("habit_schedules"), read("habit_logs", "business_date"),
    read("metric_definitions"), read("metric_targets"), read("metric_logs", "business_date"),
    read("frequency_targets"), read("frequency_target_rules"), read("score_categories"), read("score_policies"), read("score_category_weights"), read("score_items"), read("categories"), read("life_areas"),
  ]);
  const beginnings = [...habits, ...metrics, ...frequencyTargets].map((tracker) => tracker.active_from).sort();
  // PostgreSQL CHECK-constrained text is generated as `string`; the migrated
  // constraints enforce the narrower domain literals used by the evaluator.
  return {
    challenges: challenges as TrackingSnapshot["challenges"], challengeHabits, challengeMetrics, challengeTargets,
    habits: habits as TrackingSnapshot["habits"], schedules: schedules as TrackingSnapshot["schedules"],
    habitLogs: habitLogs as TrackingSnapshot["habitLogs"], metrics: metrics as TrackingSnapshot["metrics"],
    metricTargets: metricTargets as TrackingSnapshot["metricTargets"], metricLogs,
    frequencyTargets: frequencyTargets as TrackingSnapshot["frequencyTargets"],
    frequencyRules: frequencyRules as TrackingSnapshot["frequencyRules"], scoreCategories,
    scorePolicies: scorePolicies as TrackingSnapshot["scorePolicies"], scoreWeights, scoreItems, categories, lifeAreas,
    timezone: preferences.timezone, weekStartsOn: preferences.week_starts_on, today,
    selectedChallengeId: preferences.selected_challenge_id ?? null, onboardingComplete: preferences.onboarding_completed,
    historyFrom: from ?? beginnings[0] ?? today, privacyMode: preferences.privacy_mode, hidePrivateToday: preferences.hide_private_today,
  };
}
