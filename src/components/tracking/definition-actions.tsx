"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormFeedback } from "@/components/form-feedback";
import { EditorDialog } from "./editor-dialog";
import { controlClass } from "./form-field";
import { initialFormState, type FormState } from "@/lib/auth/validation";

type FormAction = (previous: FormState, form: FormData) => Promise<FormState>;
export function DefinitionActions({ id, updatedAt, name, archived, archiveAction, deleteAction }: {
  id: string; updatedAt: string; name: string; archived: boolean; archiveAction: FormAction; deleteAction: FormAction;
}) {
  const [archiveState, archive, archiving] = useActionState(archiveAction, initialFormState);
  const [deleteState, remove, deleting] = useActionState(deleteAction, initialFormState);
  return <div className="flex flex-wrap items-start gap-2">
    {!archived && <form action={archive}><input type="hidden" name="id" value={id} /><input type="hidden" name="expectedUpdatedAt" value={updatedAt} /><Button variant="ghost" className="min-h-11 px-3" disabled={archiving}>{archiving ? "Archiving…" : "Archive"}</Button><FormFeedback state={archiveState} /></form>}
    <EditorDialog title={`Permanently delete ${name}?`} triggerLabel="Delete history" triggerVariant="ghost" description="This removes this definition, its logs, and affected challenge and scoring associations. Archived definitions retain their history.">
      <form action={remove} className="space-y-4"><input type="hidden" name="id" value={id} /><input type="hidden" name="expectedUpdatedAt" value={updatedAt} /><label className="block space-y-2 text-sm"><span>Type DELETE to confirm</span><input name="confirmation" autoComplete="off" required pattern="DELETE" className={controlClass} /></label><FormFeedback state={deleteState} /><Button variant="destructive" className="min-h-11 px-4" disabled={deleting}>{deleting ? "Deleting…" : "Permanently delete"}</Button></form>
    </EditorDialog>
  </div>;
}
