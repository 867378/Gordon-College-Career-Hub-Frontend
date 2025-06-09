import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    include: ["@stackblitz/sdk"],
  },
  base: "/",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      input: {
        app: fileURLToPath(new URL("./index.html", import.meta.url)),
      },
    },
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
  },
  // server: {
  // 	port: 3000,
  // 	host: true,
  // 	strictPort: true,
  // },
  define: {
    VUE_PROD_HYDRATION_MISMATCH_DETAILS: "false",
    VUE_PROD_DEVTOOLS: "false",
    "process.env": {},
    global: {},
  },
});
