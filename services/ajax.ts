import axios from "axios";
import { getToken } from "@/utils/user-token";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BASE_API,
  timeout: 30 * 1000,
});

// request 拦截: 每次请求都带上token
instance.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    // JWT的固定格式
    config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use((res) => {
  const { data } = res;
  return data as any;
});

export default instance;
