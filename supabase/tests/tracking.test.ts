import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { foundationDatabase } from "../../scripts/database.mjs";

const ownerA = "30000000-0000-4000-8000-000000000001";
const ownerB = "30000000-0000-4000-8000-000000000002";
const trackingTables = [
  "challenges", "habits", "habit_schedules", "habit_logs", "metric_definitions",
  "metric_targets", "metric_logs", "frequency_targets", "frequency_target_rules",
  "score_categories", "score_policies", "score_category_weights", "score_items",
  "challenge_habits", "challenge_metrics", "challenge_targets", "tracking_operations",
] as const;
let database: PGlite;

async function authenticate(owner: string) {
  await database.exec("set role authenticated");
  await database.query("select set_config('request.jwt.claim.sub', $1, true)", [owner]);
}
async function rpc<T>(name: string, input: Record<string, unknown>): Promise<T> {
  const result = await database.query<{ result: T }>(`select public.${name}($1::jsonb) as result`, [JSON.stringify(input)]);
  return result.rows[0].result;
}
async function today(): Promise<string> {
  return (await database.query<{ date: string }>("select (now() at time zone 'Asia/Kolkata')::date::text as date")).rows[0].date;
}
async function expectDbError(operation: () => Promise<unknown>, code: string) {
  await database.exec("savepoint expected_error");
  try { await expect(operation()).rejects.toMatchObject({ code }); }
  finally { await database.exec("rollback to savepoint expected_error; release savepoint expected_error;"); }
}

beforeAll(async () => {
  database = await foundationDatabase();
  await database.query("insert into auth.users(id,email) values ($1,'tracking-a@example.test'),($2,'tracking-b@example.test')", [ownerA, ownerB]);
});
beforeEach(async () => { await database.exec("begin; set constraints all immediate;"); });
afterEach(async () => { await database.exec("rollback; reset role;"); });
afterAll(async () => { await database?.close(); });

