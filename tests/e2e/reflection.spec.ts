import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(process.env.E2E_AUTH_EMAIL!);
  await page.getByLabel("Password", { exact: true }).fill(process.env.E2E_AUTH_PASSWORD!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/today$/);
}

test("weekly and monthly reflections save, reopen, edit, and agree with Insights", async ({ page }, testInfo) => {
  test.setTimeout(90000);
  test.skip(!process.env.E2E_AUTH_EMAIL || !process.env.E2E_AUTH_PASSWORD, "Requires the dedicated confirmed test account.");
  const week = testInfo.project.name === "mobile" ? "2026-09-14" : "2026-09-21";
  const through = testInfo.project.name === "mobile" ? "2026-09-20" : "2026-09-27";
  const month = testInfo.project.name === "mobile" ? "2026-07" : "2026-08";
  await signIn(page);
  await page.goto("/reflection");
  await expect(page.getByRole("heading", { name: "Reflection", exact: true })).toBeVisible();
  if (testInfo.project.name === "mobile") await expect(page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "More" })).toBeVisible();
  await page.goto(`/reflection/weekly/${week}`);
  await page.getByLabel("Wins").fill("E2E reflection win");
  await page.getByLabel("Energy").selectOption("4");
  await page.getByRole("button", { name: /Save weekly review|Save changes/ }).click();
  await expect(page.getByRole("status")).toContainText("Reflection saved");
  await page.reload();
  await expect(page.getByLabel("Wins")).toHaveValue("E2E reflection win");
  await expect(page.getByLabel("Energy")).toHaveValue("4");
  await page.getByLabel("What I learned").fill("E2E reflection lesson");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status")).toContainText("Reflection saved");
  await page.reload();
  await expect(page.getByLabel("What I learned")).toHaveValue("E2E reflection lesson");
  const reflectionScore = await page.getByText("Average daily score", { exact: true }).locator("..").locator("p").nth(1).innerText();
  await page.goto(`/insights?from=${week}&to=${through}`);
  const insightScore = await page.getByText("Average daily score", { exact: true }).locator("..").locator("p").nth(1).innerText();
  expect(reflectionScore).toBe(insightScore.trim());
  await page.goto(`/reflection/monthly/${month}`);
  await page.getByLabel("Biggest wins").fill("E2E monthly reflection win");
  await page.getByLabel("Freeform notes").fill("E2E monthly note");
  await page.getByRole("button", { name: /Save monthly reflection|Save changes/ }).click();
  await expect(page.getByRole("status")).toContainText("Reflection saved");
  await page.reload();
  await expect(page.getByLabel("Freeform notes")).toHaveValue("E2E monthly note");
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("reflection routes reject unauthenticated access and invalid periods", async ({ page }) => {
  test.skip(!process.env.E2E_AUTH_EMAIL || !process.env.E2E_AUTH_PASSWORD, "Requires the dedicated confirmed test account.");
  await page.goto("/reflection");
  await expect(page).toHaveURL(/\/login$/);
  await signIn(page);
  await page.goto("/reflection/weekly/2026-09-22");
  await expect(page.getByRole("heading", { name: "Let's find your way back." })).toBeVisible();
  await page.goto("/reflection/monthly/2026-13");
  await expect(page.getByRole("heading", { name: "Let's find your way back." })).toBeVisible();
});

test("Privacy Mode hides written responses while retaining recorded context", async ({ page }, testInfo) => {
  test.setTimeout(60000);
  test.skip(!process.env.E2E_AUTH_EMAIL || !process.env.E2E_AUTH_PASSWORD, "Requires the dedicated confirmed test account.");
  const week = testInfo.project.name === "mobile" ? "2026-09-14" : "2026-09-21";
  await signIn(page);
  await page.goto("/settings/tracking");
  const privacy = page.locator('#workspace-content input[name="privacyMode"]').first();
  const original = await privacy.isChecked();
  try {
    if (!original) {
      await privacy.check();
      await page.getByRole("button", { name: "Save privacy settings" }).click();
      await expect(page.getByRole("status")).toBeVisible();
    }
    await page.goto(`/reflection/weekly/${week}`);
    await expect(page.getByText("Review writing is hidden in Privacy Mode.")).toBeVisible();
    await expect(page.getByLabel("Wins")).toHaveCount(0);
    await expect(page.getByText("E2E reflection win")).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Recorded context" })).toBeVisible();
  } finally {
    await page.goto("/settings/tracking");
    const current = page.locator('#workspace-content input[name="privacyMode"]').first();
    if (await current.isChecked() !== original) {
      if (original) await current.check(); else await current.uncheck();
      await page.getByRole("button", { name: "Save privacy settings" }).click();
      await expect(page.getByRole("status")).toBeVisible();
    }
  }
});
