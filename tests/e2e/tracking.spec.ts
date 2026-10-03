import { expect, test } from "@playwright/test";
import { fixture, signIn } from "./fixtures";
import { businessDate } from "../../src/lib/dates";
test.use({ trace: "off" });
test("daily creation, completion, undo, revision conflict, editor, history and archive", async ({
  page,
  context,
}, info) => {
  test.setTimeout(120000);
  const value = await fixture();
  try {
    await signIn(page, value);
    await expect(
      page.getByRole("heading", { name: "Add your first habit", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Add your first habit", exact: true })
      .click();
    let dialog = page.getByRole("dialog");
    await expect(dialog.getByLabel("Habit name")).toBeFocused();
    await page.screenshot({
      path: `test-results/editor-${info.project.name}.png`,
      fullPage: true,
    });
    await dialog.getByLabel("Habit name").fill("Read a book");
    await dialog
      .getByRole("button", { name: "Create habit", exact: true })
      .click();
    await expect(dialog).not.toBeVisible();
    let check = page.getByRole("checkbox", { name: /Read a book/ });
    await expect(check).toHaveAttribute("aria-checked", "false");
    await check.click();
    await expect(check).toHaveAttribute("aria-checked", "true");
    await expect(page.getByText("1 of 1 done", { exact: true })).toBeVisible();
    await page.reload();
    check = page.getByRole("checkbox", { name: /Read a book/ });
    await expect(check).toHaveAttribute("aria-checked", "true");
    await check.press("Space");
    await expect(check).toHaveAttribute("aria-checked", "false");
    const owned = await value.client
      .from("habits")
      .select("id,revision")
      .single();
    expect(owned.error).toBeNull();
    const id = owned.data!.id;
    const today = businessDate("Asia/Kolkata");
    expect(
      (
        await value.client.rpc("set_habit_completion", {
          p_habit_id: id,
          p_business_date: today,
          p_completed: true,
          p_expected_revision: 2,
        })
      ).error,
    ).toBeNull();
    expect(
      (
        await value.client.rpc("set_habit_completion", {
          p_habit_id: id,
          p_business_date: today,
          p_completed: false,
          p_expected_revision: 3,
        })
      ).error,
    ).toBeNull();
    await check.click();
    await page.screenshot({
      path: `test-results/conflict-${info.project.name}.png`,
      fullPage: true,
    });
    await expect(
      page.getByRole("alert").filter({ hasText: "changed elsewhere" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Reload saved state" }).click();
    await expect(check).toHaveAttribute("aria-checked", "false");
    await context.setOffline(true);
    await check.click();
    await expect(
      page.getByRole("alert").filter({ hasText: "Check your connection" }),
    ).toBeVisible();
    await expect(check).toHaveAttribute("aria-checked", "false");
    await context.setOffline(false);
    await page.goto("/habits");
    await page.getByLabel("Options for Read a book").click();
    await page.getByRole("button", { name: "Edit Read a book" }).click();
    dialog = page.getByRole("dialog");
    await dialog.getByLabel("Selected days").check();
    for (const day of ["Tuesday", "Thursday", "Saturday", "Sunday"])
      await dialog.getByLabel(day, { exact: true }).uncheck();
    await dialog.getByRole("button", { name: "Save habit" }).click();
    await expect(dialog).not.toBeVisible();
    await expect(
      page.getByText("Mon · Wed · Fri · from tomorrow", { exact: true }),
    ).toBeVisible();
    await page.goto(`/habits?view=history&habit=${id}`);
    await expect(page.getByLabel("History habit")).toHaveValue(id);
    await expect(
      page.getByRole("link", { name: `${today}: pending today`, exact: true }),
    ).toBeVisible();
    await page.screenshot({
      path: `test-results/history-${info.project.name}.png`,
      fullPage: true,
    });
    await page.goto("/habits");
    await page.getByLabel("Options for Read a book").click();
    await page.getByRole("button", { name: "Archive", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Add your first habit", exact: true }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Show archived" }).click();
    await expect(
      page.getByRole("heading", { name: "Read a book", exact: true }),
    ).toBeVisible();
    await page.getByLabel("Options for Read a book").click();
    await page
      .getByRole("button", { name: "Delete Read a book permanently" })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Delete habit and history" })
      .click();
    await expect(
      page.getByRole("heading", { name: "No archived habits" }),
    ).toBeVisible();
  } finally {
    await context.setOffline(false).catch(() => {});
    await value.close();
  }
});
