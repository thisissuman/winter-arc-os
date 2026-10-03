import { describe, expect, it } from "vitest";
import { addDays, businessDate, isBusinessDate, weekRange } from "@/lib/dates";
import { consistency, dateState, isScheduled, maskHabits } from "./domain";
import { habitSchema, completionSchema } from "./validation";
import type { HabitData } from "./types";
const data: HabitData = {
  habits: [
    {
      id: "a",
      name: "Secret habit",
      active_from: "2026-09-28",
      archived_from: null,
      revision: 1,
    },
  ],
  schedules: [
    {
      habit_id: "a",
      weekdays: [1, 2, 3, 4, 5, 6, 7],
      effective_from: "2026-09-28",
      effective_until: "2026-10-01",
    },
    {
      habit_id: "a",
      weekdays: [1, 3, 5],
      effective_from: "2026-10-01",
      effective_until: null,
    },
  ],
  logs: [
    {
      habit_id: "a",
      business_date: "2026-09-28",
      completed: true,
      revision: 1,
    },
    {
      habit_id: "a",
      business_date: "2026-10-02",
      completed: true,
      revision: 1,
    },
  ],
};
describe("dated binary history", () => {
  it("keeps old expectations when schedules change", () => {
    expect(isScheduled(data.habits[0], data.schedules, "2026-09-29")).toBe(
      true,
    );
    expect(isScheduled(data.habits[0], data.schedules, "2026-10-01")).toBe(
      false,
    );
  });
  it("distinguishes all five states and honors creation/archive cutoffs", () => {
    const h = data.habits[0];
    expect(dateState(data, h, "2026-09-28", "2026-10-02")).toBe("completed");
    expect(dateState(data, h, "2026-09-29", "2026-10-02")).toBe(
      "not completed",
    );
    expect(
      dateState({ ...data, logs: [] }, h, "2026-10-02", "2026-10-02"),
    ).toBe("pending today");
    expect(dateState(data, h, "2026-10-01", "2026-10-02")).toBe(
      "not scheduled",
    );
    expect(dateState(data, h, "2026-10-05", "2026-10-02")).toBe("future");
    expect(isScheduled(h, data.schedules, "2026-09-27")).toBe(false);
    expect(
      isScheduled(
        { ...h, archived_from: "2026-10-02" },
        data.schedules,
        "2026-10-02",
      ),
    ).toBe(false);
  });
  it("counts only closed scheduled opportunities, including archived history", () => {
    expect(consistency(data, "2026-09-28", "2026-10-04", "2026-10-02")).toEqual(
      { completed: 1, scheduled: 3 },
    );
    expect(consistency(data, "2026-09-28", "2026-10-04", "2026-10-03")).toEqual(
      { completed: 2, scheduled: 4 },
    );
    expect(
      consistency(
        {
          ...data,
          habits: [{ ...data.habits[0], archived_from: "2026-10-01" }],
        },
        "2026-09-28",
        "2026-10-04",
        "2026-10-03",
      ),
    ).toEqual({ completed: 1, scheduled: 3 });
  });
  it("returns zero opportunities without inventing success", () => {
    expect(consistency(data, "2026-10-05", "2026-10-11", "2026-10-03")).toEqual(
      { completed: 0, scheduled: 0 },
    );
  });
  it("fails visibly for missing or overlapping schedule coverage", () => {
    expect(() => isScheduled(data.habits[0], [], "2026-10-02")).toThrow();
    expect(() =>
      isScheduled(
        data.habits[0],
        [...data.schedules, data.schedules[1]],
        "2026-10-02",
      ),
    ).toThrow();
  });
  it("masks all names before serialization without mutating original data", () => {
    const masked = maskHabits(data.habits, true);
    expect(JSON.stringify(masked)).not.toContain("Secret");
    expect(masked[0].name).toBe("Habit 1");
    expect(data.habits[0].name).toBe("Secret habit");
  });
  it("validates names, weekdays, boolean completion and revisions", () => {
    const id = "10000000-0000-4000-8000-000000000001";
    expect(
      habitSchema.safeParse({
        name: "Read",
        weekdays: [1, 1],
        expectedRevision: 0,
      }).success,
    ).toBe(false);
    expect(
      habitSchema.safeParse({ name: " ", weekdays: [1], expectedRevision: 0 })
        .success,
    ).toBe(false);
    expect(
      completionSchema.safeParse({
        habitId: id,
        businessDate: "2026-02-30",
        completed: true,
        expectedRevision: 0,
      }).success,
    ).toBe(false);
    expect(
      completionSchema.safeParse({
        habitId: id,
        businessDate: "2026-02-28",
        completed: 1,
        expectedRevision: 0,
      }).success,
    ).toBe(false);
  });
});
describe("calendar arithmetic", () => {
  it("handles leap days, short months and years without local DST arithmetic", () => {
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
    expect(addDays("2025-02-28", 1)).toBe("2025-03-01");
    expect(addDays("2025-12-31", 1)).toBe("2026-01-01");
    expect(isBusinessDate("2025-02-29")).toBe(false);
    expect(addDays("2026-03-08", 1)).toBe("2026-03-09");
  });
  it("determines business dates in the configured timezone", () => {
    const now = new Date("2026-10-03T01:00:00Z");
    expect(businessDate("Asia/Kolkata", now)).toBe("2026-10-03");
    expect(businessDate("America/New_York", now)).toBe("2026-10-02");
  });
  it("groups weeks by the preference without changing recorded dates", () => {
    expect(weekRange("2026-10-03", 1)).toEqual({
      start: "2026-09-28",
      end: "2026-10-04",
    });
    expect(weekRange("2026-10-03", 7)).toEqual({
      start: "2026-09-27",
      end: "2026-10-03",
    });
  });
});
