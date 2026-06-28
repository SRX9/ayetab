import { test, expect } from "@playwright/test";
import { dismissOnboarding, preparePage } from "./helpers";

test.describe("Home & navigation", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
    await page.goto("/");
    await dismissOnboarding(page);
  });

  test("loads home page with tool grid", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "AyeTab", exact: true })).toBeVisible();
    await expect(page.getByText("43 tools available")).toBeVisible();
    const main = page.locator("main");
    await expect(main.getByRole("button", { name: "JSON Formatter" })).toBeVisible();
    await expect(main.getByRole("button", { name: "Base64 Encode/Decode" })).toBeVisible();
  });

  test("search dropdown navigates to tool", async ({ page }) => {
    const search = page.getByPlaceholder("Search tools... (⌘K)");
    await search.fill("jwt");
    const dropdown = page.locator("main .absolute.top-full");
    await expect(dropdown.getByRole("button", { name: /JWT Debugger/ })).toBeVisible();
    await dropdown.getByRole("button", { name: /JWT Debugger/ }).click();
    await expect(page).toHaveURL(/\/tools\/jwt-debugger/);
  });

  test("command palette opens and navigates", async ({ page }) => {
    await page.keyboard.press("Control+k");
    const palette = page.getByTestId("command-palette");
    await expect(palette).toBeVisible();
    await palette.getByPlaceholder("Search tools...").fill("uuid");
    await palette.getByRole("button", { name: "UUID Generator" }).click();
    await expect(page).toHaveURL(/\/tools\/uuid-generator/);
    await expect(page.getByRole("heading", { name: "UUID Generator" })).toBeVisible();
  });

  test("favorites toggle and filter", async ({ page }) => {
    const main = page.locator("main");
    const jsonCard = main.locator(".rounded-lg.border").filter({ hasText: "JSON Formatter" }).first();
    await jsonCard.getByRole("button", { name: "Add to favorites" }).click();
    await page.getByRole("button", { name: "★ Favorites" }).click();
    await expect(main.getByRole("button", { name: "JSON Formatter" })).toBeVisible();
    await expect(main.getByRole("button", { name: "Base64 Encode/Decode" })).not.toBeVisible();
  });

  test("theme toggle switches dark mode", async ({ page }) => {
    const html = page.locator("html");
    const initial = await html.evaluate((el) => el.classList.contains("dark"));
    await page.getByRole("button", { name: /Switch to (light|dark) mode/ }).click();
    await expect(html).toHaveClass(initial ? /^(?!.*\bdark\b)/ : /dark/);
  });

  test("shortcuts modal opens with ?", async ({ page }) => {
    await page.keyboard.press("?");
    await expect(page.getByRole("heading", { name: "Keyboard Shortcuts" })).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("heading", { name: "Keyboard Shortcuts" })).not.toBeVisible();
  });
});
