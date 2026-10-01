"use client";

import { useActionState, useState } from "react";
import { FormFeedback } from "@/components/form-feedback";
import { controlClass, FormField } from "@/components/tracking/form-field";
import { Button } from "@/components/ui/button";
import { initialFormState } from "@/lib/auth/validation";
import type { Challenge, StudyCategory, StudySession, TrackingCategory } from "@/features/tracking/types";
import { saveStudyCategory, saveStudySession, setupCareer, type CareerState } from "./actions";

function localInput(iso: string | null): string {
  if (!iso) return "";
  const value = new Date(iso);
  const two = (number: number) => String(number).padStart(2, "0");
  return `${value.getFullYear()}-${two(value.getMonth() + 1)}-${two(value.getDate())}T${two(value.getHours())}:${two(value.getMinutes())}`;
}

export function CareerSetupForm() {
  const [state, action, pending] = useActionState(setupCareer, initialFormState as CareerState);
  return <form action={action} className="mt-4 space-y-4"><div className="grid gap-4 sm:grid-cols-2"><FormField name="study-daily" label="Daily study target (minutes, optional)"><input id="study-daily" name="dailyMinutes" type="number" min="1" max="10080" step="1" className={controlClass} /></FormField><FormField name="study-weekly" label="Weekly study target (minutes, optional)"><input id="study-weekly" name="weeklyMinutes" type="number" min="1" max="10080" step="1" className={controlClass} /></FormField></div><p className="text-xs text-muted-foreground">Study session quota starts at five per week. Targets can be edited later; setup creates no time records.</p><Button disabled={pending}>{pending ? "Setting up…" : "Set up study tracking"}</Button><FormFeedback state={state} /></form>;
}

export function StudyCategoryForm({ studyCategory, generalCategories }: { studyCategory?: StudyCategory; generalCategories: TrackingCategory[] }) {
  const [state, action, pending] = useActionState(saveStudyCategory, initialFormState as CareerState);
  return <form action={action} className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4"><input type="hidden" name="id" value={studyCategory?.id ?? ""} /><input type="hidden" name="expectedUpdatedAt" value={studyCategory?.updated_at ?? ""} /><input type="hidden" name="position" value={studyCategory?.position ?? 0} /><div className="min-w-40 flex-1"><FormField name={`study-category-name-${studyCategory?.id ?? "new"}`} label="Study category"><input id={`study-category-name-${studyCategory?.id ?? "new"}`} name="name" required maxLength={120} defaultValue={studyCategory?.name ?? ""} className={controlClass} /></FormField></div><div className="min-w-36 flex-1"><FormField name={`study-category-parent-${studyCategory?.id ?? "new"}`} label="General category (optional)"><select id={`study-category-parent-${studyCategory?.id ?? "new"}`} name="categoryId" defaultValue={studyCategory?.category_id ?? ""} className={controlClass}><option value="">None</option>{generalCategories.filter((category) => !category.archived_at || category.id === studyCategory?.category_id).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></FormField></div><Button disabled={pending}>{pending ? "Saving…" : studyCategory ? "Save" : "Add category"}</Button>{studyCategory && <Button type="submit" name="archive" value="true" variant="outline" disabled={pending}>Archive</Button>}<div className="basis-full"><FormFeedback state={state} /></div></form>;
}

