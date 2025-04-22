import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      "/api": {
        target: "https://musica.gmtdev.duckdns.org",
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: ["jsmediatags"],
    exclude: ["jsmediatags/dist/jsmediatags.min.js"],
  },
  resolve: {
    alias: {
      jsmediatags: "jsmediatags/dist/jsmediatags.min.js",
    },
  },
});
