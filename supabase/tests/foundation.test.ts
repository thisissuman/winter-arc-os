import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { foundationDatabase } from "../../scripts/database.mjs";

const ownerA = "10000000-0000-4000-8000-000000000001";
const ownerB = "10000000-0000-4000-8000-000000000002";
const ownerC = "10000000-0000-4000-8000-000000000003";
const areaA = "20000000-0000-4000-8000-000000000001";
const areaB = "20000000-0000-4000-8000-000000000002";
const tables = ["profiles", "user_preferences", "life_areas", "categories"] as const;
let database: PGlite;

async function authenticate(owner: string) {
  await database.exec("set role authenticated");
  await database.query("select set_config('request.jwt.claim.sub', $1, true)", [owner]);
}

beforeAll(async () => {
  database = await foundationDatabase();
  await database.query("insert into auth.users(id, email, raw_user_meta_data) values ($1, 'a@example.test', '{\"display_name\":\"Owner A\"}'), ($2, 'b@example.test', '{}')", [ownerA, ownerB]);
  await database.query("insert into life_areas(id, user_id, name) values ($1,$2,'Health'), ($3,$4,'Career')", [areaA, ownerA, areaB, ownerB]);
  await database.query("insert into categories(user_id,life_area_id,name) values ($1,$2,'Fitness'),($3,$4,'Study')", [ownerA, areaA, ownerB, areaB]);
});
beforeEach(async () => { await database.exec("begin; set constraints all immediate;"); });
afterEach(async () => { await database.exec("rollback; reset role;"); });
afterAll(async () => { await database?.close(); });

describe("fresh migration and user initialization", () => {
  it("keeps the four foundation tables protected after later migrations", async () => {
    const { rows } = await database.query<{ name: string; secured: boolean }>("select relname name, relrowsecurity secured from pg_class c join pg_namespace n on c.relnamespace=n.oid where n.nspname='public' and relkind='r' order by relname");
    expect(rows.map((row) => row.name)).toEqual(expect.arrayContaining([...tables]));
    expect(rows.every((row) => row.secured)).toBe(true);
  });
  it("initializes real profile/preferences defaults without tracking records", async () => {
    const { rows } = await database.query("select p.display_name, u.timezone, u.week_starts_on, u.theme from profiles p join user_preferences u using(user_id) where user_id=$1", [ownerA]);
    expect(rows[0]).toMatchObject({ display_name: "Owner A", timezone: "Asia/Kolkata", week_starts_on: 1, theme: "dark" });
  });
  it("does not overwrite a profile during safe re-initialization", async () => {
    await database.query("update profiles set display_name='Edited' where user_id=$1", [ownerA]);
    await database.exec("create trigger test_reinitialize after update on auth.users for each row execute function private.initialize_user()");
    await database.query("update auth.users set raw_user_meta_data='{}' where id=$1", [ownerA]);
    expect((await database.query<{ display_name: string }>("select display_name from profiles where user_id=$1", [ownerA])).rows[0].display_name).toBe("Edited");
  });
  it("keeps the auth insert atomic if initialization fails", async () => {
    await database.exec("create function private.test_fail() returns trigger language plpgsql as $$ begin raise exception 'test failure'; end; $$; create trigger test_failure before insert on user_preferences for each row execute function private.test_fail(); savepoint initialization");
    await expect(database.query("insert into auth.users(id) values ($1)", [ownerC])).rejects.toThrow("test failure");
    await database.exec("rollback to savepoint initialization");
    expect((await database.query("select * from auth.users where id=$1", [ownerC])).rows).toHaveLength(0);
    expect((await database.query("select * from profiles where user_id=$1", [ownerC])).rows).toHaveLength(0);
  });
  it("denies direct execution of privileged initializer", async () => {
    const { rows } = await database.query<{ allowed: boolean }>("select has_function_privilege('authenticated', 'private.initialize_user()', 'execute') allowed");
    expect(rows[0].allowed).toBe(false);
  });
});

