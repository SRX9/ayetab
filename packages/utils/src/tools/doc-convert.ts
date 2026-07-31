import type { ToolResult } from "../types";

export type DocFormat = "markdown" | "html" | "text" | "rtf" | "latex" | "bbcode";

export const DOC_FORMATS: Array<{ id: DocFormat; label: string; extension: string; mime: string }> = [
  { id: "markdown", label: "Markdown", extension: "md", mime: "text/markdown" },
  { id: "html", label: "HTML", extension: "html", mime: "text/html" },
  { id: "text", label: "Plain text", extension: "txt", mime: "text/plain" },
  { id: "rtf", label: "Rich Text (RTF)", extension: "rtf", mime: "application/rtf" },
  { id: "latex", label: "LaTeX", extension: "tex", mime: "application/x-tex" },
  { id: "bbcode", label: "BBCode", extension: "txt", mime: "text/plain" },
];

// ── Intermediate representation ─────────────────────────────────────────────

type Inline =
  | { type: "text"; value: string }
  | { type: "strong"; children: Inline[] }
  | { type: "em"; children: Inline[] }
  | { type: "code"; value: string }
  | { type: "strike"; children: Inline[] }
  | { type: "link"; href: string; children: Inline[] }
  | { type: "image"; src: string; alt: string };

type Block =
  | { type: "heading"; level: number; children: Inline[] }
  | { type: "paragraph"; children: Inline[] }
  | { type: "list"; ordered: boolean; items: Inline[][] }
  | { type: "quote"; children: Inline[] }
  | { type: "codeblock"; lang: string; value: string }
  | { type: "rule" };

// ── Markdown → IR ───────────────────────────────────────────────────────────

function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let rest = text;

  const patterns: Array<[RegExp, (m: RegExpMatchArray) => Inline]> = [
    [/^!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/, (m) => ({ type: "image", src: m[2], alt: m[1] })],
    [/^\[([^\]]+)\]\(([^)\s]+)[^)]*\)/, (m) => ({ type: "link", href: m[2], children: parseInline(m[1]) })],
    [/^`([^`]+)`/, (m) => ({ type: "code", value: m[1] })],
    [/^\*\*\*([^*]+)\*\*\*/, (m) => ({ type: "strong", children: [{ type: "em", children: parseInline(m[1]) }] })],
    [/^\*\*([^*]+)\*\*/, (m) => ({ type: "strong", children: parseInline(m[1]) })],
    [/^__([^_]+)__/, (m) => ({ type: "strong", children: parseInline(m[1]) })],
    [/^~~([^~]+)~~/, (m) => ({ type: "strike", children: parseInline(m[1]) })],
    [/^\*([^*]+)\*/, (m) => ({ type: "em", children: parseInline(m[1]) })],
    [/^_([^_]+)_/, (m) => ({ type: "em", children: parseInline(m[1]) })],
    [/^<(https?:\/\/[^>]+)>/, (m) => ({ type: "link", href: m[1], children: [{ type: "text", value: m[1] }] })],
  ];

  let buffer = "";
  while (rest.length > 0) {
    let matched = false;
    for (const [pattern, build] of patterns) {
      const m = rest.match(pattern);
      if (m) {
        if (buffer) {
          out.push({ type: "text", value: buffer });
          buffer = "";
        }
        out.push(build(m));
        rest = rest.slice(m[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      buffer += rest[0];
      rest = rest.slice(1);
    }
  }
  if (buffer) out.push({ type: "text", value: buffer });

  return out;
}

function parseMarkdown(input: string): Block[] {
  const lines = input.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    // Fenced code block
    const fence = line.match(/^\s*```+\s*(\S*)/);
    if (fence) {
      const lang = fence[1] ?? "";
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) {
        body.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({ type: "codeblock", lang, value: body.join("\n") });
      continue;
    }

    if (/^\s*(?:[-*_]\s*){3,}$/.test(line)) {
      blocks.push({ type: "rule" });
      i++;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, children: parseInline(heading[2].trim()) });
      i++;
      continue;
    }

    // Setext heading
    if (i + 1 < lines.length && /^\s*(=+|-+)\s*$/.test(lines[i + 1]) && line.trim()) {
      blocks.push({
        type: "heading",
        level: lines[i + 1].trim().startsWith("=") ? 1 : 2,
        children: parseInline(line.trim()),
      });
      i += 2;
      continue;
    }

    if (/^\s*>/.test(line)) {
      const body: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        body.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      blocks.push({ type: "quote", children: parseInline(body.join(" ")) });
      continue;
    }

    const bullet = line.match(/^\s*[-*+]\s+/);
    const numbered = line.match(/^\s*\d+[.)]\s+/);
    if (bullet || numbered) {
      const ordered = Boolean(numbered);
      const items: Inline[][] = [];
      while (i < lines.length) {
        const m = lines[i].match(ordered ? /^\s*\d+[.)]\s+(.*)$/ : /^\s*[-*+]\s+(.*)$/);
        if (!m) break;
        items.push(parseInline(m[1]));
        i++;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    // Paragraph: gather until a blank line or a new block marker.
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^\s*(#{1,6}\s|>|```|[-*+]\s|\d+[.)]\s)/.test(lines[i])
    ) {
      para.push(lines[i].trim());
      i++;
    }
    if (para.length > 0) blocks.push({ type: "paragraph", children: parseInline(para.join(" ")) });
    else i++;
  }

  return blocks;
}

