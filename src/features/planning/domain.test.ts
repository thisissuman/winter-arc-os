import { describe, expect, it } from "vitest";
import { carryCandidates, goalProgress, orderedTasks } from "./domain";
import type { GoalMilestone, PlanningGoal, PlanningSnapshot, PlanningTask } from "./types";

const goal = { id: "goal", progress_mode: "manual", manual_percent: 35, metric_id: null, metric_aggregation: null,
  metric_start_date: null, metric_end_date: null, metric_baseline: null, metric_target: null } as PlanningGoal;
const snapshot = { today: "2026-10-01", metrics: [], metricLogs: [], sleepLogs: [], studySessions: [] } as unknown as PlanningSnapshot;

describe("Phase 5 planning calculations", () => {
  it("orders tasks and excludes completed work from carry-forward", () => {
    const tasks = [
      { id: "b", business_date: "2026-10-01", position: 2000, status: "completed" },
      { id: "a", business_date: "2026-10-01", position: 1000, status: "todo" },
      { id: "c", business_date: "2026-10-02", position: 1000, status: "in_progress" },
    ] as PlanningTask[];
    expect(orderedTasks(tasks, "2026-10-01").map((task) => task.id)).toEqual(["a", "b"]);
    expect(carryCandidates(tasks, "2026-10-01").map((task) => task.id)).toEqual(["a"]);
  });

  it("keeps manual progress separate from optional milestones", () => {
    const milestone = [{ id: "m", goal_id: goal.id, completed_at: null }] as GoalMilestone[];
    expect(goalProgress(goal, milestone, snapshot)).toMatchObject({ percent: 35, completedMilestones: 0, totalMilestones: 1 });
  });

  it("treats empty milestone mode as unconfigured, then counts completed entries", () => {
    const milestoneGoal = { ...goal, progress_mode: "milestone" } as PlanningGoal;
    expect(goalProgress(milestoneGoal, [], snapshot)).toMatchObject({ percent: null, target: null, reason: "Add a milestone to define progress." });
    const milestones = [{ goal_id: goal.id, completed_at: "2026-10-01T00:00:00Z" }, { goal_id: goal.id, completed_at: null }] as GoalMilestone[];
    expect(goalProgress(milestoneGoal, milestones, snapshot)).toMatchObject({ percent: 50, current: 1, target: 2 });
  });

  it("supports downward metric goals, caps progress, and distinguishes missing from zero", () => {
    const metricGoal = { ...goal, progress_mode: "metric", metric_id: "weight", metric_aggregation: "latest",
      metric_start_date: "2026-09-01", metric_baseline: 80, metric_target: 70 } as PlanningGoal;
    const data = { ...snapshot, metrics: [{ id: "weight", source: "manual", unit: "kg" }], metricLogs: [] } as unknown as PlanningSnapshot;
    expect(goalProgress(metricGoal, [], data)).toMatchObject({ percent: null, current: null, recordedDays: 0 });
    data.metricLogs = [{ metric_id: "weight", business_date: "2026-09-20", value: 75 }, { metric_id: "weight", business_date: "2026-10-01", value: 69 }] as PlanningSnapshot["metricLogs"];
    expect(goalProgress(metricGoal, [], data)).toMatchObject({ percent: 100, current: 69, recordedDays: 2 });
    data.metricLogs = [{ metric_id: "weight", business_date: "2026-10-01", value: 0 }] as PlanningSnapshot["metricLogs"];
    expect(goalProgress(metricGoal, [], data)).toMatchObject({ percent: 100, current: 0, recordedDays: 1 });
  });

  it("counts recorded days and sums raw metric values within the configured interval", () => {
    const metricGoal = { ...goal, progress_mode: "metric", metric_id: "steps", metric_aggregation: "count",
      metric_start_date: "2026-09-01", metric_end_date: "2026-09-30", metric_baseline: 0, metric_target: 3 } as PlanningGoal;
    const data = { ...snapshot, metrics: [{ id: "steps", source: "manual", unit: "steps" }], metricLogs: [
      { metric_id: "steps", business_date: "2026-09-10", value: 0 },
      { metric_id: "steps", business_date: "2026-09-20", value: 9000 },
      { metric_id: "steps", business_date: "2026-10-01", value: 5000 },
    ] } as unknown as PlanningSnapshot;
    expect(goalProgress(metricGoal, [], data)).toMatchObject({ current: 2, recordedDays: 2 });
    expect(goalProgress(metricGoal, [], data).percent).toBeCloseTo(200 / 3);
    expect(goalProgress({ ...metricGoal, metric_aggregation: "sum", metric_target: 18000 }, [], data)).toMatchObject({ current: 9000, percent: 50 });
  });
});
