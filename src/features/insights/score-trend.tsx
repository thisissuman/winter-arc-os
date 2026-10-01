"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { InsightPoint } from "./domain";

export function ScoreTrend({ points }: { points: InsightPoint[] }) {
  if (points.filter((point) => point.value !== null).length < 2) return <p className="rounded-lg bg-secondary p-4 text-sm text-muted-foreground">At least two scored dates are needed for a line trend.</p>;
  return <div role="img" aria-label={`Daily score trend from ${points[0].date} to ${points.at(-1)?.date}. Missing scores leave gaps; zero scores remain visible.`} className="h-60 min-w-0">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tickFormatter={(value: string) => value.slice(5)} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} minTickGap={24} />
        <YAxis domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} width={46} />
        <Tooltip labelFormatter={(value) => String(value)} formatter={(value) => value == null ? "No scheduled targets" : `${Number(value).toFixed(1)} / 100`} />
        <Line type="monotone" dataKey="value" connectNulls={false} stroke="var(--primary)" strokeWidth={2} dot={points.length <= 42 ? { r: 2 } : false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>;
}
