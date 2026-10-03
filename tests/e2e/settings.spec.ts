import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { fixture, signIn } from "./fixtures";
test.use({ trace: "off" });
test("PWA is installable and offline fallback caches only public files", async ({
  page,
}, info) => {
  test.setTimeout(90000);
  const value = await fixture();
  try {
    await signIn(page, value);
    await page.evaluate(() =>
      navigator.serviceWorker.ready.then(() => undefined),
    );
    await expect
      .poll(() =>
        page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
      )
      .toBe(true);
    const cdp = await page.context().newCDPSession(page);
    expect((await cdp.send("Page.getAppManifest")).errors).toEqual([]);
    expect(
      (await cdp.send("Page.getInstallabilityErrors")).installabilityErrors,
    ).toEqual([]);
    await page.goto("/settings");
    await page.getByLabel("Display name").fill("Unsaved offline form");
    await page.context().setOffline(true);
    await expect(
      page.getByRole("status").filter({ hasText: "You are offline" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Save profile", exact: true })
      .click();
    await expect(
      page.getByRole("alert").filter({ hasText: "Reconnect before saving" }),
    ).toBeVisible();
    await expect(page.getByLabel("Display name")).toHaveValue(
      "Unsaved offline form",
    );
    await page.goto("/today");
    await expect(
      page.getByRole("heading", { name: "Your workspace needs a connection." }),
    ).toBeVisible();
    await page.screenshot({
      path: "test-results/phase8-offline-" + info.project.name + ".png",
      fullPage: true,
    });
    const cached = await page.evaluate(async () => {
      const paths: string[] = [];
      for (const name of await caches.keys())
        for (const request of await (await caches.open(name)).keys())
          paths.push(new URL(request.url).pathname);
      return paths.sort();
    });
    expect(cached).toEqual([
      "/icons/apple-touch-icon.png",
      "/icons/icon-192.png",
      "/icons/icon-512.png",
      "/offline.html",
    ]);
    await page.context().setOffline(false);
    await page.goto("/settings");
    await expect(page.getByLabel("Display name")).toHaveValue(
      "Simple habit fixture",
    );
  } finally {
    await page.context().setOffline(false).catch(() => {});
    await value.close();
  }
});

test("private endpoints deny anonymous and arbitrary origins", async ({
  request,
}) => {
  const response = await request.get("/api/export");
  expect(response.status()).toBe(401);
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(response.headers()["referrer-policy"]).toBe("no-referrer");
  expect(
    (
      await request.post("/api/account/delete", {
        headers: { Origin: "https://attacker.example" },
        data: { password: "wrong", confirmation: "DELETE MY ACCOUNT" },
      })
    ).status(),
  ).toBe(403);
});
test("preferences, private export, data clearing and verified self-deletion", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  const value = await fixture();
  const other = await fixture();
  try {
    const seed = await value.client.rpc("save_habit", {
      p_name: "Private name",
      p_weekdays: [1, 2, 3, 4, 5, 6, 7],
    });
    expect(seed.error).toBeNull();
    expect(
      (
        await other.client.rpc("save_habit", {
          p_name: "Other account",
          p_weekdays: [1, 2, 3, 4, 5, 6, 7],
        })
      ).error,
    ).toBeNull();
    await signIn(page, value);
    await page.goto("/settings");
    await page.getByLabel("Timezone", { exact: true }).fill("UTC");
    await page.getByLabel("Week starts on").selectOption("7");
    await page.getByRole("button", { name: "Save preferences" }).click();
    await expect(
      page.getByText("Preferences saved. Existing habit dates are retained."),
    ).toBeVisible();
    await page.getByLabel("Privacy Mode", { exact: true }).check();
    await page.getByRole("button", { name: "Save preferences" }).click();
    await expect(
      page.getByText("Preferences saved. Existing habit dates are retained."),
    ).toBeVisible();
    await expect.poll(async () => (await value.client.from("user_preferences").select("privacy_mode").single()).data?.privacy_mode).toBe(true);
    await page.goto("/today");
    await expect(page.getByRole("checkbox", { name: /Habit 1/ })).toBeVisible();
    expect(await page.content()).not.toContain("Private name");
    await page.goto("/habits?view=history");
    expect(await page.content()).not.toContain("Private name");
    await expect(
      page.getByRole("button", { name: "New habit", exact: true }),
    ).toHaveCount(0);
    await page.goto("/settings");
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.screenshot({
      path: `test-results/settings-${info.project.name}.png`,
      fullPage: true,
    });
    const exported = await page.request.get("/api/export");
    expect(exported.ok()).toBe(true);
    const payload = await exported.json();
    expect(payload.format_version).toBe(2);
    expect(Object.keys(payload.data).sort()).toEqual([
      "habit_logs",
      "habit_schedules",
      "habits",
      "profiles",
      "user_preferences",
    ]);
    expect(payload.data.habits[0].name).toBe("Private name");
    for (const rows of Object.values(payload.data))
      for (const row of rows as { user_id: string }[])
        expect(row.user_id).toBe(value.id);
    await page.getByText("Delete data or account", { exact: true }).click();
    const deletion = page.getByRole("region", {
      name: "Delete habit data",
      exact: true,
    });
    await deletion.getByLabel("Type DELETE MY DATA").fill("DELETE MY DATA");
    await deletion.getByLabel("Current password").fill(value.password);
    await deletion
      .getByRole("button", { name: "Delete workspace data", exact: true })
      .click();
    await expect(deletion.getByRole("status")).toContainText(
      "Workspace data deleted",
    );
    const after = await (await page.request.get("/api/export")).json();
    expect(after.data.habits).toHaveLength(0);
    expect(after.data.profiles).toHaveLength(1);
    expect(after.data.user_preferences[0].timezone).toBe("UTC");
    expect((await other.client.from("habits").select("id")).data).toHaveLength(
      1,
    );
    const account = page.getByRole("region", {
      name: "Delete account",
      exact: true,
    });
    await account
      .getByLabel("Type DELETE MY ACCOUNT")
      .fill("DELETE MY ACCOUNT");
    await account.getByLabel("Current password").fill("wrong-password");
    await account
      .getByRole("button", { name: "Delete my account", exact: true })
      .click();
    await expect(account.getByRole("alert")).toContainText(
      "Password verification failed",
    );
    expect(
      (
        await page.request.post("/api/account/delete", {
          headers: { Origin: "http://127.0.0.1:3100" },
          data: {
            password: value.password,
            confirmation: "DELETE MY ACCOUNT",
            userId: other.id,
          },
        })
      ).status(),
    ).toBe(400);
    await account.getByLabel("Current password").fill(value.password);
    await account
      .getByRole("button", { name: "Delete my account", exact: true })
      .click();
    await expect(page).toHaveURL(/\/login\?notice=account-deleted$/, {
      timeout: 20000,
    });
    expect((await page.request.get("/api/export")).status()).toBe(401);
    expect((await other.client.from("habits").select("id")).data).toHaveLength(
      1,
    );
  } finally {
    await value.close();
    await other.close();
  }
});
