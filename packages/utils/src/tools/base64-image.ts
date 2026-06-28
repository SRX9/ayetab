import type { ToolResult } from "../types";

export function convertBase64Image(input: string): ToolResult {
  const trimmed = input.trim();

  if (trimmed.startsWith("data:image")) {
    return {
      output: trimmed,
      format: "image",
      imageSrc: trimmed,
    };
  }

  if (/^[A-Za-z0-9+/]+=*$/.test(trimmed)) {
    const dataUrl = `data:image/png;base64,${trimmed}`;
    return {
      output: dataUrl,
      format: "image",
      imageSrc: dataUrl,
    };
  }

  try {
    const bytes = new TextEncoder().encode(trimmed);
    let binary = "";
    for (const b of bytes) binary += String.fromCharCode(b);
    const b64 = btoa(binary);
    const dataUrl = `data:image/png;base64,${b64}`;
    return { output: dataUrl, format: "image", imageSrc: dataUrl };
  } catch (e) {
    return { output: "", error: `Base64 image conversion failed: ${(e as Error).message}` };
  }
}
