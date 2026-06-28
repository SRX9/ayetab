import QRCode from "qrcode";
import type { ToolResult } from "../types";

export async function generateQrCode(input: string): Promise<ToolResult> {
  try {
    const dataUrl = await QRCode.toDataURL(input.trim() || "https://ayetab.dev", {
      margin: 2,
      width: 256,
    });
    return {
      output: dataUrl,
      format: "image",
      imageSrc: dataUrl,
    };
  } catch (e) {
    return { output: "", error: `QR generation failed: ${(e as Error).message}` };
  }
}
