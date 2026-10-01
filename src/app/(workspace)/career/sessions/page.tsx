import Link from "next/link";
import { PageHeader } from "@/components/tracking/page-header";
import { TrackingUnavailable } from "@/components/tracking/tracking-unavailable";
import { StudyCategoryForm, StudySessionForm } from "@/features/career/career-forms";
import { loadTrackingSnapshot, TrackingSetupError } from "@/features/tracking/queries";

export const metadata = { title: "Study sessions" };
export default async function StudySessionsPage() {
  let snapshot;
  try { snapshot = await loadTrackingSnapshot(); } catch (error) { if (error instanceof TrackingSetupError) return <TrackingUnavailable />; throw error; }
  const sessions = [...snapshot.studySessions].sort((a, b) => b.business_date.localeCompare(a.business_date) || b.created_at.localeCompare(a.created_at));
  return <><PageHeader title="Study sessions" description="Manual and timer sessions share one history; timestamps retain their original timezone." /><Link href="/career" className="mt-5 inline-block text-sm text-primary underline">← Career overview</Link>
    <section className="mt-7" aria-labelledby="study-history"><h2 id="study-history" className="text-xl font-medium">History</h2>{sessions.length === 0 ? <p className="mt-4 rounded-xl border bg-card p-5 text-sm text-muted-foreground">No sessions recorded yet. Add a study category, then log a session or start the timer.</p> : <div className="mt-4 space-y-4">{sessions.map((session) => <article key={session.id} className="rounded-xl border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-medium">{snapshot.privacyMode ? "Private study session" : session.topic || snapshot.studyCategories.find((category) => category.id === session.study_category_id)?.name || "Study session"}</h3><p className="mt-1 text-sm text-muted-foreground">{session.business_date} · {Math.round(session.duration_seconds / 60)} min · {session.source}</p></div></div>{!snapshot.privacyMode && session.notes && <p className="mt-3 text-sm text-muted-foreground">{session.notes}</p>}{session.source === "manual" && !snapshot.privacyMode && <details className="mt-4"><summary className="cursor-pointer text-sm text-primary">Edit manual session</summary><div className="mt-4"><StudySessionForm session={session} categories={snapshot.studyCategories} challenges={snapshot.challenges} today={snapshot.today} privacyMode={false} /></div></details>}</article>)}</div>}</section>
    <section className="mt-9" aria-labelledby="study-category-list"><h2 id="study-category-list" className="text-xl font-medium">Manage study categories</h2>{snapshot.privacyMode ? <p className="mt-3 text-sm text-muted-foreground">Category names and editing are hidden in Privacy Mode.</p> : <div className="mt-4 space-y-3"><StudyCategoryForm generalCategories={snapshot.categories} />{snapshot.studyCategories.filter((category) => !category.archived_at).map((category) => <StudyCategoryForm key={category.id} studyCategory={category} generalCategories={snapshot.categories} />)}</div>}</section>
  </>;
}
