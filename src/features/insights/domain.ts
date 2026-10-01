import { studyCategorySeconds, studyCoverage } from "@/features/career/domain";
import { addDays, daysBetween, datesBetween, isBusinessDate } from "@/features/tracking/dates";
import { contextTrackers, evaluateHabit, metricDailyValue, scoreForPeriod, type ScoreResult } from "@/features/tracking/domain";
import type { Habit, MetricDefinition, TrackingSnapshot } from "@/features/tracking/types";

export const MAX_INSIGHTS_DAYS = 180;
export type InsightsFilters = { from: string; to: string; challengeId: string | null; categoryId: string | null };
export type InsightsQuery = { from?: string | string[]; to?: string | string[]; challenge?: string | string[]; category?: string | string[] };
export type InsightPoint = { date: string; value: number | null; recorded: number; expected: number; status: "final" | "in_progress" | "configuration" | "empty" | "future" };
export type HabitRank = { id: string; name: string; is_private: boolean; due: number; completed: number; missed: number; consistency: number };
export type MetricSummary = { key: string; label: string; isPrivate: boolean; unit: string; latest: number | null; average: number | null; total: number | null; recordedDays: number; eligibleDays: number };
export type InsightReport = {
  dates: string[]; dailyScores: InsightPoint[]; fitnessScores: InsightPoint[]; careerScores: InsightPoint[]; habitScores: InsightPoint[];
  averageScore: number | null; scoreDays: number; scoreCoverage: { recorded: number; expected: number };
  scoreCategories: { id: string; name: string; average: number; days: number }[];
  weekly: { current: ScoreResult; previous: ScoreResult; previousThrough: string; delta: number | null; comparableDays: number };
  metrics: MetricSummary[]; completedWorkouts: number | null; study: ReturnType<typeof studyCoverage>;
  studyCategories: { id: string; name: string; seconds: number }[];
  strongest: HabitRank[]; missed: HabitRank[]; rankedHabits: number;
};

function single(value: string | string[] | undefined): string | null { return typeof value === "string" ? value : value === undefined ? null : ""; }

export function parseInsightsFilters(query: InsightsQuery, today: string): { filters: InsightsFilters; error: string | null } {
  const defaults: InsightsFilters = { from: addDays(today, -41), to: today, challengeId: null, categoryId: null };
  const from = single(query.from) ?? defaults.from;
  const to = single(query.to) ?? defaults.to;
  const challengeId = single(query.challenge) || null;
  const categoryId = single(query.category) || null;
  if (!isBusinessDate(from) || !isBusinessDate(to)) return { filters: defaults, error: "Choose valid start and end dates." };
  if (from > to) return { filters: defaults, error: "End date must follow the start date." };
  if (to > today) return { filters: defaults, error: "Insights cannot include future performance dates." };
  if (daysBetween(from, to) + 1 > MAX_INSIGHTS_DAYS) return { filters: defaults, error: `Choose at most ${MAX_INSIGHTS_DAYS} calendar days.` };
  return { filters: { from, to, challengeId, categoryId }, error: null };
}

function average(values: number[]): number | null { return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null; }
function point(date: string, value: number | null, recorded: number, expected: number, status: InsightPoint["status"]): InsightPoint {
  return { date, value, recorded, expected, status };
}
function metricSummary(snapshot: TrackingSnapshot, dates: string[], metric: MetricDefinition, challengeId: string | null): MetricSummary {
  const values = dates.map((date) => metricDailyValue(snapshot, metric, date, challengeId)).filter((value) => value.state !== "inactive" && value.state !== "unavailable" && value.state !== "future");
  const recorded = values.flatMap((value) => value.rawValue === null ? [] : [value.rawValue]);
  return { key: metric.starter_key ?? metric.id, label: metric.name, isPrivate: metric.is_private, unit: metric.unit,
    latest: recorded.at(-1) ?? null, average: average(recorded), total: recorded.length ? recorded.reduce((sum, value) => sum + value, 0) : null,
    recordedDays: recorded.length, eligibleDays: values.length };
}

function rankHabit(snapshot: TrackingSnapshot, dates: string[], habit: Habit, challengeId: string | null): HabitRank | null {
  const evaluated = dates.map((date) => evaluateHabit(snapshot, habit, date, challengeId)).filter((result) => result.eligible && result.state !== "pending");
  if (!evaluated.length) return null;
  const completed = evaluated.filter((result) => result.state === "completed").length;
  const missed = evaluated.filter((result) => result.state === "missed" || result.state === "skipped").length;
  return { id: habit.id, name: habit.name, is_private: habit.is_private, due: evaluated.length, completed, missed,
    consistency: evaluated.reduce((sum, result) => sum + (result.contribution ?? 0), 0) / evaluated.length };
}

