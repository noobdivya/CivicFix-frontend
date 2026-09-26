// Client-side checks that mirror the backend (internal/validate). The server
// always re-validates; these just give instant feedback.

/** Accepts +91 / 0 prefixes, spaces and dashes. Returns the 10 digits or null. */
export function normalizeIndianMobile(input: string): string | null {
  const m = input.replace(/[\s\-()]/g, "").match(/^(?:\+?91|0)?([6-9]\d{9})$/);
  return m ? m[1] : null;
}
