"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EditorDialog({ title, description, triggerLabel, triggerAriaLabel, triggerClassName, triggerVariant = "outline", children }: {
  title: string; description?: string; triggerLabel: string;
  triggerAriaLabel?: string; triggerClassName?: string;
  triggerVariant?: "default" | "outline" | "ghost" | "destructive";
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [open, setOpen] = useState(false);
  function close() { dialog.current?.close(); }
  return <>
    <Button ref={trigger} type="button" variant={triggerVariant} className={triggerClassName ?? "min-h-11 px-4"} aria-label={triggerAriaLabel} aria-haspopup="dialog" aria-expanded={open} onClick={() => {
      dialog.current?.showModal(); setOpen(true);
    }}>{triggerLabel}</Button>
    <dialog ref={dialog} aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined}
      className="fixed inset-x-0 top-auto bottom-0 m-0 max-h-[90dvh] w-full max-w-none overflow-y-auto rounded-t-2xl border bg-card p-0 text-foreground backdrop:bg-black/60 sm:inset-0 sm:m-auto sm:max-h-[85dvh] sm:max-w-xl sm:rounded-xl"
      onClose={() => { setOpen(false); trigger.current?.focus(); }}
      onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div className="relative p-6 sm:p-8">
        <header className="mb-6 pr-12"><h2 id={titleId} className="text-xl font-semibold tracking-tight">{title}</h2>{description && <p id={descriptionId} className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>}</header>
        <Button type="button" variant="ghost" className="absolute top-4 right-4 size-11" onClick={close} aria-label="Close editor"><X aria-hidden="true" /></Button>
        {children}
      </div>
    </dialog>
  </>;
}
