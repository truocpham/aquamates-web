import * as Localization from 'expo-localization';

import { dictionaries, getLanguage, initLanguage, LANGUAGE_STORAGE_KEY, resolveLanguage, setLanguage, t } from './index';

const mockMem = new Map<string, string>();
jest.mock('expo-secure-store', () => ({
  getItemAsync: async (k: string) => mockMem.get(k) ?? null,
  setItemAsync: async (k: string, v: string) => void mockMem.set(k, v),
  deleteItemAsync: async (k: string) => void mockMem.delete(k),
}));
jest.mock('expo-localization', () => ({ getLocales: jest.fn(() => [{ languageCode: 'en' }]) }));

const phone = (code: string | null) =>
  (Localization.getLocales as jest.Mock).mockReturnValue(code ? [{ languageCode: code }] : []);

beforeEach(() => {
  mockMem.clear();
  phone('en');
});

test('every key exists in both languages', () => {
  const en = Object.keys(dictionaries.en).sort();
  const vi = Object.keys(dictionaries.vi).sort();
  expect(vi.filter((k) => !en.includes(k))).toEqual([]);
  expect(en.filter((k) => !vi.includes(k))).toEqual([]);
  for (const k of en) {
    expect(dictionaries.en[k as keyof typeof dictionaries.en]).not.toBe('');
    expect(dictionaries.vi[k as keyof typeof dictionaries.vi]).not.toBe('');
  }
});

test('Vietnamese phone with no saved choice gives Vietnamese, others English', () => {
  expect(resolveLanguage(null, 'vi')).toBe('vi');
  expect(resolveLanguage(null, 'en')).toBe('en');
  expect(resolveLanguage(null, 'fr')).toBe('en');
  expect(resolveLanguage(null, null)).toBe('en');
});

test('a saved choice overrides the phone language', () => {
  expect(resolveLanguage('en', 'vi')).toBe('en');
  expect(resolveLanguage('vi', 'fr')).toBe('vi');
  expect(resolveLanguage('xx', 'vi')).toBe('vi');
});

test('initLanguage uses the phone language, then the saved choice survives a restart', async () => {
  phone('vi');
  expect(await initLanguage()).toBe('vi');
  expect(t('signIn.facebook')).toBe('Tiếp tục với Facebook');

  await setLanguage('en');
  expect(mockMem.get(`${LANGUAGE_STORAGE_KEY}.0`)).toBe('en');
  expect(t('signIn.facebook')).toBe('Continue with Facebook');

  // "restart": phone still Vietnamese, but the saved English wins.
  expect(await initLanguage()).toBe('en');
  expect(getLanguage()).toBe('en');
});
