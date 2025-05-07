import api from "../lib/axiosInstance";

export async function fetchUnSettledRequests() {
  const { data } = await api.get("/unsettled");
  return data;
}
