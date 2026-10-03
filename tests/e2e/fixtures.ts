import { expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../src/types/database";
export async function fixture() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  if (
    !url ||
    !process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_URL !== url ||
    new URL(url).hostname !== "trdizdsjivorkffjjywe.supabase.co"
  )
    throw new Error("Confirmed development project credentials required.");
  const admin = createClient<Database>(url, process.env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const email = `winterarc.simple.${crypto.randomUUID()}@example.test`,
    password = crypto.randomUUID() + "Aa1!";
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: "Simple habit fixture" },
  });
  if (error || !data.user)
    throw new Error("Could not create disposable account");
  const id = data.user.id;
  const client = createClient<Database>(
    url,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const login = await client.auth.signInWithPassword({ email, password });
  if (login.error) {
    await admin.auth.admin.deleteUser(id);
    throw new Error("Disposable account login failed");
  }
  return {
    id,
    email,
    password,
    client,
    async close() {
      await client.auth.signOut({ scope: "local" });
      const lookup = await admin.auth.admin.getUserById(id);
      if (lookup.data.user) {
        const result = await admin.auth.admin.deleteUser(id);
        if (result.error) throw new Error("Fixture cleanup failed");
      } else if (lookup.error && lookup.error.status !== 404)
        throw new Error("Fixture cleanup verification failed");
    },
  };
}
export type Fixture = Awaited<ReturnType<typeof fixture>>;
export async function signIn(page: Page, value: Fixture) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(value.email);
  await page.getByLabel("Password", { exact: true }).fill(value.password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/today$/, { timeout: 20000 });
  await expect(
    page.getByRole("heading", { name: "Today", exact: true }),
  ).toBeVisible();
}
