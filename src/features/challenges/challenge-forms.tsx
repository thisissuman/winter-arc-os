"use client";

import { useActionState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormFeedback } from "@/components/form-feedback";
import { EditorDialog } from "@/components/tracking/editor-dialog";
import { initialFormState } from "@/lib/auth/validation";
import { archiveChallenge, deleteChallenge, saveChallenge, selectChallenge } from "@/features/tracking/actions";
import type { Challenge } from "@/features/tracking/types";

export type TrackerOption = { id: string; label: string; archived: boolean };
type ChallengeEditorProps = {
  challenge?: Challenge;
  today: string;
  habits: TrackerOption[];
  metrics: TrackerOption[];
  targets: TrackerOption[];
  habitIds?: string[];
  metricIds?: string[];
  targetIds?: string[];
};
const selectClass = "h-11 w-full rounded-lg border border-input bg-card px-3 text-sm";

function TrackerChoices({ title, name, options, selected }: { title: string; name: string; options: TrackerOption[]; selected: string[] }) {
  return <fieldset className="space-y-3">
    <legend className="text-sm font-medium">{title}</legend>
    {options.length === 0 ? <p className="text-sm text-muted-foreground">No {title.toLowerCase()} yet. Add them from Track, then include them here.</p> : <div className="grid gap-1 sm:grid-cols-2">{options.map((option) => <label key={option.id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-secondary">
      <input type="checkbox" name={name} value={option.id} defaultChecked={selected.includes(option.id)} className="size-4 shrink-0 accent-primary" />
      <span className="min-w-0 break-words text-sm">{option.label}{option.archived && <span className="ml-2 text-xs text-muted-foreground">Archived</span>}</span>
    </label>)}</div>}
  </fieldset>;
}

export function ChallengeEditor(props: ChallengeEditorProps) {
  const { challenge, today, habits, metrics, targets, habitIds = [], metricIds = [], targetIds = [] } = props;
  return <EditorDialog title={challenge ? "Edit challenge" : "New challenge"} triggerLabel={challenge ? "Edit challenge" : "New challenge"} triggerVariant={challenge ? "outline" : "default"} description="Group reusable trackers within an inclusive date range. Your logs stay shared across challenges.">
    <ChallengeForm challenge={challenge} today={today} habits={habits} metrics={metrics} targets={targets} habitIds={habitIds} metricIds={metricIds} targetIds={targetIds} />
  </EditorDialog>;
}

function ChallengeForm({ challenge, today, habits, metrics, targets, habitIds = [], metricIds = [], targetIds = [] }: ChallengeEditorProps) {
  const [state, action, pending] = useActionState(saveChallenge, initialFormState);
  const id = useId();
  return <form action={action} className="space-y-6">
    {challenge && <><input type="hidden" name="id" value={challenge.id} /><input type="hidden" name="expectedUpdatedAt" value={challenge.updated_at} /></>}
    <fieldset disabled={pending} className="space-y-5">
      <div className="space-y-2"><Label htmlFor={`${id}-title`}>Challenge title</Label><Input id={`${id}-title`} name="title" defaultValue={challenge?.title} required maxLength={120} className="h-11" /></div>
      <div className="space-y-2"><Label htmlFor={`${id}-description`}>Description</Label><textarea id={`${id}-description`} name="description" defaultValue={challenge?.description} maxLength={2000} rows={3} className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm" /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor={`${id}-start`}>Start date</Label><Input id={`${id}-start`} type="date" name="startDate" defaultValue={challenge?.start_date ?? today} required className="h-11" /></div>
        <div className="space-y-2"><Label htmlFor={`${id}-end`}>End date</Label><Input id={`${id}-end`} type="date" name="endDate" defaultValue={challenge?.end_date ?? today} required className="h-11" /></div>
      </div>
      <div className="space-y-2"><Label htmlFor={`${id}-status`}>Status</Label><select id={`${id}-status`} name="status" defaultValue={challenge?.status ?? "active"} className={selectClass}><option value="upcoming">Upcoming</option><option value="active">Active</option><option value="completed">Completed</option><option value="archived">Archived</option></select></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor={`${id}-color`}>Accent color</Label><Input id={`${id}-color`} name="color" type="color" defaultValue={challenge?.color ?? "#a89af3"} className="h-11" /></div>
        <div className="space-y-2"><Label htmlFor={`${id}-icon`}>Icon or emoji</Label><Input id={`${id}-icon`} name="icon" defaultValue={challenge?.icon ?? ""} maxLength={40} className="h-11" /></div>
      </div>
      <div className="space-y-6 border-t pt-5">
        <p className="text-sm leading-6 text-muted-foreground">Choose what this challenge follows. Adding a tracker does not copy its history or create another logging requirement.</p>
        <TrackerChoices title="Habits" name="habitIds" options={habits} selected={habitIds} />
        <TrackerChoices title="Metrics" name="metricIds" options={metrics} selected={metricIds} />
        <TrackerChoices title="Frequency targets" name="frequencyTargetIds" options={targets} selected={targetIds} />
      </div>
    </fieldset>
    <FormFeedback state={state} />
    <Button type="submit" className="h-11 px-4" disabled={pending}>{pending ? "Saving…" : "Save challenge"}</Button>
  </form>;
}

export function SelectChallengeButton({ id, selected = false }: { id: string; selected?: boolean }) {
  const [state, action, pending] = useActionState(selectChallenge, initialFormState);
  return <form action={action} className="space-y-3">
    <input type="hidden" name="challengeId" value={selected ? "" : id} />
    <Button type="submit" variant="outline" className="h-11 px-4" disabled={pending}>{pending ? "Updating…" : selected ? "Use personal trackers" : "Use on Today"}</Button>
    <FormFeedback state={state} />
  </form>;
}

export function ChallengeArchiveButton({ challenge }: { challenge: Pick<Challenge, "id" | "updated_at"> }) {
  const [state, action, pending] = useActionState(archiveChallenge, initialFormState);
  return <form action={action} className="space-y-3"><input type="hidden" name="id" value={challenge.id} /><input type="hidden" name="expectedUpdatedAt" value={challenge.updated_at} /><Button type="submit" variant="outline" className="h-11 px-4" disabled={pending}>{pending ? "Archiving…" : "Archive challenge"}</Button><FormFeedback state={state} /></form>;
}

export function DeleteChallengeDialog({ challenge }: { challenge: Pick<Challenge, "id" | "updated_at"> }) {
  return <EditorDialog title="Delete this challenge?" triggerLabel="Delete permanently" triggerVariant="ghost" description="This removes the challenge and its associations. Shared trackers and their history stay in your account."><DeleteChallengeForm challenge={challenge} /></EditorDialog>;
}

function DeleteChallengeForm({ challenge }: { challenge: Pick<Challenge, "id" | "updated_at"> }) {
  const [state, action, pending] = useActionState(deleteChallenge, initialFormState);
  const id = useId();
  return <form action={action} className="space-y-5"><input type="hidden" name="id" value={challenge.id} /><input type="hidden" name="expectedUpdatedAt" value={challenge.updated_at} /><div className="space-y-2"><Label htmlFor={id}>Type DELETE to confirm</Label><Input id={id} name="confirmation" pattern="DELETE" required autoComplete="off" className="h-11" disabled={pending} /></div><FormFeedback state={state} /><Button type="submit" variant="destructive" className="h-11 px-4" disabled={pending}>{pending ? "Deleting…" : "Delete challenge"}</Button></form>;
}
