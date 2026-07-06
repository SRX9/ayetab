import { test, expect } from "@playwright/test";
import { TOOL_REGISTRY } from "@ayetab/utils";
import { dismissOnboarding, toolOutput, preparePage } from "./helpers";
import { CUSTOM_UI_TOOL_IDS, CUSTOM_TOOL_TEST_IDS } from "@ayetab/ui";

const TINY_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const SAMPLE_INPUTS: Record<string, string> = {
  "json-formatter": '{"x":1}',
  base64: "hello world",
  "url-encode": "a b",
  "hash-generator": "test",
  "unix-time": "1700000000",
  "jwt-debugger":
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  "regex-tester": "\\d+\nabc123",
  "color-converter": "#ff0000",
  "number-base": "255",
  "case-converter": "hello world",
  "line-sort": "b\na\nc",
  "html-formatter": "<div><p>Hi</p></div>",
  "css-formatter": "body{color:red}",
  "js-formatter": "const x=1",
  "sql-formatter": "select * from users",
  "yaml-json": "k: v",
  "json-csv": '[{"a":1,"b":2}]',
  "text-diff": "a\nb\n---\na\nc",
  "markdown-preview": "# Hi",
  "cron-parser": "0 0 * * *",
  "url-parser": "https://example.com/path?q=1",
  "html-entity": "<div>",
  "hex-ascii": "4869",
  "string-inspector": "hello",
  "xml-formatter": "<root><a>1</a></root>",
  "html-jsx": "<div>Hi</div>",
  "html-preview": "<p>Hi</p>",
  "qr-code": "test",
  "backslash-escape": "line\\n",
  "cert-decoder": "not a cert",
  "svg-to-css": '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="red"/></svg>',
  "base64-image": TINY_PNG_B64,
  "curl-code": 'curl https://example.com',
  "json-to-code": '{"a":1}',
  "php-serialize": 'a:1:{s:1:"a";i:1;}',
  "erb-formatter": "<%= name %>",
  "less-formatter": ".box { color: red; }",
  "scss-formatter": ".box { color: red; }",
  "ulid-generator": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "query-string": "a=1&b=2",
};

const NO_INPUT_TOOLS = new Set(["uuid-generator", "random-string", "lorem-ipsum", "qr-code"]);

const HTML_OUTPUT_TOOLS = new Set(["markdown-preview", "html-preview"]);
const IMAGE_OUTPUT_TOOLS = new Set(["qr-code", "base64-image"]);

test.describe("All tools smoke", () => {
  test("registry contains 50 tools", () => {
    expect(TOOL_REGISTRY.length).toBe(50);
  });

  test.beforeEach(async ({ page }) => {
    await preparePage(page);
    await page.goto("/");
    await dismissOnboarding(page);
  });

  for (const tool of TOOL_REGISTRY) {
    test(`${tool.name} (${tool.id}) loads and runs`, async ({ page }) => {
      await page.goto(`/tools/${tool.id}`);
      await expect(page.getByRole("heading", { name: tool.name })).toBeVisible();

      if (CUSTOM_UI_TOOL_IDS.has(tool.id)) {
        const testId = CUSTOM_TOOL_TEST_IDS[tool.id];
        await expect(page.getByTestId(testId)).toBeVisible({ timeout: 15_000 });
        return;
      }

      await expect(page.getByTestId("tool-input")).toBeVisible({ timeout: 5000 });
      await expect(page.getByTestId("tool-input")).toBeFocused({ timeout: 5000 });

      const sample = SAMPLE_INPUTS[tool.id];

      if (NO_INPUT_TOOLS.has(tool.id)) {
        await toolOutput(page);
        return;
      }

      if (sample) {
        await page.getByTestId("tool-input").fill(sample);
      }

      if (HTML_OUTPUT_TOOLS.has(tool.id)) {
        await expect(page.getByTestId("tool-output-html")).toBeVisible({ timeout: 10_000 });
        return;
      }

      if (IMAGE_OUTPUT_TOOLS.has(tool.id)) {
        await expect(page.getByTestId("tool-output-image-img")).toBeVisible({ timeout: 10_000 });
        return;
      }

      if (tool.id === "cert-decoder") {
        await expect(
          page.getByTestId("tool-output-error").or(page.getByTestId("tool-output-text")),
        ).toBeVisible({ timeout: 15_000 });
        return;
      }

      if (sample) {
        await toolOutput(page);
      }
    });
  }
});
