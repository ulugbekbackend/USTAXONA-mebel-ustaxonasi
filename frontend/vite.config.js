import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  // API_PROXY_TARGET — dev'da /api va /media so'rovlari yuboriladigan Django manzili.
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.API_PROXY_TARGET || "http://127.0.0.1:8000";

  return {
    base: "/",
    plugins: [react(), tailwindcss()],
    server: {
      host: "0.0.0.0",
      port: 5173,
      proxy: {
        "/api": { target },
        "/media": { target },
        "/sitemap.xml": { target },
        "/robots.txt": { target },
      },
    },
  };
});
