import { expect, type Page } from "@playwright/test";

export async function preparePage(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("ayetab-onboarded", JSON.stringify(true));
  });
}

export async function dismissOnboarding(page: Page) {
  const dismiss = page.getByTestId("onboarding-dismiss");
  if (await dismiss.isVisible().catch(() => false)) {
    await dismiss.click();
    await expect(dismiss).not.toBeVisible();
  }
}

export async function toolOutput(page: Page) {
  const text = page.getByTestId("tool-output-text");
  const code = page.getByTestId("tool-output-code");
  const diff = page.getByTestId("tool-output-diff");
  const image = page.getByTestId("tool-output-image-img");
  const html = page.getByTestId("tool-output-html");
  const error = page.getByTestId("tool-output-error");

  await expect
    .poll(
      async () => {
        if (await text.isVisible().catch(() => false)) return await text.inputValue();
        if (await code.isVisible().catch(() => false)) return await code.textContent();
        if (await diff.isVisible().catch(() => false)) return await diff.textContent();
        if (await image.isVisible().catch(() => false)) return "image-visible";
        if (await html.isVisible().catch(() => false)) return "html-visible";
        if (await error.isVisible().catch(() => false)) return await error.textContent();
        return "";
      },
      { timeout: 10_000 },
    )
    .not.toBe("");
}

export async function getToolOutputText(page: Page): Promise<string> {
  await toolOutput(page);
  const text = page.getByTestId("tool-output-text");
  const code = page.getByTestId("tool-output-code");
  const diff = page.getByTestId("tool-output-diff");
  const error = page.getByTestId("tool-output-error");

  if (await text.isVisible().catch(() => false)) return await text.inputValue();
  if (await code.isVisible().catch(() => false)) return (await code.textContent()) ?? "";
  if (await diff.isVisible().catch(() => false)) return (await diff.textContent()) ?? "";
  if (await error.isVisible().catch(() => false)) return (await error.textContent()) ?? "";
  return "";
}
