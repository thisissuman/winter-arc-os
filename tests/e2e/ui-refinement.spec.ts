import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { fixture, signIn } from "./fixtures";
test.use({ trace: "off" });
test("three sections, both themes, accessible editor, touch targets and responsive layouts", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  const value = await fixture();
  try {
    for (const name of [
      "Read",
      "Walk",
      "Meditate",
      "Stretch",
      "A very long habit name that still fits comfortably and remains readable",
    ]) {
      const result = await value.client.rpc("save_habit", {
        p_name: name,
        p_weekdays: [1, 2, 3, 4, 5, 6, 7],
      });
      expect(result.error).toBeNull();
    }
    await signIn(page, value);
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const theme of ["dark", "light"]) {
      await value.client
        .from("user_preferences")
        .update({ theme })
        .eq("user_id", value.id);
      await page.goto("/login");
      await signIn(page, value);
      for (const route of [
        "/today",
        "/habits",
        "/habits?view=history",
        "/settings",
      ]) {
        await page.goto(route);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        expect(
          (
            await new AxeBuilder({ page })
              .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
              .analyze()
          ).violations,
        ).toEqual([]);
        await page.screenshot({
          path: `test-results/simple-${theme}-${route.replace(/[^a-z]/g, "")}-${info.project.name}.png`,
          fullPage: true,
        });
      }
    }
    const nav = page.getByRole("navigation", {
      name:
        info.project.name === "mobile"
          ? "Mobile navigation"
          : "Main navigation",
    });
    await expect(nav.getByRole("link")).toHaveText([
      "Today",
      "Habits",
      "Settings",
    ]);
    for (const route of [
      "/fitness",
      "/career",
      "/metrics",
      "/tasks",
      "/goals",
      "/insights",
      "/reflection",
      "/challenges",
      "/track",
      "/plan",
      "/more",
      "/onboarding",
      "/settings/data",
      "/settings/organization",
      "/settings/tracking",
    ]) {
      const response = await page.request.get(route);
      expect(response.status()).toBe(404);
    }
    await page.goto("/habits");
    await page.getByRole("button", { name: "New habit", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByLabel("Habit name")).toBeFocused();
    await expect(dialog.locator('input[name="name"]')).toHaveCount(1);
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "New habit", exact: true }),
    ).toBeFocused();
  } finally {
    await value.close();
  }
});
