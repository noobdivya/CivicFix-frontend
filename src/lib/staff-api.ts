// Staff, admin, tracking and notification endpoints of the CivicFix API.
import { request, type IssueStatus } from "./api";

export type Role = "admin" | "department" | "worker";
export type Priority = "low" | "medium" | "high" | "critical";
export const PRIORITIES: Priority[] = ["critical", "high", "medium", "low"];

export type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
  departmentId: number | null;
  departmentName: string | null;
};

export type Person = { id: number; name: string };

export type StaffIssue = {
  id: number;
  trackingCode: string | null;
  title: string;
  category: string;
  categorySlug: string;
  status: IssueStatus;
  priority: Priority;
  reviewed: boolean;
  address: string;
  area: string;
  departmentId: number | null;
  departmentName: string | null;
  worker: Person | null;
  createdAt: string;
  dueAt: string | null;
  overdue: boolean;
  photoUrl: string | null;
};

export type Photo = { url: string; kind: "report" | "completion"; createdAt: string };

export type IssueEvent = {
  id: number;
  type: string;
  fromStatus: string | null;
  toStatus: string | null;
  message: string;
  isPublic: boolean;
  actorName: string;
  actorRole: string;
  createdAt: string;
};

export type IssueDetail = StaffIssue & {
  description: string;
  lat: number | null;
  lng: number | null;
  reviewedAt: string | null;
  assignedAt: string | null;
  startedAt: string | null;
  resolvedAt: string | null;
  rejectionReason: string | null;
  reporter: { name: string | null; phone: string | null } | null;
  photos: Photo[];
  events: IssueEvent[];
};

export type Summary = {
  new: number;
  pending: number;
  assigned: number;
  inProgress: number;
  resolved: number;
  resolvedThisWeek: number;
  rejected: number;
  overdue: number;
  critical: number;
  avgResolutionHours: number | null;
};

export type Worker = {
  id: number;
  name: string;
  phone: string;
  departmentId: number | null;
  departmentName: string;
  activeTasks: number;
};

export type Department = { id: number; slug: string; name: string; description: string; categories: string[] };

export type IssueFilters = {
  status?: string;
  priority?: string;
  category?: string;
  departmentId?: string;
  overdue?: boolean;
  q?: string;
  sort?: "newest" | "priority";
  limit?: number;
  offset?: number;
};

export type Notification = {
  id: number;
  issueId: number | null;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export type StaffUser = User & { active: boolean; createdAt: string; lastLoginAt: string | null; openTasks: number };

export type UserInput = Partial<{
  name: string;
  email: string;
  phone: string;
  role: Role;
  departmentId: number;
  password: string;
  active: boolean;
}>;

export type Analytics = {
  departments: {
    id: number;
    name: string;
    total: number;
    open: number;
    overdue: number;
    resolved: number;
    avgResolutionHours: number | null;
    officers: number;
    workers: number;
  }[];
  categories: { name: string; total: number; resolved: number; avgResolutionHours: number | null }[];
  hotspots: { area: string; category: string; count: number; open: number; lastReportedAt: string }[];
  workers: {
    id: number;
    name: string;
    department: string;
    active: number;
    resolved: number;
    avgResolutionHours: number | null;
  }[];
};

export type TrackedIssue = {
  trackingCode: string;
  title: string;
  description: string;
  category: string;
  categoryIcon: string;
  status: IssueStatus;
  priority: Priority | null;
  department: string | null;
  address: string;
  lat: number | null;
  lng: number | null;
  reporterName: string;
  createdAt: string;
  reviewedAt: string | null;
  assignedAt: string | null;
  startedAt: string | null;
  resolvedAt: string | null;
  dueAt: string | null;
  resolutionHours: number | null;
  rejectionReason: string | null;
  photos: Photo[];
  timeline: IssueEvent[];
};

const json = (body: unknown): RequestInit => ({ method: "POST", body: JSON.stringify(body) });

function query(f: IssueFilters): string {
  const p = new URLSearchParams();
  if (f.status) p.set("status", f.status);
  if (f.priority) p.set("priority", f.priority);
  if (f.category) p.set("category", f.category);
  if (f.departmentId) p.set("departmentId", f.departmentId);
  if (f.overdue) p.set("overdue", "1");
  if (f.q) p.set("q", f.q);
  if (f.sort === "priority") p.set("sort", "priority");
  if (f.limit) p.set("limit", String(f.limit));
  if (f.offset) p.set("offset", String(f.offset));
  return p.toString();
}

export const authApi = {
  me: () => request<User | null>("/api/auth/me"),
  login: (email: string, password: string) => request<User>("/api/auth/login", json({ email, password })),
  logout: () => request<void>("/api/auth/logout", { method: "POST" }),
};

export const staffApi = {
  summary: () => request<Summary>("/api/staff/summary"),
  issues: (f: IssueFilters) => request<{ items: StaffIssue[]; total: number }>(`/api/staff/issues?${query(f)}`),
  issue: (id: number) => request<IssueDetail>(`/api/staff/issues/${id}`),
  workers: (departmentId?: number | null) =>
    request<Worker[]>(`/api/staff/workers${departmentId ? `?departmentId=${departmentId}` : ""}`),
  departments: () => request<Department[]>("/api/staff/departments"),

  review: (id: number, priority: Priority, workerId?: number) =>
    request<IssueDetail>(`/api/staff/issues/${id}/review`, json({ priority, workerId })),
  assign: (id: number, workerId: number) => request<IssueDetail>(`/api/staff/issues/${id}/assign`, json({ workerId })),
  reject: (id: number, reason: string) => request<IssueDetail>(`/api/staff/issues/${id}/reject`, json({ reason })),
  reopen: (id: number, reason: string) => request<IssueDetail>(`/api/staff/issues/${id}/reopen`, json({ reason })),
  priority: (id: number, priority: Priority) => request<IssueDetail>(`/api/staff/issues/${id}/priority`, json({ priority })),
  transfer: (id: number, departmentId: number) =>
    request<IssueDetail>(`/api/staff/issues/${id}/transfer`, json({ departmentId })),
  start: (id: number) => request<IssueDetail>(`/api/staff/issues/${id}/start`, { method: "POST" }),
  note: (id: number, message: string, isPublic: boolean) =>
    request<IssueDetail>(`/api/staff/issues/${id}/notes`, json({ message, public: isPublic })),
  resolve: (id: number, form: FormData) =>
    request<IssueDetail>(`/api/staff/issues/${id}/resolve`, { method: "POST", body: form }),
};

export const notificationApi = {
  list: () => request<{ items: Notification[]; unread: number }>("/api/notifications"),
  read: (ids: number[] | "all") =>
    request<void>("/api/notifications/read", json(ids === "all" ? { all: true } : { ids })),
};

export const adminApi = {
  users: () => request<StaffUser[]>("/api/admin/users"),
  createUser: (input: UserInput) => request<{ id: number }>("/api/admin/users", json(input)),
  updateUser: (id: number, input: UserInput) =>
    request<void>(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  analytics: () => request<Analytics>("/api/admin/analytics"),
};

export const trackApi = {
  track: (code: string, phone: string) =>
    request<TrackedIssue>(`/api/track?code=${encodeURIComponent(code)}&phone=${encodeURIComponent(phone)}`),
};

/** Where each role's portal lives. */
export const portalPath: Record<Role, string> = {
  admin: "/admin",
  department: "/department",
  worker: "/worker",
};

/** Link to an issue inside the given role's portal. */
export function issuePath(role: Role, id: number): string {
  if (role === "worker") return `/worker/tasks/${id}`;
  return `${portalPath[role]}/issues/${id}`;
}
