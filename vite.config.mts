import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import zaloMiniApp from "zmp-vite-plugin";
import macrosPlugin from "vite-plugin-babel-macros";
import path from "path";

export default defineConfig({
  plugins: [zaloMiniApp(), macrosPlugin(), react()],
  optimizeDeps: {
    exclude: ["jiti", "fs", "path", "os", "module", "assert"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@components": path.resolve(__dirname, "src/components"),
      "@constants": path.resolve(__dirname, "src/constants"),
      "@store": path.resolve(__dirname, "src/store"),
      "@service": path.resolve(__dirname, "src/service"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@mock": path.resolve(__dirname, "src/mock"),
      "@static": path.resolve(__dirname, "src/static"),
    },
  },
});