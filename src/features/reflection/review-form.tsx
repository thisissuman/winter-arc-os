"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormFeedback } from "@/components/form-feedback";
import { controlClass, FormField } from "@/components/tracking/form-field";
import { initialFormState } from "@/lib/auth/validation";
import { saveMonthlyReflection, saveWeeklyReview, type ReflectionState } from "./actions";
import type { MonthlyReflection, WeeklyReview } from "./queries";

const weeklyPrompts = [
  { name: "wins", label: "Wins", column: "wins" },
  { name: "difficulties", label: "What went wrong", column: "difficulties" },
  { name: "lessons", label: "What I learned", column: "lessons" },
  { name: "nextWeekChanges", label: "What should change next week", column: "next_week_changes" },
] as const;
const monthlyPrompts = [
  { name: "biggestWins", label: "Biggest wins", column: "biggest_wins" },
  { name: "biggestFailures", label: "Biggest failures", column: "biggest_failures" },
  { name: "habitsImproved", label: "Habits that improved", column: "habits_improved" },
  { name: "habitsSlipped", label: "Habits that slipped", column: "habits_slipped" },
  { name: "fitnessProgress", label: "Fitness progress", column: "fitness_progress" },
  { name: "careerProgress", label: "Career progress", column: "career_progress" },
  { name: "changesNextMonth", label: "What to change", column: "changes_next_month" },
  { name: "notes", label: "Freeform notes", column: "notes" },
] as const;
const ratings = ["energy", "focus", "motivation", "stress", "mood"] as const;

export function WeeklyReviewForm({ periodStart, review }: { periodStart: string; review: WeeklyReview | null }) {
  const [state, action, pending] = useActionState(saveWeeklyReview, initialFormState as ReflectionState);
  return <form action={action} className="space-y-5 rounded-xl border bg-card p-5">
    <input type="hidden" name="periodStart" value={periodStart} />
    <input type="hidden" name="expectedRevision" value={state.revision ?? review?.revision ?? ""} />
    {weeklyPrompts.map(({ name, label, column }) => <FormField key={name} name={name} label={label}><textarea id={name} name={name} maxLength={4000} defaultValue={review?.[column] ?? ""} className={`${controlClass} min-h-28 resize-y`} /></FormField>)}
    <fieldset><legend className="font-medium">Optional check-in · 1–5</legend><p className="mt-1 text-sm text-muted-foreground">Leave any rating blank if it does not fit this week.</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{ratings.map((name) => <FormField key={name} name={name} label={name[0].toUpperCase() + name.slice(1)}><select id={name} name={name} defaultValue={review?.[name] ?? ""} className={controlClass}><option value="">Not rated</option>{[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}</select></FormField>)}</div>
    </fieldset>
    <div className="flex flex-wrap items-center gap-3"><Button disabled={pending} className="min-h-11">{pending ? "Saving…" : review ? "Save changes" : "Save weekly review"}</Button><FormFeedback state={state} /></div>
  </form>;
}

export function MonthlyReflectionForm({ periodStart, review }: { periodStart: string; review: MonthlyReflection | null }) {
  const [state, action, pending] = useActionState(saveMonthlyReflection, initialFormState as ReflectionState);
  return <form action={action} className="space-y-5 rounded-xl border bg-card p-5">
    <input type="hidden" name="periodStart" value={periodStart} />
    <input type="hidden" name="expectedRevision" value={state.revision ?? review?.revision ?? ""} />
    {monthlyPrompts.map(({ name, label, column }) => <FormField key={name} name={name} label={label}><textarea id={name} name={name} maxLength={4000} defaultValue={review?.[column] ?? ""} className={`${controlClass} min-h-28 resize-y`} /></FormField>)}
    <div className="flex flex-wrap items-center gap-3"><Button disabled={pending} className="min-h-11">{pending ? "Saving…" : review ? "Save changes" : "Save monthly reflection"}</Button><FormFeedback state={state} /></div>
  </form>;
}
