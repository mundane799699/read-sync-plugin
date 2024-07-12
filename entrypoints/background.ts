import axios from "axios";

export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });
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
