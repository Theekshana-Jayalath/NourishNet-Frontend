export const BASE_URL = "http://localhost:3000/api";

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