import type { ToolResult } from "./types";
import { formatJson, minifyJson } from "./tools/json";
import { encodeBase64, decodeBase64 } from "./tools/base64";
import { encodeUrl, decodeUrl, parseUrl } from "./tools/url";
import { generateHashes } from "./tools/hash";
import { generateUuid } from "./tools/uuid";
import { convertUnixTime } from "./tools/unix-time";
import { decodeJwt } from "./tools/jwt";
import { testRegex } from "./tools/regex";
import { convertColor } from "./tools/color";
import { autoDetectBase } from "./tools/number-base";
import { convertCase } from "./tools/case";
import { sortLines } from "./tools/line-sort";
import { convertHexAscii } from "./tools/hex-ascii";
import { inspectString } from "./tools/string-inspector";
import { generateRandomString } from "./tools/random-string";
import { convertHtmlEntities } from "./tools/html-entity";

export async function executeTool(
  toolId: string,
  input: string,
  options?: Record<string, unknown>
): Promise<ToolResult> {
  if (!input.trim() && toolId !== "uuid-generator") {
    return { output: "" };
  }

  switch (toolId) {
    case "json-formatter":
      return options?.action === "minify" ? minifyJson(input) : formatJson(input);
    case "base64":
      return /^[A-Za-z0-9+/]+=*$/.test(input.trim()) ? decodeBase64(input) : encodeBase64(input);
    case "url-encode":
      return input.includes("%") ? decodeUrl(input) : encodeUrl(input);
    case "url-parser":
      return parseUrl(input);
    case "hash-generator":
      return generateHashes(input);
    case "uuid-generator":
      return generateUuid((options?.count as number) ?? 5);
    case "unix-time":
      return convertUnixTime(input);
    case "jwt-debugger":
      return decodeJwt(input);
    case "regex-tester": {
      const [pattern, ...rest] = input.split("\n");
      return testRegex(pattern ?? "", rest.join("\n"), (options?.flags as string) ?? "g");
    }
    case "color-converter":
      return convertColor(input);
    case "number-base":
      return autoDetectBase(input);
    case "case-converter":
      return convertCase(input);
    case "line-sort":
      return sortLines(input, {
        order: (options?.order as "asc" | "desc") ?? "asc",
        unique: (options?.unique as boolean) ?? true,
      });
    case "hex-ascii":
      return convertHexAscii(input);
    case "string-inspector":
      return inspectString(input);
    case "random-string":
      return generateRandomString(
        (options?.length as number) ?? 32,
        (options?.charset as "alphanumeric") ?? "alphanumeric"
      );
    case "html-entity":
      return convertHtmlEntities(input);
    default:
      return { output: "", error: `Tool "${toolId}" is not yet implemented.` };
  }
}
