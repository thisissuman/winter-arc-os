import {
  addDays, datesBetween, daysBetween, isoWeekday, periodRange,
  type DateRange,
} from "./dates";
import { studyDay } from "@/features/career/domain";
import type {
  ActiveRecord, Challenge, EffectiveRecord, FrequencyRule, FrequencyTarget,
  Habit, HabitLog, HabitSchedule, MetricDefinition, MetricLog, MetricTarget,
  Period, ScoreCategory, ScoreItem, ScorePolicy, TrackingSnapshot,
} from "./types";

export type HabitState = "completed" | "partial" | "missed" | "skipped" | "pending" | "flexible" | "unscheduled" | "future" | "inactive" | "configuration";
export type HabitEvaluation = {
  date: string; state: HabitState; eligible: boolean; expectedCount: number | null;
  completedCount: number; contribution: number | null; reason: string | null;
  schedule: HabitSchedule | null; log: HabitLog | null; period: Period | null;
};
export type MetricEvaluation = {
  date: string; rawValue: number | null; target: number | null;
  direction: "minimum" | "maximum" | "observation"; unit: string;
  adherence: number | null; eligible: boolean;
  state: "logged" | "missing" | "observation" | "future" | "inactive" | "unavailable" | "configuration";
  reason: string | null; rule: MetricTarget | null; log: MetricLog | null;
};
export type FrequencyProgress = {
  period: "weekly" | "monthly"; start: string; end: string;
  actualCount: number; requiredCount: number | null; quota: number | null;
  contribution: number | null; eligible: boolean;
  state: "in_progress" | "final" | "future" | "inactive" | "unavailable" | "configuration";
  reason: string | null; rule: HabitSchedule | FrequencyRule | null;
  countMode: "sessions" | "distinct_days" | "occurrences";
  eligibleDays: number; totalDays: number; observedDays: number;
};
export type MetricPeriodProgress = {
  period: "weekly" | "monthly"; start: string; end: string;
  rawValue: number | null; target: number | null; unit: string;
  direction: "minimum" | "maximum" | "observation";
  adherence: number | null; eligible: boolean;
  state: "in_progress" | "final" | "future" | "inactive" | "unavailable" | "configuration";
  reason: string | null; rule: MetricTarget | null;
  observedDays: number; eligibleDays: number; totalDays: number;
};
export type HabitStreak = {
  current: number | null; longest: number | null; completedOpportunities: number;
  requiredOpportunities: number; consistency: number | null;
  historyFrom: string; historyComplete: boolean; reason: string | null;
};
export type ScoreExclusion = { itemId: string | null; sourceId: string | null; reason: string; configuration?: boolean };
export type ScoreItemResult = {
  item: ScoreItem; sourceId: string; sourceType: "habit" | "metric" | "frequency";
  name: string; isPrivate: boolean; contribution: number; weight: number;
  expectedOpportunities: number; recordedOpportunities: number;
  actual: number | null; target: number | null; unit: string | null; reason: string | null;
};
export type ScoreCategoryResult = {
  category: ScoreCategory; weight: number; contribution: number | null;
  items: ScoreItemResult[];
};
export type ScoreResult = {
  total: number | null; status: "in_progress" | "final" | "future" | "configuration";
  period: Period; start: string; end: string; evaluatedThrough: string;
  policy: ScorePolicy | null; categories: ScoreCategoryResult[];
  items: ScoreItemResult[]; exclusions: ScoreExclusion[];
  coverage: { recorded: number; expected: number; ratio: number | null; historyComplete: boolean };
};

function activeOn(source: ActiveRecord, date: string): boolean {
  return date >= source.active_from && (!source.active_until || date < source.active_until) && (!source.archived_on || date < source.archived_on);
}

function effectiveOn(rule: EffectiveRecord, date: string): boolean {
  return date >= rule.effective_from && (!rule.effective_until || date < rule.effective_until);
}

function uniqueRule<T extends EffectiveRecord>(rules: T[], date: string): { rule: T | null; reason: string | null } {
  const matches = rules.filter((rule) => effectiveOn(rule, date));
  return matches.length === 1 ? { rule: matches[0], reason: null } : {
    rule: null,
    reason: matches.length > 1 ? "Overlapping effective rules need to be corrected." : "No effective rule is configured for this date.",
  };
}

function challenge(snapshot: TrackingSnapshot, challengeId?: string | null): Challenge | null {
  return challengeId ? snapshot.challenges.find((item) => item.id === challengeId) ?? null : null;
}

