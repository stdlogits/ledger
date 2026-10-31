import { defineConfig, type Plugin } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// The gallery: every piece of Ledger on one page (gallery/). It imports the package by its own name, so
// it goes through the exports map as a product does.
const PREFLIGHT = "theme-preflight.js";

/** Serves src/theme-preflight.js at /theme-preflight.js and writes it into the build, as a product
 * serves it from its own origin. */
function themePreflight(): Plugin {
  const source = () => readFileSync(new URL(`./src/${PREFLIGHT}`, import.meta.url));
  return {
    name: "ledger-theme-preflight",
    configureServer(server) {
      server.middlewares.use(`/${PREFLIGHT}`, (_request, response) => {
        response.setHeader("Content-Type", "text/javascript");
        response.end(source());
      });
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: PREFLIGHT, source: source() });
    },
  };
}

export default defineConfig({
  root: "gallery",
  plugins: [svelte({ configFile: fileURLToPath(new URL("./svelte.config.js", import.meta.url)) }), themePreflight()],
  build: { target: "es2022", assetsInlineLimit: 0, outDir: "dist", emptyOutDir: true },
  server: { port: 5197 },
  preview: { port: 5198 },
});
