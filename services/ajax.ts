import axios from "axios";
import { getToken } from "@/utils/user-token";

const instance = axios.create({
  baseURL: "http://localhost:8080",
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
export default instance;
