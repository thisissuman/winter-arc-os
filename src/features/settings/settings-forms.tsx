"use client";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormFeedback } from "@/components/form-feedback";
import { initialFormState, type FormState } from "@/lib/auth/validation";
import { updateAppearance, updateProfile } from "./actions";
import { submitSettingsAction } from "./safe-action";
import { completeOnboarding } from "@/features/tracking/actions";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [displayName, setDisplayName] = useState(name);
  const [state, action, pending] = useActionState((previous: FormState, form: FormData) => submitSettingsAction(updateProfile, previous, form), initialFormState);
  return <form action={action} className="max-w-md space-y-5">
    <div className="space-y-2"><Label htmlFor="displayName">Display name</Label><Input className="h-11 bg-card" id="displayName" name="displayName" value={displayName} onChange={event => setDisplayName(event.target.value)} autoComplete="name" maxLength={80} disabled={pending} aria-describedby="name-help" /><p id="name-help" className="text-xs text-muted-foreground">Optional. Leave blank to use the default greeting.</p></div>
    <div><p className="text-sm font-medium">Email address</p><p className="mt-2 break-all text-sm text-muted-foreground">{email}</p><p className="mt-1 text-xs text-muted-foreground">Used to sign in and recover your account.</p></div>
    <Button className="h-11 px-4" type="submit" disabled={pending}>{pending ? "Saving…" : "Save profile"}</Button>
    <FormFeedback state={state} />
  </form>;
}

export function AppearanceForm({ theme }: { theme: string }) {
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [state, action, pending] = useActionState((previous: FormState, form: FormData) => submitSettingsAction(updateAppearance, previous, form), initialFormState);
  return <form action={action} className="max-w-md space-y-4">
    <div className="space-y-2"><Label htmlFor="theme">Color theme</Label><select id="theme" name="theme" value={selectedTheme} onChange={event => setSelectedTheme(event.target.value)} disabled={pending} className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm"><option value="dark">Dark</option><option value="light">Light</option><option value="system">Match device</option></select></div>
    <Button variant="outline" className="h-11 px-4" type="submit" disabled={pending}>{pending ? "Saving…" : "Save appearance"}</Button>
    <FormFeedback state={state} />
  </form>;
}

export function CalendarForm({ timezone, weekStartsOn }: { timezone: string; weekStartsOn: number }) {
  const [calendarTimezone, setCalendarTimezone] = useState(timezone);
  const [calendarWeek, setCalendarWeek] = useState(weekStartsOn);
  const [state, action, pending] = useActionState((previous: FormState, form: FormData) => submitSettingsAction(completeOnboarding, previous, form), initialFormState);
  return <form action={action} className="max-w-md space-y-4">
    <input type="hidden" name="applyStarter" value="" />
    <fieldset disabled={pending} className="space-y-4">
      <div className="space-y-2"><Label htmlFor="calendar-timezone">Timezone</Label><Input id="calendar-timezone" name="timezone" value={calendarTimezone} onChange={event => setCalendarTimezone(event.target.value)} maxLength={80} required list="calendar-timezones" className="h-11" /><datalist id="calendar-timezones"><option value="Asia/Kolkata" /><option value="UTC" /><option value="Europe/London" /><option value="America/New_York" /><option value="Asia/Singapore" /><option value="Australia/Sydney" /></datalist></div>
      <div className="space-y-2"><Label htmlFor="calendar-week">Week starts on</Label><select id="calendar-week" name="weekStartsOn" value={calendarWeek} onChange={event => setCalendarWeek(Number(event.target.value))} className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm">{["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, index) => <option key={day} value={index + 1}>{day}</option>)}</select></div>
    </fieldset>
    <p className="text-xs leading-5 text-muted-foreground">New logs use your chosen timezone. Existing dates, target calendars, and saved review anchors stay unchanged. New weekly rules use the updated calendar at their next boundary.</p>
    <Button className="min-h-11" variant="outline" disabled={pending}>{pending ? "Saving…" : "Save calendar"}</Button><FormFeedback state={state} />
  </form>;
}
