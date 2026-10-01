"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { copyWorkout, deleteWorkout, saveExercise, saveWorkout, type FitnessState } from "./actions";
import type { Challenge, Exercise, Workout, WorkoutExercise, WorkoutSet } from "@/features/tracking/types";
import { initialFormState } from "@/lib/auth/validation";
import { FormFeedback } from "@/components/form-feedback";
import { Button } from "@/components/ui/button";
import { controlClass, FormField } from "@/components/tracking/form-field";

type SetInput = { weightKg: number; reps: number; rpe: number | null };
type ExerciseInput = { exerciseId: string; notes: string; sets: SetInput[] };
const newSet = (): SetInput => ({ weightKg: 0, reps: 8, rpe: null });

export function ExerciseForm({ exercise }: { exercise?: Exercise }) {
  const [state, action, pending] = useActionState(saveExercise, initialFormState);
  return <form action={action} className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
    <input type="hidden" name="id" value={exercise?.id ?? ""} /><input type="hidden" name="expectedUpdatedAt" value={exercise?.updated_at ?? ""} />
    <div className="min-w-40 flex-1"><FormField name={`exercise-name-${exercise?.id ?? "new"}`} label="Exercise name"><input id={`exercise-name-${exercise?.id ?? "new"}`} name="name" required maxLength={120} defaultValue={exercise?.name ?? ""} className={controlClass} /></FormField></div>
    <div className="min-w-32 flex-1"><FormField name={`exercise-group-${exercise?.id ?? "new"}`} label="Muscle group"><input id={`exercise-group-${exercise?.id ?? "new"}`} name="muscleGroup" required maxLength={80} defaultValue={exercise?.muscle_group ?? ""} className={controlClass} /></FormField></div>
    <Button disabled={pending} className="min-h-11">{pending ? "Saving…" : exercise ? "Save" : "Add exercise"}</Button>
    {exercise && <Button variant="outline" type="submit" name="archive" value="true" disabled={pending} className="min-h-11">Archive</Button>}
    <div className="basis-full"><FormFeedback state={state} /></div>
  </form>;
}

