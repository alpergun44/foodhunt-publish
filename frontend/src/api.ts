// ─── FoodHunt API Client v2.2 (Unified) ─────────────────────────────────────
// Works with both Vite dev proxy (/api) and production backend.
// Supports: public API, user auth (JWT), admin auth (legacy token), analytics.

const BASE = '/api';

// ─── Safe Storage Helper (incognito/private mode safe) ──────────────────────
const memoryStore: Record<string, string> = {};

export function safeStorage(type: 'local' | 'session'): Storage | null {
  try {
    const s = type === 'local' ? localStorage : sessionStorage;
    s.setItem('__test', '1');
    s.removeItem('__test');
    return s;
  } catch {
    return null;
  }
}

export function safeGetItem(type: 'local' | 'session', key: string): string | null {
  const s = safeStorage(type);
  if (s) return s.getItem(key);
  return memoryStore[key] ?? null;
}

export function safeSetItem(type: 'local' | 'session', key: string, value: string): void {
  const s = safeStorage(type);
  if (s) s.setItem(key, value);
  else memoryStore[key] = value;
}

export function safeRemoveItem(type: 'local' | 'session', key: string): void {
  const s = safeStorage(type);
  if (s) s.removeItem(key);
  else delete memoryStore[key];
}

// ─── Session + Analytics ────────────────────────────────────────────────────
function getSessionId(): string {
  let sid = safeGetItem('session', 'fh_sid');
  if (!sid) {
    sid = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    safeSetItem('session', 'fh_sid', sid);
  }
  return sid;
}

