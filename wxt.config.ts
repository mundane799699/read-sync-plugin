import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    permissions: ["storage", "tabs", "cookies"],
    action: {},
    host_permissions: [
      "https://i.weread.qq.com/*",
      "https://readecho.cn/*",
      "http://localhost:3000/*",
    ],
  },
  runner: {
    disabled: true,
  },
});
