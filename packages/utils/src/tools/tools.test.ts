import { describe, it, expect } from "vitest";
import { formatJson, minifyJson, validateJson } from "./json";
import { encodeBase64, decodeBase64 } from "./base64";
import { convertCase } from "./case";
import { autoDetectBase } from "./number-base";
import { convertBackslash } from "./backslash";
import { parseQueryString } from "./query-string";

describe("json", () => {
  it("formats JSON", () => {
    const result = formatJson('{"a":1}');
    expect(result.error).toBeUndefined();
    expect(result.output).toContain('"a"');
  });

  it("minifies JSON", () => {
    const result = minifyJson('{\n  "a": 1\n}');
    expect(result.output).toBe('{"a":1}');
  });

  it("validates invalid JSON", () => {
    const result = validateJson("{invalid}");
    expect(result.error).toBeDefined();
  });
});

describe("base64", () => {
  it("roundtrips UTF-8", () => {
    const encoded = encodeBase64("hello world");
    const decoded = decodeBase64(encoded.output);
    expect(decoded.output).toBe("hello world");
  });
});

describe("case", () => {
  it("converts to snake_case", () => {
    const result = convertCase("helloWorld");
    expect(result.output).toContain("hello_world");
  });
});

describe("number-base", () => {
  it("detects hex", () => {
    const result = autoDetectBase("0xFF");
    expect(result.output).toContain("255");
  });
});

describe("backslash", () => {
  it("escapes newlines", () => {
    const result = convertBackslash("hello\nworld");
    expect(result.output).toContain("\\n");
  });
});

describe("query-string", () => {
  it("parses query params", () => {
    const result = parseQueryString("a=1&b=two");
    expect(result.output).toContain('"a": "1"');
  });
});
