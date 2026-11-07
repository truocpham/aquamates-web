export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const fontSize = { xs: 12, sm: 14, md: 16, lg: 20, xl: 28, xxl: 36 };
export const radius = { sm: 8, md: 10, input: 12, card: 16, pill: 20, round: 36 };
export const size = { avatar: 36, avatarLg: 72, control: 44, field: 220, bar: 10, qr: 200 };
export const borderWidth = { hairline: 1, accent: 4 };
export const opacity = { disabled: 0.5 };
export const fontWeight = { semibold: '600', bold: '700' } as const;

export type ThemeScheme = 'dark' | 'light';
export type ThemeChoice = 'system' | 'light' | 'dark';

export type ThemeColors = {
  bg: string;
  card: string;
  raised: string;
  border: string;
  text: string;
  muted: string;
  brand: string;
  accent: string;
  /** Border of gold fills: gold on dark, a darker gold on cream so it reaches 3:1. */
  accentBorder: string;
  onAccent: string;
  swimming: string;
  beer_social: string;
  success: string;
  danger: string;
  /** Danger as text on any surface including raised (light danger alone is 4.3:1 on raised). */
  dangerText: string;
};

export const darkColors: ThemeColors = {
  bg: '#071820',
  card: '#0D2430',
  raised: '#143240',
  border: '#234656',
  text: '#F4FAFB',
  muted: '#9DB8C4',
  brand: '#5AA9F0',
  accent: '#FAC618',
  accentBorder: '#FAC618',
  onAccent: '#0B1B24',
  swimming: '#5AA9F0',
  beer_social: '#FAC618',
  success: '#34D399',
  danger: '#FF6B6B',
  dangerText: '#FF6B6B',
};

export const lightColors: ThemeColors = {
  bg: '#FBF8E5',
  card: '#FFFFFF',
  raised: '#F3EEDB',
  border: '#E3DBC0',
  text: '#0B1B24',
  muted: '#54626B',
  brand: '#1665B2',
  accent: '#FAC618',
  accentBorder: '#A57C00',
  onAccent: '#0B1B24',
  swimming: '#1665B2',
  beer_social: '#9A6400',
  success: '#047857',
  danger: '#C62828',
  dangerText: '#B71C1C',
};

export const themes: Record<ThemeScheme, ThemeColors> = { dark: darkColors, light: lightColors };

/** Saved choice wins; 'system' (or nothing saved) follows the phone; no phone setting counts as light. */
export function resolveScheme(choice: ThemeChoice | null | undefined, phone: string | null | undefined): ThemeScheme {
  if (choice === 'light' || choice === 'dark') return choice;
  return phone === 'dark' ? 'dark' : 'light';
}

export const THEME_STORAGE_KEY = 'aquamates.theme';

/** Plus Jakarta Sans family names as registered by the font package, by weight. */
export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

/** Family for a style's fontWeight (React Native needs one family per weight for custom fonts). */
export function familyForWeight(weight: string | number | undefined): string {
  if (weight === '700' || weight === 700 || weight === 'bold' || weight === '800' || weight === '900') return fontFamily.bold;
  if (weight === '600' || weight === 600) return fontFamily.semibold;
  return fontFamily.regular;
}
