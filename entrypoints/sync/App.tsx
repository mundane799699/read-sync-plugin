import React, { useState, useEffect } from "react";
import "./App.css";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { FluentArrowSync20Regular } from "@/components/Icons";
import { syncWxReadNotesService } from "@/services/wxReadNote";

function App() {
  const [books, setBooks] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, logout, login } = useAuth();
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    fetchData();
    const handleTabActivated = (activeInfo: any) => {
      browser.tabs.get(activeInfo.tabId).then((tab) => {
        if (!isLoggedIn && tab.url === browser.runtime.getURL("/sync.html")) {
          fetchData();
        }
      });
    };

    browser.tabs.onActivated.addListener(handleTabActivated);
    return () => {
      browser.tabs.onActivated.removeListener(handleTabActivated);
    };
  }, []);

  const fetchData = async () => {
    const res = await browser.runtime.sendMessage({ type: "fetchNotebooks" });
    const { status, data } = res;
    if (status === 200) {
      const { books } = data;
      setBooks(books);
      setIsLoggedIn(true);
    } else if (status === 401) {
      setIsLoggedIn(false);
    }
  };

  const openWxRead = () => {
    browser.tabs.create({ url: "https://weread.qq.com", active: true });
  };

  const openSignup = () => {
    browser.tabs.create({ url: "http://localhost:3000/signup", active: true });
  };

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    // 调用登录接口
    try {
      await login(loginData);
      toast.success("登录成功");
      setShowLoginModal(false);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("登录失败，请检查用户名或密码");
    } finally {
      setLoading(false);
    }
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
      const { author, title } = book;
      const { reviews } = reviewData;
      const notes = reviews.map((item: any) => {
        const { reviewId, review } = item;
        const { abstract, chapterName, content } = review;
        return {
          bookId,
          reviewId,
          bookName: title,
          bookAuthor: author,
          chapterName,
          markText: abstract,
          noteContent: content,
          type: 1,
        };
      });

      const bookmarks = updated.map((item: any) => {
        const { bookmarkId, chapterName, markText } = item;
        return {
          bookId,
          reviewId: bookmarkId,
          bookName: title,
          bookAuthor: author,
          chapterName,
          markText,
          type: 2,
        };
      });
      notes.push(...bookmarks);
      const params = { bookId, bookName: title, bookAuthor: author, notes };
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
    <div className="container mx-auto p-4 relative">
      {user?.userName ? (
        <div className="absolute top-2 right-2 space-x-2">
          <button className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600">
            {user?.nickName}
          </button>
          <button
            onClick={() => logout()}
            className="px-4 py-2 text-sm font-medium text-green-500 border border-green-500 rounded-md hover:bg-blue-50"
          >
            退出登录
          </button>
        </div>
      ) : (
        <div className="absolute top-2 right-2 space-x-2">
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600"
          >
            登录
          </button>
          <button
            onClick={openSignup}
            className="px-4 py-2 text-sm font-medium text-green-500 border border-green-500 rounded-md hover:bg-blue-50"
          >
            注册
          </button>
        </div>
      )}

      {isLoggedIn ? (
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
                    划线 ({`${item.noteCount}) | 想法 (${item.reviewCount})`}
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
          登录微信读书网页端
        </button>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-xl font-bold mb-4">登录</h2>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="邮箱"
                onChange={(e) =>
                  setLoginData({ ...loginData, username: e.target.value })
                }
                className="w-full mb-2 p-2 border focus:border-green-500 focus:outline-none rounded"
                required
              />
              <input
                type="password"
                placeholder="密码"
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                className="w-full mb-4 p-2 border focus:border-green-500 focus:outline-none rounded"
                required
              />
              <button
                type="submit"
                className="w-full py-2 text-white bg-green-500 rounded hover:bg-green-600"
              >
                登录
              </button>
            </form>
            <button
              onClick={() => setShowLoginModal(false)}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
