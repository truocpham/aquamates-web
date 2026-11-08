import { expect, test } from '@playwright/test';

import { mockBackend, SUPABASE_URL } from './backend';

test.use({ locale: 'en-US' });

test('signed out: landing is public, other routes go to sign-in, magic link is requested', async ({ page }) => {
  const db = await mockBackend(page, false);
  await page.goto('/');
  await expect(page.getByText('Sign in').first()).toBeVisible();
  await page.goto('/history');
  await expect(page).toHaveURL(/\/sign-in/);
  await page.getByLabel('Email').fill('mai@example.com');
  await page.getByText('Email me a sign-in link').click();
  await expect(page.getByText(/We sent a sign-in link to mai@example.com/)).toBeVisible();
  expect(db.requests.some((u) => u.startsWith(`${SUPABASE_URL}/auth/v1/otp`))).toBe(true);
});

test('signed in: home lists events, RSVP is saved and shown', async ({ page }) => {
  const db = await mockBackend(page, true);
  await page.goto('/');
  await page.getByText('Sunday swim').click();
  await expect(page.getByText('Your RSVP')).toBeVisible();
  await page.getByText('RSVP Going').click();
  await expect(page.getByText('Mai Nguyen', { exact: true })).toBeVisible();
  expect(db.events[0].rsvps).toContainEqual({ user_id: 'u-me', status: 'going' });
});

test('signed in: create an event', async ({ page }) => {
  const db = await mockBackend(page, true);
  await page.goto('/event/new');
  await page.getByText('Swimming').first().click();
  await page.getByLabel('Title').fill('Friday social');
  await page.getByLabel('Description').fill('Drinks by the lake.');
  await page.getByLabel('Location').fill('West Lake');
  const d = new Date(Date.now() + 3 * 86_400_000);
  const p = (n: number) => String(n).padStart(2, '0');
  await page.getByLabel('Start time').fill(`${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T18:30`);
  await page.getByRole('button', { name: 'Create event' }).click();
  await expect(page).toHaveURL(/\/event\/ev-2/);
  await expect(page.getByText('Friday social').first()).toBeVisible();
  expect(db.events.at(-1)?.title).toBe('Friday social');
});

test('signed in: organizer sets cost, sees the split and uploads a bank QR', async ({ page }) => {
  const db = await mockBackend(page, true);
  await page.goto('/event/ev1');
  await page.getByLabel('Total cost').fill('600000');
  await page.getByRole('button', { name: 'Save cost' }).click();
  await expect(page.getByText(/Total: 600,000 VND/)).toBeVisible();
  await expect(page.getByText(/Each pays: 600,000 VND \(1 going\)/)).toBeVisible();

  await page.getByLabel('Payment instructions').fill('Transfer to Mai, 0123');
  const chooser = page.waitForEvent('filechooser');
  await page.getByText('Choose QR image').click();
  await (await chooser).setFiles({ name: 'qr.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgo=', 'base64') });
  await expect(page.getByText('QR image selected')).toBeVisible();
  await page.getByRole('button', { name: 'Save payment details' }).click();
  await expect(page.getByLabel('Bank QR')).toBeVisible();
  expect(db.expenses.ev1.instructions).toBe('Transfer to Mai, 0123');
});

test('no analytics or error-tracking requests: only the site and Supabase are contacted', async ({ page }) => {
  const db = await mockBackend(page, true);
  for (const path of ['/', '/event/ev1', '/history', '/dashboard', '/settings']) await page.goto(path);
  await page.waitForLoadState('networkidle');
  const hosts = new Set(db.requests.filter((u) => /^https?:/.test(u)).map((u) => new URL(u).host));
  expect([...hosts].filter((h) => !h.startsWith('localhost') && h !== new URL(SUPABASE_URL).host)).toEqual([]);
});
