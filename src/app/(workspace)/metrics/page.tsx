import Link from "next/link";
import { PageHeader } from "@/components/tracking/page-header";
import { EditorDialog } from "@/components/tracking/editor-dialog";
import { DefinitionActions } from "@/components/tracking/definition-actions";
import { TrackingUnavailable } from "@/components/tracking/tracking-unavailable";
import { controlClass } from "@/components/tracking/form-field";
import { Button } from "@/components/ui/button";
import { MetricForm } from "@/features/metrics/metric-form";
import { MetricLogger } from "@/features/today/metric-logger";
import { loadTrackingSnapshot, TrackingSetupError } from "@/features/tracking/queries";
import { archiveMetric, deleteMetric } from "@/features/tracking/actions";
import { metricDailyValue } from "@/features/tracking/domain";
import { parseDateQuery } from "@/features/tracking/dates";
import { trackerLabel, trackerDescription, privateNotes } from "@/features/tracking/presentation";
export const metadata = { title: "Metrics" };
export default async function MetricsPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date: requestedDate } = await searchParams;
  let snapshot;
  try { snapshot = await loadTrackingSnapshot(); } catch (error) { if (error instanceof TrackingSetupError) return <TrackingUnavailable />; throw error; }
  const date = parseDateQuery(requestedDate, snapshot.today);
  const categories = snapshot.categories.filter((item) => !item.archived_at).map(({ id, name }) => ({ id, name }));
  const form = (metric?: typeof snapshot.metrics[number]) => <MetricForm metric={metric} today={snapshot.today} categories={categories} targets={metric ? snapshot.metricTargets.filter((item) => item.metric_id === metric.id) : []} />;
  return <>
    <PageHeader title="Metrics" description="One daily value per measurement. Challenges reuse this history." actions={<EditorDialog title="Create metric" triggerLabel="New metric" triggerVariant="default">{form()}</EditorDialog>} />
    <form className="mt-6 flex flex-wrap items-end gap-3" action="/metrics"><label className="space-y-2 text-sm"><span className="block">Logging date</span><input name="date" type="date" defaultValue={date} className={controlClass} /></label><Button variant="outline" className="min-h-11 px-4">View day</Button><Link href="/settings/tracking" className="ml-auto py-3 text-sm text-primary underline-offset-4 hover:underline">Frequency and scoring settings</Link></form>
    {snapshot.metrics.length === 0 && <section className="mt-8 rounded-xl border bg-card p-7"><h2 className="text-lg font-medium">Start with a measurement</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Create a metric with its unit and optional target, or <Link href="/onboarding" className="text-primary underline">choose starter definitions</Link>. Entries remain empty until you log them.</p></section>}
    <div className="mt-6 space-y-4">{[...snapshot.metrics].sort((a, b) => Number(Boolean(a.archived_at)) - Number(Boolean(b.archived_at))).map((metric) => {
      const value = metricDailyValue(snapshot, metric, date);
      const masked = snapshot.privacyMode && metric.is_private;
      const name = trackerLabel(metric, snapshot);
      return <section key={metric.id} className="rounded-xl border bg-card p-5 sm:p-6"><header className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-medium">{name}{metric.archived_at && <span className="ml-2 text-xs text-muted-foreground">Archived</span>}</h2><p className="mt-1 text-sm text-muted-foreground">{trackerDescription(metric, snapshot)}</p><p className="mt-2 text-xs text-muted-foreground">{value.target !== null ? `${value.direction === "maximum" ? "At most" : "At least"} ${value.target} ${metric.unit} daily` : "No daily target · observation"} · {metric.aggregation}</p></div>{!masked && !metric.archived_at && <EditorDialog title={`Edit ${name}`} triggerLabel="Edit">{form(metric)}</EditorDialog>}</header>
        {metric.source === "manual" ? <MetricLogger key={`${metric.id}-${date}`} metricId={metric.id} date={date} name={name} unit={metric.unit} quickAdd={metric.aggregation === "sum"} value={value.rawValue} revision={value.log?.revision ?? null} notes={privateNotes(value.log?.notes ?? "", metric.is_private, snapshot)} hideNotes={masked} disabled={date > snapshot.today || date < metric.active_from || Boolean(metric.archived_on && date >= metric.archived_on) || Boolean(metric.active_until && date >= metric.active_until)} /> : <p className="mt-4 rounded-lg bg-secondary p-3 text-sm text-muted-foreground">{metric.source === "sleep" ? <><span className="font-medium">{value.rawValue === null ? "No sleep recorded" : `${value.rawValue.toFixed(2)} hours recorded`}</span>. <Link href={`/fitness?date=${date}`} className="text-primary underline">Log or edit sleep in Fitness.</Link></> : "Study totals arrive in Career; this source is still unavailable."}</p>}
        {value.reason && <p className="text-xs leading-5 text-muted-foreground">{value.reason}</p>}{masked ? <p className="mt-3 text-xs text-muted-foreground">Turn off Privacy Mode in <Link href="/settings/tracking" className="text-primary underline">tracking settings</Link> to edit this definition.</p> : <DefinitionActions id={metric.id} updatedAt={metric.updated_at} name={name} archived={Boolean(metric.archived_at)} archiveAction={archiveMetric} deleteAction={deleteMetric} />}
      </section>;
    })}</div>
  </>;
}
