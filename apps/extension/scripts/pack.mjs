#!/usr/bin/env node
/**
 * Zip a browser-specific extension dist for Chrome Web Store / AMO upload.
 * Usage: node scripts/pack.mjs <chrome|firefox>
 */
import { existsSync, mkdirSync, rmSync, statSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const target = process.argv[2];

if (target !== "chrome" && target !== "firefox") {
  console.error("Usage: node scripts/pack.mjs <chrome|firefox>");
  process.exit(1);
}

const distDir = resolve(root, "dist", target);
const outDir = resolve(root, "dist");
const manifestPath = resolve(distDir, "manifest.json");

if (!existsSync(manifestPath)) {
  console.error(`Missing ${manifestPath}. Run: pnpm build:${target}`);
  process.exit(1);
}

const version = JSON.parse(readFileSync(manifestPath, "utf8")).version ?? "0.0.0";
const zipPath = resolve(outDir, `ayetab-${target}-v${version}.zip`);


mkdirSync(outDir, { recursive: true });
if (existsSync(zipPath)) rmSync(zipPath);

const result = spawnSync(
  "zip",
  ["-r", "-FS", "-q", zipPath, ".", "-x", "*.map", "-x", "**/.DS_Store"],
  { cwd: distDir, stdio: "inherit" }
);

if (result.status !== 0) {
  console.error("zip failed — is the zip CLI installed?");
  process.exit(result.status ?? 1);
}

const mb = (statSync(zipPath).size / (1024 * 1024)).toFixed(2);
console.log(`Packed ${target}: ${zipPath} (${mb} MiB)`);
