import { describe, expect, it } from "vitest";
import { buildInsightReport, parseInsightsFilters, type InsightsFilters } from "./domain";
import type { Habit, HabitSchedule, MetricDefinition, MetricLog, MetricTarget, ScoreCategory, ScoreItem, ScorePolicy, TrackingSnapshot } from "@/features/tracking/types";

const owner = { user_id: "owner", created_at: "2026-09-28T00:00:00Z", updated_at: "2026-09-28T00:00:00Z" };
const category: ScoreCategory = { ...owner, id: "score-fitness", name: "Fitness", position: 0, archived_at: null, starter_key: "fitness" };
const protein: MetricDefinition = { ...owner, id: "protein", name: "Protein", description: "", category_id: "category-a", unit: "g", source: "manual", aggregation: "sum", is_private: false,
  source_available_from: "2026-09-28", starter_key: "protein", active_from: "2026-09-28", active_until: null, archived_on: null, archived_at: null };
const target: MetricTarget = { ...owner, id: "protein-target", metric_id: protein.id, period: "daily", direction: "minimum", target: 100, effective_from: "2026-09-28", effective_until: null, timezone: "Asia/Kolkata", week_starts_on: 1 };
const dailyPolicy: ScorePolicy = { ...owner, id: "daily-policy", name: "Daily", period: "daily", version: 1, effective_from: "2026-09-28", effective_until: null, timezone: "Asia/Kolkata", week_starts_on: 1 };
const weeklyPolicy: ScorePolicy = { ...dailyPolicy, id: "weekly-policy", name: "Weekly", period: "weekly" };
const item = (policyId: string): ScoreItem => ({ ...owner, id: `item-${policyId}`, policy_id: policyId, score_category_id: category.id, weight: 1, habit_id: null, metric_id: protein.id, frequency_target_id: null });
const log = (date: string, value: number): MetricLog => ({ ...owner, id: `log-${date}`, metric_id: protein.id, business_date: date, timezone: "Asia/Kolkata", value, notes: "", revision: 1 });
const filters = (from: string, to: string, categoryId: string | null = null): InsightsFilters => ({ from, to, challengeId: null, categoryId });
function snapshot(changes: Partial<TrackingSnapshot> = {}): TrackingSnapshot {
  return { challenges: [], challengeHabits: [], challengeMetrics: [], challengeTargets: [], habits: [], schedules: [], habitLogs: [],
    metrics: [protein], metricTargets: [target], metricLogs: [], frequencyTargets: [], frequencyRules: [],
    scoreCategories: [category], scorePolicies: [dailyPolicy, weeklyPolicy],
    scoreWeights: [{ ...owner, id: "weight-daily", policy_id: dailyPolicy.id, score_category_id: category.id, weight: 1 }, { ...owner, id: "weight-weekly", policy_id: weeklyPolicy.id, score_category_id: category.id, weight: 1 }],
    scoreItems: [item(dailyPolicy.id), item(weeklyPolicy.id)], categories: [], lifeAreas: [], sleepLogs: [], exercises: [], workouts: [], workoutExercises: [], workoutSets: [],
    studyCategories: [], studySessions: [], focusTimers: [], timezone: "Asia/Kolkata", weekStartsOn: 1, today: "2026-10-08", selectedChallengeId: null,
    onboardingComplete: true, historyFrom: "2026-09-21", privacyMode: false, hidePrivateToday: false, ...changes };
}

