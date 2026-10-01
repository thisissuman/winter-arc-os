import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(process.env.E2E_AUTH_EMAIL!);
  await page.getByLabel("Password", { exact: true }).fill(process.env.E2E_AUTH_PASSWORD!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/today$/);
}

test("owned habit and metric definitions log once and appear across tracking views", async ({ page }) => {
  test.skip(!process.env.E2E_AUTH_EMAIL || !process.env.E2E_AUTH_PASSWORD, "Requires the dedicated confirmed test account.");
  const suffix = crypto.randomUUID().slice(0, 8);
  const habitName = `E2E practice ${suffix}`;
  const metricName = `E2E water ${suffix}`;
  let habitCreated = false;
  let metricCreated = false;
  await signIn(page);
  try {
    await page.goto("/habits");
    await page.getByRole("button", { name: "New habit" }).click();
    const habitEditor = page.getByRole("dialog", { name: "New habit" });
    await habitEditor.getByLabel("Habit name").fill(habitName);
    await habitEditor.getByRole("button", { name: "Save habit" }).click();
    await expect(habitEditor.getByRole("status")).toContainText("Habit saved.");
    habitCreated = true;
    await habitEditor.getByRole("button", { name: "Close editor" }).click();
    await page.reload();
    await expect(page.getByRole("heading", { name: habitName })).toBeVisible();

    await page.goto("/metrics");
    await page.getByRole("button", { name: "New metric" }).click();
    const metricEditor = page.getByRole("dialog", { name: "Create metric" });
    await metricEditor.getByLabel("Name", { exact: true }).fill(metricName);
    await metricEditor.getByLabel("Unit", { exact: true }).fill("ml");
    await metricEditor.getByLabel("Target (selected unit)").fill("1000");
    await metricEditor.getByRole("button", { name: "Create metric" }).click();
    await expect(metricEditor.getByRole("status")).toContainText("Metric saved.");
    metricCreated = true;
    await metricEditor.getByRole("button", { name: "Close editor" }).click();

    await page.goto("/today");
    await page.getByLabel("Dashboard challenge").selectOption("");
    await expect(page.getByRole("button", { name: `Complete ${habitName}` })).toBeVisible();
    await page.getByRole("button", { name: `Complete ${habitName}` }).click();
    await expect(page.getByRole("button", { name: `Clear completion for ${habitName}` })).toBeVisible();
    const measurement = page.getByRole("article").filter({ hasText: metricName });
    await measurement.getByRole("spinbutton", { name: new RegExp(metricName) }).fill("750");
    await measurement.getByRole("button", { name: "Save", exact: true }).click();
    await expect(measurement.getByText(/Saved: 0\.75 L/)).toBeVisible();
    await page.reload();
    await expect(page.getByRole("button", { name: `Clear completion for ${habitName}` })).toBeVisible();
    await expect(page.getByRole("article").filter({ hasText: metricName }).getByRole("spinbutton", { name: new RegExp(metricName) })).toHaveValue("750");
    await page.getByRole("button", { name: `Clear completion for ${habitName}` }).focus();
    await page.keyboard.press("Space");
    await expect(page.getByRole("button", { name: `Complete ${habitName}` })).toBeVisible();
    await expect(page.getByRole("button", { name: `Complete ${habitName}` })).toBeEnabled();
    await page.getByRole("button", { name: `Complete ${habitName}` }).focus();
    await page.keyboard.press("Space");
    await expect(page.getByRole("button", { name: `Clear completion for ${habitName}` })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);

    await page.goto("/habits");
    await expect(page.getByRole("row", { name: new RegExp(habitName) })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.goto("/metrics");
    await expect(page.getByRole("heading", { name: metricName })).toBeVisible();
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  } finally {
    if (habitCreated) {
      await page.goto("/habits");
      const detail = page.getByRole("article").filter({ has: page.getByRole("heading", { name: habitName }) });
      await detail.getByRole("button", { name: "Delete permanently" }).click();
      const dialog = page.getByRole("dialog", { name: "Delete this habit permanently?" });
      await dialog.getByLabel("Type DELETE to confirm").fill("DELETE");
      await dialog.getByRole("button", { name: "Delete habit and history" }).click();
      await expect(page.getByRole("heading", { name: habitName })).toHaveCount(0);
    }
    if (metricCreated) {
      await page.goto("/metrics");
      const detail = page.locator("section").filter({ has: page.getByRole("heading", { name: metricName }) });
      await detail.getByRole("button", { name: "Delete history" }).click();
      const dialog = page.getByRole("dialog", { name: `Permanently delete ${metricName}?` });
      await dialog.getByLabel("Type DELETE to confirm").fill("DELETE");
      await dialog.getByRole("button", { name: "Permanently delete" }).click();
      await expect(page.getByRole("heading", { name: metricName })).toHaveCount(0);
    }
  }
});
