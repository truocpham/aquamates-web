export type Category = 'swimming' | 'beer_social';
export type EventRow = { id: string; category: Category; title: string; location: string | null; starts_at: string };
export type Chip = 'all' | Category;

/** Labels come from t(`filter.${key}`). */
export const CHIPS: { key: Chip }[] = [{ key: 'all' }, { key: 'swimming' }, { key: 'beer_social' }];

export const filterUpcoming = <T extends EventRow>(rows: T[], chip: Chip) =>
  rows.filter((r) => chip === 'all' || r.category === chip);
