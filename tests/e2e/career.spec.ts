import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(process.env.E2E_AUTH_EMAIL!);
  await page.getByLabel("Password", { exact: true }).fill(process.env.E2E_AUTH_PASSWORD!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/today$/);
}

test("study totals, timer recovery, and category history stay in sync", async ({ page }) => {
  test.setTimeout(120000);
  test.skip(!process.env.E2E_AUTH_EMAIL || !process.env.E2E_AUTH_PASSWORD, "Requires the dedicated confirmed test account.");
  const categoryName = `E2E career ${crypto.randomUUID().slice(0, 8)}`;
  let categoryCreated = false;
  let sessionCreated = false;
  let timerStarted = false;
  await signIn(page);
  const second = await page.context().newPage();
  try {
    await page.goto("/today");
    await page.getByLabel("Dashboard challenge").selectOption("");
    await page.goto("/career");
    if (await page.getByRole("heading", { name: "Set up career tracking" }).isVisible()) {
      await page.getByLabel("Daily study target (minutes, optional)").fill("90");
      await page.getByRole("button", { name: "Set up study tracking" }).click();
      await expect(page.getByRole("heading", { name: "Set up career tracking" })).toHaveCount(0, { timeout: 20000 });
      await page.reload();
    }
    await page.getByRole("textbox", { name: "Study category" }).fill(categoryName);
    await page.getByRole("button", { name: "Add category" }).click();
    await expect(page.getByRole("status")).toContainText("Category saved", { timeout: 20000 });
    categoryCreated = true;
    await page.reload();
    const date = await page.getByLabel("Review date").first().inputValue();
    await page.getByRole("spinbutton", { name: "Duration (minutes)" }).fill("90");
    await page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Log a manual session" }) }).getByRole("textbox", { name: "Topic (optional)" }).fill("E2E domain review");
    await page.getByRole("button", { name: "Log study session" }).click();
    await expect(page.getByRole("status")).toContainText("Study session saved", { timeout: 20000 });
    sessionCreated = true;
    await page.reload();
    await expect(page.getByRole("heading", { name: `On ${date}` }).locator("..").getByText("90 min", { exact: true })).toBeVisible();
    await page.goto(`/today?date=${date}`);
    await expect(page.getByText("90.00 minutes recorded").first()).toBeVisible();
    await page.goto("/career");
    await page.getByRole("button", { name: "Start focus timer" }).click();
    await expect(page.getByText("Timer started and saved.")).toBeVisible({ timeout: 20000 });
    timerStarted = true;
    await page.reload();
    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
    await page.context().setOffline(true);
    try {
      await page.getByRole("button", { name: "Finish and save" }).click();
      await expect(page.locator("#focus-timer-heading").locator("..").getByRole("alert")).toContainText("Could not save", { timeout: 20000 });
      await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
    } finally {
      await page.context().setOffline(false);
    }
    await page.goto("/today");
    await expect(page.getByRole("status", { name: "Active focus timer" })).toContainText("Running");
    await second.goto("/career");
    await expect(second.getByRole("button", { name: "Pause" })).toBeVisible();
    await second.getByRole("button", { name: "Pause" }).click();
    await expect(second.getByText("Timer paused.")).toBeVisible({ timeout: 20000 });
    await page.goto("/career");
    await expect(page.getByRole("button", { name: "Resume" })).toBeVisible();
    await page.getByRole("button", { name: "Resume" }).click();
    await expect(page.getByText("Timer resumed.")).toBeVisible({ timeout: 20000 });
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Discard" }).click();
    await expect(page.getByText("Timer discarded.")).toBeVisible({ timeout: 20000 });
    timerStarted = false;
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  } finally {
    await second.close();
    if (timerStarted) {
      await page.goto("/career");
      page.once("dialog", (dialog) => dialog.accept());
      await page.getByRole("button", { name: "Discard" }).click();
      await expect(page.getByText("Timer discarded.")).toBeVisible();
    }
    if (sessionCreated) {
      await page.goto("/career/sessions");
      const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "E2E domain review" }) });
      await card.getByText("Edit manual session").click();
      page.once("dialog", (dialog) => dialog.accept());
      await card.getByRole("button", { name: "Delete session" }).click();
      await expect(card).toHaveCount(0);
    }
    if (categoryCreated) {
      await page.goto("/career/sessions");
      const matching = page.locator("form").filter({ has: page.locator(`input[name="name"][value="${categoryName}"]`) });
      await matching.getByRole("button", { name: "Archive" }).click();
      await expect(matching).toHaveCount(0);
    }
  }
});

test("Privacy Mode masks Career labels and editor controls", async ({ page }) => {
  test.setTimeout(90000);
  test.skip(!process.env.E2E_AUTH_EMAIL || !process.env.E2E_AUTH_PASSWORD, "Requires the dedicated confirmed test account.");
  const categoryName = `E2E career ${crypto.randomUUID().slice(0, 8)}`;
  await signIn(page);
  await page.goto("/settings/tracking");
  const originalPrivacy = await page.getByRole("checkbox", { name: /^Privacy Mode/ }).isChecked();
  let categoryCreated = false;
  const setPrivacy = async (enabled: boolean) => {
    await page.goto("/settings/tracking");
    const checkbox = page.getByRole("checkbox", { name: /^Privacy Mode/ });
    if (await checkbox.isChecked() !== enabled) {
      await checkbox.setChecked(enabled);
      await page.getByRole("button", { name: "Save privacy settings" }).click();
      await expect(page.getByRole("status")).toContainText("Privacy settings saved", { timeout: 20000 });
    }
  };
  try {
    await setPrivacy(false);
    await page.goto("/career");
    await page.getByRole("textbox", { name: "Study category" }).fill(categoryName);
    await page.getByRole("button", { name: "Add category" }).click();
    await expect(page.getByRole("status")).toContainText("Category saved", { timeout: 20000 });
    categoryCreated = true;
    await setPrivacy(true);
    await page.goto("/career");
    await expect(page.getByText("Private study category").first()).toBeVisible();
    await expect(page.getByText(categoryName)).toHaveCount(0);
    await expect(page.getByRole("combobox", { name: "Study category" })).toHaveCount(0);
    await expect(page.getByRole("textbox", { name: "Study category" })).toHaveCount(0);
    await page.goto("/career/sessions");
    await expect(page.getByText(categoryName)).toHaveCount(0);
    await expect(page.getByRole("textbox", { name: "Study category" })).toHaveCount(0);
  } finally {
    await setPrivacy(false);
    if (categoryCreated) {
      await page.goto("/career/sessions");
      const matching = page.locator("form").filter({ has: page.locator(`input[name="name"][value="${categoryName}"]`) });
      await matching.getByRole("button", { name: "Archive" }).click();
      await expect(matching).toHaveCount(0);
    }
    await setPrivacy(originalPrivacy);
  }
});
