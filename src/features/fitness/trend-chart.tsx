"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { FitnessPoint } from "./domain";

export function TrendChart({ points, unit, label }: { points: FitnessPoint[]; unit: string; label: string }) {
  const recorded = points.filter((point) => point.value !== null);
  return <>
  {recorded.length >= 2 ? <div role="img" aria-label={`${label} trend from ${points[0].date} to ${points.at(-1)?.date}; ${recorded.length} recorded days.`} className="h-52 w-full min-w-0">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={points} margin={{ top: 8, right: 16, bottom: 2, left: 0 }}>
        <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tickFormatter={(value: string) => value.slice(5)} tick={{ fill: "var(--chart-label)", fontSize: "var(--chart-label-size)" }} minTickGap={20} />
        <YAxis tick={{ fill: "var(--chart-label)", fontSize: "var(--chart-label-size)" }} width={44} domain={["auto", "auto"]} />
        <Tooltip formatter={(value) => value == null ? "No entry" : `${value} ${unit}`} labelFormatter={(value) => String(value)} contentStyle={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--control-border)", borderRadius: "var(--radius-control)", boxShadow: "var(--shadow-float)", color: "var(--foreground)", fontSize: "var(--chart-label-size)" }} labelStyle={{ color: "var(--chart-label)" }} itemStyle={{ color: "var(--foreground)" }} />
        <Line type="monotone" dataKey="value" connectNulls={false} stroke="var(--chart-primary)" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  </div> : <p className="rounded-lg bg-secondary p-4 text-sm text-muted-foreground">Log at least two days to see a trend.</p>}
  {points.length > 0 && <details className="mt-3 border-t pt-2 text-sm"><summary className="flex min-h-11 cursor-pointer items-center text-primary">Read {label.toLowerCase()} values by date</summary><ol className="max-h-64 divide-y overflow-y-auto" aria-label={`${label} recorded values and gaps`}>{points.map((point, index) => <li key={`${point.date}-${index}`} className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2"><span className="tabular-nums">{point.date}</span><span className="text-muted-foreground">{point.value === null ? "No entry" : `${point.value} ${unit}`}</span></li>)}</ol></details>}
  </>;
}
