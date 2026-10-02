import type { FormState } from "@/lib/auth/validation";
import { InlineFeedback } from "@/components/presentation/inline-feedback";
export function FormFeedback({ state }: { state: FormState }) {
  return <InlineFeedback message={state.message} tone={state.status === "error" ? "error" : state.status === "success" ? "success" : "info"} variant="boxed" />;
}
