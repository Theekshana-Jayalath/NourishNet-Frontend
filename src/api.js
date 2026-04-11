<<<<<<< HEAD
export const BASE_URL = "http://localhost:3000/api";
=======
<<<<<<< HEAD
export const BASE_URL = "http://localhost:3000/api";
=======
<<<<<<< HEAD
export const BASE_URL = "http://localhost:3000/api";
=======
export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

>>>>>>> c1a1f31ae22484f28f2c9a62009fa6da980562a6
>>>>>>> e4f7935f24c9444ec59f6aba385858ca0fd830ed
>>>>>>> 8042ee97fabd67ba22d1d59bef88ac25d85d881e

export function getToken() {
  return localStorage.getItem("token") || "";
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    return {};
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export async function createRequest(payload) {
  return request("/requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getRequests(params = {}) {
  const query = new URLSearchParams();

  if (params.status) query.append("status", params.status);
  if (params.urgencyLevel) query.append("urgencyLevel", params.urgencyLevel);
  if (params.q) query.append("q", params.q);
  if (params.page) query.append("page", params.page);
  if (params.limit) query.append("limit", params.limit);

  const qs = query.toString() ? `?${query.toString()}` : "";
  return request(`/requests${qs}`);
}

export async function getRequestById(id) {
  return request(`/requests/${id}`);
}

export function filterMyRequests(items = []) {
  const user = getUser();
  const userId = user?.id || user?._id;

  if (!userId) return items;

  return items.filter((item) => {
    if (!item.ngoId) return false;
    if (typeof item.ngoId === "string") return item.ngoId === userId;
    return item.ngoId?._id === userId;
  });
}