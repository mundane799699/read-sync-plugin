import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";
import { syncWxReadNotesService } from "@/services/wxReadNote";
import { LucideCheck, LucideRefreshCw, UserCircle2 } from "lucide-react";
import NewTabDialog from "@/components/NewTabDialog";
import { getNotesCount } from "@/services/wxReadNote";
import { fetchMemberInfo } from "@/services/login";
import PaymentModal from "@/components/PaymentModal";
const maxSyncCount = 100;

const Home = () => {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [books, setBooks] = useState([]);
  const [isWxReadLoggedIn, setIsWxReadLoggedIn] = useState(false);
  const [showNewTabDialog, setShowNewTabDialog] = useState(false);
  const [syncStats, setSyncStats] = useState({ used: 0, total: maxSyncCount });
  const syncStatsRef = useRef({ used: 0, total: maxSyncCount });
  const [memberInfo, setMemberInfo] = useState({
    memberExpireTime: "",
    memberType: "FREE",
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!user) {
      nav("/login");
    }
    fetchMemberInfo().then((res) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const { memberExpireTime, memberType } = data;
        setMemberInfo({ memberExpireTime, memberType });
      }
    });
  }, [user, loading]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    getNotesCount().then((res) => {
      const { code, data, msg } = res;
      if (code === 200) {
        setSyncStats({ used: data, total: maxSyncCount });
        syncStatsRef.current.used = data;
      } else {
        toast.error(msg);
      }
    });
  }, []);

  useEffect(() => {
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
      const { books, syncStats } = data;
      books.map((item: any) => {
        item.syncFinished = false;
      });
      setBooks(books);
      setIsWxReadLoggedIn(true);
    } else if (status === 401) {
      setIsWxReadLoggedIn(false);
    }
  };

  const openWxRead = () => {
    browser.tabs.create({ url: "https://weread.qq.com", active: true });
  };

  const checkMembershipStatus = () => {
    if (syncStatsRef.current.used >= maxSyncCount) {
      if (memberInfo.memberType === "FREE") {
        setShowPaymentModal(true);
        setTitle("已达到免费用户同步次数上限");
        return false;
      } else if (
        memberInfo.memberExpireTime &&
        new Date(memberInfo.memberExpireTime).getTime() < new Date().getTime()
      ) {
        setShowPaymentModal(true);
        setTitle("会员已过期，请及时续费");
        return false;
      }
    }
    return true;
  };

  const sync = async (bookId: string, showToast = true) => {
    // 检查会员状态
    if (!checkMembershipStatus()) {
      return;
    }
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
      const { code, msg } = res;
      if (code === 200) {
        if (showToast) {
          toast.success(`同步成功，共同步${notes.length}条笔记`);
        }
        setBooks((prevList) => {
          prevList.find((item) => item.bookId === bookId).syncFinished = true;
          return [...prevList];
        });
        setSyncStats({
          used: res.data,
          total: maxSyncCount,
        });
        syncStatsRef.current.used = res.data;
      } else {
        if (showToast) {
          toast.error(`同步失败，${msg}`);
        }
      }
    }
  };

  const syncAll = async () => {
    let syncedCount = 0;
    for (let i = 0; i < books.length; i++) {
      const book = books[i];
      // 每次同步前检查会员状态
      if (!checkMembershipStatus()) {
        if (syncedCount > 0) {
          setTitle(
            `已完成${syncedCount}本书的同步，剩余书籍因为同步次数限制未能同步`
          );
        }
        return;
      }
      await sync(book.book.bookId, false);
      syncedCount++;
    }
    toast.success("同步完成");
  };

  return (
    <div className="min-h-screen font-sans flex bg-gradient-to-br from-orange-50 to-white">
      {loading ? (
        <Loader className="mx-auto mt-10" />
      ) : (
        <div className="container mx-auto p-4 relative min-h-screen">
          <div className="absolute top-4 right-4 space-x-3 flex items-center">
            <div
              className="flex items-center text-gray-600 mr-2 cursor-pointer"
              onClick={() => {
                browser.tabs.create({
                  url: `${import.meta.env.VITE_BASE_WEB}/profile`,
                  active: true,
                });
              }}
            >
              <UserCircle2 className="w-5 h-5 mr-1.5" />
              <span className="text-sm">{user?.nickName}</span>
            </div>

            <button
              onClick={() =>
                browser.tabs.create({
                  url: `${import.meta.env.VITE_BASE_WEB}/dashboard`,
                  active: true,
                })
              }
              className="px-4 py-2 text-sm text-white bg-gradient-to-r from-orange-500 to-orange-400 hover:opacity-90 rounded-md transition-opacity shadow-lg shadow-orange-200"
            >
              查看笔记
            </button>
            <button
              onClick={() => setShowNewTabDialog(true)}
              className="px-4 py-2 text-sm text-orange-500 bg-white border border-orange-400 hover:bg-orange-50 rounded-md transition-colors"
            >
              新标签页设置
            </button>
          </div>
          {isWxReadLoggedIn && (
            <div className="absolute top-4 left-4 flex items-center space-x-2">
              <button
                onClick={syncAll}
                className="px-4 py-2 text-sm bg-orange-400 rounded-md hover:bg-orange-500 text-white transition-colors"
              >
                一键同步
              </button>
              <div className="text-sm text-gray-600 mr-2">
                同步数：{syncStats.used}/{syncStats.total}
              </div>
            </div>
          )}
          {isWxReadLoggedIn ? (
            <ul className="mt-20 grid grid-cols-2 gap-6 max-w-4xl mx-auto">
              {books.map((item: any) => (
                <li
                  key={item.book.bookId}
                  className="flex p-4 border border-gray-200 rounded-lg hover:border-orange-200 transition-colors bg-white shadow-sm"
                >
                  <img
                    className="w-20 h-28 object-cover mr-4 rounded"
                    src={item.book.cover}
                    alt={item.book.title}
                  />
                  <div className="flex flex-1 justify-between">
                    <div className="flex flex-col justify-between">
                      <h2 className="text-sm font-medium overflow-hidden overflow-ellipsis line-clamp-2 text-left text-gray-800">
                        {item.book.title}
                      </h2>
                      <h2 className="text-xs text-gray-500 text-left">
                        划线 (
                        {`${item.noteCount + item.bookmarkCount}) | 想法 (${
                          item.reviewCount
                        })`}
                      </h2>
                    </div>
                    <div className="flex flex-col justify-end">
                      {item.syncFinished ? (
                        <LucideCheck
                          onClick={() => sync(item.book.bookId)}
                          className="text-orange-400 cursor-pointer hover:text-orange-500"
                        />
                      ) : (
                        <LucideRefreshCw
                          onClick={() => sync(item.book.bookId)}
                          className="text-orange-400 cursor-pointer hover:text-orange-500"
                        />
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-xl text-gray-500">
                登录微信读书后，Readecho将自动同步你的书架
              </p>
              <button
                onClick={openWxRead}
                className="text-lg text-white bg-orange-400 hover:bg-orange-500 rounded-lg p-4 mt-10 transition-colors"
              >
                登录微信读书
              </button>
            </div>
          )}
        </div>
      )}
      <NewTabDialog
        isOpen={showNewTabDialog}
        onClose={() => setShowNewTabDialog(false)}
      />
      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title={title}
        content="升级会员后，您将解除同步次数限制"
        buttonText="升级"
        onConfirm={() => {
          setShowPaymentModal(false);
          browser.tabs.create({
            url: `${import.meta.env.VITE_BASE_WEB}/vip`,
            active: true,
          });
        }}
      />
    </div>
  );
};
export default Home;
