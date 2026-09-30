"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormFeedback } from "@/components/form-feedback";
import { initialFormState } from "@/lib/auth/validation";
import { updateAppearance, updateProfile } from "./actions";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfile, initialFormState);
  return <form action={action} className="max-w-md space-y-5">
    <div className="space-y-2"><Label htmlFor="displayName">Display name</Label><Input className="h-11 bg-card" id="displayName" name="displayName" defaultValue={name} autoComplete="name" maxLength={80} disabled={pending} aria-describedby="name-help" /><p id="name-help" className="text-xs text-muted-foreground">Optional. Leave blank to use the default greeting.</p></div>
    <div><p className="text-sm font-medium">Email address</p><p className="mt-2 break-all text-sm text-muted-foreground">{email}</p><p className="mt-1 text-xs text-muted-foreground">Used to sign in and recover your account.</p></div>
    <Button className="h-11 px-4" type="submit" disabled={pending}>{pending ? "Saving…" : "Save profile"}</Button>
    <FormFeedback state={state} />
  </form>;
}

export function AppearanceForm({ theme }: { theme: string }) {
  const [state, action, pending] = useActionState(updateAppearance, initialFormState);
  return <form action={action} className="max-w-md space-y-4">
    <div className="space-y-2"><Label htmlFor="theme">Color theme</Label><select id="theme" name="theme" defaultValue={theme} disabled={pending} className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm"><option value="dark">Dark</option><option value="light">Light</option><option value="system">Match device</option></select></div>
    <Button variant="outline" className="h-11 px-4" type="submit" disabled={pending}>{pending ? "Saving…" : "Save appearance"}</Button>
    <FormFeedback state={state} />
  </form>;
}
