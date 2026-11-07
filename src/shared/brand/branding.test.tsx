import { render, screen } from '@testing-library/react-native';
import { useWindowDimensions } from 'react-native';

import { LandingScreen } from '@/features/landing/LandingScreen';
import { en } from '@/shared/i18n/en';
import { vi } from '@/shared/i18n/vi';

import { TopBar } from './TopBar';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const setWidth = (width: number) => (useWindowDimensions as jest.Mock).mockReturnValue({ width, height: 800, scale: 1, fontScale: 1 });

test('top bar shows the mark alone at 375 and 767', async () => {
  for (const w of [375, 767]) {
    setWidth(w);
    const { unmount } = await render(<TopBar />);
    expect(screen.getByLabelText('T-MEN')).toBeTruthy();
    expect(screen.queryByTestId('top-bar-wordmark')).toBeNull();
    await unmount();
  }
});

test('top bar adds the wordmark at 768 and 1280', async () => {
  for (const w of [768, 1280]) {
    setWidth(w);
    const { unmount } = await render(<TopBar />);
    expect(screen.getByLabelText('T-MEN')).toBeTruthy();
    expect(screen.getByTestId('top-bar-wordmark')).toBeTruthy();
    await unmount();
  }
});

test('landing shows the tagline, full logo, wave dividers and footer', async () => {
  setWidth(375);
  await render(<LandingScreen />);
  expect(screen.getByText('Swim together, beer forever')).toBeTruthy();
  expect(screen.getAllByLabelText('T-MEN').length).toBe(2); // top bar mark and hero logo
  expect(screen.getAllByTestId('wave-divider').length).toBe(2);
  expect(screen.getByTestId('landing-footer')).toBeTruthy();
});

test('the Vietnamese tagline is present and no string says AquaMates', () => {
  expect(vi['landing.title']).toBe('Bơi cùng nhau, bia mãi mãi');
  for (const dict of [en, vi]) {
    for (const value of Object.values(dict)) expect(value).not.toMatch(/aquamates/i);
  }
});
