"use client";

import type { FormState } from "@/lib/auth/validation";

/** Keep form input visible when an action cannot reach the server. */
export async function submitSettingsAction<T extends FormState>(
  action: (previous: T, form: FormData) => Promise<T>,
  previous: T,
  form: FormData,
): Promise<T> {
  if (!navigator.onLine)
    return {
      ...previous,
      status: "error",
      message:
        "You are offline. Reconnect before saving; your changes have not been saved.",
    };
  try {
    return await action(previous, form);
  } catch {
    return {
      ...previous,
      status: "error",
      message:
        "Could not save. Check your connection and retry; your changes have not been saved.",
    };
  }
}
