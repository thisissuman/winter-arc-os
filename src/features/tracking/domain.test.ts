import { describe, expect, it } from "vitest";
import { addDays, inclusiveChallengeProgress, isBusinessDate, monthRange, weekRange } from "./dates";
import { evaluateHabit, frequencyProgress, habitStreak, metricAdherence, metricDailyValue, scoreForPeriod } from "./domain";
import { averageRecorded } from "@/features/fitness/domain";
import type { Habit, HabitLog, HabitSchedule, MetricDefinition, MetricLog, MetricTarget, ScoreCategory, ScoreItem, ScorePolicy, TrackingSnapshot } from "./types";

const id = (suffix: string) => `00000000-0000-4000-8000-${suffix.padStart(12, "0")}`;
const owned = { user_id: id("1"), created_at: "2026-09-01T00:00:00Z", updated_at: "2026-09-01T00:00:00Z" };
const habit: Habit = { ...owned, id: id("10"), name: "Meditate", description: "", icon: null, category_id: null, time_of_day: "morning", is_private: false, dosage_amount: null, dosage_unit: null, starter_key: null, active_from: "2026-09-28", active_until: null, archived_on: null, archived_at: null };
const schedule: HabitSchedule = { ...owned, id: id("11"), habit_id: habit.id, frequency: "DAILY", required_count: 1, weekdays: [], interval_days: null, anchor_date: null, effective_from: "2026-09-28", effective_until: null, timezone: "Asia/Kolkata", week_starts_on: 1 };
const metric: MetricDefinition = { ...owned, id: id("20"), name: "Water", description: "", category_id: null, unit: "ml", source: "manual", aggregation: "sum", is_private: false, source_available_from: "2026-09-28", starter_key: null, active_from: "2026-09-28", active_until: null, archived_on: null, archived_at: null };
const target: MetricTarget = { ...owned, id: id("21"), metric_id: metric.id, period: "daily", direction: "minimum", target: 2000, effective_from: "2026-09-28", effective_until: null, timezone: "Asia/Kolkata", week_starts_on: 1 };
const categories: ScoreCategory[] = [
  { ...owned, id: id("30"), name: "Discipline", position: 0, archived_at: null, starter_key: null },
  { ...owned, id: id("31"), name: "Recovery", position: 1, archived_at: null, starter_key: null },
];
const dailyPolicy: ScorePolicy = { ...owned, id: id("40"), name: "Daily", period: "daily", version: 1, effective_from: "2026-09-28", effective_until: null, timezone: "Asia/Kolkata", week_starts_on: 1 };
const weeklyPolicy: ScorePolicy = { ...dailyPolicy, id: id("41"), name: "Weekly", period: "weekly" };
const habitItem: ScoreItem = { ...owned, id: id("50"), policy_id: dailyPolicy.id, score_category_id: categories[0].id, weight: 1, habit_id: habit.id, metric_id: null, frequency_target_id: null };
const metricItem: ScoreItem = { ...owned, id: id("51"), policy_id: dailyPolicy.id, score_category_id: categories[1].id, weight: 1, habit_id: null, metric_id: metric.id, frequency_target_id: null };
function snapshot(changes: Partial<TrackingSnapshot> = {}): TrackingSnapshot {
  return {
    challenges: [], challengeHabits: [], challengeMetrics: [], challengeTargets: [],
    habits: [habit], schedules: [schedule], habitLogs: [], metrics: [metric], metricTargets: [target], metricLogs: [],
    frequencyTargets: [], frequencyRules: [], scoreCategories: categories, scorePolicies: [dailyPolicy, weeklyPolicy],
    scoreWeights: [
      { ...owned, id: id("60"), policy_id: dailyPolicy.id, score_category_id: categories[0].id, weight: 30 },
      { ...owned, id: id("61"), policy_id: dailyPolicy.id, score_category_id: categories[1].id, weight: 70 },
      { ...owned, id: id("62"), policy_id: weeklyPolicy.id, score_category_id: categories[0].id, weight: 30 },
      { ...owned, id: id("63"), policy_id: weeklyPolicy.id, score_category_id: categories[1].id, weight: 70 },
    ],
    scoreItems: [habitItem, metricItem, { ...habitItem, id: id("52"), policy_id: weeklyPolicy.id }, { ...metricItem, id: id("53"), policy_id: weeklyPolicy.id }],
    categories: [], lifeAreas: [], timezone: "Asia/Kolkata", weekStartsOn: 1, today: "2026-10-01", selectedChallengeId: null,
    sleepLogs: [], exercises: [], workouts: [], workoutExercises: [], workoutSets: [],
    onboardingComplete: true, historyFrom: "2026-09-28", privacyMode: false, hidePrivateToday: false,
    ...changes,
  };
}
const habitLog = (date: string, status: HabitLog["status"] = "completed", count = 1): HabitLog => ({ ...owned, id: id(date.replaceAll("-", "")), habit_id: habit.id, business_date: date, timezone: "Asia/Kolkata", status, completion_count: count, notes: "", revision: 1 });
const metricLog = (date: string, value: number): MetricLog => ({ ...owned, id: id(`9${date.replaceAll("-", "")}`), metric_id: metric.id, business_date: date, timezone: "Asia/Kolkata", value, notes: "", revision: 1 });

