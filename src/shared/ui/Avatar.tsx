import { Image, View } from 'react-native';

import { Text } from './Text';
import { useTheme } from './ThemeProvider';
import { fontSize, fontWeight, size as sizes } from './theme';

/** Up to two uppercase initials from the first and last word of a name; '?' when empty. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = [...words[0]][0];
  const last = words.length > 1 ? [...words[words.length - 1]][0] : '';
  return (first + last).toUpperCase();
}

/** Member picture, or initials on an accent circle when there is none. */
export function Avatar({ name, url, size = sizes.avatar }: { name: string; url?: string | null; size?: number }) {
  const { colors } = useTheme();
  const circle = { width: size, height: size, borderRadius: size / 2 };
  // Only https pictures are fetched; anything else falls back to initials.
  if (url?.startsWith('https://')) return <Image accessibilityLabel={`${name} avatar`} source={{ uri: url }} style={circle} />;
  return (
    <View style={[circle, { backgroundColor: colors.raised, alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={{ color: colors.brand, fontWeight: fontWeight.semibold, fontSize: fontSize.sm }}>{initials(name)}</Text>
    </View>
  );
}
