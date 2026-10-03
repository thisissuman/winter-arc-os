export type Habit = {
  id: string;
  name: string;
  active_from: string;
  archived_from: string | null;
  revision: number;
};
export type HabitSchedule = {
  habit_id: string;
  weekdays: number[];
  effective_from: string;
  effective_until: string | null;
};
export type HabitLog = {
  habit_id: string;
  business_date: string;
  completed: boolean;
  revision: number;
};
export type HabitData = {
  habits: Habit[];
  schedules: HabitSchedule[];
  logs: HabitLog[];
};
export type DateState =
  | "completed"
  | "not completed"
  | "pending today"
  | "not scheduled"
  | "future";
