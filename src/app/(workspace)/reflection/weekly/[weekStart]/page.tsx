import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/tracking/page-header";
import { TrackingUnavailable } from "@/components/tracking/tracking-unavailable";
import { WeeklyReviewForm } from "@/features/reflection/review-form";
import { ReflectionStatistics } from "@/features/reflection/statistics";
import { getWeeklyReview, loadReflectionReport, ReflectionSetupError } from "@/features/reflection/queries";
import { addDays, businessDate, isBusinessDate, isoWeekday } from "@/features/tracking/dates";
import { TrackingSetupError } from "@/features/tracking/queries";
import { requireAccount } from "@/lib/auth/session";

export const metadata = { title: "Weekly review" };
export default async function WeeklyReviewPage({ params }: { params: Promise<{ weekStart: string }> }) {
  const { weekStart } = await params;
  const { preferences } = await requireAccount();
  const today = businessDate(preferences.timezone);
  if (!isBusinessDate(weekStart) || weekStart > today) notFound();
  let review;
  try { review = await getWeeklyReview(weekStart); }
  catch (error) { if (error instanceof ReflectionSetupError) return <TrackingUnavailable message="Apply the Phase 7 reflection migration to use reviews." />; throw error; }
  // Existing anchors retain the week-start convention stored when they were created.
  if (!review && isoWeekday(weekStart) !== preferences.week_starts_on) notFound();
  const end = addDays(weekStart, 6);
  let context;
  try { context = await loadReflectionReport(weekStart, end, today); }
  catch (error) { if (error instanceof TrackingSetupError) return <TrackingUnavailable />; throw error; }
  return <><PageHeader title="Weekly review" description={`${weekStart}–${end} · ${review ? "Saved review" : "New review"}`} actions={<Link href="/reflection" className="inline-flex min-h-11 items-center rounded-lg border px-4 text-sm">All reflections</Link>} />
    <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]"><section aria-labelledby="weekly-prompts"><h2 id="weekly-prompts" className="mb-3 text-lg font-medium">Write your review</h2>{preferences.privacy_mode ? <p className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">Review writing is hidden in Privacy Mode. Turn it off in Settings to read or edit private responses.</p> : <WeeklyReviewForm periodStart={weekStart} review={review} />}</section><ReflectionStatistics report={context.report} from={weekStart} through={context.through} fullEnd={end} /></div>
  </>;
}
