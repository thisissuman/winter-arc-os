import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(process.env.E2E_AUTH_EMAIL!);
  await page.getByLabel("Password", { exact: true }).fill(process.env.E2E_AUTH_PASSWORD!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/today$/);
}

test("sleep source and workout copying agree across Fitness and Today", async ({ page }) => {
  test.setTimeout(120000);
  test.skip(!process.env.E2E_AUTH_EMAIL || !process.env.E2E_AUTH_PASSWORD, "Requires the dedicated confirmed test account.");
  const suffix = crypto.randomUUID().slice(0, 8);
  const exerciseName = `E2E squat ${suffix}`;
  const workoutName = `E2E strength ${suffix}`;
  const workoutIds: string[] = [];
  let sleepCreated = false;
  let exerciseCreated = false;
  await signIn(page);
  try {
    await page.goto("/fitness");
    if (await page.getByRole("heading", { name: "Set up fitness tracking" }).isVisible()) {
      await page.getByRole("button", { name: "Set up fitness" }).click();
      await expect(page.getByRole("heading", { name: "Set up fitness tracking" })).toHaveCount(0, { timeout: 20000 });
      await page.reload();
    }
    const date = await page.getByLabel("Tracking date").inputValue();
    if (await page.getByRole("button", { name: "Remove entry" }).isVisible()) {
      await page.getByRole("button", { name: "Remove entry" }).click();
      await expect(page.getByRole("status")).toContainText("Sleep entry removed");
      await page.reload();
    }
    await page.getByRole("spinbutton", { name: "Duration (hours)" }).fill("8");
    await page.getByRole("button", { name: "Save sleep" }).click();
    await expect(page.getByRole("status")).toContainText("Sleep entry saved", { timeout: 20000 });
    sleepCreated = true;
    await page.goto("/today");
    await page.getByLabel("Dashboard challenge").selectOption("");
    await expect(page.getByText("8.00 hours recorded")).toBeVisible();
    await page.goto(`/metrics?date=${date}`);
    await expect(page.getByText("8.00 hours recorded")).toBeVisible();
    await page.goto(`/fitness?date=${date}`);
    const previousDate = new Date(Date.parse(`${date}T12:00:00Z`) - 86400_000).toISOString().slice(0, 10);
    await page.getByRole("radio", { name: "Sleep and wake times" }).check();
    await page.getByLabel("Sleep time").fill(`${previousDate}T22:00`);
    await page.getByLabel("Wake time", { exact: true }).fill(`${date}T06:00`);
    await expect(page.getByText("8.00 hours calculated.")).toBeVisible();
    await page.getByRole("button", { name: "Save sleep" }).click();
    await expect(page.getByRole("status")).toContainText("Sleep entry saved", { timeout: 20000 });

    await page.goto("/fitness/workouts");
    await page.getByRole("textbox", { name: "Exercise name" }).first().fill(exerciseName);
    await page.getByRole("textbox", { name: "Muscle group" }).first().fill("Legs");
    await page.getByRole("button", { name: "Add exercise" }).click();
    await expect(page.getByRole("status")).toContainText("Exercise saved");
    exerciseCreated = true;
    await page.goto("/fitness/workouts/new");
    await page.getByRole("textbox", { name: "Session name" }).fill(workoutName);
    await page.getByRole("button", { name: "Add exercise" }).click();
    await page.getByLabel("Exercise 1").selectOption({ label: `${exerciseName} · Legs` });
    await page.getByRole("spinbutton", { name: "Weight (kg)" }).fill("80");
    await page.getByLabel("Status").selectOption("completed");
    await page.getByRole("button", { name: "Save workout" }).click();
    await expect(page).toHaveURL(/\/fitness\/workouts\/[0-9a-f-]{36}$/);
    workoutIds.push(page.url().split("/").at(-1)!);
    await page.reload();
    await page.getByRole("button", { name: "Copy workout" }).click();
    await page.waitForURL((url) => /\/fitness\/workouts\/[0-9a-f-]{36}$/.test(url.pathname) && !url.pathname.endsWith(workoutIds[0]), { timeout: 20000 });
    const copyId = page.url().split("/").at(-1)!;
    expect(copyId).not.toBe(workoutIds[0]);
    workoutIds.push(copyId);
    await expect(page.getByLabel("Status")).toHaveValue("draft");
    await page.goto("/fitness");
    await expect(page.getByRole("heading", { name: "Gym this week" }).locator("..").getByText(/^1 \/ \d+$/)).toBeVisible();
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  } finally {
    for (const id of workoutIds.reverse()) {
      await page.goto(`/fitness/workouts/${id}`);
      if (page.url().endsWith(id)) {
        page.once("dialog", (dialog) => dialog.accept());
        await page.getByRole("button", { name: "Delete workout" }).click();
        await expect(page).toHaveURL(/\/fitness\/workouts$/);
      }
    }
    if (sleepCreated) {
      await page.goto("/fitness");
      await page.getByRole("button", { name: "Remove entry" }).click();
      await expect(page.getByRole("status")).toContainText("Sleep entry removed");
    }
    if (exerciseCreated) {
      await page.goto("/fitness/workouts");
      const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name: exerciseName }) });
      await card.getByRole("button", { name: "Archive" }).click();
      await expect(card).toHaveCount(0);
    }
  }
});

test("two tabs preserve concurrent water additions", async ({ page }) => {
  test.setTimeout(90000);
  test.skip(!process.env.E2E_AUTH_EMAIL || !process.env.E2E_AUTH_PASSWORD, "Requires the dedicated confirmed test account.");
  await signIn(page);
  await page.goto("/fitness");
  if (await page.getByRole("heading", { name: "Set up fitness tracking" }).isVisible()) {
    await page.getByRole("button", { name: "Set up fitness" }).click();
    await expect(page.getByRole("heading", { name: "Set up fitness tracking" })).toHaveCount(0, { timeout: 20000 });
  }
  const water = (browserPage: Page) => browserPage.getByRole("article").filter({ has: browserPage.getByRole("heading", { name: "Water" }) });
  const original = await water(page).getByRole("spinbutton", { name: /Water/ }).inputValue();
  const second = await page.context().newPage();
  try {
    await second.goto("/fitness");
    await Promise.all([water(page).getByRole("button", { name: "+250 ml" }).click(), water(second).getByRole("button", { name: "+250 ml" }).click()]);
    await expect(water(page).getByRole("status")).toContainText("Added.");
    await expect(water(second).getByRole("status")).toContainText("Added.");
    await page.reload();
    await expect(water(page).getByRole("spinbutton", { name: /Water/ })).toHaveValue(String(Number(original || 0) + 500));
  } finally {
    await page.reload();
    await water(page).getByRole("spinbutton", { name: /Water/ }).fill(original);
    await water(page).getByRole("button", { name: "Save", exact: true }).click();
    await expect(water(page).getByRole("status")).toContainText(original ? "Saved." : "Measurement cleared.");
    await second.close();
  }
});
