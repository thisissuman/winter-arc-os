import { readFile } from "node:fs/promises";
import { it, expect } from "vitest";
import { foundationDatabase } from "../../scripts/database.mjs";

it("validates the rollback-only hosted security script against a fresh schema", async () => {
  const database = await foundationDatabase();
  try {
    await database.exec(await readFile(new URL("./hosted-foundation.sql", import.meta.url), "utf8"));
    const { rows } = await database.query<{ count: number }>("select count(*)::integer as count from auth.users");
    expect(rows[0].count).toBe(0);
  } finally {
    await database.close();
  }
});
