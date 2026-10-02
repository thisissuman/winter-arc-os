import { expect, test, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import AxeBuilder from "@axe-core/playwright";
import type { Database, Json } from "../../src/types/database";
import { businessDate, monthRange, weekRange } from "../../src/features/tracking/dates";

test.use({ trace: "off" }); // Password verification uses disposable accounts; never retain their credentials in traces.
type Fixture = { id: string; email: string; password: string; client: SupabaseClient<Database>; close(): Promise<void> };
async function fixture(): Promise<Fixture> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  if (process.env.SUPABASE_URL && process.env.SUPABASE_URL !== url) throw new Error("Test project URL mismatch");
  const admin = createClient<Database>(url, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
  const email = "winterarc.phase8." + crypto.randomUUID() + "@example.test";
  const password = crypto.randomUUID() + "Aa1!";
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { display_name: "Phase 8 fixture" } });
  if (error || !data.user) throw new Error("Could not create disposable test account");
  const id = data.user.id;
  const client = createClient<Database>(url, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
  const login = await client.auth.signInWithPassword({ email, password });
  if (login.error) { await admin.auth.admin.deleteUser(id); throw new Error("Could not sign in disposable account"); }
  return { id, email, password, client, async close() {
    await client.auth.signOut({ scope: "local" });
    const lookup = await admin.auth.admin.getUserById(id);
    if (lookup.data.user) {
      const result = await admin.auth.admin.deleteUser(id);
      if (result.error) throw new Error("Disposable account cleanup failed");
    } else if (lookup.error && lookup.error.status !== 404) throw new Error("Could not verify disposable account cleanup");
  } };
}
async function signIn(page: Page, value: Fixture) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(value.email);
  await page.getByLabel("Password", { exact: true }).fill(value.password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/today$/, { timeout: 20000 });
}
function requireCredentials() {
  test.skip(!process.env.SUPABASE_SECRET_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL, "Requires configured development server key for disposable accounts.");
}
async function rpc<T extends keyof Database["public"]["Functions"]>(value: Fixture, name: T, input: Json) {
  const result = await value.client.rpc(name as "save_tracking_habit", { p_input: input });
  if (result.error) throw new Error("Fixture mutation failed: " + name + " (" + result.error.code + ")");
  return result.data;
}

test("private HTTP endpoints deny anonymous and cross-origin requests", async ({ request }) => {
  expect((await request.get("/api/export")).status()).toBe(401);
  const response = await request.get("/api/export");
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(response.headers()["referrer-policy"]).toBe("no-referrer");
  expect((await request.post("/api/account/delete", { headers: { Origin: "https://attacker.example" }, data: { password: "wrong", confirmation: "DELETE MY ACCOUNT" } })).status()).toBe(403);
  expect((await request.post("/api/account/delete", { headers: { Origin: "http://127.0.0.1:3100" }, data: { password: "wrong", confirmation: "DELETE MY ACCOUNT" } })).status()).toBe(401);
});