describe("calendar and effective tracking rules", () => {
  it("counts challenge dates inclusively and respects leap/calendar boundaries", () => {
    expect(inclusiveChallengeProgress("2026-09-01", "2026-12-01", "2026-10-01").totalDays).toBe(92);
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(monthRange("2028-02").end).toBe("2028-02-29");
    expect(weekRange("2026-10-01")).toEqual({ start: "2026-09-28", end: "2026-10-04" });
    expect(isBusinessDate("2026-02-29")).toBe(false);
  });
  it("separates missed, skipped, unscheduled, future, and flexible opportunities", () => {
    const weekdays = { ...schedule, frequency: "WEEKDAYS" as const };
    const tracked = snapshot({ schedules: [weekdays], habitLogs: [habitLog("2026-09-29", "skipped", 0)] });
    expect(evaluateHabit(tracked, habit, "2026-09-28").state).toBe("missed");
    expect(evaluateHabit(tracked, habit, "2026-09-29").state).toBe("skipped");
    expect(evaluateHabit(tracked, habit, "2026-10-03").state).toBe("future");
    expect(evaluateHabit(snapshot({ today: "2026-10-04", schedules: [weekdays] }), habit, "2026-10-03").state).toBe("unscheduled");
    expect(evaluateHabit(snapshot({ schedules: [{ ...schedule, frequency: "TIMES_PER_WEEK", required_count: 3 }] }), habit, "2026-10-01").state).toBe("flexible");
    const selected = snapshot({ today: "2026-10-04", schedules: [{ ...schedule, frequency: "SPECIFIC_DAYS", weekdays: [2, 4] }] });
    expect(evaluateHabit(selected, habit, "2026-10-01").eligible).toBe(true);
    expect(evaluateHabit(selected, habit, "2026-10-02").state).toBe("unscheduled");
    const custom = snapshot({ today: "2026-10-04", schedules: [{ ...schedule, frequency: "CUSTOM", interval_days: 3, anchor_date: "2026-09-28" }] });
    expect(evaluateHabit(custom, habit, "2026-10-01").eligible).toBe(true);
    expect(evaluateHabit(custom, habit, "2026-10-02").state).toBe("unscheduled");
  });
  it("uses scheduled opportunities for streaks and prorates initial flexible periods upward", () => {
    const weekdaySnapshot = snapshot({ schedules: [{ ...schedule, frequency: "WEEKDAYS" }], habitLogs: [habitLog("2026-09-28"), habitLog("2026-09-29"), habitLog("2026-10-01")] });
    expect(habitStreak(weekdaySnapshot, habit, "2026-10-01").longest).toBe(2);
    const partial = snapshot({ habits: [{ ...habit, active_from: "2026-10-01" }], schedules: [{ ...schedule, frequency: "TIMES_PER_WEEK", required_count: 4, effective_from: "2026-10-01" }], historyFrom: "2026-10-01" });
    expect(frequencyProgress(partial, partial.habits[0], "2026-10-01", "weekly").requiredCount).toBe(3);
  });
});

