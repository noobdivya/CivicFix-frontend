// Base URL of the Go API (see .env.local).
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

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

export type OfficialMessage = {
  id: number;
  name: string;
  designation: string;
  office: string;
  message: string;
  isSample: boolean;
};

export type ContactInput = { name: string; email: string; subject: string; message: string };

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError("Cannot reach the CivicFix server. Is the backend running?", 0);
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok && !(res.status === 503 && path === "/api/health")) {
    throw new ApiError(body.error ?? `Request failed (${res.status})`, res.status, body.fields ?? {});
  }
  return body as T;
}

export const api = {
  health: () => request<Health>("/api/health"),
  dashboard: () => request<DashboardData>("/api/dashboard"),
  mapDefault: () => request<MapDefault>("/api/map/default"),
  mapIssues: () => request<MapIssue[]>("/api/map/issues"),
  reverseGeocode: (lat: number, lng: number) => request<Place>(`/api/geo/reverse?lat=${lat}&lng=${lng}`),
  officialMessages: () => request<OfficialMessage[]>("/api/officials/messages"),
  sendContact: (input: ContactInput) =>
    request<{ id: number; message: string }>("/api/contact", { method: "POST", body: JSON.stringify(input) }),
};
