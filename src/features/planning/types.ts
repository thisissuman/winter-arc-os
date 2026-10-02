import type { Challenge, MetricDefinition, MetricLog, SleepLog, StudySession, TrackingCategory } from "@/features/tracking/types";

export type TaskStatus = "todo" | "in_progress" | "completed";
export type TaskPriority = "low" | "normal" | "high";
export type GoalStatus = "active" | "paused" | "completed" | "archived";
export type GoalMode = "manual" | "milestone" | "metric";
export type GoalAggregation = "latest" | "sum" | "count";
type Owned = { id: string; user_id: string; created_at: string; updated_at: string };

export type PlanningTask = Owned & {
  title: string; notes: string; business_date: string; timezone: string; status: TaskStatus; completed_at: string | null;
  priority: TaskPriority; category_id: string | null; goal_id: string | null; challenge_id: string | null;
  position: number; estimated_seconds: number | null; actual_seconds: number | null; is_private: boolean; revision: number;
};
export type PlanningGoal = Owned & {
  title: string; description: string; category_id: string | null; challenge_id: string | null; target_date: string | null;
  status: GoalStatus; progress_mode: GoalMode; manual_percent: number; metric_id: string | null;
  metric_aggregation: GoalAggregation | null; metric_start_date: string | null; metric_end_date: string | null;
  metric_baseline: number | null; metric_target: number | null; is_private: boolean; revision: number;
};
export type GoalMilestone = Owned & { goal_id: string; title: string; position: number; completed_at: string | null; revision: number };
export type PlanningSnapshot = {
  tasks: PlanningTask[]; goals: PlanningGoal[]; milestones: GoalMilestone[];
  categories: TrackingCategory[]; challenges: Challenge[]; metrics: MetricDefinition[];
  metricLogs: MetricLog[]; sleepLogs: SleepLog[]; studySessions: StudySession[];
  today: string; timezone: string; weekStartsOn: number; privacyMode: boolean;
};
export type GoalProgress = {
  mode: GoalMode; percent: number | null; current: number | null; target: number | null;
  unit: string | null; completedMilestones: number; totalMilestones: number; recordedDays: number; reason: string | null;
};
