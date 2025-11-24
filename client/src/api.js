// i keep my api helper here

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body.message || `request failed ${res.status}`;
    throw new Error(message);
  }

  return res.json();
}
