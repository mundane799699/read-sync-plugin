import "./App.css";

function App() {
  const [books, setBooks] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetchData();
    // 添加标签页激活监听器
    const handleTabActivated = (activeInfo: any) => {
      browser.tabs.get(activeInfo.tabId).then((tab) => {
        if (!isLoggedIn && tab.url === browser.runtime.getURL("/sync.html")) {
          fetchData();
        }
      });
    };

    browser.tabs.onActivated.addListener(handleTabActivated);
    // 清理函数
    return () => {
      browser.tabs.onActivated.removeListener(handleTabActivated);
    };
  }, []);
  const fetchData = async () => {
    const res = await browser.runtime.sendMessage("fetchNotebooks");
    console.log(res);

    const { status, data } = res;
    if (status === 200) {
      // 成功获取数据
      console.log("Notebooks data:", data);
      const { books } = data;
      setBooks(books);
      setIsLoggedIn(true);
    } else if (status === 401) {
      // 处理错误
      console.log("未登录，请先登录");
      setIsLoggedIn(false);
    }
  };

  const openWxRead = () => {
    // 在新标签页打开https://weread.qq.com/
    browser.tabs.create({ url: "https://weread.qq.com", active: true });
  };

  return (
    <>
      {isLoggedIn ? (
        <ul className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
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
              <div className="flex flex-col justify-between">
                <h2 className="text-sm font-medium overflow-hidden overflow-ellipsis line-clamp-2 text-left">
                  {item.book.title}
                </h2>
                <h2 className="text-xs text-gray-500 text-left">{`${item.noteCount}条划线 | ${item.reviewCount}条想法`}</h2>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <button
          onClick={openWxRead}
          className="text-lg font-bold text-green-500 rounded-lg border border-green-500 hover:bg-green-500 hover:text-white p-4"
        >
          登录微信读书网页端
        </button>
      )}
    </>
  );
}

export default App;
