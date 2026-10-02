import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(process.env.E2E_AUTH_EMAIL!);
  await page.getByLabel("Password", { exact: true }).fill(process.env.E2E_AUTH_PASSWORD!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/today$/, { timeout: 20000 });
}

async function assertNoHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

test("Today and navigation hubs fit the requested widths in both themes", async ({ page, context }, testInfo) => {
  test.setTimeout(120000);
  test.skip(!process.env.E2E_AUTH_EMAIL || !process.env.E2E_AUTH_PASSWORD, "Requires the dedicated confirmed test account.");
  await signIn(page);
  for (const theme of ["dark", "light"] as const) {
    await context.addCookies([{ name: "winter-arc-theme", value: theme, url: "http://127.0.0.1:3100" }]);
    for (const width of [360, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: width === 1024 ? 500 : 800 });
      await page.goto("/today");
      await expect(page.getByRole("heading", { name: "Today", exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Scheduled habits" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Measurements" })).toBeVisible();
      await assertNoHorizontalOverflow(page);
      if (theme === "dark") await expect(page.locator("html")).toHaveClass(/dark/);
      else await expect(page.locator("html")).not.toHaveClass(/dark/);
      if (width < 768) {
        await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
        await page.locator("#today-date").first().focus();
        const clear = await page.evaluate(() => {
          const field = document.querySelector<HTMLInputElement>("#today-date")!;
          const dock = document.querySelector<HTMLElement>('[aria-label="Mobile navigation"]')!;
          return field.getBoundingClientRect().bottom < dock.getBoundingClientRect().top;
        });
        expect(clear).toBe(true);
      } else {
        await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
        await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Settings" }).scrollIntoViewIfNeeded();
        await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Settings" })).toBeVisible();
      }
      if ([360, 768, 1440].includes(width)) await page.screenshot({ path: `test-results/refinement-today-${theme}-${width}-${testInfo.project.name}.png` });
    }
    for (const [hub, destinations] of [["track", ["Habits", "Metrics", "Fitness", "Career", "Insights", "Challenges"]], ["plan", ["Weekly tasks", "Goals"]], ["more", ["Reflection", "Challenges", "Settings"]]] as const) {
      await page.setViewportSize({ width: 360, height: 640 });
      await page.goto(`/${hub}`);
      for (const destination of destinations) await expect(page.getByRole("main").getByRole("link", { name: destination, exact: true })).toBeVisible();
      await assertNoHorizontalOverflow(page);
      await page.screenshot({ path: `test-results/refinement-${hub}-${theme}-${testInfo.project.name}.png` });
    }
  }
});

test("running and paused timer docks clear navigation at phone and desktop sizes", async ({ page }, testInfo) => {
  test.setTimeout(120000);
  test.skip(!process.env.E2E_AUTH_EMAIL || !process.env.E2E_AUTH_PASSWORD, "Requires the dedicated confirmed test account.");
  await signIn(page);
  await page.goto("/career");
  const categoryName = `E2E UI timer ${crypto.randomUUID().slice(0, 8)}`;
  let categoryCreated = false;
  let timerStarted = false;
  try {
    await page.getByRole("textbox", { name: "Study category" }).fill(categoryName);
    await page.getByRole("button", { name: "Add category" }).click();
    await expect(page.getByRole("status")).toContainText("Category saved", { timeout: 20000 });
    categoryCreated = true;
    await page.reload();
    await page.locator("#timer-category").first().selectOption({ label: categoryName });
    await page.getByRole("button", { name: "Start focus timer" }).click();
    await expect(page.getByText("Timer started and saved.")).toBeVisible({ timeout: 20000 });
    timerStarted = true;
    for (const state of ["Running", "Paused"] as const) {
      await page.goto("/today");
      for (const width of [360, 390, 740, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: width === 740 ? 360 : width >= 768 ? 500 : 640 });
        const timer = page.getByRole("region", { name: "Active focus timer" });
        await expect(timer).not.toHaveAttribute("aria-live", /polite|assertive/);
        await expect(timer).toContainText(state);
        await assertNoHorizontalOverflow(page);
        const dock = await page.evaluate(() => {
          const bar = document.querySelector<HTMLElement>("[data-persistent-timer]")!.getBoundingClientRect();
          const nav = document.querySelector<HTMLElement>('[aria-label="Mobile navigation"]')?.getBoundingClientRect();
          return { timerBottom: bar.bottom, navTop: nav?.top, viewportBottom: window.innerHeight };
        });
        if (width < 768) expect(Math.abs(dock.timerBottom - dock.navTop!)).toBeLessThanOrEqual(2);
        else expect(Math.abs(dock.timerBottom - dock.viewportBottom)).toBeLessThanOrEqual(2);
        if ([360, 740, 768, 1440].includes(width)) await page.screenshot({ path: `test-results/refinement-timer-${state.toLowerCase()}-${width}-${testInfo.project.name}.png` });
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        const footerClear = await page.evaluate(() => {
          const footer = document.querySelector<HTMLElement>("#workspace-content footer")!.getBoundingClientRect();
          const timer = document.querySelector<HTMLElement>("[data-persistent-timer]")!.getBoundingClientRect();
          return footer.bottom < timer.top;
        });
        expect(footerClear).toBe(true);
      }
      if (state === "Running") {
        await page.goto("/career");
        await page.getByRole("button", { name: "Pause" }).click();
        await expect(page.getByText("Timer paused.")).toBeVisible({ timeout: 20000 });
      }
    }
  } finally {
    if (timerStarted) {
      await page.goto("/career");
      page.once("dialog", (dialog) => dialog.accept());
      await page.getByRole("button", { name: "Discard" }).click();
      await expect(page.getByText("Timer discarded.")).toBeVisible({ timeout: 20000 });
    }
    if (categoryCreated) {
      await page.goto("/career/sessions");
      const category = page.locator("form").filter({ has: page.locator(`input[name="name"][value="${categoryName}"]`) });
      await category.getByRole("button", { name: "Archive" }).click();
      await expect(category).toHaveCount(0);
    }
  }
});

