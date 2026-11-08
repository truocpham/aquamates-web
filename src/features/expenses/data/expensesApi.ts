import { t } from '@/shared/i18n';
import { loadSupabase } from '@/shared/lazySupabase';

/** Returns null when no cost is set or the caller may not see it (RLS). */
export async function fetchTotal(eventId: string): Promise<number | null> {
  const { data, error } = await (await loadSupabase()).from('expenses').select('total_cost').eq('event_id', eventId).maybeSingle();
  if (error) throw new Error(t('error.cost'));
  return data ? Number(data.total_cost) : null;
}

export type Payment = { qrUrl: string | null; instructions: string | null };

/** Null when the caller may not see the expense (RLS); the QR file is gated the same way by storage policy. */
export async function fetchPayment(eventId: string): Promise<Payment | null> {
  const supabase = await loadSupabase();
  const { data, error } = await supabase.from('expenses').select('qr_path, instructions').eq('event_id', eventId).maybeSingle();
  if (error) throw new Error(t('error.payment'));
  if (!data) return null;
  let qrUrl: string | null = null;
  if (data.qr_path) {
    const signed = await supabase.storage.from('qr').createSignedUrl(data.qr_path, 300);
    qrUrl = signed.data?.signedUrl ?? null;
  }
  return { qrUrl, instructions: data.instructions };
}

/** Updates an existing expense row (cost must be set first); uploads the QR image when given. */
export async function savePayment(eventId: string, instructions: string, image?: File): Promise<void> {
  const fail = new Error(t('error.savePayment'));
  const supabase = await loadSupabase();
  const patch: { instructions: string | null; qr_path?: string } = { instructions: instructions.trim() || null };
  if (image) {
    const path = `${eventId}/qr`;
    const up = await supabase.storage.from('qr').upload(path, image, { upsert: true, contentType: image.type });
    if (up.error) throw fail;
    patch.qr_path = path;
  }
  const { error } = await supabase.from('expenses').update(patch).eq('event_id', eventId);
  if (error) throw fail;
}

export async function saveTotal(eventId: string, total: number): Promise<void> {
  const { error } = await (await loadSupabase()).from('expenses').upsert({ event_id: eventId, total_cost: total });
  if (error) throw new Error(t('error.saveCost'));
}
