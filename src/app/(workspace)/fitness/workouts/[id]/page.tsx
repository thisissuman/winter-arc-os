import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/tracking/page-header";
import { TrackingUnavailable } from "@/components/tracking/tracking-unavailable";
import { WorkoutActions, WorkoutEditor } from "@/features/fitness/workout-editor";
import { loadTrackingSnapshot, TrackingSetupError } from "@/features/tracking/queries";

export const metadata = { title: "Workout editor" };
export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let snapshot;
  try { snapshot = await loadTrackingSnapshot(); } catch (error) { if (error instanceof TrackingSetupError) return <TrackingUnavailable />; throw error; }
  const workout = id === "new" ? null : snapshot.workouts.find((item) => item.id === id) ?? notFound();
  if (snapshot.privacyMode) return <><PageHeader title="Private workout" description="Workout details and editing are hidden in Privacy Mode." /><Link href="/settings/tracking" className="mt-5 inline-block text-primary underline">Open privacy settings</Link></>;
  const rows = workout ? snapshot.workoutExercises.filter((row) => row.workout_id === workout.id) : [];
  const sets = snapshot.workoutSets.filter((set) => rows.some((row) => row.id === set.workout_exercise_id));
  return <>
    <PageHeader title={workout ? workout.name : "New workout"} description={workout ? `${workout.business_date} · ${workout.status}` : "Create a draft or completed session with real sets."} />
    <Link href="/fitness/workouts" className="mt-5 inline-block text-sm text-primary underline">← Workout history</Link>
    <WorkoutEditor key={workout?.id ?? "new"} workout={workout} childrenRows={rows} sets={sets} exercises={snapshot.exercises} challenges={snapshot.challenges} today={snapshot.today} />
    {workout && <WorkoutActions workout={workout} today={snapshot.today} />}
  </>;
}