function associationReason(snapshot: TrackingSnapshot, kind: "habit" | "metric" | "frequency", id: string, challengeId?: string | null): string | null {
  if (!challengeId) return null;
  if (!challenge(snapshot, challengeId)) return "The selected challenge is unavailable.";
  const associated = kind === "habit"
    ? snapshot.challengeHabits.some((item) => item.challenge_id === challengeId && item.habit_id === id)
    : kind === "metric"
      ? snapshot.challengeMetrics.some((item) => item.challenge_id === challengeId && item.metric_id === id)
      : snapshot.challengeTargets.some((item) => item.challenge_id === challengeId && item.frequency_target_id === id);
  return associated ? null : "This tracker is not part of the selected challenge.";
}

function challengeOn(snapshot: TrackingSnapshot, date: string, challengeId?: string | null): boolean {
  if (!challengeId) return true;
  const selected = challenge(snapshot, challengeId);
  return Boolean(selected && date >= selected.start_date && date <= selected.end_date);
}

/** Explicit context keeps personal tracking available when no challenge is selected. */
export function contextTrackers(snapshot: TrackingSnapshot, challengeId?: string | null): {
  habits: Habit[]; metrics: MetricDefinition[]; frequencyTargets: FrequencyTarget[];
} {
  return {
    habits: snapshot.habits.filter((item) => !associationReason(snapshot, "habit", item.id, challengeId)),
    metrics: snapshot.metrics.filter((item) => !associationReason(snapshot, "metric", item.id, challengeId)),
    frequencyTargets: snapshot.frequencyTargets.filter((item) => !associationReason(snapshot, "frequency", item.id, challengeId)),
  };
}

function schedulePeriod(schedule: HabitSchedule): Period {
  return schedule.frequency === "TIMES_PER_WEEK" ? "weekly" : schedule.frequency === "TIMES_PER_MONTH" ? "monthly" : "daily";
}

function dueOn(schedule: HabitSchedule, date: string): boolean {
  switch (schedule.frequency) {
    case "DAILY": return true;
    case "WEEKDAYS": return isoWeekday(date) <= 5;
    case "SPECIFIC_DAYS": return schedule.weekdays.includes(isoWeekday(date));
    case "CUSTOM": {
      if (!schedule.anchor_date || !schedule.interval_days || schedule.interval_days < 1) return false;
      const distance = daysBetween(schedule.anchor_date, date);
      return distance >= 0 && distance % schedule.interval_days === 0;
    }
    default: return false;
  }
}

export function evaluateHabit(snapshot: TrackingSnapshot, habit: Habit, date: string, challengeId?: string | null): HabitEvaluation {
  const log = snapshot.habitLogs.find((item) => item.habit_id === habit.id && item.business_date === date) ?? null;
  const base: HabitEvaluation = {
    date, state: "inactive", eligible: false, expectedCount: null,
    completedCount: log?.completion_count ?? 0, contribution: null, reason: null,
    schedule: null, log, period: null,
  };
  const association = associationReason(snapshot, "habit", habit.id, challengeId);
  if (association) return { ...base, reason: association };
  if (!activeOn(habit, date) || !challengeOn(snapshot, date, challengeId)) return { ...base, reason: "Outside this tracker's active dates or challenge dates." };
  if (date < snapshot.historyFrom) return { ...base, state: "configuration", reason: "This date is outside the loaded tracking history." };
  const selected = uniqueRule(snapshot.schedules.filter((item) => item.habit_id === habit.id), date);
  if (!selected.rule) return { ...base, state: "configuration", reason: selected.reason };
  const schedule = selected.rule;
  const period = schedulePeriod(schedule);
  const configured = { ...base, schedule, period, expectedCount: schedule.required_count };
  if (!Number.isFinite(schedule.required_count) || schedule.required_count <= 0) return { ...configured, state: "configuration", reason: "Habit requirements must be positive." };
  if (schedule.frequency === "CUSTOM" && (!schedule.anchor_date || !schedule.interval_days || schedule.interval_days < 1)) return { ...configured, state: "configuration", reason: "Custom recurrence needs a valid anchor and positive interval." };
  if (date > snapshot.today) return { ...configured, state: "future", reason: "Future dates do not count as misses." };
  if (period !== "daily") return {
    ...configured, expectedCount: null, state: log?.status === "skipped" ? "skipped" : log?.status === "missed" ? "missed" : log ? "completed" : "flexible",
    reason: "This habit has a flexible period quota, not a daily obligation.",
  };
  if (!dueOn(schedule, date)) return { ...configured, state: "unscheduled", reason: "Not scheduled on this date." };
  const contribution = Math.min((log?.completion_count ?? 0) / schedule.required_count, 1);
  const state: HabitState = log?.status === "skipped" ? "skipped" : log?.status === "missed" ? "missed"
    : contribution >= 1 ? "completed" : contribution > 0 ? "partial" : date === snapshot.today && !log ? "pending" : "missed";
  return { ...configured, state, eligible: true, contribution, reason: state === "pending" ? "Today's opportunity is still in progress." : null };
}

