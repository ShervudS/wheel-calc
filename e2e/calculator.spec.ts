import { AxeBuilder } from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

/** Element center on screen; scrolls the diagram into view first. */
async function center(loc: Locator): Promise<{ x: number; y: number }> {
  await loc.page().locator('#s').scrollIntoViewIfNeeded();
  const box = await loc.boundingBox();
  if (!box) throw new Error('element is not visible');
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function drag(page: Page, loc: Locator, dx: number, dy: number): Promise<void> {
  const from = await center(loc);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + dx / 2, from.y + dy / 2, { steps: 4 });
  await page.mouse.move(from.x + dx, from.y + dy, { steps: 4 });
  await page.mouse.up();
}

const hit = (page: Page, k: string) => page.locator(`[data-layer="hits"] [data-k="${k}"]`).first();

test.describe('calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#calc').scrollIntoViewIfNeeded();
  });

  test('dragging the mounting face changes the offset', async ({ page, isMobile }) => {
    test.skip(isMobile, 'mouse is tested on desktop');
    const et = page.locator('#ET');
    await expect(et).toHaveValue('35');
    await drag(page, hit(page, 'ET'), -40, 0);
    const v = Number(await et.inputValue());
    expect(v).toBeLessThan(35);
    await expect(page.locator('#ub')).toBeEnabled();
    await page.locator('#ub').click();
    await expect(et).toHaveValue('35');
  });

  test('dragging a flange changes the width in half-inch steps', async ({ page, isMobile }) => {
    test.skip(isMobile, 'mouse is tested on desktop');
    await page.locator('#u-in').click();
    const w = page.locator('#W');
    await expect(w).toHaveValue('8');
    // Right flange: the second W hit area in the top half.
    await drag(page, page.locator('[data-layer="hits"] [data-k="W"]').nth(1), 60, 0);
    const v = Number(await w.inputValue());
    expect(v).toBeGreaterThan(8);
    expect((v * 2) % 1).toBe(0);
  });

  test('hover highlights the line and shows a label', async ({ page, isMobile }) => {
    test.skip(isMobile, 'no hover on phones');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('#tOn').check();
    // A vertical line has zero width, so hover() treats it as invisible: move the mouse by coordinates.
    const p = await center(hit(page, 'X'));
    await page.mouse.move(p.x, p.y);
    await expect(page.locator('[data-layer="overlay"] text')).toHaveText('X-фактор 40 мм');
  });

  test('a finger on a phone drags lines too', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'touch is tested on phones');
    const et = page.locator('#ET');
    const from = await center(hit(page, 'ET'));
    const cdp = await page.context().newCDPSession(page);
    const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', x: number, y: number) =>
      cdp.send('Input.dispatchTouchEvent', {
        type,
        touchPoints: type === 'touchEnd' ? [] : [{ x, y }],
      });
    await touch('touchStart', from.x, from.y);
    await touch('touchMove', from.x - 15, from.y);
    await touch('touchMove', from.x - 30, from.y);
    await touch('touchEnd', from.x - 30, from.y);
    expect(Number(await et.inputValue())).toBeLessThan(35);
  });

  test('keyboard: Tab to a button and arrows', async ({ page }) => {
    const btn = page.locator('.kb-controls__btn[data-k="ET"]');
    await btn.focus();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Shift+ArrowUp');
    await expect(page.locator('#ET')).toHaveValue('41');
    await expect(page.locator('#kbs')).toHaveText('Вылет ET: 41 мм');
    await page.keyboard.press('ControlOrMeta+z');
    await expect(page.locator('#ET')).toHaveValue('35');
  });

  test('the link restores the configuration', async ({ page }) => {
    await page.locator('#tOn').check();
    await page.locator('#ET').fill('20');
    await page.locator('#ET').blur();
    await expect(page).toHaveURL(/et=20.*t=1/);
    await page.goto(page.url());
    await expect(page.locator('#ET')).toHaveValue('20');
    await expect(page.locator('#tOn')).toBeChecked();
  });

  test('Share without a system share sheet copies the link', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.evaluate(() => Object.defineProperty(navigator, 'share', { value: undefined }));
    await page.locator('#ET').fill('12');
    await page.locator('#ET').blur();
    await page.locator('#share').click();
    await expect(page.locator('#shareStatus')).toHaveText('Ссылка скопирована');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/et=12/);
  });

  test('switching language keeps the parameters', async ({ page }) => {
    await page.locator('#ET').fill('12');
    await page.locator('#ET').blur();
    await page.locator('#lang').click();
    await expect(page).toHaveURL(/\/en\/\?.*et=12/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#ET')).toHaveValue('12');
  });

  test('no horizontal scrolling', async ({ page }) => {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe('accessibility (axe)', () => {
  for (const theme of ['light', 'dark'] as const) {
    for (const path of ['/', '/en/', '/?t=1&w=254&tw=205']) {
      test(`${theme} ${path}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme });
        await page.goto(path);
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
        expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
      });
    }
  }
});

test.describe('diagram screenshots', () => {
  for (const theme of ['light', 'dark'] as const) {
    for (const [name, query] of [
      ['plain', ''],
      ['tire', '?t=1'],
      ['stretch', '?w=228.6&et=22&x=30&t=1&tw=205'],
    ] as const) {
      test(`${theme} ${name}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
        await page.goto(`/${query}`);
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator('#s')).toHaveScreenshot(`${theme}-${name}.png`, {
          maxDiffPixelRatio: 0.01,
        });
      });
    }
  }
});
