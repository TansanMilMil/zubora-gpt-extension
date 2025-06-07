import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        content: "src/content.ts",
        background: "src/background.ts",
        options: "src/options.ts",
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
  publicDir: "public",
});
