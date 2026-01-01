import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    host: "0.0.0.0",
    port: 3000,
  },

  // 🔥 Necesario para music-metadata-browser
  define: {
    global: {},
  },

  resolve: {
    alias: {
      buffer: "buffer",
    },
  },

  optimizeDeps: {
    include: ["buffer"],
  },
});
