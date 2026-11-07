/**
 * T-MEN logo source of truth: the wave and beer-glass mark and the full lockup as SVG strings.
 * The wordmark is Plus Jakarta Sans ExtraBold Italic converted to outlines, so every rendering
 * (standalone file, inline data URI, favicon) looks the same without the font.
 * scripts/build-brand.mjs writes these strings to public/ as files.
 */
export type LogoScheme = 'light' | 'dark';

export type LogoPalette = { wave: string; cyan: string; teal: string };

export const logoPalettes: Record<LogoScheme, LogoPalette> = {
  light: { wave: '#1665B2', cyan: '#2BB5E3', teal: '#097C99' },
  dark: { wave: '#5AA9F0', cyan: '#43C6EA', teal: '#4CC3DE' },
};

/** Width and height of the mark viewBox. */
export const MARK_SIZE = { width: 220, height: 100 } as const;
/** Width and height of the full lockup viewBox (mark above the wordmark). */
export const FULL_SIZE = { width: 220, height: 148 } as const;

/** T-MEN, 100 px cap-height-74.5 outlines, baseline at y=0. */
const WORDMARK_PATH =
  'M31.7 0L16.2 0L24.7-61L5.8-61L7.7-74.5L60.7-74.5L58.8-61L40.2-61M108.5-20.8L63.5-20.8L65.3-33.8L110.3-33.8M136.9 0L121.4 0L131.8-74.5L146.8-74.5L169.7-36L160.1-36.7L194.3-74.5L209.8-74.5L199.4 0L183.9 0L191.8-56.9L196.3-55.3L164-19L162-19L138.4-59.5L144.8-56.9M262.7 0L212.6 0L223-74.5L273.1-74.5L271.2-61L236.6-61L234.3-44.1L266.9-44.1L265-30.6L232.4-30.6L230-13.5L264.6-13.5M287 0L271.5 0L281.9-74.5L293.8-74.5L325.5-21.8L319.8-20.3L327.4-74.5L342.9-74.5L332.5 0L320.5 0L289.5-53.1L294.6-54.6';

function markBody(p: LogoPalette): string {
  return (
    '<g fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M6 80C40 84 68 58 92 42c16-11 38-12 46 3 6 12-4 22-15 19-9-3-9-13 0-15" stroke="' + p.wave + '" stroke-width="7"/>' +
    '<path d="M36 84c30-4 52-18 68-34" stroke="' + p.cyan + '" stroke-width="6"/>' +
    '<path d="M120 82c26-14 56 6 94-6" stroke="' + p.cyan + '" stroke-width="6"/></g>' +
    '<g transform="rotate(5 168 48)">' +
    '<path d="M148 18h38l-6 56q-1 6-7 6h-12q-6 0-7-6z" fill="#FAC618" stroke="' + p.teal + '" stroke-width="5" stroke-linejoin="round"/>' +
    '<path d="M175 22h10l-5 52q-1 5-6 6h-4q4-2 5-8z" fill="#E2A016"/>' +
    '<g fill="#FFF8DD" stroke="#FAC618" stroke-width="3"><circle cx="156" cy="16" r="9"/><circle cx="168" cy="10" r="10"/><circle cx="181" cy="15" r="9"/></g></g>'
  );
}

/** Mark only (wave and glass), as a standalone SVG document. */
export function markSvg(scheme: LogoScheme): string {
  const p = logoPalettes[scheme];
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + MARK_SIZE.width + ' ' + MARK_SIZE.height + '" role="img" aria-label="T-MEN"><title>T-MEN</title>' +
    markBody(p) + '</svg>'
  );
}

/** Full lockup (mark above the T-MEN wordmark), as a standalone SVG document. */
export function fullSvg(scheme: LogoScheme): string {
  const p = logoPalettes[scheme];
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + FULL_SIZE.width + ' ' + FULL_SIZE.height + '" role="img" aria-label="T-MEN"><title>T-MEN</title>' +
    markBody(p) +
    '<path transform="translate(22.8 145.5) scale(0.5)" fill="' + p.teal + '" d="' + WORDMARK_PATH + '"/></svg>'
  );
}

/** Favicon: the mark, switching to the dark palette when the browser tab is dark. */
export function faviconSvg(): string {
  const l = logoPalettes.light;
  const d = logoPalettes.dark;
  const style =
    '<style>.w{stroke:' + l.wave + '}.c{stroke:' + l.cyan + '}.t{stroke:' + l.teal + '}' +
    '@media (prefers-color-scheme:dark){.w{stroke:' + d.wave + '}.c{stroke:' + d.cyan + '}.t{stroke:' + d.teal + '}}</style>';
  const body = markBody(l)
    .replace('stroke="' + l.wave + '"', 'class="w"')
    .replace(new RegExp('stroke="' + l.cyan + '"', 'g'), 'class="c"')
    .replace('stroke="' + l.teal + '"', 'class="t"');
  // Square viewBox so the tab icon is not squashed: the 220x100 mark sits in the middle.
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -60 220 220">' + style + body + '</svg>'
  );
}

/** Data URI of an SVG string, for an Image source. */
export function svgDataUri(svg: string): string {
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}
