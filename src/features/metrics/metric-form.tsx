"use client";

import { useActionState, useId, useState } from "react";
import { saveMetric } from "@/features/tracking/actions";
import type { MetricDefinition, MetricTarget, TrackingCategory } from "@/features/tracking/types";
import { initialFormState } from "@/lib/auth/validation";
import { Button } from "@/components/ui/button";
import { FormFeedback } from "@/components/form-feedback";
import { controlClass, FormField } from "@/components/tracking/form-field";

export function MetricForm({ metric, targets, categories, today }: {
  metric?: MetricDefinition; targets: MetricTarget[]; categories: Pick<TrackingCategory, "id" | "name">[]; today: string;
}) {
  const [state, action, pending] = useActionState(saveMetric, initialFormState);
  const [period, setPeriod] = useState("daily");
  const prefix = useId();
  const target = targets.filter((item) => item.period === period).sort((a, b) => b.effective_from.localeCompare(a.effective_from))[0];
  const field = (name: string) => `${prefix}-${name}`;
  return <form action={action} className="space-y-5">
    {metric && <><input type="hidden" name="id" value={metric.id} /><input type="hidden" name="expectedUpdatedAt" value={metric.updated_at} /></>}
    <FormField name={field("name")} label="Name"><input id={field("name")} name="name" defaultValue={metric?.name} required maxLength={120} className={controlClass} /></FormField>
    <FormField name={field("description")} label="Description"><textarea id={field("description")} name="description" defaultValue={metric?.description ?? ""} maxLength={2000} className={`${controlClass} min-h-20`} /></FormField>
    <div className="grid gap-4 sm:grid-cols-2"><FormField name={field("category")} label="Category"><select id={field("category")} name="categoryId" defaultValue={metric?.category_id ?? ""} className={controlClass}><option value="">Uncategorized</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></FormField>
      {!metric ? <FormField name={field("start")} label="Track from"><input id={field("start")} name="activeFrom" type="date" defaultValue={today} min={today} required className={controlClass} /></FormField> : <div><p className="text-sm">Track from</p><p className="mt-2 text-sm text-muted-foreground">{metric.active_from}</p></div>}
    </div>
    {!metric ? <><input type="hidden" name="source" value="manual" /><div className="grid gap-4 sm:grid-cols-2"><FormField name={field("unit")} label="Unit" hint="Keep a consistent unit for every entry, such as g, ml, kg, or steps."><input id={field("unit")} name="unit" required maxLength={30} className={controlClass} /></FormField><FormField name={field("aggregation")} label="Period aggregation"><select id={field("aggregation")} name="aggregation" className={controlClass}><option value="sum">Total</option><option value="average">Average of logged days</option><option value="latest">Latest value</option></select></FormField></div></> : <><input type="hidden" name="source" value={metric.source} /><input type="hidden" name="unit" value={metric.unit} /><input type="hidden" name="aggregation" value={metric.aggregation} /><p className="rounded-lg bg-secondary p-3 text-xs leading-5 text-muted-foreground">Source: {metric.source} · Unit: {metric.unit} · Aggregation: {metric.aggregation}. These remain fixed to preserve the meaning of historical entries.</p></>}
    <fieldset className="space-y-4 rounded-lg border p-4"><legend className="px-1 text-sm font-medium">Target rule</legend><FormField name={field("period")} label="Period"><select id={field("period")} name="targetPeriod" value={period} onChange={(event) => setPeriod(event.target.value)} className={controlClass}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></FormField>
      <div key={`${period}-${target?.id ?? "new"}`} className="grid gap-4 sm:grid-cols-2"><FormField name={field("direction")} label="Direction"><select id={field("direction")} name="direction" defaultValue={target?.direction ?? "minimum"} className={controlClass}><option value="minimum">At least</option><option value="maximum">At most</option></select></FormField><FormField name={field("target")} label={`Target (${metric?.unit ?? "selected unit"})`} hint="Blank leaves this period observation only."><input id={field("target")} name="target" type="number" min="0.000001" step="any" defaultValue={target?.target ?? ""} className={controlClass} /></FormField></div>
      <p className="text-xs leading-5 text-muted-foreground">Existing daily rules change tomorrow; weekly and monthly rules change at the next period boundary. Other periods are preserved.{target && ` Latest saved rule starts ${target.effective_from}.`}</p>
    </fieldset>
    <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="isPrivate" defaultChecked={metric?.is_private} className="size-4 accent-primary" />Private label and notes</label><FormFeedback state={state} /><Button disabled={pending} className="min-h-11 px-4">{pending ? "Saving…" : metric ? "Save metric" : "Create metric"}</Button>
  </form>;
}
