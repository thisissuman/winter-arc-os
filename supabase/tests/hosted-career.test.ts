import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { foundationDatabase } from "../../scripts/database.mjs";

let database: PGlite;
beforeAll(async () => { database = await foundationDatabase(); });
afterAll(async () => { await database?.close(); });
describe("hosted Phase 4 rollback-only script", () => {
  it("passes locally and removes both fixture users", async () => {
    const script = await readFile(new URL("./hosted-career.sql", import.meta.url), "utf8");
    const result = await database.exec(script);
    expect(result.at(-1)?.rows).toEqual([{ result: "Phase 4 career security checks passed; all fixtures rolled back" }]);
    expect((await database.query("select id from auth.users where raw_user_meta_data->>'display_name' like 'Career fixture %'")).rows).toHaveLength(0);
  });
});
