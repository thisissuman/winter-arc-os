import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { foundationDatabase } from "../../scripts/database.mjs";

const ownerA = "80000000-0000-4000-8000-000000000001";
const ownerB = "80000000-0000-4000-8000-000000000002";
let database: PGlite;
async function asOwner(owner: string) {
  await database.exec("set role authenticated");
  await database.query("select set_config('request.jwt.claim.sub',$1,true)", [owner]);
}
async function save(name: "save_weekly_review" | "save_monthly_reflection", input: Record<string, unknown>) {
  return (await database.query<{ result: { id: string; revision: number; week_starts_on?: number } }>(
    `select public.${name}($1::jsonb) result`, [JSON.stringify(input)])).rows[0].result;
}
async function expectCode(operation: () => Promise<unknown>, code: string) {
  await database.exec("savepoint rejected");
  try { await expect(operation()).rejects.toMatchObject({ code }); }
  finally { await database.exec("rollback to savepoint rejected; release savepoint rejected"); }
}
beforeAll(async () => {
  database = await foundationDatabase();
  await database.query("insert into auth.users(id,email) values ($1,'reflection-a@example.test'),($2,'reflection-b@example.test')", [ownerA, ownerB]);
});
beforeEach(async () => { await database.exec("begin; set constraints all immediate"); });
afterEach(async () => { await database.exec("rollback; reset role"); });
afterAll(async () => { await database?.close(); });

describe("Phase 7 reflection isolation and period anchors", () => {
  it("protects both review tables from anonymous and direct writes", async () => {
    for (const table of ["weekly_reviews", "monthly_reflections"]) {
      expect((await database.query<{ enabled: boolean }>("select relrowsecurity enabled from pg_class where oid=$1::regclass", [`public.${table}`])).rows[0].enabled).toBe(true);
      for (const operation of ["insert", "update", "delete"])
        expect((await database.query<{ allowed: boolean }>("select has_table_privilege('authenticated',$1,$2) allowed", [`public.${table}`, operation])).rows[0].allowed).toBe(false);
      await database.exec("set role anon");
      await expectCode(() => database.query(`select * from public.${table}`), "42501");
      await database.exec("reset role");
    }
  });

  it("creates one weekly review, edits it with a revision, and preserves its original anchor", async () => {
    await asOwner(ownerA);
    const first = await save("save_weekly_review", { periodStart: "2026-09-28", wins: "Showed up", energy: 4 });
    expect(first.week_starts_on).toBe(1);
    expect((await database.query("select id from weekly_reviews where user_id=$1", [ownerA])).rows).toHaveLength(1);
    await expectCode(() => save("save_weekly_review", { periodStart: "2026-09-28", wins: "Blind overwrite" }), "40001");
    const edited = await save("save_weekly_review", { periodStart: "2026-09-28", expectedRevision: first.revision, wins: "Stayed steady", mood: 3 });
    expect(edited.id).toBe(first.id);
    expect(edited.revision).not.toBe(first.revision);
    await database.exec("reset role");
    await database.query("update user_preferences set week_starts_on=7 where user_id=$1", [ownerA]);
    await asOwner(ownerA);
    const later = await save("save_weekly_review", { periodStart: "2026-09-28", expectedRevision: edited.revision, lessons: "Keep going" });
    expect(later.week_starts_on).toBe(1);
    await expectCode(() => save("save_weekly_review", { periodStart: "2026-09-29" }), "23514");
  });

  it("keeps monthly reflections unique and rejects invalid period/ratings", async () => {
    await asOwner(ownerA);
    const first = await save("save_monthly_reflection", { periodStart: "2026-09-01", biggestWins: "Training" });
    const edited = await save("save_monthly_reflection", { periodStart: "2026-09-01", expectedRevision: first.revision, notes: "Rest helped" });
    expect(edited.id).toBe(first.id);
    await expectCode(() => save("save_monthly_reflection", { periodStart: "2026-09-02" }), "23514");
    await expectCode(() => save("save_weekly_review", { periodStart: "2026-09-28", energy: 6 }), "23514");
    await expectCode(() => save("save_weekly_review", { periodStart: "2099-09-28" }), "23514");
  });

  it("prevents another owner from reading or changing reviews", async () => {
    await asOwner(ownerA);
    await save("save_weekly_review", { periodStart: "2026-09-28", wins: "Private" });
    await save("save_monthly_reflection", { periodStart: "2026-09-01", notes: "Private" });
    await database.exec("reset role");
    await asOwner(ownerB);
    expect((await database.query("select id from weekly_reviews")).rows).toHaveLength(0);
    expect((await database.query("select id from monthly_reflections")).rows).toHaveLength(0);
    await expectCode(() => database.query("insert into weekly_reviews(user_id,week_start,week_starts_on,timezone) values($1,'2026-09-28',1,'Asia/Kolkata')", [ownerA]), "42501");
    await save("save_weekly_review", { periodStart: "2026-09-28", wins: "Mine" });
    expect((await database.query("select id from weekly_reviews")).rows).toHaveLength(1);
  });
});
