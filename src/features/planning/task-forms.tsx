"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormFeedback } from "@/components/form-feedback";
import { controlClass, FormField } from "@/components/tracking/form-field";
import { initialFormState } from "@/lib/auth/validation";
import type { Challenge, TrackingCategory } from "@/features/tracking/types";
import type { PlanningGoal, PlanningTask, TaskStatus } from "./types";
import { carryPlanningTasks, movePlanningTask, savePlanningTask, setPlanningTaskStatus, type PlanningState } from "./actions";

type TaskChoices = { categories: TrackingCategory[]; goals: PlanningGoal[]; challenges: Challenge[] };
export function TaskForm({ task, date, choices }: { task?: PlanningTask; date: string; choices: TaskChoices }) {
  const [state, action, pending] = useActionState(savePlanningTask, initialFormState as PlanningState);
  const id = task?.id ?? "new";
  return <form action={action} className="space-y-4 rounded-xl border bg-card p-5">
    <input type="hidden" name="id" value={task?.id ?? ""} /><input type="hidden" name="expectedRevision" value={task?.revision ?? ""} />
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField name={`task-title-${id}`} label="Task"><input id={`task-title-${id}`} name="title" required maxLength={160} defaultValue={task?.title ?? ""} className={controlClass} /></FormField>
      <FormField name={`task-date-${id}`} label="Plan for"><input id={`task-date-${id}`} name="date" type="date" required defaultValue={task?.business_date ?? date} className={controlClass} /></FormField>
    </div>
    <FormField name={`task-notes-${id}`} label="Notes (optional)"><textarea id={`task-notes-${id}`} name="notes" maxLength={4000} defaultValue={task?.notes ?? ""} className={`${controlClass} min-h-20`} /></FormField>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <FormField name={`task-status-${id}`} label="Status"><select id={`task-status-${id}`} name="status" defaultValue={task?.status ?? "todo"} className={controlClass}><option value="todo">To do</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select></FormField>
      <FormField name={`task-priority-${id}`} label="Priority"><select id={`task-priority-${id}`} name="priority" defaultValue={task?.priority ?? "normal"} className={controlClass}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option></select></FormField>
      <FormField name={`task-estimate-${id}`} label="Estimate (minutes)"><input id={`task-estimate-${id}`} name="estimatedMinutes" type="number" min="0" max="10080" step="1" defaultValue={task?.estimated_seconds == null ? "" : task.estimated_seconds / 60} className={controlClass} /></FormField>
      <FormField name={`task-actual-${id}`} label="Actual (minutes)"><input id={`task-actual-${id}`} name="actualMinutes" type="number" min="0" max="10080" step="1" defaultValue={task?.actual_seconds == null ? "" : task.actual_seconds / 60} className={controlClass} /></FormField>
    </div>
    <div className="grid gap-4 sm:grid-cols-3">
      <FormField name={`task-category-${id}`} label="Category (optional)"><select id={`task-category-${id}`} name="categoryId" defaultValue={task?.category_id ?? ""} className={controlClass}><option value="">None</option>{choices.categories.filter((item) => !item.archived_at || item.id === task?.category_id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></FormField>
      <FormField name={`task-goal-${id}`} label="Goal (optional)"><select id={`task-goal-${id}`} name="goalId" defaultValue={task?.goal_id ?? ""} className={controlClass}><option value="">None</option>{choices.goals.filter((item) => item.status !== "archived" || item.id === task?.goal_id).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></FormField>
      <FormField name={`task-challenge-${id}`} label="Challenge (optional)"><select id={`task-challenge-${id}`} name="challengeId" defaultValue={task?.challenge_id ?? ""} className={controlClass}><option value="">Personal</option>{choices.challenges.filter((item) => item.status !== "archived" || item.id === task?.challenge_id).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></FormField>
    </div>
    <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="isPrivate" defaultChecked={task?.is_private ?? true} className="size-4 accent-primary" />Private task</label>
    <div className="flex flex-wrap gap-2"><Button className="min-h-11" disabled={pending}>{pending ? "Saving…" : task ? "Save task" : "Add task"}</Button>{task && <Button type="submit" name="delete" value="true" variant="destructive" className="min-h-11" disabled={pending} onClick={(event) => { if (!window.confirm("Delete this task?")) event.preventDefault(); }}>Delete task</Button>}</div>
    <FormFeedback state={state} />
  </form>;
}

export function TaskRow({ task, canMoveUp, canMoveDown, showEditor, choices }: { task: PlanningTask; canMoveUp: boolean; canMoveDown: boolean; showEditor: boolean; choices: TaskChoices }) {
  const router = useRouter();
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const changeStatus = (next: TaskStatus) => {
    const previous = status;
    setStatus(next);
    setMessage("");
    startTransition(async () => {
      try {
        const result = await setPlanningTaskStatus({ id: task.id, status: next, expectedRevision: task.revision });
        if (!result.ok) { setStatus(previous); setMessage(result.message); } else { setStatus(result.data.status); setMessage("Task status saved."); router.refresh(); }
      } catch { setStatus(previous); setMessage("Could not save. Check your connection and retry."); }
    });
  };
  const reorder = (direction: "up" | "down") => startTransition(async () => {
    try {
      const result = await movePlanningTask({ id: task.id, direction, expectedRevision: task.revision });
      if (!result.ok) setMessage(result.message); else { setMessage("Order saved."); router.refresh(); }
    } catch { setMessage("Could not reorder. Check your connection and retry."); }
  });
  return <article className="rounded-xl border bg-card p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><h3 className="break-words font-medium">{task.title}</h3><p className="mt-1 text-xs text-muted-foreground">{task.priority} priority{task.estimated_seconds != null ? ` · estimate ${Math.round(task.estimated_seconds / 60)} min` : ""}{task.actual_seconds != null ? ` · actual ${Math.round(task.actual_seconds / 60)} min` : ""}</p></div><div className="flex shrink-0 gap-1"><Button type="button" variant="outline" className="size-11 p-0" disabled={pending || !canMoveUp} onClick={() => reorder("up")} aria-label={`Move ${task.title} up`}><ArrowUp className="size-4" /></Button><Button type="button" variant="outline" className="size-11 p-0" disabled={pending || !canMoveDown} onClick={() => reorder("down")} aria-label={`Move ${task.title} down`}><ArrowDown className="size-4" /></Button></div></div>
    {task.notes && <p className="mt-2 break-words text-sm text-muted-foreground">{task.notes}</p>}
    <label className="mt-3 flex max-w-48 flex-col gap-1 text-xs text-muted-foreground">Status<select value={status} onChange={(event) => changeStatus(event.target.value as TaskStatus)} disabled={pending} className={controlClass}><option value="todo">To do</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select></label>
    {message && <p role={message.startsWith("Could not") || message.includes("changed") ? "alert" : "status"} className="mt-2 text-xs text-muted-foreground">{message}</p>}
    {showEditor && <details className="mt-4"><summary className="cursor-pointer text-sm text-primary">Edit task</summary><div className="mt-3"><TaskForm key={`${task.id}-${task.revision}`} task={task} date={task.business_date} choices={choices} /></div></details>}
  </article>;
}

export function CarryForm({ sourceDate, targetDate, operationId, count }: { sourceDate: string; targetDate: string; operationId: string; count: number }) {
  const [state, action, pending] = useActionState(carryPlanningTasks, initialFormState as PlanningState);
  return <form action={action} className="space-y-4 rounded-xl border bg-card p-5"><input type="hidden" name="operationId" value={operationId} /><input type="hidden" name="sourceDate" value={sourceDate} />
    <div><h2 className="font-medium">Carry unfinished work</h2><p className="mt-1 text-sm text-muted-foreground">{count} unfinished {count === 1 ? "task" : "tasks"} on {sourceDate}. Completed tasks stay here. Move changes the date; copy keeps the originals.</p></div>
    <div className="flex flex-wrap items-end gap-3"><div className="min-w-48"><FormField name="carry-target-date" label="Later date"><input id="carry-target-date" name="targetDate" type="date" min={targetDate} defaultValue={targetDate} required className={controlClass} /></FormField></div><Button name="mode" value="move" className="min-h-11" disabled={pending || count === 0}>{pending ? "Saving…" : "Move unfinished"}</Button><Button name="mode" value="copy" variant="outline" className="min-h-11" disabled={pending || count === 0}>{pending ? "Saving…" : "Copy unfinished"}</Button></div>
    <FormFeedback state={state} />
  </form>;
}