export function WorkoutEditor({ workout, childrenRows, sets, exercises, challenges, today }: {
  workout: Workout | null; childrenRows: WorkoutExercise[]; sets: WorkoutSet[]; exercises: Exercise[]; challenges: Challenge[]; today: string;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveWorkout, initialFormState as FitnessState);
  const [durationMinutes, setDurationMinutes] = useState(workout?.duration_seconds ? String(Math.round(workout.duration_seconds / 60)) : "");
  const [rows, setRows] = useState<ExerciseInput[]>(() => childrenRows.sort((a,b) => a.position-b.position).map((row) => ({
    exerciseId: row.exercise_id, notes: row.notes,
    sets: sets.filter((set) => set.workout_exercise_id === row.id).sort((a,b) => a.set_number-b.set_number).map((set) => ({ weightKg: set.weight_kg, reps: set.reps, rpe: set.rpe })),
  })));
  useEffect(() => { if (state.status === "success" && state.id) router.replace(`/fitness/workouts/${state.id}`); }, [router, state]);
  const activeExercises = exercises.filter((exercise) => !exercise.archived_at || rows.some((row) => row.exerciseId === exercise.id));
  const updateRow = (index: number, update: (current: ExerciseInput) => ExerciseInput) => setRows((current) => current.map((row, position) => position === index ? update(row) : row));
  return <form action={action} className="mt-6 space-y-5">
    <input type="hidden" name="id" value={workout?.id ?? ""} /><input type="hidden" name="expectedRevision" value={workout?.revision ?? ""} />
    <div className="grid gap-4 sm:grid-cols-2"><FormField name="workout-date" label="Workout date"><input id="workout-date" name="date" type="date" defaultValue={workout?.business_date ?? today} max={today} required className={controlClass} /></FormField><FormField name="workout-name" label="Session name"><input id="workout-name" name="name" maxLength={120} defaultValue={workout?.name ?? "Strength session"} required className={controlClass} /></FormField></div>
    <div className="grid gap-4 sm:grid-cols-3"><FormField name="workout-duration" label="Duration (minutes, optional)"><input id="workout-duration" type="number" min="1" max="1440" step="1" value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} className={controlClass} /></FormField><input type="hidden" name="durationSeconds" value={durationMinutes ? String(Number(durationMinutes) * 60) : ""} /><FormField name="workout-status" label="Status"><select id="workout-status" name="status" defaultValue={workout?.status ?? "draft"} className={controlClass}><option value="draft">Draft</option><option value="completed">Completed</option></select></FormField><FormField name="workout-challenge" label="Challenge (optional)"><select id="workout-challenge" name="challengeId" defaultValue={workout?.challenge_id ?? ""} className={controlClass}><option value="">Personal</option>{challenges.filter((challenge) => challenge.status !== "archived").map((challenge) => <option key={challenge.id} value={challenge.id}>{challenge.title}</option>)}</select></FormField></div>
    <FormField name="workout-notes" label="Session notes"><textarea id="workout-notes" name="notes" maxLength={4000} defaultValue={workout?.notes ?? ""} className={`${controlClass} min-h-20`} /></FormField>
    <section aria-labelledby="workout-exercises"><div className="flex flex-wrap items-center justify-between gap-3"><h2 id="workout-exercises" className="text-lg font-medium">Exercises and sets</h2><Button type="button" variant="outline" disabled={rows.length >= 30 || activeExercises.length === 0} onClick={() => setRows((current) => [...current, { exerciseId: activeExercises[0].id, notes: "", sets: [newSet()] }])}>Add exercise</Button></div>
      {activeExercises.length === 0 && <p className="mt-3 text-sm text-muted-foreground">Create an exercise in the workout library first.</p>}
      <div className="mt-4 space-y-4">{rows.map((row, index) => <div key={index} className="rounded-xl border bg-card p-4"><div className="flex flex-wrap items-end gap-3"><div className="min-w-40 flex-1"><FormField name={`workout-exercise-${index}`} label={`Exercise ${index + 1}`}><select id={`workout-exercise-${index}`} value={row.exerciseId} onChange={(event) => updateRow(index, (current) => ({ ...current, exerciseId: event.target.value }))} className={controlClass}>{activeExercises.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name} · {exercise.muscle_group}</option>)}</select></FormField></div><Button type="button" variant="outline" disabled={index === 0} onClick={() => setRows((current) => { const next = [...current]; [next[index-1],next[index]]=[next[index],next[index-1]]; return next; })}>Move up</Button><Button type="button" variant="outline" disabled={index === rows.length - 1} onClick={() => setRows((current) => { const next = [...current]; [next[index+1],next[index]]=[next[index],next[index+1]]; return next; })}>Move down</Button><Button type="button" variant="outline" onClick={() => setRows((current) => current.filter((_, position) => position !== index))}>Remove</Button></div>
        <div className="mt-4 space-y-2">{row.sets.map((set, setIndex) => <div key={setIndex} className="grid grid-cols-2 gap-2 sm:grid-cols-[4rem_1fr_1fr_1fr_auto] sm:items-end"><span className="col-span-2 self-center text-sm text-muted-foreground sm:col-span-1">Set {setIndex + 1}</span><label className="text-xs">Weight (kg)<input type="number" min="0" max="2000" step="any" value={set.weightKg} onChange={(event) => updateRow(index, (current) => ({ ...current, sets: current.sets.map((item, position) => position === setIndex ? { ...item, weightKg: Number(event.target.value) } : item) }))} className={controlClass} /></label><label className="text-xs">Reps<input type="number" min="1" max="1000" step="1" value={set.reps} onChange={(event) => updateRow(index, (current) => ({ ...current, sets: current.sets.map((item, position) => position === setIndex ? { ...item, reps: Number(event.target.value) } : item) }))} className={controlClass} /></label><label className="text-xs">RPE (optional)<input type="number" min="1" max="10" step="0.5" value={set.rpe ?? ""} onChange={(event) => updateRow(index, (current) => ({ ...current, sets: current.sets.map((item, position) => position === setIndex ? { ...item, rpe: event.target.value ? Number(event.target.value) : null } : item) }))} className={controlClass} /></label><Button type="button" variant="outline" disabled={row.sets.length <= 1} onClick={() => updateRow(index, (current) => ({ ...current, sets: current.sets.filter((_, position) => position !== setIndex) }))}>Remove set</Button></div>)}</div>
        <Button type="button" variant="outline" className="mt-3" disabled={row.sets.length >= 50} onClick={() => updateRow(index, (current) => ({ ...current, sets: [...current.sets, newSet()] }))}>Add set</Button>
      </div>)}</div>
    </section>
    <input type="hidden" name="exercises" value={JSON.stringify(rows)} /><FormFeedback state={state} /><Button disabled={pending} className="min-h-11">{pending ? "Saving…" : "Save workout"}</Button>
  </form>;
}

export function WorkoutActions({ workout, today }: { workout: Workout; today: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const operationId = useRef<string | null>(null);
  const [date, setDate] = useState(today);
  const copy = () => startTransition(async () => {
    operationId.current ??= crypto.randomUUID();
    const result = await copyWorkout({ sourceId: workout.id, date, operationId: operationId.current });
    if (result.ok) { operationId.current = null; router.push(`/fitness/workouts/${result.id}`); }
    else setMessage(result.message);
  });
  const remove = () => {
    if (!window.confirm("Permanently delete this workout and its sets?")) return;
    startTransition(async () => { const result = await deleteWorkout({ id: workout.id, expectedRevision: workout.revision }); if (result.ok) router.push("/fitness/workouts"); else setMessage(result.message); });
  };
  return <div className="mt-5 rounded-xl border bg-card p-4"><p className="text-sm font-medium">Copy this session</p><p className="mt-1 text-xs text-muted-foreground">A copy starts as a draft and does not count toward gym frequency until completed.</p><div className="mt-3 flex flex-wrap items-end gap-2"><label className="text-xs">Copy to date<input type="date" value={date} max={today} onChange={(event) => { setDate(event.target.value); operationId.current = null; }} className={controlClass} /></label><Button type="button" variant="outline" disabled={pending} onClick={copy}>Copy workout</Button><Button type="button" variant="outline" disabled={pending} onClick={remove}>Delete workout</Button></div>{message && <p role="alert" className="mt-3 text-sm text-destructive">{message}</p>}</div>;
}
