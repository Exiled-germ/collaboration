import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/phaseflow/", // GitHub 레포지토리 이름으로 변경
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
