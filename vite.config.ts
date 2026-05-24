import { cp, copyFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type PluginOption } from "vite";

const rootDir = dirname(fileURLToPath(import.meta.url));

function copyExtensionAssets(): PluginOption {
  return {
    name: "copy-extension-assets",
    apply: "build",
    async writeBundle() {
      const distDir = resolve(rootDir, "dist");

      await Promise.all([
        copyFile(resolve(rootDir, "manifest.json"), resolve(distDir, "manifest.json")),
        cp(resolve(rootDir, "icons"), resolve(distDir, "icons"), { recursive: true }),
        cp(resolve(rootDir, "_locales"), resolve(distDir, "_locales"), { recursive: true }),
      ]);
    },
  };
}

export default defineConfig({
  plugins: [copyExtensionAssets()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        content: resolve(rootDir, "src/content.ts"),
        popup: resolve(rootDir, "popup.html"),
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
});
