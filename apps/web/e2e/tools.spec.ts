import { test, expect } from "@playwright/test";
import { dismissOnboarding, getToolOutputText, preparePage } from "./helpers";

test.describe("Tool execution", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
    await page.goto("/");
    await dismissOnboarding(page);
  });

  test("JSON formatter prettifies input", async ({ page }) => {
    await page.goto("/tools/json-formatter");
    await expect(page.getByTestId("tool-input")).toBeFocused();
    await page.getByTestId("tool-input").fill('{"a":1,"b":[2,3]}');
    const out = await getToolOutputText(page);
    expect(out).toContain('"a"');
    expect(out).toContain('"b"');
  });

  test("Base64 encodes text", async ({ page }) => {
    await page.goto("/tools/base64");
    await page.getByTestId("tool-input").fill("hello world");
    const out = await getToolOutputText(page);
    expect(out.trim()).toBe("aGVsbG8gd29ybGQ=");
  });

  test("JWT debugger shows payload", async ({ page }) => {
    await page.goto("/tools/jwt-debugger");
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    await page.getByTestId("tool-input").fill(token);
    const out = await getToolOutputText(page);
    expect(out).toContain("John Doe");
  });

  test("Hash generator produces SHA-256", async ({ page }) => {
    await page.goto("/tools/hash-generator");
    await page.getByTestId("tool-input").fill("test");
    const out = await getToolOutputText(page);
    expect(out.toLowerCase()).toContain("sha-256");
    expect(out).toMatch(/[a-f0-9]{64}/i);
  });

  test("UUID generator produces valid UUID", async ({ page }) => {
    await page.goto("/tools/uuid-generator");
    const out = await getToolOutputText(page);
    expect(out.trim().split("\n")[0]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  test("YAML to JSON converts structure", async ({ page }) => {
    await page.goto("/tools/yaml-json");
    await page.getByTestId("tool-input").fill("name: test\nitems:\n  - one\n  - two");
    const out = await getToolOutputText(page);
    expect(out).toContain('"name"');
    expect(out).toContain("test");
  });

  test("Text diff shows changes", async ({ page }) => {
    await page.goto("/tools/text-diff");
    await page.getByTestId("tool-input").fill("line one\nline two\n---\nline one\nline changed");
    const out = await getToolOutputText(page);
    expect(out).toContain("line");
  });

  test("Markdown preview renders heading", async ({ page }) => {
    await page.goto("/tools/markdown-preview");
    await page.getByTestId("tool-input").fill("# Hello World");
    await expect(page.getByTestId("tool-output-html")).toBeVisible({ timeout: 10_000 });
    await expect(
      page.frameLocator('[data-testid="tool-output-html"]').getByRole("heading", { name: "Hello World" })
    ).toBeVisible({ timeout: 10_000 });
  });

  test("QR code generator produces image", async ({ page }) => {
    await page.goto("/tools/qr-code");
    await page.getByTestId("tool-input").fill("https://ayetab.dev");
    await expect(page.getByTestId("tool-output-image-img")).toBeVisible({ timeout: 10_000 });
    const src = await page.getByTestId("tool-output-image-img").getAttribute("src");
    expect(src).toMatch(/^data:image\/png;base64,/);
  });

  test("URL encoder encodes special chars", async ({ page }) => {
    await page.goto("/tools/url-encode");
    await page.getByTestId("tool-input").fill("hello world&foo=bar");
    const out = await getToolOutputText(page);
    expect(out).toContain("%20");
    expect(out).toContain("%26");
  });

  test("RegExp tester shows match", async ({ page }) => {
    await page.goto("/tools/regex-tester");
    await page.getByTestId("tool-input").fill("[a-z]+@[a-z]+\\.[a-z]+\ntest@example.com\ninvalid");
    const out = await getToolOutputText(page);
    expect(out).toContain("test@example.com");
  });
});
