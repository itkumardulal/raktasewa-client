// src/lib/axiosInstance.js
import axios from "axios";

const TOKEN_KEY = "raktasewa_jwt";
const PROD_API = "https://raktasewa-server-production.up.railway.app/api";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function resolveBaseUrl() {
  const fromEnv = (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
  const bad =
    !fromEnv ||
    /yourdomain|example\.com|localhost|127\.0\.0\.1/i.test(fromEnv);

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isLocal = host === "localhost" || host === "127.0.0.1";
    if (!isLocal && bad) return PROD_API;
  }

  if (bad) {
    return import.meta.env.PROD ? PROD_API : "http://localhost:5000/api";
  }

  return fromEnv.endsWith("/api") ? fromEnv : `${fromEnv}/api`;
}

const api = axios.create({
  baseURL: resolveBaseUrl(),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  // Keep baseURL correct if a bad localhost value was baked into the build
  config.baseURL = resolveBaseUrl();
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
