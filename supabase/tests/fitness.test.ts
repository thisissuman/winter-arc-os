import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { foundationDatabase } from "../../scripts/database.mjs";

const ownerA = "50000000-0000-4000-8000-000000000001";
const ownerB = "50000000-0000-4000-8000-000000000002";
let database: PGlite;
async function authenticate(owner: string) { await database.exec("set role authenticated"); await database.query("select set_config('request.jwt.claim.sub',$1,true)", [owner]); }
async function rpc<T>(name: string, input: Record<string, unknown>): Promise<T> {
  return (await database.query<{ result: T }>(`select public.${name}($1::jsonb) result`, [JSON.stringify(input)])).rows[0].result;
}
async function today(): Promise<string> { return (await database.query<{ date: string }>("select (now() at time zone 'Asia/Kolkata')::date::text date")).rows[0].date; }
async function expectDbError(operation: () => Promise<unknown>, code: string) {
  await database.exec("savepoint expected_error");
  try { await expect(operation()).rejects.toMatchObject({ code }); }
  finally { await database.exec("rollback to savepoint expected_error; release savepoint expected_error;"); }
}
beforeAll(async () => { database = await foundationDatabase(); await database.query("insert into auth.users(id,email) values ($1,'fitness-a@example.test'),($2,'fitness-b@example.test')", [ownerA,ownerB]); });
beforeEach(async () => { await database.exec("begin; set constraints all immediate;"); });
afterEach(async () => { await database.exec("rollback; reset role;"); });
afterAll(async () => { await database?.close(); });

