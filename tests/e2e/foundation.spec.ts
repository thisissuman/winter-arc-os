import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

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

test("invalid confirmation stays on a trusted application destination", async ({ page }) => {
  await page.goto("/auth/confirm?next=https://attacker.example");
  await expect(page).toHaveURL(/\/login\?notice=invalid-link$/);
  await expect(page.getByRole("alert").filter({ hasText: "invalid or has expired" })).toBeVisible();
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

test("authenticated account persists, profile saves, theme changes, and logout protects the workspace", async ({ page }) => {
  test.skip(!process.env.E2E_AUTH_EMAIL || !process.env.E2E_AUTH_PASSWORD, "Requires an explicitly supplied dedicated, confirmed test account with migrations applied.");
  await page.goto("/login");
  await page.getByLabel("Email address").fill(process.env.E2E_AUTH_EMAIL!);
  await page.getByLabel("Password", { exact: true }).fill(process.env.E2E_AUTH_PASSWORD!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/today$/);
  await expect(page.getByRole("heading", { name: "Today", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Today", exact: true })).toBeVisible();
  await page.locator('a[href="/settings"]:visible').click();
  const originalName = await page.getByLabel("Display name").inputValue();
  const originalTheme = await page.getByLabel("Color theme").inputValue();
  await page.getByLabel("Display name").fill("Foundation test account");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByRole("status")).toContainText("Profile saved.");
  await page.reload();
  await expect(page.getByLabel("Display name")).toHaveValue("Foundation test account");
  await page.getByLabel("Display name").fill(originalName);
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByRole("status")).toContainText("Profile saved.");
  await page.getByLabel("Color theme").selectOption("light");
  await page.getByRole("button", { name: "Save appearance" }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.getByLabel("Color theme").selectOption(originalTheme);
  await page.getByRole("button", { name: "Save appearance" }).click();
  await expect(page.getByText("Appearance saved.")).toBeVisible();
  await page.getByRole("button", { name: "Sign out", exact: true }).last().click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/today");
  await expect(page).toHaveURL(/\/login$/);
});
