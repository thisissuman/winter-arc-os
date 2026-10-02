import Link from "next/link";
import { PageHeader } from "@/components/tracking/page-header";
import { TrackingUnavailable } from "@/components/tracking/tracking-unavailable";
import { GoalForm } from "@/features/planning/goal-forms";
import { goalProgress } from "@/features/planning/domain";
import { loadPlanningSnapshot, PlanningSetupError } from "@/features/planning/queries";

export const metadata = { title: "Goals" };
export default async function GoalsPage() {
  let snapshot;
  try { snapshot = await loadPlanningSnapshot(); } catch (error) { if (error instanceof PlanningSetupError) return <TrackingUnavailable message="Apply the Phase 5 planning migration to use tasks and goals." />; throw error; }
  const goals = [...snapshot.goals].sort((a, b) => (a.status === "archived" ? 1 : 0) - (b.status === "archived" ? 1 : 0) || (a.target_date ?? "9999").localeCompare(b.target_date ?? "9999") || a.title.localeCompare(b.title));
  return <><PageHeader title="Goals" description="Longer outcomes can use a manual percentage, milestones, or recorded metrics." actions={<Link href="/tasks" className="inline-flex min-h-11 items-center rounded-lg border px-4 text-sm">Weekly tasks</Link>} />
    {goals.length === 0 ? <p className="mt-7 rounded-xl border bg-card p-6 text-sm text-muted-foreground">No goals yet. Create one below; milestones and measurements can be added later.</p> : <div className="mt-7 grid gap-4 lg:grid-cols-2">{goals.map((goal) => { const progress = goalProgress(goal, snapshot.milestones, snapshot); const masked = snapshot.privacyMode && goal.is_private; return <Link key={goal.id} href={`/goals/${goal.id}`} className="rounded-xl border bg-card p-5 transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"><div className="flex flex-wrap items-start justify-between gap-2"><h2 className="break-words text-lg font-medium">{masked ? "Private goal" : goal.title}</h2><span className="text-xs capitalize text-muted-foreground">{goal.status}</span></div><p className="mt-2 text-sm text-muted-foreground">{goal.progress_mode === "milestone" ? `${progress.completedMilestones}/${progress.totalMilestones} milestones` : progress.current === null ? progress.reason : `${Number(progress.current.toFixed(2))} ${progress.unit ?? ""} toward ${progress.target ?? "—"}`}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${progress.percent ?? 0}%` }} /></div><p className="mt-2 text-xs text-muted-foreground">{progress.percent === null ? "Progress not configured" : `${Math.round(progress.percent)}% progress`}{goal.target_date ? ` · target ${goal.target_date}` : ""}</p></Link>; })}</div>}
    <section className="mt-10" aria-labelledby="create-goal"><h2 id="create-goal" className="mb-3 text-xl font-medium">Create a goal</h2>{snapshot.privacyMode ? <p className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">Goal editing is hidden in Privacy Mode. Turn it off in Settings to create a goal.</p> : <GoalForm today={snapshot.today} choices={{ categories: snapshot.categories, challenges: snapshot.challenges, metrics: snapshot.metrics }} />}</section>
  </>;
}
