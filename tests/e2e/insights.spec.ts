import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(process.env.E2E_AUTH_EMAIL!);
  await page.getByLabel("Password", { exact: true }).fill(process.env.E2E_AUTH_PASSWORD!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/today$/);
}

test("Insights shows bounded, accessible source and score summaries", async ({ page }) => {
  test.setTimeout(90000);
  test.skip(!process.env.E2E_AUTH_EMAIL || !process.env.E2E_AUTH_PASSWORD, "Requires the dedicated confirmed test account.");
  await signIn(page);
  await page.goto("/insights");
  await expect(page.getByRole("heading", { name: "Insights" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Score over time" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Consistency by date" })).toBeVisible();
  for (const name of ["Overall", "Fitness", "Career", "Habits"])
    await expect(page.getByRole("region", { name: `${name} heatmap` })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fitness source records" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Career source records" })).toBeVisible();
  await page.getByLabel("From").fill("2026-09-25");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(/from=2026-09-25/);
  await expect(page.getByRole("heading", { name: "Score over time" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
});

test("Insights rejects invalid ranges and unowned filter IDs without exposing records", async ({ page }) => {
  test.setTimeout(60000);
  test.skip(!process.env.E2E_AUTH_EMAIL || !process.env.E2E_AUTH_PASSWORD, "Requires the dedicated confirmed test account.");
  await page.goto("/insights");
  await expect(page).toHaveURL(/\/login$/);
  await signIn(page);
  await page.goto("/insights?from=2025-01-01&to=2026-10-01");
  const filterError = page.locator("#workspace-content section[role='alert']").first();
  await expect(filterError).toContainText("180 calendar days");
  await expect(page.getByRole("heading", { name: "Score over time" })).toHaveCount(0);
  await page.goto("/insights?challenge=00000000-0000-4000-8000-000000000001");
  await expect(filterError).toContainText("one of your challenges");
  await page.goto("/insights?category=00000000-0000-4000-8000-000000000001");
  await expect(filterError).toContainText("one of your tracker categories");
});
