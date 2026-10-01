import { readFile } from "node:fs/promises";
import { expect, it } from "vitest";
import { foundationDatabase } from "../../scripts/database.mjs";

it("validates the rollback-only Phase 3 hosted security script locally", async () => {
  const database = await foundationDatabase();
  try {
    const sql = await readFile(new URL("./hosted-fitness.sql", import.meta.url), "utf8");
    await database.exec(sql);
    expect((await database.query<{ count: number }>("select count(*)::integer as count from auth.users")).rows[0].count).toBe(0);
  } finally {
    await database.close();
  }
});
