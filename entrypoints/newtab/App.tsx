import { getRandomReview } from "@/services/wxReadNote";
import ShareDialog from "@/components/ShareDialog";
import { fetchUserInfoService } from "@/services/login";
import { Note } from "@/types/note";
import { Share2, Mail, Shuffle, Settings, X } from "lucide-react";
import dayjs from "dayjs";
import Modal from "@/components/Modal";
import SettingsDialog from "@/components/SettingsDialog";

const App = () => {
  const [user, setUser] = useState(null);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [readCount, setReadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  useEffect(() => {
    // 获取用户信息
    fetchUserInfoService().then((res) => {
      const { user, code } = res;
      if (code === 200) {
        setUser(user);
        handleRandomNote();
      }
    });
  }, []);

  useEffect(() => {
    const handleTabActivated = (activeInfo: any) => {
      browser.tabs.get(activeInfo.tabId).then((tab) => {
        if (user) {
          return;
        }
        fetchUserInfoService().then((res) => {
          const { user, code } = res;
          if (code === 200) {
            setUser(user);
            handleRandomNote();
          }
        });
      });
    };

    browser.tabs.onActivated.addListener(handleTabActivated);
    return () => {
      browser.tabs.onActivated.removeListener(handleTabActivated);
    };
  }, []);

  const signIn = () => {
    browser.tabs.create({
      url: `${import.meta.env.VITE_BASE_WEB}/signin`,
      active: true,
    });
  };

  const handleRandomNote = () => {
    getRandomReview()
      .then((res) => {
        const { code, data, msg } = res;
        if (code === 200) {
          const { readCount, totalCount, note, allFinished } = data;
          if (totalCount === 0) {
            setCurrentNote(null);
          } else if (allFinished) {
            setIsModalOpen(true);
          } else {
            setCurrentNote(note);
            setReadCount(readCount);
            setTotalCount(totalCount);
          }
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (!user) {
    return (
      <div className="bg-orange-100 flex justify-center items-center h-screen">
        <button
          onClick={signIn}
          className="text-lg font-bold text-white bg-orange-400 hover:bg-orange-500 rounded-lg border p-4 mt-10"
        >
          去登录
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">加载中...</div>;
  }

  if (!currentNote) {
    return <div className="p-8 text-center text-gray-500">暂无笔记</div>;
  }

  return (
    <div
      className="bg-stone-100 h-screen flex justify-center items-center"
      style={{
        backgroundImage: `
          linear-gradient(rgba(245, 242, 236, 0.9), rgba(245, 242, 236, 0.9)),
          url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='none' stroke='%23D2C6B5' stroke-width='0.5'/%3E%3C/svg%3E")
        `,
      }}
    >
      {/* 主容器：固定宽度和高度 */}
      <div className="w-[1000px] h-[600px] flex flex-col">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            回顾进度：{readCount}/{totalCount}
          </span>
          <button
            onClick={() => setShowShareDialog(true)}
            className="flex items-center space-x-1 text-gray-600 transition hover:text-gray-900"
          >
            <Share2 className="h-5 w-5" />
            <span>分享</span>
          </button>
        </div>

        {/* 内容区：使用 flex-1 自动占据剩余空间 */}
        <div className="flex-1 flex items-center justify-center">
          {/* 内容卡片：固定宽高 */}
          <div className="w-full h-[400px] overflow-auto rounded-lg bg-white/80 p-12 shadow-sm backdrop-blur-sm">
            <div className="h-full flex flex-col">
              {/* 笔记内容区：flex-1 自动占据剩余空间 */}
              <div className="flex-1">
                {currentNote.markText && (
                  <div className="mb-8 flex">
                    <div className="mr-3 w-1 bg-gray-300"></div>
                    <blockquote className="text-lg italic text-gray-700">
                      &ldquo;{currentNote.markText}&rdquo;
                    </blockquote>
                  </div>
                )}
                <div className="leading-relaxed text-gray-800 text-base">
                  {currentNote.noteContent}
                </div>
                {currentNote.chapterName && (
                  <div className="mt-4 text-sm text-gray-500">
                    —— {currentNote.chapterName}
                  </div>
                )}
              </div>

              {/* 底部信息：固定在底部 */}
              <div className="mt-4">
                <div className="flex items-center justify-end gap-2 text-gray-600">
                  <span className="text-sm">{currentNote.bookName}</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-sm">
                    {dayjs.unix(currentNote.noteTime).format("YYYY-MM-DD")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 随机按钮：固定在底部 */}
        <div className="h-[80px] flex items-center justify-center">
          <button
            onClick={handleRandomNote}
            className="flex items-center gap-2 rounded-full bg-white/80 px-6 py-2 shadow-sm transition-all hover:bg-white"
          >
            <Shuffle className="h-4 w-4" />
            随机回顾
          </button>
        </div>
      </div>

      {/* 弹窗 */}
      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        note={currentNote}
      />
      <SettingsDialog
        isOpen={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
      />

      <Modal
        isOpen={isModalOpen}
        onConfirm={() => {
          handleRandomNote();
          setIsModalOpen(false);
        }}
        title="提示"
        content="所有笔记都已回顾完，已全部重置回未读状态"
      />
    </div>
  );
};

export default App;
