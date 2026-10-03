import Link from "next/link";
import { Check, Minus, Circle, MoreHorizontal } from "lucide-react";
import { requireAccount } from "@/lib/auth/session";
import {
  addDays,
  businessDate,
  datesBetween,
  isoWeekday,
  monthRange,
  parseDateQuery,
  parseMonthQuery,
  weekRange,
} from "@/lib/dates";
import { loadHabits } from "@/features/habits/queries";
import {
  consistency,
  dateState,
  scheduleLabel,
  weekdayNames,
} from "@/features/habits/domain";
import { HabitEditor, HabitRemoval } from "@/features/habits/editor";
import { HistoryPicker } from "@/features/habits/date-picker";
import { Completion } from "@/features/habits/completion";
import { cn } from "@/lib/utils";
export const metadata = { title: "Habits" };
export default async function HabitsPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    archived?: string;
    month?: string;
    habit?: string;
    date?: string;
  }>;
}) {
  const params = await searchParams;
  const { preferences } = await requireAccount();
  const today = businessDate(preferences.timezone),
    history = params.view === "history",
    archived = params.archived === "true";
  const month = parseMonthQuery(params.month, today),
    range = monthRange(month);
  const candidate = parseDateQuery(
    params.date,
    month === today.slice(0, 7) ? today : range.start,
  );
  const date =
    candidate >= range.start && candidate <= range.end
      ? candidate
      : range.start;
  const week = weekRange(date, preferences.week_starts_on);
  const data = await loadHabits(
    range.start < week.start ? range.start : week.start,
    range.end > week.end ? range.end : week.end,
  );
  const selected =
    data.habits.find((h) => h.id === params.habit) ?? data.habits[0];
  const routines = data.habits.filter((h) =>
    archived ? h.archived_from !== null : h.archived_from === null,
  );
  const weekly = consistency(data, week.start, week.end, today);
  const selectedState = selected
    ? dateState(data, selected, date, today)
    : "not scheduled";
  const selectedLog = data.logs.find(
    (l) => l.habit_id === selected?.id && l.business_date === date,
  );
  function historyUrl(d: string) {
    return `/habits?view=history&habit=${selected?.id ?? ""}&month=${month}&date=${d}`;
  }
  const shift = (isoWeekday(range.start) - preferences.week_starts_on + 7) % 7;
  return (
    <div className="mx-auto max-w-2xl">
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="text-page font-semibold tracking-tight">Habits</h1>
          <p className="mt-2 text-base text-muted-foreground">
            A small routine, made yours.
          </p>
        </div>
        {!preferences.privacy_mode && (
          <div
            className={history ? "" : "habit-create-action w-full sm:w-auto"}
          >
            <HabitEditor />
          </div>
        )}
      </header>
      {preferences.privacy_mode && (
        <p role="status" className="mt-5 text-sm text-muted-foreground">
          Habit names are hidden. Turn off Privacy Mode in Settings to create or
          edit names.
        </p>
      )}
      <div className="mt-8 flex items-center justify-between gap-3 border-b">
        <nav aria-label="Habit views" className="flex gap-6">
          {[
            ["/habits", "Routines", !history],
            ["/habits?view=history", "History", history],
          ].map(([href, label, active]) => (
            <Link
              key={String(href)}
              href={String(href)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-12 items-center border-b-2 text-sm",
                active
                  ? "border-primary font-medium text-foreground"
                  : "border-transparent text-muted-foreground",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        {!history && (
          <Link
            href={archived ? "/habits" : "/habits?archived=true"}
            className="flex min-h-11 items-center rounded-lg px-3 text-sm text-muted-foreground hover:bg-secondary"
          >
            {archived ? "Show active" : "Show archived"}
          </Link>
        )}
      </div>
      {!history ? (
        <section aria-label={archived ? "Archived habits" : "Active habits"}>
          {routines.map((h) => {
            const schedule = data.schedules
              .filter((s) => s.habit_id === h.id)
              .sort((a, b) =>
                b.effective_from.localeCompare(a.effective_from),
              )[0];
            return (
              <article
                key={h.id}
                className="flex min-h-24 items-center justify-between gap-5 border-b py-5"
              >
                <div className="min-w-0">
                  <h2 className="break-words [overflow-wrap:anywhere] text-lg font-medium">
                    {h.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {schedule
                      ? scheduleLabel(schedule.weekdays)
                      : "Schedule unavailable"}
                    {schedule?.effective_from > today ? " · from tomorrow" : ""}
                  </p>
                  {h.archived_from && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Archived from {h.archived_from}
                    </p>
                  )}
                </div>
                <details className="relative shrink-0">
                  <summary
                    aria-label={`Options for ${h.name}`}
                    className="flex size-11 cursor-pointer list-none items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
                  >
                    <MoreHorizontal size={20} />
                  </summary>
                  <div className="absolute right-0 z-10 mt-1 w-52 rounded-xl border bg-card p-2 shadow-[var(--shadow-float)]">
                    {!archived && !preferences.privacy_mode && (
                      <HabitEditor
                        habit={h}
                        days={schedule?.weekdays}
                        label="Edit"
                      />
                    )}
                    {!archived && <HabitRemoval habit={h} />}
                    <Link
                      href={`/habits?view=history&habit=${h.id}`}
                      className="flex min-h-11 items-center rounded-lg px-4 text-sm hover:bg-secondary"
                    >
                      View history
                    </Link>
                    <HabitRemoval habit={h} permanent />
                  </div>
                </details>
              </article>
            );
          })}
          {!routines.length && (
            <div className="py-10">
              <h2 className="text-xl font-medium">
                {archived ? "No archived habits" : "Add your first habit"}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {archived
                  ? "Archived habits keep their history here."
                  : "A name and a schedule. That's all you need."}
              </p>
            </div>
          )}
          {!archived && (
            <p className="mt-7 text-sm text-muted-foreground">
              Start with 3–5 habits. Add more only when useful.
            </p>
          )}
        </section>
      ) : !selected ? (
        <div className="py-10">
          <h2 className="text-xl font-medium">No history yet</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Add a habit to begin. Your days will appear here.
          </p>
        </div>
      ) : (
        <section aria-label="Habit history">
          <div className="mt-7 border-b pb-6">
            <h2 className="text-sm font-medium">
              {week.start === weekRange(today, preferences.week_starts_on).start
                ? "This week"
                : "Selected week"}{" "}
              · all habits
            </h2>
            <p className="mt-2 text-lg tabular-nums">
              {weekly.scheduled
                ? `${weekly.completed} of ${weekly.scheduled} completed`
                : "No closed dates to review"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {week.start >= today ? "This week has no closed dates yet." : `Closed dates: ${week.start}–${week.end < today ? week.end : addDays(today, -1)}. Today and future dates are excluded.`}
            </p>
          </div>
          <HistoryPicker
            month={month}
            habitId={selected.id}
            habits={data.habits}
          />
          <h3 className="mt-7 text-center text-base font-medium">
            {new Intl.DateTimeFormat("en", {
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            }).format(new Date(`${range.start}T12:00:00Z`))}
          </h3>
          <div
            className="mt-4 grid grid-cols-7 gap-1 rounded-xl border bg-card p-2 text-center sm:gap-2 sm:p-4"
            aria-label={`${selected.name} calendar for ${month}`}
          >
            {Array.from(
              { length: 7 },
              (_, i) => weekdayNames[(preferences.week_starts_on - 1 + i) % 7],
            ).map((d) => (
              <div
                key={d}
                className="py-2 text-xs text-muted-foreground"
                aria-label={d}
              >
                {d.slice(0, 2)}
              </div>
            ))}
            {Array.from({ length: shift }, (_, i) => (
              <span key={`blank-${i}`} />
            ))}
            {datesBetween(range.start, range.end, 31).map((d) => {
              const state = dateState(data, selected, d, today);
              return (
                <Link
                  key={d}
                  href={historyUrl(d)}
                  aria-current={d === date ? "date" : undefined}
                  aria-label={`${d}: ${state}`}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg border text-sm",
                    d === date
                      ? "border-primary bg-selected"
                      : "border-border hover:bg-secondary",
                    state === "completed"
                      ? "text-success"
                      : state === "not scheduled" || state === "future"
                        ? "text-muted-foreground"
                        : "text-foreground",
                  )}
                >
                  <span>{Number(d.slice(-2))}</span>
                  {state === "completed" ? (
                    <Check size={14} aria-hidden="true" />
                  ) : state === "not completed" ? (
                    <span aria-hidden="true" className="text-xs">
                      ×
                    </span>
                  ) : state === "pending today" ? (
                    <Circle size={12} aria-hidden="true" />
                  ) : state === "not scheduled" ? (
                    <Minus size={12} aria-hidden="true" />
                  ) : (
                    <span aria-hidden="true" className="text-xs">
                      ·
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
          <p className="mt-4 text-xs leading-6 text-muted-foreground">
            ✓ Completed · × Not completed · ○ Pending today · − Not scheduled ·
            · Future
          </p>
          <div className="mt-7 border-t pt-6">
            <h3 className="text-base font-medium">
              {new Intl.DateTimeFormat("en", {
                weekday: "long",
                day: "numeric",
                month: "long",
                timeZone: "UTC",
              }).format(new Date(`${date}T12:00:00Z`))}
            </h3>
            <p className="mt-2 text-sm capitalize text-muted-foreground">
              {selectedState}
            </p>
            {selectedState !== "future" && selectedState !== "not scheduled" ? (
              <Completion
                key={`${selected.id}-${date}`}
                habitId={selected.id}
                name={selected.name}
                date={date}
                completed={selectedLog?.completed ?? false}
                revision={selectedLog?.revision ?? 0}
                compact
              />
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                {selectedState === "future"
                  ? "Future dates cannot be completed yet."
                  : "This habit wasn't scheduled for this date."}
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
