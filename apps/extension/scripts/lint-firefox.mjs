#!/usr/bin/env node
/**
 * Lightweight Firefox package checks (no web-ext dependency).
 * Validates manifest shape and scans for CSP-hostile constructs.
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "../dist/firefox");
const manifestPath = join(distDir, "manifest.json");

const errors = [];
const warnings = [];

if (!existsSync(manifestPath)) {
  console.error("Missing dist/firefox/manifest.json — run pnpm build:firefox first");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

if (manifest.permissions?.includes("sidePanel")) {
  errors.push("Firefox build must not declare the sidePanel permission");
}
if (!manifest.sidebar_action) {
  errors.push("Firefox build requires sidebar_action");
}
if (manifest.side_panel) {
  errors.push("Firefox build must not declare Chrome side_panel");
}
if (!manifest.browser_specific_settings?.gecko?.id) {
  errors.push("Missing browser_specific_settings.gecko.id");
}
if (!manifest.browser_specific_settings?.gecko?.data_collection_permissions) {
  errors.push("Missing gecko.data_collection_permissions (AMO requirement)");
}
if (manifest.browser_specific_settings?.gecko?.data_collection_permissions?.required?.[0] !== "none") {
  warnings.push("Expected data_collection_permissions.required to include 'none'");
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name.endsWith(".js")) {
      const src = readFileSync(path, "utf8");
      if (/\beval\s*\(/.test(src) || /new\s+Function\s*\(/.test(src)) {
        errors.push(`CSP-hostile construct in ${path.replace(distDir + "/", "")}`);
      }
    }
  }
}

walk(distDir);

for (const w of warnings) console.warn(`warn: ${w}`);
for (const e of errors) console.error(`error: ${e}`);

if (errors.length) {
  console.error(`\nFirefox lint failed with ${errors.length} error(s)`);
  process.exit(1);
}

console.log("Firefox package checks passed");
