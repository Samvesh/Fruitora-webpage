import axios from "axios";

const productionApiUrl = "https://fruitoria.onrender.com/api";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? productionApiUrl : "/api"),
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fruitora_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
