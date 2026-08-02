#!/usr/bin/env node
/**
 * Generate AyeTab extension icons from the master liquid-glass logo.
 * Master: apps/landing/public/images/logo-icon.png
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../public/icons");
const master = resolve(__dirname, "../../landing/public/images/logo-icon.png");
mkdirSync(outDir, { recursive: true });

for (const size of [16, 32, 48, 96, 128]) {
  const path = resolve(outDir, `icon-${size}.png`);
  await sharp(master)
    .resize(size, size, { fit: "cover", position: "centre" })
    .png({ compressionLevel: 9 })
    .toFile(path);
  console.log(`Wrote ${path}`);
}
