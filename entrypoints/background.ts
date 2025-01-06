import axios from "axios";

export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });

  // 监听新标签页创建
  browser.tabs.onCreated.addListener(async (tab) => {
    try {
      const result = await browser.storage.local.get("enableNewTab");
      const enableNewTab = result.enableNewTab ?? true; // 默认为 true

      if (
        tab.pendingUrl === "about:newtab" ||
        tab.url === "about:newtab" ||
        tab.pendingUrl === "chrome://newtab/" ||
        tab.url === "chrome://newtab/" ||
        tab.pendingUrl === "edge://newtab/" ||
        tab.url === "edge://newtab/"
      ) {
        if (enableNewTab) {
          // 如果启用了自定义新标签页，重定向到你的自定义页面
          await browser.tabs.update(tab.id, {
            url: "/newtab1.html",
          });
        }
        // 如果禁用了自定义新标签页，不做任何操作，让它保持浏览器默认的新标签页
      }
    } catch (error) {
      console.error("Error handling new tab:", error);
    }
  });

  browser.action.onClicked.addListener(async () => {
    await browser.tabs.create({ url: "/sync.html" });
  });

  browser.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      const { type, params } = message;

      if (type === "fetchNotebooks") {
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
      } else if (type === "syncData") {
        const { bookId } = params;
        const reviewUrl = "https://i.weread.qq.com/review/list";
        const bookmarkUrl = "https://i.weread.qq.com/book/bookmarklist";
        try {
          const [reviewResponse, bookmarkResponse] = await Promise.all([
            axios.get(reviewUrl, {
              params: {
                bookId,
                listType: 11,
                mine: 1,
                synckey: 0,
                listMode: 0,
              },
            }),
            axios.get(bookmarkUrl, {
              params: {
                bookId,
              },
            }),
          ]);
          // 处理和合并数据
          const data = {
            reviewData: reviewResponse.data,
            bookmarkData: bookmarkResponse.data,
          };

          return Promise.resolve({
            status: 200,
            data,
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
