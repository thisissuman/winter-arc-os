import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { foundationDatabase } from "../../scripts/database.mjs";

const ownerA = "70000000-0000-4000-8000-000000000001";
const ownerB = "70000000-0000-4000-8000-000000000002";
let database: PGlite;
async function authenticate(owner: string) { await database.exec("set role authenticated"); await database.query("select set_config('request.jwt.claim.sub',$1,true)", [owner]); }
async function rpc<T>(name: string, input: Record<string, unknown>): Promise<T> {
  return (await database.query<{ result: T }>(`select public.${name}($1::jsonb) result`, [JSON.stringify(input)])).rows[0].result;
}
async function expectDbError(operation: () => Promise<unknown>, code: string) {
  await database.exec("savepoint expected_error");
  try { await expect(operation()).rejects.toMatchObject({ code }); }
  finally { await database.exec("rollback to savepoint expected_error; release savepoint expected_error;"); }
}
beforeAll(async () => { database = await foundationDatabase(); await database.query("insert into auth.users(id,email) values ($1,'planning-a@example.test'),($2,'planning-b@example.test')", [ownerA, ownerB]); });
beforeEach(async () => { await database.exec("begin; set constraints all immediate;"); });
afterEach(async () => { await database.exec("rollback; reset role;"); });
afterAll(async () => { await database?.close(); });

describe("Phase 5 planning ownership and operations", () => {
  it("protects all planning tables with owner RLS and checked RPC writes", async () => {
    for (const table of ["tasks", "goals", "goal_milestones", "task_carry_operations"]) {
      expect((await database.query<{ enabled: boolean }>("select relrowsecurity enabled from pg_class where oid=$1::regclass", [`public.${table}`])).rows[0].enabled).toBe(true);
      for (const privilege of ["insert", "update", "delete"])
        expect((await database.query<{ allowed: boolean }>("select has_table_privilege('authenticated',$1,$2) allowed", [`public.${table}`, privilege])).rows[0].allowed).toBe(false);
      await database.exec("set role anon");
      await expectDbError(() => database.query(`select * from public.${table}`), "42501");
      await database.exec("reset role");
    }
  });

  it("saves owned tasks with separate estimate/actual, completion, and reorder", async () => {
    await authenticate(ownerA);
    const first = await rpc<{ id: string; revision: number; position: number }>("save_planning_task", { date: "2026-10-01", title: "Read", status: "todo", priority: "high", estimatedSeconds: 3600, actualSeconds: null });
    const second = await rpc<{ id: string; revision: number; position: number }>("save_planning_task", { date: "2026-10-01", title: "Review", status: "todo", priority: "normal", estimatedSeconds: 1800, actualSeconds: 600 });
    expect(first.position).toBeLessThan(second.position);
    const reordered = (await database.query<{ result: { position: number } }>("select public.move_planning_task($1::uuid,'up',$2::bigint) result", [second.id, second.revision])).rows[0].result;
    expect(reordered.position).toBe(first.position);
    const latestRevision = (await database.query<{ revision: number }>("select revision from tasks where id=$1", [first.id])).rows[0].revision;
    const completed = (await database.query<{ result: { status: string; completed_at: string; actual_seconds: number | null } }>("select public.set_planning_task_status($1::uuid,'completed',$2::bigint) result", [first.id, latestRevision])).rows[0].result;
    expect(completed).toMatchObject({ status: "completed", actual_seconds: null });
    expect(completed.completed_at).toBeTruthy();
    await expectDbError(() => database.query("select public.set_planning_task_status($1::uuid,'todo',$2::bigint)", [first.id, first.revision]), "40001");
  });

  it("copies only unfinished tasks, returns the same copy on retry, and moves atomically", async () => {
    await authenticate(ownerA);
    const unfinished = await rpc<{ id: string }>("save_planning_task", { date: "2026-10-01", title: "Unfinished", status: "in_progress", priority: "normal", estimatedSeconds: 1200, actualSeconds: 200 });
    await rpc("save_planning_task", { date: "2026-10-01", title: "Done", status: "completed", priority: "low" });
    const op = "70000000-0000-4000-8000-000000000099";
    const query = "select public.carry_planning_tasks($1::uuid,'2026-10-01','2026-10-02','copy') result";
    const first = (await database.query<{ result: { result_ids: string[] } }>(query, [op])).rows[0].result;
    const retry = (await database.query<{ result: { result_ids: string[] } }>(query, [op])).rows[0].result;
    expect(first.result_ids).toHaveLength(1);
    expect(retry.result_ids).toEqual(first.result_ids);
    expect(first.result_ids[0]).not.toBe(unfinished.id);
    expect((await database.query("select id from tasks where user_id=$1 and business_date='2026-10-02'", [ownerA])).rows).toHaveLength(1);
    expect((await database.query<{ status: string; estimated_seconds: number; actual_seconds: number | null }>("select status,estimated_seconds,actual_seconds from tasks where id=$1", [first.result_ids[0]])).rows[0]).toMatchObject({ status: "todo", estimated_seconds: 1200, actual_seconds: null });
    await expectDbError(() => database.query("select public.carry_planning_tasks($1::uuid,'2026-10-01','2026-10-03','copy')", [op]), "23514");
    const moved = (await database.query<{ result: { result_ids: string[] } }>("select public.carry_planning_tasks('70000000-0000-4000-8000-000000000100'::uuid,'2026-10-01','2026-10-03','move') result")).rows[0].result;
    expect(moved.result_ids).toEqual([unfinished.id]);
    expect((await database.query<{ business_date: string }>("select business_date::text from tasks where id=$1", [unfinished.id])).rows[0].business_date).toBe("2026-10-03");
  });

  it("preserves owned goal relationships and milestone history across progress modes", async () => {
    await authenticate(ownerA);
    const goal = await rpc<{ id: string; revision: number }>("save_planning_goal", { title: "Finish a course", progressMode: "milestone", manualPercent: 0, status: "active" });
    const milestone = await rpc<{ id: string; revision: number }>("save_goal_milestone", { goalId: goal.id, title: "Module one", completed: false });
    const completed = await rpc<{ completed_at: string }>("save_goal_milestone", { id: milestone.id, goalId: goal.id, expectedRevision: milestone.revision, title: "Module one", completed: true });
    expect(completed.completed_at).toBeTruthy();
    await expectDbError(() => rpc("save_planning_goal", { id: goal.id, expectedRevision: goal.revision, title: "Bad metric", progressMode: "metric", metricBaseline: 5, metricTarget: 5 }), "42501");
    expect((await database.query("select id from goal_milestones where goal_id=$1", [goal.id])).rows).toHaveLength(1);
  });

  it("rejects cross-owner task, goal, and milestone references", async () => {
    await authenticate(ownerA);
    const goal = await rpc<{ id: string }>("save_planning_goal", { title: "Private goal", progressMode: "manual", manualPercent: 25, status: "active" });
    const task = await rpc<{ id: string }>("save_planning_task", { date: "2026-10-01", title: "Private task", status: "todo", priority: "normal", goalId: goal.id });
    await database.exec("reset role"); await authenticate(ownerB);
    expect((await database.query("select id from tasks where id=$1", [task.id])).rows).toHaveLength(0);
    await expectDbError(() => rpc("save_planning_task", { date: "2026-10-01", title: "Cross owner", status: "todo", priority: "normal", goalId: goal.id }), "42501");
    await expectDbError(() => rpc("save_goal_milestone", { goalId: goal.id, title: "Cross owner" }), "42501");
    await expectDbError(() => database.query("select public.set_planning_task_status($1::uuid,'completed',1)", [task.id]), "42501");
  });
});
