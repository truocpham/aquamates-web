import { secureStoreAdapter as store } from './secureStorage';

const mockMem = new Map<string, string>();
jest.mock('expo-secure-store', () => ({
  getItemAsync: async (k: string) => mockMem.get(k) ?? null,
  setItemAsync: async (k: string, v: string) => void mockMem.set(k, v),
  deleteItemAsync: async (k: string) => void mockMem.delete(k),
}));

beforeEach(() => mockMem.clear());

test('round-trips a large value in several chunks', async () => {
  const v = 'a'.repeat(1300) + 'b'.repeat(1300);
  await store.setItem('sb-x', v);
  expect(Number(mockMem.get('sb-x.n'))).toBeGreaterThan(1);
  expect(await store.getItem('sb-x')).toBe(v);
});

test('non-ASCII values stay under 1800 bytes per chunk and round-trip', async () => {
  const v = 'Nguyễn Văn Ạ 🐟 '.repeat(200);
  await store.setItem('sb-x', v);
  for (const [k, c] of mockMem) if (k !== 'sb-x.n') expect(new TextEncoder().encode(c).length).toBeLessThanOrEqual(1800);
  expect(await store.getItem('sb-x')).toBe(v);
});

test('overwriting with a shorter value deletes stale chunks', async () => {
  await store.setItem('sb-x', 'a'.repeat(2000));
  await store.setItem('sb-x', 'short');
  expect([...mockMem.keys()].sort()).toEqual(['sb-x.0', 'sb-x.n']);
  expect(await store.getItem('sb-x')).toBe('short');
});

test('remove clears the count and all chunks', async () => {
  await store.setItem('sb-x', 'a'.repeat(2000));
  await store.removeItem('sb-x');
  expect(mockMem.size).toBe(0);
  expect(await store.getItem('sb-x')).toBeNull();
});

test('on web it uses localStorage and never touches expo-secure-store', async () => {
  jest.resetModules();
  jest.doMock('react-native', () => ({ Platform: { OS: 'web' } }));
  const mem = new Map<string, string>();
  (globalThis as unknown as { localStorage: unknown }).localStorage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, v),
    removeItem: (k: string) => void mem.delete(k),
  };
  const { secureStoreAdapter: web } = require('./secureStorage');
  await web.setItem('k', 'v');
  expect(await web.getItem('k')).toBe('v');
  expect(mockMem.size).toBe(0);
  await web.removeItem('k');
  expect(await web.getItem('k')).toBeNull();
});