export function metricAdherence(actual: number | null, target: number, direction: "minimum" | "maximum"): number {
  if (!Number.isFinite(target) || target <= 0) throw new RangeError("Ratio-based targets must be positive.");
  if (actual === null) return 0;
  if (!Number.isFinite(actual) || actual < 0) throw new RangeError("Metric values must be finite and nonnegative.");
  return direction === "minimum" ? Math.min(actual / target, 1) : actual <= target ? 1 : target / actual;
}

function metricAvailable(metric: MetricDefinition, date: string): boolean {
  return metric.source === "manual"
    ? !metric.source_available_from || date >= metric.source_available_from
    : metric.source_available_from !== null && date >= metric.source_available_from;
}

export function metricDailyValue(snapshot: TrackingSnapshot, metric: MetricDefinition, date: string, challengeId?: string | null): MetricEvaluation {
  const log = metric.source === "manual" ? snapshot.metricLogs.find((item) => item.metric_id === metric.id && item.business_date === date) ?? null : null;
  const sleep = metric.source === "sleep" ? snapshot.sleepLogs.find((item) => item.business_date === date) ?? null : null;
  const study = metric.source === "study" ? studyDay(snapshot.studySessions, date) : null;
  const rawValue = metric.source === "sleep" ? sleep ? sleep.duration_seconds / 3600 : null : metric.source === "study" ? study && study.seconds > 0 ? study.seconds / 60 : null : log?.value ?? null;
  const base: MetricEvaluation = { date, rawValue, target: null, direction: "observation", unit: metric.unit, adherence: null, eligible: false, state: "inactive", reason: null, rule: null, log };
  const association = associationReason(snapshot, "metric", metric.id, challengeId);
  if (association) return { ...base, reason: association };
  if (!activeOn(metric, date) || !challengeOn(snapshot, date, challengeId)) return { ...base, reason: "Outside this tracker's active dates or challenge dates." };
  if (!metricAvailable(metric, date)) return { ...base, state: "unavailable", reason: "The source is not available for this date." };
  if (date > snapshot.today) return { ...base, state: "future", reason: "Future measurements are excluded." };
  if (date < snapshot.historyFrom) return { ...base, state: "configuration", reason: "This date is outside the loaded tracking history." };
  const rules = snapshot.metricTargets.filter((item) => item.metric_id === metric.id && item.period === "daily");
  const selected = uniqueRule(rules, date);
  if (!selected.rule) {
    return selected.reason?.startsWith("Overlapping")
      ? { ...base, state: "configuration", reason: selected.reason }
      : { ...base, state: "observation", reason: "No daily target; this value is observation only." };
  }
  const rule = selected.rule;
  if (!Number.isFinite(rule.target) || rule.target <= 0) return { ...base, rule, state: "configuration", reason: "Ratio-based targets must be positive." };
  return {
    ...base, state: rawValue !== null ? "logged" : "missing", target: rule.target,
    direction: rule.direction, adherence: metricAdherence(rawValue, rule.target, rule.direction),
    eligible: true, rule, reason: rawValue !== null ? null : "Required measurement not logged.",
  };
}

export const evaluateMetric = metricDailyValue;

function lastEffectiveRule<T extends EffectiveRecord>(rules: T[], date: string): T | null {
  const candidates = rules.filter((rule) => rule.effective_from <= date).sort((a, b) => b.effective_from.localeCompare(a.effective_from));
  return candidates[0] ?? null;
}

function quotaRule(snapshot: TrackingSnapshot, source: Habit | FrequencyTarget, date: string, requestedPeriod?: "weekly" | "monthly"): {
  rule: HabitSchedule | FrequencyRule | null; period: "weekly" | "monthly"; reason: string | null;
} {
  if ("source" in source) {
    const rules = snapshot.frequencyRules.filter((item) => item.frequency_target_id === source.id && (!requestedPeriod || item.period === requestedPeriod));
    const selected = uniqueRule(rules, date);
    const fallback = selected.rule ?? lastEffectiveRule(rules, date);
    const period = requestedPeriod ?? fallback?.period ?? "weekly";
    if (selected.rule) return { rule: selected.rule, period, reason: null };
    if (selected.reason?.startsWith("Overlapping")) return { rule: null, period, reason: selected.reason };
    const range = periodRange(period, date, fallback?.week_starts_on ?? snapshot.weekStartsOn);
    const intersects = rules.filter((rule) => rule.effective_from <= range.end && (!rule.effective_until || rule.effective_until > range.start));
    return intersects.length === 1 ? { rule: intersects[0], period, reason: null } : { rule: null, period, reason: selected.reason };
  }
  const schedules = snapshot.schedules.filter((item) => item.habit_id === source.id);
  const selected = uniqueRule(schedules, date);
  const fallback = selected.rule ?? lastEffectiveRule(schedules, date);
  const inferred = fallback && schedulePeriod(fallback) !== "daily" ? schedulePeriod(fallback) as "weekly" | "monthly" : "weekly";
  const period = requestedPeriod ?? inferred;
  if (selected.reason?.startsWith("Overlapping")) return { rule: null, period, reason: selected.reason };
  if (selected.rule && schedulePeriod(selected.rule) === period) return { rule: selected.rule, period, reason: null };
  const range = periodRange(period, date, fallback?.week_starts_on ?? snapshot.weekStartsOn);
  const matches = schedules.filter((rule) => schedulePeriod(rule) === period && rule.effective_from <= range.end && (!rule.effective_until || rule.effective_until > range.start));
  return matches.length === 1 ? { rule: matches[0], period, reason: null } : { rule: null, period, reason: "No matching period quota is configured." };
}

