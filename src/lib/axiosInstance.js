// src/lib/axiosInstance.js
import axios from "axios";

/**
 * Axios instance that automatically sends the JWT cookie **except** when hitting
 * the public login endpoint (`/auth/login`).  We do that by flipping
 * `withCredentials` off inside a request interceptor for that one URL.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // default → send cookie
});

// Request interceptor to disable credentials for login only
api.interceptors.request.use((config) => {
  // absolute or relative; remove the baseURL so we can match consistently
  const path = config.url?.replace(config.baseURL || "", "");
  if (path?.startsWith("/auth/login")) {
    // don't include cookies when logging in – server will still SET the cookie
    // config.withCredentials = false;
  } else {
    config.withCredentials = true;
  }
  return config;
});

// OPTIONAL: global 401 handler
// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response?.status === 401) {
//       // redirect or dispatch logout
//     }
//     return Promise.reject(err);
//   },
// );

export default api;
