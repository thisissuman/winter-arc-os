"use client";
import { useRouter } from "next/navigation";
import { isBusinessDate, isCalendarMonth } from "@/lib/dates";
export function DatePicker({ date, today }: { date: string; today: string }) {
  const router = useRouter();
  return (
    <input
      type="date"
      aria-label="Selected date"
      value={date}
      max={today}
      onChange={(event) => {
        if (isBusinessDate(event.target.value) && event.target.value <= today)
          router.push(`/today?date=${event.target.value}`);
      }}
      className="min-h-11 min-w-0 rounded-lg border border-control-border bg-card px-3 text-sm"
    />
  );
}
export function HistoryPicker({
  month,
  habitId,
  habits,
}: {
  month: string;
  habitId: string;
  habits: { id: string; name: string }[];
}) {
  const router = useRouter();
  return (
    <div className="mt-7 flex min-w-0 flex-wrap gap-3">
      <label htmlFor="history-habit" className="w-full text-sm font-medium">
        Habit
      </label>
      <select
        id="history-habit"
        aria-label="History habit"
        value={habitId}
        onChange={(e) =>
          router.push(
            `/habits?view=history&month=${month}&habit=${e.target.value}`,
          )
        }
        className="min-h-11 min-w-0 max-w-full flex-1 rounded-lg border border-control-border bg-card px-3 text-sm"
      >
        {habits.map((h) => (
          <option value={h.id} key={h.id}>
            {h.name}
          </option>
        ))}
      </select>
      <input
        aria-label="History month"
        type="month"
        value={month}
        className="min-h-11 min-w-0 max-w-full rounded-lg border border-control-border bg-card px-3 text-sm"
        onChange={(e) => {
          if (isCalendarMonth(e.target.value))
            router.push(
              `/habits?view=history&month=${e.target.value}&habit=${habitId}`,
            );
        }}
      />
    </div>
  );
}
