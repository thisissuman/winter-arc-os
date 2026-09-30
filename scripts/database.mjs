import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export async function foundationDatabase() {
  const database = new PGlite();
  await database.exec(await readFile(new URL("../supabase/tests/bootstrap.sql", import.meta.url), "utf8"));
  const directory = new URL("../supabase/migrations/", import.meta.url);
  const files = (await readdir(directory)).filter((name) => name.endsWith(".sql")).sort();
  for (const file of files) await database.exec(await readFile(`${fileURLToPath(directory)}${file}`, "utf8"));
  return database;
}