describe.each(tables)("%s ownership", (table) => {
  it("rejects anonymous reads", async () => {
    await database.exec("set role anon");
    await expect(database.query(`select * from ${table}`)).rejects.toMatchObject({ code: "42501" });
  });
  it.each(["insert", "update", "delete"])("rejects anonymous %s", async (operation) => {
    await database.exec("set role anon");
    const insert = table === "profiles" || table === "user_preferences"
      ? `insert into ${table}(user_id) values ($1)`
      : `insert into ${table}(user_id,name) values ($1,'Anonymous')`;
    const sql = operation === "insert" ? insert : operation === "update"
      ? `update ${table} set updated_at=now() where user_id=$1`
      : `delete from ${table} where user_id=$1`;
    await expect(database.query(sql, [ownerA])).rejects.toMatchObject({ code: "42501" });
  });
  it("returns only the caller's row", async () => {
    await authenticate(ownerA);
    const { rows } = await database.query<{ user_id: string }>(`select * from ${table}`);
    expect(rows).toHaveLength(1);
    expect(rows[0].user_id).toBe(ownerA);
  });
  it("also isolates user B from A", async () => {
    await authenticate(ownerB);
    expect((await database.query<{ user_id: string }>(`select * from ${table}`)).rows.map((row) => row.user_id)).toEqual([ownerB]);
  });
  it("cannot update someone else's record", async () => {
    await authenticate(ownerA);
    expect((await database.query(`update ${table} set updated_at=now() where user_id=$1 returning user_id`, [ownerB])).rows).toHaveLength(0);
  });
  it("cannot delete someone else's record", async () => {
    await authenticate(ownerA);
    expect((await database.query(`delete from ${table} where user_id=$1 returning user_id`, [ownerB])).rows).toHaveLength(0);
  });
  it("cannot forge an owner on insert", async () => {
    await authenticate(ownerA);
    const columns = table === "profiles" || table === "user_preferences" ? "user_id" : "user_id, name";
    const values = columns === "user_id" ? "$1" : "$1, 'Forged'";
    await expect(database.query(`insert into ${table} (${columns}) values (${values})`, [ownerB])).rejects.toMatchObject({ code: "42501" });
  });
  it("cannot transfer ownership during update", async () => {
    await authenticate(ownerA);
    await expect(database.query(`update ${table} set user_id=$1 where user_id=$2`, [ownerB, ownerA])).rejects.toMatchObject({ code: "42501" });
  });
  it("can update its own record", async () => {
    await authenticate(ownerA);
    expect((await database.query(`update ${table} set updated_at=now() where user_id=$1 returning user_id`, [ownerA])).rows).toHaveLength(1);
  });
  it("can insert its own valid record", async () => {
    await authenticate(ownerA);
    if (table === "profiles" || table === "user_preferences") await database.query(`delete from ${table} where user_id=$1`, [ownerA]);
    const columns = table === "profiles" || table === "user_preferences" ? "user_id" : "user_id,name";
    const values = columns === "user_id" ? "$1" : "$1,'Own record'";
    expect((await database.query(`insert into ${table}(${columns}) values (${values}) returning user_id`, [ownerA])).rows).toHaveLength(1);
  });
  it("can delete its own record without deleting another owner's", async () => {
    await authenticate(ownerA);
    if (table === "life_areas") await database.query("delete from categories where user_id=$1", [ownerA]);
    expect((await database.query(`delete from ${table} where user_id=$1 returning user_id`, [ownerA])).rows).toHaveLength(1);
    await database.exec("reset role");
    expect((await database.query(`select * from ${table} where user_id=$1`, [ownerB])).rows).toHaveLength(1);
  });
});

describe("relationships and constraints", () => {
  it("rejects a cross-owner area reference on insert", async () => {
    await authenticate(ownerA);
    await expect(database.query("insert into categories(user_id, life_area_id, name) values ($1,$2,'Invalid')", [ownerA, areaB])).rejects.toMatchObject({ code: "23503" });
  });
  it("rejects a cross-owner area reference on update", async () => {
    await authenticate(ownerA);
    await expect(database.query("update categories set life_area_id=$1 where user_id=$2", [areaB, ownerA])).rejects.toMatchObject({ code: "23503" });
  });
  it("allows valid own area/category insert and delete", async () => {
    await authenticate(ownerA);
    const { rows } = await database.query<{ id: string }>("insert into categories(user_id, life_area_id, name) values ($1,$2,'Nutrition') returning id", [ownerA, areaA]);
    expect((await database.query("delete from categories where id=$1 returning id", [rows[0].id])).rows).toHaveLength(1);
  });
  it.each([
    ["timezone", "'Not/A_Zone'"], ["theme", "'unknown'"], ["week_starts_on", "8"],
  ])("rejects invalid preference %s", async (column, value) => {
    await authenticate(ownerA);
    await expect(database.query(`update user_preferences set ${column}=${value} where user_id=$1`, [ownerA])).rejects.toMatchObject({ code: "23514" });
  });
  it("rejects whitespace-only categories", async () => {
    await authenticate(ownerA);
    await expect(database.query("insert into categories(user_id,name) values ($1,'   ')", [ownerA])).rejects.toMatchObject({ code: "23514" });
  });
  it("deleting an auth identity cascades even with category-area references", async () => {
    await database.query("delete from auth.users where id=$1", [ownerA]);
    for (const table of tables) expect((await database.query(`select * from ${table} where user_id=$1`, [ownerA])).rows).toHaveLength(0);
  });
});