describe("Phase 6 Insights filters and source-truth calculations", () => {
  it("rejects future, reversed, malformed, and overlong ranges", () => {
    expect(parseInsightsFilters({ from: "2026-09-01", to: "2026-10-09" }, "2026-10-08").error).toMatch(/future/);
    expect(parseInsightsFilters({ from: "2026-10-08", to: "2026-10-07" }, "2026-10-08").error).toMatch(/follow/);
    expect(parseInsightsFilters({ from: "2026-02-29" }, "2026-10-08").error).toMatch(/valid/);
    expect(parseInsightsFilters({ from: "2026-01-01" }, "2026-10-08").error).toMatch(/180/);
    expect(parseInsightsFilters({}, "2026-10-08").filters.to).toBe("2026-10-08");
  });

  it("keeps a logged zero separate from an absent value and preserves source totals", () => {
    const report = buildInsightReport(snapshot({ metricLogs: [log("2026-10-05", 0), log("2026-10-07", 100)] }), filters("2026-10-05", "2026-10-07"));
    expect(report.dailyScores.map((point) => point.value)).toEqual([0, 0, 100]);
    expect(report.scoreCoverage).toEqual({ recorded: 2, expected: 3 });
    expect(report.metrics[0]).toMatchObject({ recordedDays: 2, eligibleDays: 3, latest: 100, average: 50, total: 100 });
    expect(report.fitnessScores.map((point) => point.value)).toEqual([0, 0, 100]);
    expect(buildInsightReport(snapshot({ scorePolicies: [] }), filters("2026-10-05", "2026-10-07")).dailyScores.map((point) => point.value)).toEqual([null, null, null]);
  });

  it("compares the same elapsed days of open weeks under their historical policies", () => {
    const previousDates = ["2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01"];
    const currentDates = ["2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08"];
    const report = buildInsightReport(snapshot({ metricLogs: [...previousDates.map((date) => log(date, 50)), ...currentDates.map((date) => log(date, 100))] }), filters("2026-09-28", "2026-10-08"));
    expect(report.weekly.comparableDays).toBe(4);
    expect(report.weekly.previousThrough).toBe("2026-10-01");
    expect(report.weekly.previous.total).toBe(50);
    expect(report.weekly.current.total).toBe(100);
    expect(report.weekly.delta).toBe(50);
    expect(report.weekly.current.status).toBe("in_progress");
    expect(report.weekly.previous.status).toBe("in_progress");
  });

  it("chooses a non-overlapping prior period after a historical week-start change", () => {
    const oldWeekly = { ...weeklyPolicy, effective_from: "2026-09-27", effective_until: "2026-10-05", week_starts_on: 7 };
    const newWeekly = { ...weeklyPolicy, id: "weekly-new", version: 2, effective_from: "2026-10-05", week_starts_on: 1 };
    const priorDates = ["2026-09-27", "2026-09-28", "2026-09-29", "2026-09-30"];
    const currentDates = ["2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08"];
    const data = snapshot({ scorePolicies: [dailyPolicy, oldWeekly, newWeekly],
      scoreWeights: [{ ...owner, id: "daily-weight", policy_id: dailyPolicy.id, score_category_id: category.id, weight: 1 },
        { ...owner, id: "old-weight", policy_id: oldWeekly.id, score_category_id: category.id, weight: 1 },
        { ...owner, id: "new-weight", policy_id: newWeekly.id, score_category_id: category.id, weight: 1 }],
      scoreItems: [item(dailyPolicy.id), item(oldWeekly.id), item(newWeekly.id)],
      metricLogs: [...priorDates.map((date) => log(date, 50)), ...currentDates.map((date) => log(date, 100))] });
    const report = buildInsightReport(data, filters("2026-09-27", "2026-10-08"));
    expect(report.weekly.current.start).toBe("2026-10-05");
    expect(report.weekly.previous.end).toBe("2026-10-03");
    expect(report.weekly.previousThrough).toBe("2026-09-30");
    expect(report.weekly.previous.total).toBe(50);
    expect(report.weekly.current.total).toBe(100);
  });

  it("uses effective target versions rather than today's target for historical chart points", () => {
    const oldRule = { ...target, effective_until: "2026-10-07" };
    const newRule = { ...target, id: "new-target", target: 200, effective_from: "2026-10-07" };
    const report = buildInsightReport(snapshot({ metricTargets: [oldRule, newRule], metricLogs: [log("2026-10-06", 100), log("2026-10-07", 100)] }), filters("2026-10-06", "2026-10-07"));
    expect(report.dailyScores.map((point) => point.value)).toEqual([100, 50]);
  });

  it("counts completed workouts and split-day study exactly once, with recorded-only weight averages", () => {
    const weight = { ...protein, id: "weight", name: "Weight", starter_key: "body-weight", unit: "kg", aggregation: "latest" as const };
    const sleep = { ...protein, id: "sleep", name: "Sleep", starter_key: "sleep", unit: "hours", source: "sleep" as const, aggregation: "latest" as const };
    const studyCategory = { ...owner, id: "study-category", name: "React", category_id: "category-a", position: 0, archived_at: null };
    const session = { ...owner, id: "session", study_category_id: studyCategory.id, challenge_id: null, timer_id: null, topic: "", notes: "", business_date: "2026-10-08", timezone: "Asia/Kolkata", duration_seconds: 7200,
      start_at: "2026-10-07T18:00:00Z", end_at: "2026-10-07T20:00:00Z", segments: [{ start: "2026-10-07T18:00:00Z", end: "2026-10-07T20:00:00Z" }], source: "manual" as const, revision: 1 };
    const workout = (id: string, status: "draft" | "completed") => ({ ...owner, id, business_date: "2026-10-08", timezone: "Asia/Kolkata", name: "Gym", duration_seconds: 3600, notes: "", status, challenge_id: null, revision: 1 });
    const report = buildInsightReport(snapshot({ metrics: [protein, weight, sleep], metricLogs: [{ ...log("2026-10-07", 70), id: "weight-1", metric_id: weight.id }, { ...log("2026-10-08", 72), id: "weight-2", metric_id: weight.id }],
      sleepLogs: [{ ...owner, id: "sleep-log", business_date: "2026-10-08", timezone: "Asia/Kolkata", sleep_start_at: null, wake_at: null, duration_seconds: 28800, quality: null, notes: "", revision: 1 }],
      workouts: [workout("complete", "completed"), workout("draft", "draft")], studyCategories: [studyCategory], studySessions: [session] }), filters("2026-10-07", "2026-10-08"));
    expect(report.metrics.find((metric) => metric.key === "body-weight")).toMatchObject({ average: 71, recordedDays: 2 });
    expect(report.metrics.find((metric) => metric.key === "sleep")).toMatchObject({ latest: 8, recordedDays: 1 });
    expect(report.completedWorkouts).toBe(1);
    expect(report.study).toMatchObject({ minutes: 120, recordedDays: 2, sessionsCompleted: 1 });
    expect(report.studyCategories[0].seconds).toBe(7200);
  });

  it("ranks due habits by actual opportunities and narrows organizational categories", () => {
    const habit = (id: string, categoryId: string): Habit => ({ ...owner, id, name: id, description: "", icon: null, category_id: categoryId, time_of_day: "anytime", is_private: false, dosage_amount: null, dosage_unit: null, starter_key: null,
      active_from: "2026-10-05", active_until: null, archived_on: null, archived_at: null });
    const schedule = (id: string): HabitSchedule => ({ ...owner, id: `schedule-${id}`, habit_id: id, frequency: "DAILY", required_count: 1, weekdays: [], interval_days: null, anchor_date: null,
      effective_from: "2026-10-05", effective_until: null, timezone: "Asia/Kolkata", week_starts_on: 1 });
    const report = buildInsightReport(snapshot({ habits: [habit("A", "category-a"), habit("B", "category-b")], schedules: [schedule("A"), schedule("B")],
      habitLogs: [{ ...owner, id: "habit-log", habit_id: "A", business_date: "2026-10-05", timezone: "Asia/Kolkata", status: "completed", completion_count: 1, notes: "", revision: 1 }] }), filters("2026-10-05", "2026-10-06", "category-a"));
    expect(report.rankedHabits).toBe(1);
    expect(report.strongest[0]).toMatchObject({ id: "A", due: 2, completed: 1, missed: 1, consistency: 0.5 });
    expect(report.habitScores.map((point) => point.value)).toEqual([100, 0]);
  });
});
