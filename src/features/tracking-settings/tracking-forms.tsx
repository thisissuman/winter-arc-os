"use client";

import { useActionState, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormFeedback } from "@/components/form-feedback";
import { controlClass, FormField } from "@/components/tracking/form-field";
import { initialFormState } from "@/lib/auth/validation";
import { saveFrequencyTarget, saveScoreCategory, saveScorePolicy, saveTrackingPreferences } from "@/features/tracking/actions";
import type { FrequencyRule, FrequencyTarget, MetricDefinition, ScoreCategory, ScoreCategoryWeight, ScoreItem, ScorePolicy, TrackingCategory } from "@/features/tracking/types";

export function PrivacyForm({ privacyMode, hidePrivateToday }: { privacyMode: boolean; hidePrivateToday: boolean }) {
  const [state, action, pending] = useActionState(saveTrackingPreferences, initialFormState);
  return <form action={action} className="space-y-4 rounded-xl border bg-card p-5"><label className="flex min-h-11 items-start gap-3 text-sm"><input name="privacyMode" type="checkbox" defaultChecked={privacyMode} className="mt-1 size-4 accent-primary" /><span><span className="block font-medium">Privacy Mode</span><span className="mt-1 block text-muted-foreground">Mask private names, descriptions and notes in the interface. Their entries still contribute to scores.</span></span></label><label className="flex min-h-11 items-start gap-3 text-sm"><input name="hidePrivateToday" type="checkbox" defaultChecked={hidePrivateToday} className="mt-1 size-4 accent-primary" /><span><span className="block font-medium">Hide private trackers on Today</span><span className="mt-1 block text-muted-foreground">This changes Today’s visible list, including when Privacy Mode is off.</span></span></label><FormFeedback state={state} /><Button className="min-h-11 px-4" disabled={pending}>{pending ? "Saving…" : "Save privacy settings"}</Button></form>;
}

export function FrequencyForm({ target, rules, metrics, categories, today, privacyMode }: {
  target?: FrequencyTarget; rules: FrequencyRule[];
  metrics: Pick<MetricDefinition,"id"|"name"|"unit"|"source"|"archived_at"|"is_private">[]; categories: Pick<TrackingCategory,"id"|"name">[]; today: string; privacyMode: boolean;
}) {
  const [state, action, pending] = useActionState(saveFrequencyTarget, initialFormState);
  const prefix = useId();
  const [period, setPeriod] = useState<"weekly"|"monthly">([...rules].sort((a,b)=>b.effective_from.localeCompare(a.effective_from))[0]?.period ?? "weekly");
  const activeRule = rules.filter((rule) => rule.period === period).sort((a,b)=>b.effective_from.localeCompare(a.effective_from))[0];
  const id = (part:string)=>`${prefix}-${part}`;
  return <form action={action} className="space-y-5">
    {target && <><input name="id" value={target.id} type="hidden" /><input name="expectedUpdatedAt" value={target.updated_at} type="hidden" /><input name="source" value={target.source} type="hidden" /><input name="countMode" value={target.count_mode} type="hidden" /><input name="metricId" value={target.metric_id ?? ""} type="hidden" /></>}
    {!target && <><input name="source" value="metric_threshold" type="hidden" /><input name="countMode" value="distinct_days" type="hidden" /></>}
    <FormField name={id("name")} label="Name"><input id={id("name")} name="name" required maxLength={120} defaultValue={target?.name} className={controlClass} /></FormField>
    <FormField name={id("description")} label="Description"><textarea id={id("description")} name="description" defaultValue={target?.description ?? ""} maxLength={2000} className={`${controlClass} min-h-20`} /></FormField>
    <div className="grid gap-4 sm:grid-cols-2"><FormField name={id("category")} label="Category"><select id={id("category")} name="categoryId" defaultValue={target?.category_id ?? ""} className={controlClass}><option value="">Uncategorized</option>{categories.map((category)=><option key={category.id} value={category.id}>{category.name}</option>)}</select></FormField>
      {!target ? <FormField name={id("start")} label="Track from"><input id={id("start")} name="activeFrom" type="date" min={today} defaultValue={today} required className={controlClass} /></FormField> : <p className="text-sm text-muted-foreground">Active from {target.active_from}. The linked source and counting mode stay fixed to preserve history.</p>}
    </div>
    {!target && <FormField name={id("metric")} label="Qualifying metric" hint="Each day at or above the threshold counts once."><select id={id("metric")} name="metricId" required className={controlClass}><option value="">Choose a metric</option>{metrics.filter((metric)=>metric.source === "manual" && !metric.archived_at).map((metric)=><option key={metric.id} value={metric.id}>{privacyMode && metric.is_private ? "Private metric" : metric.name} ({metric.unit})</option>)}</select></FormField>}
    <fieldset className="grid gap-4 rounded-lg border p-4 sm:grid-cols-3"><legend className="px-1 text-sm font-medium">Quota</legend><FormField name={id("period")} label="Period"><select id={id("period")} name="period" value={period} onChange={(event)=>setPeriod(event.target.value as "weekly"|"monthly")} className={controlClass}><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></FormField><div key={`${period}-${activeRule?.id ?? "new"}`} className="contents"><FormField name={id("quota")} label={target?.count_mode === "sessions" ? "Required sessions" : "Required days"}><input id={id("quota")} name="quota" type="number" min={1} max={1000} step={1} required defaultValue={activeRule?.quota ?? ""} className={controlClass} /></FormField>{!target || target.source === "metric_threshold" ? <FormField name={id("threshold")} label="Daily threshold"><input id={id("threshold")} name="threshold" type="number" min="0.000001" step="any" required defaultValue={activeRule?.threshold ?? ""} className={controlClass} /></FormField> : <input name="threshold" type="hidden" value="" />}</div></fieldset>
    <p className="text-xs leading-5 text-muted-foreground">A new weekly or monthly rule starts at the next period boundary. The current period keeps its existing target.</p>
    <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="isPrivate" defaultChecked={target?.is_private} className="size-4 accent-primary" />Private label</label><FormFeedback state={state} /><Button disabled={pending} className="min-h-11 px-4">{pending ? "Saving…" : target ? "Save frequency target" : "Create frequency target"}</Button>
  </form>;
}

