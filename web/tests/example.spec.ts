import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("http://localhost:8080/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Neolink/);
});

test("register link", async ({ page }) => {
  await page.goto("http://localhost:8080/");

  // Click the get started link.
  await page.getByRole("link", { name: "Join Neolink" }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(
    page.getByRole("heading", { name: "Installation" }),
  ).toBeVisible();
});
