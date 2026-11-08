import { t } from '@/shared/i18n';

export type Category = 'swimming' | 'beer_social';
/** Labels come from t(`category.${value}`). */
export const CATEGORIES: { value: Category }[] = [{ value: 'swimming' }, { value: 'beer_social' }];
/** Mirrors the CHECK constraints in supabase/migrations/20261028010000_event_limits.sql */
export const LIMITS = { title: 120, description: 2000, location: 200, notes: 2000 } as const;
export type EventForm = { category: Category | null; title: string; description: string; location: string; startsAt: string; notes: string };
export const emptyForm: EventForm = { category: null, title: '', description: '', location: '', startsAt: '', notes: '' };

/** Parses "YYYY-MM-DD HH:mm" as device-local time; null when malformed. */
export function parseStart(text: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/.exec(text.trim());
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const date = new Date(y, mo - 1, d, h, mi);
  const ok = date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d && h < 24 && mi < 60;
  return ok ? date : null;
}

const pad = (n: number) => String(n).padStart(2, '0');
/** Maps a stored event to form values; start is shown in device-local time. */
export function toForm(e: { category: Category; title: string; description: string | null; location: string | null; starts_at: string; notes: string | null }): EventForm {
  const d = new Date(e.starts_at);
  return {
    category: e.category,
    title: e.title,
    description: e.description ?? '',
    location: e.location ?? '',
    startsAt: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`,
    notes: e.notes ?? '',
  };
}

export type FormErrors = Partial<Record<keyof EventForm, string>>;

export function validate(f: EventForm, now = new Date()): FormErrors {
  const e: FormErrors = {};
  if (!f.category) e.category = t('form.err.category');
  if (!f.title.trim()) e.title = t('form.err.title');
  if (!f.description.trim()) e.description = t('form.err.description');
  if (!f.location.trim()) e.location = t('form.err.location');
  const start = parseStart(f.startsAt);
  if (!start) e.startsAt = t('form.err.startsAtFormat');
  else if (start <= now) e.startsAt = t('form.err.startsAtPast');
  return e;
}
