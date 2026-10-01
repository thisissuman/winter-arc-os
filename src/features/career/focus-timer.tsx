"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { controlClass, FormField } from "@/components/tracking/form-field";
import type { Challenge, FocusTimer, StudyCategory } from "@/features/tracking/types";
import { controlFocusTimer, readActiveTimer, startFocusTimer } from "./actions";

function elapsed(timer: FocusTimer, now: number): number {
  const running = timer.status === "running" && timer.running_since && now ? Math.max(0, Math.floor((now - Date.parse(timer.running_since)) / 1000)) : 0;
  return timer.accumulated_seconds + running;
}
function formatElapsed(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  const remainder = seconds % 60;
  return [hours, minutes, remainder].map((part) => String(part).padStart(2, "0")).join(":");
}
function announceChange() {
  window.dispatchEvent(new Event("winter-arc-timer-change"));
  if ("BroadcastChannel" in window) { const channel = new BroadcastChannel("winter-arc-timer"); channel.postMessage("changed"); channel.close(); }
}

function useLiveTimer(initial: FocusTimer | null) {
  const [timer, setTimer] = useState(initial);
  const [now, setNow] = useState(0);
  const sync = useCallback(async () => { try { setTimer(await readActiveTimer()); } catch { /* Keep the last confirmed timer visible during a transient connection failure. */ } }, []);
  useEffect(() => {
    const firstTick = window.setTimeout(() => setNow(Date.now()), 0);
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    const poll = window.setInterval(sync, 30000);
    const onFocus = () => { if (document.visibilityState === "visible") void sync(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("winter-arc-timer-change", onFocus);
    const channel = "BroadcastChannel" in window ? new BroadcastChannel("winter-arc-timer") : null;
    if (channel) channel.onmessage = onFocus;
    return () => { window.clearTimeout(firstTick); window.clearInterval(tick); window.clearInterval(poll); window.removeEventListener("focus", onFocus); document.removeEventListener("visibilitychange", onFocus); window.removeEventListener("winter-arc-timer-change", onFocus); channel?.close(); };
  }, [sync]);
  return { timer, setTimer, now, sync };
}

export function PersistentTimerBar({ initialTimer }: { initialTimer: FocusTimer | null }) {
  const { timer, now } = useLiveTimer(initialTimer);
  if (!timer) return null;
  return <div className="fixed inset-x-0 bottom-18 z-20 border-t bg-card/95 px-4 py-2 backdrop-blur md:bottom-0 md:left-60" role="status" aria-label="Active focus timer"><div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4"><p className="truncate text-sm"><span className="font-medium">Focus timer</span> · {timer.status === "paused" ? "Paused" : "Running"} · <span className="tabular-nums">{now ? formatElapsed(elapsed(timer, now)) : "—"}</span></p><Link href="/career" className="shrink-0 text-sm text-primary underline">Open timer</Link></div></div>;
}

export function FocusTimerPanel({ initialTimer, categories, challenges, privacyMode }: { initialTimer: FocusTimer | null; categories: StudyCategory[]; challenges: Challenge[]; privacyMode: boolean }) {
  const { timer, setTimer, now, sync } = useLiveTimer(initialTimer);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [categoryId, setCategoryId] = useState(categories.find((category) => !category.archived_at)?.id ?? "");
  const [challengeId, setChallengeId] = useState("");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const activeCategories = categories.filter((category) => !category.archived_at);
  const control = (action: "pause" | "resume" | "finish" | "discard") => {
    if (!timer) return;
    if (action === "discard" && !window.confirm("Discard this timer without logging study time?")) return;
    if (action === "finish" && elapsed(timer, Date.now()) > 4 * 3600 && !window.confirm("This timer exceeds four hours. Review the elapsed time and save it as recorded?")) return;
    startTransition(async () => {
      const result = await controlFocusTimer({ id: timer.id, action, expectedRevision: timer.revision });
      if (result.ok) { setTimer(result.timer.status === "running" || result.timer.status === "paused" ? result.timer : null); setMessage(action === "finish" ? "Study session saved." : action === "discard" ? "Timer discarded." : action === "pause" ? "Timer paused." : "Timer resumed."); announceChange(); }
      else { setMessage(result.message); await sync(); }
    });
  };
  return <section className="rounded-xl border bg-card p-5" aria-labelledby="focus-timer-heading"><h2 id="focus-timer-heading" className="text-lg font-medium">Focus timer</h2><p className="mt-1 text-sm text-muted-foreground">The server keeps the timer running across refreshes and tabs. Finishing saves one study session.</p>
    {timer ? <div className="mt-5 space-y-4"><div className="flex flex-wrap items-baseline justify-between gap-3"><p className="text-3xl font-semibold tabular-nums" aria-label="Elapsed focus time">{now ? formatElapsed(elapsed(timer, now)) : "—"}</p><span className="text-xs capitalize text-muted-foreground">{timer.status}</span></div>{!privacyMode && <p className="text-sm text-muted-foreground">{categories.find((category) => category.id === timer.study_category_id)?.name ?? "Study"}{timer.topic ? ` · ${timer.topic}` : ""}</p>}<div className="flex flex-wrap gap-2">{timer.status === "running" ? <Button type="button" variant="outline" disabled={pending} onClick={() => control("pause")}>Pause</Button> : <Button type="button" variant="outline" disabled={pending} onClick={() => control("resume")}>Resume</Button>}<Button type="button" disabled={pending} onClick={() => control("finish")}>Finish and save</Button><Button type="button" variant="outline" disabled={pending} onClick={() => control("discard")}>Discard</Button></div></div> : privacyMode ? <p className="mt-5 text-sm text-muted-foreground">Turn off Privacy Mode to start a focus timer.</p> : <div className="mt-5 space-y-4"><div className="grid gap-4 sm:grid-cols-2"><FormField name="timer-category" label="Study category"><select id="timer-category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} disabled={privacyMode} className={controlClass}>{activeCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></FormField><FormField name="timer-challenge" label="Challenge (optional)"><select id="timer-challenge" value={challengeId} onChange={(event) => setChallengeId(event.target.value)} disabled={privacyMode} className={controlClass}><option value="">Personal</option>{challenges.filter((challenge) => challenge.status !== "archived").map((challenge) => <option key={challenge.id} value={challenge.id}>{challenge.title}</option>)}</select></FormField></div>{!privacyMode && <><FormField name="timer-topic" label="Topic (optional)"><input id="timer-topic" value={topic} onChange={(event) => setTopic(event.target.value)} maxLength={200} className={controlClass} /></FormField><FormField name="timer-notes" label="Notes (optional)"><textarea id="timer-notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={4000} className={`${controlClass} min-h-20`} /></FormField></>}<Button type="button" disabled={pending || privacyMode || !categoryId} onClick={() => startTransition(async () => { const result = await startFocusTimer({ categoryId, challengeId, topic, notes }); if (result.ok) { setTimer(result.timer); setMessage("Timer started and saved."); announceChange(); } else { setMessage(result.message); await sync(); } })}>Start focus timer</Button>{activeCategories.length === 0 && <p className="text-sm text-muted-foreground">Add a study category before starting.</p>}{privacyMode && <p className="text-sm text-muted-foreground">Turn off Privacy Mode to create a timer with a category.</p>}</div>}
    {message && <p role={message.includes("Could not") || message.includes("changed") ? "alert" : "status"} className="mt-4 text-sm text-muted-foreground">{message}</p>}
  </section>;
}
