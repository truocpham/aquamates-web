import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// SecureStore values should stay under ~2 KB. 450 code points is at most 1800 UTF-8 bytes,
// and splitting on code points never cuts a surrogate pair.
const CHUNK = 450;

const nativeAdapter = {
  async getItem(key: string): Promise<string | null> {
    const n = await SecureStore.getItemAsync(`${key}.n`);
    if (n === null) return null;
    const parts = await Promise.all(
      Array.from({ length: Number(n) }, (_, i) => SecureStore.getItemAsync(`${key}.${i}`)),
    );
    return parts.some((p) => p === null) ? null : parts.join('');
  },
  async setItem(key: string, value: string): Promise<void> {
    const chars = Array.from(value);
    const count = Math.ceil(chars.length / CHUNK);
    const old = Number((await SecureStore.getItemAsync(`${key}.n`)) ?? 0);
    for (let i = 0; i < count; i++) {
      await SecureStore.setItemAsync(`${key}.${i}`, chars.slice(i * CHUNK, (i + 1) * CHUNK).join(''));
    }
    await SecureStore.setItemAsync(`${key}.n`, String(count));
    for (let i = count; i < old; i++) await SecureStore.deleteItemAsync(`${key}.${i}`);
  },
  async removeItem(key: string): Promise<void> {
    const n = Number((await SecureStore.getItemAsync(`${key}.n`)) ?? 0);
    for (let i = 0; i < n; i++) await SecureStore.deleteItemAsync(`${key}.${i}`);
    await SecureStore.deleteItemAsync(`${key}.n`);
  },
};

// Browsers have no SecureStore; the session lives in localStorage there.
const webAdapter: typeof nativeAdapter = {
  async getItem(key) {
    return globalThis.localStorage?.getItem(key) ?? null;
  },
  async setItem(key, value) {
    globalThis.localStorage?.setItem(key, value);
  },
  async removeItem(key) {
    globalThis.localStorage?.removeItem(key);
  },
};

export const secureStoreAdapter = Platform.OS === 'web' ? webAdapter : nativeAdapter;
