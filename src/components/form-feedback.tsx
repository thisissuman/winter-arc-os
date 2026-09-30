import type { FormState } from "@/lib/auth/validation";
export function FormFeedback({ state }: { state: FormState }) {
  if (!state.message) return null;
  return <p role={state.status === "error" ? "alert" : "status"} className={`rounded-md border px-3 py-2.5 text-sm leading-relaxed ${state.status === "error" ? "text-destructive" : "text-success"}`}>{state.message}</p>;
}
