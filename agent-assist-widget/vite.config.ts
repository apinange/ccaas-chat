import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

const RELPATH_ = "agentframe";
// https://vitejs.dev/config/
export default defineConfig({
  // base:RELPATH,
  server: {
    watch: {
      usePolling: true,
    },
  },
  plugins: [
    svgr(),
    react({
      include: "**/*.tsx",
    }),
  ],
});
