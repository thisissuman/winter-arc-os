"use client";
import { useState, useTransition } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { setCompletion } from "./actions";
import { cn } from "@/lib/utils";
export function Completion({
  habitId,
  name,
  date,
  completed,
  revision,
  disabled = false,
  compact = false,
}: {
  habitId: string;
  name: string;
  date: string;
  completed: boolean;
  revision: number;
  disabled?: boolean;
  compact?: boolean;
}) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();
  function save() {
    setMessage("");
    setError(false);
    start(async () => {
      try {
        if (!navigator.onLine) throw new Error("offline");
        const result = await setCompletion({
          habitId,
          businessDate: date,
          completed: !completed,
          expectedRevision: revision,
        });
        setError(result.status === "error");
        setMessage(result.message ?? "Saved");
      } catch {
        setError(true);
        setMessage("Could not save. Check your connection and try again.");
      }
    });
  }
  return (
    <div className={compact ? "mt-5" : "border-b"}>
      <button
        type="button"
        role="checkbox"
        aria-checked={completed}
        aria-label={`${name} on ${date}`}
        disabled={disabled || pending}
        onClick={save}
        className={cn(
          "flex min-h-16 w-full items-center gap-4 rounded-lg px-2 py-4 text-left transition-colors hover:bg-secondary disabled:cursor-default disabled:opacity-70",
          compact && "border bg-card px-4",
          completed && "text-muted-foreground",
        )}
      >
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full border-2",
            completed
              ? "border-success bg-success text-background"
              : "border-control-border",
          )}
        >
          {pending ? (
            <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          ) : completed ? (
            <Check className="size-5" aria-hidden="true" strokeWidth={2.5} />
          ) : null}
        </span>
        <span className="min-w-0 break-words [overflow-wrap:anywhere] text-base">
          {compact ? (completed ? "Completed" : "Mark complete") : name}
        </span>
        {pending && <span className="sr-only">Saving</span>}
      </button>
      {message && (
        <div
          role={error ? "alert" : "status"}
          className={cn(
            "flex flex-wrap items-center gap-2 px-2 pb-3 text-sm",
            error ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {message}
          {error && (
            <button
              type="button"
              className="min-h-11 underline"
              onClick={() => router.refresh()}
            >
              Reload saved state
            </button>
          )}
        </div>
      )}
    </div>
  );
}
