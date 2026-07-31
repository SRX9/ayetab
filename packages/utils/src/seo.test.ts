import { describe, expect, it } from "vitest";
import {
  TOOL_REGISTRY,
  getToolById,
  getToolSeo,
  getHomeSeo,
  buildToolJsonLd,
  buildToolsItemListJsonLd,
  WEB_APP_ORIGIN,
} from "../index";

describe("tool SEO", () => {
  it("builds unique titles and canonical URLs for every tool", () => {
    const titles = new Set<string>();
    for (const tool of TOOL_REGISTRY) {
      const seo = getToolSeo(tool);
      expect(seo.title).toContain(tool.name);
      expect(seo.title).toContain("AyeTab");
      expect(seo.description.length).toBeGreaterThan(80);
      expect(seo.canonicalUrl).toBe(`${WEB_APP_ORIGIN}/tools/${tool.id}`);
      expect(seo.keywords.length).toBeGreaterThan(3);
      titles.add(seo.title);
    }
    expect(titles.size).toBe(TOOL_REGISTRY.length);
  });

  it("emits WebApplication JSON-LD for a known tool", () => {
    const tool = getToolById("json-formatter");
    expect(tool).toBeDefined();
    const ld = buildToolJsonLd(tool!);
    expect(ld["@graph"]).toHaveLength(2);
    const app = ld["@graph"][0] as { "@type": string; name: string; url: string };
    expect(app["@type"]).toBe("WebApplication");
    expect(app.name).toBe("JSON Formatter");
    expect(app.url).toBe(`${WEB_APP_ORIGIN}/tools/json-formatter`);
  });

  it("lists every tool in the home ItemList", () => {
    const list = buildToolsItemListJsonLd(TOOL_REGISTRY);
    expect(list.numberOfItems).toBe(TOOL_REGISTRY.length);
    expect(list.itemListElement).toHaveLength(TOOL_REGISTRY.length);
  });

  it("home SEO mentions the product and privacy angle", () => {
    const home = getHomeSeo();
    expect(home.title).toContain("AyeTab");
    expect(home.description.toLowerCase()).toMatch(/browser|offline|private/);
    expect(home.canonicalUrl).toBe(WEB_APP_ORIGIN);
  });
});
