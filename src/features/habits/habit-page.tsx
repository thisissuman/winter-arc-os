import Link from "next/link";
import { ChevronLeft, ChevronRight, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/tracking/page-header";
import { TrackingUnavailable } from "@/components/tracking/tracking-unavailable";
import { requireAccount } from "@/lib/auth/session";
import { loadTrackingSnapshot, TrackingSetupError } from "@/features/tracking/queries";
import { addDays, businessDate, datesBetween, monthRange, parseMonthQuery } from "@/features/tracking/dates";
import { contextTrackers, evaluateHabit, frequencyProgress, habitStreak, type HabitState } from "@/features/tracking/domain";
import { trackerDescription, trackerLabel } from "@/features/tracking/presentation";
import { DeleteHabitDialog, HabitArchiveButton, HabitEditor, HabitLogDialog } from "./habit-forms";
import type { Habit, TrackingSnapshot } from "@/features/tracking/types";

type Query = { [key: string]: string | string[] | undefined };
const states: Record<HabitState, { label: string; symbol: string; className: string }> = {
  completed: { label: "Completed", symbol: "✓", className: "text-success bg-success/10" },
  partial: { label: "Partially completed", symbol: "◐", className: "text-warning bg-warning/10" },
  missed: { label: "Missed", symbol: "×", className: "text-destructive bg-destructive/10" },
  skipped: { label: "Skipped", symbol: "↷", className: "text-warning" },
  pending: { label: "Pending today", symbol: "◌", className: "text-primary" },
  flexible: { label: "Flexible quota, no daily obligation", symbol: "○", className: "text-muted-foreground" },
  unscheduled: { label: "Not scheduled", symbol: "—", className: "text-muted-foreground" },
  future: { label: "Future date", symbol: "→", className: "text-muted-foreground" },
  inactive: { label: "Outside active dates", symbol: "·", className: "text-muted-foreground" },
  configuration: { label: "Schedule needs configuration", symbol: "!", className: "text-warning" },
};

function scheduleForEditor(snapshot: TrackingSnapshot, habit: Habit) {
  return snapshot.schedules.filter((schedule) => schedule.habit_id === habit.id).sort((a, b) => b.effective_from.localeCompare(a.effective_from))[0];
}

function monthTitle(month: string) {
  return new Intl.DateTimeFormat("en", { timeZone: "UTC", year: "numeric", month: "long" }).format(new Date(`${month}-01T00:00:00Z`));
}

function habitSummary(snapshot: TrackingSnapshot, habit: Habit, asOf: string, from: string, to: string, challengeId?: string) {
  const streak = habitStreak(snapshot, habit, asOf, challengeId);
  const schedule = evaluateHabit(snapshot, habit, asOf, challengeId).schedule;
  if (schedule?.frequency === "TIMES_PER_WEEK" || schedule?.frequency === "TIMES_PER_MONTH") {
    const progress = frequencyProgress(snapshot, habit, asOf, schedule.frequency === "TIMES_PER_WEEK" ? "weekly" : "monthly", challengeId);
    return <div className="space-y-1"><p className="text-sm">{progress.requiredCount === null ? "Quota not configured" : `${progress.actualCount} / ${progress.requiredCount} occurrences this ${progress.period === "weekly" ? "week" : "month"}`}</p><p className="text-xs text-muted-foreground">{progress.state === "in_progress" ? "Period in progress" : progress.state === "final" ? "Closed period" : progress.reason ?? "No eligible period"} · Flexible quotas do not use a daily streak.</p></div>;
  }
  const evaluated = datesBetween(from, to).filter((date) => date <= snapshot.today).map((date) => evaluateHabit(snapshot, habit, date, challengeId)).filter((result) => result.eligible && result.state !== "pending");
  const consistency = evaluated.length ? evaluated.reduce((total, result) => total + (result.contribution ?? 0), 0) / evaluated.length : null;
  return <div className="space-y-1"><p className="text-sm">{consistency === null ? "No closed scheduled opportunities" : `${Math.round(consistency * 100)}% count adherence · ${evaluated.length} scheduled opportunities this month`}</p><p className="text-xs leading-5 text-muted-foreground">{streak.current === null ? "Period quota habit" : `${streak.current} current · ${streak.longest ?? 0} longest scheduled-opportunity streak`}{!streak.historyComplete ? ` · Available history from ${streak.historyFrom}` : ""}</p>{streak.reason && <p className="text-xs leading-5 text-muted-foreground">{streak.reason}</p>}</div>;
}

export async function HabitPage({ query }: { query: Query }) {
  const { preferences } = await requireAccount();
  const today = businessDate(preferences.timezone);
  const month = parseMonthQuery(query.month, today);
  const range = monthRange(month);
  let snapshot: TrackingSnapshot;
  try { snapshot = await loadTrackingSnapshot({ from: addDays(range.start, -365), to: range.end }); }
  catch (error) { if (error instanceof TrackingSetupError) return <TrackingUnavailable />; throw error; }
  const challengeId = typeof query.challenge === "string" && snapshot.challenges.some((challenge) => challenge.id === query.challenge) ? query.challenge : undefined;
  const filter = query.status === "archived" || query.status === "all" ? query.status : "current";
  const habits = contextTrackers(snapshot, challengeId).habits.filter((habit) => filter === "all" || (filter === "archived" ? Boolean(habit.archived_on) : !habit.archived_on));
  const dates = datesBetween(range.start, range.end);
  const categories = snapshot.categories.filter((category) => !category.archived_at).map((category) => ({ id: category.id, name: category.name }));
  const queryForMonth = (value: string) => `/habits?month=${value}&status=${filter}${challengeId ? `&challenge=${challengeId}` : ""}`;
  const asOf = range.end < snapshot.today ? range.end : snapshot.today;
  return <>
    <PageHeader title="Habits" description="A month of real actions. One habit log can serve every challenge that uses it." actions={<HabitEditor today={snapshot.today} categories={categories} />} />
    <div className="mt-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
      <nav aria-label="Habit month" className="flex items-center gap-3"><Button asChild variant="outline" className="size-11"><Link href={queryForMonth(addDays(range.start, -1).slice(0, 7))} aria-label="Previous month"><ChevronLeft className="size-4" aria-hidden="true" /></Link></Button><h2 className="min-w-40 text-center text-base font-medium">{monthTitle(month)}</h2><Button asChild variant="outline" className="size-11"><Link href={queryForMonth(addDays(range.end, 1).slice(0, 7))} aria-label="Next month"><ChevronRight className="size-4" aria-hidden="true" /></Link></Button></nav>
      <form method="get" className="flex flex-wrap items-end gap-3"><input type="hidden" name="month" value={month} /><div><label htmlFor="habit-challenge" className="mb-2 block text-xs text-muted-foreground">Tracking context</label><select id="habit-challenge" name="challenge" defaultValue={challengeId ?? ""} className="h-11 max-w-full rounded-lg border border-input bg-card px-3 text-sm"><option value="">Personal trackers</option>{snapshot.challenges.map((challenge) => <option key={challenge.id} value={challenge.id}>{challenge.title}</option>)}</select></div><div><label htmlFor="habit-status" className="mb-2 block text-xs text-muted-foreground">Show</label><select id="habit-status" name="status" defaultValue={filter} className="h-11 rounded-lg border border-input bg-card px-3 text-sm"><option value="current">Current</option><option value="archived">Archived</option><option value="all">All</option></select></div><Button type="submit" variant="outline" className="h-11 px-4">Apply</Button></form>
    </div>
    {habits.length === 0 ? <section className="mt-7 rounded-xl border p-7"><h2 className="text-xl font-medium">{filter === "archived" ? "No archived habits" : challengeId ? "No habits in this challenge" : "Build a small routine"}</h2><p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">{challengeId ? "Edit the challenge to include existing shared habits, or create a habit and associate it." : "Add a behavior and decide when it is due. Flexible weekly habits stay separate from daily obligations."}</p><Button asChild variant="outline" className="mt-5 h-11 px-4"><Link href={challengeId ? `/challenges/${challengeId}` : "/onboarding"}>{challengeId ? "Edit challenge associations" : "Explore starter setup"}</Link></Button></section> : <>
      <p id="habit-grid-help" className="mt-6 text-xs leading-5 text-muted-foreground">Scroll horizontally to review the month. Keyboard users can focus the grid and use arrow keys to scroll, then Tab to a date to edit its shared log. Future and unscheduled dates cannot be marked missed.</p>
      <div role="region" aria-label={`${monthTitle(month)} habit calendar`} aria-describedby="habit-grid-help" tabIndex={0} className="mt-3 max-w-full overflow-x-auto overscroll-x-contain rounded-xl border bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        <table className="w-full border-collapse text-sm"><caption className="sr-only">{monthTitle(month)} habit history. Symbols describe completed, partial, missed, skipped, pending, flexible, unscheduled, future, and inactive dates.</caption><thead><tr className="border-b"><th scope="col" className="sticky left-0 z-10 min-w-44 border-r bg-card px-4 py-4 text-left text-xs font-medium">Habit</th>{dates.map((date) => <th key={date} scope="col" className={`min-w-12 px-1 py-4 text-center text-xs font-medium ${date === snapshot.today ? "text-primary" : "text-muted-foreground"}`}><span className="block">{new Intl.DateTimeFormat("en", { timeZone: "UTC", weekday: "narrow" }).format(new Date(`${date}T00:00:00Z`))}</span><span className="mt-1 block tabular-nums">{Number(date.slice(8))}</span></th>)}</tr></thead><tbody>{habits.map((habit) => {
          const label = trackerLabel(habit, snapshot);
          return <tr key={habit.id} className="border-b last:border-b-0"><th scope="row" className="sticky left-0 z-10 max-w-52 border-r bg-card px-4 py-3 text-left font-normal"><span className="block break-words text-sm font-medium">{label}</span>{habit.is_private && <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><LockKeyhole className="size-3" aria-hidden="true" />Private</span>}</th>{dates.map((date) => {
            const evaluation = evaluateHabit(snapshot, habit, date, challengeId);
            const state = states[evaluation.state];
            const masked = snapshot.privacyMode && habit.is_private;
            const disabled = ["future", "unscheduled", "inactive", "configuration"].includes(evaluation.state);
            const symbol = evaluation.completedCount > 1 && (evaluation.state === "completed" || evaluation.state === "partial") ? String(evaluation.completedCount) : state.symbol;
            const stateLabel = evaluation.state === "partial" ? `${state.label}: ${evaluation.completedCount} of ${evaluation.expectedCount}` : state.label;
            return <td key={date} className={`px-1 py-2 text-center ${state.className}`}><HabitLogDialog symbol={symbol} stateLabel={stateLabel} disabled={disabled} entry={{ habitId: habit.id, label, date, status: evaluation.log?.status ?? null, count: evaluation.completedCount, expectedCount: evaluation.expectedCount ?? 1, revision: evaluation.log?.revision ?? null, masked, ...(masked ? {} : { notes: evaluation.log?.notes ?? "" }) }} /></td>;
          })}</tr>;
        })}</tbody></table>
      </div>
      <ul aria-label="Habit grid legend" className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-xs text-muted-foreground">{(["completed", "partial", "missed", "skipped", "pending", "flexible", "unscheduled", "future", "inactive", "configuration"] as HabitState[]).map((key) => <li key={key} className="flex items-center gap-2"><span aria-hidden="true">{states[key].symbol}</span>{states[key].label}</li>)}</ul>
      <section aria-labelledby="habit-details" className="mt-10"><h2 id="habit-details" className="text-lg font-medium">Schedules and consistency</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Consistency uses closed scheduled opportunities in the shown month. Streaks follow scheduled opportunities in the loaded history, rather than calendar days.</p><div className="mt-5 divide-y border-t">{habits.map((habit) => <article key={habit.id} className="py-6"><div className="flex flex-col justify-between gap-5 sm:flex-row"><div className="min-w-0 space-y-3"><h3 className="break-words text-base font-medium">{trackerLabel(habit, snapshot)}{habit.archived_on && <span className="ml-2 text-xs font-normal text-muted-foreground">Archived</span>}</h3>{trackerDescription(habit, snapshot) && <p className="max-w-xl break-words text-sm leading-6 text-muted-foreground">{trackerDescription(habit, snapshot)}</p>}{habitSummary(snapshot, habit, asOf, range.start, range.end, challengeId)}</div><div className="flex shrink-0 flex-wrap items-start gap-2">{snapshot.privacyMode && habit.is_private ? <Link href="/settings/tracking" className="inline-flex min-h-11 items-center text-xs text-muted-foreground hover:text-foreground">Turn off Privacy Mode to edit details</Link> : !habit.archived_on ? <HabitEditor habit={habit} schedule={scheduleForEditor(snapshot, habit)} today={snapshot.today} categories={categories} /> : null}{!habit.archived_on && <HabitArchiveButton habit={{ id: habit.id, updated_at: habit.updated_at }} />}<DeleteHabitDialog habit={{ id: habit.id, updated_at: habit.updated_at }} /></div></div></article>)}</div></section>
    </>}
  </>;
}
