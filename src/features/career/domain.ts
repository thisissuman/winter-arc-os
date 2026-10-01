import { businessDate } from "@/features/tracking/dates";
import type { StudySession } from "@/features/tracking/types";

export type StudyDay = { date: string; seconds: number; sessionsCompleted: number };
export type StudyCoverage = { seconds: number; minutes: number; recordedDays: number; sessionsCompleted: number };

type Interval = { start: string; end: string };
function intervals(session: StudySession): Interval[] {
  if (!session.start_at || !session.end_at) return [];
  if (!Array.isArray(session.segments) || session.segments.length === 0) return [{ start: session.start_at, end: session.end_at }];
  return session.segments.flatMap((entry) => entry && typeof entry === "object" && "start" in entry && "end" in entry && typeof entry.start === "string" && typeof entry.end === "string" ? [{ start: entry.start, end: entry.end }] : []);
}

/** Find the next local midnight by searching actual UTC instants; DST days need not be 24 hours. */
function nextLocalMidnight(after: number, timezone: string): number {
  const currentDate = businessDate(timezone, new Date(after));
  let low = after;
  let high = after + 48 * 3_600_000;
  if (businessDate(timezone, new Date(high)) === currentDate) throw new RangeError("Could not find the next local date.");
  while (high - low > 1) {
    const middle = Math.floor((low + high) / 2);
    if (businessDate(timezone, new Date(middle)) === currentDate) low = middle;
    else high = middle;
  }
  return high;
}

/** Attribute manual duration to its chosen date; split timestamped work at its retained local midnights. */
export function studySessionDays(session: StudySession): Map<string, number> {
  if (!session.start_at || !session.end_at) return new Map([[session.business_date, session.duration_seconds]]);
  const pieces = intervals(session);
  const milliseconds = new Map<string, number>();
  let observed = 0;
  for (const piece of pieces) {
    let cursor = Date.parse(piece.start);
    const end = Date.parse(piece.end);
    if (!Number.isFinite(cursor) || !Number.isFinite(end) || end <= cursor) continue;
    while (cursor < end) {
      const date = businessDate(session.timezone, new Date(cursor));
      const boundary = Math.min(end, nextLocalMidnight(cursor, session.timezone));
      const amount = boundary - cursor;
      milliseconds.set(date, (milliseconds.get(date) ?? 0) + amount);
      observed += amount;
      cursor = boundary;
    }
  }
  if (observed === 0) return new Map();
  return new Map([...milliseconds].map(([date, amount]) => [date, session.duration_seconds * amount / observed]));
}

export function studyDay(sessions: StudySession[], date: string): StudyDay {
  return {
    date,
    seconds: sessions.reduce((sum, session) => sum + (studySessionDays(session).get(date) ?? 0), 0),
    sessionsCompleted: sessions.filter((session) => session.business_date === date).length,
  };
}

export function studyCoverage(sessions: StudySession[], dates: string[]): StudyCoverage {
  const selected = new Set(dates);
  const recorded = new Set<string>();
  let seconds = 0;
  let sessionsCompleted = 0;
  for (const session of sessions) {
    if (selected.has(session.business_date)) sessionsCompleted++;
    for (const [date, amount] of studySessionDays(session)) {
      if (!selected.has(date)) continue;
      seconds += amount;
      if (amount > 0) recorded.add(date);
    }
  }
  return { seconds, minutes: seconds / 60, recordedDays: recorded.size, sessionsCompleted };
}

export function studyCategorySeconds(sessions: StudySession[], from: string, to: string): Map<string, number> {
  const totals = new Map<string, number>();
  for (const session of sessions) for (const [date, seconds] of studySessionDays(session)) {
    if (date >= from && date <= to) totals.set(session.study_category_id, (totals.get(session.study_category_id) ?? 0) + seconds);
  }
  return totals;
}
