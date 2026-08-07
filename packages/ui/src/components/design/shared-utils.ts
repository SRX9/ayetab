import type { CSSProperties } from "react";

// ── Loaded image ────────────────────────────────────────────────────────────

export interface LoadedImage {
  el: HTMLImageElement;
  name: string;
  width: number;
  height: number;
  type: string;
  size: number;
  url: string;
}

export async function loadImageFile(file: File): Promise<LoadedImage> {
  // The returned URL is owned by the caller: `useImageUpload`/`useImageListUpload`
  // revoke it when the image is replaced, cleared, or the tool unmounts, and the
  // catch below revokes it when the file fails to load.
  // eslint-disable-next-line react-doctor/no-create-object-url-without-revoke
  const url = URL.createObjectURL(file);
  const el = new Image();
  el.decoding = "async";

  try {
    await new Promise<void>((resolve, reject) => {
      el.onload = () => resolve();
      el.onerror = () => reject(new Error(`Could not read “${file.name}” as an image.`));
      el.src = url;
    });
  } catch (e) {
    // The URL never leaves this function on the failure path, so free it here;
    // on success the caller owns it (see `useImageUpload`).
    URL.revokeObjectURL(url);
    throw e;
  }

  return {
    el,
    name: file.name,
    width: el.naturalWidth,
    height: el.naturalHeight,
    type: file.type || "image/png",
    size: file.size,
    url,
  };
}

// ── Canvas helpers ──────────────────────────────────────────────────────────

export function canvasToBlob(canvas: HTMLCanvasElement, type = "image/png", quality = 0.92) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode the canvas."))),
      type,
      quality
    );
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give the browser a tick to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadText(text: string, filename: string, mime = "text/plain") {
  downloadBlob(new Blob([text], { type: `${mime};charset=utf-8` }), filename);
}

export async function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string,
  type = "image/png",
  quality = 0.92
) {
  downloadBlob(await canvasToBlob(canvas, type, quality), filename);
}

/** Strip the extension from a filename so tools can append their own suffix. */
export function baseName(name: string): string {
  return name.replace(/\.[^.]+$/, "") || "image";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Draw `img` into a canvas at the given size, honouring the fit mode. */
export function drawFitted(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number,
  fit: "cover" | "contain" | "stretch" = "cover",
  offsetX = 0.5,
  offsetY = 0.5
) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  if (fit === "stretch") {
    ctx.drawImage(img, 0, 0, width, height);
    return;
  }

  const scale =
    fit === "cover" ? Math.max(width / iw, height / ih) : Math.min(width / iw, height / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(img, (width - dw) * offsetX, (height - dh) * offsetY, dw, dh);
}

/** Chequerboard behind anything that can be transparent. */
export const CHECKER_STYLE: CSSProperties = {
  backgroundImage:
    "linear-gradient(45deg, rgba(128,128,128,.18) 25%, transparent 25%), " +
    "linear-gradient(-45deg, rgba(128,128,128,.18) 25%, transparent 25%), " +
    "linear-gradient(45deg, transparent 75%, rgba(128,128,128,.18) 75%), " +
    "linear-gradient(-45deg, transparent 75%, rgba(128,128,128,.18) 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
};
