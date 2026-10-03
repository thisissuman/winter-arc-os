import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { requireAccount } from "@/lib/auth/session";
import { addDays, businessDate, parseDateQuery } from "@/lib/dates";
import { loadHabits } from "@/features/habits/queries";
import { isScheduled } from "@/features/habits/domain";
import { Completion } from "@/features/habits/completion";
import { DatePicker } from "@/features/habits/date-picker";
import { HabitEditor } from "@/features/habits/editor";
export const metadata = { title: "Today" };
export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { preferences } = await requireAccount();
  const today = businessDate(preferences.timezone);
  const chosen = parseDateQuery((await searchParams).date, today);
  const date = chosen > today ? today : chosen;
  const data = await loadHabits(date, date);
  const due = data.habits.filter((h) => isScheduled(h, data.schedules, date));
  const done = due.filter((h) =>
    data.logs.some((l) => l.habit_id === h.id && l.completed),
  ).length;
  const formatted = new Intl.DateTimeFormat("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
  return (
    <div className="mx-auto max-w-2xl">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-page font-semibold tracking-tight">Today</h1>
          <p className="mt-2 text-base text-muted-foreground">{formatted}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/today?date=${addDays(date, -1)}`}
            aria-label="Previous date"
            className="flex size-11 items-center justify-center rounded-lg border hover:bg-secondary"
          >
            <ChevronLeft size={18} />
          </Link>
          <DatePicker date={date} today={today} />
          {date < today ? (
            <Link
              href={`/today?date=${addDays(date, 1)}`}
              aria-label="Next date"
              className="flex size-11 items-center justify-center rounded-lg border hover:bg-secondary"
            >
              <ChevronRight size={18} />
            </Link>
          ) : (
            <button
              disabled
              aria-label="Next date unavailable"
              className="flex size-11 items-center justify-center rounded-lg border text-muted-foreground opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </header>
      {date !== today && (
        <Link
          href="/today"
          className="mt-4 inline-flex min-h-11 items-center text-sm text-primary underline"
        >
          Back to today
        </Link>
      )}
      {due.length > 0 && (
        <div className="mt-9">
          <p className="text-base tabular-nums" aria-live="polite">
            {done} of {due.length} done
          </p>
          <progress
            aria-label="Habit completion"
            className="habit-progress mt-3 h-1.5 w-full"
            max={due.length}
            value={done}
          />
        </div>
      )}
      <section aria-label="Your habits" className="mt-9">
        {due.length > 0 && (
          <h2 className="mb-3 text-sm text-muted-foreground">Your habits</h2>
        )}
        {due.map((habit) => {
          const log = data.logs.find((l) => l.habit_id === habit.id);
          return (
            <Completion
              key={`${habit.id}-${date}`}
              habitId={habit.id}
              name={habit.name}
              date={date}
              completed={log?.completed ?? false}
              revision={log?.revision ?? 0}
            />
          );
        })}
        {!due.length && (
          <div className="py-9">
            <h2 className="text-xl font-medium">
              {data.habits.length
                ? "Nothing scheduled"
                : "Add your first habit"}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {data.habits.length
                ? "A little room in your day. Your other dates are here when you need them."
                : "Start with 3–5 habits. A name and a schedule are all you need."}
            </p>
          </div>
        )}
        {due.length > 0 && done === due.length && (
          <p role="status" className="mt-6 text-sm text-success">
            All done. Enjoy the rest of your day.
          </p>
        )}
      </section>
      <div className="mt-7">
        {preferences.privacy_mode ? (
          <p className="text-sm text-muted-foreground">
            Privacy Mode is on. Turn it off in Settings to add a habit.
          </p>
        ) : (
          <HabitEditor
            quiet
            label={data.habits.length ? "Add a habit" : "Add your first habit"}
          />
        )}
      </div>
    </div>
  );
}
