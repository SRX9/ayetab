export interface MetaTagInput {
  title: string;
  description: string;
  url: string;
  image: string;
  imageAlt: string;
  siteName: string;
  author: string;
  keywords: string;
  themeColor: string;
  locale: string;
  type: string;
  twitterCard: "summary" | "summary_large_image" | "app" | "player";
  twitterSite: string;
  twitterCreator: string;
  robots: string;
  canonical: boolean;
  favicon: boolean;
  viewport: boolean;
}

export const DEFAULT_META_INPUT: MetaTagInput = {
  title: "",
  description: "",
  url: "",
  image: "",
  imageAlt: "",
  siteName: "",
  author: "",
  keywords: "",
  themeColor: "#000000",
  locale: "en_US",
  type: "website",
  twitterCard: "summary_large_image",
  twitterSite: "",
  twitterCreator: "",
  robots: "index, follow",
  canonical: true,
  favicon: true,
  viewport: true,
};

export const OG_TYPES = ["website", "article", "book", "profile", "video.movie", "music.song"];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const handle = (s: string) => {
  const t = s.trim();
  if (!t) return "";
  return t.startsWith("@") ? t : `@${t}`;
};

export function generateMetaTags(input: MetaTagInput): string {
  const lines: string[] = [];
  const meta = (name: string, content: string, attr: "name" | "property" = "name") => {
    if (content.trim()) lines.push(`<meta ${attr}="${name}" content="${esc(content.trim())}">`);
  };

  lines.push("<!-- Primary -->");
  lines.push('<meta charset="utf-8">');
  if (input.viewport) lines.push('<meta name="viewport" content="width=device-width, initial-scale=1">');
  if (input.title.trim()) lines.push(`<title>${esc(input.title.trim())}</title>`);
  meta("description", input.description);
  meta("keywords", input.keywords);
  meta("author", input.author);
  meta("robots", input.robots);
  meta("theme-color", input.themeColor);

  if (input.canonical && input.url.trim()) {
    lines.push(`<link rel="canonical" href="${esc(input.url.trim())}">`);
  }

  if (input.favicon) {
    lines.push("");
    lines.push("<!-- Icons -->");
    lines.push('<link rel="icon" href="/favicon.ico" sizes="32x32">');
    lines.push('<link rel="icon" href="/icon.svg" type="image/svg+xml">');
    lines.push('<link rel="apple-touch-icon" href="/apple-touch-icon.png">');
    lines.push('<link rel="manifest" href="/site.webmanifest">');
  }

  lines.push("");
  lines.push("<!-- Open Graph -->");
  meta("og:type", input.type, "property");
  meta("og:title", input.title, "property");
  meta("og:description", input.description, "property");
  meta("og:url", input.url, "property");
  meta("og:image", input.image, "property");
  meta("og:image:alt", input.imageAlt, "property");
  meta("og:site_name", input.siteName, "property");
  meta("og:locale", input.locale, "property");

  lines.push("");
  lines.push("<!-- Twitter -->");
  meta("twitter:card", input.twitterCard);
  meta("twitter:title", input.title);
  meta("twitter:description", input.description);
  meta("twitter:image", input.image);
  meta("twitter:image:alt", input.imageAlt);
  meta("twitter:site", handle(input.twitterSite));
  meta("twitter:creator", handle(input.twitterCreator));

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export interface MetaWarning {
  field: string;
  level: "error" | "warn";
  message: string;
}

/** Length limits before major platforms truncate. */
export function validateMetaTags(input: MetaTagInput): MetaWarning[] {
  const out: MetaWarning[] = [];

  if (!input.title.trim()) out.push({ field: "title", level: "error", message: "Title is required." });
  else if (input.title.length > 60)
    out.push({ field: "title", level: "warn", message: `${input.title.length} chars — Google truncates around 60.` });

  if (!input.description.trim())
    out.push({ field: "description", level: "error", message: "Description is required." });
  else if (input.description.length > 160)
    out.push({
      field: "description",
      level: "warn",
      message: `${input.description.length} chars — Google truncates around 160.`,
    });
  else if (input.description.length < 50)
    out.push({ field: "description", level: "warn", message: "Under 50 chars reads as thin in search results." });

  if (input.image.trim() && !input.imageAlt.trim())
    out.push({ field: "imageAlt", level: "warn", message: "Add alt text so the card is accessible." });

  if (input.image.trim() && !/^https?:\/\//i.test(input.image.trim()))
    out.push({ field: "image", level: "error", message: "og:image must be an absolute URL." });

  if (input.url.trim() && !/^https?:\/\//i.test(input.url.trim()))
    out.push({ field: "url", level: "error", message: "og:url must be an absolute URL." });

  return out;
}