test("shared editor returns focus to its trigger after keyboard dismissal", async ({ page }) => {
  test.skip(!process.env.E2E_AUTH_EMAIL || !process.env.E2E_AUTH_PASSWORD, "Requires the dedicated confirmed test account.");
  await signIn(page);
  await page.goto("/habits");
  const trigger = page.getByRole("button", { name: "New habit" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "New habit" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "New habit" })).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("feature pages fit both themes across phone, tablet, and short desktop widths", async ({ page, context }, testInfo) => {
  test.setTimeout(600000);
  test.skip(!process.env.E2E_AUTH_EMAIL || !process.env.E2E_AUTH_PASSWORD, "Requires the dedicated confirmed test account.");
  await signIn(page);
  const routes = ["fitness", "fitness/workouts", "career", "career/sessions", "habits", "metrics", "tasks", "goals", "insights", "reflection", "settings", "settings/organization", "settings/tracking", "settings/data"];
  for (const theme of ["dark", "light"] as const) {
    await context.addCookies([{ name: "winter-arc-theme", value: theme, url: "http://127.0.0.1:3100" }]);
    for (const width of [360, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: width >= 768 ? 500 : 800 });
      for (const route of routes) {
        await page.goto(`/${route}`);
        await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toBeVisible({ timeout: 20000 });
        await assertNoHorizontalOverflow(page);
        if (width === 390) {
          expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations, `${theme} /${route}`).toEqual([]);
          const controlSizes = await page.locator('main input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), main select, main textarea').evaluateAll((controls) => controls.filter((control) => control.getClientRects().length > 0).map((control) => Number.parseFloat(getComputedStyle(control).fontSize)));
          expect(controlSizes.every((size) => size >= 16), `${route} phone input text`).toBe(true);
        }
        if ([390, 1440].includes(width) && ["fitness", "career", "habits", "insights", "reflection"].includes(route)) {
          await page.screenshot({ path: `test-results/refinement-${route}-${theme}-${width}-${testInfo.project.name}.png` });
        }
      }
    }
  }
});

