export type HistoryEvent = {
  id: string;
  category: 'swimming' | 'beer_social';
  title: string;
  location: string | null;
  starts_at: string;
  cancelled_at: string | null;
  creator_id: string;
  rsvps: { user_id: string; status: 'going' | 'maybe' | 'not_going' }[];
};
export type HistoryRow = HistoryEvent & { status: 'cancelled' | 'going' | 'maybe' | 'created' };

/** Past events the member created or RSVP'd going/maybe to, newest first. Cancelled shows as cancelled. */
export function toHistory(events: HistoryEvent[], userId: string): HistoryRow[] {
  const rows: HistoryRow[] = [];
  for (const e of events) {
    const mine = e.rsvps.find((r) => r.user_id === userId)?.status;
    if (mine === 'not_going' && e.creator_id !== userId) continue;
    const joined = mine === 'going' || mine === 'maybe' ? mine : null;
    if (!joined && e.creator_id !== userId) continue;
    rows.push({ ...e, status: e.cancelled_at ? 'cancelled' : (joined ?? 'created') });
  }
  return rows.sort((a, b) => b.starts_at.localeCompare(a.starts_at));
}