function ga4(name: string, params: Record<string, unknown> = {}) {
  try {
    (window as any).gtag?.('event', name, params);
  } catch (e) {
    if (import.meta.env.DEV) console.warn('[GA4]', e);
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────
export interface CompetitionSlot {
  slot: string;
  start: string;
  end: string;
}

export interface AvailableHours {
  open: string;
  close: string;
  days: number[];
}

export interface Restaurant {
  id: number;
  name: string;
  cuisine?: string;
  area?: string;
  rating?: number;
  price_level?: number;
  calories_min?: number;
  calories_max?: number;
  image_url?: string;
  description?: string;
  yemeksepeti_link?: string;
  getir_link?: string;
  trendyol_link?: string;
  is_active?: number; // 0 or 1
  address?: string;
  lat?: number;
  lng?: number;
  tags?: string[];
  google_place_id?: string;
  google_maps_url?: string;
  website?: string;
  rating_count?: number;
  is_open?: boolean | null;
  source?: string;
  competition_slots?: CompetitionSlot[];
  available_hours?: AvailableHours;
  district?: string;
}

export interface TournamentSlot {
  slot: string;
  start: string;
  end: string;
  icon: string;
  is_active: boolean;
  starts_in_ms: number;
  starts_in_minutes: number;
}

export interface District {
  name: string;
  count: number;
  is_active: boolean;
}

export interface Tournament {
  id: number;
  title: string;
  description: string;
  slot_start: string;
  slot_end: string;
  cuisine_filter: string;
  area_filter: string;
  created_at: string;
}

export interface InspirationCard {
  id: number;
  text: string;
  emoji: string;
  category?: string;
}

export interface AdminStats {
  total: number;
  active: number;
  areas: number;
  users: number;
  todayEvents: number;
  totalEvents: number;
  completions: number;
  deeplinks: number;
  topCuisines: { cuisine: string; n: number }[];
  topAreas: { area: string; n: number }[];
  topWinners: { restaurant_id: number; wins: number; name: string }[];
  recentEvents: { event_type: string; created_at: string; area?: string; game_type?: string }[];
  dailyTrend: { date: string; count: number }[];
}

export interface SocialStats {
  todayGames: number;
  totalGames: number;
  totalRestaurants: number;
}

export interface NearbyResult {
  restaurants: Restaurant[];
  meta: {
    total: number;
    returned: number;
    google_count: number;
    seed_count: number;
    location: { lat: number; lng: number };
    radius: number;
    area_detected: string | null;
  };
}

export interface NearbyArea {
  area: string;
  count: number;
  distance: number | null;
}

// ─── Safe Fetch Helper ──────────────────────────────────────────────────────
async function safeFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (res.status === 401) {
    // Clear both user and admin tokens on 401
    safeRemoveItem('local', 'fh_admin_token');
    safeRemoveItem('local', 'foodhunt_token');
    safeRemoveItem('local', 'foodhunt_user');
    throw new Error('Unauthorized — session expired');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const error = new Error(data.error?.message || data.error || `HTTP ${res.status}`);
    (error as any).status = res.status;
    (error as any).code = data.error?.code;
    throw error;
  }
  return res.json();
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// ─── Public API ─────────────────────────────────────────────────────────────
export const api = {
  getCatalog: (area?: string, cuisine?: string, limit = 16, signal?: AbortSignal): Promise<Restaurant[]> => {
    const p = new URLSearchParams();
    if (area) p.set('area', area);
    if (cuisine) p.set('cuisine', cuisine);
    p.set('limit', String(limit));
    return safeFetch(`${BASE}/catalog?${p}`, { signal });
  },

  getAreas: (): Promise<{ area: string; count: number }[]> =>
    safeFetch(`${BASE}/areas`),

  getCuisines: (area?: string): Promise<{ cuisine: string; count: number }[]> =>
    safeFetch(`${BASE}/cuisines${area ? `?area=${encodeURIComponent(area)}` : ''}`),

  getInspiration: (): Promise<InspirationCard> =>
    safeFetch(`${BASE}/inspiration`),

  getRestaurant: (id: number): Promise<Restaurant> =>
    safeFetch(`${BASE}/restaurants/${id}`),

  getSocialStats: (): Promise<SocialStats> =>
    safeFetch(`${BASE}/stats/social`),

  trackEvent: (event_type: string, extra?: Record<string, unknown>) => {
    ga4(event_type, extra || {});
    return fetch(`${BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type, session_id: getSessionId(), ...extra }),
    }).catch(() => {});
  },

  // ─── Nearby / Location-based ──────────────────────────────────────────────
  getNearby: (lat: number, lng: number, radius = 2000, limit = 16, cuisine?: string): Promise<NearbyResult> => {
    const p = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      radius: String(radius),
      limit: String(limit),
    });
    if (cuisine) p.set('cuisine', cuisine);
    return safeFetch(`${BASE}/nearby?${p}`);
  },

  getNearbyAreas: (lat?: number, lng?: number): Promise<NearbyArea[]> => {
    const p = new URLSearchParams();
    if (lat !== undefined && lng !== undefined) {
      p.set('lat', String(lat));
      p.set('lng', String(lng));
    }
    return safeFetch(`${BASE}/nearby/areas?${p}`);
  },

  saveNearbyRestaurant: (data: Partial<Restaurant>): Promise<Restaurant> =>
    safeFetch(`${BASE}/nearby/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  getScheduledTournaments: (): Promise<TournamentSlot[]> =>
    safeFetch(`${BASE}/tournaments/scheduled`),

  getActiveRestaurants: (time: string): Promise<{ restaurants: Restaurant[]; meta: any }> =>
    safeFetch(`${BASE}/restaurants/active?time=${encodeURIComponent(time)}`),
};

// ─── User API (requires JWT from user login) ────────────────────────────────
export const userApi = {
  getFavorites: (token: string): Promise<Restaurant[]> =>
    safeFetch(`${BASE}/user/favorites`, { headers: authHeaders(token) }),

  addFavorite: (token: string, restaurantId: number): Promise<{ ok: boolean }> =>
    safeFetch(`${BASE}/user/favorites`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ restaurant_id: restaurantId }),
    }),

  removeFavorite: (token: string, restaurantId: number): Promise<{ ok: boolean }> =>
    safeFetch(`${BASE}/user/favorites/${restaurantId}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }),

  getHistory: (token: string, limit = 20): Promise<any[]> =>
    safeFetch(`${BASE}/user/history?limit=${limit}`, { headers: authHeaders(token) }),

  saveHistory: (token: string, data: Record<string, any>): Promise<{ ok: boolean }> =>
    safeFetch(`${BASE}/user/history`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }),

  getRecommendation: (token: string, area?: string): Promise<{ restaurant: Restaurant }> =>
    safeFetch(`${BASE}/user/recommend${area ? `?area=${encodeURIComponent(area)}` : ''}`, {
      headers: authHeaders(token),
    }),
};

// ─── Auth API ───────────────────────────────────────────────────────────────
export const authApi = {
  register: (email: string, password: string, name: string): Promise<{ token: string; user: any }> =>
    safeFetch(`${BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string): Promise<{ token: string; user: any }> =>
    safeFetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),

  getProfile: (token: string): Promise<any> =>
    safeFetch(`${BASE}/auth/me`, { headers: authHeaders(token) }),

  updatePreferences: (token: string, prefs: Record<string, any>): Promise<any> =>
    safeFetch(`${BASE}/auth/me/preferences`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(prefs),
    }),
};

