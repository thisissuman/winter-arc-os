import Link from "next/link";
import { PageHeader } from "@/components/tracking/page-header";
import { TrackingUnavailable } from "@/components/tracking/tracking-unavailable";
import { ExerciseForm } from "@/features/fitness/workout-editor";
import { exerciseProgression } from "@/features/fitness/domain";
import { TrendChart } from "@/features/fitness/trend-chart";
import { loadTrackingSnapshot, TrackingSetupError } from "@/features/tracking/queries";

export const metadata = { title: "Workouts" };
export default async function WorkoutsPage() {
  let snapshot;
  try { snapshot = await loadTrackingSnapshot(); } catch (error) { if (error instanceof TrackingSetupError) return <TrackingUnavailable />; throw error; }
  const workouts = [...snapshot.workouts].sort((a, b) => b.business_date.localeCompare(a.business_date) || b.created_at.localeCompare(a.created_at));
  const exercises = [...snapshot.exercises].sort((a, b) => a.name.localeCompare(b.name));
  const masked = snapshot.privacyMode;
  return <>
    <PageHeader title="Workouts" description="Reusable exercises, independent sessions, and real set history." actions={<Link href="/fitness/workouts/new" className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">New workout</Link>} />
    <Link href="/fitness" className="mt-5 inline-block text-sm text-primary underline">← Fitness overview</Link>
    <section className="mt-7" aria-labelledby="workout-history"><h2 id="workout-history" className="text-xl font-medium">Session history</h2>{workouts.length === 0 ? <p className="mt-4 rounded-xl border bg-card p-5 text-sm text-muted-foreground">No workouts recorded yet. Create an exercise, then log your first session.</p> : <div className="mt-4 grid gap-3 lg:grid-cols-2">{workouts.map((workout) => <Link key={workout.id} href={`/fitness/workouts/${workout.id}`} className="rounded-xl border bg-card p-5 hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"><div className="flex justify-between gap-3"><h3 className="min-w-0 break-words [overflow-wrap:anywhere] font-medium">{masked ? "Private workout" : workout.name}</h3><span className="text-xs capitalize text-muted-foreground">{workout.status}</span></div><p className="mt-2 text-sm tabular-nums text-muted-foreground">{workout.business_date} · {workout.duration_seconds ? `${Math.round(workout.duration_seconds / 60)} min` : "Duration not entered"} · {snapshot.workoutExercises.filter((row) => row.workout_id === workout.id).length} exercises</p></Link>)}</div>}</section>
    <section className="mt-9" aria-labelledby="exercise-library"><h2 id="exercise-library" className="text-xl font-medium">Exercise library</h2><p className="mt-1 text-sm text-muted-foreground">Exercise identities stay stable across sessions so progression remains comparable.</p>{!masked ? <div className="mt-4"><ExerciseForm /></div> : <p className="mt-4 text-sm text-muted-foreground">Turn off Privacy Mode in Settings to manage exercise names.</p>}
      <div className="mt-4 space-y-4">{exercises.filter((exercise) => !exercise.archived_at).map((exercise) => { const history = exerciseProgression(snapshot, exercise.id); const latest = history.at(-1); return <article key={exercise.id} className="rounded-xl border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="min-w-0 break-words [overflow-wrap:anywhere] font-medium">{masked ? "Private exercise" : exercise.name}</h3><p className="mt-1 text-xs text-muted-foreground">{masked ? "Muscle group hidden" : exercise.muscle_group} · {history.length} completed sessions{latest && !masked ? ` · latest best ${latest.bestWeightKg} kg × ${latest.bestReps} reps` : ""}</p></div></div>{!masked && history.length > 0 && <div className="mt-4"><TrendChart points={history.map((entry) => ({ date: entry.date, value: entry.bestWeightKg }))} unit="kg" label={`${exercise.name} best set weight`} /><details className="mt-2 text-sm"><summary className="cursor-pointer text-primary">Set history</summary><ul className="mt-2 space-y-1 text-muted-foreground">{history.map((entry) => <li key={entry.workoutId}>{entry.date}: {entry.bestWeightKg} kg, {entry.bestReps} best reps, {entry.sets} sets</li>)}</ul></details></div>}{!masked && <div className="mt-4"><ExerciseForm exercise={exercise} /></div>}</article>; })}</div>
    </section>
  </>;
}
