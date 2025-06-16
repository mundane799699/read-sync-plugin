import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";
import { syncWxReadNotesService } from "@/services/wxReadNote";
import { LucideCheck, LucideRefreshCw, UserCircle2, HelpCircle, MessageSquare } from "lucide-react";
import NewTabDialog from "@/components/NewTabDialog";
import { getNotesCount } from "@/services/wxReadNote";
import { fetchMemberInfo } from "@/services/login";
import PaymentModal from "@/components/PaymentModal";
const maxSyncCount = 200;

const Home = () => {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [books, setBooks] = useState([]);
  const [isWxReadLoggedIn, setIsWxReadLoggedIn] = useState(false);
  const [showNewTabDialog, setShowNewTabDialog] = useState(false);
  const [usedSyncCount, setUsedSyncCount] = useState(0);
  const usedSyncCountRef = useRef(0);
  const [hasMember, setHasMember] = useState(false);
  const [memberInfo, setMemberInfo] = useState({
    memberExpireTime: "",
    memberType: "FREE",
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [title, setTitle] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

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
        setHasMember(hasMembership(memberType));
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
        setUsedSyncCount(data);
        usedSyncCountRef.current = data;
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
    if (usedSyncCountRef.current >= maxSyncCount) {
      if (memberInfo.memberType === "FREE") {
        setShowPaymentModal(true);
        setTitle("已达到免费用户同步次数上限");
        return false;
      }
    }
    return true;
  };

  const hasMembership = (memberType: any) => {
    if (memberType === "FREE") {
      return false;
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
        setUsedSyncCount(res.data);
        usedSyncCountRef.current = res.data;
      } else {
        if (showToast) {
          toast.error(`同步失败，${msg}`);
        }
      }
    }
  };

  const syncAll = async () => {
    setIsSyncing(true);
    let syncedCount = 0;
    try {
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
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen font-sans flex" style={{backgroundColor: '#f9fafb'}}>
      {loading ? (
        <Loader className="mx-auto mt-10" />
      ) : (
        <div className="container mx-auto min-h-screen flex flex-col">
          {/* 1. Header区域 */}
          <header className="sticky top-0 z-10 flex justify-between items-center p-6 border-b border-gray-200" style={{backgroundColor: '#f9fafb'}}>
            {/* 左侧logo */}
            <div className="flex items-center gap-2">
              <img 
                src="/Readecho-orange.svg" 
                alt="Readecho" 
                className="h-6 w-auto"
              />
              <span className="text-xs px-2 py-1 rounded-md text-white font-medium" style={{backgroundColor: '#d97b53'}}>
                插件端
              </span>
            </div>
            
            {/* 右侧用户信息和操作 */}
            <div className="flex items-center gap-6">
              <div
                className="flex items-center text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
                onClick={() => window.open('https://v3oxu28gnc.feishu.cn/share/base/form/shrcnkfjw54oxlXzI5cQPvLynKc', '_blank')}
              >
                <MessageSquare className="w-5 h-5 mr-1.5" />
                <span className="text-sm">建议反馈</span>
              </div>
              <div
                className="flex items-center text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
                onClick={() => window.open('https://v3oxu28gnc.feishu.cn/docx/EQvqdMm3WoqlBjxT7ASc3u0wnKf', '_blank')}
              >
                <HelpCircle className="w-5 h-5 mr-1.5" />
                <span className="text-sm">帮助文档</span>
              </div>
              <div
                className="flex items-center text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
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
                className="px-4 py-2 text-sm text-white hover:opacity-90 rounded-md transition-opacity shadow-lg"
                style={{backgroundColor: '#d97b53'}}
              >
                去网页端
              </button>
            </div>
          </header>

          {/* 2. 按钮区域 */}
          {isWxReadLoggedIn && (
            <div className="p-6">
              <div className="max-w-4xl mx-auto flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={syncAll}
                        disabled={isSyncing}
                        className={`px-3 py-2 text-sm rounded-md text-white transition-opacity font-medium ${
                          isSyncing ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'
                        }`}
                        style={{backgroundColor: '#d97b53'}}
                      >
                        {isSyncing ? '同步中...' : '一键同步'}
                      </button>
                      <div className="text-sm text-gray-600">
                        同步数：{usedSyncCount}/{hasMember ? "无限制" : maxSyncCount}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 -ml-6">
                      <a 
                        href="https://readecho.cn/vip"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-80 transition-opacity"
                        style={{color: '#d97b53'}}
                      >
                        开通Plus / Pro
                      </a>
                      ，永久无限制同步笔记
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewTabDialog(true)}
                  className="px-4 py-2 text-sm bg-white border hover:bg-gray-50 rounded-md transition-colors"
                  style={{color: '#d97b53', borderColor: '#d97b53'}}
                >
                  插件设置
                </button>
              </div>
            </div>
          )}

          {/* 3. 书架区域 */}
          <main className="flex-1 p-6">
            {isWxReadLoggedIn ? (
              <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
                {books.map((item: any) => (
                  <div
                    key={item.book.bookId}
                    className="flex p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white shadow-sm"
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
                            className="cursor-pointer hover:opacity-80"
                            style={{color: '#d97b53'}}
                          />
                        ) : (
                          <LucideRefreshCw
                            onClick={() => sync(item.book.bookId)}
                            className="cursor-pointer hover:opacity-80"
                            style={{color: '#d97b53'}}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <p className="text-xl text-gray-500 mb-6">
                  登录微信读书后，Readecho将自动同步你的书架
                </p>
                <button
                  onClick={openWxRead}
                  className="text-lg text-white hover:opacity-90 rounded-lg px-6 py-3 transition-opacity font-medium"
                  style={{backgroundColor: '#d97b53'}}
                >
                  登录微信读书
                </button>
              </div>
            )}
          </main>
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
