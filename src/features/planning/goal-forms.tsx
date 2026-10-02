"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormFeedback } from "@/components/form-feedback";
import { controlClass, FormField } from "@/components/tracking/form-field";
import { initialFormState } from "@/lib/auth/validation";
import type { Challenge, MetricDefinition, TrackingCategory } from "@/features/tracking/types";
import type { GoalMilestone, GoalMode, PlanningGoal } from "./types";
import { saveGoalMilestone, savePlanningGoal, type PlanningState } from "./actions";

type GoalChoices = { categories: TrackingCategory[]; challenges: Challenge[]; metrics: MetricDefinition[] };
export function GoalForm({ goal, choices, today }: { goal?: PlanningGoal; choices: GoalChoices; today: string }) {
  const [state, action, pending] = useActionState(savePlanningGoal, initialFormState as PlanningState);
  const [mode, setMode] = useState<GoalMode>(goal?.progress_mode ?? "manual");
  const id = goal?.id ?? "new";
  return <form action={action} className="space-y-4 rounded-xl border bg-card p-5"><input type="hidden" name="id" value={goal?.id ?? ""} /><input type="hidden" name="expectedRevision" value={goal?.revision ?? ""} />
    <FormField name={`goal-title-${id}`} label="Goal title"><input id={`goal-title-${id}`} name="title" required maxLength={160} defaultValue={goal?.title ?? ""} className={controlClass} /></FormField>
    <FormField name={`goal-description-${id}`} label="Description (optional)"><textarea id={`goal-description-${id}`} name="description" maxLength={4000} defaultValue={goal?.description ?? ""} className={`${controlClass} min-h-24`} /></FormField>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <FormField name={`goal-target-date-${id}`} label="Target date (optional)"><input id={`goal-target-date-${id}`} name="targetDate" type="date" defaultValue={goal?.target_date ?? ""} className={controlClass} /></FormField>
      <FormField name={`goal-status-${id}`} label="Status"><select id={`goal-status-${id}`} name="status" defaultValue={goal?.status ?? "active"} className={controlClass}><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option>{goal && <option value="archived">Archived</option>}</select></FormField>
      <FormField name={`goal-category-${id}`} label="Category (optional)"><select id={`goal-category-${id}`} name="categoryId" defaultValue={goal?.category_id ?? ""} className={controlClass}><option value="">None</option>{choices.categories.filter((item) => !item.archived_at || item.id === goal?.category_id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></FormField>
      <FormField name={`goal-challenge-${id}`} label="Challenge (optional)"><select id={`goal-challenge-${id}`} name="challengeId" defaultValue={goal?.challenge_id ?? ""} className={controlClass}><option value="">Personal</option>{choices.challenges.filter((item) => item.status !== "archived" || item.id === goal?.challenge_id).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></FormField>
    </div>
    <FormField name={`goal-mode-${id}`} label="Progress mode"><select id={`goal-mode-${id}`} name="progressMode" value={mode} onChange={(event) => setMode(event.target.value as GoalMode)} className={controlClass}><option value="manual">Manual percentage</option><option value="milestone">Completed milestones</option><option value="metric">Measured metric</option></select></FormField>
    {mode === "manual" && <FormField name={`goal-percent-${id}`} label="Manual progress (%)"><input id={`goal-percent-${id}`} name="manualPercent" type="number" min="0" max="100" step="0.1" defaultValue={goal?.manual_percent ?? 0} required className={controlClass} /></FormField>}
    {mode === "milestone" && <p className="rounded-lg border bg-secondary/40 p-3 text-sm text-muted-foreground">Progress is completed milestones divided by all milestones. An empty list has no percentage. You can add milestones after saving the goal.</p>}
    {mode === "metric" && <div className="space-y-4 rounded-lg border bg-secondary/30 p-4"><p className="text-sm text-muted-foreground">Measure from a source over a chosen interval. Latest and sum need recorded values; count uses recorded days. A lower target supports decreasing outcomes.</p><div className="grid gap-4 sm:grid-cols-2">
      <FormField name={`goal-metric-${id}`} label="Metric source"><select id={`goal-metric-${id}`} name="metricId" defaultValue={goal?.metric_id ?? ""} required className={controlClass}><option value="">Choose a metric</option>{choices.metrics.filter((item) => !item.archived_on || item.id === goal?.metric_id).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>)}</select></FormField>
      <FormField name={`goal-aggregation-${id}`} label="Aggregation"><select id={`goal-aggregation-${id}`} name="metricAggregation" defaultValue={goal?.metric_aggregation ?? "latest"} className={controlClass}><option value="latest">Latest recorded value</option><option value="sum">Sum of recorded values</option><option value="count">Count recorded days</option></select></FormField>
      <FormField name={`goal-start-${id}`} label="Interval start"><input id={`goal-start-${id}`} name="metricStartDate" type="date" required defaultValue={goal?.metric_start_date ?? today} className={controlClass} /></FormField>
      <FormField name={`goal-end-${id}`} label="Interval end (optional)"><input id={`goal-end-${id}`} name="metricEndDate" type="date" defaultValue={goal?.metric_end_date ?? ""} className={controlClass} /></FormField>
      <FormField name={`goal-baseline-${id}`} label="Baseline"><input id={`goal-baseline-${id}`} name="metricBaseline" type="number" step="any" required defaultValue={goal?.metric_baseline ?? ""} className={controlClass} /></FormField>
      <FormField name={`goal-target-${id}`} label="Target value"><input id={`goal-target-${id}`} name="metricTarget" type="number" step="any" required defaultValue={goal?.metric_target ?? ""} className={controlClass} /></FormField>
    </div></div>}
    <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="isPrivate" defaultChecked={goal?.is_private ?? true} className="size-4 accent-primary" />Private goal</label>
    <Button className="min-h-11" disabled={pending}>{pending ? "Saving…" : goal ? "Save goal" : "Create goal"}</Button><FormFeedback state={state} />
  </form>;
}

export function MilestoneForm({ goalId, milestone }: { goalId: string; milestone?: GoalMilestone }) {
  const [state, action, pending] = useActionState(saveGoalMilestone, initialFormState as PlanningState);
  const id = milestone?.id ?? "new";
  return <form action={action} className="space-y-3 rounded-xl border bg-card p-4"><input type="hidden" name="id" value={milestone?.id ?? ""} /><input type="hidden" name="goalId" value={goalId} /><input type="hidden" name="expectedRevision" value={milestone?.revision ?? ""} />
    <div className="flex flex-wrap items-end gap-3"><div className="min-w-48 flex-1"><FormField name={`milestone-title-${id}`} label={milestone ? "Milestone" : "New milestone"}><input id={`milestone-title-${id}`} name="title" required maxLength={160} defaultValue={milestone?.title ?? ""} className={controlClass} /></FormField></div><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="completed" defaultChecked={Boolean(milestone?.completed_at)} className="size-4 accent-primary" />Complete</label><Button className="min-h-11" disabled={pending}>{pending ? "Saving…" : milestone ? "Save milestone" : "Add milestone"}</Button>{milestone && <Button type="submit" name="delete" value="true" variant="destructive" className="min-h-11" disabled={pending} onClick={(event) => { if (!window.confirm("Delete this milestone?")) event.preventDefault(); }}>Delete</Button>}</div>
    <FormFeedback state={state} />
  </form>;
}
