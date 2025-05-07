import api from "../lib/axiosInstance";

/**
 * POST /auth/login
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} { user } on success
 */
export async function loginService(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  return data; // { user: { id, email, role } }
}

/** POST /auth/logout → clears jwt cookie on the server */

export async function logoutService() {
  await api.post("/auth/logout"); // server clears cookie
}
