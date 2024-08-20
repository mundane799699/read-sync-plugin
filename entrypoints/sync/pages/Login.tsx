import { BookOpen, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const books = [
  { title: "How to Take Smart Notes", cover: "/yingxiangli.jpg" },
  { title: "Snow Flower Writing Method", cover: "/jiqi.jpg" },
  { title: "SEO Art", cover: "/kapian.jpg" },
  { title: "Machine Learning in Action", cover: "/nawaer.jpg" },
  { title: "How to Write Well", cover: "/renxing.jpg" },
  { title: "SEO Practical Guide", cover: "/seo.jpg" },
];

const features = [
  "一键同步笔记到云端",
  "快速导出笔记到本地",
  "利用记忆曲线回顾笔记重点",
  "设定邮箱推送，每日获取知识摘要",
];

const Login = () => {
  const nav = useNavigate();
  const { fetchUserInfo } = useAuth();
  useEffect(() => {
    const handleTabActivated = (activeInfo: any) => {
      browser.tabs.get(activeInfo.tabId).then(async (tab) => {
        if (tab.url.startsWith(browser.runtime.getURL("/sync.html"))) {
          const user = await fetchUserInfo();
          if (user) {
            console.log("跳转到主页");
            nav("/");
          }
        }
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

  const signUp = () => {
    browser.tabs.create({
      url: `${import.meta.env.VITE_BASE_WEB}/signup`,
      active: true,
    });
  };

  return (
    <div className="bg-orange-100 min-h-screen font-sans flex flex-col">
      <header className="flex justify-between items-center p-4">
        <h1 className="text-4xl font-bold text-orange-500">Readecho</h1>
        <div>
          <button
            onClick={signUp}
            className="mx-2 text-gray-600 border border-orange-500 px-4 py-2 rounded"
          >
            注册
          </button>
          <button
            onClick={signIn}
            className="bg-orange-500 text-white px-4 py-2 rounded"
          >
            登录
          </button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-4">同步你的微信读书笔记</h2>
            <p className="text-xl mb-6">让回顾释放知识的力量！</p>
            <ul className="mb-6">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center mb-2">
                  <BookOpen className="mr-2 text-orange-500" size={20} />
                  {feature}
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-600 mb-4">...更多功能，敬请期待</p>
            <div className="flex space-x-4">
              <button
                onClick={signUp}
                className="bg-orange-500 text-white px-6 py-2 rounded flex items-center"
              >
                <span className="mr-2">免费注册</span>
              </button>
              <button
                onClick={signIn}
                className="border border-orange-500 text-orange-500 px-6 py-2 rounded flex items-center"
              >
                <Play className="mr-2" size={20} />
                <span>已经有账号？点此登录</span>
              </button>
            </div>
          </div>
          <div className="md:w-1/2 grid grid-cols-3 gap-4 mt-8 md:mt-0">
            {books.map((book, index) => (
              <img
                key={index}
                src={book.cover}
                alt={book.title}
                className="w-full h-auto"
              />
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-white py-4 mt-8">
        <div className="container mx-auto flex justify-center items-center space-x-8"></div>
      </footer>
    </div>
  );
};

export default Login;
