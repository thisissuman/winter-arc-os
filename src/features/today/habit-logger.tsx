"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineFeedback } from "@/components/presentation/inline-feedback";
import { controlClass } from "@/components/tracking/form-field";
import { logHabit } from "@/features/tracking/actions";
import type { HabitLog } from "@/features/tracking/types";

type LoggedState = { count: number; status: HabitLog["status"] | null; revision: number | null };
type HabitLoggerProps = {
  habitId: string; date: string; name: string; count: number; status: HabitLog["status"] | null;
  revision: number | null; requiredCount: number; disabled?: boolean; notes?: string; hideNotes?: boolean;
};
export function HabitLogger(props: HabitLoggerProps) {
  return <HabitLoggerState key={`${props.date}-${props.revision}-${props.hideNotes}`} {...props} />;
}
function HabitLoggerState({ habitId, date, name, count, status, revision, requiredCount, disabled = false, notes = "", hideNotes = false }: HabitLoggerProps) {
  const router = useRouter();
  const [logged, setLogged] = useState<LoggedState>({ count, status, revision });
  const [note, setNote] = useState(notes);
  const [noteEdited, setNoteEdited] = useState(false);
  const [feedback, setFeedback] = useState<{ error: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const notesId = useId();
  const done = logged.status === "completed" && logged.count >= requiredCount;
  function save(nextStatus: HabitLog["status"] | "clear", nextCount: number) {
    const previous = logged;
    setFeedback(null);
    setLogged({ ...logged, status: nextStatus === "clear" ? null : nextStatus, count: nextCount });
    startTransition(async () => {
      try {
        const result = await logHabit({ habitId, date, status: nextStatus, completionCount: nextCount, expectedRevision: previous.revision,
          ...(noteEdited && !hideNotes ? { notes: note } : {}) });
        if (!result.ok) { setLogged(previous); setFeedback({ error: true, message: result.message }); return; }
        setLogged({ count: result.data?.completion_count ?? 0, status: result.data?.status ?? null, revision: result.data?.revision ?? null });
        setFeedback({ error: false, message: nextStatus === "clear" ? "Entry cleared." : "Saved." });
      } catch { setLogged(previous); setFeedback({ error: true, message: "Could not save. Check your connection and try again." }); }
    });
  }
  return <div className="py-4">
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" variant={done ? "default" : "outline"} className="size-11 shrink-0" disabled={disabled || pending}
        aria-label={`${done ? "Clear completion for" : "Complete"} ${name}`} aria-pressed={done}
        onClick={() => save(done ? "clear" : "completed", done ? 0 : requiredCount)}>
        {done ? <Check aria-hidden="true" /> : <span className="size-4 rounded border border-current" aria-hidden="true" />}
      </Button>
      <div className="min-w-0 flex-1"><p className="break-words text-sm font-medium">{name}</p><p className="mt-1 text-xs text-muted-foreground">{pending ? "Saving…" : logged.status === "skipped" ? "Skipped · contributes zero" : logged.status === "missed" ? "Marked missed" : logged.count ? `${logged.count} / ${requiredCount} completed` : "Not logged"}</p></div>
      <div className="flex gap-1">
        <Button type="button" variant="ghost" className="size-11" disabled={disabled || pending || logged.count === 0} aria-label={`Remove one completion from ${name}`} onClick={() => save(logged.count > 1 ? "completed" : "clear", Math.max(0, logged.count - 1))}><Minus aria-hidden="true" /></Button>
        <Button type="button" variant="outline" className="size-11" disabled={disabled || pending} aria-label={`Add one completion to ${name}`} onClick={() => save("completed", logged.count + 1)}><Plus aria-hidden="true" /></Button>
        <Button type="button" variant="ghost" className="min-h-11 px-3" disabled={disabled || pending} onClick={() => save("skipped", 0)}>Skip</Button>
        {logged.status && <Button type="button" variant="ghost" className="min-h-11 px-3" disabled={disabled || pending} onClick={() => save("clear", 0)}>Undo</Button>}
      </div>
    </div>
    {!hideNotes && <details className="mt-2 pl-14"><summary className="min-h-8 cursor-pointer text-xs text-muted-foreground">Notes</summary><label htmlFor={notesId} className="sr-only">Notes for {name}</label><textarea id={notesId} value={note} onChange={(event) => { setNote(event.target.value); setNoteEdited(true); }} className={`${controlClass} mt-2 min-h-20`} maxLength={2000} disabled={disabled || pending} /><Button type="button" variant="outline" className="mt-2 min-h-11 px-3" disabled={disabled || pending || !noteEdited} onClick={() => save(logged.status ?? "completed", logged.status ? logged.count : requiredCount)}>Save notes{!logged.status ? " and complete" : ""}</Button></details>}
    {feedback && <InlineFeedback message={feedback.message} tone={feedback.error ? "error" : "success"} className="mt-2 text-xs" />}
    {feedback?.error && <Button type="button" variant="ghost" className="mt-2 min-h-11 px-3" disabled={pending} onClick={() => router.refresh()}>Refresh saved entry</Button>}
  </div>;
}
