const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getHeaders() {
  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  });
  if (!res.ok) {
    const error = new Error(`API error: ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return res.json();
}

export const getAuthorities = () => request("/authority");
export const addAuthority = (data) => request("/authority/add", { method: "POST", body: JSON.stringify(data) });
export const updateAuthority = (id, data) => request(`/authority/update/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteAuthority = (id) => request(`/authority/delete/${id}`, { method: "DELETE" });

export const getDrivers = () => request("/driver");
export const addDriver = (data) => request("/driver/add", { method: "POST", body: JSON.stringify(data) });
export const updateDriver = (id, data) => request(`/driver/update/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteDriver = (id) => request(`/driver/delete/${id}`, { method: "DELETE" });

export const getVehicles = () => request("/vehicle");
export const addVehicle = (data) => request("/vehicle/add", { method: "POST", body: JSON.stringify(data) });
export const updateVehicle = (id, data) => request(`/vehicle/update/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteVehicle = (id) => request(`/vehicle/delete/${id}`, { method: "DELETE" });

export const getBins = () => request("/bin");
export const getBinPrediction = (id) => request(`/bin/${id}/prediction`);
export const addBin = (data) => request("/bin/add", { method: "POST", body: JSON.stringify(data) });
export const updateBin = (id, data) => request(`/bin/update/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteBin = (id) => request(`/bin/delete/${id}`, { method: "DELETE" });

export const getIot = () => request("/iot");
export const getAnalytics = () => request("/analytics");
export const getIncidents = () => request("/incidents");
export const getAnomalies = () => request("/anomalies");
export const getComplaints = () => request("/complaints");

export const login = (username, password) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const register = (username, password) =>
  request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

// ── Pickup Requests ──────────────────────────────────────────────────────────
export const getPickupRequests = (status) =>
  request(`/api/pickup-requests${status ? `?status=${status}` : ""}`);

export const createPickupRequest = (data) =>
  request("/api/pickup-requests", { method: "POST", body: JSON.stringify(data) });

export const updatePickupRequest = (id, data) =>
  request(`/api/pickup-requests/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deletePickupRequest = (id) =>
  request(`/api/pickup-requests/${id}`, { method: "DELETE" });

