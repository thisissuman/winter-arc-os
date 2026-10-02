"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InlineFeedback } from "@/components/presentation/inline-feedback";
import { controlClass } from "@/components/tracking/form-field";
import { incrementMetric, saveMetricValue } from "@/features/tracking/actions";
import { displayValue } from "@/features/tracking/presentation";

type MetricLoggerProps = {
  metricId: string; date: string; name: string; unit: string; value: number | null; revision: number | null;
  disabled?: boolean; notes?: string; hideNotes?: boolean; quickAdd?: boolean;
  hideLabel?: boolean;
};
export function MetricLogger(props: MetricLoggerProps) {
  return <MetricLoggerState key={`${props.date}-${props.revision}-${props.hideNotes}`} {...props} />;
}
function MetricLoggerState({ metricId, date, name, unit, value, revision, disabled = false, notes = "", hideNotes = false, quickAdd = false, hideLabel = false }: MetricLoggerProps) {
  const router = useRouter();
  const [saved, setSaved] = useState({ value, revision });
  const [input, setInput] = useState(value === null ? "" : String(value));
  const [note, setNote] = useState(notes);
  const [noteEdited, setNoteEdited] = useState(false);
  const [feedback, setFeedback] = useState<{ error: boolean; message: string } | null>(null);
  const [retry, setRetry] = useState<{ amount: number; operationId: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const inputId = useId();
  const notesId = useId();
  function replace() {
    const nextValue = input.trim() === "" ? null : Number(input);
    if (nextValue !== null && (!Number.isFinite(nextValue) || nextValue < 0)) { setFeedback({ error: true, message: "Enter a nonnegative number, or leave blank to clear." }); return; }
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await saveMetricValue({ metricId, date, value: nextValue, expectedRevision: saved.revision, ...(noteEdited && !hideNotes ? { notes: note } : {}) });
        if (!result.ok) { setFeedback({ error: true, message: result.message }); return; }
        setSaved({ value: result.data?.value ?? null, revision: result.data?.revision ?? null });
        setInput(result.data ? String(result.data.value) : "");
        setFeedback({ error: false, message: result.data ? "Saved." : "Measurement cleared." });
      } catch { setFeedback({ error: true, message: "Could not save. Refresh the value before retrying if your connection failed." }); }
    });
  }
  function add(amount: number, operationId: string = crypto.randomUUID()) {
    const previous = saved;
    setFeedback(null);
    setSaved({ ...saved, value: (saved.value ?? 0) + amount });
    setInput(String((saved.value ?? 0) + amount));
    startTransition(async () => {
      try {
        const result = await incrementMetric({ metricId, date, amount, operationId });
        if (!result.ok) {
          setSaved(previous); setInput(previous.value === null ? "" : String(previous.value));
          setRetry(result.code === "storage" ? { amount, operationId } : null);
          setFeedback({ error: true, message: result.message }); return;
        }
        setSaved({ value: result.data.value, revision: result.data.revision }); setInput(String(result.data.value)); setRetry(null);
        setFeedback({ error: false, message: "Added." });
      } catch {
        setSaved(previous); setInput(previous.value === null ? "" : String(previous.value)); setRetry({ amount, operationId });
        setFeedback({ error: true, message: "Could not confirm this addition. Retry uses the same operation identifier." });
      }
    });
  }
  return <div className="py-4">
    <form onSubmit={(event) => { event.preventDefault(); replace(); }}>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1"><label htmlFor={inputId} className={hideLabel ? "sr-only" : "text-sm font-medium"}>{name}<span className={hideLabel ? "" : "ml-2 text-xs font-normal text-muted-foreground"}> ({unit})</span></label><input id={inputId} type="number" min={0} step="any" inputMode="decimal" value={input} onChange={(event) => setInput(event.target.value)} disabled={disabled || pending || retry !== null} className={`${controlClass} ${hideLabel ? "" : "mt-2"} max-w-56 tabular-nums`} aria-describedby={`${inputId}-saved`} /><p id={`${inputId}-saved`} className="mt-2 text-xs text-muted-foreground">Saved: {displayValue(saved.value, unit)} · blank clears the entry</p></div>
        <Button type="submit" variant="outline" className="min-h-11 px-4" disabled={disabled || pending || retry !== null}>{pending ? "Saving…" : "Save"}</Button>
      </div>
      {!hideNotes && <details className="mt-2"><summary className="min-h-8 cursor-pointer text-xs text-muted-foreground">Notes</summary><label htmlFor={notesId} className="sr-only">Notes for {name}</label><textarea id={notesId} value={note} onChange={(event) => { setNote(event.target.value); setNoteEdited(true); }} maxLength={2000} disabled={disabled || pending || retry !== null} className={`${controlClass} mt-2 min-h-20`} /></details>}
    </form>
    {unit === "ml" && quickAdd && <div className="mt-3 flex flex-wrap gap-2" aria-label={`Quick additions for ${name}`}>{[250, 500].map((amount) => <Button key={amount} type="button" variant="ghost" className="min-h-11 border px-3" disabled={disabled || pending || retry !== null} onClick={() => add(amount)}>+{amount} ml</Button>)}</div>}
    {feedback && <InlineFeedback message={feedback.message} tone={feedback.error ? "error" : "success"} className="mt-3 text-xs leading-5" />}
    {retry && <Button type="button" variant="outline" className="mt-2 min-h-11 px-3" disabled={pending} onClick={() => add(retry.amount, retry.operationId)}>Retry the same addition</Button>}
    {feedback?.error && !retry && <Button type="button" variant="ghost" className="mt-2 min-h-11 px-3" disabled={pending} onClick={() => router.refresh()}>Refresh saved value</Button>}
  </div>;
}
