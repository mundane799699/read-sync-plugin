import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const Review = () => {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  useEffect(() => {
    if (loading) {
      return;
    }
    if (!user) {
      nav("/login");
    }
  }, [user, loading]);

  return (
    <div>
      <div className="fixed top-0 left-0 right-0 h-12 bg-white border-b flex items-center px-4">
        <button
          onClick={() => nav(-1)}
          className="flex items-center text-gray-600"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="ml-1">返回</span>
        </button>
      </div>
      <div className="pt-12">Review</div>
    </div>
  );
};

export default Review;