export function frequencyProgress(snapshot: TrackingSnapshot, source: Habit | FrequencyTarget, date: string, requestedPeriod?: "weekly" | "monthly", challengeId?: string | null): FrequencyProgress {
  const selected = quotaRule(snapshot, source, date, requestedPeriod);
  const { period, rule } = selected;
  const range = periodRange(period, date, rule?.week_starts_on ?? snapshot.weekStartsOn);
  const totalDays = daysBetween(range.start, range.end) + 1;
  const isTarget = "source" in source;
  const quota = rule ? "quota" in rule ? rule.quota : rule.required_count : null;
  const base: FrequencyProgress = { period, ...range, actualCount: 0, requiredCount: null, quota, contribution: null, eligible: false, state: "configuration", reason: null, rule, countMode: isTarget ? source.count_mode : "occurrences", eligibleDays: 0, totalDays, observedDays: 0 };
  const association = associationReason(snapshot, isTarget ? "frequency" : "habit", source.id, challengeId);
  if (association) return { ...base, state: "inactive", reason: association };
  if (!rule && requestedPeriod && isTarget && snapshot.frequencyRules.some((candidate) => candidate.frequency_target_id === source.id)
    && !snapshot.frequencyRules.some((candidate) => candidate.frequency_target_id === source.id && candidate.period === requestedPeriod)) {
    return { ...base, state: "inactive", reason: `This target has no ${requestedPeriod} quota.` };
  }
  if (!rule) return { ...base, reason: selected.reason };
  if (!quota || !Number.isFinite(quota) || quota <= 0) return { ...base, reason: "Period quota must be positive." };
  if (range.start > snapshot.today) return { ...base, state: "future", reason: "Future periods do not count as misses." };
  if (isTarget && source.source === "study_sessions" && source.source_available_from === null) return { ...base, state: "unavailable", reason: "Study tracking has not been activated." };
  if (isTarget && source.source === "workouts" && source.source_available_from === null) return { ...base, state: "unavailable", reason: "Workout tracking has not been activated." };
  const metric = isTarget && source.metric_id ? snapshot.metrics.find((item) => item.id === source.metric_id) ?? null : null;
  if (isTarget && source.source === "metric_threshold" && (!metric || !("threshold" in rule) || rule.threshold === null || rule.threshold <= 0)) return { ...base, reason: "This frequency target needs an available metric and positive threshold." };
  if (metric && metric.source !== "manual") return { ...base, state: "unavailable", reason: "Threshold frequency requires a manual daily metric." };
  const eligibleDates = datesBetween(range.start, range.end).filter((day) => activeOn(source, day) && effectiveOn(rule, day) && challengeOn(snapshot, day, challengeId)
    && (!isTarget || !source.source_available_from || day >= source.source_available_from)
    && (!metric || activeOn(metric, day) && metricAvailable(metric, day)));
  if (eligibleDates.length === 0) return { ...base, state: "inactive", reason: "No active dates in this period." };
  if (eligibleDates.some((day) => day < snapshot.historyFrom && day <= date && day <= snapshot.today)) return { ...base, reason: "The full evaluated period is outside loaded history." };
  const evaluatedDates = new Set(eligibleDates.filter((day) => day <= date && day <= snapshot.today));
  let actualCount = 0;
  let observedDays = 0;
  if (!isTarget) {
    const logs = snapshot.habitLogs.filter((log) => log.habit_id === source.id && evaluatedDates.has(log.business_date));
    observedDays = logs.length;
    actualCount = logs.reduce((sum, log) => sum + (log.status === "completed" ? log.completion_count : 0), 0);
  } else if (metric && "threshold" in rule && rule.threshold !== null) {
    const threshold = rule.threshold;
    const logs = snapshot.metricLogs.filter((log) => log.metric_id === metric.id && evaluatedDates.has(log.business_date));
    observedDays = logs.length;
    actualCount = new Set(logs.filter((log) => log.value >= threshold).map((log) => log.business_date)).size;
  } else if (isTarget && source.source === "workouts") {
    const sessions = snapshot.workouts.filter((workout) => workout.status === "completed" && evaluatedDates.has(workout.business_date));
    observedDays = new Set(sessions.map((workout) => workout.business_date)).size;
    actualCount = source.count_mode === "distinct_days" ? observedDays : sessions.length;
  } else if (isTarget && source.source === "study_sessions") {
    const sessions = snapshot.studySessions.filter((session) => evaluatedDates.has(session.business_date));
    observedDays = new Set(sessions.map((session) => session.business_date)).size;
    actualCount = source.count_mode === "distinct_days" ? observedDays : sessions.length;
  }
  const requiredCount = Math.ceil(quota * eligibleDates.length / totalDays);
  return {
    ...base, actualCount, observedDays, requiredCount, eligibleDays: eligibleDates.length,
    contribution: Math.min(actualCount / requiredCount, 1), eligible: true,
    state: range.end >= snapshot.today ? "in_progress" : "final", reason: null,
  };
}

