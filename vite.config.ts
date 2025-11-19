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
      "@core": resolve(__dirname, "src/core"),
      "@systems": resolve(__dirname, "src/systems"),
      "@config": resolve(__dirname, "src/config"),
      "@types": resolve(__dirname, "src/types"),
      "@utils": resolve(__dirname, "src/utils"),
      "@scenes": resolve(__dirname, "src/scenes"),
      "@assets": resolve(__dirname, "src/assets"),
      "@ui": resolve(__dirname, "src/ui"),
      "@network": resolve(__dirname, "src/network")
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
