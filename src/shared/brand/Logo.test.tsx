import { render, screen } from '@testing-library/react-native';

import { Logo } from './Logo';
import { faviconSvg, fullSvg, logoPalettes, markSvg } from './logoSvg';

test('full and mark render a labelled image with the right aspect ratio', async () => {
  await render(<Logo variant="full" width={220} />);
  expect(screen.getByLabelText('T-MEN').props.style).toMatchObject({ width: 220, height: 148 });
});

test('mark can be forced to the dark palette', async () => {
  await render(<Logo variant="mark" width={110} scheme="dark" />);
  const mark = screen.getByLabelText('T-MEN');
  expect(mark.props.style).toMatchObject({ width: 110, height: 50 });
  expect(decodeURIComponent(mark.props.source.uri)).toContain(logoPalettes.dark.wave);
});

test('follows the theme by default (light)', async () => {
  await render(<Logo variant="mark" />);
  expect(decodeURIComponent(screen.getByLabelText('T-MEN').props.source.uri)).toContain(logoPalettes.light.wave);
});

test('standalone svgs use literal colours, no variables, no live text', () => {
  for (const scheme of ['light', 'dark'] as const) {
    for (const svg of [markSvg(scheme), fullSvg(scheme)]) {
      expect(svg).not.toMatch(/var\(|<text|font-family/);
      expect(svg).toContain(logoPalettes[scheme].teal);
      expect(svg).toContain('#FAC618');
    }
  }
  expect(fullSvg('light')).toContain('<path transform');
});

test('favicon switches palette with the browser colour scheme', () => {
  const svg = faviconSvg();
  expect(svg).toContain('prefers-color-scheme:dark');
  expect(svg).toContain(logoPalettes.dark.wave);
  expect(svg).not.toContain('stroke="' + logoPalettes.light.wave + '"');
});
