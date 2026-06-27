import type { ToolResult } from "./types";

const NO_INPUT_TOOLS = new Set([
  "uuid-generator",
  "random-string",
  "lorem-ipsum",
  "ulid-generator",
  "qr-code",
]);

export async function executeTool(
  toolId: string,
  input: string,
  options?: Record<string, unknown>
): Promise<ToolResult> {
  if (!input.trim() && !NO_INPUT_TOOLS.has(toolId)) {
    return { output: "" };
  }

  switch (toolId) {
    case "json-formatter": {
      const { formatJson, minifyJson } = await import("./tools/json");
      return options?.action === "minify" ? minifyJson(input) : formatJson(input);
    }
    case "html-formatter": {
      const { formatHtml } = await import("./tools/beautify");
      return formatHtml(input, options?.action === "minify");
    }
    case "css-formatter": {
      const { formatCss } = await import("./tools/beautify");
      return formatCss(input, options?.action === "minify");
    }
    case "js-formatter": {
      const { formatJs } = await import("./tools/beautify");
      return formatJs(input, options?.action === "minify");
    }
    case "xml-formatter": {
      const { formatXml } = await import("./tools/xml");
      return formatXml(input, options?.action === "minify");
    }
    case "erb-formatter": {
      const { formatErb } = await import("./tools/template-formatters");
      return formatErb(input, options?.action === "minify");
    }
    case "less-formatter": {
      const { formatLess } = await import("./tools/template-formatters");
      return formatLess(input, options?.action === "minify");
    }
    case "scss-formatter": {
      const { formatScss } = await import("./tools/template-formatters");
      return formatScss(input, options?.action === "minify");
    }
    case "sql-formatter": {
      const { formatSqlQuery } = await import("./tools/sql");
      return formatSqlQuery(input, (options?.dialect as string) ?? "sql");
    }
    case "yaml-json": {
      const { convertYamlJson } = await import("./tools/yaml-json");
      return convertYamlJson(input);
    }
    case "json-csv": {
      const { convertJsonCsv } = await import("./tools/json-csv");
      return convertJsonCsv(input);
    }
    case "text-diff": {
      const { computeTextDiff, parseDiffInput } = await import("./tools/text-diff");
      const { left, right } = parseDiffInput(input);
      return computeTextDiff(left, right);
    }
    case "markdown-preview": {
      const { renderMarkdown } = await import("./tools/markdown");
      return renderMarkdown(input);
    }
    case "html-preview": {
      const { previewHtml } = await import("./tools/html-preview");
      return previewHtml(input);
    }
    case "cron-parser": {
      const { parseCron } = await import("./tools/cron");
      return parseCron(input);
    }
    case "lorem-ipsum": {
      const { generateLoremIpsum } = await import("./tools/lorem-ipsum");
      return generateLoremIpsum((options?.paragraphs as number) ?? 3);
    }
    case "html-jsx": {
      const { htmlToJsx } = await import("./tools/html-jsx");
      return htmlToJsx(input);
    }
    case "qr-code": {
      const { generateQrCode } = await import("./tools/qr-code");
      return generateQrCode(input);
    }
    case "backslash-escape": {
      const { convertBackslash } = await import("./tools/backslash");
      return convertBackslash(input);
    }
    case "cert-decoder": {
      const { decodeCertificate } = await import("./tools/cert");
      return decodeCertificate(input);
    }
    case "svg-to-css": {
      const { svgToCss } = await import("./tools/svg-css");
      return svgToCss(input);
    }
    case "base64-image": {
      const { convertBase64Image } = await import("./tools/base64-image");
      return convertBase64Image(input);
    }
    case "curl-code": {
      const { curlToCode } = await import("./tools/curl");
      return curlToCode(input, (options?.lang as string) ?? "fetch");
    }
    case "json-to-code": {
      const { jsonToCode } = await import("./tools/json-to-code");
      return jsonToCode(input, (options?.lang as string) ?? "typescript");
    }
    case "php-serialize": {
      const { convertPhpSerialize } = await import("./tools/php-serialize");
      return convertPhpSerialize(input);
    }
    case "ulid-generator": {
      const { convertUlid, generateUlid } = await import("./tools/ulid");
      return options?.action === "generate" ? generateUlid(5) : convertUlid(input);
    }
    case "query-string": {
      const { convertQueryString } = await import("./tools/query-string");
      return convertQueryString(input);
    }
    case "base64": {
      const { encodeBase64, decodeBase64 } = await import("./tools/base64");
      return /^[A-Za-z0-9+/]+=*$/.test(input.trim()) ? decodeBase64(input) : encodeBase64(input);
    }
    case "url-encode": {
      const { encodeUrl, decodeUrl } = await import("./tools/url");
      return input.includes("%") ? decodeUrl(input) : encodeUrl(input);
    }
    case "url-parser": {
      const { parseUrl } = await import("./tools/url");
      return parseUrl(input);
    }
    case "hash-generator": {
      const { generateHashes } = await import("./tools/hash");
      return generateHashes(input);
    }
    case "uuid-generator": {
      const { generateUuid } = await import("./tools/uuid");
      return generateUuid((options?.count as number) ?? 5);
    }
    case "unix-time": {
      const { convertUnixTime } = await import("./tools/unix-time");
      return convertUnixTime(input);
    }
    case "jwt-debugger": {
      const { decodeJwt } = await import("./tools/jwt");
      return decodeJwt(input);
    }
    case "regex-tester": {
      const { testRegex } = await import("./tools/regex");
      const [pattern, ...rest] = input.split("\n");
      return testRegex(pattern ?? "", rest.join("\n"), (options?.flags as string) ?? "g");
    }
    case "color-converter": {
      const { convertColor } = await import("./tools/color");
      return convertColor(input);
    }
    case "number-base": {
      const { autoDetectBase } = await import("./tools/number-base");
      return autoDetectBase(input);
    }
    case "case-converter": {
      const { convertCase } = await import("./tools/case");
      return convertCase(input);
    }
    case "line-sort": {
      const { sortLines } = await import("./tools/line-sort");
      return sortLines(input, {
        order: (options?.order as "asc" | "desc") ?? "asc",
        unique: (options?.unique as boolean) ?? true,
      });
    }
    case "hex-ascii": {
      const { convertHexAscii } = await import("./tools/hex-ascii");
      return convertHexAscii(input);
    }
    case "string-inspector": {
      const { inspectString } = await import("./tools/string-inspector");
      return inspectString(input);
    }
    case "random-string": {
      const { generateRandomString } = await import("./tools/random-string");
      return generateRandomString(
        (options?.length as number) ?? 32,
        (options?.charset as "alphanumeric") ?? "alphanumeric"
      );
    }
    case "html-entity": {
      const { convertHtmlEntities } = await import("./tools/html-entity");
      return convertHtmlEntities(input);
    }
    default:
      return { output: "", error: `Tool "${toolId}" is not yet implemented.` };
  }
}
