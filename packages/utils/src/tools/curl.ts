import type { ToolResult } from "../types";

export function curlToCode(input: string, lang = "fetch"): ToolResult {
  try {
    const cmd = input.trim().replace(/\\\s*\n/g, " ");
    const urlMatch = cmd.match(/curl\s+(?:'([^']+)'|"([^"]+)"|(\S+))/i);
    const url = urlMatch?.[1] ?? urlMatch?.[2] ?? urlMatch?.[3] ?? "";

    const methodMatch = cmd.match(/-X\s+(\w+)/i);
    const method = (methodMatch?.[1] ?? "GET").toUpperCase();

    const headers: Record<string, string> = {};
    const headerRegex = /-H\s+(?:'([^']+)'|"([^"]+)")/gi;
    let hm: RegExpExecArray | null;
    while ((hm = headerRegex.exec(cmd)) !== null) {
      const header = hm[1] ?? hm[2] ?? "";
      const [key, ...vals] = header.split(":");
      if (key) headers[key.trim()] = vals.join(":").trim();
    }

    const dataMatch = cmd.match(/(?:-d|--data(?:-raw)?)\s+(?:'([^']*)'|"([^"]*)"|(\S+))/i);
    const body = dataMatch?.[1] ?? dataMatch?.[2] ?? dataMatch?.[3];

    if (lang === "python") {
      const lines = [
        "import requests",
        "",
        `response = requests.${method.toLowerCase()}("${url}"${body ? `,\n    data=${JSON.stringify(body)}` : ""}${Object.keys(headers).length ? `,\n    headers=${JSON.stringify(headers, null, 4)}` : ""})`,
        "print(response.text)",
      ];
      return { output: lines.join("\n"), language: "python" };
    }

    const opts: string[] = [`  method: "${method}"`];
    if (Object.keys(headers).length) opts.push(`  headers: ${JSON.stringify(headers, null, 2).replace(/\n/g, "\n  ")}`);
    if (body) opts.push(`  body: ${JSON.stringify(body)}`);

    const output = `const response = await fetch("${url}", {\n${opts.join(",\n")}\n});\nconst data = await response.text();\nconsole.log(data);`;
    return { output, language: "javascript" };
  } catch (e) {
    return { output: "", error: `cURL parse failed: ${(e as Error).message}` };
  }
}
