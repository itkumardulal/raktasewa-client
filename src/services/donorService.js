import api from "../lib/axiosInstance";

export async function fetchDonors() {
  const { data } = await api.get("/donors"); // cookies ON
  return data; // [{…}, {…}]
}

export async function fetchVIDonors() {
  const { data } = await api.get("/donors/vi"); // cookies ON
  return data; // [{…}, {…}]
}

export async function fetchPendingDonors() {
  const { data } = await api.get("/donors/pending"); // cookies ON
  return data; // [{…}, {…}]
}

export async function fetchAssignedDonors() {
  const { data } = await api.get("/donors/assigned");
  return data;
}

export async function addDonor(payload) {
  const { data } = await api.post("/donors/add", payload);
  return data; // [{…}, {…}]
}

export async function updateDonor(id, payload) {
  const { data } = await api.post(`/donors/${id}`, payload);
  return data;
}

export async function deleteDonor(id, payload) {
  const { data } = await api.post(`/donors/delete/${id}`, payload);
  return data;
}

export async function updateDonorStatus(id, status) {
  // console.log({ id, status });
  const { data } = await api.post(`/donors/update/status`, { id, status });
  return data;
}
