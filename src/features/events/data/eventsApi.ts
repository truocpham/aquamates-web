import { t } from '@/shared/i18n';
import { loadSupabase } from '@/shared/lazySupabase';

import { parseStart, type EventForm } from '../logic/eventForm';
import type { EventRow } from '../logic/upcoming';

export async function fetchUpcoming(): Promise<EventRow[]> {
  const { data, error } = await (await loadSupabase())
    .from('events')
    .select('id, category, title, location, starts_at')
    .is('cancelled_at', null)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true });
  if (error) throw new Error(t('error.events'));
  return data as EventRow[];
}

export type EventDetail = {
  id: string;
  creator_id: string;
  category: 'swimming' | 'beer_social';
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  notes: string | null;
  cancelled_at: string | null;
  creator: { display_name: string } | null;
  rsvps: { user_id: string; status: 'going' | 'maybe' | 'not_going'; profile: { display_name: string; avatar_url: string | null } | null }[];
};

export async function fetchEvent(id: string): Promise<EventDetail> {
  const { data, error } = await (await loadSupabase())
    .from('events')
    .select(
      'id, category, title, description, location, starts_at, notes, cancelled_at, creator_id, creator:profiles!events_creator_id_fkey(display_name), rsvps(user_id, status, profile:profiles(display_name, avatar_url))',
    )
    .eq('id', id)
    .single();
  if (error || !data) throw new Error(t('error.event'));
  return data as unknown as EventDetail;
}

export async function createEvent(f: EventForm, creatorId: string): Promise<string> {
  const { data, error } = await (await loadSupabase())
    .from('events')
    .insert({
      creator_id: creatorId,
      category: f.category,
      title: f.title.trim(),
      description: f.description.trim(),
      location: f.location.trim(),
      starts_at: parseStart(f.startsAt)?.toISOString(),
      notes: f.notes.trim() || null,
    })
    .select('id')
    .single();
  if (error || !data) throw new Error(t('error.createEvent'));
  return data.id as string;
}

export async function updateEvent(id: string, f: EventForm): Promise<void> {
  const { error } = await (await loadSupabase())
    .from('events')
    .update({
      category: f.category,
      title: f.title.trim(),
      description: f.description.trim(),
      location: f.location.trim(),
      starts_at: parseStart(f.startsAt)?.toISOString(),
      notes: f.notes.trim() || null,
    })
    .eq('id', id);
  if (error) throw new Error(t('error.updateEvent'));
}

export async function setRsvp(eventId: string, userId: string, status: 'going' | 'maybe' | 'not_going'): Promise<void> {
  const { error } = await (await loadSupabase())
    .from('rsvps')
    .upsert({ event_id: eventId, user_id: userId, status, updated_at: new Date().toISOString() });
  if (error) throw new Error(t('error.rsvp'));
}

export async function cancelEvent(eventId: string): Promise<void> {
  const { error } = await (await loadSupabase()).from('events').update({ cancelled_at: new Date().toISOString() }).eq('id', eventId);
  if (error) throw new Error(t('error.cancelEvent'));
}
