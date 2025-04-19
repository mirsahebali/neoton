import { test, expect } from "@playwright/test";
import { randAnimal, randEmail, randPassword } from "@ngneat/falso";

const currPage = "http://localhost:8080/";

test("has title", async ({ page }) => {
  await page.goto(currPage);

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Neoton/);
});

test("register link", async ({ page }) => {
  await page.goto("http://localhost:8080/");

  // Click the get started link.
  await page.getByRole("link", { name: "Join Neoton" }).click();
});

test("can login", async ({ page }) => {
  await page.goto(currPage);
  await page.getByText("Join Neoton").click();
  await page.getByTestId("2fa").check();

  await page.getByTestId("email").fill(randEmail());
  await page.getByTestId("username").fill(randAnimal());
  await page.getByTestId("fullname").fill(randAnimal());
  await page
    .getByTestId("password")
    .fill(randPassword({ length: 12 }).join(""));
  await page.getByTestId("register-btn").click();
});
