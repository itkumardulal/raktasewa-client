import api from "../lib/axiosInstance";

export async function fetchOrganizations() {
  const { data } = await api.get("/organizations");
  return data;
}

export async function addOrganization(payload) {
  const { data } = await api.post("/organizations/add", payload);
  return data; // [{…}, {…}]
}

export async function updateOrganization(id, payload) {
  const { data } = await api.put(`/organizations/${id}`, payload);
  return data;
}

export async function deleteOrganization(id) {
  const { data } = await api.delete(`/organizations/${id}`);
  return data;
}
