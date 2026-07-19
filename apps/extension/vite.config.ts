import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import { crx, type ManifestV3Export } from "@crxjs/vite-plugin";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const target = process.env.TARGET_BROWSER === "firefox" ? "firefox" : "chrome";

function loadManifest(browser: "chrome" | "firefox"): ManifestV3Export {
  const path = resolve(__dirname, `src/manifest.${browser}.json`);
  return JSON.parse(readFileSync(path, "utf8")) as ManifestV3Export;
}

export default defineConfig({
  plugins: [react(), crx({ manifest: loadManifest(target) }) as PluginOption],
  define: {
    __AYETAB_EXTENSION__: JSON.stringify(true),
    __AYETAB_BROWSER__: JSON.stringify(target),
  },
  resolve: {
    alias: [
      {
        find: "@excalidraw/excalidraw/index.css",
        replacement: resolve(__dirname, "src/stubs/empty.css"),
      },
      {
        // Excalidraw uses Function/eval constructs blocked by MV3 CSP and AMO.
        find: "@excalidraw/excalidraw",
        replacement: resolve(__dirname, "src/stubs/excalidraw-stub.tsx"),
      },
      { find: "@", replacement: resolve(__dirname, "src") },
    ],
  },
  build: {
    outDir: `dist/${target}`,
    emptyOutDir: true,
    sourcemap: false,
    minify: "esbuild",
    target: "chrome114",
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, "src/sidepanel/index.html"),
      },
    },
  },
});
