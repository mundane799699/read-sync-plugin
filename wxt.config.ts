import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    permissions: ["storage", "tabs", "cookies", "http://localhost:8081/*"],
    action: {},
    host_permissions: ["https://i.weread.qq.com/*", "http://localhost:8081/*"],
  },
});
