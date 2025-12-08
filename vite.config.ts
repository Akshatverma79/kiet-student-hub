import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/moodle-api': {
        target: 'http://lms.kiet.edu',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/moodle-api/, '/moodle'),
      },
      '/attendance-api': {
        target: 'https://kiet.cybervidya.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/attendance-api/, ''),
      },
    },
  },
});
