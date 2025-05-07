import api from "../lib/axiosInstance";

export async function dashboardData() {
  const { data } = await api.get("/dashboard");
  return data;
}
