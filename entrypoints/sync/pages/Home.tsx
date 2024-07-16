import { useAuth } from "@/context/AuthContext";
import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "@/components/Loader";
const Home: FC = () => {
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
      {loading ? (
        <Loader className="mx-auto" />
      ) : (
        <div className="container mx-auto p-4 relative">
          <div className="absolute top-2 right-2 space-x-2">
            <button className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600">
              {user?.nickName}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default Home;
