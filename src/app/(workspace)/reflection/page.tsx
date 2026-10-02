import Link from "next/link";
import { PageHeader } from "@/components/tracking/page-header";
import { ReflectionSetupError, listReflections } from "@/features/reflection/queries";
import { businessDate, monthRange, weekRange } from "@/features/tracking/dates";
import { requireAccount } from "@/lib/auth/session";
import { TrackingUnavailable } from "@/components/tracking/tracking-unavailable";

export const metadata = { title: "Reflection" };
export default async function ReflectionPage() {
  const { preferences } = await requireAccount();
  const today = businessDate(preferences.timezone);
  const week = weekRange(today, preferences.week_starts_on);
  const month = monthRange(today);
  let reviews;
  try { reviews = await listReflections(); }
  catch (error) { if (error instanceof ReflectionSetupError) return <TrackingUnavailable message="Apply the Phase 7 reflection migration to use reviews." />; throw error; }
  const currentWeek = reviews.weekly.find((item) => item.week_start === week.start);
  const currentMonth = reviews.monthly.find((item) => item.month_start === month.start);
  return <><PageHeader title="Reflection" description="Review what happened, decide what to change, and keep a record beside your actual results." />
    <div className="mt-7 grid gap-4 md:grid-cols-2">
      <Link href={`/reflection/weekly/${week.start}`} className="rounded-xl border bg-card p-6 transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"><p className="text-xs uppercase tracking-wide text-muted-foreground">This week · {week.start}–{week.end}</p><h2 className="mt-2 text-xl font-medium">Weekly review</h2><p className="mt-2 text-sm text-muted-foreground">{currentWeek ? "Open saved review" : "Write wins, lessons, next steps, and optional check-in ratings."}</p></Link>
      <Link href={`/reflection/monthly/${month.start.slice(0, 7)}`} className="rounded-xl border bg-card p-6 transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"><p className="text-xs uppercase tracking-wide text-muted-foreground">This month · {month.start.slice(0, 7)}</p><h2 className="mt-2 text-xl font-medium">Monthly reflection</h2><p className="mt-2 text-sm text-muted-foreground">{currentMonth ? "Open saved reflection" : "Look back at habits, Fitness, Career, and what to change."}</p></Link>
    </div>
    <div className="mt-10 grid gap-8 lg:grid-cols-2">
      <section aria-labelledby="weekly-history"><h2 id="weekly-history" className="text-lg font-medium">Weekly history</h2>{reviews.weekly.length ? <ul className="mt-3 space-y-2">{reviews.weekly.map((item) => <li key={item.id}><Link href={`/reflection/weekly/${item.week_start}`} className="flex min-h-11 items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm hover:border-primary/50"><span>Week of {item.week_start}</span><span className="text-muted-foreground">Open review</span></Link></li>)}</ul> : <p className="mt-3 rounded-xl border bg-card p-5 text-sm text-muted-foreground">No weekly reviews saved yet.</p>}</section>
      <section aria-labelledby="monthly-history"><h2 id="monthly-history" className="text-lg font-medium">Monthly history</h2>{reviews.monthly.length ? <ul className="mt-3 space-y-2">{reviews.monthly.map((item) => <li key={item.id}><Link href={`/reflection/monthly/${item.month_start.slice(0, 7)}`} className="flex min-h-11 items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm hover:border-primary/50"><span>{item.month_start.slice(0, 7)}</span><span className="text-muted-foreground">Open reflection</span></Link></li>)}</ul> : <p className="mt-3 rounded-xl border bg-card p-5 text-sm text-muted-foreground">No monthly reflections saved yet.</p>}</section>
    </div>
  </>;
}
