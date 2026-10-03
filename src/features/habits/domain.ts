import { datesBetween, isoWeekday } from "@/lib/dates";
import type { Habit, HabitData, HabitSchedule, DateState } from "./types";
export function isScheduled(
  habit: Habit,
  schedules: HabitSchedule[],
  date: string,
): boolean {
  if (
    date < habit.active_from ||
    (habit.archived_from && date >= habit.archived_from)
  )
    return false;
  const applicable = schedules.filter(
    (s) =>
      s.habit_id === habit.id &&
      s.effective_from <= date &&
      (!s.effective_until || date < s.effective_until),
  );
  if (applicable.length !== 1)
    throw new Error(
      "The habit schedule could not be loaded. Reload and try again.",
    );
  return applicable[0].weekdays.includes(isoWeekday(date));
}
export function dateState(
  data: HabitData,
  habit: Habit,
  date: string,
  today: string,
): DateState {
  if (!isScheduled(habit, data.schedules, date)) return "not scheduled";
  if (date > today) return "future";
  if (
    data.logs.some(
      (l) => l.habit_id === habit.id && l.business_date === date && l.completed,
    )
  )
    return "completed";
  return date === today ? "pending today" : "not completed";
}
export function consistency(
  data: HabitData,
  start: string,
  end: string,
  today: string,
) {
  let completed = 0,
    scheduled = 0;
  for (const date of datesBetween(start, end, 7)) {
    if (date >= today) continue;
    for (const habit of data.habits)
      if (isScheduled(habit, data.schedules, date)) {
        scheduled++;
        if (
          data.logs.some(
            (l) =>
              l.habit_id === habit.id &&
              l.business_date === date &&
              l.completed,
          )
        )
          completed++;
      }
  }
  return { completed, scheduled };
}
export const weekdayNames = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
export function scheduleLabel(days: number[]) {
  return days.length === 7
    ? "Daily"
    : days.map((d) => weekdayNames[d - 1].slice(0, 3)).join(" · ");
}
export function maskHabits(habits: Habit[], privacy: boolean): Habit[] {
  return habits.map((habit, index) => ({
    ...habit,
    name: privacy ? `Habit ${index + 1}` : habit.name,
  }));
}
