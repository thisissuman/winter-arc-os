import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { foundationDatabase } from "../../scripts/database.mjs";

const ownerA = "90000000-0000-4000-8000-000000000001";
const ownerB = "90000000-0000-4000-8000-000000000002";
const receipts = ["tracking_operations", "workout_operations", "task_carry_operations"];
let database: PGlite;
async function asOwner(owner: string) {
  await database.exec("set role authenticated");
  await database.query("select set_config('request.jwt.claim.sub',$1,true)", [owner]);
}
async function expectCode(operation: () => Promise<unknown>, code: string) {
  await database.exec("savepoint rejected");
  try { await expect(operation()).rejects.toMatchObject({ code }); }
  finally { await database.exec("rollback to savepoint rejected; release savepoint rejected"); }
}
async function fixture(owner: string) {
  await asOwner(owner);
  await database.query("select complete_tracking_onboarding($1::jsonb)", [JSON.stringify({ timezone: "Asia/Kolkata", weekStartsOn: 1, applyStarter: true })]);
  await database.query("select setup_career('{}'::jsonb)");
  await database.exec("reset role");
  await database.query(`
    with exercise as (insert into exercises(user_id,name,muscle_group) values($1,'Fixture exercise','Legs') returning id),
    workout as (insert into workouts(user_id,business_date,timezone,name,status) values($1,'2026-09-28','Asia/Kolkata','Fixture workout','completed') returning id),
    item as (insert into workout_exercises(user_id,workout_id,exercise_id,position) select $1,workout.id,exercise.id,0 from workout,exercise returning id)
    insert into workout_sets(user_id,workout_exercise_id,set_number,weight_kg,reps) select $1,id,1,40,8 from item
  `, [owner]);
  await database.query(`
    with timer as (
      insert into focus_timers(user_id,study_category_id,status,timezone)
      select $1,id,'finished','Asia/Kolkata' from study_categories where user_id=$1 limit 1 returning id,study_category_id
    ) insert into study_sessions(user_id,study_category_id,timer_id,business_date,timezone,duration_seconds,source,topic)
      select $1,study_category_id,id,'2026-09-28','Asia/Kolkata',600,'timer','Private fixture note' from timer
  `, [owner]);
  await database.query("insert into weekly_reviews(user_id,week_start,week_starts_on,timezone,wins) values($1,'2026-09-28',1,'Asia/Kolkata','Private fixture win')", [owner]);
}
async function exported() {
  return (await database.query<{ result: { format_version: number; data: Record<string, { user_id: string }[]> } }>("select export_workspace_data() result")).rows[0].result;
}
beforeAll(async () => { database = await foundationDatabase(); });
beforeEach(async () => {
  await database.exec("begin; set constraints all immediate");
  await database.query("insert into auth.users(id,email) values($1,'controls-a@example.test'),($2,'controls-b@example.test')", [ownerA, ownerB]);
  await fixture(ownerA);
  await fixture(ownerB);
});
afterEach(async () => { await database.exec("rollback; reset role"); });
afterAll(async () => { await database?.close(); });

describe("Phase 8 private exports and deletion", () => {
  it("exports every owned product table without the REST row cap or other owners", async () => {
    await database.query(`
      insert into metric_logs(user_id,metric_id,business_date,value,timezone)
      select $1,m.id,d::date,1,'Asia/Kolkata'
      from (select id from metric_definitions where user_id=$1 and source='manual' limit 1) m,
      generate_series('2000-01-01'::date,'2003-04-15'::date,'1 day') d
    `, [ownerA]);
    const tables = (await database.query<{ tablename: string }>("select tablename from pg_tables where schemaname='public' order by tablename")).rows.map(row => row.tablename);
    await asOwner(ownerA);
    const result = await exported();
    expect(result.format_version).toBe(1);
    expect(Object.keys(result.data).sort()).toEqual(tables.filter(table => !receipts.includes(table)));
    expect(result.data.metric_logs.length).toBeGreaterThan(1000);
    for (const [table, rows] of Object.entries(result.data)) {
      expect(rows.every(row => row.user_id === ownerA)).toBe(true);
      const count = (await database.query<{ count: number }>('select count(*)::integer count from public."' + table + '" where user_id=$1', [ownerA])).rows[0].count;
      expect(rows).toHaveLength(count);
    }
  });

  it("denies anonymous export/deletion and private cleanup execution", async () => {
    await database.exec("set role anon");
    await expectCode(() => database.query("select export_workspace_data()"), "42501");
    await expectCode(() => database.query("select delete_workspace_data('DELETE MY DATA')"), "42501");
    await database.exec("reset role");
    expect((await database.query<{ allowed: boolean }>("select has_function_privilege('authenticated','private.clear_workspace(uuid)','execute') allowed")).rows[0].allowed).toBe(false);
  });

  it("requires confirmation and removes only the caller's workspace while retaining account preferences", async () => {
    await database.query("update user_preferences set theme='light',privacy_mode=true where user_id=$1", [ownerA]);
    await asOwner(ownerA);
    await expectCode(() => database.query("select delete_workspace_data('wrong')"), "23514");
    expect((await exported()).data.workouts).toHaveLength(1);
    await database.query("select delete_workspace_data('DELETE MY DATA')");
    const remaining = await exported();
    for (const [table, rows] of Object.entries(remaining.data)) expect(rows).toHaveLength(["profiles", "user_preferences"].includes(table) ? 1 : 0);
    const prefs = (await database.query<{ theme: string; privacy_mode: boolean; timezone: string; starter_applied_on: null; selected_challenge_id: null }>("select * from user_preferences where user_id=$1", [ownerA])).rows[0];
    expect(prefs).toMatchObject({ theme: "light", privacy_mode: true, timezone: "Asia/Kolkata", starter_applied_on: null, selected_challenge_id: null });
    await database.exec("reset role");
    expect((await database.query("select id from auth.users where id=$1", [ownerA])).rows).toHaveLength(1);
    await asOwner(ownerB);
    expect((await exported()).data.workouts).toHaveLength(1);
    await asOwner(ownerA);
    await database.query("select delete_workspace_data('DELETE MY DATA')");
    expect((await exported()).data.habits).toHaveLength(0);
  });

  it("deletes an Auth identity and restrictive children atomically without touching another owner", async () => {
    await database.query("delete from auth.users where id=$1", [ownerA]);
    const tables = (await database.query<{ tablename: string }>("select tablename from pg_tables where schemaname='public'")).rows;
    for (const { tablename } of tables)
      expect((await database.query('select user_id from public."' + tablename + '" where user_id=$1', [ownerA])).rows).toHaveLength(0);
    await asOwner(ownerB);
    expect((await exported()).data.workout_sets).toHaveLength(1);
  });
});
