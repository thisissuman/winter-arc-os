import { addDays, datesBetween, weekRange } from "@/features/tracking/dates";
import { metricDailyValue } from "@/features/tracking/domain";
import type { MetricDefinition, TrackingSnapshot } from "@/features/tracking/types";

export type FitnessPoint = { date: string; value: number | null };
export type RecordedAverage = { value: number | null; recordedDays: number; windowDays: number; start: string; end: string };

export function metricByStarterKey(snapshot: TrackingSnapshot, key: string): MetricDefinition | null {
  return snapshot.metrics.find((metric) => metric.starter_key === key && !metric.archived_on) ?? null;
}

export function metricSeries(snapshot: TrackingSnapshot, metric: MetricDefinition, start: string, end: string): FitnessPoint[] {
  return datesBetween(start, end).map((date) => ({ date, value: metricDailyValue(snapshot, metric, date).rawValue }));
}

/** Missing days are absent from the denominator, never silently recorded as zero. */
export function averageRecorded(points: FitnessPoint[]): RecordedAverage {
  const values = points.flatMap((point) => point.value === null ? [] : [point.value]);
  return {
    value: values.length ? values.reduce((total, value) => total + value, 0) / values.length : null,
    recordedDays: values.length, windowDays: points.length,
    start: points[0]?.date ?? "", end: points.at(-1)?.date ?? "",
  };
}

export function weightAverages(snapshot: TrackingSnapshot, metric: MetricDefinition, date: string) {
  const sevenDay = averageRecorded(metricSeries(snapshot, metric, addDays(date, -6), date));
  const week = weekRange(date, snapshot.weekStartsOn);
  return { sevenDay, week: averageRecorded(metricSeries(snapshot, metric, week.start, date < week.end ? date : week.end)) };
}

export function exerciseProgression(snapshot: TrackingSnapshot, exerciseId: string): { workoutId: string; date: string; bestWeightKg: number; bestReps: number; sets: number }[] {
  return snapshot.workoutExercises.filter((item) => item.exercise_id === exerciseId).flatMap((item) => {
    const workout = snapshot.workouts.find((row) => row.id === item.workout_id);
    if (!workout || workout.status !== "completed") return [];
    const sets = snapshot.workoutSets.filter((set) => set.workout_exercise_id === item.id);
    if (!sets.length) return [];
    return [{ workoutId: workout.id, date: workout.business_date, bestWeightKg: Math.max(...sets.map((set) => set.weight_kg)), bestReps: Math.max(...sets.map((set) => set.reps)), sets: sets.length }];
  }).sort((a, b) => a.date.localeCompare(b.date));
}
