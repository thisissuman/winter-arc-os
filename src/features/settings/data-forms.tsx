"use client";

import { useActionState, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormFeedback } from "@/components/form-feedback";
import { controlClass, FormField } from "@/components/forms/form-field";
import { initialFormState } from "@/lib/auth/validation";
import { deleteWorkspaceData } from "./data-actions";

export function ExportControl() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function download() {
    setPending(true);
    setError("");
    try {
      if (!navigator.onLine) throw new Error("offline");
      const response = await fetch("/api/export", { cache: "no-store" });
      if (!response.ok) throw new Error("export");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        "winter-arc-os-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError(
        "Could not download your data. Check your connection, sign in, and retry.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-muted-foreground">
        Download your profile, preferences, habits, schedules, and completion
        history as JSON. Private records are included even in Privacy Mode. Keep
        this file somewhere private. Import is not available in V1.
      </p>
      <Button
        type="button"
        className="min-h-11"
        disabled={pending}
        onClick={download}
      >
        {pending ? "Preparing download…" : "Download JSON export"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function DeleteDataForm() {
  const password = useRef<HTMLInputElement>(null);
  const [state, action, pending] = useActionState(
    async (previous: typeof initialFormState, form: FormData) => {
      if (password.current) password.current.value = "";
      try {
        if (!navigator.onLine)
          return {
            status: "error" as const,
            message: "Reconnect before deleting workspace data.",
          };
        return await deleteWorkspaceData(previous, form);
      } catch {
        return {
          status: "error" as const,
          message:
            "Could not delete workspace data. Check your connection and retry.",
        };
      }
    },
    initialFormState,
  );
  return (
    <form action={action} className="space-y-4">
      <p className="text-sm leading-6 text-muted-foreground">
        Permanently remove all habits, schedules, and completion history. Keep
        your sign-in account, profile, calendar, appearance, and privacy
        preferences. Download an export first if you need a copy.
      </p>
      <fieldset disabled={pending} className="space-y-4">
        <FormField name="delete-data-confirmation" label="Type DELETE MY DATA">
          <input
            id="delete-data-confirmation"
            name="confirmation"
            required
            autoComplete="off"
            className={controlClass}
          />
        </FormField>
        <FormField name="delete-data-password" label="Current password">
          <input
            ref={password}
            id="delete-data-password"
            name="password"
            type="password"
            autoComplete="current-password"
            maxLength={1024}
            required
            className={controlClass}
          />
        </FormField>
      </fieldset>
      <Button variant="destructive" className="min-h-11" disabled={pending}>
        {pending ? "Deleting…" : "Delete workspace data"}
      </Button>
      <FormFeedback state={state} />
    </form>
  );
}

export function DeleteAccountForm({ available }: { available: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function remove(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = event.currentTarget;
    const fields = new FormData(form);
    const password = form.elements.namedItem("password");
    if (password instanceof HTMLInputElement) password.value = "";
    try {
      if (!navigator.onLine) throw new Error("offline");
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: fields.get("password"),
          confirmation: fields.get("confirmation"),
        }),
      });
      const result: { message?: string } = await response.json();
      if (!response.ok) {
        setError(result.message ?? "Account deletion failed. Retry.");
        return;
      }
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- Drop authenticated client route state after identity deletion.
      window.location.assign("/login?notice=account-deleted");
    } catch {
      setError(
        "Could not delete your account. Check your connection and retry.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={remove} className="space-y-4">
      <p className="text-sm leading-6 text-muted-foreground">
        Permanently delete your sign-in identity and every owned workspace
        record, including profile and preferences. This cannot be undone. You
        must verify your current password now.
      </p>
      {!available && (
        <p role="status" className="text-sm text-muted-foreground">
          Account deletion is unavailable until the workspace operator
          configures the server credential.
        </p>
      )}
      <fieldset disabled={pending || !available} className="space-y-4">
        <FormField
          name="delete-account-confirmation"
          label="Type DELETE MY ACCOUNT"
        >
          <input
            id="delete-account-confirmation"
            name="confirmation"
            autoComplete="off"
            required
            className={controlClass}
          />
        </FormField>
        <FormField name="delete-account-password" label="Current password">
          <input
            id="delete-account-password"
            name="password"
            type="password"
            autoComplete="current-password"
            maxLength={1024}
            required
            className={controlClass}
          />
        </FormField>
      </fieldset>
      <Button
        variant="destructive"
        className="min-h-11"
        disabled={pending || !available}
      >
        {pending ? "Deleting account…" : "Delete my account"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
