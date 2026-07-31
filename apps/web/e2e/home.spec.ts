import { test, expect } from "@playwright/test";
import { dismissOnboarding, preparePage, waitForHydration } from "./helpers";

test.describe("Shell & navigation", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
    await page.goto("/");
    await dismissOnboarding(page);
    await waitForHydration(page);
  });

  test("loads the sidebar shell and the tool index", async ({ page }) => {
    await expect(page.getByTestId("app-shell")).toBeVisible();
    await expect(page.getByTestId("tool-index")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "All tools" })).toBeVisible();
    // The sidebar lists every tool, so a known one is always reachable.
    await expect(page.getByRole("link", { name: "JSON Formatter", exact: true })).toBeVisible();
  });

  test("sidebar search filters the list", async ({ page }) => {
    const search = page.getByRole("searchbox", { name: "Search tools" }).first();
    await search.fill("jwt");
    await expect(page.getByRole("link", { name: "JWT Debugger", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "JSON Formatter", exact: true })).toHaveCount(0);

    await search.fill("");
    await expect(page.getByRole("link", { name: "JSON Formatter", exact: true })).toBeVisible();
  });

  test("sidebar row opens a tool in the content pane", async ({ page }) => {
    await page.getByRole("link", { name: "JSON Formatter", exact: true }).click();
    await expect(page).toHaveURL(/\/tools\/json-formatter/);
    await expect(page.getByRole("heading", { level: 1, name: "JSON Formatter" })).toBeVisible();
    // The sidebar survives navigation — that's the point of the layout.
    await expect(page.getByTestId("app-shell")).toBeVisible();
  });

  test("index row opens a tool", async ({ page }) => {
    await page
      .getByTestId("tool-index")
      .getByRole("button", { name: "JSON Formatter" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/tools\/json-formatter/);
  });

  test("command palette fuzzy search works", async ({ page }) => {
    await page.keyboard.press("Control+k");
    const palette = page.getByTestId("command-palette");
    await expect(palette).toBeVisible();
    await palette.getByPlaceholder("Search tools").fill("jf");
    await palette.getByRole("option", { name: /JSON Formatter/ }).click();
    await expect(page).toHaveURL(/\/tools\/json-formatter/);
  });

  test("the old library route redirects to the index", async ({ page }) => {
    await page.goto("/library");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1, name: "All tools" })).toBeVisible();
  });

  test("theme toggle switches dark mode", async ({ page }) => {
    const html = page.locator("html");
    const initial = await html.evaluate((el) => el.classList.contains("dark"));
    await page
      .getByRole("button", { name: /Switch to (light|dark) mode/ })
      .first()
      .click();
    await expect(html).toHaveClass(initial ? /^(?!.*\bdark\b)/ : /dark/);
  });

  test("shortcuts modal opens with ?", async ({ page }) => {
    await page.keyboard.press("?");
    await expect(page.getByRole("heading", { name: "Keyboard shortcuts" })).toBeVisible();
    // `exact` matters: a bare "Close" also matches the backdrop's "Close dialog".
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Keyboard shortcuts" })).not.toBeVisible();
  });
});
