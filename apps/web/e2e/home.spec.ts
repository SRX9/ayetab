import { test, expect } from "@playwright/test";
import { dismissOnboarding, preparePage } from "./helpers";

test.describe("Home & navigation", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
    await page.goto("/");
    await dismissOnboarding(page);
  });

  test("loads customizable home screen", async ({ page }) => {
    await expect(page.getByTestId("home-screen")).toBeVisible();
    await expect(page.getByRole("heading", { name: "AyeTab", exact: true })).toBeVisible();
    await expect(page.getByTestId("home-pins")).toBeVisible();
    await expect(page.getByTestId("home-quick-note")).toBeVisible();
    await expect(page.getByRole("link", { name: "Library" })).toBeVisible();
  });

  test("search bar opens command palette and navigates", async ({ page }) => {
    await page.getByRole("button", { name: /Search tools/ }).click();
    const palette = page.getByTestId("command-palette");
    await expect(palette).toBeVisible();
    await palette.getByPlaceholder("Search tools...").fill("jwt");
    await palette.getByRole("button", { name: /JWT Debugger/ }).click();
    await expect(page).toHaveURL(/\/tools\/jwt-debugger/);
  });

  test("command palette fuzzy search works", async ({ page }) => {
    await page.keyboard.press("Control+k");
    const palette = page.getByTestId("command-palette");
    await palette.getByPlaceholder("Search tools...").fill("jf");
    await palette.getByRole("button", { name: /JSON Formatter/ }).click();
    await expect(page).toHaveURL(/\/tools\/json-formatter/);
  });

  test("edit mode can add a widget", async ({ page }) => {
    await page.getByTestId("home-edit-toggle").click();
    await expect(page.getByRole("button", { name: "Done" })).toBeVisible();
    await page.getByTestId("home-add-widget").click();
    const gallery = page.getByTestId("home-widget-gallery");
    await expect(gallery).toBeVisible();
    await gallery.getByRole("button", { name: /To-Do/ }).click();
    await expect(page.getByTestId("home-todo")).toBeVisible();
    await page.getByTestId("home-edit-toggle").click();
  });

  test("library page lists all tools", async ({ page }) => {
    await page.getByRole("link", { name: "Library" }).click();
    await expect(page).toHaveURL(/\/library/);
    await expect(page.getByTestId("library-page")).toBeVisible();
    await expect(page.getByText("50 tools available")).toBeVisible();
    const main = page.locator("main");
    await expect(main.getByRole("button", { name: "JSON Formatter" })).toBeVisible();
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
