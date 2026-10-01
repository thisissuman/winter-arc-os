"use client";

import { useActionState, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormFeedback } from "@/components/form-feedback";
import { EditorDialog } from "@/components/tracking/editor-dialog";
import { initialFormState, type FormState } from "@/lib/auth/validation";
import { archiveHabit, deleteHabit, logHabit, saveHabit } from "@/features/tracking/actions";
import type { Habit, HabitFrequency, HabitSchedule } from "@/features/tracking/types";
import { addDays, isBusinessDate } from "@/features/tracking/dates";

type CategoryOption = { id: string; name: string };
type HabitEditorProps = { habit?: Habit; schedule?: HabitSchedule; today: string; categories: CategoryOption[] };
const selectClass = "h-11 w-full rounded-lg border border-input bg-card px-3 text-sm";
const frequencyLabels: Record<HabitFrequency, string> = { DAILY: "Every day", WEEKDAYS: "Weekdays", SPECIFIC_DAYS: "Selected weekdays", TIMES_PER_WEEK: "Times per week", TIMES_PER_MONTH: "Times per month", CUSTOM: "Every N days" };

export function HabitEditor(props: HabitEditorProps) {
  return <EditorDialog title={props.habit ? "Edit habit" : "New habit"} triggerLabel={props.habit ? "Edit" : "New habit"} triggerVariant={props.habit ? "outline" : "default"} description="Keep the behavior separate from its schedule. Future edits preserve historical expectations."><HabitForm {...props} /></EditorDialog>;
}

