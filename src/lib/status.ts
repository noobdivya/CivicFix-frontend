import type { IssueStatus } from "./api";
import type { Theme } from "./theme";

/** The three lifecycle groups shown on the dashboard, map layers and charts. */
export type StatusGroup = "reported" | "progress" | "resolved";

export const statusGroups: { key: StatusGroup; label: string; dotClass: string; cssVar: string }[] = [
  { key: "reported", label: "Reported", dotClass: "bg-st-reported", cssVar: "var(--st-reported)" },
  { key: "progress", label: "In progress", dotClass: "bg-st-progress", cssVar: "var(--st-progress)" },
  { key: "resolved", label: "Resolved", dotClass: "bg-st-resolved", cssVar: "var(--st-resolved)" },
];

export function groupOf(status: IssueStatus): StatusGroup | null {
  if (status === "reported") return "reported";
  if (status === "assigned" || status === "in_progress") return "progress";
  if (status === "resolved") return "resolved";
  return null;
}

export const statusLabel: Record<IssueStatus, string> = {
  reported: "Reported",
  assigned: "Assigned",
  in_progress: "In progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

/** Hex values for places CSS variables can't reach (Leaflet SVG attributes). Keep in sync with globals.css. */
const hex: Record<Theme, Record<StatusGroup, string>> = {
  light: { reported: "#eda100", progress: "#2a78d6", resolved: "#0ca30c" },
  dark: { reported: "#c98500", progress: "#3987e5", resolved: "#0ca30c" },
};

export function statusHex(status: IssueStatus, theme: Theme): string {
  const g = groupOf(status);
  return g ? hex[theme][g] : "#6b7c94";
}

export function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.floor(minutes)}m ago`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function formatHours(hours: number | null): string {
  if (hours === null) return "—";
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 24) return `${Math.round(hours)} h`;
  return `${(hours / 24).toFixed(1)} days`;
}
