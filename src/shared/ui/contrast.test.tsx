import * as RN from 'react-native';
import { StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { Card, ThemeProvider, darkColors, lightColors, themes } from '.';
import type { ThemeColors } from './theme';

const mockStore = new Map<string, string>();
jest.mock('../secureStorage', () => ({
  secureStoreAdapter: {
    getItem: async (k: string) => (mockStore.has(k) ? mockStore.get(k)! : null),
    setItem: async (k: string, v: string) => void mockStore.set(k, v),
    removeItem: async (k: string) => void mockStore.delete(k),
  },
}));
const phoneSpy = jest.spyOn(RN, 'useColorScheme');

function channel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}
function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
function rgb(hex: string): number[] {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

type Pair = [string, (c: ThemeColors) => [string, string]];
// Every text/background pair the building blocks and screens use.
const pairs: Pair[] = [
  ['body text on screen', (c) => [c.text, c.bg]],
  ['body text on card', (c) => [c.text, c.card]],
  ['body text on raised card and input', (c) => [c.text, c.raised]],
  ['muted text on screen', (c) => [c.muted, c.bg]],
  ['muted text on card', (c) => [c.muted, c.card]],
  ['muted text on raised', (c) => [c.muted, c.raised]],
  ['primary button text on gold', (c) => [c.onAccent, c.accent]],
  ['selected chip text on gold', (c) => [c.onAccent, c.accent]],
  ['dark text on gold border', (c) => [c.onAccent, c.accentBorder]],
  ['swimming label on screen', (c) => [c.swimming, c.bg]],
  ['swimming label on card', (c) => [c.swimming, c.card]],
  ['beer social label on screen', (c) => [c.beer_social, c.bg]],
  ['beer social label on card', (c) => [c.beer_social, c.card]],
  ['success text on screen', (c) => [c.success, c.bg]],
  ['success text on card', (c) => [c.success, c.card]],
  ['chip text on card', (c) => [c.text, c.card]],
  ['secondary button text on screen', (c) => [c.brand, c.bg]],
  ['secondary button text on card', (c) => [c.brand, c.card]],
  ['link and active tab on card', (c) => [c.brand, c.card]],
  ['error text on screen', (c) => [c.dangerText, c.bg]],
  ['error text on card', (c) => [c.dangerText, c.card]],
  ['error text on raised', (c) => [c.dangerText, c.raised]],
  ['avatar initials on raised', (c) => [c.brand, c.raised]],
  ['home events count on raised strip', (c) => [c.brand, c.raised]],
  ['home events label on raised strip', (c) => [c.muted, c.raised]],
  ['home greeting on screen', (c) => [c.text, c.bg]],
  ['profile menu row on raised card', (c) => [c.text, c.raised]],
  ['profile danger menu row on raised card', (c) => [c.dangerText, c.raised]],
  ['profile section label on raised card', (c) => [c.muted, c.raised]],
];

describe.each(['dark', 'light'] as const)('contrast in %s mode', (mode) => {
  test.each(pairs)('%s is at least 4.5:1', (_name, pick) => {
    const [fg, bg] = pick(themes[mode]);
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });
});

test('contrast helper matches known values', () => {
  expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
  expect(contrast('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
});

test('light mode: gold is only a fill with dark text, never a text or icon colour', () => {
  expect(contrast(lightColors.accent, lightColors.card)).toBeLessThan(3);
  for (const key of ['text', 'muted', 'brand', 'swimming', 'beer_social', 'success', 'danger', 'dangerText', 'onAccent'] as const) {
    expect(lightColors[key].toLowerCase()).not.toBe(lightColors.accent.toLowerCase());
  }
  expect(contrast(lightColors.onAccent, lightColors.accent)).toBeGreaterThanOrEqual(4.5);
});

describe.each(['dark', 'light'] as const)('UI borders and bars in %s mode are at least 3:1', (mode) => {
  const c = themes[mode];
  test.each([
    ['gold button and chip border on card', c.accentBorder, c.card],
    ['gold button and chip border on screen', c.accentBorder, c.bg],
    ['swimming bar on card', c.swimming, c.card],
    ['beer social bar on card', c.beer_social, c.card],
  ])('%s', (_name, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(3);
  });
});

test('no lime value remains in the palettes', () => {
  const all = JSON.stringify([darkColors, lightColors]).toUpperCase();
  expect(all).not.toContain('C8FF48');
  expect(all).not.toContain('8FBF00');
});


