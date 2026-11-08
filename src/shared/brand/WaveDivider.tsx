import { Image } from 'react-native';

import { useTheme } from '../ui/ThemeProvider';
import { svgDataUri } from './logoSvg';

const WAVE = 'M0 30C150 0 300 60 450 30S750 0 900 30s200 25 300 0';
const HEIGHT = 48;

function waveSvg(fill: string, stroke: string): string {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 60" preserveAspectRatio="none">' +
    `<path d="${WAVE}V60H0z" fill="${fill}"/><path d="${WAVE}" fill="none" stroke="${stroke}" stroke-width="3"/></svg>`
  );
}

/** Soft wave edge that fills the section below it with the raised surface colour. */
export function WaveDivider({ fill = 'raised' }: { fill?: 'raised' | 'card' }) {
  const { colors } = useTheme();
  return (
    <Image
      testID="wave-divider"
      accessible={false}
      source={{ uri: svgDataUri(waveSvg(colors[fill], colors.brand)) }}
      style={{ width: '100%', height: HEIGHT }}
      resizeMode="stretch"
    />
  );
}
