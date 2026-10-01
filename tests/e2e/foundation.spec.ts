import { expect, test, type BrowserContext } from "@playwright/test";
import { createChunks } from "@supabase/ssr/dist/main/utils/chunker.js";
import { z } from "zod";
import AxeBuilder from "@axe-core/playwright";

const sessionSchema = z.object({
  expires_at: z.number(), access_token: z.string(), refresh_token: z.string(),
  user: z.object({ id: z.string().uuid() }).passthrough(),
}).passthrough();
async function browserSession(context: BrowserContext) {
  const name = `sb-${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split(".")[0]}-auth-token`;
  const cookies = (await context.cookies()).filter((cookie) => cookie.name === name || cookie.name.startsWith(`${name}.`))
    .sort((a, b) => Number(a.name.split(".").at(-1)) - Number(b.name.split(".").at(-1)));
  if (!cookies.length) throw new Error("Expected issued session cookies after real login.");
  const encoded = cookies.map((cookie) => cookie.value).join("");
  if (!encoded.startsWith("base64-")) throw new Error("Unexpected Supabase cookie encoding.");
  return { name, cookies, session: sessionSchema.parse(JSON.parse(Buffer.from(encoded.slice(7), "base64url").toString())) };
}

test("sign-in form has working navigation and no horizontal overflow", async ({ page }, testInfo) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Welcome back." })).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: `test-results/login-${testInfo.project.name}.png`, fullPage: true });
  await page.getByRole("link", { name: "Create an account" }).click();
  await expect(page).toHaveURL(/\/signup$/);
  await page.getByRole("link", { name: "Sign in", exact: true }).click();
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await expect(page).toHaveURL(/\/forgot-password$/);
});

test("server validation rejects invalid signup without contacting auth", async ({ page }) => {
  await page.goto("/signup");
  await page.getByLabel("Your name").fill("Test person");
  await page.getByLabel("Email address").fill("invalid-email");
  await page.getByLabel("Password", { exact: true }).fill("short");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  await expect(page.getByText("Use at least 12 characters.")).toBeVisible();
  await expect(page.getByLabel("Email address")).toHaveAttribute("aria-invalid", "true");
});

test("server login validation provides labelled feedback", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Check the highlighted fields." })).toBeVisible();
  await expect(page.getByText("Enter your password.")).toBeVisible();
});

test("unauthenticated pages redirect and personal responses are not shared-cached", async ({ page, request }) => {
  for (const route of ["/today", "/settings"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login$/);
  }
  await page.goto("/reset-password");
  await expect(page).toHaveURL(/\/forgot-password$/);
  const response = await request.get("/login");
  expect(response.headers()["cache-control"]).toContain("no-store");
});

test("invalid confirmation stays on a trusted application destination", async ({ page, request }) => {
  for (const query of ["next=https://attacker.example", "code=invalid-code&next=https://attacker.example"]) {
    await page.goto(`/auth/confirm?${query}`);
    await expect(page).toHaveURL(/\/login\?notice=invalid-link$/);
    await expect(page.getByRole("alert").filter({ hasText: "invalid or has expired" })).toBeVisible();
  }
  const callback = await request.get("/auth/confirm", { maxRedirects: 0 });
  expect(callback.headers()["cache-control"]).toContain("no-store");
  expect(callback.headers()["referrer-policy"]).toBe("no-referrer");
});

test("authentication screens meet automated accessibility checks", async ({ page }) => {
  for (const route of ["/login", "/signup", "/forgot-password"]) {
    await page.goto(route);
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(violations).toEqual([]);
  }
});

test("keyboard users can reach the form and controls", async ({ page }) => {
  await page.goto("/login");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to form" })).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Email address")).toBeFocused();
});

test("authenticated account persists, profile saves, theme changes, and logout protects the workspace", async ({ page, context, request }, testInfo) => {
  test.skip(!process.env.E2E_AUTH_EMAIL || !process.env.E2E_AUTH_PASSWORD, "Requires an explicitly supplied dedicated, confirmed test account with migrations applied.");
  await page.goto("/login");
  await page.getByLabel("Email address").fill(process.env.E2E_AUTH_EMAIL!);
  await page.getByLabel("Password", { exact: true }).fill(process.env.E2E_AUTH_PASSWORD!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/today$/);
  await expect(page.getByRole("heading", { name: "Today", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Today", exact: true })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Dashboard challenge")).toBeFocused();
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: `test-results/today-${testInfo.project.name}.png`, fullPage: true });
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  if (testInfo.project.name === "desktop") {
    const viewport = page.viewportSize()!;
    await page.setViewportSize({ width: 768, height: 1024 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: "test-results/today-tablet.png", fullPage: true });
    await page.setViewportSize(viewport);
  }
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await expect(page.getByLabel("Display name")).toBeVisible();
  const issued = await browserSession(context);
  // Expire persisted metadata, retaining the real server-issued credentials.
  const stale = `base64-${Buffer.from(JSON.stringify({ ...issued.session, expires_at: 1 })).toString("base64url")}`;
  await context.clearCookies({ name: new RegExp(`^${issued.name.replaceAll(".", "\\.")}(\\.\\d+)?$`) });
  await context.addCookies(createChunks(issued.name, stale).map((chunk) => ({ ...issued.cookies[0], ...chunk })));
  await page.reload();
  await expect(page.getByLabel("Display name")).toBeVisible();
  const refreshed = await browserSession(context);
  expect(refreshed.session.expires_at > Date.now() / 1000).toBe(true);
  expect(refreshed.session.refresh_token !== issued.session.refresh_token).toBe(true);
  const originalName = await page.getByLabel("Display name").inputValue();
  const originalTheme = await page.getByLabel("Color theme").inputValue();
  const cleanupHeaders = {
    apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    Authorization: `Bearer ${refreshed.session.access_token}`,
  };
  try {
    await page.getByLabel("Display name").fill("Foundation test account");
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page.getByRole("status")).toContainText("Profile saved.");
    await page.reload();
    await expect(page.getByLabel("Display name")).toHaveValue("Foundation test account");
    await page.getByLabel("Display name").fill("");
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page.getByRole("status")).toContainText("Profile saved.");
    await page.reload();
    await expect(page.getByLabel("Display name")).toHaveValue("");
    await page.getByLabel("Display name").fill(originalName);
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page.getByRole("status")).toContainText("Profile saved.");
    await page.getByLabel("Color theme").selectOption("light");
    await page.getByRole("button", { name: "Save appearance" }).click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    await page.reload();
    await expect(page.getByLabel("Color theme")).toHaveValue("light");
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `test-results/settings-light-${testInfo.project.name}.png`, fullPage: true });
    await page.getByLabel("Color theme").selectOption(originalTheme);
    await page.getByRole("button", { name: "Save appearance" }).click();
    await expect(page.getByText("Appearance saved.")).toBeVisible();
  } finally {
    // Restore the dedicated fixture even if a browser assertion fails, using ordinary owner-scoped access.
    const endpoint = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1`;
    const ownerFilter = `user_id=eq.${refreshed.session.user.id}`;
    const profile = await request.patch(`${endpoint}/profiles?${ownerFilter}`, { headers: cleanupHeaders, data: { display_name: originalName } });
    const preference = await request.patch(`${endpoint}/user_preferences?${ownerFilter}`, { headers: cleanupHeaders, data: { theme: originalTheme } });
    if (!profile.ok() || !preference.ok()) throw new Error("Dedicated test-account cleanup failed.");
  }
  await page.getByRole("button", { name: "Sign out", exact: true }).last().click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/today");
  await expect(page).toHaveURL(/\/login$/);
});