describe("Phase 2 ownership and transactions", () => {
  it("protects each new table with RLS and read-only direct authenticated grants", async () => {
    const { rows } = await database.query<{ relname: string; relrowsecurity: boolean }>("select relname, relrowsecurity from pg_class join pg_namespace on pg_namespace.oid = pg_class.relnamespace where nspname='public' and relkind='r'");
    for (const table of trackingTables) {
      expect(rows.find((row) => row.relname === table)?.relrowsecurity).toBe(true);
      expect((await database.query<{ allowed: boolean }>("select has_table_privilege('authenticated',$1,'select') allowed", [`public.${table}`])).rows[0].allowed).toBe(true);
      for (const privilege of ["insert", "update", "delete"])
        expect((await database.query<{ allowed: boolean }>("select has_table_privilege('authenticated',$1,$2) allowed", [`public.${table}`, privilege])).rows[0].allowed).toBe(false);
      await database.exec("set role anon");
      await expectDbError(() => database.query(`select * from public.${table}`), "42501");
      await database.exec("reset role");
    }
  });

  it("rejects cross-owner associations and selected challenge references", async () => {
    const challenge = (await database.query<{ id: string }>("insert into challenges(user_id,title,start_date,end_date) values($1,'B challenge',current_date,current_date+7) returning id", [ownerB])).rows[0].id;
    const habit = (await database.query<{ id: string }>("insert into habits(user_id,name,active_from) values($1,'A habit',current_date) returning id", [ownerA])).rows[0].id;
    await expectDbError(() => database.query("insert into challenge_habits(user_id,challenge_id,habit_id) values($1,$2,$3)", [ownerA, challenge, habit]), "23503");
    await expectDbError(() => database.query("update user_preferences set selected_challenge_id=$1 where user_id=$2", [challenge, ownerA]), "23503");
    const otherMetric = (await database.query<{ id: string }>("insert into metric_definitions(user_id,name,unit,source,active_from,source_available_from) values($1,'B metric','steps','manual',current_date,current_date) returning id", [ownerB])).rows[0].id;
    await expectDbError(() => database.query("insert into frequency_targets(user_id,name,source,metric_id,count_mode,active_from) values($1,'Forged','metric_threshold',$2,'distinct_days',current_date)", [ownerA, otherMetric]), "23503");
  });

  it("prevents overlapping effective rules for one source", async () => {
    const habitId = (await database.query<{ id: string }>("insert into habits(user_id,name,active_from) values($1,'Scheduled',current_date) returning id", [ownerA])).rows[0].id;
    await database.query("insert into habit_schedules(user_id,habit_id,frequency,required_count,effective_from,timezone,week_starts_on) values($1,$2,'DAILY',1,current_date,'Asia/Kolkata',1)", [ownerA, habitId]);
    await expectDbError(() => database.query("insert into habit_schedules(user_id,habit_id,frequency,required_count,effective_from,timezone,week_starts_on) values($1,$2,'WEEKDAYS',1,current_date,'Asia/Kolkata',1)", [ownerA, habitId]), "23P01");
  });

  it("reuses one tracker log across two challenge associations", async () => {
    const date = await today();
    await authenticate(ownerA);
    const habitId = await rpc<string>("save_tracking_habit", { name: "Shared", timeOfDay: "anytime", frequency: "DAILY", requiredCount: 1, activeFrom: date });
    const challengeInput = { title: "First", description: "", startDate: date, endDate: date, status: "active", habitIds: [habitId], metricIds: [], frequencyTargetIds: [] };
    const first = await rpc<string>("save_tracking_challenge", challengeInput);
    const second = await rpc<string>("save_tracking_challenge", { ...challengeInput, title: "Second" });
    await rpc("write_tracking_habit_log", { habitId, date, status: "completed", completionCount: 1 });
    expect(first).not.toBe(second);
    expect((await database.query("select id from challenge_habits where habit_id=$1", [habitId])).rows).toHaveLength(2);
    expect((await database.query("select id from habit_logs where habit_id=$1", [habitId])).rows).toHaveLength(1);
  });

  it("creates a tracker through its RPC, isolates it, and rejects a forged owner edit", async () => {
    const date = await today();
    await authenticate(ownerA);
    const id = await rpc<string>("save_tracking_habit", { name: "Read", description: "", timeOfDay: "evening", isPrivate: false, frequency: "DAILY", requiredCount: 1, weekdays: [], activeFrom: date });
    expect((await database.query("select id from habits where id=$1", [id])).rows).toHaveLength(1);
    await database.exec("reset role");
    await authenticate(ownerB);
    expect((await database.query("select id from habits where id=$1", [id])).rows).toHaveLength(0);
    await expectDbError(() => rpc("save_tracking_habit", { id, name: "Stolen", description: "", timeOfDay: "evening", isPrivate: false, frequency: "DAILY", requiredCount: 1, weekdays: [], activeFrom: date }), "42501");
  });

  it("guards habit revisions and preserves one log per tracker and date", async () => {
    const date = await today();
    await authenticate(ownerA);
    const habitId = await rpc<string>("save_tracking_habit", { name: "Practice", timeOfDay: "morning", frequency: "DAILY", requiredCount: 1, activeFrom: date });
    const input = { habitId, date, status: "completed", completionCount: 1, expectedRevision: null };
    const saved = await rpc<{ revision: number }>("write_tracking_habit_log", input);
    await expectDbError(() => rpc("write_tracking_habit_log", input), "40001");
    const updated = await rpc<{ revision: number }>("write_tracking_habit_log", { ...input, completionCount: 2, expectedRevision: saved.revision });
    expect(updated.revision).toBeGreaterThan(saved.revision);
    expect((await database.query("select id from habit_logs where habit_id=$1", [habitId])).rows).toHaveLength(1);
  });

  it("makes quick additions atomic and retry-safe", async () => {
    const date = await today();
    await authenticate(ownerA);
    const metricId = await rpc<string>("save_tracking_metric", { name: "Water", unit: "ml", source: "manual", aggregation: "sum", targetPeriod: "daily", direction: "minimum", target: 3500, activeFrom: date });
    const input = { metricId, date, amount: 250, operationId: "40000000-0000-4000-8000-000000000001" };
    const first = await rpc<{ value: number; revision: number }>("increment_tracking_metric", input);
    const retry = await rpc<{ value: number; revision: number }>("increment_tracking_metric", input);
    expect(retry).toEqual(first);
    await expectDbError(() => rpc("increment_tracking_metric", { ...input, amount: 500 }), "40001");
    const second = await rpc<{ value: number }>("increment_tracking_metric", { ...input, amount: 500, operationId: "40000000-0000-4000-8000-000000000002" });
    expect(Number(second.value)).toBe(750);
    expect((await database.query("select id from metric_logs where metric_id=$1", [metricId])).rows).toHaveLength(1);
  });

  it("applies starter definitions once without fabricating logs", async () => {
    await authenticate(ownerA);
    const input = { timezone: "Asia/Kolkata", weekStartsOn: 1, applyStarter: true, stepThreshold: 8000 };
    await rpc("complete_tracking_onboarding", input);
    const count = (await database.query<{ count: number }>("select count(*)::integer as count from habits where user_id=$1", [ownerA])).rows[0].count;
    await rpc("complete_tracking_onboarding", input);
    expect((await database.query<{ count: number }>("select count(*)::integer as count from habits where user_id=$1", [ownerA])).rows[0].count).toBe(count);
    expect(count).toBeGreaterThan(0);
    expect((await database.query("select id from habit_logs where user_id=$1", [ownerA])).rows).toHaveLength(0);
    expect((await database.query("select id from metric_logs where user_id=$1", [ownerA])).rows).toHaveLength(0);
  });
});