describe("adherence and separate score periods", () => {
  it("derives sleep hours from the wake-date log without a duplicate metric log", () => {
    const sleep = { ...metric, id: id("81"), source: "sleep" as const, unit: "hours", aggregation: "latest" as const, source_available_from: "2026-10-01" };
    const recorded = snapshot({ metrics: [sleep], metricLogs: [], metricTargets: [{ ...target, metric_id: sleep.id, target: 8 }], sleepLogs: [{ ...owned, id: id("82"), business_date: "2026-10-01", timezone: "Asia/Kolkata", sleep_start_at: "2026-09-30T18:00:00Z", wake_at: "2026-10-01T02:00:00Z", duration_seconds: 28800, quality: 4, notes: "", revision: 1 }] });
    expect(metricDailyValue(recorded, sleep, "2026-10-01")).toMatchObject({ state: "logged", rawValue: 8, adherence: 1, log: null });
    expect(metricDailyValue(recorded, sleep, "2026-09-30").state).toBe("unavailable");
  });
  it("counts only completed workouts toward a gym session quota", () => {
    const gym = { ...metric, id: id("83"), name: "Gym", source: "workouts" as const, metric_id: null, count_mode: "sessions" as const, source_available_from: "2026-09-28", active_from: "2026-09-28" };
    const rule = { ...target, id: id("84"), frequency_target_id: gym.id, period: "weekly" as const, quota: 4, threshold: null };
    const workouts = [
      { ...owned, id: id("85"), business_date: "2026-09-29", timezone: "Asia/Kolkata", name: "A", duration_seconds: 3600, notes: "", status: "completed" as const, challenge_id: null, revision: 1 },
      { ...owned, id: id("86"), business_date: "2026-10-01", timezone: "Asia/Kolkata", name: "B", duration_seconds: 3600, notes: "", status: "draft" as const, challenge_id: null, revision: 1 },
    ];
    const tracked = snapshot({ frequencyTargets: [gym], frequencyRules: [rule], workouts });
    expect(frequencyProgress(tracked, gym, "2026-10-01", "weekly")).toMatchObject({ actualCount: 1, requiredCount: 4, contribution: 0.25 });
  });
  it("averages recorded weight days while reporting missing coverage", () => {
    expect(averageRecorded([{ date: "2026-09-29", value: 70 }, { date: "2026-09-30", value: null }, { date: "2026-10-01", value: 72 }])).toMatchObject({ value: 71, recordedDays: 2, windowDays: 3 });
  });
  it("distinguishes missing measurements from a logged zero and caps overachievement", () => {
    expect(metricDailyValue(snapshot(), metric, "2026-10-01")).toMatchObject({ state: "missing", rawValue: null, adherence: 0 });
    expect(metricDailyValue(snapshot({ metricLogs: [metricLog("2026-10-01", 0)] }), metric, "2026-10-01")).toMatchObject({ state: "logged", rawValue: 0, adherence: 0 });
    expect(metricAdherence(3000, 2000, "minimum")).toBe(1);
    expect(metricAdherence(3000, 2000, "maximum")).toBeCloseTo(2 / 3);
  });
  it("redistributes eligible category weights and excludes unscheduled items", () => {
    const tracked = snapshot({ schedules: [{ ...schedule, frequency: "SPECIFIC_DAYS", weekdays: [1] }], metricLogs: [metricLog("2026-10-01", 2000)] });
    const score = scoreForPeriod(tracked, { date: "2026-10-01", period: "daily" });
    expect(score.total).toBe(100);
    expect(score.items).toHaveLength(1);
    expect(score.exclusions.some((item) => item.reason.includes("No scheduled"))).toBe(true);
  });
  it("returns no fabricated score when no targets are due", () => {
    const tracked = snapshot({ schedules: [{ ...schedule, frequency: "SPECIFIC_DAYS", weekdays: [1] }], metricTargets: [] });
    expect(scoreForPeriod(tracked, { date: "2026-10-01", period: "daily" }).total).toBeNull();
  });
  it("includes flexible quotas in the weekly score and excludes them from daily scoring", () => {
    const tracked = snapshot({ schedules: [{ ...schedule, frequency: "TIMES_PER_WEEK", required_count: 3 }], habitLogs: [habitLog("2026-09-28")] });
    const daily = scoreForPeriod(tracked, { date: "2026-10-01", period: "daily" });
    const weekly = scoreForPeriod(tracked, { date: "2026-10-01", period: "weekly" });
    expect(daily.items.some((item) => item.sourceType === "habit")).toBe(false);
    expect(weekly.items.find((item) => item.sourceType === "habit")?.contribution).toBeCloseTo(1 / 3);
    expect(weekly.status).toBe("in_progress");
  });
  it("keeps old policy versions effective for earlier dates", () => {
    const earlier = { ...dailyPolicy, effective_until: "2026-10-01" };
    const later = { ...dailyPolicy, id: id("42"), version: 2, effective_from: "2026-10-01" };
    const tracked = snapshot({ scorePolicies: [earlier, later], scoreWeights: [{ ...owned, id: id("60"), policy_id: earlier.id, score_category_id: categories[0].id, weight: 1 }, { ...owned, id: id("61"), policy_id: later.id, score_category_id: categories[0].id, weight: 1 }], scoreItems: [{ ...habitItem, policy_id: earlier.id }, { ...habitItem, id: id("54"), policy_id: later.id }] });
    expect(scoreForPeriod(tracked, { date: "2026-09-30", period: "daily" }).policy?.version).toBe(1);
    expect(scoreForPeriod(tracked, { date: "2026-10-01", period: "daily" }).policy?.version).toBe(2);
  });
  it("excludes duplicate score sources and reports the reason", () => {
    const tracked = snapshot({ scoreItems: [habitItem, { ...habitItem, id: id("55") }], metricTargets: [], scoreWeights: [{ ...owned, id: id("60"), policy_id: dailyPolicy.id, score_category_id: categories[0].id, weight: 1 }] });
    const result = scoreForPeriod(tracked, { date: "2026-10-01", period: "daily" });
    expect(result.items).toHaveLength(1);
    expect(result.exclusions.some((item) => item.reason.includes("Duplicate source"))).toBe(true);
  });
});
