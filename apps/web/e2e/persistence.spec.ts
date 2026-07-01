import { test, expect } from "@playwright/test";
import { dismissOnboarding, preparePage } from "./helpers";

test.describe("Input persistence", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
    await page.goto("/");
    await dismissOnboarding(page);
  });

  test("restores saved input after navigation and clears on Clear", async ({ page }) => {
    const saved = '{"persist":"e2e-test-value"}';

    await page.goto("/tools/json-formatter");
    await page.getByTestId("tool-input").fill(saved);
    await page.waitForTimeout(600);

    await page.goto("/tools/base64");
    await page.goto("/tools/json-formatter");

    await expect(page.getByTestId("tool-input")).toHaveValue(saved);

    await page.getByRole("button", { name: "Clear" }).click();
    await expect(page.getByTestId("tool-input")).toHaveValue("");
    await page.waitForTimeout(600);

    await page.reload();
    await expect(page.getByTestId("tool-input")).toHaveValue("");
  });

  test("URL input takes priority over stored value", async ({ page }) => {
    const stored = '{"stored":"from-indexeddb"}';
    const fromUrl = '{"from":"url-param"}';

    await page.goto("/tools/json-formatter");
    await page.getByTestId("tool-input").fill(stored);
    await page.waitForTimeout(600);

    await page.goto(`/tools/json-formatter?input=${encodeURIComponent(fromUrl)}`);
    await expect(page.getByTestId("tool-input")).toHaveValue(fromUrl);
  });
});