test("organization, calendar, private export, workspace removal and account deletion work", async ({ page }, info) => {
  test.setTimeout(120000); requireCredentials();
  const value = await fixture();
  try {
    await signIn(page, value);
    await page.goto("/settings/organization");
    const addArea = page.locator("form").filter({ has: page.getByRole("button", { name: "Add life area", exact: true }) });
    await addArea.getByLabel("Life area name").fill("E2E area");
    await addArea.getByRole("button", { name: "Add life area", exact: true }).click();
    await expect(addArea.getByRole("status")).toContainText("Organization saved");
    await page.reload();
    const addCategory = page.locator("form").filter({ has: page.getByRole("button", { name: "Add category", exact: true }) });
    await addCategory.getByLabel("Category name").fill("E2E category");
    await addCategory.getByLabel("Life area (optional)").selectOption({ label: "E2E area" });
    await addCategory.getByRole("button", { name: "Add category", exact: true }).click();
    await expect(addCategory.getByRole("status")).toContainText("Organization saved");
    await page.reload();
    const area = page.locator("form").filter({ has: page.locator('input[name="name"][value="E2E area"]') });
    await area.getByRole("button", { name: "Archive", exact: true }).click();
    await expect(area.getByRole("status")).toContainText("Archived");
    await page.reload();
    await area.getByRole("button", { name: "Restore", exact: true }).click();
    await expect(area.getByRole("status")).toContainText("Organization saved");
    await page.goto("/settings");
    await page.getByLabel("Timezone", { exact: true }).fill("UTC");
    await page.getByLabel("Week starts on").selectOption("7");
    await page.getByRole("button", { name: "Save calendar" }).click();
    await expect(page.getByRole("status")).toContainText("Calendar preferences saved");
    await page.reload();
    await expect(page.getByLabel("Timezone", { exact: true })).toHaveValue("UTC");
    await expect(page.getByLabel("Week starts on")).toHaveValue("7");
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.screenshot({ path: "test-results/phase8-settings-" + info.project.name + ".png", fullPage: true });
    await page.goto("/settings/data");
    await expect(page.getByRole("heading", { name: "Data controls", exact: true })).toBeVisible();
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    const originalViewport = page.viewportSize()!;
    await page.setViewportSize({ width: 768, height: 1024 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.setViewportSize(originalViewport);
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download JSON export" }).click();
    expect((await download).suggestedFilename()).toMatch(/^winter-arc-os-.*\.json$/);
    const exported = await page.request.get("/api/export");
    expect(exported.status()).toBe(200);
    const payload = await exported.json();
    expect(payload.format_version).toBe(1);
    expect(Object.keys(payload.data)).toHaveLength(33);
    expect(Object.values(payload.data).every(rows => (rows as { user_id: string }[]).every(row => row.user_id === value.id))).toBe(true);
    expect(payload.data.categories).toHaveLength(1);
    expect(payload.data.tracking_operations).toBeUndefined();
    const dataSection = page.getByRole("region", { name: "Delete workspace data", exact: true });
    await dataSection.getByLabel("Type DELETE MY DATA").focus();
    await page.keyboard.press("Tab");
    await expect(dataSection.getByLabel("Current password")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(dataSection.getByRole("button", { name: "Delete workspace data", exact: true })).toBeFocused();
    await dataSection.getByLabel("Type DELETE MY DATA").fill("DELETE MY DATA");
    await dataSection.getByLabel("Current password").fill(value.password);
    await dataSection.getByRole("button", { name: "Delete workspace data", exact: true }).click();
    await expect(dataSection.getByRole("status")).toContainText("Workspace data deleted");
    const after = await (await page.request.get("/api/export")).json();
    expect(after.data.categories).toHaveLength(0);
    expect(after.data.user_preferences[0].timezone).toBe("UTC");
    expect(after.data.profiles).toHaveLength(1);
    const account = page.getByRole("region", { name: "Delete account", exact: true });
    await account.getByLabel("Type DELETE MY ACCOUNT").fill("DELETE MY ACCOUNT");
    await account.getByLabel("Current password").fill("deliberately-wrong-password");
    await account.getByRole("button", { name: "Delete my account", exact: true }).click();
    await expect(account.getByRole("alert")).toContainText("Password verification failed");
    // An arbitrary target ID is rejected even when signed in.
    expect((await page.request.post("/api/account/delete", { headers: { Origin: "http://127.0.0.1:3100" }, data: { password: value.password, confirmation: "DELETE MY ACCOUNT", userId: crypto.randomUUID() } })).status()).toBe(400);
    await account.getByLabel("Current password").fill(value.password);
    await account.getByRole("button", { name: "Delete my account", exact: true }).click();
    await expect(page).toHaveURL(/\/login\?notice=account-deleted$/, { timeout: 20000 });
    expect((await page.request.get("/api/export")).status()).toBe(401);
    await page.goto("/today"); await expect(page).toHaveURL(/\/login$/);
  } finally { await value.close(); }
});

test("PWA is installable and offline fallback caches only public files", async ({ page }, info) => {
  test.setTimeout(90000); requireCredentials();
  const value = await fixture();
  try {
    await signIn(page, value);
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
    const cdp = await page.context().newCDPSession(page);
    expect((await cdp.send("Page.getAppManifest")).errors).toEqual([]);
    expect((await cdp.send("Page.getInstallabilityErrors")).installabilityErrors).toEqual([]);
    await page.goto("/settings");
    await page.getByLabel("Display name").fill("Unsaved offline form");
    await page.context().setOffline(true);
    await expect(page.getByRole("status").filter({ hasText: "You are offline" })).toBeVisible();
    await page.getByRole("button", { name: "Save profile", exact: true }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Reconnect before saving" })).toBeVisible();
    await expect(page.getByLabel("Display name")).toHaveValue("Unsaved offline form");
    await page.goto("/today");
    await expect(page.getByRole("heading", { name: "Your workspace needs a connection." })).toBeVisible();
    await page.screenshot({ path: "test-results/phase8-offline-" + info.project.name + ".png", fullPage: true });
    const cached = await page.evaluate(async () => {
      const paths: string[] = [];
      for (const name of await caches.keys()) for (const request of await (await caches.open(name)).keys()) paths.push(new URL(request.url).pathname);
      return paths.sort();
    });
    expect(cached).toEqual(["/icons/apple-touch-icon.png", "/icons/icon-192.png", "/icons/icon-512.png", "/offline.html"]);
    await page.context().setOffline(false);
    await page.goto("/settings");
    await expect(page.getByLabel("Display name")).toHaveValue("Phase 8 fixture");
  } finally { await page.context().setOffline(false); await value.close(); }
});

test("Privacy Mode covers client payloads, secondary UI and all light-theme routes", async ({ page }, info) => {
  test.setTimeout(180000); requireCredentials();
  const value = await fixture();
  const date = businessDate("Asia/Kolkata");
  const secret = "SENSITIVE_PHASE8_" + crypto.randomUUID().slice(0, 8);
  try {
    const habitId = await rpc(value, "save_tracking_habit", { name: secret, description: secret, activeFrom: date, isPrivate: true, timeOfDay: "anytime", frequency: "DAILY", requiredCount: 1 });
    await rpc(value, "write_tracking_habit_log", { habitId, date, status: "completed", completionCount: 1, notes: secret });
    const metricId = await rpc(value, "save_tracking_metric", { name: secret, description: secret, unit: "ml", source: "manual", aggregation: "sum", activeFrom: date, isPrivate: true, targetPeriod: "daily", direction: "minimum", target: 1000 });
    await rpc(value, "write_tracking_metric_log", { metricId, date, value: 750, notes: secret });
    await rpc(value, "setup_career", {});
    const category = await rpc(value, "save_study_category", { name: secret });
    await rpc(value, "save_study_session", { categoryId: (category as unknown as { id: string }).id, date, durationSeconds: 600, topic: secret, notes: secret });
    const goal = await rpc(value, "save_planning_goal", { title: secret, description: secret, progressMode: "manual", manualPercent: 40, isPrivate: true });
    const goalId = (goal as unknown as { id: string }).id;
    await rpc(value, "save_goal_milestone", { goalId, title: secret, completed: false });
    await rpc(value, "save_planning_task", { title: secret, notes: secret, date, status: "todo", priority: "normal", isPrivate: true });
    await rpc(value, "save_weekly_review", { periodStart: weekRange(date, 1).start, wins: secret });
    await rpc(value, "save_fitness_sleep", { date, durationSeconds: 28800, notes: secret });
    const exercise = await rpc(value, "save_fitness_exercise", { name: secret, muscleGroup: "Legs" });
    const workout = await rpc(value, "save_fitness_workout", { date, name: secret, notes: secret, status: "completed", exercises: [{ exerciseId: (exercise as unknown as { id: string }).id, notes: secret, sets: [{ weightKg: 40, reps: 8, rpe: null }] }] });
    const workoutId = (workout as unknown as { id: string }).id;
    const preference = await value.client.from("user_preferences").update({ privacy_mode: true, theme: "light" }).eq("user_id", value.id);
    if (preference.error) throw new Error("Fixture preferences failed");
    await signIn(page, value);
    for (const route of ["/today", "/habits", "/metrics", "/fitness", "/fitness/workouts", "/fitness/workouts/" + workoutId, "/career", "/career/sessions", "/tasks", "/goals", "/goals/" + goalId, "/insights", "/reflection/weekly/" + weekRange(date, 1).start, "/reflection", "/reflection/monthly/" + monthRange(date).start.slice(0, 7), "/settings", "/settings/tracking", "/settings/organization", "/settings/data", "/challenges", "/track", "/plan", "/more", "/onboarding"]) {
      await page.goto(route);
      await expect(page.locator("main h1")).toBeVisible({ timeout: 20000 });
      expect(await page.content()).not.toContain(secret);
      expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    await page.goto("/settings/data");
    await page.screenshot({ path: "test-results/phase8-data-light-" + info.project.name + ".png", fullPage: true });
    const payload = await (await page.request.get("/api/export")).json();
    expect(payload.data.habits[0].name === secret).toBe(true); // Explicit export contains private source records.
    const before = await value.client.from("habit_logs").select("completion_count").eq("habit_id", habitId!);
    expect(before.data?.[0].completion_count).toBe(1);
    await value.client.from("user_preferences").update({ hide_private_today: true }).eq("user_id", value.id);
    await page.goto("/today");
    await expect(page.getByRole("button", { name: /Clear completion for Private tracker/ })).toHaveCount(0);
  } finally { await value.close(); }
});
