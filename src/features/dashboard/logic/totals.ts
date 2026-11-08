export type PastEvent = {
  category: 'swimming' | 'beer_social';
  starts_at: string;
  cancelled_at: string | null;
  rsvps: { user_id: string; status: 'going' | 'maybe' | 'not_going' }[];
};

/** Totals over past, non-cancelled events; attended = the user's RSVP is going. */
export function computeTotals(events: PastEvent[], userId: string, now = new Date()) {
  const past = events.filter((e) => !e.cancelled_at && new Date(e.starts_at) <= now);
  return {
    swimming: past.filter((e) => e.category === 'swimming').length,
    beerSocial: past.filter((e) => e.category === 'beer_social').length,
    attended: past.filter((e) => e.rsvps.some((r) => r.user_id === userId && r.status === 'going')).length,
  };
}
