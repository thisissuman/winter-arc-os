import { describe, expect, it } from "vitest";
import { studyCategorySeconds, studyCoverage, studyDay, studySessionDays } from "./domain";
import type { StudySession } from "@/features/tracking/types";

const base: StudySession = {
  id: "70000000-0000-4000-8000-000000000001", user_id: "70000000-0000-4000-8000-000000000002", created_at: "2026-10-01T00:00:00Z", updated_at: "2026-10-01T00:00:00Z",
  study_category_id: "70000000-0000-4000-8000-000000000003", challenge_id: null, timer_id: null,
  topic: "", notes: "", business_date: "2026-10-01", timezone: "Asia/Kolkata", duration_seconds: 3600,
  start_at: null, end_at: null, segments: [], source: "manual", revision: 1,
};

describe("study duration and coverage", () => {
  it("keeps manual duration-only sessions on the selected business date", () => {
    expect([...studySessionDays(base)]).toEqual([["2026-10-01", 3600]]);
    expect(studyDay([base], "2026-10-01")).toMatchObject({ seconds: 3600, sessionsCompleted: 1 });
  });
  it("splits timestamped sessions at the retained local midnight", () => {
    const session = { ...base, business_date: "2026-10-02", start_at: "2026-10-01T18:00:00Z", end_at: "2026-10-01T20:00:00Z", duration_seconds: 7200, segments: [{ start: "2026-10-01T18:00:00Z", end: "2026-10-01T20:00:00Z" }] };
    expect([...studySessionDays(session)]).toEqual([["2026-10-01", 1800], ["2026-10-02", 5400]]);
    expect(studyDay([session], "2026-10-01").sessionsCompleted).toBe(0);
    expect(studyDay([session], "2026-10-02").sessionsCompleted).toBe(1);
  });
  it("uses actual local midnight across a daylight-saving transition", () => {
    const session = { ...base, business_date: "2026-11-01", timezone: "America/New_York", start_at: "2026-11-01T03:30:00Z", end_at: "2026-11-01T06:30:00Z", duration_seconds: 10800, segments: [{ start: "2026-11-01T03:30:00Z", end: "2026-11-01T06:30:00Z" }] };
    expect([...studySessionDays(session)]).toEqual([["2026-10-31", 1800], ["2026-11-01", 9000]]);
  });
  it("excludes paused time while preserving total seconds and category coverage", () => {
    const session = { ...base, business_date: "2026-10-02", start_at: "2026-10-01T18:00:00Z", end_at: "2026-10-01T20:00:00Z", duration_seconds: 3600, source: "timer" as const,
      segments: [{ start: "2026-10-01T18:00:00Z", end: "2026-10-01T18:30:00Z" }, { start: "2026-10-01T19:30:00Z", end: "2026-10-01T20:00:00Z" }] };
    expect([...studySessionDays(session)]).toEqual([["2026-10-01", 1800], ["2026-10-02", 1800]]);
    expect(studyCoverage([session], ["2026-10-01", "2026-10-02"])).toMatchObject({ seconds: 3600, minutes: 60, recordedDays: 2, sessionsCompleted: 1 });
    expect(studyCategorySeconds([session], "2026-10-01", "2026-10-01").get(session.study_category_id)).toBe(1800);
  });
});
