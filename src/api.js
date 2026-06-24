import axiosInstance from './api/axiosInstance';

export const BASE_URL = axiosInstance.defaults.baseURL;

export function getToken() { 
  return localStorage.getItem("token") || ""; 
}

export function getUser() { 
  try { 
    return JSON.parse(localStorage.getItem("user")) || null; 
  } catch { 
    return null; 
  } 
}

async function request(endpoint, options = {}) { 
  const { method = 'GET', body, headers, ...rest } = options;
  try {
    const response = await axiosInstance({
      url: endpoint,
      method: method.toUpperCase(),
      data: body ? (typeof body === 'string' ? JSON.parse(body) : body) : undefined,
      headers,
      ...rest
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || "Request failed";
    throw new Error(message);
  }
}

export async function login(username, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

export async function getUserById(id) {
  return request(`/users/${id}`);
}

export async function getUsers(params = {}) {
  const query = new URLSearchParams();
  if (params.role) query.append("role", params.role);
  if (params.limit) query.append("limit", params.limit);
  const qs = query.toString() ? `?${query.toString()}` : "";
  return request(`/users${qs}`);
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

// FIXED FILTER FUNCTION
export function filterMyRequests(items = []) { 
  const user = getUser(); 
  if (!user) return items;
  
  const userId = user.id || user._id;
  if (!userId) return items;
  
  // Filter by ngoId (correct field from backend)
  return items.filter(item => item.ngoId === userId); 
}

// -----------------------------
// Donation Form API helpers
// Backend endpoints are mounted under: /api/donationForms
// -----------------------------

export async function createDonationForm(payload) {
  return request(`/donationForms`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getDonationForms() {
  return request(`/donationForms`);
}

export async function getDonationFormById(id) {
  return request(`/donationForms/${id}`);
}

export async function updateDonationForm(id, payload) {
  return request(`/donationForms/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteDonationForm(id) {
  return request(`/donationForms/${id}`, {
    method: "DELETE",
  });
}

export async function getMyDonationHistory() {
  return request(`/donationForms/my-history`);
}

export async function getMyPendingDonations() {
  return request(`/donationForms/my-pending`);
}