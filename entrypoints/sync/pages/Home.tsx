import { useAuth } from "@/context/AuthContext";
import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";
import { FluentArrowSync20Regular } from "@/components/Icons";
import { syncWxReadNotesService } from "@/services/wxReadNote";

const Home: FC = () => {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [books, setBooks] = useState([]);
  const [isWxReadLoggedIn, setIsWxReadLoggedIn] = useState(false);
  useEffect(() => {
    if (loading) {
      return;
    }
    if (!user) {
      nav("/login");
    }
  }, [user, loading]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // 闭包: 当你在 useEffect 中设置事件监听器时，该监听器会捕获 isLoggedIn 的初始值（false）。
    // 即使后来 isLoggedIn 被更新，监听器仍然引用的是旧值。
    // setIsLoggedIn((value) => true);好像也能解决，但不知道原理
    const handleTabActivated = (activeInfo: any) => {
      browser.tabs.get(activeInfo.tabId).then((tab) => {
        if (
          !isWxReadLoggedIn &&
          tab.url.startsWith(browser.runtime.getURL("/sync.html"))
        ) {
          fetchData();
        }
      });
    };

    browser.tabs.onActivated.addListener(handleTabActivated);
    return () => {
      browser.tabs.onActivated.removeListener(handleTabActivated);
    };
  }, [isWxReadLoggedIn]);

  const fetchData = async () => {
    const res = await browser.runtime.sendMessage({ type: "fetchNotebooks" });
    const { status, data } = res;
    if (status === 200) {
      const { books } = data;
      setBooks(books);
      setIsWxReadLoggedIn(true);
    } else if (status === 401) {
      setIsWxReadLoggedIn(false);
    }
  };

  const openWxRead = () => {
    browser.tabs.create({ url: "https://weread.qq.com", active: true });
  };

  const sync = async (bookId: string) => {
    const res = await browser.runtime.sendMessage({
      type: "syncData",
      params: { bookId },
    });
    const { status, data } = res;
    if (status === 200) {
      const { bookmarkData, reviewData } = data;
      const { book, updated } = bookmarkData;
      const { author, title, cover } = book;
      const { reviews } = reviewData;
      // 1是笔记
      const notes = reviews.map((item: any) => {
        const { reviewId, review } = item;
        const { abstract, chapterTitle, content, createTime } = review;
        return {
          bookId,
          reviewId,
          bookName: title,
          bookAuthor: author,
          chapterName: chapterTitle,
          markText: abstract,
          noteContent: content,
          type: 1,
          noteTime: createTime,
        };
      });

      // 2是划线
      const bookmarks = updated.map((item: any) => {
        const { bookmarkId, chapterName, markText, createTime } = item;
        return {
          bookId,
          reviewId: bookmarkId,
          bookName: title,
          bookAuthor: author,
          chapterName,
          markText,
          type: 2,
          noteTime: createTime,
        };
      });
      notes.push(...bookmarks);
      const params = {
        bookId,
        bookName: title,
        bookAuthor: author,
        cover,
        markCount: updated.length,
        noteCount: reviews.length,
        notes,
      };
      const res = await syncWxReadNotesService(params);
      console.log(res);
      const { code, msg } = res;
      if (code === 200) {
        toast.success(`同步成功，共同步${notes.length}条笔记`);
      } else {
        toast.error(`同步失败，${msg}`);
      }
    }
  };
  return (
    <div className="bg-orange-100 min-h-screen font-sans">
      {loading ? (
        <Loader className="mx-auto" />
      ) : (
        <div className="bg-white container mx-auto p-4 relative min-h-screen">
          <div className="absolute top-2 right-2 space-x-2">
            <button className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600">
              {user?.nickName}
            </button>
            <button
              onClick={() =>
                browser.tabs.create({
                  // url: "http://localhost:3000/dashboard",
                  url: "https://readecho.cn/dashboard",
                  active: true,
                })
              }
              className="px-4 py-2 text-sm font-medium text-green-500 border border-green-500 rounded-md hover:bg-blue-50"
            >
              去后台查看
            </button>
          </div>
          {isWxReadLoggedIn ? (
            <ul className="mt-10 grid grid-cols-2 gap-4 max-w-4xl mx-auto">
              {books.map((item: any) => (
                <li
                  key={item.book.bookId}
                  className="flex p-4 border border-gray-200 rounded-lg"
                >
                  <img
                    className="w-20 h-28 object-cover mr-4"
                    src={item.book.cover}
                    alt={item.book.title}
                  />
                  <div className="flex flex-1 justify-between">
                    <div className="flex flex-col justify-between">
                      <h2 className="text-sm font-medium overflow-hidden overflow-ellipsis line-clamp-2 text-left">
                        {item.book.title}
                      </h2>
                      <h2 className="text-xs text-gray-500 text-left">
                        划线 (
                        {`${item.noteCount + item.bookmarkCount}) | 想法 (${
                          item.reviewCount
                        })`}
                      </h2>
                    </div>
                    <div className="flex flex-col justify-between">
                      <h2 className="text-xs text-gray-500 text-left">详情</h2>
                      <FluentArrowSync20Regular
                        onClick={() => sync(item.book.bookId)}
                        className="text-gray-500 cursor-pointer hover:text-gray-700"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <button
              onClick={openWxRead}
              className="text-lg font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-lg border p-4"
            >
              获取微信读书笔记
            </button>
          )}
        </div>
      )}
    </div>
  );
};
export default Home;
