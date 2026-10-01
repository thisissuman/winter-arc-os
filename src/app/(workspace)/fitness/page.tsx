import Link from "next/link";
import { PageHeader } from "@/components/tracking/page-header";
import { TrackingUnavailable } from "@/components/tracking/tracking-unavailable";
import { MetricLogger } from "@/features/today/metric-logger";
import { SleepForm, FitnessSetupForm } from "@/features/fitness/fitness-forms";
import { TrendChart } from "@/features/fitness/trend-chart";
import { averageRecorded, metricByStarterKey, metricSeries, weightAverages } from "@/features/fitness/domain";
import { frequencyProgress, metricDailyValue } from "@/features/tracking/domain";
import { addDays, parseDateQuery } from "@/features/tracking/dates";
import { loadTrackingSnapshot, TrackingSetupError } from "@/features/tracking/queries";
import { privateNotes, trackerLabel } from "@/features/tracking/presentation";
import { controlClass } from "@/components/tracking/form-field";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Fitness" };
export default async function FitnessPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date: requestedDate } = await searchParams;
  let snapshot;
  try { snapshot = await loadTrackingSnapshot(); }
  catch (error) { if (error instanceof TrackingSetupError) return <TrackingUnavailable />; throw error; }
  const requested = parseDateQuery(requestedDate, snapshot.today);
  const date = requested > snapshot.today ? snapshot.today : requested;
  const fitnessKeys = ["body-weight", "protein", "water", "steps"];
  const available = fitnessKeys.flatMap((key) => { const metric = metricByStarterKey(snapshot, key); return metric ? [{ key, metric }] : []; });
  const sleepMetric = metricByStarterKey(snapshot, "sleep");
  const sleepLog = snapshot.sleepLogs.find((log) => log.business_date === date) ?? null;
  const weight = metricByStarterKey(snapshot, "body-weight");
  const weightTrend = weight ? metricSeries(snapshot, weight, addDays(date, -29), date) : [];
  const weightSummary = weight ? weightAverages(snapshot, weight, date) : null;
  const protein = metricByStarterKey(snapshot, "protein");
  const proteinToday = protein ? metricDailyValue(snapshot, protein, date) : null;
  const gym = snapshot.frequencyTargets.find((target) => target.starter_key === "gym" && !target.archived_on) ?? null;
  const gymProgress = gym ? frequencyProgress(snapshot, gym, date, "weekly", snapshot.selectedChallengeId) : null;
  const needsSetup = fitnessKeys.some((key) => !snapshot.metrics.some((metric) => metric.starter_key === key))
    || !snapshot.metrics.some((metric) => metric.starter_key === "sleep")
    || !snapshot.habits.some((habit) => habit.starter_key === "creatine")
    || !snapshot.frequencyTargets.some((target) => target.starter_key === "gym")
    || Boolean(sleepMetric && sleepMetric.source_available_from === null || gym && gym.source_available_from === null);
  const sleepTrend = sleepMetric ? metricSeries(snapshot, sleepMetric, addDays(date, -29), date) : [];
  const sleepAverage = averageRecorded(sleepTrend);
  const creatine = snapshot.habits.find((habit) => habit.starter_key === "creatine" && !habit.archived_on) ?? null;
  return <>
    <PageHeader title="Fitness" description="Record real measurements and workouts. Trends use recorded days only." actions={<Link href="/fitness/workouts" className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">Workouts</Link>} />
    {snapshot.selectedChallengeId && <p className="mt-3 text-xs text-muted-foreground">Gym quota uses the selected Today challenge; measurement history remains shared across challenges.</p>}
    <form action="/fitness" className="mt-6 flex flex-wrap items-end gap-3"><label className="space-y-2 text-sm"><span className="block">Tracking date</span><input name="date" type="date" defaultValue={date} max={snapshot.today} className={controlClass} /></label><Button variant="outline" className="min-h-11">View day</Button></form>
    {needsSetup && <section className="mt-6 rounded-xl border bg-card p-5"><h2 className="text-lg font-medium">Set up fitness tracking</h2><p className="mt-2 text-sm text-muted-foreground">Add editable weight, protein, water, steps, creatine, sleep, and gym definitions. Sleep target is optional. No measurements or completions are created.</p><FitnessSetupForm /></section>}
    <section className="mt-8 grid gap-4 md:grid-cols-2" aria-label="Fitness measurements">{available.map(({ key, metric }) => {
      const value = metricDailyValue(snapshot, metric, date);
      const masked = snapshot.privacyMode && metric.is_private;
      return <article key={metric.id} className="rounded-xl border bg-card p-5"><div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-lg font-medium">{trackerLabel(metric, snapshot)}</h2><span className="text-xs text-muted-foreground">{key === "water" ? "Stored in ml" : metric.unit}</span></div><p className="mt-1 text-xs text-muted-foreground">{value.target !== null ? `Target ${value.target} ${metric.unit} · ${value.rawValue === null ? "not logged" : `${Math.round((value.adherence ?? 0) * 100)}% adherence`}` : value.rawValue === null ? "No entry" : "Observation only"}</p><MetricLogger key={`${metric.id}-${date}`} metricId={metric.id} date={date} name={trackerLabel(metric, snapshot)} unit={metric.unit} quickAdd={key === "water"} value={value.rawValue} revision={value.log?.revision ?? null} notes={privateNotes(value.log?.notes ?? "", metric.is_private, snapshot)} hideNotes={masked} disabled={date > snapshot.today || date < metric.active_from} />{key === "water" && <p className="mt-2 text-xs text-muted-foreground">{value.rawValue === null ? "No water recorded" : `${(value.rawValue / 1000).toFixed(2)} L recorded`}. Quick additions are atomic and retry-safe.</p>}</article>;
    })}</section>
    {creatine && <section className="mt-6 rounded-xl border bg-card p-5"><h2 className="text-lg font-medium">{trackerLabel(creatine, snapshot)}</h2><p className="mt-1 text-sm text-muted-foreground">{creatine.dosage_amount} {creatine.dosage_unit} · track this behavior on <Link href="/today" className="text-primary underline">Today</Link>.</p></section>}
    <section className="mt-6 grid gap-4 lg:grid-cols-2"><article className="rounded-xl border bg-card p-5"><h2 className="text-lg font-medium">Sleep · wake date {date}</h2>{sleepMetric && <p className="mt-1 text-xs text-muted-foreground">{sleepMetric.source_available_from ? `Tracking active from ${sleepMetric.source_available_from}` : "Activate through fitness setup"} · {sleepMetric.unit}</p>}{snapshot.privacyMode ? <p className="mt-4 text-sm text-muted-foreground">Sleep notes and editing are hidden in Privacy Mode. <Link href="/settings/tracking" className="text-primary underline">Open privacy settings</Link>.</p> : <SleepForm key={date} date={date} log={sleepLog} today={snapshot.today} timezone={snapshot.timezone} />}</article><article className="rounded-xl border bg-card p-5"><h2 className="text-lg font-medium">Gym this week</h2><p className="mt-3 text-3xl font-semibold tabular-nums">{gymProgress?.state === "unavailable" ? "—" : `${gymProgress?.actualCount ?? 0} / ${gymProgress?.requiredCount ?? "—"}`}</p><p className="mt-2 text-sm text-muted-foreground">{gymProgress?.reason ?? "Completed workouts only. Drafts do not count."}</p><Link href="/fitness/workouts/new" className="mt-5 inline-flex min-h-11 items-center text-sm text-primary underline">Log a workout</Link></article></section>
    <section className="mt-6 grid gap-4 lg:grid-cols-2"><article className="rounded-xl border bg-card p-5"><h2 className="text-lg font-medium">Weight trend</h2>{weightSummary ? <p className="mt-2 text-sm text-muted-foreground">7-day average: {weightSummary.sevenDay.value?.toFixed(2) ?? "—"} kg from {weightSummary.sevenDay.recordedDays}/{weightSummary.sevenDay.windowDays} recorded days. This week: {weightSummary.week.value?.toFixed(2) ?? "—"} kg from {weightSummary.week.recordedDays}/{weightSummary.week.windowDays} days.</p> : <p className="mt-2 text-sm text-muted-foreground">Set up body weight to see recorded averages.</p>}{weight && <div className="mt-4"><TrendChart points={weightTrend} unit="kg" label="Body weight" /></div>}</article><article className="rounded-xl border bg-card p-5"><h2 className="text-lg font-medium">Sleep trend</h2><p className="mt-2 text-sm text-muted-foreground">30-day recorded average: {sleepAverage.value?.toFixed(2) ?? "—"} hours from {sleepAverage.recordedDays}/{sleepAverage.windowDays} days. Missing dates are excluded from the average.</p>{sleepMetric && <div className="mt-4"><TrendChart points={sleepTrend} unit="hours" label="Sleep duration" /></div>}</article></section>
    {proteinToday && <p className="mt-6 text-sm text-muted-foreground">Protein on {date}: {proteinToday.rawValue === null ? "not logged" : `${proteinToday.rawValue} g`} {proteinToday.target !== null && `toward ${proteinToday.target} g`}.</p>}
    <p className="mt-5 text-xs text-muted-foreground">Measurements are the same records shown on Today and Metrics. Edit targets under <Link href="/metrics" className="text-primary underline">Metrics</Link>.</p>
  </>;
}
