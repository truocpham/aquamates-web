import type { Page, Route } from '@playwright/test';

/**
 * In-memory stand-in for Supabase, answered inside the browser with page.route so the tests run
 * against the real static build with no network. The build must use SUPABASE_URL (see e2e:build).
 * "Test login" is a pre-seeded session in localStorage, the same place supabase-js keeps a real one.
 */
export const SUPABASE_URL = 'https://e2e.supabase.co';
export const ME = { id: 'u-me', name: 'Mai Nguyen' };
const DAY = 86_400_000;

type Rsvp = { user_id: string; status: string };
type Ev = { id: string; creator_id: string; category: string; title: string; description: string; location: string; starts_at: string; notes: string | null; cancelled_at: string | null; rsvps: Rsvp[] };
type Expense = { event_id: string; total_cost?: number; instructions?: string | null; qr_path?: string };

const names: Record<string, string> = { [ME.id]: ME.name, 'u-lan': 'Lan Tran' };
const event = (id: string, title: string, days: number, rsvps: Rsvp[]): Ev => ({
  id, creator_id: ME.id, category: 'swimming', title, description: 'Laps and a cold drink after.', location: 'City pool, Hanoi',
  starts_at: new Date(Date.now() + days * DAY).toISOString(), notes: null, cancelled_at: null, rsvps,
});

export function seed() {
  return {
    events: [
      event('ev1', 'Sunday swim', 7, [{ user_id: 'u-lan', status: 'going' }]),
      event('ev-past', 'Last month swim', -30, [{ user_id: ME.id, status: 'going' }, { user_id: 'u-lan', status: 'maybe' }]),
    ],
    expenses: {} as Record<string, Expense>,
    requests: [] as string[],
  };
}
export type Backend = ReturnType<typeof seed>;

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, headers: cors, contentType: 'application/json', body: JSON.stringify(body) });

const withProfiles = (e: Ev) => ({
  ...e,
  creator: { display_name: names[e.creator_id] },
  rsvps: e.rsvps.map((r) => ({ ...r, profile: { display_name: names[r.user_id] ?? 'Member', avatar_url: null } })),
});

export async function mockBackend(page: Page, signedIn: boolean): Promise<Backend> {
  const db = seed();
  page.on('request', (r) => db.requests.push(r.url()));
  if (signedIn) {
    await page.addInitScript(
      ([key, user]) => {
        const exp = Math.floor(Date.now() / 1000) + 86_400 * 365;
        localStorage.setItem(
          key,
          JSON.stringify({ access_token: 'e2e', refresh_token: 'e2e', token_type: 'bearer', expires_in: 31_536_000, expires_at: exp, user: { id: user, aud: 'authenticated', email: 'mai@example.com', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' } }),
        );
      },
      ['sb-e2e-auth-token', ME.id],
    );
  }
  await page.route(`${SUPABASE_URL}/**`, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const q = url.searchParams;
    const path = url.pathname;
    const method = req.method();
    const wantsObject = (req.headers()['accept'] ?? '').includes('vnd.pgrst.object');
    const body = () => req.postDataJSON();
    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    if (path.startsWith('/auth/v1/otp')) return json(route, {});
    if (path === '/rest/v1/rpc/my_membership') return json(route, [{ role: 'admin', status: 'active' }]);
    if (path === '/rest/v1/rpc/club_exists') return json(route, true);
    if (path === '/rest/v1/rpc/list_members')
      return json(route, [
        { user_id: ME.id, display_name: ME.name, avatar_url: null, role: 'admin', status: 'active' },
        { user_id: 'u-lan', display_name: names['u-lan'], avatar_url: null, role: 'member', status: 'active' },
      ]);
    if (path === '/rest/v1/profiles') return json(route, { display_name: ME.name, avatar_url: null });
    if (path === '/rest/v1/events') {
      if (method === 'POST') {
        const b = body();
        const created: Ev = { ...b, id: `ev-${db.events.length}`, cancelled_at: null, rsvps: [] };
        db.events.push(created);
        return json(route, { id: created.id }, 201);
      }
      if (method === 'PATCH') {
        const e = db.events.find((x) => `eq.${x.id}` === q.get('id'));
        Object.assign(e ?? {}, body());
        return route.fulfill({ status: 204, headers: cors });
      }
      const id = q.get('id');
      if (id) {
        const e = db.events.find((x) => `eq.${x.id}` === id);
        return e ? json(route, withProfiles(e)) : json(route, { code: 'PGRST116' }, 406);
      }
      const future = (q.get('starts_at') ?? '').startsWith('gte.');
      const rows = db.events.filter((e) => (new Date(e.starts_at) > new Date()) === future && (!future || !e.cancelled_at));
      return json(route, rows.map(withProfiles));
    }
    if (path === '/rest/v1/rsvps') {
      const b = body();
      const e = db.events.find((x) => x.id === b.event_id)!;
      e.rsvps = [...e.rsvps.filter((r) => r.user_id !== b.user_id), { user_id: b.user_id, status: b.status }];
      return route.fulfill({ status: 201, headers: cors });
    }
    if (path === '/rest/v1/expenses') {
      const id = (q.get('event_id') ?? '').replace('eq.', '');
      if (method === 'GET') {
        const row = db.expenses[id];
        if (!wantsObject) return json(route, row ? [row] : []);
        return row ? json(route, row) : json(route, { code: 'PGRST116', message: 'The result contains 0 rows' }, 406);
      }
      const b = body();
      const eid = method === 'PATCH' ? id : b.event_id;
      db.expenses[eid] = { ...db.expenses[eid], event_id: eid, ...b };
      return route.fulfill({ status: method === 'PATCH' ? 204 : 201, headers: cors });
    }
    if (path.startsWith('/storage/v1/object/sign/')) {
      if (method === 'POST') return json(route, { signedURL: `${path.replace('/storage/v1', '')}?token=e2e` });
      return route.fulfill({ status: 200, headers: cors, contentType: 'image/png', body: png });
    }
    if (path.startsWith('/storage/v1/object/')) return json(route, { Key: 'qr/x' });
    return json(route, { message: `unmocked ${method} ${path}` }, 404);
  });
  return db;
}