export function ScoreCategoryForm({ category, nextPosition }: { category?: ScoreCategory; nextPosition: number }) {
  const [state, action, pending] = useActionState(saveScoreCategory, initialFormState);
  const prefix = useId();
  return <form action={action} className="space-y-4">{category && <><input type="hidden" name="id" value={category.id} /><input type="hidden" name="expectedUpdatedAt" value={category.updated_at} /></>}<FormField name={`${prefix}-name`} label="Category name"><input id={`${prefix}-name`} name="name" defaultValue={category?.name} required maxLength={120} className={controlClass} /></FormField><FormField name={`${prefix}-position`} label="Display order"><input id={`${prefix}-position`} name="position" type="number" min={0} max={1000} step={1} defaultValue={category?.position ?? nextPosition} required className={controlClass} /></FormField><FormFeedback state={state} /><Button className="min-h-11 px-4" disabled={pending}>{pending ? "Saving…" : "Save category"}</Button></form>;
}

type ScoreSource = { kind:"habit"|"metric"|"frequency"; id:string; label:string; isPrivate:boolean };
export function ScorePolicyForm({ period, policy, categories, weights, items, sources, privacyMode }: {
  period:"daily"|"weekly"|"monthly"; policy:ScorePolicy|null; categories:ScoreCategory[];
  weights:ScoreCategoryWeight[]; items:ScoreItem[]; sources:ScoreSource[]; privacyMode:boolean;
}) {
  const [state, action, pending] = useActionState(saveScorePolicy, initialFormState);
  const prefix = useId();
  const [categoryWeights, setCategoryWeights] = useState<Record<string,string>>(() => Object.fromEntries(categories.map((category)=>[category.id,String(weights.find((item)=>item.score_category_id===category.id)?.weight ?? 0)])));
  const [assigned, setAssigned] = useState<Record<string,{selected:boolean;categoryId:string;weight:string}>>(() => Object.fromEntries(sources.map((source)=>{
    const current=items.find((item)=>item.habit_id===source.id && source.kind==="habit" || item.metric_id===source.id && source.kind==="metric" || item.frequency_target_id===source.id && source.kind==="frequency");
    return [`${source.kind}:${source.id}`,{selected:Boolean(current),categoryId:current?.score_category_id ?? categories[0]?.id ?? "",weight:String(current?.weight ?? 1)}];
  })));
  const submissionWeights=categories.map((category)=>({scoreCategoryId:category.id,weight:Number(categoryWeights[category.id] || 0)}));
  const submissionItems=sources.flatMap((source)=>{const row=assigned[`${source.kind}:${source.id}`]; if(!row?.selected) return []; return [{scoreCategoryId:row.categoryId,weight:Number(row.weight),...(source.kind==="habit"?{habitId:source.id}:source.kind==="metric"?{metricId:source.id}:{frequencyTargetId:source.id})}];});
  return <form action={action} className="space-y-6"><input type="hidden" name="period" value={period} /><input type="hidden" name="weights" value={JSON.stringify(submissionWeights)} /><input type="hidden" name="items" value={JSON.stringify(submissionItems)} />
    <FormField name={`${prefix}-name`} label="Policy name"><input id={`${prefix}-name`} name="name" defaultValue={policy?.name ?? `${period[0].toUpperCase()}${period.slice(1)} score`} maxLength={120} required className={controlClass} /></FormField>
    <fieldset className="space-y-3"><legend className="font-medium">Category weights</legend><p className="text-xs leading-5 text-muted-foreground">Weights are relative. Categories without eligible items are left out of that period’s score.</p><div className="grid gap-3 sm:grid-cols-2">{categories.map((category)=><label key={category.id} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm"><span>{category.name}</span><input aria-label={`${category.name} weight`} type="number" min={0} max={1000} step="any" value={categoryWeights[category.id] ?? "0"} onChange={(event)=>setCategoryWeights((old)=>({...old,[category.id]:event.target.value}))} className="h-11 w-24 rounded-md border border-input bg-background px-2 text-right tabular-nums" /></label>)}</div></fieldset>
    <fieldset className="space-y-3"><legend className="font-medium">Scored sources</legend><p className="text-xs leading-5 text-muted-foreground">Each source can contribute once per score period. Daily scores exclude flexible quotas.</p>{sources.length===0 && <p className="rounded-lg border p-4 text-sm text-muted-foreground">Create a tracker before assigning it to a score.</p>}{sources.map((source)=>{const key=`${source.kind}:${source.id}`;const row=assigned[key];return <div key={key} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_6rem]"><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={row?.selected ?? false} onChange={(event)=>setAssigned((old)=>({...old,[key]:{...old[key],selected:event.target.checked}}))} className="size-4 accent-primary" /><span className="min-w-0 break-words">{privacyMode && source.isPrivate ? "Private tracker" : source.label}<span className="ml-1 text-xs text-muted-foreground">({source.kind})</span></span></label><select aria-label={`Category for ${privacyMode && source.isPrivate ? "private tracker" : source.label}`} value={row?.categoryId ?? ""} onChange={(event)=>setAssigned((old)=>({...old,[key]:{...old[key],categoryId:event.target.value}}))} disabled={!row?.selected} className={controlClass}>{categories.map((category)=><option key={category.id} value={category.id}>{category.name}</option>)}</select><input aria-label={`Item weight for ${privacyMode && source.isPrivate ? "private tracker" : source.label}`} type="number" min="0.000001" max={1000} step="any" value={row?.weight ?? "1"} onChange={(event)=>setAssigned((old)=>({...old,[key]:{...old[key],weight:event.target.value}}))} disabled={!row?.selected} className={controlClass} /></div>})}</fieldset>
    <p className="text-xs leading-5 text-muted-foreground">Saving creates a new version for the next day or period boundary. Historical score policies remain available.</p><FormFeedback state={state} /><Button className="min-h-11 px-4" disabled={pending}>{pending ? "Saving…" : "Save score policy"}</Button>
  </form>;
}
