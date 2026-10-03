import { cloneElement, isValidElement, type ReactNode } from "react";
import { Label } from "@/components/ui/label";

export const controlClass =
  "min-h-[var(--control-touch)] w-full rounded-lg border border-control-border bg-surface-inset px-3 py-2 text-base md:text-sm disabled:opacity-60";
type FieldControlProps = {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-errormessage"?: string;
};
export function FormField({
  label,
  name,
  hint,
  error,
  children,
}: {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  const control = isValidElement<FieldControlProps>(children) ? children : null;
  const controlId = control?.props.id ?? name;
  const hintId = `${name}-hint`;
  const errorId = `${name}-error`;
  const describedBy = [
    control?.props["aria-describedby"],
    hint && hintId,
    error && errorId,
  ]
    .filter(Boolean)
    .join(" ");
  const field = control
    ? cloneElement(control, {
        id: controlId,
        "aria-describedby": describedBy || undefined,
        "aria-invalid": error ? true : control.props["aria-invalid"],
        "aria-errormessage": error
          ? errorId
          : control.props["aria-errormessage"],
      })
    : children;
  return (
    <div className="space-y-[var(--space-control)]">
      <Label htmlFor={controlId}>{label}</Label>
      {field}
      {hint && (
        <p id={hintId} className="text-xs leading-5 text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-body text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