export function habitStreak(snapshot: TrackingSnapshot, habit: Habit, asOf: string, challengeId?: string | null): HabitStreak {
  const selectedChallenge = challenge(snapshot, challengeId);
  const start = [habit.active_from, snapshot.historyFrom, selectedChallenge?.start_date ?? habit.active_from].sort().at(-1)!;
  const end = [asOf, snapshot.today, selectedChallenge?.end_date ?? asOf].sort()[0];
  const naturalStart = [habit.active_from, selectedChallenge?.start_date ?? habit.active_from].sort().at(-1)!;
  const base: HabitStreak = { current: 0, longest: 0, completedOpportunities: 0, requiredOpportunities: 0, consistency: null, historyFrom: start, historyComplete: start === naturalStart, reason: null };
  const association = associationReason(snapshot, "habit", habit.id, challengeId);
  if (association) return { ...base, current: null, longest: null, reason: association };
  if (start > end) return base;
  let current = 0;
  let longest = 0;
  let completed = 0;
  let required = 0;
  let adherence = 0;
  let configuration = false;
  let dailySeen = false;
  let quotaSeen = false;
  for (const day of datesBetween(start, end)) {
    const result = evaluateHabit(snapshot, habit, day, challengeId);
    if (result.period && result.period !== "daily") { quotaSeen = true; current = 0; continue; }
    if (result.period === "daily") dailySeen = true;
    if (result.state === "configuration") { configuration = true; current = 0; continue; }
    if (!result.eligible) continue;
    if (result.state === "pending") continue;
    required += 1;
    adherence += result.contribution ?? 0;
    if (result.state === "completed") { completed += 1; current += 1; longest = Math.max(longest, current); }
    else current = 0;
  }
  const endRule = uniqueRule(snapshot.schedules.filter((rule) => rule.habit_id === habit.id), end).rule;
  if ((endRule && schedulePeriod(endRule) !== "daily") || (quotaSeen && !dailySeen)) return { ...base, current: null, longest: null, reason: "Flexible habits use period quota progress rather than daily streaks." };
  return {
    ...base, current, longest, completedOpportunities: completed, requiredOpportunities: required,
    consistency: required ? adherence / required : null,
    historyComplete: base.historyComplete && !configuration,
    reason: configuration ? "Missing configuration interrupts this bounded streak calculation." : !base.historyComplete ? "Streak and consistency cover loaded history only." : null,
  };
}

function aggregate(values: number[], aggregation: MetricDefinition["aggregation"]): number | null {
  if (!values.length) return null;
  if (aggregation === "latest") return values[values.length - 1];
  const sum = values.reduce((total, value) => total + value, 0);
  return aggregation === "average" ? sum / values.length : sum;
}

type MetricPeriodEvaluation = {
  contribution: number | null; actual: number | null; target: number | null;
  expected: number; recorded: number; reason: string | null; configuration: boolean;
};

