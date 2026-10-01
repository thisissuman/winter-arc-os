import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/tracking/page-header";
import { TrackingUnavailable } from "@/components/tracking/tracking-unavailable";
import { loadTrackingSnapshot, TrackingSetupError } from "@/features/tracking/queries";
import { trackerLabel, trackerDescription } from "@/features/tracking/presentation";
import { inclusiveChallengeProgress } from "@/features/tracking/dates";
import { ChallengeArchiveButton, ChallengeEditor, DeleteChallengeDialog, SelectChallengeButton } from "./challenge-forms";
import type { Challenge, TrackingSnapshot } from "@/features/tracking/types";

type Query = { [key: string]: string | string[] | undefined };

function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

function editorProps(snapshot: TrackingSnapshot, challenge?: Challenge) {
  const habits = snapshot.habits.map((habit) => ({ id: habit.id, label: trackerLabel(habit, snapshot), archived: Boolean(habit.archived_on) }));
  const metrics = snapshot.metrics.map((metric) => ({ id: metric.id, label: trackerLabel(metric, snapshot), archived: Boolean(metric.archived_on) }));
  const targets = snapshot.frequencyTargets.map((target) => ({ id: target.id, label: trackerLabel(target, snapshot), archived: Boolean(target.archived_on) }));
  return {
    challenge, today: snapshot.today, habits, metrics, targets,
    habitIds: snapshot.challengeHabits.filter((link) => link.challenge_id === challenge?.id).map((link) => link.habit_id),
    metricIds: snapshot.challengeMetrics.filter((link) => link.challenge_id === challenge?.id).map((link) => link.metric_id),
    targetIds: snapshot.challengeTargets.filter((link) => link.challenge_id === challenge?.id).map((link) => link.frequency_target_id),
  };
}

export async function ChallengeList({ query }: { query: Query }) {
  let snapshot: TrackingSnapshot;
  try { snapshot = await loadTrackingSnapshot(); }
  catch (error) { if (error instanceof TrackingSetupError) return <TrackingUnavailable />; throw error; }
  const filter = query.status === "archived" || query.status === "all" ? query.status : "current";
  const challenges = snapshot.challenges.filter((challenge) => filter === "all" || (filter === "archived" ? challenge.status === "archived" : challenge.status !== "archived"));
  return <>
    <PageHeader title="Challenges" description="Give a season a clear focus. Trackers stay shared, wherever you use them." actions={<ChallengeEditor {...editorProps(snapshot)} />} />
    <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
      <nav aria-label="Challenge filter" className="flex flex-wrap gap-2">{([ ["current", "Current"], ["archived", "Archived"], ["all", "All"] ] as const).map(([value, label]) => <Button key={value} asChild variant={filter === value ? "secondary" : "ghost"} className="h-11 px-4"><Link href={`/challenges?status=${value}`} aria-current={filter === value ? "page" : undefined}>{label}</Link></Button>)}</nav>
      <p className="text-sm text-muted-foreground">{challenges.length} {challenges.length === 1 ? "challenge" : "challenges"}</p>
    </div>
    {challenges.length === 0 ? <section className="mt-7 rounded-xl border px-6 py-10">
      <h2 className="text-xl font-medium">{filter === "archived" ? "No archived challenges" : "Start with a focus"}</h2>
      <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">{filter === "archived" ? "Archiving keeps your tracking history intact." : "Create your own challenge, or choose the optional Winter Arc starter setup. Today also works with your personal trackers."}</p>
      {filter !== "archived" && <Button asChild variant="outline" className="mt-5 h-11 px-4"><Link href="/onboarding">Review starter setup<ArrowRight className="ml-2 size-4" aria-hidden="true" /></Link></Button>}
    </section> : <div className="mt-7 divide-y rounded-xl border bg-card">{challenges.map((challenge) => <article key={challenge.id} className="flex flex-col justify-between gap-5 px-5 py-6 sm:flex-row sm:items-center sm:px-7">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3"><h2 className="break-words text-lg font-medium"><Link href={`/challenges/${challenge.id}`} className="hover:underline">{challenge.title}</Link></h2><span className="rounded-full border px-2.5 py-1 text-xs capitalize text-muted-foreground">{challenge.status}</span>{snapshot.selectedChallengeId === challenge.id && <span className="text-xs text-primary">Selected for Today</span>}</div>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-xs leading-5 text-muted-foreground"><CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />{dateLabel(challenge.start_date)} – {dateLabel(challenge.end_date)}</p>
        {challenge.description && <p className="mt-3 max-w-xl break-words text-sm leading-6 text-muted-foreground">{challenge.description}</p>}
      </div>
      <Button asChild variant="outline" className="h-11 self-start px-4 sm:self-auto"><Link href={`/challenges/${challenge.id}`}>View challenge<ArrowRight className="ml-2 size-4" aria-hidden="true" /></Link></Button>
    </article>)}</div>}
  </>;
}

