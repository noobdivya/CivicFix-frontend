export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** "in 2 days", "3 h overdue" — relative to now. */
export function dueLabel(iso: string): string {
  const diffH = (new Date(iso).getTime() - Date.now()) / 3_600_000;
  const abs = Math.abs(diffH);
  const text = abs < 1 ? "under 1 h" : abs < 48 ? `${Math.round(abs)} h` : `${Math.round(abs / 24)} days`;
  return diffH >= 0 ? `due in ${text}` : `${text} overdue`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
