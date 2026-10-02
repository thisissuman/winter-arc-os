import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions, compact = false }: { title: string; description?: string; actions?: ReactNode; compact?: boolean }) {
  return <header className={cn("flex flex-wrap items-end justify-between border-b", compact ? "gap-3 pb-4" : "gap-[var(--space-panel-lg)] pb-[var(--space-panel-lg)]")}>
    <div className="min-w-0"><h1 className={cn("break-words [overflow-wrap:anywhere] font-semibold tracking-[-0.03em]", compact ? "text-2xl md:text-page" : "text-page")}>{title}</h1>{description && <p className={cn("max-w-xl break-words text-body leading-6 text-muted-foreground", compact ? "mt-1" : "mt-[var(--space-row)]")}>{description}</p>}</div>
    {actions && <div className="flex max-w-full flex-wrap gap-2">{actions}</div>}
  </header>;
}

export function SectionHeader({ id, title, description, actions, className }: { id: string; title: string; description?: string; actions?: ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
    <div className="min-w-0"><h2 id={id} className="break-words [overflow-wrap:anywhere] text-section font-medium">{title}</h2>{description && <p className="mt-1 break-words text-body text-muted-foreground">{description}</p>}</div>
    {actions && <div className="flex min-h-11 max-w-full flex-wrap items-center gap-2 text-body">{actions}</div>}
  </div>;
}