function metricPeriod(snapshot: TrackingSnapshot, metric: MetricDefinition, range: DateRange, date: string, period: Period, challengeId?: string | null): MetricPeriodEvaluation {
  const base: MetricPeriodEvaluation = { contribution: null, actual: null, target: null, expected: 0, recorded: 0, reason: null, configuration: false };
  const association = associationReason(snapshot, "metric", metric.id, challengeId);
  if (association) return { ...base, reason: association };
  const periodRules = snapshot.metricTargets.filter((rule) => rule.metric_id === metric.id && rule.period === period);
  const selected = uniqueRule(periodRules, date);
  const overlapping = selected.reason?.startsWith("Overlapping");
  const periodRule = selected.rule;
  if (overlapping) return { ...base, reason: selected.reason, configuration: true };
  if (period !== "daily" && periodRule) {
    if (!Number.isFinite(periodRule.target) || periodRule.target <= 0) return { ...base, reason: "Ratio-based targets must be positive.", configuration: true };
    const sourceRange = periodRange(period, date, periodRule.week_starts_on);
    const allDates = datesBetween(sourceRange.start, sourceRange.end);
    const activeDates = allDates.filter((day) => activeOn(metric, day) && effectiveOn(periodRule, day) && challengeOn(snapshot, day, challengeId) && metricAvailable(metric, day));
    if (!activeDates.length) return { ...base, reason: "No active source dates in this period." };
    const due = new Set(activeDates.filter((day) => day <= date && day <= snapshot.today));
    if ([...due].some((day) => day < snapshot.historyFrom)) return { ...base, reason: "The full evaluated period is outside loaded history.", configuration: true };
    const values = [...due].sort().flatMap((day) => {
      const value = metricDailyValue(snapshot, metric, day, challengeId);
      return value.rawValue === null ? [] : [value.rawValue];
    });
    const actual = aggregate(values, metric.aggregation);
    // Additive totals scale to the active intersection; averages/latest keep their original unit target.
    const target = metric.aggregation === "sum" ? periodRule.target * activeDates.length / allDates.length : periodRule.target;
    return { contribution: metricAdherence(actual, target, periodRule.direction), actual, target, expected: due.size, recorded: values.length, reason: actual === null ? "Required period measurement not logged." : null, configuration: false };
  }
  const due = datesBetween(range.start, range.end).filter((day) => day <= date && day <= snapshot.today);
  const evaluations = due.map((day) => metricDailyValue(snapshot, metric, day, challengeId));
  const invalid = evaluations.find((value) => value.state === "configuration");
  if (invalid) return { ...base, reason: invalid.reason, configuration: true };
  const eligible = evaluations.filter((value) => value.eligible && value.adherence !== null);
  if (!eligible.length) return { ...base, reason: evaluations.find((value) => value.state === "configuration" || value.state === "unavailable")?.reason ?? "No scored daily target in this period." };
  const contribution = eligible.reduce((sum, value) => sum + value.adherence!, 0) / eligible.length;
  return {
    contribution, actual: aggregate(eligible.flatMap((value) => value.rawValue === null ? [] : [value.rawValue]), metric.aggregation),
    target: period === "daily" ? eligible[0].target : null,
    expected: eligible.length, recorded: eligible.filter((value) => value.rawValue !== null).length,
    reason: null, configuration: false,
  };
}

/** Period targets have their own rows; this does not turn daily averages into weekly quotas. */
export function metricPeriodValue(snapshot: TrackingSnapshot, metric: MetricDefinition, date: string, period: "weekly" | "monthly", challengeId?: string | null): MetricPeriodProgress {
  const rules = snapshot.metricTargets.filter((candidate) => candidate.metric_id === metric.id && candidate.period === period);
  const selected = uniqueRule(rules, date);
  const rule = selected.rule;
  const range = periodRange(period, date, rule?.week_starts_on ?? snapshot.weekStartsOn);
  const base: MetricPeriodProgress = {
    period, ...range, rawValue: null, target: null, unit: metric.unit,
    direction: rule?.direction ?? "observation", adherence: null, eligible: false,
    state: "inactive", reason: null, rule, observedDays: 0, eligibleDays: 0,
    totalDays: daysBetween(range.start, range.end) + 1,
  };
  const association = associationReason(snapshot, "metric", metric.id, challengeId);
  if (association) return { ...base, reason: association };
  if (range.start > snapshot.today) return { ...base, state: "future", reason: "Future periods do not count as misses." };
  if (metric.source !== "manual" && metric.source_available_from === null) return { ...base, state: "unavailable", reason: "The source is not available for this period." };
  if (!rule) return {
    ...base, state: selected.reason?.startsWith("Overlapping") ? "configuration" : "inactive",
    reason: selected.reason?.startsWith("Overlapping") ? selected.reason : `No ${period} metric target is configured.`,
  };
  const value = metricPeriod(snapshot, metric, range, date, period, challengeId);
  if (value.configuration) return { ...base, state: "configuration", reason: value.reason };
  if (value.contribution === null) return { ...base, reason: value.reason };
  const eligibleDays = datesBetween(range.start, range.end).filter((day) => activeOn(metric, day) && effectiveOn(rule, day) && challengeOn(snapshot, day, challengeId) && metricAvailable(metric, day)).length;
  return {
    ...base, rawValue: value.actual, target: value.target, adherence: value.contribution,
    eligible: true, state: range.end >= snapshot.today ? "in_progress" : "final", reason: value.reason,
    observedDays: value.recorded, eligibleDays,
  };
}

