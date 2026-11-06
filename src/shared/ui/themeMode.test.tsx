import { useEffect } from 'react';
import { act, render, screen } from '@testing-library/react-native';
import * as RN from 'react-native';

import { Text, ThemeProvider, darkColors, lightColors, resolveScheme, useTheme } from '.';
import { fontFamily, familyForWeight, type ThemeChoice } from './theme';

const mockStore = new Map<string, string>();
jest.mock('../secureStorage', () => ({
  secureStoreAdapter: {
    getItem: async (k: string) => (mockStore.has(k) ? mockStore.get(k)! : null),
    setItem: async (k: string, v: string) => void mockStore.set(k, v),
    removeItem: async (k: string) => void mockStore.delete(k),
  },
}));

const phoneSpy = jest.spyOn(RN, 'useColorScheme');

const holder = {} as { api: ReturnType<typeof useTheme> };
function Probe() {
  const api = useTheme();
  useEffect(() => {
    holder.api = api;
  });
  return <Text>{`${api.scheme}:${api.choice}:${api.colors.bg}`}</Text>;
}

beforeEach(() => {
  mockStore.clear();
  phoneSpy.mockReturnValue('light');
});

describe('resolveScheme: choice crossed with phone setting', () => {
  const cases: [ThemeChoice | null, 'dark' | 'light', 'dark' | 'light'][] = [
    [null, 'dark', 'dark'],
    [null, 'light', 'light'],
    ['system', 'dark', 'dark'],
    ['system', 'light', 'light'],
    ['light', 'dark', 'light'],
    ['light', 'light', 'light'],
    ['dark', 'dark', 'dark'],
    ['dark', 'light', 'dark'],
  ];
  test.each(cases)('choice %s with phone %s gives %s', (choice, phone, expected) => {
    expect(resolveScheme(choice, phone)).toBe(expected);
  });

  test('phone with no setting counts as light', () => {
    expect(resolveScheme('system', null)).toBe('light');
    expect(resolveScheme(undefined, undefined)).toBe('light');
  });
});

test('token sets hold the spec values', () => {
  expect(darkColors).toMatchObject({ bg: '#0B0F17', card: '#121823', raised: '#1A212E', brand: '#00A0FF', accent: '#C8FF48', onAccent: '#0B0F17' });
  expect(lightColors).toMatchObject({ bg: '#F4F7FB', card: '#FFFFFF', brand: '#0070B8', accentBorder: '#8FBF00', danger: '#D32F2F' });
});

describe('ThemeProvider', () => {
  test('with no saved choice a dark phone gives dark and a light phone gives light, and it follows changes', async () => {
    phoneSpy.mockReturnValue('dark');
    const view = await render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(await screen.findByText('dark:system:#0B0F17')).toBeTruthy();
    phoneSpy.mockReturnValue('light');
    await view.rerender(<ThemeProvider><Probe /></ThemeProvider>);
    expect(await screen.findByText('light:system:#F4F7FB')).toBeTruthy();
  });

  test('a saved choice overrides the phone', async () => {
    mockStore.set('aquamates.theme', 'dark');
    phoneSpy.mockReturnValue('light');
    await render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(await screen.findByText('dark:dark:#0B0F17')).toBeTruthy();
  });

  test('setChoice applies at once and is saved so a restart keeps it', async () => {
    phoneSpy.mockReturnValue('dark');
    const first = await render(<ThemeProvider><Probe /></ThemeProvider>);
    await screen.findByText('dark:system:#0B0F17');
    await act(async () => {
      await holder.api.setChoice('light');
    });
    expect(await screen.findByText('light:light:#F4F7FB')).toBeTruthy();
    expect(mockStore.get('aquamates.theme')).toBe('light');
    await first.unmount();
    await render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(await screen.findByText('light:light:#F4F7FB')).toBeTruthy();
  });

  test('an unreadable saved value falls back to following the phone', async () => {
    mockStore.set('aquamates.theme', 'purple');
    phoneSpy.mockReturnValue('dark');
    await render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(await screen.findByText('dark:system:#0B0F17')).toBeTruthy();
  });
});

describe('Text font', () => {
  test('uses Plus Jakarta Sans for each weight', async () => {
    await render(
      <>
        <Text>body</Text>
        <Text variant="heading">heading</Text>
        <Text variant="title">title</Text>
      </>,
    );
    expect(screen.getByText('body')).toHaveStyle({ fontFamily: fontFamily.regular });
    expect(screen.getByText('heading')).toHaveStyle({ fontFamily: fontFamily.semibold });
    expect(screen.getByText('title')).toHaveStyle({ fontFamily: fontFamily.bold });
    expect(familyForWeight(undefined)).toBe(fontFamily.regular);
  });
});
