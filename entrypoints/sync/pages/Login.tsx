import { 
  Cloud, 
  Download, 
  BrainCircuit, 
  Mail,
  Play 
} from "lucide-react";
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
    <div className="min-h-screen font-sans flex flex-col bg-gradient-to-br from-orange-50 to-white">
      <header className="flex justify-between items-center p-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
          Readecho
        </h1>
        <button
          onClick={() => window.open('https://readecho.cn', '_blank')}
          className="px-6 py-2 text-sm text-white bg-gradient-to-r from-orange-500 to-orange-400 rounded-md hover:opacity-90 transition-opacity"
        >
          网页版
        </button>
      </header>

      <main className="flex-grow container mx-auto px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 mt-12">
          <div className="md:w-1/2 max-w-xl">
            <div className="text-left">
              <h2 className="text-4xl font-bold text-gray-800 mb-2">
                同步你的微信读书笔记
              </h2>
              <p className="text-xl text-gray-800 mb-10">
                让回顾释放知识的力量！
              </p>
              <ul className="space-y-3 text-gray-700 mb-12 text-xs">
                {features.map((feature, index) => (
                  <li key={index}>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={signUp}
                className="bg-gradient-to-r from-orange-500 to-orange-400 text-white px-8 py-3 rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-orange-200 text-lg"
              >
                免费注册
              </button>
              <button
                onClick={signIn}
                className="bg-white text-orange-500 px-8 py-3 rounded-lg hover:bg-orange-50 transition-colors text-lg"
              >
                已有账号？登录
              </button>
            </div>
          </div>
          <div className="md:w-1/2 grid grid-cols-3 gap-4 p-4">
            {books.map((book, index) => (
              <div
                key={index}
                className="transform hover:scale-105 transition-transform duration-200"
              >
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-auto rounded-lg shadow-md"
                />
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="py-6">
        <div className="container mx-auto flex justify-center items-center space-x-8"></div>
      </footer>
    </div>
  );
};

export default Login;
