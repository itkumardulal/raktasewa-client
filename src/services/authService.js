import api, { setStoredToken } from "../lib/axiosInstance";

/**
 * POST /auth/login
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} { user, token } on success
 */
export async function loginService(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  if (data?.token) setStoredToken(data.token);
  return data; // { user, token }
}

/** POST /auth/logout → clears jwt cookie on the server */
export async function logoutService() {
  try {
    await api.post("/auth/logout");
  } finally {
    setStoredToken(null);
  }
}
