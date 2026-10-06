import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const address = '0x821502ef6c3cf75347133d27b99cbf821ec05a9f';
await mkdir('artifacts', { recursive: true });

for (const theme of ['dark', 'light']) {
  for (const width of [320, 390, 768, 1440]) {
    test(`${theme}: readable, accessible export at ${width}px`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.setViewportSize({ width, height: 900 });
      await page.goto('./');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(page.locator('h1')).toHaveText('Swarm Made$MADE');
      await expect(page.locator('#token-address')).toHaveText(address);
      const overflow = await page.evaluate(() => ({ viewport: innerWidth, width: document.documentElement.scrollWidth }));
      expect(overflow.width).toBeLessThanOrEqual(overflow.viewport);
      for (const element of await page.locator('a:visible, button:visible').all()) {
        const box = await element.boundingBox();
        if (await element.evaluate(el => el.classList.contains('skip-link'))) continue;
        expect(box.width).toBeGreaterThanOrEqual(24);
        expect(box.height, await element.textContent()).toBeGreaterThanOrEqual(44);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
      }
      if (width === 320 || width === 1440) {
        const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
        expect(scan.violations).toEqual([]);
      }
      if (width === 390 || width === 1440) {
        await page.screenshot({ path: `artifacts/${theme}-${width}.png`, fullPage: true });
      }
    });
  }
}

test('copy uses the actual clipboard and remains repeatable', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('./');
  await page.getByRole('button', { name: 'copy address' }).click();
  await expect(page.locator('#copy-status')).toHaveText('Address copied.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(address);
  await page.getByRole('button', { name: 'copy again' }).click();
  await expect(page.locator('#copy-status')).toHaveText('Address copied.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(address);
});

test('denied and unavailable clipboard give a persistent manual recovery', async ({ page }) => {
  for (const mode of ['denied', 'unavailable']) {
    await page.goto('./');
    await page.evaluate(mode => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: mode === 'denied' ? { writeText: () => Promise.reject(new Error('Permission denied')) } : undefined });
    }, mode);
    await page.getByRole('button', { name: 'copy address' }).click();
    await expect(page.locator('#copy-status')).toContainText('Select the address above and copy it manually.');
    expect(await page.evaluate(() => getSelection().toString())).toBe(address);
    await expect(page.getByRole('button', { name: 'try copy again' })).toBeEnabled();
  }
  await page.locator('.contract-panel').screenshot({ path: 'artifacts/copy-recovery.png' });
});

test('theme follows system until changed and persists across reload', async ({ page }) => {
  await page.goto('./');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('#theme-status')).toHaveText('Light mode enabled.');
});

test('blocked storage preserves theme switching', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
    Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
  });
  await page.goto('./');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('keyboard order, visible focus, skip link and native activation', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('./');
  const labels = [];
  for (let i = 0; i < 13; i++) {
    await page.keyboard.press('Tab');
    labels.push(await page.evaluate(() => document.activeElement.getAttribute('aria-label') ?? document.activeElement.textContent.trim()));
    const style = await page.locator(':focus').evaluate(el => ({ width: getComputedStyle(el).outlineWidth, style: getComputedStyle(el).outlineStyle }));
    expect(style).toEqual({ width: '2px', style: 'solid' });
    if ([0, 5, 6, 7, 9, 12].includes(i)) {
      await page.screenshot({ path: `artifacts/focus-${i}.png` });
    }
  }
  expect(labels).toEqual(['skip to content', 'Swarm Made, back to top', 'the token', 'the split', 'the origin', 'Switch to light mode', 'buy $MADE on Uniswap ↗', 'copy address', 'view on Etherscan ↗', 'the beginningview swarm launch #741↗', 'out in the openread the source↗', 'Swarm Made, back to top', 'IMD swarm ↗']);
  await page.goto('./');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  await page.locator('#theme-toggle').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.locator('#copy-address').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#copy-status')).toHaveText('Address copied.');
});

test('navigation and verified outgoing destinations', async ({ page }) => {
  await page.goto('./');
  for (const [name, hash] of [['the token', '#token'], ['the split', '#allocation'], ['the origin', '#origin']]) {
    await page.getByRole('navigation').getByRole('link', { name }).click();
    expect(new URL(page.url()).hash).toBe(hash);
    await expect(page.locator(hash)).toBeInViewport();
  }
  const expected = [
    ['buy $MADE on Uniswap', `https://app.uniswap.org/swap?chain=mainnet&outputCurrency=${address}`],
    ['view on Etherscan', `https://etherscan.io/token/${address}`],
    ['view swarm launch #741', `https://explorer.imd.fun/token/${address}`],
    ['read the source', 'https://github.com/identity-md-launches/launch-741-swarm-made'],
    ['IMD swarm', 'https://imd.fun/'],
  ];
  for (const [name, url] of expected) {
    await page.goto('./');
    const link = page.getByRole('link', { name, exact: false });
    expect(await link.evaluate(el => el.href)).toBe(url);
    await page.route(url, route => route.fulfill({ contentType: 'text/html', body: '<p>External navigation intercepted for testing.</p>' }));
    await link.click();
    await page.waitForURL(url);
    await page.unroute(url);
  }
});

