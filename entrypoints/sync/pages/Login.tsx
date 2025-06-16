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
  { text: "1. 注册/登录Readecho", hasLink: false },
  { text: "2. 登录", linkText: "微信读书电脑版", url: "https://weread.qq.com/", hasLink: true },
  { text: "3. 点击一键同步，去", linkText: "网页端", url: "https://readecho.cn/", hasLink: true, suffix: "查看笔记" },
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
    <div className="min-h-screen font-sans flex flex-col" style={{backgroundColor: '#f9fafb'}}>
      <header className="container mx-auto px-8 py-8">
        <div className="flex justify-between items-center w-full">
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
          <div className="flex items-center gap-3 ml-auto mr-0" style={{marginRight: '8%'}}>
            <button
              onClick={() => window.open('https://v3oxu28gnc.feishu.cn/docx/EQvqdMm3WoqlBjxT7ASc3u0wnKf', '_blank')}
              className="px-6 py-2 text-sm rounded-md hover:bg-gray-50 transition-colors"
              style={{color: '#d97b53'}}
            >
              帮助文档
            </button>
            <button
              onClick={() => window.open('https://readecho.cn', '_blank')}
              className="px-6 py-2 text-sm text-white rounded-md hover:opacity-90 transition-opacity"
              style={{backgroundColor: '#d97b53'}}
            >
              查看网页端
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 mt-12">
          <div className="md:w-1/2 max-w-xl">
            <div className="text-left">
              <h2 className="text-4xl font-bold text-gray-800 mb-6 -mt-20 leading-relaxed">
                将你的
                <span className="relative">
                  微信读书
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-400 rounded-full"></span>
                </span>
                笔记同步到
                <span className="relative">
                  Readecho
                  <span className="absolute bottom-0 left-0 w-full h-1 rounded-full" style={{backgroundColor: '#d97b53'}}></span>
                </span>
              </h2>
              <p className="text-xl text-gray-800 mb-10">
                简单三步，开启笔记管理新体验
              </p>
              <ul className="space-y-3 text-gray-700 mb-12 text-lg">
                {features.map((feature, index) => (
                  <li key={index}>
                    {feature.hasLink ? (
                      <>
                        {feature.text}
                        <a 
                          href={feature.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-current underline hover:opacity-80 ml-1"
                          style={{color: '#d97b53'}}
                        >
                          {feature.linkText}
                        </a>
                        {feature.suffix && <span className="ml-1">{feature.suffix}</span>}
                      </>
                    ) : (
                      feature.text
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={signUp}
                className="text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-lg text-base"
                style={{backgroundColor: '#d97b53'}}
              >
                免费注册
              </button>
              <button
                onClick={signIn}
                className="bg-white px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors text-base"
                style={{color: '#d97b53'}}
              >
                已有账号？登录
              </button>
            </div>
          </div>
          <div className="md:w-1/2 grid grid-cols-3 gap-3 p-4 scale-75 origin-center">
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
