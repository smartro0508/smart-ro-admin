import axios from "axios";

export const BASE_URL = "https://api.smartro.shop";

const api = axios.create({
  baseURL: "https://api.smartro.shop/api/v1",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
