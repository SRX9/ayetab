import type { ToolResult } from "../types";

const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr",
]);

const ATTR_MAP: Record<string, string> = {
  class: "className",
  for: "htmlFor",
  tabindex: "tabIndex",
  readonly: "readOnly",
  maxlength: "maxLength",
  colspan: "colSpan",
  rowspan: "rowSpan",
  autofocus: "autoFocus",
};

function convertAttrs(attrs: string): string {
  return attrs.replace(/([\w:-]+)(?:="([^"]*)"|='([^']*)'|=(\S+))?/g, (_m, name, v1, v2, v3) => {
    const key = ATTR_MAP[name.toLowerCase()] ?? name.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase());
    const val = v1 ?? v2 ?? v3 ?? "";
    if (!val && VOID_TAGS.has(name)) return key;
    return val ? `${key}="${val}"` : key;
  });
}

function convertTag(html: string): string {
  return html.replace(/<\s*(\/?)([\w-]+)([^>]*?)(\/?)\s*>/g, (_m, close, tag, attrs, selfClose) => {
    const t = tag.toLowerCase();
    if (close) return `</${tag}>`;
    const jsxAttrs = convertAttrs(attrs);
    if (selfClose || VOID_TAGS.has(t)) {
      return `<${tag}${jsxAttrs ? ` ${jsxAttrs.trim()}` : ""} />`;
    }
    return `<${tag}${jsxAttrs ? ` ${jsxAttrs.trim()}` : ""}>`;
  });
}

export function htmlToJsx(input: string): ToolResult {
  try {
    let output = input.trim();
    output = output.replace(/<!--[\s\S]*?-->/g, "{/* comment */}");
    output = convertTag(output);
    return { output, language: "javascript" };
  } catch (e) {
    return { output: "", error: `HTML to JSX failed: ${(e as Error).message}` };
  }
}