test('export uses local assets, no failing resources or browser errors', async ({ page }) => {
  const errors = [];
  const requests = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('requestfailed', request => errors.push(request.url()));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  page.on('request', request => requests.push(request.url()));
  await page.goto('./');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  expect(requests.every(url => url.startsWith('http://127.0.0.1:4179/preview/'))).toBe(true);
  expect(errors).toEqual([]);
  const sources = await page.locator('script[src], link[href]').evaluateAll(elements => elements.map(el => el.getAttribute('src') ?? el.getAttribute('href')));
  expect(sources.every(source => source.startsWith('./'))).toBe(true);
});

test('static content and system light theme work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, colorScheme: 'light', viewport: { width: 320, height: 900 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4179/preview/');
  await expect(page.locator('h1')).toHaveText('Swarm Made$MADE');
  await expect(page.getByRole('link', { name: 'buy $MADE on Uniswap' })).toBeVisible();
  await expect(page.locator('#theme-toggle')).toBeHidden();
  await expect(page.locator('#copy-address')).toBeHidden();
  await expect(page.locator('.copy-help')).toBeVisible();
  expect(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(246, 246, 240)');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  await context.close();
});

test('200% text enlargement and reduced motion retain content', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await page.addStyleTag({ content: ':root { font-size: 32px; }' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(768);
  await expect(page.locator('#token-address')).toHaveText(address);
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  await page.screenshot({ path: 'artifacts/text-200-percent.png', fullPage: true });
});

test('measure rendered theme contrast pairs', async ({ page }) => {
  const measurements = {};
  for (const theme of ['dark', 'light']) {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('./');
    measurements[theme] = await page.evaluate(() => {
      function rgb(color) { return color.match(/[\d.]+/g).slice(0, 3).map(Number); }
      function luminance(color) { return rgb(color).map(v => { const n = v / 255; return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0); }
      function pair(foreground, background) { const a = luminance(foreground), b = luminance(background); return { foreground, background, ratio: Number(((Math.max(a, b) + .05) / (Math.min(a, b) + .05)).toFixed(2)) }; }
      const style = selector => getComputedStyle(document.querySelector(selector));
      const body = style('body');
      const panel = style('.contract-panel');
      const button = style('.button-primary');
      const second = style('.button-secondary');
      const themeButton = style('.theme-toggle');
      const accent = style('.hero-arrow');
      return {
        body: pair(body.color, body.backgroundColor),
        mutedOnPage: pair(style('.hero-tagline').color, body.backgroundColor),
        mutedOnPanel: pair(style('.chain-label').color, panel.backgroundColor),
        address: pair(style('#token-address').color, panel.backgroundColor),
        primary: pair(button.color, button.backgroundColor),
        accentOnPage: pair(accent.color, body.backgroundColor),
        focusOnPanel: pair(accent.color, panel.backgroundColor),
        controlBorderOnPanel: pair(second.borderTopColor, panel.backgroundColor),
        controlBorderOnPage: pair(themeButton.borderTopColor, body.backgroundColor),
      };
    });
    for (const [name, selector, textSelector] of [
      ['themeHover', '.theme-toggle', null],
      ['resourceHover', '.resource-link', '.eyebrow'],
      ['primaryHover', '.button-primary', null],
    ]) {
      const element = page.locator(selector).first();
      await element.hover();
      measurements[theme][name] = await element.evaluate((el, textSelector) => {
        const foreground = getComputedStyle(textSelector ? el.querySelector(textSelector) : el).color;
        const background = getComputedStyle(el).backgroundColor;
        const luminance = color => color.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => { const n = v / 255; return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
        const a = luminance(foreground), b = luminance(background);
        return { foreground, background, ratio: Number(((Math.max(a, b) + .05) / (Math.min(a, b) + .05)).toFixed(2)) };
      }, textSelector);
    }
    for (const [name, pair] of Object.entries(measurements[theme])) expect(pair.ratio, `${theme} ${name}`).toBeGreaterThanOrEqual(name.includes('Border') || name.includes('focus') ? 3 : 4.5);
  }
  await writeFile('artifacts/contrast.json', JSON.stringify(measurements, null, 2) + '\n');
});
