"use client";
import { useActionState, useId, useRef, useState, useTransition } from "react";
import { ResponsiveEditor } from "@/components/forms/editor-dialog";
import { FormField, controlClass } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { FormFeedback } from "@/components/form-feedback";
import { initialFormState, type FormState } from "@/lib/auth/validation";
import { saveHabit, removeHabit } from "./actions";
import { weekdayNames } from "./domain";
import type { Habit } from "./types";
function HabitForm({ habit, days }: { habit?: Habit; days: number[] }) {
  const fieldId = useId();
  const form = useRef<HTMLFormElement>(null);
  const [name, setName] = useState(habit?.name ?? "");
  const [daily, setDaily] = useState(days.length === 7);
  const [selected, setSelected] = useState(days);
  const [state, action, pending] = useActionState(
    async (previous: FormState, data: FormData) => {
      try {
        if (!navigator.onLine) throw new Error("offline");
        const result = await saveHabit(previous, data);
        if (result.status === "success") {
          form.current?.closest("dialog")?.close();
          if (!habit) setName("");
        }
        return result;
      } catch {
        return {
          status: "error" as const,
          message: "Could not save. Check your connection and try again.",
        };
      }
    },
    initialFormState,
  );
  return (
    <form ref={form} action={action} className="space-y-6">
      {habit && <input type="hidden" name="id" value={habit.id} />}
      <input type="hidden" name="revision" value={habit?.revision ?? 0} />
      <fieldset disabled={pending} className="space-y-6">
        <FormField
          name={fieldId}
          label="Habit name"
          error={state.fieldErrors?.name?.[0]}
        >
          <input
            autoFocus
            name="name"
            id={fieldId}
            required
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Read"
            className={controlClass}
          />
        </FormField>
        <fieldset>
          <legend className="mb-3 text-sm font-medium">Schedule</legend>
          <div className="flex flex-wrap gap-2">
            {[true, false].map((value) => (
              <label
                key={String(value)}
                className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-4 text-sm ${daily === value ? "border-primary bg-selected" : "border-control-border"}`}
              >
                <input
                  type="radio"
                  name="schedule"
                  checked={daily === value}
                  onChange={() => setDaily(value)}
                  value={value ? "daily" : "selected"}
                />
                {value ? "Daily" : "Selected days"}
              </label>
            ))}
          </div>
          {daily ? (
            weekdayNames.map((_, i) => (
              <input key={i} type="hidden" name="weekday" value={i + 1} />
            ))
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {weekdayNames.map((day, i) => (
                <label
                  key={day}
                  className={`relative flex size-11 cursor-pointer items-center justify-center rounded-full border text-sm ${selected.includes(i + 1) ? "border-primary bg-selected" : "border-control-border"}`}
                >
                  <input
                    className="absolute inset-0 size-full cursor-pointer opacity-0"
                    type="checkbox"
                    name="weekday"
                    value={i + 1}
                    checked={selected.includes(i + 1)}
                    aria-label={day}
                    onChange={(e) =>
                      setSelected(
                        e.target.checked
                          ? [...selected, i + 1]
                          : selected.filter((d) => d !== i + 1),
                      )
                    }
                  />
                  <span aria-hidden="true">{day.slice(0, 2)}</span>
                </label>
              ))}
            </div>
          )}
          {state.fieldErrors?.weekdays?.[0] && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {state.fieldErrors.weekdays[0]}
            </p>
          )}
        </fieldset>
      </fieldset>
      <p className="text-sm text-muted-foreground">
        {habit
          ? "Name changes apply now. Schedule changes start tomorrow."
          : "Starts today. Keep it small—3 to 5 habits is a good beginning."}
      </p>
      <FormFeedback state={state} />
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          type="button"
          disabled={pending}
          onClick={() => form.current?.closest("dialog")?.close()}
        >
          Cancel
        </Button>
        <Button disabled={pending}>
          {pending ? "Saving…" : habit ? "Save habit" : "Create habit"}
        </Button>
      </div>
    </form>
  );
}
export function HabitEditor({
  habit,
  days = [1, 2, 3, 4, 5, 6, 7],
  label = "New habit",
  quiet = false,
}: {
  habit?: Habit;
  days?: number[];
  label?: string;
  quiet?: boolean;
}) {
  return (
    <ResponsiveEditor
      title={habit ? "Edit habit" : "New habit"}
      triggerLabel={label}
      triggerAriaLabel={habit ? `Edit ${habit.name}` : label}
      triggerVariant={habit || quiet ? "ghost" : "default"}
      triggerClassName={
        habit
          ? "w-full justify-start"
          : quiet
            ? "min-h-11 px-0 text-primary"
            : "min-h-11 px-5"
      }
    >
      <HabitForm
        key={`${habit?.id}-${habit?.revision}`}
        habit={habit}
        days={days}
      />
    </ResponsiveEditor>
  );
}
export function HabitRemoval({
  habit,
  permanent = false,
}: {
  habit: Habit;
  permanent?: boolean;
}) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<FormState>(initialFormState);
  const form = useRef<HTMLFormElement>(null);
  function remove() {
    start(async () => {
      try {
        if (!navigator.onLine) throw new Error("offline");
        const result = await removeHabit(
          { habitId: habit.id, expectedRevision: habit.revision },
          permanent,
          permanent ? "DELETE HABIT" : undefined,
        );
        setState(result);
        if (result.status === "success")
          form.current?.closest("dialog")?.close();
      } catch {
        setState({
          status: "error",
          message: "Could not save. Check your connection and try again.",
        });
      }
    });
  }
  if (!permanent)
    return (
      <div>
        <Button
          variant="ghost"
          className="w-full justify-start"
          disabled={pending}
          onClick={remove}
        >
          {pending ? "Archiving…" : "Archive"}
        </Button>
        <FormFeedback state={state} />
      </div>
    );
  return (
    <ResponsiveEditor
      title="Delete habit permanently?"
      description={`Delete ${habit.name} and all its history. This cannot be undone.`}
      triggerLabel="Delete permanently"
      triggerAriaLabel={`Delete ${habit.name} permanently`}
      triggerVariant="ghost"
      triggerClassName="w-full justify-start text-destructive"
    >
      <form
        ref={form}
        onSubmit={(e) => {
          e.preventDefault();
          remove();
        }}
        className="space-y-5"
      >
        <FormFeedback state={state} />
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            disabled={pending}
            onClick={() => form.current?.closest("dialog")?.close()}
          >
            Cancel
          </Button>
          <Button variant="destructive" disabled={pending}>
            {pending ? "Deleting…" : "Delete habit and history"}
          </Button>
        </div>
      </form>
    </ResponsiveEditor>
  );
}