describe("Phase 3 fitness ownership and transactions", () => {
  it("protects every owned table with RLS and read-only direct grants", async () => {
    for (const table of ["sleep_logs","exercises","workouts","workout_exercises","workout_sets","workout_operations"]) {
      const result = await database.query<{ relrowsecurity: boolean }>("select relrowsecurity from pg_class where oid=$1::regclass", [`public.${table}`]);
      expect(result.rows[0].relrowsecurity).toBe(true);
      expect((await database.query<{ allowed: boolean }>("select has_table_privilege('authenticated',$1,'select') allowed", [`public.${table}`])).rows[0].allowed).toBe(true);
      for (const privilege of ["insert","update","delete"])
        expect((await database.query<{ allowed: boolean }>("select has_table_privilege('authenticated',$1,$2) allowed", [`public.${table}`,privilege])).rows[0].allowed).toBe(false);
      await database.exec("set role anon");
      await expectDbError(() => database.query(`select * from public.${table}`), "42501");
      await database.exec("reset role");
    }
  });

  it("sets up definitions once, activates derived sources, and creates no performance", async () => {
    await authenticate(ownerA);
    await rpc("setup_fitness", { sleepTarget: 8 });
    await rpc("setup_fitness", { sleepTarget: 8 });
    expect((await database.query("select id from metric_definitions where user_id=$1 and starter_key in ('protein','water','body-weight','steps','sleep')", [ownerA])).rows).toHaveLength(5);
    expect((await database.query("select id from metric_targets where user_id=$1", [ownerA])).rows).toHaveLength(3);
    expect((await database.query("select id from frequency_targets where user_id=$1 and starter_key='gym'", [ownerA])).rows).toHaveLength(1);
    for (const table of ["metric_logs","habit_logs","sleep_logs","workouts"])
      expect((await database.query(`select id from ${table} where user_id=$1`, [ownerA])).rows).toHaveLength(0);
  });

  it("stores overnight sleep as one wake-date record and rejects stale edits", async () => {
    const date = await today();
    await authenticate(ownerA);
    await rpc("setup_fitness", { sleepTarget: 8 });
    const input = { date, expectedRevision: null, clear: false, sleepStartAt: new Date(Date.parse(`${date}T00:00:00Z`) - 6 * 3600_000).toISOString(), wakeAt: `${date}T02:00:00Z`, durationSeconds: 28800, quality: 4, notes: "" };
    const saved = await rpc<{ revision: number }>("save_fitness_sleep", input);
    await expectDbError(() => rpc("save_fitness_sleep", input), "40001");
    expect((await database.query<{ duration_seconds: number }>("select duration_seconds from sleep_logs where user_id=$1 and business_date=$2", [ownerA,date])).rows[0].duration_seconds).toBe(28800);
    await database.exec("reset role"); await authenticate(ownerB);
    expect((await database.query("select id from sleep_logs where user_id=$1", [ownerA])).rows).toHaveLength(0);
    await expectDbError(() => rpc("save_fitness_sleep", { ...input, expectedRevision: saved.revision }), "40001");
  });

  it("rejects a stale manual measurement after an atomic water addition", async () => {
    const date = await today();
    await authenticate(ownerA);
    const metricId = await rpc<string>("save_tracking_metric", { name: "Water", unit: "ml", source: "manual", aggregation: "sum", targetPeriod: "daily", direction: "minimum", target: 3500, activeFrom: date });
    const saved = await rpc<{ revision: number }>("write_tracking_metric_log", { metricId, date, value: 500, expectedRevision: null });
    await rpc("increment_tracking_metric", { metricId, date, amount: 250, operationId: "50000000-0000-4000-8000-000000000088" });
    await expectDbError(() => rpc("write_tracking_metric_log", { metricId, date, value: 100, expectedRevision: saved.revision }), "40001");
    expect(Number((await database.query<{ value: string }>("select value from metric_logs where metric_id=$1 and business_date=$2", [metricId,date])).rows[0].value)).toBe(750);
  });

  it("copies workout sets atomically, independently, and once per operation", async () => {
    const date = await today();
    await authenticate(ownerA);
    const exercise = await rpc<{ id: string }>("save_fitness_exercise", { id: null, name: "Squat", muscleGroup: "Legs", archive: false });
    const original = await rpc<{ id: string; revision: number }>("save_fitness_workout", { id: null, expectedRevision: null, date, name: "Legs", durationSeconds: 3600, notes: "", status: "completed", challengeId: null, exercises: [{ exerciseId: exercise.id, notes: "", sets: [{ weightKg: 80, reps: 5, rpe: 8 }] }] });
    const operation = "50000000-0000-4000-8000-000000000099";
    const copy = (await database.query<{ result: string }>("select public.copy_fitness_workout($1::uuid,$2::date,$3::uuid) result", [original.id,date,operation])).rows[0].result;
    const retry = (await database.query<{ result: string }>("select public.copy_fitness_workout($1::uuid,$2::date,$3::uuid) result", [original.id,date,operation])).rows[0].result;
    expect(retry).toBe(copy);
    expect((await database.query<{ status: string }>("select status from workouts where id=$1", [copy])).rows[0].status).toBe("draft");
    expect((await database.query("select id from workout_sets where workout_exercise_id in (select id from workout_exercises where workout_id=$1)", [copy])).rows).toHaveLength(1);
    const copyRevision = (await database.query<{ revision: number }>("select revision from workouts where id=$1", [copy])).rows[0].revision;
    await rpc("save_fitness_workout", { id: copy, expectedRevision: copyRevision, date, name: "Copied legs", durationSeconds: 4200, notes: "", status: "completed", challengeId: null, exercises: [{ exerciseId: exercise.id, notes: "", sets: [{ weightKg: 90, reps: 3, rpe: null }] }] });
    expect(Number((await database.query<{ weight_kg: string }>("select weight_kg from workout_sets where workout_exercise_id in (select id from workout_exercises where workout_id=$1)", [copy])).rows[0].weight_kg)).toBe(90);
    expect(Number((await database.query<{ weight_kg: string }>("select weight_kg from workout_sets where workout_exercise_id in (select id from workout_exercises where workout_id=$1)", [original.id])).rows[0].weight_kg)).toBe(80);
    expect((await database.query("select id from workouts where user_id=$1", [ownerA])).rows).toHaveLength(2);
    await database.exec("reset role"); await authenticate(ownerB);
    expect((await database.query("select id from workouts where id=$1", [original.id])).rows).toHaveLength(0);
    await expectDbError(() => database.query("select public.copy_fitness_workout($1::uuid,$2::date,$3::uuid)", [original.id,date,"50000000-0000-4000-8000-000000000098"]), "42501");
  });

  it("rejects incomplete direct workout RPC payloads before they can count as gym sessions", async () => {
    const date = await today();
    await authenticate(ownerA);
    await expectDbError(() => rpc("save_fitness_workout", { id: null, date, name: "Incomplete", status: "completed" }), "23514");
    await expectDbError(() => rpc("save_fitness_workout", { id: null, date, name: "Empty", status: "completed", exercises: [] }), "23514");
    expect((await database.query("select id from workouts where user_id=$1", [ownerA])).rows).toHaveLength(0);
  });
});
