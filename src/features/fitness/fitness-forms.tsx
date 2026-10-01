"use client";

import { useActionState, useState } from "react";
import { setupFitness, saveSleep } from "./actions";
import type { SleepLog } from "@/features/tracking/types";
import { initialFormState } from "@/lib/auth/validation";
import { FormFeedback } from "@/components/form-feedback";
import { Button } from "@/components/ui/button";
import { controlClass, FormField } from "@/components/tracking/form-field";

export function FitnessSetupForm() {
  const [state, action, pending] = useActionState(setupFitness, initialFormState);
  return <form action={action} className="mt-5 flex flex-wrap items-end gap-3">
    <div className="min-w-48 flex-1"><FormField name="fitness-sleep-target" label="Sleep target (hours, optional)"><input id="fitness-sleep-target" name="sleepTarget" type="number" min="0.1" max="24" step="any" className={controlClass} placeholder="Observation only if blank" /></FormField></div>
    <Button disabled={pending} className="min-h-11">{pending ? "Setting up…" : "Set up fitness"}</Button>
    <div className="basis-full"><FormFeedback state={state} /></div>
  </form>;
}

function localInput(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  const pad = (number: number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function SleepForm({ date, log, today, timezone }: { date: string; log: SleepLog | null; today: string; timezone: string }) {
  const [state, action, pending] = useActionState(saveSleep, initialFormState);
  const [mode, setMode] = useState<"duration" | "timestamps">(log?.wake_at ? "timestamps" : "duration");
  const [start, setStart] = useState(localInput(log?.sleep_start_at ?? null));
  const [wake, setWake] = useState(localInput(log?.wake_at ?? null));
  const [hours, setHours] = useState(log ? String(log.duration_seconds / 3600) : "");
  const measuredSeconds = start && wake ? Math.round((new Date(wake).valueOf() - new Date(start).valueOf()) / 1000) : null;
  const validMeasured = measuredSeconds !== null && measuredSeconds >= 60 && measuredSeconds <= 86400;
  const startIso = start && Number.isFinite(Date.parse(start)) ? new Date(start).toISOString() : "";
  const wakeIso = wake && Number.isFinite(Date.parse(wake)) ? new Date(wake).toISOString() : "";
  return <form action={action} className="mt-4 space-y-4">
    <input type="hidden" name="date" value={date} /><input type="hidden" name="expectedRevision" value={log?.revision ?? ""} />
    <div className="flex flex-wrap gap-3 text-sm"><label className="flex min-h-11 items-center gap-2"><input type="radio" checked={mode === "duration"} onChange={() => setMode("duration")} />Duration only</label><label className="flex min-h-11 items-center gap-2"><input type="radio" checked={mode === "timestamps"} onChange={() => setMode("timestamps")} />Sleep and wake times</label></div>
    {mode === "timestamps" && <><div className="grid gap-4 sm:grid-cols-2"><FormField name="sleep-start" label="Sleep time"><input id="sleep-start" type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} className={controlClass} required /></FormField><FormField name="sleep-wake" label="Wake time"><input id="sleep-wake" type="datetime-local" value={wake} onChange={(event) => setWake(event.target.value)} className={controlClass} required /></FormField></div><p className="text-xs text-muted-foreground">Times use this device’s timezone. The wake date is recorded in your {timezone} tracking timezone. {validMeasured ? `${(measuredSeconds / 3600).toFixed(2)} hours calculated.` : "Enter a valid overnight interval of up to 24 hours."}</p></>}
    <input type="hidden" name="sleepStartAt" value={mode === "timestamps" ? startIso : ""} />
    <input type="hidden" name="wakeAt" value={mode === "timestamps" ? wakeIso : ""} />
    {mode === "duration" ? <FormField name="sleep-duration" label="Duration (hours)"><input id="sleep-duration" type="number" min="0.0167" max="24" step="any" value={hours} onChange={(event) => setHours(event.target.value)} className={controlClass} required /></FormField> : null}
    <input type="hidden" name="durationSeconds" value={mode === "timestamps" ? validMeasured ? measuredSeconds : "" : hours ? String(Math.round(Number(hours) * 3600)) : ""} />
    <div className="grid gap-4 sm:grid-cols-2"><FormField name="sleep-quality" label="Quality (optional)"><select id="sleep-quality" name="quality" defaultValue={log?.quality ?? ""} className={controlClass}><option value="">Not rated</option>{[1,2,3,4,5].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}</select></FormField><FormField name="sleep-notes" label="Notes (optional)"><input id="sleep-notes" name="notes" defaultValue={log?.notes ?? ""} maxLength={4000} className={controlClass} /></FormField></div>
    <FormFeedback state={state} />
    <div className="flex flex-wrap gap-2"><Button disabled={pending || date > today || mode === "timestamps" && !validMeasured} className="min-h-11">{pending ? "Saving…" : "Save sleep"}</Button>{log && <Button type="submit" formNoValidate name="clear" value="true" disabled={pending} variant="outline" className="min-h-11">Remove entry</Button>}</div>
  </form>;
}
