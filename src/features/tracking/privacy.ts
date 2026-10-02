import type { TrackingSnapshot } from "./types";

/** Remove hidden text before any snapshot records can be serialized into client props. */
export function presentTrackingSnapshot(snapshot: TrackingSnapshot): TrackingSnapshot {
  if (!snapshot.privacyMode) return snapshot;
  const privateHabits = new Set(snapshot.habits.filter(item => item.is_private).map(item => item.id));
  const privateMetrics = new Set(snapshot.metrics.filter(item => item.is_private).map(item => item.id));
  return {
    ...snapshot,
    habits: snapshot.habits.map(item => item.is_private ? { ...item, name: "Private tracker", description: "" } : item),
    metrics: snapshot.metrics.map(item => item.is_private ? { ...item, name: "Private tracker", description: "" } : item),
    frequencyTargets: snapshot.frequencyTargets.map(item => item.is_private ? { ...item, name: "Private tracker", description: "" } : item),
    habitLogs: snapshot.habitLogs.map(item => privateHabits.has(item.habit_id) ? { ...item, notes: "" } : item),
    metricLogs: snapshot.metricLogs.map(item => privateMetrics.has(item.metric_id) ? { ...item, notes: "" } : item),
    sleepLogs: snapshot.sleepLogs.map(item => ({ ...item, notes: "" })),
    workouts: snapshot.workouts.map(item => ({ ...item, name: "Private workout", notes: "" })),
    workoutExercises: snapshot.workoutExercises.map(item => ({ ...item, notes: "" })),
    exercises: snapshot.exercises.map(item => ({ ...item, name: "Private exercise", muscle_group: "" })),
    studyCategories: snapshot.studyCategories.map(item => ({ ...item, name: "Private study category" })),
    studySessions: snapshot.studySessions.map(item => ({ ...item, topic: "", notes: "" })),
    focusTimers: snapshot.focusTimers.map(item => ({ ...item, topic: "", notes: "" })),
  };
}
