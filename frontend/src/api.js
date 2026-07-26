import axios from "axios";

const productionApiUrl = "https://fruitoria.onrender.com/api";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? productionApiUrl : "/api"),
  timeout: 45000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fruitora_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Fire a lightweight GET to /api/health to wake the backend from Render cold sleep.
 * Returns a promise — callers can fire-and-forget or optionally await it.
 */
let prewarmPromise = null;
export const prewarmBackend = () => {
  if (prewarmPromise) return prewarmPromise;
  prewarmPromise = api
    .get("/health", { timeout: 50000 })
    .catch(() => {})
    .finally(() => { prewarmPromise = null; });
  return prewarmPromise;
};

/**
 * Retry wrapper — retries a request function up to `retries` times with
 * exponential backoff (baseDelay * 2^attempt) on failure or timeout.
 *
 * @param {() => Promise} requestFn - function that returns an axios promise
 * @param {number} retries - max retry attempts (default 2)
 * @param {number} baseDelay - base delay in ms before first retry (default 2000)
 * @returns {Promise} - the resolved response or the last rejection
 */
export const fetchWithRetry = async (requestFn, retries = 2, baseDelay = 2000) => {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
};
