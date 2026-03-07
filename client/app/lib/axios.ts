import axios from "axios";
import { storage } from "./storage.ts";

console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});
axiosClient.interceptors.request.use(
  (config) => {
    const token = storage.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config.url?.includes("/Auth/login");
      if (!isLoginRequest) {
        storage.clearAll();
        // Use a custom event to navigate without full reload
        window.dispatchEvent(new Event("unauthorized"));
      }
    }
    return Promise.reject(error);
  },
);
export default axiosClient;