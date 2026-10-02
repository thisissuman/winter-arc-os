"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ResponsiveEditorProps = {
  title: string; description?: string; triggerLabel: string;
  triggerAriaLabel?: string; triggerClassName?: string;
  triggerVariant?: "default" | "outline" | "ghost" | "destructive";
  children: ReactNode;
};

export function ResponsiveEditor({ title, description, triggerLabel, triggerAriaLabel, triggerClassName, triggerVariant = "outline", children }: ResponsiveEditorProps) {
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
      className="responsive-editor-dialog fixed inset-x-0 top-auto bottom-0 m-0 max-h-[90dvh] w-full max-w-none overflow-hidden rounded-t-2xl border bg-surface-raised p-0 text-foreground shadow-[var(--shadow-float)] backdrop:bg-black/60 sm:inset-0 sm:m-auto sm:max-h-[85dvh] sm:max-w-xl sm:rounded-xl"
      onClose={() => { setOpen(false); trigger.current?.focus(); }}
      onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
      <header className="relative shrink-0 border-b px-[var(--space-panel-lg)] py-4 pr-16 sm:px-[var(--space-section)] sm:pr-20"><h2 id={titleId} className="break-words text-section font-semibold tracking-tight">{title}</h2>{description && <p id={descriptionId} className="mt-2 break-words text-sm leading-6 text-muted-foreground">{description}</p>}
        <Button type="button" variant="ghost" className="absolute top-3 right-3 size-11 sm:right-5" onClick={close} aria-label="Close editor"><X aria-hidden="true" /></Button>
      </header>
      <div className="responsive-editor-body min-h-0 overflow-y-auto overscroll-contain p-[var(--space-panel-lg)] sm:p-[var(--space-section)]">
        {children}
      </div>
    </dialog>
  </>;
}

export { ResponsiveEditor as EditorDialog };

export function Confirmation({ description, ...props }: ResponsiveEditorProps & { description: string }) {
  return <ResponsiveEditor {...props} description={description} triggerVariant={props.triggerVariant ?? "ghost"} />;
}
