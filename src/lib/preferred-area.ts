/** The viewer's chosen area for the landing dashboard, remembered in this browser. */
export type PreferredArea = { name: string; lat: number; lng: number; radiusKm: number };

export const DEFAULT_RADIUS_KM = 15;
export const RADIUS_OPTIONS = [5, 10, 15, 25];

const KEY = "civicfix.preferredArea";

export function loadPreferredArea(): PreferredArea | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const a = JSON.parse(raw) as PreferredArea;
    if (typeof a.lat !== "number" || typeof a.lng !== "number" || typeof a.name !== "string") return null;
    return { ...a, radiusKm: RADIUS_OPTIONS.includes(a.radiusKm) ? a.radiusKm : DEFAULT_RADIUS_KM };
  } catch {
    return null;
  }
}

export function savePreferredArea(area: PreferredArea | null): void {
  try {
    if (area) localStorage.setItem(KEY, JSON.stringify(area));
    else localStorage.removeItem(KEY);
  } catch {
    // Storage unavailable (private mode) — the choice still applies for this visit.
  }
}
