import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    permissions: ["tabs", "cookies", "storage"],
    action: {},
    host_permissions: ["https://i.weread.qq.com/*", "https://readecho.cn/*"],
  },
  runner: {
    disabled: true,
  },
  dev: {
    server: {
      port: 3001,
    },
  },
});
