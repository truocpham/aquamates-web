import { PRE_HYDRATION_SCRIPT, clearSessionHint } from './preHydration';

/** Runs the inline script against a fake browser (the RN jest preset has no DOM). */
function run(path: string, stored: Record<string, string>) {
  const attrs = new Set<string>();
  const calls: string[] = [];
  const keys = Object.keys(stored);
  const env = {
    location: { pathname: path.split('?')[0], search: path.includes('?') ? '?' + path.split('?')[1] : '', hash: '' },
    history: { replaceState: (_s: unknown, _t: string, url: string) => calls.push(url) },
    localStorage: { length: keys.length, key: (i: number) => keys[i] },
    document: { documentElement: { setAttribute: (n: string) => attrs.add(n) } },
  };
  new Function('location', 'history', 'localStorage', 'document', PRE_HYDRATION_SCRIPT)(
    env.location,
    env.history,
    env.localStorage,
    env.document,
  );
  return { attrs, calls };
}

describe('pre-hydration script', () => {
  it('marks the page when a stored session exists', () => {
    expect(run('/', { 'sb-abc-auth-token': '{}' }).attrs.has('data-has-session')).toBe(true);
  });

  it('leaves the landing visible for a signed-out visitor', () => {
    const { attrs } = run('/', { 'sb-abc-auth-token-code-verifier': 'v', theme: 'dark' });
    expect(attrs.has('data-has-session')).toBe(false);
  });

  it('rewrites /index.html to / so the router matches the landing', () => {
    expect(run('/index.html?x=1', {}).calls).toEqual(['/?x=1']);
  });

  it('does not touch other paths', () => {
    expect(run('/sign-in', {}).calls).toEqual([]);
  });

  it('is a few lines, with no network call', () => {
    expect(PRE_HYDRATION_SCRIPT).not.toMatch(/fetch|XMLHttpRequest|getItem/);
    expect(PRE_HYDRATION_SCRIPT.length).toBeLessThan(500);
  });

  it('clearSessionHint is safe without a DOM', () => {
    expect(() => clearSessionHint()).not.toThrow();
  });
});
