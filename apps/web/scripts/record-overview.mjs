/**
 * One-shot Playwright script to record a clean AyeTab product overview video.
 * Usage: node scripts/record-overview.mjs
 * Requires the web app at http://127.0.0.1:3000
 */
import { chromium } from "@playwright/test";
import { mkdir, copyFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../test-results/overview-recording");
const ARTIFACT = "/opt/cursor/artifacts/ayetab-app-overview.mp4";
const BASE = "http://127.0.0.1:3000";

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

async function expectOutput(page) {
  const text = page.getByTestId("tool-output-text");
  const code = page.getByTestId("tool-output-code");
  await page.waitForFunction(
    () => {
      const t = document.querySelector('[data-testid="tool-output-text"]');
      const c = document.querySelector('[data-testid="tool-output-code"]');
      const tv = t && "value" in t ? t.value : t?.textContent;
      const cv = c?.textContent;
      return Boolean((tv && tv.trim()) || (cv && cv.trim()));
    },
    null,
    { timeout: 10_000 }
  );
  // Prefer visible output for the recording
  if (await text.isVisible().catch(() => false)) return;
  if (await code.isVisible().catch(() => false)) return;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: "dark",
    recordVideo: {
      dir: OUT_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.setItem("ayetab-onboarded", JSON.stringify(true));
  });

  // A. Home
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.getByTestId("home-screen").waitFor({ state: "visible" });
  await pause(1800);

  // B. Settings — Dark theme + Mesa wallpaper
  await page.getByTestId("settings-button").click();
  await page.getByTestId("settings-panel").waitFor({ state: "visible" });
  await pause(800);
  await page.getByTestId("theme-option-dark").click();
  await pause(900);
  await page.getByRole("button", { name: "Wallpaper" }).click();
  await pause(700);
  await page.getByTestId("wallpaper-mesa").click();
  await pause(1400);
  await page.getByRole("button", { name: "Close settings" }).click();
  await page.getByTestId("settings-panel").waitFor({ state: "hidden" });
  await pause(1800);

  // C. Library
  await page.getByRole("link", { name: "Library" }).click();
  await page.getByTestId("library-page").waitFor({ state: "visible" });
  await pause(1200);
  await page.mouse.wheel(0, 420);
  await pause(1400);
  await page.mouse.wheel(0, -200);
  await pause(800);

  // D. Base64 via Library — open Encode category then tool
  await page.getByRole("button", { name: "Encode & Decode 5" }).click();
  await pause(700);
  await page.getByRole("button", { name: /Base64 Encode\/Decode Encode/i }).click();
  await page.waitForURL(/\/tools\/base64/);
  await page.getByTestId("tool-input").waitFor({ state: "visible" });
  await pause(1000);
  // Ensure no command palette is open
  const accidental = page.getByTestId("command-palette");
  if (await accidental.isVisible().catch(() => false)) {
    await page.keyboard.press("Escape");
    await accidental.waitFor({ state: "hidden" });
  }
  await page.getByTestId("tool-input").click();
  await page.getByTestId("tool-input").fill("Hello AyeTab");
  await expectOutput(page);
  await pause(2000);

  // E. Back to Home
  await page.getByRole("link", { name: "Home" }).click();
  await page.getByTestId("home-screen").waitFor({ state: "visible" });
  await pause(1200);

  // F. Command palette → UUID
  await page.keyboard.press("Control+k");
  const palette = page.getByTestId("command-palette");
  await palette.waitFor({ state: "visible" });
  await pause(600);
  await palette.getByPlaceholder("Search tools...").fill("uuid");
  await pause(1000);
  await palette.getByRole("option", { name: /UUID Generator/i }).click();
  await page.waitForURL(/\/tools\/uuid-generator/);
  await pause(2200);

  await context.close();
  await browser.close();

  const files = await readdir(OUT_DIR);
  const video = files.find((f) => f.endsWith(".webm"));
  if (!video) throw new Error(`No video found in ${OUT_DIR}`);
  const src = path.join(OUT_DIR, video);

  // Convert webm → mp4 for the artifact path expected by the task
  const { spawnSync } = await import("node:child_process");
  const ffmpeg = spawnSync(
    "ffmpeg",
    ["-y", "-i", src, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", ARTIFACT],
    { encoding: "utf8" }
  );
  if (ffmpeg.status !== 0) {
    // Fallback: copy webm alongside and also as .mp4 name if ffmpeg missing
    console.error(ffmpeg.stderr);
    await copyFile(src, ARTIFACT.replace(/\.mp4$/, ".webm"));
    await copyFile(src, ARTIFACT);
    console.log(`Saved (raw) to ${ARTIFACT}`);
  } else {
    console.log(`Saved overview to ${ARTIFACT}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
