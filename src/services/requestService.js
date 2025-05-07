import api from "../lib/axiosInstance";

export async function fetchRequests() {
  const { data } = await api.get("/request"); // or /requests depending on your backend route
  return data;
}

export async function fetchTodayRequests() {
  const { data } = await api.get("/request/today"); // or /requests depending on your backend route
  return data;
}
