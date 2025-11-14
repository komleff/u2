import { defineConfig } from "vite";

export default defineConfig({
  appType: "spa",
  server: {
    port: 5173,
    open: false
  },
  preview: {
    port: 4173
  },
  resolve: {
    alias: {
      "@core": "/src/core",
      "@systems": "/src/systems",
      "@config": "/src/config",
      "@types": "/src/types",
      "@utils": "/src/utils",
      "@scenes": "/src/scenes",
      "@assets": "/src/assets",
      "@ui": "/src/ui"
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["tests/**/*.spec.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "coverage"
    }
  }
});
