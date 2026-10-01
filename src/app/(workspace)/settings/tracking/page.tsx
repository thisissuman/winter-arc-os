import Link from "next/link";
import { PageHeader } from "@/components/tracking/page-header";
import { EditorDialog } from "@/components/tracking/editor-dialog";
import { DefinitionActions } from "@/components/tracking/definition-actions";
import { TrackingUnavailable } from "@/components/tracking/tracking-unavailable";
import { Button } from "@/components/ui/button";
import { FrequencyForm, PrivacyForm, ScoreCategoryForm, ScorePolicyForm } from "@/features/tracking-settings/tracking-forms";
import { archiveFrequencyTarget, deleteFrequencyTarget } from "@/features/tracking/actions";
import { loadTrackingSnapshot, TrackingSetupError } from "@/features/tracking/queries";
import { trackerDescription, trackerLabel } from "@/features/tracking/presentation";

export const metadata = { title: "Tracking settings" };
const periods = ["daily", "weekly", "monthly"] as const;
export default async function TrackingSettingsPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const parameters = await searchParams;
  let snapshot;
  try { snapshot = await loadTrackingSnapshot(); } catch (error) { if (error instanceof TrackingSetupError) return <TrackingUnavailable />; throw error; }
  const period = periods.find((value) => value === parameters.period) ?? "daily";
  const categories = snapshot.categories.filter((value) => !value.archived_at).map(({ id, name }) => ({ id, name }));
  const scoreCategories = snapshot.scoreCategories.filter((value) => !value.archived_at).sort((a, b) => a.position - b.position);
  const policy = snapshot.scorePolicies.filter((value) => value.period === period).sort((a, b) => b.effective_from.localeCompare(a.effective_from))[0] ?? null;
  const metricSources = snapshot.metrics.filter((item) => item.source === "manual" && !item.archived_at).map((item) => ({ id: item.id, name: trackerLabel(item, snapshot), unit: item.unit, source: item.source, archived_at: item.archived_at, is_private: item.is_private }));
  const sources = [
    ...snapshot.habits.map((item) => ({ kind: "habit" as const, id: item.id, label: trackerLabel(item, snapshot), isPrivate: item.is_private })),
    ...snapshot.metrics.map((item) => ({ kind: "metric" as const, id: item.id, label: trackerLabel(item, snapshot), isPrivate: item.is_private })),
    ...snapshot.frequencyTargets.map((item) => ({ kind: "frequency" as const, id: item.id, label: trackerLabel(item, snapshot), isPrivate: item.is_private })),
  ];
  const frequencyForm = (target?: typeof snapshot.frequencyTargets[number]) => <FrequencyForm target={target} rules={target ? snapshot.frequencyRules.filter((value) => value.frequency_target_id === target.id) : []} metrics={metricSources} categories={categories} today={snapshot.today} privacyMode={snapshot.privacyMode} />;
  return <>
    <PageHeader title="Tracking settings" description="Frequency quotas, score weights, and private presentation." actions={<Button asChild variant="outline" className="min-h-11 px-4"><Link href="/settings">Account settings</Link></Button>} />
    <section className="mt-8 space-y-4" aria-labelledby="privacy-title"><div><h2 id="privacy-title" className="text-lg font-medium">Privacy</h2><p className="mt-1 text-sm text-muted-foreground">Presentation preferences apply across tracking pages.</p></div><PrivacyForm privacyMode={snapshot.privacyMode} hidePrivateToday={snapshot.hidePrivateToday} /></section>
    <section className="mt-12 space-y-4" aria-labelledby="frequency-title"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 id="frequency-title" className="text-lg font-medium">Frequency targets</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Count qualifying days from a numerical metric. A flexible habit uses its own schedule quota.</p></div><EditorDialog title="New frequency target" triggerLabel="New frequency target" triggerVariant="default">{frequencyForm()}</EditorDialog></div>
      {snapshot.frequencyTargets.length === 0 && <p className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">No frequency targets yet. Create a manual metric first, then set a weekly or monthly count here.</p>}
      <div className="grid gap-3 md:grid-cols-2">{snapshot.frequencyTargets.map((target) => {const masked=snapshot.privacyMode && target.is_private;const name=trackerLabel(target,snapshot);const rule=snapshot.frequencyRules.filter((item)=>item.frequency_target_id===target.id).sort((a,b)=>b.effective_from.localeCompare(a.effective_from))[0];return <article key={target.id} className="rounded-xl border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-medium">{name}{target.archived_at && <span className="ml-2 text-xs text-muted-foreground">Archived</span>}</h3><p className="mt-1 text-sm text-muted-foreground">{trackerDescription(target,snapshot)}</p></div>{!masked && !target.archived_at && <EditorDialog title={`Edit ${name}`} triggerLabel="Edit">{frequencyForm(target)}</EditorDialog>}</div><p className="mt-3 text-xs text-muted-foreground">{rule ? target.source === "metric_threshold" ? `${rule.quota} qualifying days per ${rule.period === "weekly" ? "week" : "month"} at ${rule.threshold ?? "unconfigured"} or above` : `${rule.quota} sessions per ${rule.period === "weekly" ? "week" : "month"}` : "No active quota rule"}{target.source !== "metric_threshold" && (target.source_available_from ? ` · Active from ${target.source_available_from}` : " · Source not activated")}</p>{masked ? <p className="mt-3 text-xs text-muted-foreground">Disable Privacy Mode to edit this definition.</p> : <DefinitionActions id={target.id} updatedAt={target.updated_at} name={name} archived={Boolean(target.archived_at)} archiveAction={archiveFrequencyTarget} deleteAction={deleteFrequencyTarget} />}</article>;})}</div>
    </section>
    <section className="mt-12 space-y-4" aria-labelledby="score-title"><div><h2 id="score-title" className="text-lg font-medium">Scoring</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Daily and weekly scores have independent policy versions. Monthly quotas have their own period policy.</p></div>
      <div className="flex flex-wrap gap-2" aria-label="Score period">{periods.map((item)=><Link key={item} href={`/settings/tracking?period=${item}`} aria-current={item===period?"page":undefined} className={`inline-flex min-h-11 items-center rounded-lg border px-4 text-sm ${item===period?"bg-primary text-primary-foreground":"hover:bg-secondary"}`}>{item[0].toUpperCase()+item.slice(1)}</Link>)}</div>
      <div className="rounded-xl border bg-card p-5 sm:p-6"><p className="mb-5 text-sm text-muted-foreground">{policy ? `Version ${policy.version} · effective ${policy.effective_from}` : "No saved policy for this period."} Scores remain empty until scheduled targets are assigned.</p>{scoreCategories.length ? <ScorePolicyForm key={period} period={period} policy={policy} categories={scoreCategories} weights={policy?snapshot.scoreWeights.filter((value)=>value.policy_id===policy.id):[]} items={policy?snapshot.scoreItems.filter((value)=>value.policy_id===policy.id):[]} sources={sources} privacyMode={snapshot.privacyMode} /> : <p className="text-sm text-muted-foreground">Add a scoring category to configure a policy.</p>}</div>
    </section>
    <section className="mt-12 space-y-4" aria-labelledby="categories-title"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="categories-title" className="text-lg font-medium">Scoring categories</h2><p className="mt-1 text-sm text-muted-foreground">These are separate from your life areas and tracker categories.</p></div><EditorDialog title="Add score category" triggerLabel="Add category"><ScoreCategoryForm nextPosition={scoreCategories.length} /></EditorDialog></div><div className="flex flex-wrap gap-2">{scoreCategories.map((category)=><EditorDialog key={category.id} title={`Edit ${category.name}`} triggerLabel={category.name}><ScoreCategoryForm category={category} nextPosition={category.position} /></EditorDialog>)}</div></section>
  </>;
}
