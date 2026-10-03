import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { foundationDatabase } from "../../scripts/database.mjs";
let db: PGlite;
const A = "40000000-0000-4000-8000-000000000001",
  B = "40000000-0000-4000-8000-000000000002";
beforeAll(async () => {
  db = await foundationDatabase();
  await db.query(
    "insert into auth.users(id,email) values($1,'a@example.test'),($2,'b@example.test')",
    [A, B],
  );
});
beforeEach(async () => {
  await db.exec("begin");
  await db.query(
    "insert into habits(user_id,name,active_from) values($1,'A',current_date-1500),($2,'B',current_date)",
    [A, B],
  );
  await db.query(
    "insert into habit_schedules(user_id,habit_id,weekdays,effective_from) select user_id,id,array[1,2,3,4,5,6,7]::smallint[],active_from from habits",
  );
  await db.exec("set role authenticated");
  await db.query("select set_config('request.jwt.claim.sub',$1,true)", [A]);
});
afterEach(async () => {
  await db.exec("rollback;reset role");
});
afterAll(async () => {
  await db?.close();
});
it("exports exactly five owned tables using version 2, without API pagination loss", async () => {
  await db.exec("reset role");
  await db.query(
    "insert into habit_logs(user_id,habit_id,business_date,timezone,completed) select $1,id,current_date-n,'UTC',true from habits cross join generate_series(1,1200) n where user_id=$1",
    [A],
  );
  await db.exec("set role authenticated");
  const data = (
    await db.query<{
      e: {
        format_version: number;
        data: Record<string, { user_id: string }[]>;
      };
    }>("select export_workspace_data() e")
  ).rows[0].e;
  expect(data.format_version).toBe(2);
  expect(Object.keys(data.data).sort()).toEqual([
    "habit_logs",
    "habit_schedules",
    "habits",
    "profiles",
    "user_preferences",
  ]);
  expect(data.data.habit_logs.length).toBe(1200);
  for (const rows of Object.values(data.data))
    for (const row of rows) expect(row.user_id).toBe(A);
});
it("clears only the caller product records and retains both account preferences", async () => {
  await db.query("select delete_workspace_data('DELETE MY DATA')");
  expect((await db.query("select * from habits")).rows).toEqual([]);
  expect((await db.query("select * from profiles")).rows.length).toBe(1);
  await db.exec("reset role");
  expect(
    (await db.query("select * from habits where user_id=$1", [B])).rows.length,
  ).toBe(1);
  expect((await db.query("select * from auth.users")).rows.length).toBe(2);
});
it("Auth deletion clears children transactionally and leaves the other account intact", async () => {
  await db.exec("reset role");
  await db.query("delete from auth.users where id=$1", [A]);
  for (const table of [
    "profiles",
    "user_preferences",
    "habits",
    "habit_schedules",
    "habit_logs",
  ])
    expect(
      (await db.query("select * from " + table + " where user_id=$1", [A]))
        .rows,
    ).toEqual([]);
  expect(
    (await db.query("select * from habits where user_id=$1", [B])).rows.length,
  ).toBe(1);
});
