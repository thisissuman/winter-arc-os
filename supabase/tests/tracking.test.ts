import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { foundationDatabase } from "../../scripts/database.mjs";
const A = "30000000-0000-4000-8000-000000000001",
  B = "30000000-0000-4000-8000-000000000002";
let db: PGlite;
let today: string;
async function auth(id = A) {
  await db.exec("set role authenticated");
  await db.query("select set_config('request.jwt.claim.sub',$1,true)", [id]);
}
async function create(days = [1, 2, 3, 4, 5, 6, 7]) {
  return (
    await db.query<{ h: { id: string; revision: number } }>(
      "select save_habit('Read',$1::smallint[]) h",
      [days],
    )
  ).rows[0].h;
}
async function log(id: string, done: boolean, rev: number, date = today) {
  return db.query<{
    l: { revision: number; completed: boolean; timezone: string };
  }>("select set_habit_completion($1,$2::date,$3,$4) l", [id, date, done, rev]);
}
async function error(fn: () => Promise<unknown>, code: string) {
  await db.exec("savepoint expected_error");
  try {
    await expect(fn()).rejects.toMatchObject({ code });
  } finally {
    await db.exec(
      "rollback to savepoint expected_error; release savepoint expected_error",
    );
  }
}
beforeAll(async () => {
  db = await foundationDatabase();
  await db.query(
    "insert into auth.users(id,email) values($1,'a@example.test'),($2,'b@example.test')",
    [A, B],
  );
  today = (
    await db.query<{ date: string }>(
      "select (now() at time zone 'Asia/Kolkata')::date::text date",
    )
  ).rows[0].date;
});
beforeEach(async () => {
  await db.exec("begin");
  await auth();
});
afterEach(async () => {
  await db.exec("rollback; reset role");
});
afterAll(async () => {
  await db?.close();
});
describe("owned binary habit transactions", () => {
  it("creates name plus daily schedule starting today", async () => {
    const h = await create();
    expect(h.revision).toBe(1);
    expect(
      (
        await db.query<{ d: string }>(
          "select active_from::text d from habits where id=$1",
          [h.id],
        )
      ).rows[0].d,
    ).toBe(today);
    expect(
      (await db.query("select weekdays from habit_schedules")).rows[0],
    ).toEqual({ weekdays: [1, 2, 3, 4, 5, 6, 7] });
  });
  it.each([{ days: [] }, { days: [1, 1] }, { days: [0] }, { days: [8] }])(
    "rejects invalid weekday selection $days",
    async ({ days }) => {
      await error(() => create(days), "23514");
    },
  );
  it("saves, retries and undoes without duplicate rows; rejects conflicting revisions", async () => {
    const h = await create();
    expect((await log(h.id, true, 0)).rows[0].l.revision).toBe(1);
    expect((await log(h.id, true, 0)).rows[0].l.revision).toBe(1);
    expect((await log(h.id, false, 1)).rows[0].l.revision).toBe(2);
    await error(() => log(h.id, true, 1), "PT409");
    expect(
      (await db.query("select count(*)::int n from habit_logs")).rows[0],
    ).toEqual({ n: 1 });
  });
  it("rejects future, pre-creation and unscheduled dates", async () => {
    const h = await create();
    for (const offset of [-1, 1]) {
      const d = (
        await db.query<{ d: string }>("select ($1::date+$2::int)::text d", [
          today,
          offset,
        ])
      ).rows[0].d;
      await error(() => log(h.id, true, 0, d), "23514");
    }
    const day = (
      await db.query<{ n: number }>(
        "select extract(isodow from $1::date)::int n",
        [today],
      )
    ).rows[0].n;
    const other = await create([day === 7 ? 1 : day + 1]);
    await error(() => log(other.id, true, 0), "23514");
  });
  it("changes schedules tomorrow and replaces repeated pending edits", async () => {
    const h = await create();
    await db.query("select save_habit('Read',$1::smallint[],$2,1)", [
      [1, 3, 5],
      h.id,
    ]);
    await db.query("select save_habit('Read',$1::smallint[],$2,2)", [
      [2, 4],
      h.id,
    ]);
    const { rows } = await db.query<{
      weekdays: number[];
      start: string;
      end: string | null;
    }>(
      "select weekdays,effective_from::text start,effective_until::text end from habit_schedules order by effective_from",
    );
    expect(rows.length).toBe(2);
    expect(rows[0].weekdays).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(rows[0].start).toBe(today);
    expect(rows[0].end).toBe(rows[1].start);
    expect(rows[1].weekdays).toEqual([2, 4]);
    await log(h.id, true, 0);
  });
  it("detects stale habit edits", async () => {
    const h = await create();
    await error(
      () =>
        db.query("select save_habit('Changed',array[1]::smallint[],$1,0)", [
          h.id,
        ]),
      "PT409",
    );
  });
  it("archives tomorrow retaining today and history; deletion is separate", async () => {
    const h = await create();
    await log(h.id, true, 0);
    await db.query("select archive_habit($1,1)", [h.id]);
    await log(h.id, false, 1);
    expect(
      (await db.query("select count(*)::int n from habit_logs")).rows[0],
    ).toEqual({ n: 1 });
    await error(
      () => db.query("select delete_habit($1,2,'wrong')", [h.id]),
      "23514",
    );
    await db.query("select delete_habit($1,2,'DELETE HABIT')", [h.id]);
    expect((await db.query("select * from habit_schedules")).rows).toEqual([]);
  });
  it("isolates definitions, schedules, logs and every mutation between two accounts", async () => {
    const h = await create();
    await log(h.id, true, 0);
    await auth(B);
    for (const table of ["habits", "habit_schedules", "habit_logs"])
      expect((await db.query("select * from " + table)).rows).toEqual([]);
    await error(() => log(h.id, true, 0), "42501");
    await error(
      () =>
        db.query("select save_habit('Forged',array[1]::smallint[],$1,1)", [
          h.id,
        ]),
      "42501",
    );
    await error(() => db.query("select archive_habit($1,1)", [h.id]), "42501");
    await error(
      () => db.query("select delete_habit($1,1,'DELETE HABIT')", [h.id]),
      "42501",
    );
  });
  it("enforces same-owner FKs and overlapping interval protection independently", async () => {
    const h = await create();
    await db.exec("reset role");
    await error(
      () =>
        db.query(
          "insert into habit_logs(user_id,habit_id,business_date,timezone,completed) values($1,$2,$3,'UTC',true)",
          [B, h.id, today],
        ),
      "23503",
    );
    await error(
      () =>
        db.query(
          "insert into habit_schedules(user_id,habit_id,weekdays,effective_from) values($1,$2,array[1]::smallint[],$3)",
          [A, h.id, today],
        ),
      "23514",
    );
  });
  it("preserves recorded business dates/timezone when preferences change", async () => {
    const h = await create();
    await log(h.id, true, 0);
    await db.query(
      "update user_preferences set timezone='America/New_York',week_starts_on=7 where user_id=$1",
      [A],
    );
    expect(
      (
        await db.query<{ d: string; timezone: string }>(
          "select business_date::text d,timezone from habit_logs",
        )
      ).rows[0],
    ).toEqual({ d: today, timezone: "Asia/Kolkata" });
  });
  it("corrects an archived past scheduled date without permitting post-archive logs", async () => {
    const h = await create();
    await db.exec("reset role");
    await db.query(
      "update habits set active_from=$1::date-7,archived_from=$1::date-1 where id=$2",
      [today, h.id],
    );
    await db.query(
      "update habit_schedules set effective_from=$1::date-7 where habit_id=$2",
      [today, h.id],
    );
    await auth();
    const past = (
      await db.query<{ d: string }>("select ($1::date-2)::text d", [today])
    ).rows[0].d;
    await log(h.id, true, 0, past);
    await log(h.id, false, 1, past);
    await error(() => log(h.id, true, 0), "23514");
  });
  it("denies name changes while Privacy Mode is enabled", async () => {
    await db.query(
      "update user_preferences set privacy_mode=true where user_id=$1",
      [A],
    );
    await error(() => create(), "23514");
  });
});
