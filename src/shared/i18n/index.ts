import { useSyncExternalStore } from 'react';

import { secureStoreAdapter } from '../secureStorage';
import { en } from './en';
import { vi } from './vi';

export type Language = 'en' | 'vi';
export type TextKey = keyof typeof en;

export const dictionaries: Record<Language, Record<TextKey, string>> = { en, vi };
export const LANGUAGE_STORAGE_KEY = 'aquamates.language';

/** Saved choice wins; else Vietnamese phone language gives 'vi'; anything else gives 'en'. */
export function resolveLanguage(saved: string | null | undefined, phoneCode: string | null | undefined): Language {
  if (saved === 'en' || saved === 'vi') return saved;
  return phoneCode === 'vi' ? 'vi' : 'en';
}

function phoneLanguageCode(): string | null {
  // Required lazily so plain-node consumers (the e2e test) that only import t() never load the native module.
  try {
    const Localization = require('expo-localization') as typeof import('expo-localization');
    return Localization.getLocales()[0]?.languageCode ?? null;
  } catch {
    return null;
  }
}

let current: Language = resolveLanguage(null, phoneLanguageCode());
const listeners = new Set<() => void>();

function apply(next: Language) {
  if (next === current) return;
  current = next;
  listeners.forEach((l) => l());
}

export function getLanguage(): Language {
  return current;
}

/** Looks up `key` in the current language; `{name}` placeholders are filled from `vars`. */
export function t(key: TextKey, vars?: Record<string, string | number>): string {
  const text = dictionaries[current][key] ?? dictionaries.en[key] ?? key;
  return vars ? text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : text;
}

/** Loads the saved choice (call once at app start); falls back to the phone language. */
export async function initLanguage(): Promise<Language> {
  let saved: string | null = null;
  try {
    saved = await secureStoreAdapter.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    saved = null;
  }
  apply(resolveLanguage(saved, phoneLanguageCode()));
  return current;
}

/** Switches language now and saves the choice on the device. */
export async function setLanguage(next: Language): Promise<void> {
  apply(next);
  await secureStoreAdapter.setItem(LANGUAGE_STORAGE_KEY, next);
}

const LOCALES: Record<Language, string> = { en: 'en-US', vi: 'vi-VN' };

/** Date and time in the chosen language's format. */
export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString(LOCALES[current]);
}

/** Month name and year (history headings) in the chosen language. */
export function formatMonthYear(date: Date | string): string {
  return new Date(date).toLocaleString(LOCALES[current], { month: 'long', year: 'numeric' });
}

/** Whole-VND amount with the chosen language's digit grouping. */
export function formatVnd(amount: number): string {
  return `${amount.toLocaleString(LOCALES[current])} VND`;
}

/** Re-renders the caller when the language changes. */
export function useLanguage(): Language {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => void listeners.delete(cb);
    },
    getLanguage,
    getLanguage,
  );
}
