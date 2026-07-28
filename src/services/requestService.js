import api from "../lib/axiosInstance";

export async function fetchRequests() {
  const { data } = await api.get("/request"); // or /requests depending on your backend route
  return data;
}

export async function fetchTodayRequests() {
  const { data } = await api.get("/request/today"); // or /requests depending on your backend route
  return data;
}

/** Admin: exact + compatible + pending donor matches (does not change request status) */
export async function fetchAdminMatches({ blood_group, request_id }) {
  const { data } = await api.post("/request/admin/matches", {
    blood_group,
    request_id,
  });
  return data;
}
