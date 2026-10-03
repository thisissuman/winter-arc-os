"use client";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormFeedback } from "@/components/form-feedback";
import { initialFormState, type FormState } from "@/lib/auth/validation";
import { updateProfile, updatePreferences } from "./actions";
import { submitSettingsAction } from "./safe-action";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [displayName, setDisplayName] = useState(name);
  const [state, action, pending] = useActionState(
    (previous: FormState, form: FormData) =>
      submitSettingsAction(updateProfile, previous, form),
    initialFormState,
  );
  return (
    <form action={action} className="max-w-md space-y-5">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          className="h-11 bg-card"
          id="displayName"
          name="displayName"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          autoComplete="name"
          maxLength={80}
          disabled={pending}
          aria-describedby="name-help"
        />
        <p id="name-help" className="text-xs text-muted-foreground">
          Optional. Leave blank to use the default greeting.
        </p>
      </div>
      <div>
        <p className="text-sm font-medium">Email address</p>
        <p className="mt-2 break-all text-sm text-muted-foreground">{email}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Used to sign in and recover your account.
        </p>
      </div>
      <Button className="h-11 px-4" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
      {!pending && <FormFeedback state={state} />}
    </form>
  );
}

export function PreferencesForm({
  theme,
  timezone,
  weekStartsOn,
  enabled,
}: {
  theme: string;
  timezone: string;
  weekStartsOn: number;
  enabled: boolean;
}) {
  const [selectedTheme, setTheme] = useState(theme),
    [zone, setZone] = useState(timezone),
    [week, setWeek] = useState(weekStartsOn),
    [privacy, setPrivacy] = useState(enabled);
  const [state, action, pending] = useActionState(
    (previous: FormState, form: FormData) =>
      submitSettingsAction(updatePreferences, previous, form),
    initialFormState,
  );
  return (
    <form action={action} className="space-y-5">
      <fieldset disabled={pending} className="space-y-5">
        <div className="grid items-center gap-2 sm:grid-cols-[110px_1fr]">
          <Label htmlFor="theme">Color theme</Label>
          <select
            id="theme"
            name="theme"
            value={selectedTheme}
            onChange={(e) => setTheme(e.target.value)}
            className="min-h-11 w-full rounded-lg border border-control-border bg-card px-3 text-sm"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">Match device</option>
          </select>
        </div>
        <div className="grid items-center gap-2 sm:grid-cols-[110px_1fr]">
          <Label htmlFor="timezone">Timezone</Label>
          <Input
            id="timezone"
            name="timezone"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            maxLength={80}
            required
            list="timezones"
          />
          <datalist id="timezones">
            <option value="Asia/Kolkata" />
            <option value="UTC" />
            <option value="Europe/London" />
            <option value="America/New_York" />
            <option value="Asia/Singapore" />
            <option value="Australia/Sydney" />
          </datalist>
        </div>
        <div className="grid items-center gap-2 sm:grid-cols-[110px_1fr]">
          <Label htmlFor="week">Week starts on</Label>
          <select
            id="week"
            name="weekStartsOn"
            value={week}
            onChange={(e) => setWeek(Number(e.target.value))}
            className="min-h-11 w-full rounded-lg border border-control-border bg-card px-3 text-sm"
          >
            {[
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ].map((day, i) => (
              <option value={i + 1} key={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
        <label className="flex min-h-11 items-center justify-between gap-3 text-sm">
          <span>
            Privacy Mode
            <span className="mt-1 block text-xs text-muted-foreground">
              Hide habit names while enabled.
            </span>
          </span>
          <input
            type="checkbox"
            name="privacy"
            value="true"
            checked={privacy}
            onChange={(e) => setPrivacy(e.target.checked)}
            aria-label="Privacy Mode"
            className="size-5 accent-primary"
          />
        </label>
      </fieldset>
      <Button variant="outline" disabled={pending}>
        {pending ? "Saving…" : "Save preferences"}
      </Button>
      {!pending && <FormFeedback state={state} />}
    </form>
  );
}
