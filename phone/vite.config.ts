import { defineConfig } from "vite";

export default defineConfig({
  base: "/phone/",
  build: { target: "es2022" },
  // "update date" used by the battery model = build time
  define: { __UPDATE_DATE__: JSON.stringify(new Date().toISOString()) },
});
