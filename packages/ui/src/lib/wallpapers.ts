import type { AbstractWallpaperId, Wallpaper } from "./appearance";

export interface AbstractWallpaper {
  id: AbstractWallpaperId;
  label: string;
  /** Background for the wallpaper layer. */
  css: string;
  /** Small swatch for the settings picker. */
  swatch: string;
}

/**
 * macOS-style abstract wallpapers — soft, cool, procedural gradients tuned so
 * whitish glass reads through them. `default` is the quiet near-white mist.
 */
export const ABSTRACT_WALLPAPERS: AbstractWallpaper[] = [
  {
    id: "default",
    label: "Mist",
    css: [
      "radial-gradient(90% 70% at 12% -10%, rgba(255,255,255,1) 0%, transparent 52%)",
      "radial-gradient(55% 45% at 96% 4%, rgba(214,228,243,0.35) 0%, transparent 50%)",
      "radial-gradient(45% 38% at 50% 108%, rgba(224,233,244,0.22) 0%, transparent 55%)",
      "linear-gradient(165deg, #fcfdff 0%, #f7f9fc 48%, #f2f5f9 100%)",
    ].join(","),
    swatch: "linear-gradient(135deg,#ffffff,#eef2f7)",
  },
  {
    id: "sequoia",
    label: "Sequoia",
    css: [
      "radial-gradient(80% 60% at 15% 0%, rgba(255,255,255,0.95) 0%, transparent 50%)",
      "radial-gradient(70% 55% at 90% 10%, rgba(190,214,238,0.5) 0%, transparent 48%)",
      "radial-gradient(60% 50% at 45% 100%, rgba(210,224,240,0.35) 0%, transparent 52%)",
      "linear-gradient(160deg, #f6f9fd 0%, #e8eff8 45%, #dde8f4 100%)",
    ].join(","),
    swatch: "linear-gradient(135deg,#f6f9fd,#ccdcec)",
  },
  {
    id: "sonoma",
    label: "Sonoma",
    css: [
      "radial-gradient(75% 60% at 10% 0%, rgba(255,255,255,0.9) 0%, transparent 48%)",
      "radial-gradient(70% 60% at 92% 8%, rgba(205,224,242,0.55) 0%, transparent 50%)",
      "radial-gradient(55% 45% at 55% 105%, rgba(216,228,242,0.4) 0%, transparent 52%)",
      "linear-gradient(165deg, #f7fbff 0%, #e4edf7 50%, #d5e3f2 100%)",
    ].join(","),
    swatch: "linear-gradient(135deg,#f7fbff,#c7d9ec)",
  },
  {
    id: "tahoe",
    label: "Tahoe",
    css: [
      "radial-gradient(85% 65% at 12% -5%, rgba(255,255,255,1) 0%, transparent 50%)",
      "radial-gradient(65% 55% at 90% 5%, rgba(180,208,236,0.55) 0%, transparent 48%)",
      "radial-gradient(55% 45% at 50% 105%, rgba(200,218,238,0.4) 0%, transparent 52%)",
      "linear-gradient(158deg, #f4f9fe 0%, #e0ecf8 48%, #cdddf0 100%)",
    ].join(","),
    swatch: "linear-gradient(135deg,#f4f9fe,#bcd2ea)",
  },
  {
    id: "graphite",
    label: "Graphite",
    css: [
      "radial-gradient(80% 60% at 12% 0%, rgba(255,255,255,0.9) 0%, transparent 50%)",
      "radial-gradient(70% 55% at 90% 8%, rgba(214,222,232,0.5) 0%, transparent 48%)",
      "radial-gradient(55% 45% at 50% 105%, rgba(220,226,234,0.35) 0%, transparent 52%)",
      "linear-gradient(165deg, #fafbfc 0%, #eef1f4 48%, #e2e7ec 100%)",
    ].join(","),
    swatch: "linear-gradient(135deg,#fafbfc,#d3dae2)",
  },
  {
    id: "dune",
    label: "Dune",
    css: [
      "radial-gradient(80% 60% at 12% 0%, rgba(255,255,255,0.95) 0%, transparent 50%)",
      "radial-gradient(70% 55% at 92% 8%, rgba(240,230,214,0.5) 0%, transparent 48%)",
      "radial-gradient(55% 45% at 50% 105%, rgba(244,236,222,0.35) 0%, transparent 52%)",
      "linear-gradient(165deg, #fdfcfa 0%, #f7f4ee 48%, #efeae0 100%)",
    ].join(","),
    swatch: "linear-gradient(135deg,#fdfcfa,#e7ddcb)",
  },
];

export function getAbstractWallpaper(id: string): AbstractWallpaper {
  return ABSTRACT_WALLPAPERS.find((w) => w.id === id) ?? ABSTRACT_WALLPAPERS[0];
}

/** Background CSS for any wallpaper (abstract preset or custom image). */
export function wallpaperCss(wallpaper: Wallpaper | undefined): string {
  if (!wallpaper) return getAbstractWallpaper("default").css;
  if (wallpaper.kind === "image") {
    return `url("${wallpaper.value.replace(/"/g, "%22")}")`;
  }
  return getAbstractWallpaper(wallpaper.value).css;
}
