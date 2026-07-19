import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

const privateData = fileURLToPath(
  new URL("./.private/personal-data.local.js", import.meta.url),
);
const safeData = fileURLToPath(
  new URL("./src/lib/personal-data.js", import.meta.url),
);
export default defineConfig(({ command }) => {
  // Personal fixtures are available only in the local development server.
  // Production builds always resolve to the repository-safe empty dataset.
  const personalData =
    command === "serve" && existsSync(privateData) ? privateData : safeData;

  return {
    plugins: [svelte()],
    resolve: {
      alias: {
        "@personal-data": personalData,
      },
    },
    base: "./",
    build: {
      // Firebase is lazy-loaded only when environment keys are configured.
      chunkSizeWarningLimit: 600,
    },
  };
});
