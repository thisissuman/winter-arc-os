import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/tracking/page-header";
import { TrackingUnavailable } from "@/components/tracking/tracking-unavailable";
import { Button } from "@/components/ui/button";
import { addDays, datesBetween, parseDateQuery, weekRange } from "@/features/tracking/dates";
import { carryCandidates, orderedTasks } from "@/features/planning/domain";
import { CarryForm, TaskForm, TaskRow } from "@/features/planning/task-forms";
import { loadPlanningSnapshot, PlanningSetupError } from "@/features/planning/queries";

export const metadata = { title: "Weekly tasks" };
export default async function TasksPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const query = await searchParams;
  let snapshot;
  try { snapshot = await loadPlanningSnapshot(); } catch (error) { if (error instanceof PlanningSetupError) return <TrackingUnavailable message="Apply the Phase 5 planning migration to use tasks and goals." />; throw error; }
  const date = parseDateQuery(query.date, snapshot.today);
  const week = weekRange(date, snapshot.weekStartsOn);
  const dates = datesBetween(week.start, week.end);
  const tasks = orderedTasks(snapshot.tasks, date);
  const unfinished = carryCandidates(snapshot.tasks, date);
  const choices = snapshot.privacyMode ? { categories: [], goals: [], challenges: [] } : { categories: snapshot.categories, goals: snapshot.goals, challenges: snapshot.challenges };
  return <><PageHeader title="Weekly tasks" description="Plan one day at a time while keeping the whole week visible. Tasks do not contribute to your score." actions={<Link href="/goals" className="inline-flex min-h-11 items-center rounded-lg border px-4 text-sm">View goals</Link>} />
    <nav aria-label="Change planner week" className="mt-5 flex items-center gap-2"><Button asChild variant="outline" className="size-11 p-0"><Link href={`/tasks?date=${addDays(date, -7)}`} aria-label="Previous week"><ArrowLeft className="size-4" /></Link></Button><p className="min-w-0 flex-1 text-center text-sm tabular-nums">{week.start} – {week.end}</p><Button asChild variant="outline" className="size-11 p-0"><Link href={`/tasks?date=${addDays(date, 7)}`} aria-label="Next week"><ArrowRight className="size-4" /></Link></Button></nav>
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7" aria-label="Seven-day planner">{dates.map((day) => { const dayTasks = orderedTasks(snapshot.tasks, day); const done = dayTasks.filter((task) => task.status === "completed").length; return <Link key={day} href={`/tasks?date=${day}`} aria-current={day === date ? "date" : undefined} className={`min-h-20 rounded-xl border p-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${day === date ? "border-selected-border bg-selected text-selected-foreground" : "bg-card hover:border-primary/50"}`}><span className="flex items-baseline justify-between gap-2 font-medium"><span>{new Intl.DateTimeFormat("en", { weekday: "short", timeZone: "UTC" }).format(new Date(`${day}T12:00:00Z`))}</span><span className="tabular-nums">{day.slice(5)}</span></span><span className="mt-2 block text-xs text-muted-foreground">{done}/{dayTasks.length} done</span></Link>; })}</div>
    <section className="mt-8" aria-labelledby="selected-tasks"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="selected-tasks" className="text-xl font-medium">Tasks for {date}</h2><p className="mt-1 text-sm text-muted-foreground">{tasks.length} planned · {tasks.filter((task) => task.status === "completed").length} completed</p></div><Link href="/plan" className="text-sm text-primary underline">Planning home</Link></div>
      {tasks.length === 0 ? <p className="mt-4 rounded-xl border bg-card p-5 text-sm text-muted-foreground">No tasks on this date. Add one below or select another day.</p> : <div className="mt-4 grid gap-3 lg:grid-cols-2">{tasks.map((task, index) => { const masked = snapshot.privacyMode && task.is_private; const presented = masked ? { ...task, title: "Private task", notes: "" } : task; return <TaskRow key={`${task.id}-${task.revision}`} task={presented} canMoveUp={index > 0} canMoveDown={index < tasks.length - 1} showEditor={!snapshot.privacyMode} choices={choices} />; })}</div>}
    </section>
    <div className="mt-8 grid gap-5 lg:grid-cols-2"><section><h2 className="mb-3 text-lg font-medium">Add a task</h2>{snapshot.privacyMode ? <p className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">Task editing is hidden in Privacy Mode. Turn it off in Settings to plan work.</p> : <TaskForm date={date} choices={choices} />}</section><section><h2 className="mb-3 text-lg font-medium">Move or copy</h2><CarryForm key={date} sourceDate={date} targetDate={addDays(date, 1)} operationId={crypto.randomUUID()} count={unfinished.length} /></section></div>
    <p className="mt-7 text-xs text-muted-foreground">Dates use {snapshot.timezone}. Estimates and actual time are separate. Carry-forward never includes completed tasks.</p>
  </>;
}
