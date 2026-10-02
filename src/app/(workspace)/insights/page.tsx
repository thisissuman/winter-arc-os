import Link from "next/link";
import { Button } from "@/components/ui/button";
import { controlClass, FormField } from "@/components/tracking/form-field";
import { PageHeader } from "@/components/tracking/page-header";
import { TrackingUnavailable } from "@/components/tracking/tracking-unavailable";
import { InsightView } from "@/features/insights/insight-view";
import { buildInsightReport, parseInsightsFilters, type InsightsQuery } from "@/features/insights/domain";
import { addDays, businessDate } from "@/features/tracking/dates";
import { loadTrackingSnapshot, TrackingSetupError } from "@/features/tracking/queries";
import { requireAccount } from "@/lib/auth/session";

export const metadata = { title: "Insights" };

export default async function InsightsPage({ searchParams }: { searchParams: Promise<InsightsQuery> }) {
  const { preferences } = await requireAccount();
  const today = businessDate(preferences.timezone);
  const parsed = parseInsightsFilters(await searchParams, today);
  const filters = parsed.filters;
  // Historical week-start changes can make an adjacent prior week overlap the
  // selected week. Four weeks cover the last non-overlapping comparison period.
  // Completed study sessions may span seven local dates beyond the read window.
  const readFrom = filters.from > "0001-01-29" ? addDays(filters.from, -28) : filters.from;
  let snapshot;
  try { snapshot = await loadTrackingSnapshot({ from: readFrom, to: filters.to, compact: true }); }
  catch (error) { if (error instanceof TrackingSetupError) return <TrackingUnavailable />; throw error; }
  const challenge = filters.challengeId ? snapshot.challenges.find((item) => item.id === filters.challengeId) : null;
  const category = filters.categoryId ? snapshot.categories.find((item) => item.id === filters.categoryId) : null;
  const error = parsed.error ?? (filters.challengeId && !challenge ? "Choose one of your challenges." : null) ?? (filters.categoryId && !category ? "Choose one of your tracker categories." : null);
  const report = error ? null : buildInsightReport(snapshot, filters);
  return <><PageHeader title="Insights" description="Understand scored consistency and recorded activity without filling gaps with invented data." actions={<Link href="/today" className="inline-flex min-h-11 items-center rounded-lg border px-4 text-sm">Today</Link>} />
    <form action="/insights" className="mt-6 grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-2 xl:grid-cols-5" aria-label="Insights filters">
      <FormField name="insights-from" label="From"><input id="insights-from" name="from" type="date" max={today} defaultValue={filters.from} required className={controlClass} /></FormField>
      <FormField name="insights-to" label="Through"><input id="insights-to" name="to" type="date" max={today} defaultValue={filters.to} required className={controlClass} /></FormField>
      <FormField name="insights-challenge" label="Challenge"><select id="insights-challenge" name="challenge" defaultValue={filters.challengeId ?? ""} className={controlClass}><option value="">Personal history</option>{snapshot.challenges.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></FormField>
      <FormField name="insights-category" label="Tracker category"><select id="insights-category" name="category" defaultValue={filters.categoryId ?? ""} className={controlClass}><option value="">All categories</option>{snapshot.categories.map((item) => <option key={item.id} value={item.id}>{item.name}{item.archived_at ? " (archived)" : ""}</option>)}</select></FormField>
      <div className="flex items-end"><Button className="min-h-11 w-full">Apply filters</Button></div>
    </form><p className="mt-2 text-xs text-muted-foreground">Choose up to 180 calendar days. Challenge filters apply to scheduled eligibility; tracker categories narrow habits, measurements, and study sources. Overall policy scores always retain their complete eligible category weights.</p>
    {error ? <section className="mt-6 rounded-xl border border-destructive/50 bg-card p-5" role="alert"><h2 className="font-medium">Review the filters</h2><p className="mt-2 text-sm text-muted-foreground">{error}</p></section> : report && <div className="mt-9"><InsightView report={report} filters={filters} privacyMode={snapshot.privacyMode} /></div>}
  </>;
}
