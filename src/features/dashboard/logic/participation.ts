import type { PastEvent } from './totals';

export type Period = 'week' | 'month' | 'quarter' | 'year';

/** Local start of the period containing d; weeks start Monday. */
export function periodStart(d: Date, p: Period): Date {
  const y = d.getFullYear();
  const m = d.getMonth();
  if (p === 'year') return new Date(y, 0, 1);
  if (p === 'quarter') return new Date(y, m - (m % 3), 1);
  if (p === 'month') return new Date(y, m, 1);
  return new Date(y, m, d.getDate() - ((d.getDay() + 6) % 7));
}

function shift(s: Date, p: Period, n: number): Date {
  const y = s.getFullYear();
  const m = s.getMonth();
  if (p === 'week') return new Date(y, m, s.getDate() + 7 * n);
  const months = p === 'month' ? n : p === 'quarter' ? 3 * n : 12 * n;
  return new Date(y, m + months, 1);
}

/** Events the user attended (going, past, not cancelled) per period, oldest first, ending at the current period. */
export function computeParticipation(events: PastEvent[], userId: string, p: Period, now = new Date(), count = 6) {
  const cur = periodStart(now, p);
  return Array.from({ length: count }, (_, i) => {
    const start = shift(cur, p, i - (count - 1));
    const end = shift(start, p, 1);
    const n = events.filter((e) => {
      const t = new Date(e.starts_at);
      return (
        !e.cancelled_at &&
        t <= now &&
        t >= start &&
        t < end &&
        e.rsvps.some((r) => r.user_id === userId && r.status === 'going')
      );
    }).length;
    return { start: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`, count: n };
  });
}
