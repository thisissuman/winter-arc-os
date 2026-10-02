import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/tracking/page-header";
import { TrackingUnavailable } from "@/components/tracking/tracking-unavailable";
import { MonthlyReflectionForm } from "@/features/reflection/review-form";
import { ReflectionStatistics } from "@/features/reflection/statistics";
import { getMonthlyReflection, loadReflectionReport, ReflectionSetupError } from "@/features/reflection/queries";
import { businessDate, isCalendarMonth, monthRange } from "@/features/tracking/dates";
import { TrackingSetupError } from "@/features/tracking/queries";
import { requireAccount } from "@/lib/auth/session";

export const metadata = { title: "Monthly reflection" };
export default async function MonthlyReflectionPage({ params }: { params: Promise<{ month: string }> }) {
  const { month } = await params;
  const { preferences } = await requireAccount();
  const today = businessDate(preferences.timezone);
  if (!isCalendarMonth(month) || `${month}-01` > today) notFound();
  const range = monthRange(month);
  let review;
  try { review = await getMonthlyReflection(range.start); }
  catch (error) { if (error instanceof ReflectionSetupError) return <TrackingUnavailable message="Apply the Phase 7 reflection migration to use reviews." />; throw error; }
  let context;
  try { context = await loadReflectionReport(range.start, range.end, today); }
  catch (error) { if (error instanceof TrackingSetupError) return <TrackingUnavailable />; throw error; }
  return <><PageHeader title="Monthly reflection" description={`${month} · ${review ? "Saved reflection" : "New reflection"}`} actions={<Link href="/reflection" className="inline-flex min-h-11 items-center rounded-lg border px-4 text-sm">All reflections</Link>} />
    <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]"><section aria-labelledby="monthly-prompts"><h2 id="monthly-prompts" className="mb-3 text-lg font-medium">Write your reflection</h2>{preferences.privacy_mode ? <p className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">Reflection writing is hidden in Privacy Mode. Turn it off in Settings to read or edit private responses.</p> : <MonthlyReflectionForm periodStart={range.start} review={review} />}</section><ReflectionStatistics report={context.report} from={range.start} through={context.through} fullEnd={range.end} /></div>
  </>;
}
