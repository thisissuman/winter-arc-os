import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "error" | "info";
const tones: Record<Tone, { boxed: string; subtle: string }> = {
  success: { boxed: "border-feedback-success-border bg-feedback-success text-success", subtle: "text-success" },
  warning: { boxed: "border-feedback-warning-border bg-feedback-warning text-warning", subtle: "text-warning" },
  error: { boxed: "border-feedback-error-border bg-feedback-error text-destructive", subtle: "text-destructive" },
  info: { boxed: "border-border bg-secondary text-foreground", subtle: "text-muted-foreground" },
};

export function InlineFeedback({ message, tone = "info", variant = "subtle", className }: {
  message?: string | null; tone?: Tone; variant?: "subtle" | "boxed"; className?: string;
}) {
  if (!message) return null;
  return <p role={tone === "error" ? "alert" : "status"} aria-atomic="true" className={cn("text-body leading-relaxed", variant === "boxed" ? "rounded-md border px-3 py-2.5" : "", tones[tone][variant], className)}>{message}</p>;
}