test("chart details, editor focus, and reduced motion remain usable without hover", async ({ page }) => {
  test.setTimeout(90000);
  test.skip(!process.env.E2E_AUTH_EMAIL || !process.env.E2E_AUTH_PASSWORD, "Requires the dedicated confirmed test account.");
  await signIn(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/insights");
  await expect(page.getByRole("heading", { name: "Insights", exact: true })).toBeVisible();
  const disclosure = page.locator("summary:visible").filter({ hasText: "Read daily scores and gaps" });
  await disclosure.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("list", { name: "Daily score values" })).toBeVisible();
  await expect(disclosure.locator("..")).toHaveAttribute("open", "");
  expect(await disclosure.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
  await page.goto("/fitness");
  await expect(page.getByRole("heading", { name: "Fitness", exact: true })).toBeVisible();
  const weightDetails = page.getByRole("region", { name: "Recorded trends" }).locator("summary:visible").filter({ hasText: "Read body weight values by date" });
  await weightDetails.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("list", { name: "Body weight recorded values and gaps" })).toBeVisible();
  await page.goto("/habits");
  const trigger = page.getByRole("button", { name: "New habit" });
  expect(await trigger.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe("0s");
  await trigger.click();
  const editor = page.getByRole("dialog", { name: "New habit" });
  await expect(editor).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  await editor.getByRole("button", { name: "Save habit" }).focus();
  await page.keyboard.press("Tab");
  // Native dialogs may let Tab visit browser chrome before wrapping into the dialog.
  if (await page.evaluate(() => document.activeElement === document.body)) await page.keyboard.press("Tab");
  const focusIsInEditor = await editor.evaluate((element) => element.contains(document.activeElement));
  expect(focusIsInEditor).toBe(true);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("populated weight charts expose exact values and theme-aware tooltips", async ({ page, context }, testInfo) => {
  test.setTimeout(120000);
  test.skip(!process.env.E2E_AUTH_EMAIL || !process.env.E2E_AUTH_PASSWORD, "Requires the dedicated confirmed test account.");
  await signIn(page);
  await page.goto("/fitness");
  const today = await page.getByLabel("Tracking date").first().inputValue();
  const previous = new Date(Date.parse(`${today}T12:00:00Z`) - 86400_000).toISOString().slice(0, 10);
  const originals: { date: string; value: string }[] = [];
  const weightCard = () => page.getByRole("article").filter({ has: page.getByRole("spinbutton", { name: "Body weight (kg)", exact: true }) });
  try {
    for (const [date, value] of [[previous, "71.25"], [today, "72.5"]]) {
      await page.goto(`/fitness?date=${date}`);
      const card = weightCard();
      const input = card.getByRole("spinbutton");
      originals.push({ date, value: await input.inputValue() });
      await input.fill(value);
      await card.getByRole("button", { name: "Save", exact: true }).click();
      await expect(card.getByRole("status")).toHaveText("Saved.", { timeout: 20000 });
    }
    for (const theme of ["dark", "light"] as const) {
      await context.addCookies([{ name: "winter-arc-theme", value: theme, url: "http://127.0.0.1:3100" }]);
      await page.goto(`/fitness?date=${today}`);
      const trends = page.getByRole("region", { name: "Recorded trends" });
      const chart = trends.getByRole("img", { name: /Body weight trend/ });
      await chart.scrollIntoViewIfNeeded();
      await expect(chart.locator(".recharts-line-curve")).toBeVisible();
      await chart.locator(".recharts-line-dot").first().hover();
      await expect(chart.locator(".recharts-tooltip-wrapper")).toBeVisible();
      await expect(chart.locator(".recharts-tooltip-wrapper")).toContainText("71.25 kg");
      await page.screenshot({ path: `test-results/refinement-populated-chart-${theme}-${testInfo.project.name}.png` });
      await trends.locator("summary:visible").filter({ hasText: "Read body weight values by date" }).click();
      const values = trends.getByRole("list", { name: "Body weight recorded values and gaps" });
      await expect(values).toContainText(`${previous}71.25 kg`);
      await expect(values).toContainText(`${today}72.5 kg`);
    }
  } finally {
    for (const original of originals) {
      await page.goto(`/fitness?date=${original.date}`);
      const card = weightCard();
      await card.getByRole("spinbutton").fill(original.value);
      await card.getByRole("button", { name: "Save", exact: true }).click();
      await expect(card.getByText(/^Saved:/)).toContainText(original.value ? original.value : "Not logged", { timeout: 20000 });
      await page.reload();
      await expect(weightCard().getByRole("spinbutton")).toHaveValue(original.value);
    }
  }
});

test("phone keyboard viewport handling hides the dock and keeps editor actions reachable", async ({ page }, testInfo) => {
  test.setTimeout(60000);
  test.skip(!process.env.E2E_AUTH_EMAIL || !process.env.E2E_AUTH_PASSWORD, "Requires the dedicated confirmed test account.");
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page);
  await page.goto("/habits");
  const trigger = page.getByRole("button", { name: "New habit" });
  await trigger.click();
  const editor = page.getByRole("dialog", { name: "New habit" });
  await editor.getByRole("textbox", { name: "Habit name" }).fill("Long refinement label ".repeat(5));
  // Model visualViewport contraction; this verifies our response, not a physical OS keyboard.
  await page.evaluate(() => {
    const viewport = window.visualViewport!;
    Object.defineProperty(viewport, "height", { configurable: true, value: 440 });
    viewport.dispatchEvent(new Event("resize"));
  });
  await expect(page.locator("html")).toHaveAttribute("data-workspace-keyboard", "open");
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).not.toBeVisible();
  await editor.getByRole("button", { name: "Save habit" }).scrollIntoViewIfNeeded();
  const actionFits = await editor.getByRole("button", { name: "Save habit" }).evaluate((button) => {
    const rect = button.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.visualViewport!.height;
  });
  expect(actionFits).toBe(true);
  await page.screenshot({ path: `test-results/refinement-keyboard-${testInfo.project.name}.png` });
  await page.evaluate(() => {
    const viewport = window.visualViewport!;
    Reflect.deleteProperty(viewport, "height");
    viewport.dispatchEvent(new Event("resize"));
  });
  await expect(page.locator("html")).not.toHaveAttribute("data-workspace-keyboard", "open");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await page.setViewportSize({ width: 740, height: 360 });
  await assertNoHorizontalOverflow(page);
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  const calendar = page.getByRole("region", { name: /habit calendar/ });
  await calendar.focus();
  const initialScroll = await calendar.evaluate((element) => element.scrollLeft);
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => calendar.evaluate((element) => element.scrollLeft)).toBeGreaterThan(initialScroll);
});
