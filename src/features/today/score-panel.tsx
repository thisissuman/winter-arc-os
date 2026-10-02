import { CoverageLabel, StatSummary } from "@/components/presentation/stat-summary";
import { Panel } from "@/components/presentation/surfaces";
import type { ScoreResult } from "@/features/tracking/domain";

function percent(fraction: number | null) { return fraction === null ? "—" : `${(fraction * 100).toFixed(1)}%`; }

export function ScoreExplanation({ result, privacyMode, summaryLabel = "How this score is calculated", standalone = false }: {
  result: ScoreResult; privacyMode: boolean; summaryLabel?: string; standalone?: boolean;
}) {
  return <details className={standalone ? "" : "mt-5 border-t pt-4"}><summary className="min-h-9 cursor-pointer text-sm font-medium">{summaryLabel}</summary>
    <div className="mt-3 space-y-4 text-body">
      <p className="text-xs leading-5 text-muted-foreground">Only eligible sources contribute; their category weights are redistributed when a category has no eligible items. Scores cap achievement at 100%, while raw entries remain unchanged.</p>
      {result.categories.map((category) => <div key={category.category.id} className="border-l-2 border-primary/50 pl-3">
        <div className="flex justify-between gap-3 font-medium"><span>{category.category.name}</span><span>{percent(category.contribution)} · weight {category.weight}</span></div>
        {category.items.map((item) => <p key={item.item.id} className="mt-1 flex justify-between gap-3 text-xs text-muted-foreground"><span>{privacyMode && item.isPrivate ? "Private tracker" : item.name}</span><span>{percent(item.contribution)} · item weight {item.weight}</span></p>)}
      </div>)}
      {result.exclusions.length > 0 && <div className="border-t pt-3"><p className="font-medium">Excluded inputs</p><ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-muted-foreground">{result.exclusions.map((item, index) => <li key={`${item.itemId ?? "policy"}-${index}`}>{item.reason}</li>)}</ul></div>}
    </div>
  </details>;
}

export function ScorePanel({ result, title, privacyMode, compact = false }: { result: ScoreResult; title: string; privacyMode: boolean; compact?: boolean }) {
  const empty = result.status === "future" ? "Future period" : result.status === "configuration" ? "Score configuration needs attention" : result.total === null ? "No scheduled targets" : null;
  const period = result.start === result.end ? result.start : `${result.start} – ${result.end}`;
  return <Panel aria-label={`${title} score`} density={compact ? "compact" : "standard"}>
    <StatSummary label={`${title} score`} value={result.total === null ? "—" : result.total.toFixed(1)} suffix={result.total !== null ? "/ 100" : undefined} status={empty ?? (result.status === "in_progress" ? "In progress" : "Final")} period={period} compact={compact} coverage={result.coverage.expected > 0 ? <CoverageLabel recorded={result.coverage.recorded} expected={result.coverage.expected} explanation="Missing measurements differ from a logged zero." /> : undefined} />
    {!compact && <ScoreExplanation result={result} privacyMode={privacyMode} />}
  </Panel>;
}