/** All visual and textual summaries use the same owned, bounded snapshot and historical domain rules. */
export function buildInsightReport(snapshot: TrackingSnapshot, filters: InsightsFilters): InsightReport {
  const dates = datesBetween(filters.from, filters.to, MAX_INSIGHTS_DAYS);
  const context = contextTrackers(snapshot, filters.challengeId);
  const dailyResults = dates.map((date) => scoreForPeriod(snapshot, { date, period: "daily", challengeId: filters.challengeId }));
  const mapped = (selector: (result: ScoreResult) => number | null): InsightPoint[] => dailyResults.map((result, index) => {
    const value = selector(result);
    return point(dates[index], value, result.coverage.recorded, result.coverage.expected,
      result.status === "configuration" ? "configuration" : value === null ? "empty" : result.status);
  });
  const dailyScores = mapped((result) => result.total);
  const categoryPoint = (key: string) => mapped((result) => {
    if (result.status === "configuration") return null;
    const contribution = result.categories.find((category) => category.category.starter_key === key)?.contribution;
    return contribution == null ? null : contribution * 100;
  });
  const habits = context.habits.filter((habit) => !filters.categoryId || habit.category_id === filters.categoryId);
  const habitScores = dates.map((date) => {
    const results = habits.map((habit) => evaluateHabit(snapshot, habit, date, filters.challengeId)).filter((result) => result.eligible && result.state !== "pending");
    return point(date, average(results.map((result) => (result.contribution ?? 0) * 100)), results.filter((result) => result.log !== null).length,
      results.length, date === snapshot.today ? "in_progress" : results.length ? "final" : "empty");
  });
  const ranked = habits.flatMap((habit) => { const result = rankHabit(snapshot, dates, habit, filters.challengeId); return result ? [result] : []; });
  const scoreValues = dailyScores.flatMap((item) => item.value === null ? [] : [item.value]);
  const categoryMap = new Map<string, { id: string; name: string; values: number[] }>();
  for (const result of dailyResults.filter((entry) => entry.status !== "configuration")) for (const category of result.categories) {
    if (category.contribution === null) continue;
    const entry = categoryMap.get(category.category.id) ?? { id: category.category.id, name: category.category.name, values: [] };
    entry.values.push(category.contribution * 100);
    categoryMap.set(entry.id, entry);
  }
  const current = scoreForPeriod(snapshot, { date: filters.to, period: "weekly", challengeId: filters.challengeId, through: filters.to });
  let previousAnchor = addDays(current.start, -1);
  let previousFull = scoreForPeriod(snapshot, { date: previousAnchor, period: "weekly", challengeId: filters.challengeId });
  // A historical week-start preference can make the period containing yesterday
  // overlap the newly selected week. Step back to the last non-overlapping period.
  while (previousFull.end >= current.start) {
    previousAnchor = addDays(previousFull.start, -1);
    previousFull = scoreForPeriod(snapshot, { date: previousAnchor, period: "weekly", challengeId: filters.challengeId });
  }
  const comparableDays = daysBetween(current.start, current.evaluatedThrough) + 1;
  const previousThrough = addDays(previousFull.start, Math.max(0, comparableDays - 1));
  const previous = scoreForPeriod(snapshot, { date: previousAnchor, period: "weekly", challengeId: filters.challengeId, through: previousThrough });
  const selectedMetrics = context.metrics.filter((metric) => !filters.categoryId || metric.category_id === filters.categoryId);
  const keys = ["body-weight", "protein", "sleep", "steps", "water"];
  const metrics = keys.flatMap((key) => { const metric = selectedMetrics.find((item) => item.starter_key === key); return metric ? [metricSummary(snapshot, dates, metric, filters.challengeId)] : []; });
  const withinChallenge = (date: string) => !filters.challengeId || snapshot.challenges.some((item) => item.id === filters.challengeId && date >= item.start_date && date <= item.end_date);
  const completedWorkouts = filters.categoryId ? null : snapshot.workouts.filter((workout) => workout.status === "completed" && workout.business_date >= filters.from && workout.business_date <= filters.to && withinChallenge(workout.business_date)).length;
  const studyDates = dates.filter(withinChallenge);
  const eligibleStudySessions = filters.categoryId ? snapshot.studySessions.filter((session) => snapshot.studyCategories.some((category) => category.id === session.study_category_id && category.category_id === filters.categoryId)) : snapshot.studySessions;
  const study = studyCoverage(eligibleStudySessions, studyDates);
  const studyFrom = filters.challengeId ? snapshot.challenges.find((item) => item.id === filters.challengeId)?.start_date ?? filters.from : filters.from;
  const studyTo = filters.challengeId ? snapshot.challenges.find((item) => item.id === filters.challengeId)?.end_date ?? filters.to : filters.to;
  const categorySeconds = studyCategorySeconds(eligibleStudySessions, studyFrom > filters.from ? studyFrom : filters.from,
    studyTo < filters.to ? studyTo : filters.to);
  const studyCategories = [...categorySeconds].map(([id, seconds]) => ({ id, name: snapshot.studyCategories.find((category) => category.id === id)?.name ?? "Archived category", seconds }))
    .filter((entry) => entry.seconds > 0).sort((a, b) => b.seconds - a.seconds || a.name.localeCompare(b.name));
  return {
    dates, dailyScores, fitnessScores: categoryPoint("fitness"), careerScores: categoryPoint("career"), habitScores,
    averageScore: average(scoreValues), scoreDays: scoreValues.length,
    scoreCoverage: { recorded: dailyResults.reduce((sum, result) => sum + result.coverage.recorded, 0), expected: dailyResults.reduce((sum, result) => sum + result.coverage.expected, 0) },
    scoreCategories: [...categoryMap.values()].map((entry) => ({ id: entry.id, name: entry.name, average: average(entry.values)!, days: entry.values.length })).sort((a, b) => b.average - a.average),
    weekly: { current, previous, previousThrough, comparableDays, delta: current.total === null || previous.total === null ? null : current.total - previous.total },
    metrics, completedWorkouts, study, studyCategories,
    strongest: [...ranked].sort((a, b) => b.consistency - a.consistency || b.due - a.due).slice(0, 5),
    missed: [...ranked].sort((a, b) => b.missed - a.missed || a.consistency - b.consistency).filter((item) => item.missed > 0).slice(0, 5), rankedHabits: ranked.length,
  };
}
