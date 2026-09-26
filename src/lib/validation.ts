// Client-side checks that mirror the backend (internal/validate). The server
// always re-validates; these just give instant feedback.

const D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 0, 6, 7, 8, 9, 5], [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7], [4, 0, 1, 2, 3, 9, 5, 6, 7, 8], [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2], [7, 6, 5, 9, 8, 2, 1, 0, 4, 3], [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];
const P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 5, 7, 6, 2, 8, 3, 0, 9, 4], [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7], [9, 4, 5, 3, 1, 2, 6, 8, 7, 0], [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5], [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

export const digitsOnly = (s: string) => s.replace(/\D/g, "");

/** 12 digits, not starting with 0/1, valid Verhoeff checksum. Format check only. */
export function isValidAadhaar(input: string): boolean {
  const d = digitsOnly(input);
  if (!/^[2-9]\d{11}$/.test(d)) return false;
  let c = 0;
  for (let i = 0; i < d.length; i++) c = D[c][P[i % 8][Number(d[d.length - 1 - i])]];
  return c === 0;
}

/** "234123412346" → "2341 2341 2346" (while typing too). */
export function formatAadhaar(input: string): string {
  return digitsOnly(input).slice(0, 12).replace(/(\d{4})(?=\d)/g, "$1 ");
}

/** Accepts +91 / 0 prefixes, spaces and dashes. Returns the 10 digits or null. */
export function normalizeIndianMobile(input: string): string | null {
  const m = input.replace(/[\s\-()]/g, "").match(/^(?:\+?91|0)?([6-9]\d{9})$/);
  return m ? m[1] : null;
}
