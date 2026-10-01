import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { foundationDatabase } from "../../scripts/database.mjs";

const ownerA = "60000000-0000-4000-8000-000000000001";
const ownerB = "60000000-0000-4000-8000-000000000002";
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
beforeAll(async () => { database = await foundationDatabase(); await database.query("insert into auth.users(id,email) values ($1,'career-a@example.test'),($2,'career-b@example.test')", [ownerA,ownerB]); });
beforeEach(async () => { await database.exec("begin; set constraints all immediate;"); });
afterEach(async () => { await database.exec("rollback; reset role;"); });
afterAll(async () => { await database?.close(); });

describe("Phase 4 study data and timer boundaries", () => {
  it("keeps owned tables read-only through direct grants and private through RLS", async () => {
    for (const table of ["study_categories","study_sessions","focus_timers"]) {
      expect((await database.query<{ enabled: boolean }>("select relrowsecurity enabled from pg_class where oid=$1::regclass", [`public.${table}`])).rows[0].enabled).toBe(true);
      for (const privilege of ["insert","update","delete"])
        expect((await database.query<{ allowed: boolean }>("select has_table_privilege('authenticated',$1,$2) allowed", [`public.${table}`,privilege])).rows[0].allowed).toBe(false);
      await database.exec("set role anon");
      await expectDbError(() => database.query(`select * from public.${table}`), "42501");
      await database.exec("reset role");
    }
  });

  it("sets up definitions idempotently without invented study time", async () => {
    await authenticate(ownerA);
    await rpc("setup_career", { dailyMinutes: 150, weeklyMinutes: 720 });
    await rpc("setup_career", { dailyMinutes: 150, weeklyMinutes: 720 });
    expect((await database.query("select id from metric_definitions where user_id=$1 and starter_key='study-duration'", [ownerA])).rows).toHaveLength(1);
    expect((await database.query("select id from metric_targets where user_id=$1", [ownerA])).rows).toHaveLength(2);
    expect((await database.query("select id from frequency_targets where user_id=$1 and starter_key='study-sessions'", [ownerA])).rows).toHaveLength(1);
    expect((await database.query("select id from study_sessions where user_id=$1", [ownerA])).rows).toHaveLength(0);
  });

  it("preserves a manual session's chosen date and revision, with owner isolation", async () => {
    const date = await today();
    await authenticate(ownerA);
    const category = await rpc<{ id: string }>("save_study_category", { name: "Algorithms", position: 0 });
    const input = { id: null, expectedRevision: null, categoryId: category.id, challengeId: null, date, durationSeconds: 5400, startAt: null, endAt: null, topic: "Graphs", notes: "" };
    const session = await rpc<{ id: string }>("save_study_session", input);
    expect((await database.query<{ business_date: string; duration_seconds: number }>("select business_date::text,duration_seconds from study_sessions where id=$1", [session.id])).rows[0]).toMatchObject({ business_date: date, duration_seconds: 5400 });
    await database.exec("reset role"); await authenticate(ownerB);
    expect((await database.query("select id from study_sessions where id=$1", [session.id])).rows).toHaveLength(0);
    await expectDbError(() => rpc("save_study_session", { ...input, id: session.id }), "42501");
  });

  it("retains sessions after category archive and validates overnight timestamps", async () => {
    const date = await today();
    const previous = (await database.query<{ date: string }>("select (($1::date-interval '1 day')::date)::text date", [date])).rows[0].date;
    await authenticate(ownerA);
    const category = await rpc<{ id: string; updated_at: string }>("save_study_category", { name: "Archived course", position: 0 });
    await rpc("save_study_session", { categoryId: category.id, challengeId: null, date, durationSeconds: 7200, startAt: `${previous}T18:00:00Z`, endAt: `${previous}T20:00:00Z`, topic: "Overnight", notes: "" });
    await rpc("save_study_category", { id: category.id, expectedUpdatedAt: category.updated_at, categoryId: null, name: "Archived course", position: 0, archive: true });
    expect((await database.query("select id from study_sessions where study_category_id=$1", [category.id])).rows).toHaveLength(1);
    await expectDbError(() => rpc("start_focus_timer", { categoryId: category.id }), "42501");
    await expectDbError(() => rpc("save_study_session", { categoryId: category.id, date, durationSeconds: 3600 }), "42501");
  });

  it("keeps one active timer, survives pause/resume, and finishes idempotently", async () => {
    await authenticate(ownerA);
    const category = await rpc<{ id: string }>("save_study_category", { name: "Systems", position: 0 });
    const timer = await rpc<{ id: string; revision: number }>("start_focus_timer", { categoryId: category.id, challengeId: null, topic: "Focus", notes: "" });
    await expectDbError(() => rpc("start_focus_timer", { categoryId: category.id }), "23505");
    await database.exec("reset role");
    await database.query("update focus_timers set running_since=now()-interval '70 seconds' where id=$1", [timer.id]);
    await authenticate(ownerA);
    const revision = (await database.query<{ revision: number }>("select revision from focus_timers where id=$1", [timer.id])).rows[0].revision;
    const paused = (await database.query<{ result: { timer: { revision: number; accumulated_seconds: number } } }>("select public.control_focus_timer($1::uuid,'pause',$2::bigint) result", [timer.id,revision])).rows[0].result.timer;
    expect(paused.accumulated_seconds).toBeGreaterThanOrEqual(70);
    const resumed = (await database.query<{ result: { timer: { revision: number } } }>("select public.control_focus_timer($1::uuid,'resume',$2::bigint) result", [timer.id,paused.revision])).rows[0].result.timer;
    const finished = (await database.query<{ result: { session: { id: string; duration_seconds: number } } }>("select public.control_focus_timer($1::uuid,'finish',$2::bigint) result", [timer.id,resumed.revision])).rows[0].result.session;
    const retry = (await database.query<{ result: { session: { id: string } } }>("select public.control_focus_timer($1::uuid,'finish',$2::bigint) result", [timer.id,resumed.revision])).rows[0].result.session;
    expect(retry.id).toBe(finished.id);
    expect((await database.query("select id from study_sessions where timer_id=$1", [timer.id])).rows).toHaveLength(1);
  });

  it("rejects another owner's category and timer", async () => {
    await authenticate(ownerA);
    const category = await rpc<{ id: string }>("save_study_category", { name: "Private category", position: 0 });
    const timer = await rpc<{ id: string }>("start_focus_timer", { categoryId: category.id });
    await database.exec("reset role"); await authenticate(ownerB);
    await expectDbError(() => rpc("start_focus_timer", { categoryId: category.id }), "42501");
    await expectDbError(() => database.query("select public.control_focus_timer($1::uuid,'discard',1)", [timer.id]), "42501");
  });

  it("discards without making a session and releases the active slot", async () => {
    await authenticate(ownerA);
    const category = await rpc<{ id: string }>("save_study_category", { name: "Focus", position: 0 });
    const timer = await rpc<{ id: string; revision: number }>("start_focus_timer", { categoryId: category.id });
    const discarded = (await database.query<{ result: { timer: { status: string } } }>("select public.control_focus_timer($1::uuid,'discard',$2::bigint) result", [timer.id,timer.revision])).rows[0].result.timer;
    expect(discarded.status).toBe("discarded");
    expect((await database.query("select id from study_sessions where user_id=$1", [ownerA])).rows).toHaveLength(0);
    expect((await rpc<{ id: string }>("start_focus_timer", { categoryId: category.id })).id).not.toBe(timer.id);
  });
});
