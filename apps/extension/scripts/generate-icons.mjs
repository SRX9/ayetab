#!/usr/bin/env node
/**
 * Generate branded AyeTab extension icons (PNG) without external deps.
 * Renders at 4× then box-downsamples for smoother edges.
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../public/icons");
mkdirSync(outDir, { recursive: true });

const BRAND = [0, 122, 255, 255];
const BG = [22, 28, 36, 255];
const WHITE = [255, 255, 255, 255];

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function setPixel(rgba, w, x, y, color) {
  const xi = x | 0;
  const yi = y | 0;
  if (xi < 0 || yi < 0 || xi >= w || yi >= w) return;
  const i = (yi * w + xi) * 4;
  rgba[i] = color[0];
  rgba[i + 1] = color[1];
  rgba[i + 2] = color[2];
  rgba[i + 3] = color[3];
}

function coverRoundedRect(px, py, x0, y0, x1, y1, r) {
  if (px < x0 || py < y0 || px >= x1 || py >= y1) return false;
  const left = px - x0;
  const right = x1 - 1 - px;
  const top = py - y0;
  const bottom = y1 - 1 - py;
  if (left < r && top < r) {
    const dx = r - left - 0.5;
    const dy = r - top - 0.5;
    return dx * dx + dy * dy <= r * r;
  }
  if (right < r && top < r) {
    const dx = r - right - 0.5;
    const dy = r - top - 0.5;
    return dx * dx + dy * dy <= r * r;
  }
  if (left < r && bottom < r) {
    const dx = r - left - 0.5;
    const dy = r - bottom - 0.5;
    return dx * dx + dy * dy <= r * r;
  }
  if (right < r && bottom < r) {
    const dx = r - right - 0.5;
    const dy = r - bottom - 0.5;
    return dx * dx + dy * dy <= r * r;
  }
  return true;
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const qx = x1 + t * dx;
  const qy = y1 + t * dy;
  return Math.hypot(px - qx, py - qy);
}

function drawHiRes(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const pad = size * 0.06;
  const outerR = size * 0.22;
  const inset = size * 0.2;
  const innerR = size * 0.14;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (coverRoundedRect(x, y, pad, pad, size - pad, size - pad, outerR)) {
        setPixel(rgba, size, x, y, BG);
      }
      if (coverRoundedRect(x, y, inset, inset, size - inset, size - inset, innerR)) {
        setPixel(rgba, size, x, y, BRAND);
      }
    }
  }

  const cx = size / 2;
  const topY = size * 0.34;
  const botY = size * 0.7;
  const half = size * 0.17;
  const stroke = Math.max(1.2, size * 0.065);
  const barY = size * 0.56;
  const barHalf = half * 0.42;
  const barH = stroke * 0.85;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dL = distToSegment(x + 0.5, y + 0.5, cx, topY, cx - half, botY);
      const dR = distToSegment(x + 0.5, y + 0.5, cx, topY, cx + half, botY);
      const inBar =
        x + 0.5 >= cx - barHalf &&
        x + 0.5 <= cx + barHalf &&
        y + 0.5 >= barY &&
        y + 0.5 <= barY + barH;
      if (dL <= stroke / 2 || dR <= stroke / 2 || inBar) {
        // only paint A over brand tile
        if (coverRoundedRect(x, y, inset, inset, size - inset, size - inset, innerR)) {
          setPixel(rgba, size, x, y, WHITE);
        }
      }
    }
  }

  return rgba;
}

function downsample(src, srcSize, dstSize) {
  const factor = srcSize / dstSize;
  const dst = Buffer.alloc(dstSize * dstSize * 4);
  for (let y = 0; y < dstSize; y++) {
    for (let x = 0; x < dstSize; x++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0,
        n = 0;
      const x0 = Math.floor(x * factor);
      const y0 = Math.floor(y * factor);
      const x1 = Math.floor((x + 1) * factor);
      const y1 = Math.floor((y + 1) * factor);
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const i = (sy * srcSize + sx) * 4;
          r += src[i];
          g += src[i + 1];
          b += src[i + 2];
          a += src[i + 3];
          n++;
        }
      }
      const di = (y * dstSize + x) * 4;
      dst[di] = Math.round(r / n);
      dst[di + 1] = Math.round(g / n);
      dst[di + 2] = Math.round(b / n);
      dst[di + 3] = Math.round(a / n);
    }
  }
  return dst;
}

for (const size of [16, 32, 48, 96, 128]) {
  const hi = drawHiRes(size * 4);
  const rgba = downsample(hi, size * 4, size);
  const path = resolve(outDir, `icon-${size}.png`);
  writeFileSync(path, encodePng(size, size, rgba));
  console.log(`Wrote ${path}`);
}
