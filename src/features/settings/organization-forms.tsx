"use client";

import { useActionState, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormFeedback } from "@/components/form-feedback";
import { controlClass, FormField } from "@/components/tracking/form-field";
import { initialFormState } from "@/lib/auth/validation";
import type { Database } from "@/types/database";
import { saveOrganization, type OrganizationState } from "./organization-actions";

import { submitSettingsAction } from "./safe-action";

type Area = Database["public"]["Tables"]["life_areas"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
export function OrganizationForm({ kind, record, areas }: { kind: "area" | "category"; record?: Area | Category; areas: Area[] }) {
  const [state, action, pending] = useActionState((previous: OrganizationState, form: FormData) => submitSettingsAction(saveOrganization, previous, form), initialFormState as OrganizationState);
  const id = useId();
  const [name, setName] = useState(record?.name ?? "");
  const [position, setPosition] = useState(String(record?.position ?? 0));
  const [areaId, setAreaId] = useState(record && "life_area_id" in record ? record.life_area_id ?? "" : "");
  return <form action={action} className="space-y-4 rounded-xl border bg-card p-5">
    <input type="hidden" name="kind" value={kind} /><input type="hidden" name="id" value={record?.id ?? ""} />
    <input type="hidden" name="expectedUpdatedAt" value={state.updatedAt ?? record?.updated_at ?? ""} />
    <input type="hidden" name="archived" value={record?.archived_at ? "true" : "false"} />
    <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
      <FormField name={id + "-name"} label={kind === "area" ? "Life area name" : "Category name"}><input id={id + "-name"} name="name" required maxLength={80} value={name} onChange={event => setName(event.target.value)} disabled={pending} className={controlClass} /></FormField>
      <FormField name={id + "-position"} label="Order"><input id={id + "-position"} name="position" type="number" min="0" max="2000000000" step="1" value={position} onChange={event => setPosition(event.target.value)} disabled={pending} className={controlClass} /></FormField>
    </div>
    {kind === "category" ? <FormField name={id + "-parent"} label="Life area (optional)"><select id={id + "-parent"} name="areaId" value={areaId} onChange={event => setAreaId(event.target.value)} disabled={pending} className={controlClass}><option value="">None</option>{areas.map(area => <option key={area.id} value={area.id}>{area.name}{area.archived_at ? " (archived)" : ""}</option>)}</select></FormField> : <input type="hidden" name="areaId" value="" />}
    <div className="flex flex-wrap gap-3"><Button name="intent" value="save" disabled={pending} className="min-h-11">{pending ? "Saving…" : record ? "Save changes" : kind === "area" ? "Add life area" : "Add category"}</Button>
      {record && <Button name="intent" value={record.archived_at ? "restore" : "archive"} variant="outline" className="min-h-11" disabled={pending}>{record.archived_at ? "Restore" : "Archive"}</Button>}
    </div>
    <FormFeedback state={state} />
  </form>;
}
