import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://ayetab.dev",
  compressHTML: true,
  build: {
    inlineStylesheets: "auto",
  },
  server: {
    port: 4321,
    host: true,
  },
});
