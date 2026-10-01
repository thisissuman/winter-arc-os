"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { FitnessPoint } from "./domain";

export function TrendChart({ points, unit, label }: { points: FitnessPoint[]; unit: string; label: string }) {
  const recorded = points.filter((point) => point.value !== null);
  if (recorded.length < 2) return <p className="rounded-lg bg-secondary p-4 text-sm text-muted-foreground">Log at least two days to see a trend.</p>;
  return <div role="img" aria-label={`${label} trend from ${points[0].date} to ${points.at(-1)?.date}; ${recorded.length} recorded days.`} className="h-52 w-full min-w-0">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={points} margin={{ top: 8, right: 16, bottom: 2, left: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tickFormatter={(value: string) => value.slice(5)} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} minTickGap={20} />
        <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} width={44} domain={["auto", "auto"]} />
        <Tooltip formatter={(value) => value == null ? "No entry" : `${value} ${unit}`} labelFormatter={(value) => String(value)} />
        <Line type="monotone" dataKey="value" connectNulls={false} stroke="var(--primary)" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>;
}