export function StudySessionForm({ session, categories, challenges, today, privacyMode }: { session?: StudySession; categories: StudyCategory[]; challenges: Challenge[]; today: string; privacyMode: boolean }) {
  const [state, action, pending] = useActionState(saveStudySession, initialFormState as CareerState);
  const [start, setStart] = useState(localInput(session?.start_at ?? null));
  const [end, setEnd] = useState(localInput(session?.end_at ?? null));
  const [minutes, setMinutes] = useState(session ? String(Math.round(session.duration_seconds / 60)) : "");
  const startIso = start ? new Date(start).toISOString() : "";
  const endIso = end ? new Date(end).toISOString() : "";
  const timestampSeconds = start && end ? Math.round((Date.parse(endIso) - Date.parse(startIso)) / 1000) : null;
  const seconds = timestampSeconds ?? (minutes ? Number(minutes) * 60 : 0);
  const selectable = categories.filter((category) => !category.archived_at || category.id === session?.study_category_id);
  if (privacyMode) return <p className="text-sm text-muted-foreground">Session topics, notes, and editing are hidden in Privacy Mode.</p>;
  return <form action={action} className="space-y-4 rounded-xl border bg-card p-5"><input type="hidden" name="id" value={session?.id ?? ""} /><input type="hidden" name="expectedRevision" value={session?.revision ?? ""} /><input type="hidden" name="durationSeconds" value={seconds} /><input type="hidden" name="startAt" value={startIso} /><input type="hidden" name="endAt" value={endIso} />
    <div className="grid gap-4 sm:grid-cols-2"><FormField name={`study-date-${session?.id ?? "new"}`} label="Completion date"><input id={`study-date-${session?.id ?? "new"}`} name="date" type="date" defaultValue={session?.business_date ?? today} max={today} required className={controlClass} /></FormField><FormField name={`study-category-${session?.id ?? "new"}`} label="Study category"><select id={`study-category-${session?.id ?? "new"}`} name="categoryId" defaultValue={session?.study_category_id ?? selectable[0]?.id ?? ""} required className={controlClass}>{selectable.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></FormField></div>
    <div className="grid gap-4 sm:grid-cols-2"><FormField name={`study-minutes-${session?.id ?? "new"}`} label="Duration (minutes)"><input id={`study-minutes-${session?.id ?? "new"}`} type="number" min="1" max="10080" step="1" value={timestampSeconds === null ? minutes : Math.round(timestampSeconds / 60)} onChange={(event) => setMinutes(event.target.value)} disabled={Boolean(start && end)} required={!start && !end} className={controlClass} /></FormField><FormField name={`study-challenge-${session?.id ?? "new"}`} label="Challenge (optional)"><select id={`study-challenge-${session?.id ?? "new"}`} name="challengeId" defaultValue={session?.challenge_id ?? ""} className={controlClass}><option value="">Personal</option>{challenges.filter((challenge) => challenge.status !== "archived" || challenge.id === session?.challenge_id).map((challenge) => <option key={challenge.id} value={challenge.id}>{challenge.title}</option>)}</select></FormField></div>
    <details><summary className="cursor-pointer text-sm text-primary">Add start and end times</summary><p className="mt-2 text-xs text-muted-foreground">Times use your device timezone. Enter both to split an overnight session across local study days; the completion date must match the end time in your account timezone.</p><div className="mt-3 grid gap-4 sm:grid-cols-2"><FormField name={`study-start-${session?.id ?? "new"}`} label="Start time"><input id={`study-start-${session?.id ?? "new"}`} type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} className={controlClass} /></FormField><FormField name={`study-end-${session?.id ?? "new"}`} label="End time"><input id={`study-end-${session?.id ?? "new"}`} type="datetime-local" value={end} onChange={(event) => setEnd(event.target.value)} className={controlClass} /></FormField></div></details>
    <FormField name={`study-topic-${session?.id ?? "new"}`} label="Topic (optional)"><input id={`study-topic-${session?.id ?? "new"}`} name="topic" maxLength={200} defaultValue={session?.topic ?? ""} className={controlClass} /></FormField><FormField name={`study-notes-${session?.id ?? "new"}`} label="Notes (optional)"><textarea id={`study-notes-${session?.id ?? "new"}`} name="notes" maxLength={4000} defaultValue={session?.notes ?? ""} className={`${controlClass} min-h-20`} /></FormField><div className="flex flex-wrap gap-3"><Button disabled={pending || selectable.length === 0}>{pending ? "Saving…" : session ? "Save changes" : "Log study session"}</Button>{session && <Button type="submit" name="delete" value="true" variant="outline" disabled={pending} onClick={(event) => { if (!window.confirm("Permanently delete this manual study session?")) event.preventDefault(); }}>Delete session</Button>}</div><FormFeedback state={state} />
  </form>;
}
