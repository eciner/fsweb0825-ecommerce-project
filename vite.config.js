import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { requireBuildApiTarget } from "./config/apiTarget.js";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === "build" && mode === "production") {
    const env = loadEnv(mode, process.cwd(), "VITE_");
    requireBuildApiTarget(process.env.VITE_API_URL ?? env.VITE_API_URL);
  }
  return {
    plugins: [react()],
    test: { exclude: ["**/node_modules/**", "**/e2e/**"] },
  };
});
