"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormFeedback } from "@/components/form-feedback";
import { initialFormState } from "@/lib/auth/validation";
import { completeOnboarding } from "@/features/tracking/actions";

export function OnboardingForm({ timezone, weekStartsOn, complete }: { timezone: string; weekStartsOn: number; complete: boolean }) {
  const [state, action, pending] = useActionState(completeOnboarding, initialFormState);
  const [starter, setStarter] = useState(false);
  const id = useId();
  return <form action={action} className="space-y-8">
    <fieldset disabled={pending} className="space-y-5">
      <legend className="mb-4 text-lg font-medium">Your calendar</legend>
      <div className="space-y-2"><Label htmlFor={`${id}-timezone`}>Timezone</Label><Input id={`${id}-timezone`} name="timezone" defaultValue={timezone} required maxLength={80} list={`${id}-timezones`} className="h-11" aria-describedby={`${id}-timezone-help`} /><datalist id={`${id}-timezones`}><option value="Asia/Kolkata" /><option value="Europe/London" /><option value="America/New_York" /><option value="America/Los_Angeles" /><option value="Asia/Singapore" /><option value="Australia/Sydney" /><option value="UTC" /></datalist><p id={`${id}-timezone-help`} className="text-xs leading-5 text-muted-foreground">Use an IANA timezone, such as Asia/Kolkata. Existing logs retain their original business dates.</p></div>
      <div className="space-y-2"><Label htmlFor={`${id}-week`}>Week starts on</Label><select id={`${id}-week`} name="weekStartsOn" defaultValue={weekStartsOn} className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm">{["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, index) => <option key={day} value={index + 1}>{day}</option>)}</select><p className="text-xs leading-5 text-muted-foreground">Changes apply at the next weekly boundary. Historical target periods keep their saved calendar.</p></div>
    </fieldset>
    <fieldset disabled={pending} className="space-y-5 border-t pt-7">
      <legend className="sr-only">Optional starter setup</legend>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-5"><input type="checkbox" name="applyStarter" checked={starter} onChange={(event) => setStarter(event.target.checked)} className="mt-1 size-4 shrink-0 accent-primary" /><span><span className="block text-sm font-medium">Add the Winter Arc starter setup</span><span className="mt-2 block text-sm leading-6 text-muted-foreground">Editable definitions and targets. No completions, measurements, sessions, or scores are added.</span></span></label>
      <div className="space-y-3 px-1 text-sm leading-6 text-muted-foreground"><p>Winter Arc 2026 runs September 1–December 1, 2026, inclusive. New trackers begin today, so earlier challenge days do not become missed tracking.</p><ul className="list-disc space-y-1 pl-5"><li>Creatine, meditation, and stammering practice habits.</li><li>Protein 130 g, water 3.5 L, and observational body weight.</li><li>Editable life areas and scoring categories.</li><li>Walking 5 qualifying days, gym 4 sessions, and career study 5 sessions per week. Gym and study sources become available in their respective phases.</li></ul><p>Repeating setup keeps existing definitions and does not re-create a default you deliberately removed.</p></div>
      {starter && <div className="space-y-5 border-t pt-5"><h2 className="text-sm font-medium">Optional personal targets</h2><p className="text-xs leading-5 text-muted-foreground">Leave these blank if you are still deciding. An unconfigured or unavailable source is excluded from scoring.</p><div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor={`${id}-steps`}>Walking threshold (steps/day)</Label><Input id={`${id}-steps`} name="stepThreshold" type="number" min="1" max="200000" step="1" inputMode="numeric" className="h-11" /></div>
        <div className="space-y-2"><Label htmlFor={`${id}-sleep`}>Sleep target (hours/day)</Label><Input id={`${id}-sleep`} name="sleepTarget" type="number" min="0.1" max="24" step="0.1" inputMode="decimal" className="h-11" /></div>
        <div className="space-y-2 sm:col-span-2"><Label htmlFor={`${id}-study`}>Study duration target (minutes/day)</Label><Input id={`${id}-study`} name="studyDailyMinutes" type="number" min="1" max="1440" step="1" inputMode="numeric" className="h-11" /></div>
      </div></div>}
    </fieldset>
    <FormFeedback state={state} />
    <div className="flex flex-wrap items-center gap-3"><Button type="submit" className="h-11 px-5" disabled={pending}>{pending ? "Saving setup…" : starter ? "Save and add starter setup" : complete ? "Save calendar preferences" : "Start with an empty workspace"}</Button><Button asChild variant="ghost" className="h-11 px-4"><Link href="/today">Back to Today</Link></Button></div>
  </form>;
}