export function scoreForPeriod(snapshot: TrackingSnapshot, options: { date: string; period: Period; challengeId?: string | null }): ScoreResult {
  const { date, period, challengeId } = options;
  const selectedPolicy = uniqueRule(snapshot.scorePolicies.filter((policy) => policy.period === period), date);
  const policy = selectedPolicy.rule;
  const range = periodRange(period, date, policy?.week_starts_on ?? snapshot.weekStartsOn);
  const evaluatedThrough = period !== "daily" && range.end < snapshot.today ? range.end : date < snapshot.today ? date : snapshot.today;
  const base: ScoreResult = {
    total: null, status: range.start > snapshot.today ? "future" : range.end >= snapshot.today ? "in_progress" : "final",
    period, ...range, evaluatedThrough, policy, categories: [], items: [], exclusions: [],
    coverage: { recorded: 0, expected: 0, ratio: null, historyComplete: range.start >= snapshot.historyFrom },
  };
  if (date > snapshot.today) return { ...base, status: "future", exclusions: [{ itemId: null, sourceId: null, reason: "Future periods have no score." }] };
  if (challengeId && !challenge(snapshot, challengeId)) return { ...base, status: "configuration", exclusions: [{ itemId: null, sourceId: null, reason: "The selected challenge is unavailable.", configuration: true }] };
  if (!policy) {
    if (snapshot.habits.length + snapshot.metrics.length + snapshot.frequencyTargets.length === 0) return base;
    return { ...base, status: "configuration", exclusions: [{ itemId: null, sourceId: null, reason: selectedPolicy.reason ?? "Configure a scoring policy." }] };
  }
  const weights = snapshot.scoreWeights.filter((weight) => weight.policy_id === policy.id);
  if (!weights.some((weight) => Number.isFinite(weight.weight) && weight.weight > 0)) return { ...base, status: "configuration", exclusions: [{ itemId: null, sourceId: null, reason: "A scoring policy needs at least one positive category weight." }] };
  const items: ScoreItemResult[] = [];
  const exclusions: ScoreExclusion[] = [];
  let configuration = false;
  const seen = new Set<string>();
  const effectiveRange = { start: range.start > policy.effective_from ? range.start : policy.effective_from, end: policy.effective_until && policy.effective_until <= range.end ? addDays(policy.effective_until, -1) : range.end };
  for (const item of snapshot.scoreItems.filter((value) => value.policy_id === policy.id)) {
    const references = [item.habit_id, item.metric_id, item.frequency_target_id].filter((id) => id !== null);
    const sourceId = references[0] ?? null;
    const reject = (reason: string, invalid = false) => { configuration ||= invalid; exclusions.push({ itemId: item.id, sourceId, reason, configuration: invalid }); };
    if (references.length !== 1 || !sourceId) { reject("Score items require exactly one source.", true); continue; }
    const kind = item.habit_id ? "habit" : item.metric_id ? "metric" : "frequency";
    const key = `${kind}:${sourceId}`;
    if (seen.has(key)) { reject("Duplicate source excluded from this score period."); continue; }
    seen.add(key);
    if (!Number.isFinite(item.weight) || item.weight <= 0) { reject("Item weight must be positive.", true); continue; }
    const categoryWeight = weights.find((weight) => weight.score_category_id === item.score_category_id);
    const category = snapshot.scoreCategories.find((value) => value.id === item.score_category_id);
    if (!category || !categoryWeight || categoryWeight.weight <= 0) { reject("Category has no positive policy weight."); continue; }
    if (item.habit_id) {
      const habit = snapshot.habits.find((value) => value.id === item.habit_id);
      if (!habit) { reject("Habit source is unavailable."); continue; }
      const latestSchedule = uniqueRule(snapshot.schedules.filter((schedule) => schedule.habit_id === habit.id), date);
      const quotaPeriod = latestSchedule.rule ? schedulePeriod(latestSchedule.rule) : null;
      if (quotaPeriod && quotaPeriod !== "daily") {
        if (period !== quotaPeriod) { reject(`This habit's ${quotaPeriod} quota is excluded from the ${period} score.`); continue; }
        const progress = frequencyProgress(snapshot, habit, evaluatedThrough, quotaPeriod, challengeId);
        if (!progress.eligible || progress.contribution === null) { reject(progress.reason ?? "No eligible quota.", progress.state === "configuration"); continue; }
        items.push({ item, sourceId, sourceType: "habit", name: habit.name, isPrivate: habit.is_private, contribution: progress.contribution, weight: item.weight, expectedOpportunities: progress.requiredCount ?? 0, recordedOpportunities: Math.min(progress.actualCount, progress.requiredCount ?? 0), actual: progress.actualCount, target: progress.requiredCount, unit: "occurrences", reason: null });
        continue;
      }
      const evaluations = effectiveRange.start <= effectiveRange.end ? datesBetween(effectiveRange.start, effectiveRange.end).filter((day) => day <= evaluatedThrough).map((day) => evaluateHabit(snapshot, habit, day, challengeId)) : [];
      const invalid = evaluations.find((value) => value.state === "configuration");
      if (invalid) { reject(invalid.reason ?? "Habit schedule configuration needs correction.", true); continue; }
      const eligible = evaluations.filter((value) => value.eligible && value.contribution !== null);
      if (!eligible.length) { reject(evaluations.find((value) => value.state === "configuration")?.reason ?? "No scheduled daily opportunities in this period."); continue; }
      items.push({ item, sourceId, sourceType: "habit", name: habit.name, isPrivate: habit.is_private, contribution: eligible.reduce((sum, value) => sum + value.contribution!, 0) / eligible.length, weight: item.weight, expectedOpportunities: eligible.length, recordedOpportunities: eligible.filter((value) => value.log !== null).length, actual: period === "daily" ? eligible[0].completedCount : null, target: period === "daily" ? eligible[0].expectedCount : null, unit: "occurrences", reason: evaluations.some((value) => value.state === "configuration") ? "Some dates have missing schedule configuration and are excluded." : null });
      continue;
    }
    if (item.metric_id) {
      const metric = snapshot.metrics.find((value) => value.id === item.metric_id);
      if (!metric) { reject("Metric source is unavailable."); continue; }
      const value = metricPeriod(snapshot, metric, effectiveRange, evaluatedThrough, period, challengeId);
      if (value.contribution === null) { reject(value.reason ?? "No eligible metric target.", value.configuration); continue; }
      items.push({ item, sourceId, sourceType: "metric", name: metric.name, isPrivate: metric.is_private, contribution: value.contribution, weight: item.weight, expectedOpportunities: value.expected, recordedOpportunities: value.recorded, actual: value.actual, target: value.target, unit: metric.unit, reason: value.reason });
      continue;
    }
    const frequency = snapshot.frequencyTargets.find((value) => value.id === item.frequency_target_id);
    if (!frequency) { reject("Frequency source is unavailable."); continue; }
    if (period === "daily") { reject("Flexible quotas are excluded from daily scores."); continue; }
    const progress = frequencyProgress(snapshot, frequency, evaluatedThrough, period, challengeId);
    if (!progress.eligible || progress.contribution === null) { reject(progress.reason ?? "No matching frequency quota for this period.", progress.state === "configuration"); continue; }
    items.push({ item, sourceId, sourceType: "frequency", name: frequency.name, isPrivate: frequency.is_private, contribution: progress.contribution, weight: item.weight, expectedOpportunities: progress.requiredCount ?? 0, recordedOpportunities: Math.min(progress.actualCount, progress.requiredCount ?? 0), actual: progress.actualCount, target: progress.requiredCount, unit: progress.countMode === "distinct_days" ? "days" : "sessions", reason: null });
  }
  const categories = weights.flatMap((weight): ScoreCategoryResult[] => {
    const category = snapshot.scoreCategories.find((value) => value.id === weight.score_category_id);
    if (!category) return [];
    const categoryItems = items.filter((value) => value.item.score_category_id === category.id);
    const denominator = categoryItems.reduce((sum, value) => sum + value.weight, 0);
    return [{ category, weight: weight.weight, contribution: denominator > 0 && weight.weight > 0 ? categoryItems.reduce((sum, value) => sum + value.weight * value.contribution, 0) / denominator : null, items: categoryItems }];
  }).sort((a, b) => a.category.position - b.category.position);
  const eligibleCategories = categories.filter((value) => value.contribution !== null && value.weight > 0);
  const totalWeight = eligibleCategories.reduce((sum, value) => sum + value.weight, 0);
  const expected = items.reduce((sum, value) => sum + value.expectedOpportunities, 0);
  const recorded = items.reduce((sum, value) => sum + value.recordedOpportunities, 0);
  return {
    ...base, status: configuration ? "configuration" : base.status,
    total: !configuration && totalWeight > 0 ? 100 * eligibleCategories.reduce((sum, value) => sum + value.weight * value.contribution!, 0) / totalWeight : null,
    items, categories, exclusions,
    coverage: { recorded, expected, ratio: expected ? recorded / expected : null, historyComplete: base.coverage.historyComplete && !configuration },
  };
}