export async function ChallengeDetail({ id }: { id: string }) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) notFound();
  let snapshot: TrackingSnapshot;
  try { snapshot = await loadTrackingSnapshot(); }
  catch (error) { if (error instanceof TrackingSetupError) return <TrackingUnavailable />; throw error; }
  const challenge = snapshot.challenges.find((item) => item.id === id);
  if (!challenge) notFound();
  const editor = editorProps(snapshot, challenge);
  const habits = snapshot.habits.filter((habit) => editor.habitIds.includes(habit.id));
  const metrics = snapshot.metrics.filter((metric) => editor.metricIds.includes(metric.id));
  const targets = snapshot.frequencyTargets.filter((target) => editor.targetIds.includes(target.id));
  const timing = inclusiveChallengeProgress(challenge.start_date, challenge.end_date, snapshot.today);
  return <>
    <Link href="/challenges" className="mb-5 inline-flex min-h-11 items-center text-sm text-muted-foreground hover:text-foreground">← All challenges</Link>
    <PageHeader title={challenge.title} description={challenge.description || "A dated focus using your shared trackers."} actions={<ChallengeEditor {...editor} />} />
    <section aria-label="Challenge dates and selection" className="mt-7 flex flex-col justify-between gap-5 rounded-xl border bg-card p-6 sm:flex-row sm:items-center">
      <div><p className="text-sm">{dateLabel(challenge.start_date)} – {dateLabel(challenge.end_date)}</p><p className="mt-2 text-xs text-muted-foreground">{timing.totalDays} inclusive days · <span className="capitalize">{challenge.status}</span>{snapshot.selectedChallengeId === id ? " · Selected for Today" : ""}</p><p className="mt-3 text-sm">{timing.state === "upcoming" ? "Starts soon" : timing.state === "finished" ? "Challenge date range finished" : `Day ${timing.dayNumber} of ${timing.totalDays} · ${(timing.progress * 100).toFixed(1)}% of challenge time elapsed`}</p><p className="mt-1 text-xs text-muted-foreground">Elapsed time is separate from tracking adherence.</p></div>
      {challenge.status !== "archived" && <SelectChallengeButton id={id} selected={snapshot.selectedChallengeId === id} />}
    </section>
    <div className="mt-9 space-y-8">
      <section aria-labelledby="challenge-habits"><div className="flex items-center justify-between gap-4"><h2 id="challenge-habits" className="text-lg font-medium">Habits</h2><Link href="/habits" className="inline-flex min-h-11 items-center text-sm text-primary">Manage habits</Link></div>
        {habits.length ? <ul className="mt-2 divide-y border-t">{habits.map((habit) => <li key={habit.id} className="py-4"><p className="text-sm font-medium">{trackerLabel(habit, snapshot)}{habit.archived_on && <span className="ml-2 text-xs font-normal text-muted-foreground">Archived</span>}</p>{trackerDescription(habit, snapshot) && <p className="mt-1 break-words text-sm leading-6 text-muted-foreground">{trackerDescription(habit, snapshot)}</p>}</li>)}</ul> : <p className="mt-3 text-sm text-muted-foreground">No habits associated. Edit this challenge to choose shared habits.</p>}
      </section>
      <section aria-labelledby="challenge-metrics"><div className="flex items-center justify-between gap-4"><h2 id="challenge-metrics" className="text-lg font-medium">Metrics</h2><Link href="/metrics" className="inline-flex min-h-11 items-center text-sm text-primary">Manage metrics</Link></div>
        {metrics.length ? <ul className="mt-2 divide-y border-t">{metrics.map((metric) => <li key={metric.id} className="flex flex-wrap items-center justify-between gap-2 py-4"><p className="text-sm font-medium">{trackerLabel(metric, snapshot)}{metric.archived_on && <span className="ml-2 text-xs font-normal text-muted-foreground">Archived</span>}</p><p className="text-xs text-muted-foreground">{metric.unit} · {metric.source === "manual" ? "Manual measurement" : "Source available in a later phase"}</p></li>)}</ul> : <p className="mt-3 text-sm text-muted-foreground">No metrics associated. Numerical records remain shared across challenges.</p>}
      </section>
      <section aria-labelledby="challenge-targets"><div className="flex items-center justify-between gap-4"><h2 id="challenge-targets" className="text-lg font-medium">Frequency targets</h2><Link href="/settings/tracking" className="inline-flex min-h-11 items-center text-sm text-primary">Manage targets</Link></div>
        {targets.length ? <ul className="mt-2 divide-y border-t">{targets.map((target) => <li key={target.id} className="py-4"><p className="text-sm font-medium">{trackerLabel(target, snapshot)}</p><p className="mt-1 text-xs text-muted-foreground">{target.source === "metric_threshold" ? "Qualifying measurement days" : "Source available in a later phase"}</p></li>)}</ul> : <p className="mt-3 text-sm text-muted-foreground">No frequency targets associated.</p>}
      </section>
    </div>
    <section aria-labelledby="challenge-data" className="mt-10 border-t pt-7"><h2 id="challenge-data" className="text-sm font-medium">Challenge management</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Archive a finished challenge to keep its context. Deleting it removes associations while retaining your shared tracking history.</p><div className="mt-4 flex flex-wrap items-start gap-3">{challenge.status !== "archived" && <ChallengeArchiveButton challenge={challenge} />}<DeleteChallengeDialog challenge={challenge} /></div></section>
  </>;
}
