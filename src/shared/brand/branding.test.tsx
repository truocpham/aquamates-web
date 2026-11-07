import { render, screen } from '@testing-library/react-native';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { LandingScreen } from '@/features/landing/LandingScreen';
import { en } from '@/shared/i18n/en';
import { vi } from '@/shared/i18n/vi';

import { TopBar, WORDMARK_MIN_WIDTH } from './TopBar';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));

test('top bar always renders the mark and the wordmark, so prerender and first client render match', async () => {
  await render(<TopBar />);
  expect(screen.getByLabelText('T-MEN')).toBeTruthy();
  expect(screen.getByTestId('top-bar-wordmark')).toBeTruthy();
});

test('the page template hides the wordmark below 768 px with a media query', () => {
  const html = readFileSync(join(__dirname, '../../../app/+html.tsx'), 'utf8');
  expect(WORDMARK_MIN_WIDTH).toBe(768);
  expect(html).toContain('@media (max-width:767px){html [data-testid="top-bar-wordmark"]{display:none}}');
});

test('landing shows the tagline, full logo, wave dividers and footer', async () => {
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
