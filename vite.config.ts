import { cp, copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type PluginOption } from "vite";

const rootDir = dirname(fileURLToPath(import.meta.url));
const extensionIconFiles = ["icon16.png", "icon48.png", "icon128.png"] as const;

function copyExtensionAssets(): PluginOption {
  return {
    name: "copy-extension-assets",
    apply: "build",
    async writeBundle() {
      const distDir = resolve(rootDir, "dist");
      const distIconsDir = resolve(distDir, "icons");

      await mkdir(distIconsDir, { recursive: true });
      await Promise.all([
        copyFile(resolve(rootDir, "manifest.json"), resolve(distDir, "manifest.json")),
        ...extensionIconFiles.map((iconFile) =>
          copyFile(resolve(rootDir, "icons", iconFile), resolve(distIconsDir, iconFile)),
        ),
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
