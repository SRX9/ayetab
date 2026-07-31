import { describe, expect, it } from "vitest";
import { executeTool } from "../executor";
import { TOOL_REGISTRY } from "../registry";
import { ALL_CATEGORIES } from "../types";
import { generatePalette, tailwindScale, gradeContrast, hexToRgb, quantize } from "./color-utils";
import { convertUnit, UNIT_DIMENSIONS, convertTemperature, convertTypoUnits } from "./units";
import { runCipher, autoDetect } from "./ciphers";
import { convertDocument, detectDocFormat } from "./doc-convert";

describe("catalog", () => {
  it("has unique ids and valid categories", () => {
    const ids = TOOL_REGISTRY.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const t of TOOL_REGISTRY) expect(ALL_CATEGORIES).toContain(t.category);
  });
  it("registry size", () => { console.log("TOOLS:", TOOL_REGISTRY.length); expect(TOOL_REGISTRY.length).toBeGreaterThan(90); });
});

describe("new handlers", () => {
  it("svg optimiser shrinks", async () => {
    const r = await executeTool("svg-optimiser", `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><!-- hi --><title>x</title><path d="M 1.23456 2.34567 L 3.45678 4.56789"/></svg>`);
    expect(r.error).toBeUndefined();
    expect(r.output).not.toContain("<!--");
    expect(r.output).not.toContain("<title>");
    expect(r.output).toContain("1.23");
    expect((r.meta as any).saved).toBeGreaterThan(0);
  });
  it("word counter counts", async () => {
    const r = await executeTool("word-counter", "Hello world. This is a test sentence!");
    expect((r.meta as any).words).toBe(7);
    expect((r.meta as any).sentences).toBe(2);
  });
  it("caesar round trips", async () => {
    const enc = runCipher("attack at dawn", "caesar", "5", "encode");
    const dec = runCipher(enc.output, "caesar", "5", "decode");
    expect(dec.output).toBe("attack at dawn");
  });
  it("auto-detect finds rot13", () => {
    const best = autoDetect("Gur dhvpx oebja sbk whzcf bire gur ynml qbt")[0];
    expect(best.output.toLowerCase()).toContain("the quick brown fox");
  });
  it("morse round trips", () => {
    const enc = runCipher("sos help", "morse", "", "encode");
    expect(runCipher(enc.output, "morse", "", "decode").output).toBe("sos help");
  });
  it("shavian uses dictionary", async () => {
    const r = await executeTool("shavian-transliterator", "the quick brown fox");
    expect(r.output).toContain("𐑞");
    expect((r.meta as any).fromDictionary).toBeGreaterThan(0);
  });
  it("doc converter md -> html", () => {
    const r = convertDocument("# Title\n\nSome **bold** and a [link](https://x.com).\n\n- one\n- two", "markdown", "html");
    expect(r.output).toContain("<h1>Title</h1>");
    expect(r.output).toContain("<strong>bold</strong>");
    expect(r.output).toContain('<a href="https://x.com">link</a>');
    expect(r.output).toContain("<li>one</li>");
  });
  it("doc converter html -> md round trip", () => {
    const md = convertDocument("<h2>Hi</h2><p>A <em>test</em>.</p>", "html", "markdown");
    expect(md.output).toContain("## Hi");
    expect(md.output).toContain("*test*");
  });
  it("detects formats", () => {
    expect(detectDocFormat("<!doctype html><html><body><p>x</p></body></html>")).toBe("html");
    expect(detectDocFormat("# Heading\n\ntext")).toBe("markdown");
    expect(detectDocFormat("\\documentclass{article}")).toBe("latex");
  });
});

describe("colour maths", () => {
  it("contrast black on white is 21", () => {
    expect(gradeContrast(hexToRgb("#000")!, hexToRgb("#fff")!).ratio).toBeCloseTo(21, 5);
  });
  it("wcag grading", () => {
    const v = gradeContrast(hexToRgb("#767676")!, hexToRgb("#ffffff")!);
    expect(v.aaNormal).toBe(true);
    expect(v.aaaNormal).toBe(false);
  });
  it("palette returns n colours", () => {
    const p = generatePalette(hexToRgb("#4f46e5")!, "vibrant", 6);
    expect(p).toHaveLength(6);
    for (const c of p) expect(c).toMatch(/^#[0-9a-f]{6}$/);
  });
  it("tailwind scale keeps the seed", () => {
    const s = tailwindScale(hexToRgb("#3b82f6")!);
    expect(s).toHaveLength(11);
    expect(s.filter((x) => x.isSeed)).toHaveLength(1);
    expect(s.find((x) => x.isSeed)!.hex).toBe("#3b82f6");
  });
  it("quantize splits colours", () => {
    const px = [...Array(50)].map(() => ({ r: 255, g: 0, b: 0 })).concat([...Array(50)].map(() => ({ r: 0, g: 0, b: 255 })));
    const q = quantize(px, 2);
    expect(q).toHaveLength(2);
    expect(q[0].share).toBeCloseTo(0.5, 1);
  });
});

describe("units", () => {
  it("metre to foot", () => {
    const d = UNIT_DIMENSIONS.find((x) => x.id === "length")!;
    const m = d.units.find((u) => u.id === "m")!;
    const ft = d.units.find((u) => u.id === "ft")!;
    expect(convertUnit(1, m, ft)).toBeCloseTo(3.28084, 4);
  });
  it("temperature", () => {
    expect(convertTemperature(100, "c", "f")).toBeCloseTo(212, 6);
    expect(convertTemperature(0, "c", "k")).toBeCloseTo(273.15, 6);
  });
  it("typo units", () => {
    const r = convertTypoUnits(16, "px", 16, 16);
    expect(r.rem).toBeCloseTo(1, 6);
    expect(r.pt).toBeCloseTo(12, 6);
  });
});
