import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PanelProps = {
  as?: "section" | "article" | "div";
  children: ReactNode;
  className?: string;
  density?: "compact" | "standard";
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

export function Panel({ as: Element = "section", children, className, density = "standard", ...attributes }: PanelProps) {
  return <Element {...attributes} className={cn("min-w-0 rounded-xl border bg-card", density === "compact" ? "p-4" : "p-5 sm:p-6", className)}>{children}</Element>;
}

export function ActionRow({ children, detail, status, className }: { children: ReactNode; detail?: string; status?: string; className?: string }) {
  return <div className={cn("min-w-0 border-b border-border py-3 last:border-b-0", className)}>
    {(detail || status) && <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {detail && <p className="min-w-0 break-words">{detail}</p>}
      {status && <span className="shrink-0 capitalize">{status}</span>}
    </div>}
    {children}
  </div>;
}

export function DestinationRow({ href, title, description, icon: Icon }: { href: string; title: string; description: string; icon: LucideIcon }) {
  return <Link href={href} aria-label={title} className="group flex min-h-20 min-w-0 items-center gap-4 rounded-xl border bg-card px-4 py-3 transition-colors hover:border-selected-border hover:bg-surface-raised focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary"><Icon className="size-5" strokeWidth={1.7} aria-hidden="true" /></span>
    <span className="min-w-0 flex-1"><span className="block break-words [overflow-wrap:anywhere] font-medium text-foreground">{title}</span><span className="mt-1 block break-words text-xs leading-5 text-muted-foreground">{description}</span></span>
    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden="true" />
  </Link>;
}

export function PeriodToolbar({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return <nav aria-label={label} className={cn("flex min-w-0 flex-wrap items-center gap-2", className)}>{children}</nav>;
}

export function EmptyState({ id, title, description, actions, className }: { id: string; title: string; description: string; actions?: ReactNode; className?: string }) {
  return <Panel aria-labelledby={id} className={cn("py-6", className)}>
    <h2 id={id} className="text-section font-medium">{title}</h2>
    <p className="mt-2 max-w-2xl text-body leading-6 text-muted-foreground">{description}</p>
    {actions && <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-body">{actions}</div>}
  </Panel>;
}
