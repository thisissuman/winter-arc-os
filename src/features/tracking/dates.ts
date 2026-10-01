/** Calendar arithmetic uses UTC only as a stable representation of a business date. */
const CALENDAR_DAY_MS = 86_400_000;
export const MAX_CALENDAR_RANGE = 3_660;

export type CalendarPeriod = "daily" | "weekly" | "monthly";
export type DateRange = { start: string; end: string };

function calendarTimestamp(date: string): number {
  if (!isBusinessDate(date)) throw new RangeError("Use a valid calendar date in YYYY-MM-DD format.");
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(0);
  value.setUTCFullYear(year, month - 1, day);
  value.setUTCHours(0, 0, 0, 0);
  return value.getTime();
}

function calendarString(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  if (year < 1 || year > 9999) throw new RangeError("Calendar date is outside the supported range.");
  return `${String(year).padStart(4, "0")}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function isBusinessDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function isCalendarMonth(value: unknown): boolean {
  return typeof value === "string" && /^\d{4}-\d{2}$/.test(value) && isBusinessDate(`${value}-01`);
}

export function businessDate(timezone: string, now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((entry) => entry.type === type)?.value;
  const date = `${part("year")}-${part("month")}-${part("day")}`;
  if (!isBusinessDate(date)) throw new RangeError("The current business date could not be determined.");
  return date;
}

export function addDays(date: string, days: number): string {
  if (!Number.isSafeInteger(days)) throw new RangeError("Calendar-day offset must be a whole number.");
  return calendarString(calendarTimestamp(date) + days * CALENDAR_DAY_MS);
}

export function daysBetween(start: string, end: string): number {
  return Math.round((calendarTimestamp(end) - calendarTimestamp(start)) / CALENDAR_DAY_MS);
}

export function datesBetween(start: string, end: string, maximum = MAX_CALENDAR_RANGE): string[] {
  const length = daysBetween(start, end) + 1;
  if (length <= 0) return [];
  if (!Number.isSafeInteger(maximum) || maximum < 1 || length > maximum) throw new RangeError(`Choose a date range of at most ${maximum} calendar days.`);
  return Array.from({ length }, (_, index) => addDays(start, index));
}

export function isoWeekday(date: string): number {
  const weekday = new Date(calendarTimestamp(date)).getUTCDay();
  return weekday === 0 ? 7 : weekday;
}

export function weekRange(date: string, weekStartsOn = 1): DateRange {
  if (!Number.isInteger(weekStartsOn) || weekStartsOn < 1 || weekStartsOn > 7) throw new RangeError("Week start must be an ISO weekday from 1 to 7.");
  const start = addDays(date, -((isoWeekday(date) - weekStartsOn + 7) % 7));
  return { start, end: addDays(start, 6) };
}

export function monthRange(dateOrMonth: string): DateRange {
  const start = isCalendarMonth(dateOrMonth) ? `${dateOrMonth}-01` : `${dateOrMonth.slice(0, 7)}-01`;
  if (!isBusinessDate(dateOrMonth) && !isCalendarMonth(dateOrMonth)) throw new RangeError("Choose a valid month or calendar date.");
  const [year, month] = start.split("-").map(Number);
  const next = new Date(0);
  next.setUTCFullYear(year, month, 1);
  next.setUTCHours(0, 0, 0, 0);
  return { start, end: calendarString(next.getTime() - CALENDAR_DAY_MS) };
}

export function periodRange(period: CalendarPeriod, date: string, weekStartsOn = 1): DateRange {
  if (period === "weekly") return weekRange(date, weekStartsOn);
  if (period === "monthly") return monthRange(date);
  if (!isBusinessDate(date)) throw new RangeError("Choose a valid calendar date.");
  return { start: date, end: date };
}

export function nextBoundary(period: CalendarPeriod, date: string, weekStartsOn = 1): string {
  return addDays(periodRange(period, date, weekStartsOn).end, 1);
}

export function parseDateQuery(value: string | string[] | undefined, fallback: string): string {
  if (!isBusinessDate(fallback)) throw new RangeError("The default date is invalid.");
  return typeof value === "string" && isBusinessDate(value) ? value : fallback;
}

export function parseMonthQuery(value: string | string[] | undefined, fallback: string): string {
  const defaultMonth = isBusinessDate(fallback) ? fallback.slice(0, 7) : fallback;
  if (!isCalendarMonth(defaultMonth)) throw new RangeError("The default month is invalid.");
  return typeof value === "string" && isCalendarMonth(value) ? value : defaultMonth;
}

export function inclusiveChallengeProgress(start: string, end: string, date: string): {
  totalDays: number;
  dayNumber: number;
  elapsedDays: number;
  daysAfterToday: number;
  progress: number;
  state: "upcoming" | "active" | "finished";
} {
  const totalDays = daysBetween(start, end) + 1;
  if (totalDays < 1) throw new RangeError("Challenge end must be on or after its start.");
  const elapsedDays = Math.max(0, Math.min(totalDays, daysBetween(start, date) + 1));
  const state = date < start ? "upcoming" : date > end ? "finished" : "active";
  return {
    totalDays,
    dayNumber: state === "active" ? elapsedDays : state === "finished" ? totalDays : 0,
    elapsedDays,
    daysAfterToday: Math.max(daysBetween(date, end), 0),
    progress: elapsedDays / totalDays,
    state,
  };
}
