import axios from "axios";

export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });
  browser.action.onClicked.addListener(async () => {
    await browser.tabs.create({ url: "/sync.html" });
  });

  browser.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      console.log(message);

      if (message === "fetchNotebooks") {
        try {
          const response = await axios.get(
            "https://i.weread.qq.com/user/notebooks",
            {
              withCredentials: true, // 这相当于 fetch 的 credentials: "include"
            }
          );

          return Promise.resolve({
            status: response.status,
            data: response.data, // axios 已经自动解析了 JSON
          });
        } catch (error: any) {
          return Promise.resolve({
            status: error.response?.status || 500,
            error: error.message,
          });
        }
      }
    }
  );
});
