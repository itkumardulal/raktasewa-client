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

/** Full report payload for filters / export */
export async function fetchReportData() {
  const { data } = await api.get("/request/report-data");
  return data;
}

export async function fetchFlaggedRequests() {
  const { data } = await api.get("/request/flagged");
  return data;
}

export async function flagRequest({ request_id, reason, custom_reason }) {
  const { data } = await api.post("/request/flag", {
    request_id,
    reason,
    custom_reason,
  });
  return data;
}

export async function unflagRequest({ request_id }) {
  const { data } = await api.post("/request/unflag", { request_id });
  return data;
}
