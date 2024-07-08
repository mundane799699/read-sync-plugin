import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    permissions: ["tabs"],
    action: {},
    host_permissions: ["https://i.weread.qq.com/*"],
  },
});
