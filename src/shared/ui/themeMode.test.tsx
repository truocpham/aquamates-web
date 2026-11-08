import { useEffect } from 'react';
import { act, render, screen } from '@testing-library/react-native';
import * as RN from 'react-native';

import { Text, ThemeProvider, darkColors, lightColors, resolveScheme, useTheme } from '.';
import { fontFamily, familyForWeight, headingFamily, type ThemeChoice } from './theme';

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
  expect(darkColors).toMatchObject({ bg: '#071820', card: '#0D2430', raised: '#143240', brand: '#5AA9F0', accent: '#FAC618', onAccent: '#0B1B24' });
  expect(lightColors).toMatchObject({ bg: '#FBF8E5', card: '#FFFFFF', brand: '#1665B2', accent: '#FAC618', danger: '#C62828' });
});

describe('ThemeProvider', () => {
  test('with no saved choice a dark phone gives dark and a light phone gives light, and it follows changes', async () => {
    phoneSpy.mockReturnValue('dark');
    const view = await render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(await screen.findByText('dark:system:#071820')).toBeTruthy();
    phoneSpy.mockReturnValue('light');
    await view.rerender(<ThemeProvider><Probe /></ThemeProvider>);
    expect(await screen.findByText('light:system:#FBF8E5')).toBeTruthy();
  });

  test('on web a dark phone still ends up dark once the saved choice is read', async () => {
    const original = RN.Platform.OS;
    RN.Platform.OS = 'web';
    try {
      phoneSpy.mockReturnValue('dark');
      await render(<ThemeProvider><Probe /></ThemeProvider>);
      expect(await screen.findByText('dark:system:#071820')).toBeTruthy();
    } finally {
      RN.Platform.OS = original;
    }
  });

  test('a saved choice overrides the phone', async () => {
    mockStore.set('aquamates.theme', 'dark');
    phoneSpy.mockReturnValue('light');
    await render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(await screen.findByText('dark:dark:#071820')).toBeTruthy();
  });

  test('setChoice applies at once and is saved so a restart keeps it', async () => {
    phoneSpy.mockReturnValue('dark');
    const first = await render(<ThemeProvider><Probe /></ThemeProvider>);
    await screen.findByText('dark:system:#071820');
    await act(async () => {
      await holder.api.setChoice('light');
    });
    expect(await screen.findByText('light:light:#FBF8E5')).toBeTruthy();
    expect(mockStore.get('aquamates.theme')).toBe('light');
    await first.unmount();
    await render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(await screen.findByText('light:light:#FBF8E5')).toBeTruthy();
  });

  test('an unreadable saved value falls back to following the phone', async () => {
    mockStore.set('aquamates.theme', 'purple');
    phoneSpy.mockReturnValue('dark');
    await render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(await screen.findByText('dark:system:#071820')).toBeTruthy();
  });
});

describe('Text font', () => {
  test('uses Plus Jakarta Sans for body and Baloo 2 for headings', async () => {
    await render(
      <>
        <Text>body</Text>
        <Text variant="heading">heading</Text>
        <Text variant="title">title</Text>
      </>,
    );
    expect(screen.getByText('body')).toHaveStyle({ fontFamily: fontFamily.regular });
    expect(screen.getByText('heading')).toHaveStyle({ fontFamily: headingFamily.semibold });
    expect(screen.getByText('title')).toHaveStyle({ fontFamily: headingFamily.bold });
    expect(familyForWeight(undefined)).toBe(fontFamily.regular);
  });

  test('Vietnamese headings use Baloo 2, whose package ships the vietnamese subset', async () => {
    await render(<Text variant="heading">ệ ạ ữ</Text>);
    expect(screen.getByText('ệ ạ ữ')).toHaveStyle({ fontFamily: headingFamily.semibold });
    expect(require('@expo-google-fonts/baloo-2/metadata.json').subsets).toContain('vietnamese');
  });
});
