import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { foundationDatabase } from "../../scripts/database.mjs";
let db: PGlite;
beforeAll(async () => {
  db = await foundationDatabase();
});
afterAll(async () => {
  await db?.close();
});
describe("five-table foundation", () => {
  it("replays the immutable migration chain to exactly five secured tables", async () => {
    const { rows } = await db.query<{ tablename: string }>(
      "select tablename from pg_tables where schemaname='public' order by tablename",
    );
    expect(rows.map((r) => r.tablename)).toEqual([
      "habit_logs",
      "habit_schedules",
      "habits",
      "profiles",
      "user_preferences",
    ]);
    expect(
      (
        await db.query(
          "select relname from pg_class join pg_namespace on pg_namespace.oid=relnamespace where nspname='public' and relkind='r' and not relrowsecurity",
        )
      ).rows,
    ).toEqual([]);
  });
  it("has only the six intended public callable routines", async () => {
    const { rows } = await db.query<{ name: string }>(
      "select p.proname name from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' order by name",
    );
    expect(rows.map((r) => r.name)).toEqual([
      "archive_habit",
      "delete_habit",
      "delete_workspace_data",
      "export_workspace_data",
      "save_habit",
      "set_habit_completion",
    ]);
  });
  it("initializes accounts without starters and retains essential preferences", async () => {
    const id = "10000000-0000-4000-8000-000000000001";
    await db.query(
      "insert into auth.users(id,email,raw_user_meta_data) values($1,'a@example.test','{\"display_name\":\"Ada\"}')",
      [id],
    );
    expect(
      (
        await db.query("select display_name from profiles where user_id=$1", [
          id,
        ])
      ).rows[0],
    ).toMatchObject({ display_name: "Ada" });
    expect(
      (
        await db.query(
          "select timezone,theme,week_starts_on,privacy_mode from user_preferences where user_id=$1",
          [id],
        )
      ).rows[0],
    ).toEqual({
      timezone: "Asia/Kolkata",
      theme: "dark",
      week_starts_on: 1,
      privacy_mode: false,
    });
    expect((await db.query("select * from habits")).rows).toEqual([]);
  });
  it("does not grant anonymous reads or direct habit writes", async () => {
    for (const table of [
      "profiles",
      "user_preferences",
      "habits",
      "habit_schedules",
      "habit_logs",
    ]) {
      expect(
        (
          await db.query<{ allowed: boolean }>(
            "select has_table_privilege('anon',$1,'select') allowed",
            ["public." + table],
          )
        ).rows[0].allowed,
      ).toBe(false);
      if (table.startsWith("habit"))
        for (const grant of ["insert", "update", "delete"])
          expect(
            (
              await db.query<{ allowed: boolean }>(
                "select has_table_privilege('authenticated',$1,$2) allowed",
                ["public." + table, grant],
              )
            ).rows[0].allowed,
          ).toBe(false);
    }
  });
});
