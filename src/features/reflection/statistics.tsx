import type { InsightReport } from "@/features/insights/domain";

const number = (value: number | null) => value === null ? "—" : value.toFixed(1);
export function ReflectionStatistics({ report, from, through, fullEnd }: { report: InsightReport; from: string; through: string; fullEnd: string }) {
  const cards = [
    { label: "Average daily score", value: number(report.averageScore), context: `${report.scoreDays}/${report.dates.length} eligible dates` },
    { label: "Logging coverage", value: `${report.scoreCoverage.recorded}/${report.scoreCoverage.expected}`, context: "Recorded / expected opportunities" },
    { label: "Study time", value: `${Math.round(report.study.minutes)} min`, context: `${report.study.recordedDays}/${report.dates.length} recorded days` },
    { label: "Completed workouts", value: String(report.completedWorkouts ?? 0), context: "Drafts excluded" },
  ];
  return <section aria-labelledby="reflection-statistics" className="rounded-xl border bg-card p-5">
    <h2 id="reflection-statistics" className="text-lg font-medium">Recorded context</h2>
    <p className="mt-1 text-sm text-muted-foreground">{from}–{through}{through < fullEnd ? ` of ${from}–${fullEnd}; period in progress` : ""}. Calculated from the same records and scoring rules as Insights.</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">{cards.map((card) => <div key={card.label} className="rounded-lg border bg-background/50 p-4"><p className="text-xs text-muted-foreground">{card.label}</p><p className="mt-2 text-2xl font-semibold tabular-nums">{card.value}</p><p className="mt-1 text-xs text-muted-foreground">{card.context}</p></div>)}</div>
    <p className="mt-4 text-xs text-muted-foreground">No scheduled score stays blank; a missing required log affects score and reduces coverage. Study time is split across local dates.</p>
  </section>;
}
