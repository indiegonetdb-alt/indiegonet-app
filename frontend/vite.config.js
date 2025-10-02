import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // port default vite
    proxy: {
      "/api": {
        target: "http://localhost:5000", // arahkan semua request /api ke backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
