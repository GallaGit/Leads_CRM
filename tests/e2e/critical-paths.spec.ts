import { test, expect } from "@playwright/test";

test.describe("Leads_CRM smoke", () => {
  test("home shell loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Leads_CRM").first()).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("leads route renders chrome", async ({ page }) => {
    await page.goto("/leads");
    await expect(page.getByRole("heading", { name: "Leads" })).toBeVisible({
      timeout: 15000,
    });
  });

  test("kanban route renders", async ({ page }) => {
    await page.goto("/kanban");
    await expect(page.getByRole("heading", { name: "Kanban" })).toBeVisible({
      timeout: 15000,
    });
  });

  test("settings route renders", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible({
      timeout: 15000,
    });
  });
});
