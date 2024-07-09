import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "@/services/ajax";
import { setToken, removeToken, getToken } from "@/utils/user-token";
import { User } from "../types/auth";

interface AuthContextType {
  user: User | null;
  login: (loginData: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider mounted");
    getToken().then((token) => {
      console.log("token = ", token);
      if (token) {
        fetchUserInfo(token);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const fetchUserInfo = async (token: string) => {
    try {
      const response = await axios.get("/getInfo");
      if (response.data.code === 200) {
        setUser(response.data.user);
      } else {
        removeToken();
      }
    } catch (error) {
      console.error("Failed to fetch user info", error);
      removeToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (loginData: any) => {
    return new Promise<void>(async (resolve, reject) => {
      const response = await axios.post("/login", loginData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = response.data;

      if (response.status === 200 && data.code === 200) {
        const { token } = data;
        setToken(token);
        fetchUserInfo(token);
        resolve();
      } else {
        reject(data.msg || "登录失败，请检查用户名或密码");
      }
    });
  };

  const logout = async () => {
    // const callbackUrl = window.location.href;
    // 调用注销登录接口
    try {
      await axios.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      removeToken();
      setUser(null);
      // window.location.href = callbackUrl;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