function HabitForm({ habit, schedule, today, categories }: HabitEditorProps) {
  const [state, action, pending] = useActionState(saveHabit, initialFormState);
  const [frequency, setFrequency] = useState<HabitFrequency>(schedule?.frequency ?? "DAILY");
  const [lastDate, setLastDate] = useState(habit?.active_until ? addDays(habit.active_until, -1) : "");
  const id = useId();
  const quota = frequency === "TIMES_PER_WEEK" || frequency === "TIMES_PER_MONTH";
  return <form action={action} className="space-y-6">
    {habit && <><input type="hidden" name="id" value={habit.id} /><input type="hidden" name="expectedUpdatedAt" value={habit.updated_at} /></>}
    <fieldset disabled={pending} className="space-y-5">
      <div className="space-y-2"><Label htmlFor={`${id}-name`}>Habit name</Label><Input id={`${id}-name`} name="name" defaultValue={habit?.name} required maxLength={120} className="h-11" /></div>
      <div className="space-y-2"><Label htmlFor={`${id}-description`}>Description</Label><textarea id={`${id}-description`} name="description" defaultValue={habit?.description} maxLength={2000} rows={3} className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm" /></div>
      <div className="space-y-2"><Label htmlFor={`${id}-icon`}>Icon or emoji</Label><Input id={`${id}-icon`} name="icon" defaultValue={habit?.icon ?? ""} maxLength={40} className="h-11" /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor={`${id}-category`}>Category</Label><select id={`${id}-category`} name="categoryId" defaultValue={habit?.category_id ?? ""} className={selectClass}><option value="">Uncategorized</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
        <div className="space-y-2"><Label htmlFor={`${id}-time`}>Time of day</Label><select id={`${id}-time`} name="timeOfDay" defaultValue={habit?.time_of_day ?? "anytime"} className={selectClass}><option value="anytime">Anytime</option><option value="morning">Morning</option><option value="afternoon">Afternoon</option><option value="evening">Evening</option></select></div>
      </div>
      {!habit && <div className="space-y-2"><Label htmlFor={`${id}-active`}>Tracking starts on</Label><Input id={`${id}-active`} name="activeFrom" type="date" defaultValue={today} required className="h-11" /><p className="text-xs leading-5 text-muted-foreground">Earlier dates are not automatically missed. Backdating deliberately adds historical expectations.</p></div>}
      <div className="space-y-2"><Label htmlFor={`${id}-until`}>Optional last tracking date</Label><Input id={`${id}-until`} name="lastTrackingDate" type="date" value={lastDate} onChange={(event) => setLastDate(event.target.value)} className="h-11" /><input type="hidden" name="activeUntil" value={isBusinessDate(lastDate) ? addDays(lastDate, 1) : ""} /><p className="text-xs leading-5 text-muted-foreground">Leave blank for an ongoing habit. This date is inclusive.</p></div>
      <label className="flex min-h-11 cursor-pointer items-center gap-3"><input name="isPrivate" type="checkbox" defaultChecked={habit?.is_private} className="size-4 accent-primary" /><span className="text-sm">Private habit — mask details in Privacy Mode</span></label>
      <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor={`${id}-dose`}>Optional dose</Label><Input id={`${id}-dose`} name="dosageAmount" type="number" min="0.01" step="any" defaultValue={habit?.dosage_amount ?? ""} inputMode="decimal" className="h-11" /></div><div className="space-y-2"><Label htmlFor={`${id}-unit`}>Dose unit</Label><Input id={`${id}-unit`} name="dosageUnit" defaultValue={habit?.dosage_unit ?? ""} maxLength={30} className="h-11" /></div></div>
      <div className="space-y-5 border-t pt-5"><h3 className="text-sm font-medium">Schedule</h3><div className="space-y-2"><Label htmlFor={`${id}-frequency`}>Frequency</Label><select id={`${id}-frequency`} name="frequency" value={frequency} onChange={(event) => setFrequency(event.target.value as HabitFrequency)} className={selectClass}>{Object.entries(frequencyLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        <div className="space-y-2"><Label htmlFor={`${id}-count`}>{quota ? `Occurrences per ${frequency === "TIMES_PER_WEEK" ? "week" : "month"}` : "Occurrences per scheduled day"}</Label><Input id={`${id}-count`} name="requiredCount" type="number" min="1" max="1000" step="1" defaultValue={schedule?.required_count ?? 1} required inputMode="numeric" className="h-11" /></div>
        {frequency === "SPECIFIC_DAYS" && <fieldset className="space-y-3"><legend className="text-sm font-medium">Required weekdays</legend><div className="grid grid-cols-2 gap-1 sm:grid-cols-3">{["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((weekday, index) => <label key={weekday} className="flex min-h-11 cursor-pointer items-center gap-3"><input type="checkbox" name="weekdays" value={index + 1} defaultChecked={schedule?.weekdays.includes(index + 1)} className="size-4 accent-primary" /><span className="text-sm">{weekday}</span></label>)}</div></fieldset>}
        {frequency === "CUSTOM" && <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor={`${id}-interval`}>Every how many days?</Label><Input id={`${id}-interval`} name="intervalDays" type="number" min="1" max="365" step="1" defaultValue={schedule?.interval_days ?? 2} required className="h-11" /></div><div className="space-y-2"><Label htmlFor={`${id}-anchor`}>Anchor date</Label><Input id={`${id}-anchor`} name="anchorDate" type="date" defaultValue={schedule?.anchor_date ?? today} required className="h-11" /></div></div>}
        {habit && <p className="text-xs leading-5 text-muted-foreground">Schedule edits start {quota ? "at the next period boundary" : "tomorrow"}. Your older logs keep the rule that applied then.</p>}
        {quota && <p className="text-xs leading-5 text-muted-foreground">A flexible quota has no forced daily obligation. Empty dates stay unlogged rather than missed.</p>}
      </div>
    </fieldset>
    <FormFeedback state={state} />
    <Button type="submit" className="h-11 px-4" disabled={pending}>{pending ? "Saving…" : "Save habit"}</Button>
  </form>;
}

export function HabitArchiveButton({ habit }: { habit: Pick<Habit, "id" | "updated_at"> }) {
  const [state, action, pending] = useActionState(archiveHabit, initialFormState);
  return <form action={action} className="space-y-3"><input type="hidden" name="id" value={habit.id} /><input type="hidden" name="expectedUpdatedAt" value={habit.updated_at} /><Button type="submit" variant="ghost" className="h-11 px-4" disabled={pending}>{pending ? "Archiving…" : "Archive"}</Button><FormFeedback state={state} /></form>;
}

export function DeleteHabitDialog({ habit }: { habit: Pick<Habit, "id" | "updated_at"> }) {
  return <EditorDialog title="Delete this habit permanently?" triggerLabel="Delete permanently" triggerVariant="ghost" description="This removes this shared habit, every logged occurrence, its schedules, and its challenge/scoring associations. Archive instead to preserve history."><DeleteHabitForm habit={habit} /></EditorDialog>;
}

function DeleteHabitForm({ habit }: { habit: Pick<Habit, "id" | "updated_at"> }) {
  const [state, action, pending] = useActionState(deleteHabit, initialFormState);
  const id = useId();
  return <form action={action} className="space-y-5"><input type="hidden" name="id" value={habit.id} /><input type="hidden" name="expectedUpdatedAt" value={habit.updated_at} /><div className="space-y-2"><Label htmlFor={id}>Type DELETE to confirm</Label><Input id={id} name="confirmation" pattern="DELETE" required autoComplete="off" disabled={pending} className="h-11" /></div><FormFeedback state={state} /><Button type="submit" variant="destructive" className="h-11 px-4" disabled={pending}>{pending ? "Deleting…" : "Delete habit and history"}</Button></form>;
}

export type LogEditorData = { habitId: string; label: string; date: string; status: "completed" | "missed" | "skipped" | null; count: number; expectedCount: number; revision: number | null; notes?: string; masked: boolean };

export function HabitLogDialog({ entry, symbol, stateLabel, disabled }: { entry: LogEditorData; symbol: string; stateLabel: string; disabled: boolean }) {
  if (disabled) return <span aria-label={`${entry.label}, ${entry.date}: ${stateLabel}`} className="flex size-11 items-center justify-center text-sm text-muted-foreground">{symbol}</span>;
  return <HabitCellDialog entry={entry} symbol={symbol} stateLabel={stateLabel} />;
}

function HabitCellDialog({ entry, symbol, stateLabel }: { entry: LogEditorData; symbol: string; stateLabel: string }) {
  return <EditorDialog title={entry.label} triggerLabel={symbol} triggerAriaLabel={`${entry.label}, ${entry.date}: ${stateLabel}. Edit daily log.`} triggerClassName="size-11 min-w-11 px-0" triggerVariant="ghost" description={`${entry.date} · ${stateLabel}. Update one shared daily record.`}>
    <HabitLogForm entry={entry} />
  </EditorDialog>;
}

function HabitLogForm({ entry }: { entry: LogEditorData }) {
  const id = useId();
  const [status, setStatus] = useState<"completed" | "missed" | "skipped" | "clear">(entry.status ?? "completed");
  type LogState = FormState & { revision?: number | null };
  const [state, action, pending] = useActionState<LogState, FormData>(async (previous, form) => {
    const selected = String(form.get("status"));
    if (selected !== "completed" && selected !== "skipped" && selected !== "missed" && selected !== "clear") return { status: "error", message: "Choose a valid log status." };
    try {
      const result = await logHabit({ habitId: entry.habitId, date: entry.date, status: selected, completionCount: selected === "completed" ? Number(form.get("completionCount")) : 0, expectedRevision: previous.revision === undefined ? entry.revision : previous.revision, ...(entry.masked ? {} : { notes: String(form.get("notes") ?? "") }) });
      return result.ok ? { status: "success", message: selected === "clear" ? "Daily log cleared." : "Habit log saved.", revision: result.data?.revision ?? null } : { status: "error", message: result.message, revision: previous.revision };
    } catch { return { status: "error", message: "This log could not be saved. Check your connection and retry.", revision: previous.revision }; }
  }, initialFormState);
  return <form action={action} className="space-y-5">
    <fieldset disabled={pending} className="space-y-5">
      <div className="space-y-2"><Label htmlFor={`${id}-status`}>Status</Label><select id={`${id}-status`} name="status" value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className={selectClass}><option value="completed">Record completed occurrences</option><option value="skipped">Skipped</option><option value="missed">Missed</option><option value="clear">Clear daily log</option></select></div>
      {status === "completed" && <div className="space-y-2"><Label htmlFor={`${id}-count`}>Completed occurrences</Label><Input id={`${id}-count`} name="completionCount" type="number" min="1" max="10000" step="1" defaultValue={entry.count || entry.expectedCount || 1} required className="h-11" inputMode="numeric" /><p className="text-xs leading-5 text-muted-foreground">Raw counts are retained. Scoring is capped at the applicable target.</p></div>}
      {entry.masked ? <p className="text-xs leading-5 text-muted-foreground">Private notes are hidden. Status changes keep existing notes.</p> : <div className="space-y-2"><Label htmlFor={`${id}-notes`}>Notes</Label><textarea id={`${id}-notes`} name="notes" rows={3} maxLength={2000} defaultValue={entry.notes} className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm" /></div>}
    </fieldset><FormFeedback state={state} /><Button type="submit" className="h-11 px-4" disabled={pending}>{pending ? "Saving…" : "Save daily log"}</Button>
  </form>;
}
