import { studySessionDays } from "@/features/career/domain";
import type { GoalMilestone, GoalProgress, PlanningGoal, PlanningSnapshot, PlanningTask } from "./types";

export function orderedTasks(tasks: PlanningTask[], date: string): PlanningTask[] {
  return tasks.filter((task) => task.business_date === date).sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));
}

export function carryCandidates(tasks: PlanningTask[], date: string): PlanningTask[] {
  return orderedTasks(tasks, date).filter((task) => task.status !== "completed");
}

export function goalProgress(goal: PlanningGoal, milestones: GoalMilestone[], snapshot: PlanningSnapshot): GoalProgress {
  const related = milestones.filter((milestone) => milestone.goal_id === goal.id);
  const completedMilestones = related.filter((milestone) => milestone.completed_at !== null).length;
  const base = { mode: goal.progress_mode, completedMilestones, totalMilestones: related.length, recordedDays: 0 };
  if (goal.progress_mode === "manual") {
    return { ...base, percent: goal.manual_percent, current: goal.manual_percent, target: 100, unit: "%", reason: null };
  }
  if (goal.progress_mode === "milestone") {
    return { ...base, percent: related.length ? completedMilestones / related.length * 100 : null,
      current: completedMilestones, target: related.length || null, unit: "milestones", reason: related.length ? null : "Add a milestone to define progress." };
  }
  const metric = snapshot.metrics.find((item) => item.id === goal.metric_id);
  if (!metric || !goal.metric_start_date || !goal.metric_aggregation || goal.metric_baseline === null || goal.metric_target === null) {
    return { ...base, percent: null, current: null, target: goal.metric_target, unit: metric?.unit ?? null, reason: "Metric configuration is unavailable." };
  }
  const through = goal.metric_end_date && goal.metric_end_date < snapshot.today ? goal.metric_end_date : snapshot.today;
  const inRange = (date: string) => date >= goal.metric_start_date! && date <= through;
  const values = new Map<string, number>();
  if (metric.source === "manual") {
    for (const log of snapshot.metricLogs) if (log.metric_id === metric.id && inRange(log.business_date)) values.set(log.business_date, log.value);
  } else if (metric.source === "sleep") {
    for (const log of snapshot.sleepLogs) if (inRange(log.business_date)) values.set(log.business_date, log.duration_seconds / 3600);
  } else {
    for (const session of snapshot.studySessions) for (const [date, seconds] of studySessionDays(session)) {
      if (inRange(date)) values.set(date, (values.get(date) ?? 0) + seconds / 60);
    }
  }
  const sorted = [...values].sort(([a], [b]) => a.localeCompare(b));
  const current = goal.metric_aggregation === "count" ? sorted.length
    : sorted.length === 0 ? null
    : goal.metric_aggregation === "latest" ? sorted.at(-1)![1]
    : sorted.reduce((total, [, value]) => total + value, 0);
  const denominator = goal.metric_target - goal.metric_baseline;
  const percent = current === null || denominator === 0 ? null : Math.max(0, Math.min(100, (current - goal.metric_baseline) / denominator * 100));
  return { ...base, recordedDays: sorted.length, percent, current, target: goal.metric_target,
    unit: goal.metric_aggregation === "count" ? "recorded days" : metric.unit,
    reason: current === null ? "No measurements in this interval." : null };
}
