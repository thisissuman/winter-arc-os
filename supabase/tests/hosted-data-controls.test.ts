import { afterAll, beforeAll, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { foundationDatabase } from "../../scripts/database.mjs";
let database: PGlite;
beforeAll(async () => { database = await foundationDatabase(); });
afterAll(async () => { await database?.close(); });
it("passes the hosted data-control script locally and rolls back both owners", async () => {
  const result = await database.exec(await readFile(new URL("./hosted-data-controls.sql", import.meta.url), "utf8"));
  expect(result.at(-1)?.rows).toEqual([{ result: "Phase 8 data-control security checks passed; all fixtures rolled back" }]);
  expect((await database.query("select id from auth.users where raw_user_meta_data->>'display_name' like 'Data control fixture %'")).rows).toHaveLength(0);
});
