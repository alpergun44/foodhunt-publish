
export const API_BASE = (import.meta.env.VITE_API_BASE as string) || "http://localhost:5050";

function authHeaders() {
  const t = localStorage.getItem("fh_admin_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function fetchCatalog(city: string, area: string, limit = 16) {
  const res = await fetch(`${API_BASE}/api/catalog?city=${encodeURIComponent(city)}&area=${encodeURIComponent(area)}&limit=${limit}`);
  if (!res.ok) throw new Error("Catalog fetch failed");
  return res.json();
}

export async function track(event_type: string, payload: Record<string, any> = {}, session_id?: string) {
  await fetch(`${API_BASE}/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event_type, session_id, payload })
  }).catch(() => {});
}

// Admin
export async function adminList(params: { city?: string; area?: string; q?: string }) {
  const qs = new URLSearchParams(params as any).toString();
  const res = await fetch(`${API_BASE}/api/admin/items?${qs}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Admin list failed");
  return res.json();
}

export async function adminCreate(item: any) {
  const res = await fetch(`${API_BASE}/api/admin/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Create failed");
  return res.json();
}

export async function adminUpdate(id: string, patch: any) {
  const res = await fetch(`${API_BASE}/api/admin/items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(patch)
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

export async function adminDelete(id: string) {
  const res = await fetch(`${API_BASE}/api/admin/items/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });
  if (!res.ok) throw new Error("Delete failed");
  return res.json();
}

export async function adminUpload(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/api/admin/upload`, {
    method: "POST",
    headers: authHeaders(),
    body: fd
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function adminImportCSV(csvText: string) {
  const body = new URLSearchParams();
  body.set("csv", csvText);
  const res = await fetch(`${API_BASE}/api/admin/import-csv`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!res.ok) throw new Error("Import failed");
  return res.json();
}
