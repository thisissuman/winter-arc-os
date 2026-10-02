import type { ReactNode } from "react";
import { Panel } from "./surfaces";

export function CoverageLabel({ recorded, expected, explanation, className = "" }: { recorded: number; expected: number; explanation?: string; className?: string }) {
  if (expected <= 0) return null;
  return <p className={`text-xs leading-5 text-muted-foreground ${className}`}>Logged opportunities: <span className="tabular-nums">{recorded} of {expected}</span>{explanation && `. ${explanation}`}</p>;
}

export function StatSummary({ label, value, suffix, status, period, coverage, compact = false }: {
  label: string; value: string; suffix?: string; status: string; period: string; coverage?: ReactNode; compact?: boolean;
}) {
  return <div className="min-w-0">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <span className="max-w-full break-words rounded-full border px-2.5 py-1 text-xs tabular-nums text-muted-foreground">{period}</span>
    </div>
    <p className={`${compact ? "mt-2 text-2xl" : "mt-3 text-stat"} font-semibold tabular-nums tracking-tight`}>{value}{suffix && <span className="ml-1 text-base font-normal text-muted-foreground">{suffix}</span>}</p>
    <p className="mt-1 text-xs text-muted-foreground">{status}</p>
    {coverage && <div className={compact ? "mt-2" : "mt-4"}>{coverage}</div>}
  </div>;
}

export function ChartFrame({ id, title, description, unit, period, coverage, empty, textAlternative, children }: {
  id: string; title: string; description?: string; unit?: string; period?: string; coverage?: ReactNode;
  empty?: ReactNode; textAlternative: ReactNode; children: ReactNode;
}) {
  return <Panel aria-labelledby={id}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 id={id} className="text-section font-medium">{title}</h2>{description && <p className="mt-1 text-body text-muted-foreground">{description}</p>}</div>
      {(unit || period) && <p className="text-xs tabular-nums text-muted-foreground">{unit}{unit && period && " · "}{period}</p>}
    </div>
    {coverage && <div className="mt-3">{coverage}</div>}
    <div className="mt-4">{empty ?? children}</div>
    <div className="mt-3 text-xs leading-5 text-muted-foreground">{textAlternative}</div>
  </Panel>;
}
