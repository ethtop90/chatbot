import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr"; 

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  define: {
    "process.env": {},
  },
  server: {
    host: '0.0.0.0', // This allows access from external devices
    port: 5173,
  },
});