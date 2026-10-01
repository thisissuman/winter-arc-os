import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

export const controlClass = "min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm disabled:opacity-60";
export function FormField({ label, name, hint, error, children }: { label: string; name: string; hint?: string; error?: string; children: ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}</Label>{children}{hint && <p id={`${name}-hint`} className="text-xs leading-5 text-muted-foreground">{hint}</p>}{error && <p id={`${name}-error`} className="text-sm text-destructive">{error}</p>}</div>;
}
