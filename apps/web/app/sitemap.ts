import type { MetadataRoute } from "next";
import { TOOL_REGISTRY, WEB_APP_ORIGIN } from "@ayetab/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const home: MetadataRoute.Sitemap[number] = {
    url: WEB_APP_ORIGIN,
    lastModified,
    changeFrequency: "weekly",
    priority: 1,
  };

  const tools: MetadataRoute.Sitemap = TOOL_REGISTRY.map((tool) => ({
    url: `${WEB_APP_ORIGIN}/tools/${tool.id}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: tool.priority === "P0" ? 0.9 : tool.priority === "P1" ? 0.8 : 0.7,
  }));

  return [home, ...tools];
}
