"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { InsightPoint } from "./domain";

export function ScoreTrend({ points }: { points: InsightPoint[] }) {
  const hasTrend = points.filter((point) => point.value !== null).length >= 2;
  return <>
  {hasTrend ? <div role="img" aria-label={`Daily score trend from ${points[0].date} to ${points.at(-1)?.date}. Missing scores leave gaps; zero scores remain visible.`} className="h-60 min-w-0">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
        <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tickFormatter={(value: string) => value.slice(5)} tick={{ fill: "var(--chart-label)", fontSize: "var(--chart-label-size)" }} minTickGap={24} />
        <YAxis domain={[0, 100]} tick={{ fill: "var(--chart-label)", fontSize: "var(--chart-label-size)" }} width={46} />
        <Tooltip labelFormatter={(value) => String(value)} formatter={(value) => value == null ? "No scheduled targets" : `${Number(value).toFixed(1)} / 100`} contentStyle={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--control-border)", borderRadius: "var(--radius-control)", boxShadow: "var(--shadow-float)", color: "var(--foreground)", fontSize: "var(--chart-label-size)" }} labelStyle={{ color: "var(--chart-label)" }} itemStyle={{ color: "var(--foreground)" }} />
        <Line type="monotone" dataKey="value" connectNulls={false} stroke="var(--chart-primary)" strokeWidth={2} dot={points.length <= 42 ? { r: 2 } : false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  </div> : <p className="rounded-lg bg-secondary p-4 text-sm text-muted-foreground">At least two scored dates are needed for a line trend.</p>}
  {points.length > 0 && <details className="mt-3 border-t pt-2 text-sm"><summary className="flex min-h-11 cursor-pointer items-center text-primary">Read daily scores and gaps</summary><ol className="max-h-64 divide-y overflow-y-auto" aria-label="Daily score values">{points.map((point) => <li key={point.date} className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2"><span className="tabular-nums">{point.date}</span><span className="text-muted-foreground">{point.status === "configuration" ? "Configuration needs attention" : point.value === null ? "No eligible score" : `${point.value.toFixed(1)} / 100`} · {point.recorded}/{point.expected} logged{point.status === "in_progress" ? " · in progress" : ""}</span></li>)}</ol></details>}
  </>;
}
