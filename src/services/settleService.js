import api from "../lib/axiosInstance";

export async function settleRequest(payload) {
  // payload = { request: {...}, donor: {...} }
  await api.post("/settle/add", payload);
}

export async function fetchSettledRequests() {
  const { data } = await api.get("/settle");
  return data;
}
