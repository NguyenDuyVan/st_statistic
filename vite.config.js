import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const baseURL = env.VITE_FIREANT_BASE_URL ?? "https://restv2.fireant.vn";

  return {
    plugins: [vue()],
    server: {
      proxy: {
        "/api": {
          target: baseURL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
