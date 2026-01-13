import { test, expect } from '@playwright/test';

const normalizeURL = (url: string) => {
  try {
    const u = new URL(url);
    u.hash = '';
    return u.toString();
  } catch {
    return url;
  }
};

test.describe('Smoke & Health checks', () => {
  test('Home carga sin errores y estado OK', async ({ page, baseURL }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    const resp = await page.goto(baseURL!, { waitUntil: 'domcontentloaded', timeout: 45000 });
    expect(resp).toBeTruthy();
    const status = resp!.status();
    expect(status).toBeGreaterThanOrEqual(200);
    expect(status).toBeLessThan(400);

    await page.waitForLoadState('networkidle');

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(hasHorizontalOverflow, 'No debe haber overflow horizontal').toBeFalsy();

    const unloadedImages = await page.evaluate(() =>
      Array.from(document.images)
        .filter((img) => img.naturalWidth === 0 || img.naturalHeight === 0)
        .map((img) => img.src)
    );
    expect(unloadedImages, `Imágenes no cargadas: ${unloadedImages.join(', ')}`).toHaveLength(0);

    expect(consoleErrors, `Errores de consola: \n${consoleErrors.join('\n')}`).toHaveLength(0);

    const title = await page.title();
    if (!title || title.trim().length === 0) {
      const hasRootContent = await page.evaluate(() => {
        const root = document.querySelector('#root');
        const bodyText = document.body?.innerText || '';
        return Boolean(root?.textContent?.trim() || bodyText.trim());
      });
      expect(hasRootContent, 'La pagina debe renderizar contenido visible').toBeTruthy();
    } else {
      expect(title.trim().length).toBeGreaterThan(0);
    }
  });

  test('Enlaces internos no rotos (HEAD/GET)', async ({ page, baseURL, request }) => {
    await page.goto(baseURL!, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForLoadState('networkidle');

    const links = await page.$$eval('a[href]', (as) =>
      Array.from(as)
        .map((a) => (a as HTMLAnchorElement).href)
        .filter(Boolean)
    );
    const origin = new URL(baseURL!).origin;
    const internal = Array.from(
      new Set(links.map(normalizeURL).filter((href) => href.startsWith(origin)))
    ).slice(0, 50);

    const broken: { url: string; status?: number; error?: string }[] = [];

    for (const url of internal) {
      try {
        let res = await request.head(url);
        if (!res || res.status() >= 400) res = await request.get(url);
        const st = res.status();
        if (st >= 400) broken.push({ url, status: st });
      } catch (e: any) {
        broken.push({ url, error: e?.message || String(e) });
      }
    }

    expect(
      broken,
      `Enlaces internos rotos:\n${broken.map((b) => `${b.url} (${b.status ?? b.error})`).join('\n')}`
    ).toHaveLength(0);
  });
});
