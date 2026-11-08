export const splitShare = (total: number, going: number): number => Math.ceil(total / Math.max(going, 1));

/** Whole VND only: digits, no sign or decimals. Returns null if invalid. */
export const parseTotal = (s: string): number | null => (/^\d{1,12}$/.test(s.trim()) ? Number(s.trim()) : null);
