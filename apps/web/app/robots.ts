import type { MetadataRoute } from "next";
import { WEB_APP_ORIGIN } from "@ayetab/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/library"],
      },
    ],
    sitemap: `${WEB_APP_ORIGIN}/sitemap.xml`,
    host: WEB_APP_ORIGIN,
  };
}
