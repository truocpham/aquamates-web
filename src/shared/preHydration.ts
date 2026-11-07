import { THEME_STORAGE_KEY } from './ui/theme';

/**
 * Tiny synchronous script inlined in the HTML head (app/+html.tsx). It runs before first paint:
 *  1. Opening the static file as /index.html would match no route, so the URL is rewritten to /.
 *  2. If localStorage holds a Supabase session (sb-<ref>-auth-token), it marks <html data-has-session>;
 *     a stylesheet then hides the prerendered landing so a signed-in member never sees it.
 *  3. If the saved theme choice is light or dark, it sets <html data-theme>, which wins over the
 *     prefers-color-scheme media query in the page background CSS; 'system' or nothing saved sets nothing.
 * It reads only the saved theme choice (never the session value), makes no network call and holds no secrets.
 */
export const PRE_HYDRATION_SCRIPT = `(function(){try{var l=location,p=l.pathname;if(/\\/index\\.html$/.test(p)){history.replaceState(null,'',p.slice(0,-10)+(l.search||'')+(l.hash||''))}var s=localStorage;for(var i=0;i<s.length;i++){if(/^sb-.+-auth-token$/.test(s.key(i))){document.documentElement.setAttribute('data-has-session','');break}}var t=s.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})();`;

/** Called once the session has loaded: lets the landing show again for a visitor whose stored session turned out invalid. */
export function clearSessionHint(): void {
  if (typeof document !== 'undefined') document.documentElement?.removeAttribute?.('data-has-session');
}
