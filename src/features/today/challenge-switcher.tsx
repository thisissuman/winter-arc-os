"use client";
import { useActionState } from "react";
import { selectChallenge } from "@/features/tracking/actions";
import { initialFormState } from "@/lib/auth/validation";
import { FormFeedback } from "@/components/form-feedback";
import { controlClass } from "@/components/tracking/form-field";
export function ChallengeSwitcher({ selected, challenges }: { selected: string | null; challenges: {id:string;title:string}[] }) {
  const [state, action, pending] = useActionState(selectChallenge, initialFormState);
  return <form action={action} className="min-w-44"><label htmlFor="today-challenge" className="sr-only">Dashboard challenge</label><select id="today-challenge" name="challengeId" defaultValue={selected ?? ""} onChange={(event)=>event.currentTarget.form?.requestSubmit()} disabled={pending} className={controlClass}><option value="">Personal tracking</option>{challenges.map((challenge)=><option key={challenge.id} value={challenge.id}>{challenge.title}</option>)}</select><FormFeedback state={state} /></form>;
}
