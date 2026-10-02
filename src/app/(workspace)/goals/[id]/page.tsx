import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/tracking/page-header";
import { TrackingUnavailable } from "@/components/tracking/tracking-unavailable";
import { GoalForm, MilestoneForm } from "@/features/planning/goal-forms";
import { goalProgress } from "@/features/planning/domain";
import { loadPlanningSnapshot, PlanningSetupError } from "@/features/planning/queries";

export default async function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let snapshot;
  try { snapshot = await loadPlanningSnapshot(); } catch (error) { if (error instanceof PlanningSetupError) return <TrackingUnavailable message="Apply the Phase 5 planning migration to use tasks and goals." />; throw error; }
  const goal = snapshot.goals.find((item) => item.id === id);
  if (!goal) notFound();
  const milestones = snapshot.milestones.filter((item) => item.goal_id === goal.id).sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));
  const progress = goalProgress(goal, milestones, snapshot);
  const masked = snapshot.privacyMode && goal.is_private;
  return <><PageHeader title={masked ? "Private goal" : goal.title} description="Review the current measure and the steps attached to this outcome." actions={<Link href="/goals" className="inline-flex min-h-11 items-center rounded-lg border px-4 text-sm">All goals</Link>} />
    <section className="mt-7 rounded-xl border bg-card p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{goal.progress_mode} progress</p><p className="mt-2 text-3xl font-semibold tabular-nums">{progress.percent === null ? "—" : `${Math.round(progress.percent)}%`}</p></div><span className="text-sm capitalize text-muted-foreground">{goal.status}</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${progress.percent ?? 0}%` }} /></div><p className="mt-3 text-sm text-muted-foreground">{progress.reason ?? (goal.progress_mode === "milestone" ? `${progress.completedMilestones} of ${progress.totalMilestones} milestones complete` : `${progress.current == null ? "—" : Number(progress.current.toFixed(2))} ${progress.unit ?? ""} toward ${progress.target ?? "—"}`)}</p>{!masked && goal.description && <p className="mt-4 whitespace-pre-wrap text-sm">{goal.description}</p>}<p className="mt-3 text-xs text-muted-foreground">{goal.target_date ? `Target date ${goal.target_date}` : "No target date"}{goal.progress_mode === "metric" ? ` · ${progress.recordedDays} recorded days` : ""}</p></section>
    <section className="mt-9" aria-labelledby="goal-milestones"><h2 id="goal-milestones" className="mb-4 text-xl font-medium">Milestones</h2>{milestones.length === 0 ? <p className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">No milestones yet. An empty milestone goal has no calculated percentage.</p> : <div className="space-y-3">{milestones.map((milestone) => <div key={milestone.id}>{snapshot.privacyMode ? <p className="rounded-xl border bg-card p-4 text-sm">{masked ? "Private milestone" : milestone.title} · {milestone.completed_at ? "Complete" : "Open"}</p> : <MilestoneForm key={`${milestone.id}-${milestone.revision}`} goalId={goal.id} milestone={milestone} />}</div>)}</div>}{!snapshot.privacyMode && goal.status !== "archived" && <div className="mt-4"><MilestoneForm goalId={goal.id} /></div>}</section>
    {!snapshot.privacyMode && goal.status !== "archived" && <section className="mt-9" aria-labelledby="edit-goal"><h2 id="edit-goal" className="mb-4 text-xl font-medium">Edit goal</h2><GoalForm key={`${goal.id}-${goal.revision}`} goal={goal} today={snapshot.today} choices={{ categories: snapshot.categories, challenges: snapshot.challenges, metrics: snapshot.metrics }} /></section>}
    {snapshot.privacyMode && <p className="mt-7 text-sm text-muted-foreground">Goal editing is hidden in Privacy Mode.</p>}
  </>;
}
