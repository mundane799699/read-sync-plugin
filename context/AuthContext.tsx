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
import { loginService, fetchUserInfoService } from "@/services/login";

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
        fetchUserInfo();
      } else {
        setLoading(false);
      }
    });
  }, []);

  const fetchUserInfo = async () => {
    try {
      const res = await fetchUserInfoService();
      const { user } = res;
      setUser(user);
    } catch (error) {
      console.error("Failed to fetch user info", error);
      removeToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (loginData: any) => {
    return new Promise<void>(async (resolve, reject) => {
      const res = await loginService(loginData);
      const { code, token, msg } = res;
      if (code === 200) {
        await setToken(token);
        fetchUserInfo();
        resolve();
      } else {
        reject(msg || "登录失败，请检查用户名或密码");
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
