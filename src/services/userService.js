import api from "../lib/axiosInstance";

export async function fetchUsers() {
  const { data } = await api.get("/user/all");
  return data;
}

export async function addUser(payload) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

// PUT /users/:id
export async function updateUser(id, payload) {
  const { data } = await api.put(`/user/${id}`, payload);
  return data;
}

// DELETE /users/:id
export async function deleteUser(id) {
  const { data } = await api.delete(`/user/${id}`);
  return data;
}
