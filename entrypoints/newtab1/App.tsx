import { useState, useEffect } from "react";
import ShareDialog from "@/components/ShareDialog";
import { fetchUserInfoService } from "@/services/login";
import { getRandomReview } from "@/services/wxReadNote";
import { Note } from "@/types/note";
import { Share2, Copy, Check, Shuffle, Image, Settings } from "lucide-react";
import dayjs from "dayjs";
import Modal from "@/components/Modal";
import SettingsDialog from "@/components/SettingsDialog";

const backgrounds = [
  new URL("/backgrounds/bg1.png", import.meta.url).href,
  new URL("/backgrounds/bg2.png", import.meta.url).href,
  new URL("/backgrounds/bg3.png", import.meta.url).href,
  new URL("/backgrounds/bg4.png", import.meta.url).href,
  new URL("/backgrounds/bg5.jpg", import.meta.url).href,
  new URL("/backgrounds/bg6.jpg", import.meta.url).href,
];

console.log("Available backgrounds:", backgrounds);

const App = () => {
  const [user, setUser] = useState(null);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [readCount, setReadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(() => {
    // 从 localStorage 加载上次保存的背景设置
    const savedBackground = localStorage.getItem("background_index");
    return savedBackground ? parseInt(savedBackground, 10) : 0;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(dayjs().format("HH:mm"));

  const [showNewTabDialog, setShowNewTabDialog] = useState(false);

  useEffect(() => {
    console.log("Current background index:", currentBackgroundIndex);
    console.log("Current background URL:", backgrounds[currentBackgroundIndex]);
  }, [currentBackgroundIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format("HH:mm"));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("background_index", currentBackgroundIndex.toString());
  }, [currentBackgroundIndex]);

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

  const handleCopy = () => {
    const textToCopy = currentNote
      ? `《${currentNote.bookName}》：${currentNote.markText}${
          currentNote.noteContent ? `\n\n想法：${currentNote.noteContent}` : ''
        }`
      : "";
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleSwitchBackground = () => {
    setCurrentBackgroundIndex((prev) => {
      const nextIndex = (prev + 1) % backgrounds.length;
      return nextIndex;
    });
  };

  if (!user) {
    return (
      <div className="bg-orange-100 flex flex-col justify-center items-center h-screen">
        <button
          onClick={signIn}
          className="w-40 text-lg font-bold text-white bg-orange-400 hover:bg-orange-500 rounded-lg border p-4 mt-10"
        >
          去登录
        </button>
        <button
          onClick={() => window.location.reload()}
          className="w-40 text-lg font-bold text-white bg-orange-400 hover:bg-orange-500 rounded-lg border p-4"
        >
          刷新页面
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
      className="bg-stone-100 h-screen flex justify-center items-center relative"
      style={{
        backgroundImage:
          currentBackgroundIndex === 0
            ? `linear-gradient(rgba(245, 242, 236, 0.9), rgba(245, 242, 236, 0.9)), url("${backgrounds[currentBackgroundIndex]}")`
            : `url("${backgrounds[currentBackgroundIndex]}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* 新标签页设置按钮 */}
      <button
        onClick={() => setShowNewTabDialog(true)}
        className={`fixed right-6 top-6 p-2 rounded-lg transition-colors ${
          currentBackgroundIndex === 0
            ? "text-[#595959] hover:text-[#262626] hover:bg-[#F5F5F5]"
            : currentBackgroundIndex === 1
            ? "text-white/80 hover:bg-white/10"
            : currentBackgroundIndex === 2
            ? "text-[#2C3333] hover:bg-[#2C3333]/10"
            : currentBackgroundIndex === 3
            ? "text-white/70 hover:bg-white/10"
            : currentBackgroundIndex === 4
            ? "text-[#2C3333] hover:bg-[#2C3333]/10"
            : currentBackgroundIndex === 5
            ? "text-[#2D5A27] hover:bg-[#2D5A27]/10"
            : "text-white/80 hover:bg-white/10"
        }`}
      >
        <Settings className="h-4 w-4" />
      </button>

      {/* 主容器：固定宽度和高度 */}
      <div className="w-[1000px] h-[580px] flex flex-col">
        {/* 内容区：使用 flex-1 自动占据剩余空间 */}
        <div className="flex-1 flex flex-col">
          {/* 内容卡片区域 */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {/* 顶部工具栏 - 绝对定位 */}
            {currentBackgroundIndex === 0 && (
              <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-1 text-[#595959]">
                <span className="text-sm">
                  回顾进度：{readCount}/{totalCount}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowShareDialog(true)}
                    className="p-2 text-[#595959] hover:text-[#262626] hover:bg-[#F5F5F5] rounded-lg transition-colors group inline-flex items-center justify-center relative"
                    aria-label="分享"
                  >
                    <Share2 className="h-5 w-5" strokeWidth={1.5} />
                    <span className="absolute hidden group-hover:block -top-8 -left-3 bg-[#262626] text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      分享笔记
                    </span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-2 text-[#595959] hover:text-[#262626] hover:bg-[#F5F5F5] rounded-lg transition-colors group inline-flex items-center justify-center relative"
                    aria-label={isCopied ? "已复制" : "复制内容"}
                  >
                    {isCopied ? (
                      <Check className="h-5 w-5" strokeWidth={1.5} />
                    ) : (
                      <Copy className="h-5 w-5" strokeWidth={1.5} />
                    )}
                    <span className="absolute hidden group-hover:block -top-8 -left-3 bg-[#262626] text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {isCopied ? "已复制!" : "复制内容"}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* 内容卡片 */}
            {currentBackgroundIndex === 0 ? (
              // 默认背景下的卡片样式
              <div className="w-full h-[360px] overflow-auto rounded-lg bg-white/80 p-12 shadow-sm backdrop-blur-sm">
                <div className="h-full flex flex-col">
                  {/* 笔记内容区：flex-1 自动占据剩余空间 */}
                  <div className="flex-1">
                    {currentNote?.markText && (
                      <div className="relative pl-4 mb-6">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF725F] rounded-full"></div>
                        <blockquote className="text-lg font-medium text-[#262626]">
                          {currentNote.markText}
                        </blockquote>
                      </div>
                    )}

                    <div>
                      <div className="text-base leading-relaxed text-[#595959]">
                        {currentNote?.noteContent}
                      </div>
                      {currentNote?.chapterName && (
                        <div className="mt-4 text-sm text-[#8F8F8F]">
                          {currentNote.chapterName}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 书籍信息 */}
                  <div className="flex items-center justify-between mt-6 pt-4 text-sm border-t border-[#F0F0F0]">
                    <span className="font-medium text-[#262626]">
                      {currentNote?.bookName}
                    </span>
                    <span className="text-[#8F8F8F]">
                      {currentNote?.noteTime
                        ? dayjs.unix(currentNote.noteTime).format("YYYY-MM-DD")
                        : ""}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              // 其他背景下的简洁样式
              <div className="w-full max-w-5xl group relative">
                {/* 时钟显示 - 只在bg4下显示 */}
                {currentBackgroundIndex === 3 && (
                  <div className="absolute -top-40 left-0 right-0 flex justify-center">
                    <div className="text-8xl font-['serif,Georgia'] text-white/70">
                      {currentTime}
                    </div>
                  </div>
                )}

                {/* 顶部工具栏 - 悬浮时显示 */}
                <div className="absolute -top-12 left-0 right-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-8">
                  <span
                    className={`text-sm ${
                      currentBackgroundIndex === 2
                        ? "text-[#006D11]/90"
                        : currentBackgroundIndex === 3
                        ? "text-white/60"
                        : currentBackgroundIndex === 4
                        ? "text-[#2C3333]/90"
                        : currentBackgroundIndex === 5
                        ? "text-[#2D5A27]/90"
                        : "text-white/80"
                    }`}
                  >
                    回顾进度：{readCount}/{totalCount}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowShareDialog(true)}
                      className={`p-2 rounded-lg transition-colors group/btn inline-flex items-center justify-center relative ${
                        currentBackgroundIndex === 2
                          ? "text-[#006D11]/90 hover:bg-[#006D11]/10"
                          : currentBackgroundIndex === 3
                          ? "text-white/60 hover:bg-white/10"
                          : currentBackgroundIndex === 4
                          ? "text-[#2C3333]/90 hover:bg-[#2C3333]/10"
                          : currentBackgroundIndex === 5
                          ? "text-[#2D5A27]/90 hover:bg-[#2D5A27]/10"
                          : "text-white/80 hover:bg-white/10"
                      }`}
                      aria-label="分享"
                    >
                      <Share2 className="h-5 w-5" strokeWidth={1.5} />
                      <span className="absolute hidden group-hover/btn:block -top-8 -left-3 bg-black/60 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        分享笔记
                      </span>
                    </button>
                    <button
                      onClick={handleCopy}
                      className={`p-2 rounded-lg transition-colors group/btn inline-flex items-center justify-center relative ${
                        currentBackgroundIndex === 2
                          ? "text-[#006D11]/90 hover:bg-[#006D11]/10"
                          : currentBackgroundIndex === 3
                          ? "text-white/60 hover:bg-white/10"
                          : currentBackgroundIndex === 4
                          ? "text-[#2C3333]/90 hover:bg-[#2C3333]/10"
                          : currentBackgroundIndex === 5
                          ? "text-[#2D5A27]/90 hover:bg-[#2D5A27]/10"
                          : "text-white/80 hover:bg-white/10"
                      }`}
                      aria-label={isCopied ? "已复制" : "复制内容"}
                    >
                      {isCopied ? (
                        <Check className="h-5 w-5" strokeWidth={1.5} />
                      ) : (
                        <Copy className="h-5 w-5" strokeWidth={1.5} />
                      )}
                      <span className="absolute hidden group-hover/btn:block -top-8 -left-3 bg-black/60 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {isCopied ? "已复制!" : "复制内容"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-8 px-8">
                  {currentNote?.markText && (
                    <div
                      className={`line-clamp-5 text-center text-xl md:text-3xl font-['serif,Georgia'] ${
                        currentBackgroundIndex === 2
                          ? "text-[#006D11]"
                          : currentBackgroundIndex === 3
                          ? "text-white/70"
                          : currentBackgroundIndex === 4
                          ? "text-[#2C3333]"
                          : currentBackgroundIndex === 5
                          ? "text-[#2D5A27]"
                          : "text-white/90"
                      }`}
                      style={{ lineHeight: "1.5em", letterSpacing: "0.03em" }}
                    >
                      {currentNote.markText}
                    </div>
                  )}

                  {currentNote?.noteContent && (
                    <div
                      className={`line-clamp-5 text-center text-lg md:text-2xl font-['serif,Georgia'] ${
                        currentBackgroundIndex === 2
                          ? "text-[#006D11]"
                          : currentBackgroundIndex === 3
                          ? "text-white/70"
                          : currentBackgroundIndex === 4
                          ? "text-[#2C3333]"
                          : currentBackgroundIndex === 5
                          ? "text-[#2D5A27]"
                          : "text-white/90"
                      }`}
                      style={{ lineHeight: "1.5em", letterSpacing: "0.03em" }}
                    >
                      {currentNote.noteContent}
                    </div>
                  )}

                  <div className="flex flex-col items-center space-y-2">
                    <span
                      className={`text-base font-['serif,Georgia'] ${
                        currentBackgroundIndex === 2
                          ? "text-[#006D11]/80"
                          : currentBackgroundIndex === 3
                          ? "text-white/60"
                          : currentBackgroundIndex === 4
                          ? "text-[#2C3333]/80"
                          : currentBackgroundIndex === 5
                          ? "text-[#2D5A27]/80"
                          : "text-white/80"
                      }`}
                    >
                      {currentNote?.bookName}
                    </span>
                    <span
                      className={
                        currentBackgroundIndex === 2
                          ? "text-[#006D11]/60"
                          : currentBackgroundIndex === 3
                          ? "text-white/50"
                          : currentBackgroundIndex === 4
                          ? "text-[#2C3333]/60"
                          : currentBackgroundIndex === 5
                          ? "text-[#2D5A27]/60"
                          : "text-white/60"
                      }
                    >
                      {currentNote?.noteTime
                        ? dayjs.unix(currentNote.noteTime).format("YYYY-MM-DD")
                        : ""}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 底部工具栏 */}
          <div
            className={`h-[80px] flex items-center justify-center ${
              currentBackgroundIndex !== 0 ? "-mt-12" : ""
            }`}
          >
            <button
              onClick={handleRandomNote}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-colors ${
                currentBackgroundIndex === 0
                  ? "bg-[#FF725F] text-white hover:bg-[#FF725F]/90"
                  : currentBackgroundIndex === 3
                  ? "bg-white/5 text-white/70 hover:bg-white/10 backdrop-blur-sm"
                  : currentBackgroundIndex === 4
                  ? "bg-[#2C3333]/10 text-[#2C3333] hover:bg-[#2C3333]/20 backdrop-blur-sm"
                  : currentBackgroundIndex === 5
                  ? "bg-[#2D5A27]/10 text-[#2D5A27] hover:bg-[#2D5A27]/20 backdrop-blur-sm"
                  : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
              }`}
            >
              <Shuffle className="h-4 w-4" />
              随机回顾
            </button>
          </div>

          {/* 切换背景按钮：固定在右下角 */}
          <button
            onClick={handleSwitchBackground}
            className={`absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentBackgroundIndex === 0
                ? "text-[#595959] hover:text-[#262626] hover:bg-[#F5F5F5]"
                : currentBackgroundIndex === 3
                ? "text-white/70 hover:bg-white/10"
                : currentBackgroundIndex === 4
                ? "text-[#2C3333] hover:bg-[#2C3333]/10"
                : currentBackgroundIndex === 5
                ? "text-[#2D5A27] hover:bg-[#2D5A27]/10"
                : "text-white/80 hover:bg-white/10"
            }`}
          >
            <Image className="h-4 w-4" />
            切换背景 {currentBackgroundIndex + 1}/{backgrounds.length}
          </button>
        </div>
      </div>

      {/* 分享对话框 */}
      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        note={currentNote}
      />

      <NewTabDialog
        isOpen={showNewTabDialog}
        onClose={() => setShowNewTabDialog(false)}
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
