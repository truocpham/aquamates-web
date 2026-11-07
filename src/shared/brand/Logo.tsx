import { Image } from 'react-native';

import { useTheme } from '../ui/ThemeProvider';
import { FULL_SIZE, MARK_SIZE, fullSvg, markSvg, svgDataUri, type LogoScheme } from './logoSvg';

export type LogoProps = {
  /** full: mark above the T-MEN wordmark; mark: wave and glass only. */
  variant?: 'full' | 'mark';
  /** Rendered width in px; the height follows the artwork's aspect ratio. */
  width?: number;
  /** Overrides the active theme, for a logo on a surface of the other mode. */
  scheme?: LogoScheme;
};

const sources = {
  full: { light: svgDataUri(fullSvg('light')), dark: svgDataUri(fullSvg('dark')), ...FULL_SIZE },
  mark: { light: svgDataUri(markSvg('light')), dark: svgDataUri(markSvg('dark')), ...MARK_SIZE },
};

/** The T-MEN logo in the palette of the active theme (light or dark). */
export function Logo({ variant = 'full', width = variant === 'full' ? 220 : 96, scheme }: LogoProps) {
  const theme = useTheme();
  const s = sources[variant];
  return (
    <Image
      accessibilityRole="image"
      accessibilityLabel="T-MEN"
      source={{ uri: s[scheme ?? theme.scheme] }}
      style={{ width, height: (width * s.height) / s.width }}
      resizeMode="contain"
    />
  );
}