// ── HTML → IR ───────────────────────────────────────────────────────────────

function decodeEntities(s: string): string {
  const named: Record<string, string> = {
    amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", mdash: "—",
    ndash: "–", hellip: "…", ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’",
  };
  return s
    .replace(/&#(\d+);/g, (_m, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&(\w+);/g, (m, name) => named[name] ?? m);
}

function parseHtmlInline(html: string): Inline[] {
  const out: Inline[] = [];
  let rest = html;
  let buffer = "";

  const flush = () => {
    if (buffer) {
      out.push({ type: "text", value: decodeEntities(buffer) });
      buffer = "";
    }
  };

  const wrappers: Array<[RegExp, (m: RegExpMatchArray) => Inline]> = [
    [/^<(?:strong|b)\b[^>]*>([\s\S]*?)<\/(?:strong|b)>/i, (m) => ({ type: "strong", children: parseHtmlInline(m[1]) })],
    [/^<(?:em|i)\b[^>]*>([\s\S]*?)<\/(?:em|i)>/i, (m) => ({ type: "em", children: parseHtmlInline(m[1]) })],
    [/^<(?:del|s|strike)\b[^>]*>([\s\S]*?)<\/(?:del|s|strike)>/i, (m) => ({ type: "strike", children: parseHtmlInline(m[1]) })],
    [/^<code\b[^>]*>([\s\S]*?)<\/code>/i, (m) => ({ type: "code", value: decodeEntities(m[1].replace(/<[^>]+>/g, "")) })],
    [/^<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i, (m) => ({ type: "link", href: m[1], children: parseHtmlInline(m[2]) })],
    [/^<img\b[^>]*>/i, (m) => ({
      type: "image",
      src: m[0].match(/src\s*=\s*["']([^"']+)["']/i)?.[1] ?? "",
      alt: m[0].match(/alt\s*=\s*["']([^"']*)["']/i)?.[1] ?? "",
    })],
  ];

  while (rest.length > 0) {
    let matched = false;
    if (rest[0] === "<") {
      for (const [pattern, build] of wrappers) {
        const m = rest.match(pattern);
        if (m) {
          flush();
          out.push(build(m));
          rest = rest.slice(m[0].length);
          matched = true;
          break;
        }
      }
      if (!matched) {
        const tag = rest.match(/^<[^>]*>/);
        if (tag) {
          if (/^<br\b/i.test(tag[0])) buffer += "\n";
          rest = rest.slice(tag[0].length);
          matched = true;
        }
      }
    }
    if (!matched) {
      buffer += rest[0];
      rest = rest.slice(1);
    }
  }
  flush();

  return out;
}

function parseHtml(input: string): Block[] {
  // Strip anything that never renders as prose.
  let html = input
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|head)\b[\s\S]*?<\/\1>/gi, "");

  const body = html.match(/<body\b[^>]*>([\s\S]*)<\/body>/i);
  if (body) html = body[1];

  const blocks: Block[] = [];
  const blockPattern =
    /<(h[1-6]|p|blockquote|pre|ul|ol|hr)\b[^>]*>([\s\S]*?)<\/\1>|<hr\b[^>]*\/?>/gi;

  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = blockPattern.exec(html)) !== null) {
    // Loose text between recognised blocks still counts as a paragraph.
    const between = html.slice(lastIndex, match.index).replace(/<[^>]+>/g, "").trim();
    if (between) blocks.push({ type: "paragraph", children: [{ type: "text", value: decodeEntities(between) }] });
    lastIndex = blockPattern.lastIndex;

    const tag = (match[1] ?? "hr").toLowerCase();
    const inner = match[2] ?? "";

    if (tag === "hr") {
      blocks.push({ type: "rule" });
    } else if (/^h[1-6]$/.test(tag)) {
      blocks.push({ type: "heading", level: Number(tag[1]), children: parseHtmlInline(inner) });
    } else if (tag === "p") {
      blocks.push({ type: "paragraph", children: parseHtmlInline(inner) });
    } else if (tag === "blockquote") {
      blocks.push({ type: "quote", children: parseHtmlInline(inner.replace(/<\/?p[^>]*>/gi, " ")) });
    } else if (tag === "pre") {
      const lang = inner.match(/class\s*=\s*["'][^"']*language-(\w+)/i)?.[1] ?? "";
      blocks.push({ type: "codeblock", lang, value: decodeEntities(inner.replace(/<[^>]+>/g, "")).replace(/^\n/, "") });
    } else if (tag === "ul" || tag === "ol") {
      const items = [...inner.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((li) => parseHtmlInline(li[1]));
      blocks.push({ type: "list", ordered: tag === "ol", items });
    }
  }

  const tail = html.slice(lastIndex).replace(/<[^>]+>/g, "").trim();
  if (tail) blocks.push({ type: "paragraph", children: [{ type: "text", value: decodeEntities(tail) }] });

  return blocks;
}

// ── IR → output ─────────────────────────────────────────────────────────────

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function renderInline(nodes: Inline[], format: DocFormat): string {
  return nodes
    .map((n) => {
      const kids = (children: Inline[]) => renderInline(children, format);
      switch (n.type) {
        case "text":
          if (format === "html") return escapeHtml(n.value);
          if (format === "latex") {
            return n.value.replace(/([&%$#_{}])/g, "\\$1").replace(/\\/g, "\\textbackslash{}");
          }
          if (format === "rtf") return n.value.replace(/([\\{}])/g, "\\$1").replace(/\n/g, "\\line ");
          return n.value;
        case "strong":
          if (format === "markdown") return `**${kids(n.children)}**`;
          if (format === "html") return `<strong>${kids(n.children)}</strong>`;
          if (format === "latex") return `\\textbf{${kids(n.children)}}`;
          if (format === "rtf") return `{\\b ${kids(n.children)}}`;
          if (format === "bbcode") return `[b]${kids(n.children)}[/b]`;
          return kids(n.children);
        case "em":
          if (format === "markdown") return `*${kids(n.children)}*`;
          if (format === "html") return `<em>${kids(n.children)}</em>`;
          if (format === "latex") return `\\textit{${kids(n.children)}}`;
          if (format === "rtf") return `{\\i ${kids(n.children)}}`;
          if (format === "bbcode") return `[i]${kids(n.children)}[/i]`;
          return kids(n.children);
        case "strike":
          if (format === "markdown") return `~~${kids(n.children)}~~`;
          if (format === "html") return `<del>${kids(n.children)}</del>`;
          if (format === "latex") return `\\sout{${kids(n.children)}}`;
          if (format === "rtf") return `{\\strike ${kids(n.children)}}`;
          if (format === "bbcode") return `[s]${kids(n.children)}[/s]`;
          return kids(n.children);
        case "code":
          if (format === "markdown") return `\`${n.value}\``;
          if (format === "html") return `<code>${escapeHtml(n.value)}</code>`;
          if (format === "latex") return `\\texttt{${n.value.replace(/([&%$#_{}])/g, "\\$1")}}`;
          if (format === "rtf") return `{\\f1 ${n.value.replace(/([\\{}])/g, "\\$1")}}`;
          if (format === "bbcode") return `[code]${n.value}[/code]`;
          return n.value;
        case "link":
          if (format === "markdown") return `[${kids(n.children)}](${n.href})`;
          if (format === "html") return `<a href="${escapeHtml(n.href)}">${kids(n.children)}</a>`;
          if (format === "latex") return `\\href{${n.href}}{${kids(n.children)}}`;
          if (format === "rtf") return `${kids(n.children)} <${n.href}>`;
          if (format === "bbcode") return `[url=${n.href}]${kids(n.children)}[/url]`;
          return `${kids(n.children)} (${n.href})`;
        case "image":
          if (format === "markdown") return `![${n.alt}](${n.src})`;
          if (format === "html") return `<img src="${escapeHtml(n.src)}" alt="${escapeHtml(n.alt)}">`;
          if (format === "latex") return `\\includegraphics{${n.src}}`;
          if (format === "bbcode") return `[img]${n.src}[/img]`;
          return n.alt || n.src;
      }
    })
    .join("");
}

function render(blocks: Block[], format: DocFormat): string {
  const parts: string[] = [];

  for (const b of blocks) {
    switch (b.type) {
      case "heading": {
        const text = renderInline(b.children, format);
        if (format === "markdown") parts.push(`${"#".repeat(b.level)} ${text}`);
        else if (format === "html") parts.push(`<h${b.level}>${text}</h${b.level}>`);
        else if (format === "latex") {
          const cmd = ["section", "subsection", "subsubsection", "paragraph", "subparagraph", "subparagraph"][b.level - 1];
          parts.push(`\\${cmd}{${text}}`);
        } else if (format === "rtf") {
          const size = [36, 32, 28, 26, 24, 22][b.level - 1];
          parts.push(`{\\pard\\sa180\\b\\fs${size} ${text}\\par}`);
        } else if (format === "bbcode") parts.push(`[size=${7 - b.level}][b]${text}[/b][/size]`);
        else parts.push(`${text}\n${"=".repeat(Math.min(text.length, 60))}`);
        break;
      }
      case "paragraph": {
        const text = renderInline(b.children, format);
        if (format === "html") parts.push(`<p>${text}</p>`);
        else if (format === "rtf") parts.push(`{\\pard\\sa180 ${text}\\par}`);
        else parts.push(text);
        break;
      }
      case "quote": {
        const text = renderInline(b.children, format);
        if (format === "markdown") parts.push(`> ${text}`);
        else if (format === "html") parts.push(`<blockquote><p>${text}</p></blockquote>`);
        else if (format === "latex") parts.push(`\\begin{quote}\n${text}\n\\end{quote}`);
        else if (format === "rtf") parts.push(`{\\pard\\li720\\sa180\\i ${text}\\par}`);
        else if (format === "bbcode") parts.push(`[quote]${text}[/quote]`);
        else parts.push(`    ${text}`);
        break;
      }
      case "list": {
        const rendered = b.items.map((it) => renderInline(it, format));
        if (format === "markdown") {
          parts.push(rendered.map((t, idx) => (b.ordered ? `${idx + 1}. ${t}` : `- ${t}`)).join("\n"));
        } else if (format === "html") {
          const tag = b.ordered ? "ol" : "ul";
          parts.push(`<${tag}>\n${rendered.map((t) => `  <li>${t}</li>`).join("\n")}\n</${tag}>`);
        } else if (format === "latex") {
          const env = b.ordered ? "enumerate" : "itemize";
          parts.push(`\\begin{${env}}\n${rendered.map((t) => `  \\item ${t}`).join("\n")}\n\\end{${env}}`);
        } else if (format === "rtf") {
          parts.push(
            rendered
              .map((t, idx) => `{\\pard\\li360\\sa60 ${b.ordered ? `${idx + 1}.` : "\\bullet"} ${t}\\par}`)
              .join("\n")
          );
        } else if (format === "bbcode") {
          parts.push(`[list${b.ordered ? "=1" : ""}]\n${rendered.map((t) => `[*]${t}`).join("\n")}\n[/list]`);
        } else {
          parts.push(rendered.map((t, idx) => (b.ordered ? `  ${idx + 1}. ${t}` : `  • ${t}`)).join("\n"));
        }
        break;
      }
      case "codeblock": {
        if (format === "markdown") parts.push(`\`\`\`${b.lang}\n${b.value}\n\`\`\``);
        else if (format === "html")
          parts.push(`<pre><code${b.lang ? ` class="language-${b.lang}"` : ""}>${escapeHtml(b.value)}</code></pre>`);
        else if (format === "latex") parts.push(`\\begin{verbatim}\n${b.value}\n\\end{verbatim}`);
        else if (format === "rtf")
          parts.push(`{\\pard\\f1\\fs20\\sa180 ${b.value.replace(/([\\{}])/g, "\\$1").replace(/\n/g, "\\line ")}\\par}`);
        else if (format === "bbcode") parts.push(`[code]\n${b.value}\n[/code]`);
        else parts.push(b.value.split("\n").map((l) => `    ${l}`).join("\n"));
        break;
      }
      case "rule": {
        if (format === "markdown") parts.push("---");
        else if (format === "html") parts.push("<hr>");
        else if (format === "latex") parts.push("\\hrulefill");
        else if (format === "rtf") parts.push("{\\pard\\brdrb\\brdrs\\brdrw10\\brsp20 \\par}");
        else if (format === "bbcode") parts.push("[hr]");
        else parts.push("─".repeat(60));
        break;
      }
    }
  }

  const body = parts.join(format === "rtf" ? "\n" : "\n\n");

  if (format === "html") {
    return `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>Document</title>\n</head>\n<body>\n${body}\n</body>\n</html>`;
  }
  if (format === "rtf") {
    return `{\\rtf1\\ansi\\deff0\n{\\fonttbl{\\f0 Georgia;}{\\f1 Consolas;}}\n\\fs24\n${body}\n}`;
  }
  if (format === "latex") {
    return `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{hyperref}\n\\usepackage{graphicx}\n\\usepackage[normalem]{ulem}\n\n\\begin{document}\n\n${body}\n\n\\end{document}`;
  }
  return body;
}

// ── Entry point ─────────────────────────────────────────────────────────────

export function convertDocument(input: string, from: DocFormat, to: DocFormat): ToolResult {
  if (from === to) return { output: input };

  let blocks: Block[];
  if (from === "html") blocks = parseHtml(input);
  else if (from === "markdown") blocks = parseMarkdown(input);
  else {
    // Plain text and the write-only formats round-trip through paragraphs.
    blocks = input
      .replace(/\r\n/g, "\n")
      .split(/\n\s*\n/)
      .filter((p) => p.trim())
      .map((p) => ({ type: "paragraph", children: [{ type: "text", value: p.trim() }] }) as Block);
  }

  if (blocks.length === 0) return { output: "", error: "Nothing to convert." };

  const language = to === "html" ? "html" : to === "latex" ? "latex" : to === "markdown" ? "markdown" : "text";
  return { output: render(blocks, to), language, meta: { blocks: blocks.length } };
}

/** Detect the most likely source format so the UI can preselect it. */
export function detectDocFormat(input: string): DocFormat {
  const s = input.trim();
  if (/^\s*<(!doctype|html|body|div|p|h[1-6])\b/i.test(s) || /<\/(p|div|h[1-6]|body)>/i.test(s)) return "html";
  if (/^\\documentclass|\\begin\{document\}/m.test(s)) return "latex";
  if (/^\{\\rtf/.test(s)) return "rtf";
  if (/\[\/(b|i|url|quote|code)\]/i.test(s)) return "bbcode";
  if (/^#{1,6}\s|^\s*[-*+]\s|\*\*[^*]+\*\*|^```/m.test(s)) return "markdown";
  return "text";
}
