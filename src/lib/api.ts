// Base URL of the Go API (see .env.local). Production builds default to the
// same origin, where next.config.ts forwards /api and /uploads to BACKEND_URL.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? (process.env.NODE_ENV === "production" ? "" : "http://localhost:8080");

export type IssueStatus = "reported" | "assigned" | "in_progress" | "resolved" | "rejected";

export type DashboardData = {
  stats: {
    total: number;
    reported: number;
    inProgress: number;
    resolved: number;
    avgResolutionHours: number | null;
  };
  categories: { slug: string; name: string; description: string; icon: string; issueCount: number }[];
  recentIssues: {
    id: number;
    title: string;
    category: string;
    status: IssueStatus;
    address: string;
    createdAt: string;
  }[];
  /** Last 14 days, oldest first. */
  trend: { date: string; reported: number; resolved: number }[];
  /** Areas with the most reports (recurring hotspots). */
  topAreas: { area: string; count: number }[];
  activity: { issueId: number; title: string; address: string; type: "reported" | "resolved"; at: string }[];
  updatedAt: string;
};

export type Health = { status: string; database: "up" | "down" };

export type MapDefault = { name: string; lat: number; lng: number };

export type MapIssue = {
  id: number;
  title: string;
  category: string;
  categorySlug: string;
  createdAt: string;
  status: IssueStatus;
  address: string;
  lat: number;
  lng: number;
};

export type Place = { area: string; city: string; state: string; displayName: string };

export type SearchResult = { name: string; displayName: string; lat: number; lng: number };

/** Filters for the public dashboard and map. Empty = everything, city-wide. */
export type DashboardFilter = {
  area?: { lat: number; lng: number; radiusKm: number } | null;
  statuses?: ("reported" | "progress" | "resolved")[];
  category?: string;
  sinceDays?: number;
};

function filterQuery(f: DashboardFilter = {}): string {
  const p = new URLSearchParams();
  if (f.area) {
    p.set("lat", f.area.lat.toFixed(5));
    p.set("lng", f.area.lng.toFixed(5));
    p.set("radiusKm", String(f.area.radiusKm));
  }
  if (f.statuses && f.statuses.length > 0 && f.statuses.length < 3) p.set("status", f.statuses.join(","));
  if (f.category) p.set("category", f.category);
  if (f.sinceDays) p.set("sinceDays", String(f.sinceDays));
  const q = p.toString();
  return q ? `?${q}` : "";
}

export type OfficialMessage = {
  id: number;
  name: string;
  designation: string;
  office: string;
  message: string;
  isSample: boolean;
};

export type ContactInput = { name: string; email: string; subject: string; message: string };

export type Category = { slug: string; name: string; description: string; icon: string };

export type CreatedIssue = {
  id: number;
  trackingCode: string;
  status: IssueStatus;
  category: string;
  title: string;
  address: string;
  photoUrls: string[];
  createdAt: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

/** Calls the CivicFix API. Sends the staff session cookie; throws ApiError on failure. */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      // JSON bodies need the header; FormData sets its own multipart boundary.
      headers: typeof init?.body === "string" ? { "Content-Type": "application/json", ...init?.headers } : init?.headers,
    });
  } catch {
    throw new ApiError("Cannot reach the CivicFix server. Is the backend running?", 0);
  }

  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok && !(res.status === 503 && path === "/api/health")) {
    throw new ApiError(body.error ?? `Request failed (${res.status})`, res.status, body.fields ?? {});
  }
  return body as T;
}

export const api = {
  health: () => request<Health>("/api/health"),
  dashboard: (f?: DashboardFilter) => request<DashboardData>(`/api/dashboard${filterQuery(f)}`),
  mapDefault: () => request<MapDefault>("/api/map/default"),
  mapIssues: () => request<MapIssue[]>("/api/map/issues"),
  searchPlaces: (q: string) => request<SearchResult[]>(`/api/geo/search?q=${encodeURIComponent(q)}`),
  reverseGeocode: (lat: number, lng: number) => request<Place>(`/api/geo/reverse?lat=${lat}&lng=${lng}`),
  officialMessages: () => request<OfficialMessage[]>("/api/officials/messages"),
  sendContact: (input: ContactInput) =>
    request<{ id: number; message: string }>("/api/contact", { method: "POST", body: JSON.stringify(input) }),
  categories: () => request<Category[]>("/api/categories"),
  /** Multipart form: category, name, phone, aadhaar, description, address, area, lat, lng, consent, photo. */
  submitIssue: (form: FormData) => request<CreatedIssue>("/api/issues", { method: "POST", body: form }),
};