// ─── Admin API (requires admin token from legacy login) ─────────────────────
export const adminApi = {
  login: async (password: string): Promise<{ token: string }> =>
    safeFetch(`${BASE}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }),

  getRestaurants: async (token: string, page = 1, limit = 50): Promise<Restaurant[]> => {
    const data = await safeFetch<any>(`${BASE}/admin/restaurants?page=${page}&limit=${limit}`, { headers: authHeaders(token) });
    // Support both paginated response and legacy array response
    return Array.isArray(data) ? data : data.restaurants;
  },

  getStats: (token: string): Promise<AdminStats> =>
    safeFetch(`${BASE}/admin/stats`, { headers: authHeaders(token) }),

  createRestaurant: (token: string, data: Partial<Restaurant>): Promise<Restaurant> =>
    safeFetch(`${BASE}/admin/restaurants`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }),

  updateRestaurant: (token: string, id: number, data: Partial<Restaurant>): Promise<{ ok: boolean }> =>
    safeFetch(`${BASE}/admin/restaurants/${id}`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }),

  deleteRestaurant: (token: string, id: number): Promise<{ ok: boolean }> =>
    safeFetch(`${BASE}/admin/restaurants/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }),

  bulkImport: (token: string, restaurants: Partial<Restaurant>[]): Promise<{ imported: number }> =>
    safeFetch(`${BASE}/admin/restaurants/bulk`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ restaurants }),
    }),

  uploadImage: async (token: string, file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch(`${BASE}/admin/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    const data = await res.json();
    return data.url;
  },

  getCards: (token: string): Promise<InspirationCard[]> =>
    safeFetch(`${BASE}/admin/cards`, { headers: authHeaders(token) }),

  createCard: (token: string, data: { text: string; emoji: string; category: string }): Promise<InspirationCard> =>
    safeFetch(`${BASE}/admin/cards`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }),

  deleteCard: (token: string, id: number): Promise<{ ok: boolean }> =>
    safeFetch(`${BASE}/admin/cards/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }),

  getExportUrl: (type: 'events' | 'restaurants', format: 'json' | 'csv' = 'json'): string =>
    `${BASE}/admin/${type}/export?format=${format}`,

  searchByLocation: (token: string, lat: number, lng: number, radius = 2000): Promise<{ results: Restaurant[] }> =>
    safeFetch(`${BASE}/admin/restaurants/search-location`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ lat, lng, radius }),
    }),

  searchByQuery: (token: string, query: string): Promise<{ results: Restaurant[] }> =>
    safeFetch(`${BASE}/admin/restaurants/search-location`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ query }),
    }),

  // Export
  exportRestaurants: (token: string, format: 'json' | 'csv' = 'json'): Promise<any> =>
    safeFetch(`${BASE}/admin/restaurants/export?format=${format}`, { headers: authHeaders(token) }),

  exportEvents: (token: string, format: 'json' | 'csv' = 'json'): Promise<any> =>
    safeFetch(`${BASE}/admin/events/export?format=${format}`, { headers: authHeaders(token) }),

  // Users
  getUsers: (token: string): Promise<any[]> =>
    safeFetch(`${BASE}/admin/users`, { headers: authHeaders(token) }),

  deleteUser: (token: string, id: string): Promise<{ ok: boolean }> =>
    safeFetch(`${BASE}/admin/users/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }),

  // Districts
  getDistricts: (token: string): Promise<District[]> =>
    safeFetch(`${BASE}/admin/districts`, { headers: authHeaders(token) }),

  createDistrict: (token: string, name: string): Promise<District> =>
    safeFetch(`${BASE}/admin/districts`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ name, is_active: true }),
    }),

  toggleDistrict: (token: string, name: string, is_active: boolean): Promise<{ ok: boolean }> =>
    safeFetch(`${BASE}/admin/districts/${encodeURIComponent(name)}`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ is_active }),
    }),

  // Tournaments
  getTournaments: (token: string): Promise<Tournament[]> =>
    safeFetch(`${BASE}/admin/tournaments`, { headers: authHeaders(token) }),

  createTournament: (token: string, data: Omit<Tournament, 'id' | 'created_at'>): Promise<Tournament> =>
    safeFetch(`${BASE}/admin/tournaments`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }),
};
