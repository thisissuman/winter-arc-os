import type { ReactNode } from "react";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return <header className="flex flex-wrap items-end justify-between gap-5 border-b pb-7">
    <div className="min-w-0"><h1 className="text-3xl font-semibold tracking-[-0.03em]">{title}</h1>{description && <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>}</div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </header>;
}
