import { expect, test, type Page } from '@playwright/test';

import { mockBackend } from './backend';

test.use({ locale: 'en-US' });

const WIDTHS = [375, 768, 1280];
const SIGNED_OUT = ['/', '/sign-in'];
const SIGNED_IN = ['/', '/event/ev1', '/event/new', '/history', '/dashboard', '/settings', '/admin'];

/** Elements whose box leaves the viewport horizontally, or overlap a sibling control (buttons, links, inputs). */
async function layoutProblems(page: Page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const out: string[] = [];
    if (document.documentElement.scrollWidth > vw) out.push(`page scrolls horizontally (${document.documentElement.scrollWidth} > ${vw})`);
    const items = [...document.querySelectorAll<HTMLElement>('button, a, input, [role=button], [role=link]')]
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.width > 0 && r.height > 0);
    for (const { el, r } of items) if (r.left < -1 || r.right > vw + 1) out.push(`cut off: ${el.textContent?.slice(0, 30) || el.tagName}`);
    for (let i = 0; i < items.length; i++)
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i], b = items[j];
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
        const w = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
        const h = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
        if (w > 2 && h > 2) out.push(`overlap: "${a.el.textContent?.slice(0, 20)}" and "${b.el.textContent?.slice(0, 20)}"`);
      }
    return out;
  });
}

for (const [signedIn, paths] of [[false, SIGNED_OUT], [true, SIGNED_IN]] as const)
  for (const width of WIDTHS)
    for (const path of paths)
      test(`${signedIn ? 'member' : 'visitor'} ${path} at ${width}px has no overlap or cut-off`, async ({ page }, info) => {
        await mockBackend(page, signedIn);
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        // Fonts are registered after first paint and change text widths: measure once they are in and loaded.
        await expect.poll(() => page.evaluate(() => document.fonts.size), { timeout: 15_000 }).toBeGreaterThanOrEqual(3);
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: info.outputPath(`${path.replace(/\W+/g, '_')}-${width}.png`), fullPage: true });
        expect(await layoutProblems(page)).toEqual([]);
      });
