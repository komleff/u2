import { defineConfig } from "vite";

import { resolve } from "path";

export default defineConfig({
  appType: "spa",
  publicDir: resolve(__dirname, "public"),
  server: {
    port: 5173,
    open: false
  },
  preview: {
    port: 4173
  },
  build: {
    rollupOptions: {
      input: resolve(__dirname, "index.html")
    }
  },
  resolve: {
    alias: {
      "@client": resolve(__dirname, "client"),
      "@config": resolve(__dirname, "config"),
      "@scenes": resolve(__dirname, "scenes"),
      "@ui": resolve(__dirname, "ui"),
      "@network": resolve(__dirname, "network"),
      // Shared paths (root level)
      "@core": resolve(__dirname, "../../../core"),
      "@systems": resolve(__dirname, "../../../systems"),
      "@types": resolve(__dirname, "../../../types"),
      "@utils": resolve(__dirname, "../../../utils"),
      "@assets": resolve(__dirname, "../../../assets")
    }
  },
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.spec.ts"],
    hookTimeout: 60000, // 60s for slow dotnet run startup in integration tests
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "coverage"
    }
  }
});
