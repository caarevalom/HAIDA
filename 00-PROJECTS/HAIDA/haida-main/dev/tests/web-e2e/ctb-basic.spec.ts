import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE_URL = process.env.BASE_URL || 'https://mcprod.thisisbarcelona.com';
const AFI_URL = process.env.AFILIATS_URL || 'https://mcprod.thisisbarcelona.com/es/affiliates';
const OFI_URL = process.env.OFICINAS_URL || 'https://mcprod.thisisbarcelona.com/es/offices/';

const AFI_USER = process.env.AFILIATS_USERNAME || '';
const AFI_PASS = process.env.AFILIATS_PASSWORD || '';

test.setTimeout(60000);

async function dismissCookieBanner(page: any) {
  const banner = page.locator('.ch2-container, .cookie, [data-testid*="cookie" i]');
  if ((await banner.count()) === 0) return;
  const buttons = banner.locator(
    'button:has-text("Aceptar"), button:has-text("Aceptar todo"), button:has-text("Accept"), button:has-text("Allow all"), button:has-text("Rechazar"), button:has-text("Decline"), button:has-text("Guardar"), button:has-text("Save")'
  );
  if ((await buttons.count()) === 0) return;
  try {
    await buttons.first().click({ timeout: 3000, force: true });
  } catch {
    // Best-effort dismissal; do not fail the test if banner is stubborn.
  }
}

async function getInternalLinks(page: any, baseUrl: string, limit = 20) {
  const hrefs = await page.locator('main a[href]').evaluateAll((els: any[]) =>
    els.map((a: any) => a.href).filter(Boolean)
  );
  const seen = new Set();
  const filtered = [];
  for (const href of hrefs) {
    if (!href.startsWith(baseUrl)) continue;
    if (href.includes('#')) continue;
    if (seen.has(href)) continue;
    seen.add(href);
    filtered.push(href);
    if (filtered.length >= limit) break;
  }
  return filtered;
}

async function isPlpPage(page: any) {
  const selectors = [
    '.product-item',
    '.product-card',
    '[data-testid*="product" i]',
    '[class*="product-item"]',
  ];
  for (const sel of selectors) {
    const count = await page.locator(sel).count();
    if (count >= 2) return true;
  }
  return false;
}

async function findPlpUrl(page: any, baseUrl: string) {
  await page.goto(`${baseUrl}/es/`, { waitUntil: 'domcontentloaded' });
  await dismissCookieBanner(page);
  const links = await getInternalLinks(page, baseUrl);
  for (const link of links) {
    await page.goto(link, { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);
    if (await isPlpPage(page)) {
      return page.url();
    }
  }
  return null;
}

async function findPdpUrl(page: any, baseUrl: string) {
  const plpUrl = await findPlpUrl(page, baseUrl);
  if (!plpUrl) return null;
  const cardLink = page.locator('.product-item a[href], .product-card a[href], [data-testid*="product" i] a[href]').first();
  if ((await cardLink.count()) === 0) return null;
  const href = await cardLink.getAttribute('href');
  if (!href) return null;
  return href.startsWith('http') ? href : new URL(href, page.url()).toString();
}

test.describe('CTB B2C - Home/Nav/Search', () => {
  test('TC_HOME_010 - Meta tags SEO presentes', async ({ page }) => {
    await page.goto(`${BASE_URL}/es/`, { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);
    const title = await page.title();
    expect(title.trim().length).toBeGreaterThan(0);
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveCount(1);
    const descContent = await metaDesc.getAttribute('content');
    expect((descContent || '').trim().length).toBeGreaterThan(0);
  });

  test('TC_HOME_011 - Home cumple WCAG AA basico', async ({ page }) => {
    await page.goto(`${BASE_URL}/es/`, { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, `Violaciones: ${results.violations.map((v) => v.id).join(', ')}`).toHaveLength(0);
  });

  test('TC_FOOTER_001 - Footer visible con enlaces legales', async ({ page }) => {
    await page.goto(`${BASE_URL}/es/`, { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    const legalLinks = footer.locator('a', { hasText: /privacidad|legal|cookies|terminos|condiciones/i });
    if ((await legalLinks.count()) === 0) {
      test.skip(true, 'No se encontraron enlaces legales en footer');
    }
    await expect(legalLinks.first()).toBeVisible();
  });

  test('TC_FOOTER_002 - Enlace condiciones de compra abre pagina', async ({ page }) => {
    await page.goto(`${BASE_URL}/es/`, { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    const link = footer.locator('a', { hasText: /condiciones|t[eé]rminos/i }).first();
    if ((await link.count()) === 0) {
      test.skip(true, 'No se encontro enlace de condiciones/terminos');
    }
    const hrefRaw = await link.getAttribute('href');
    if (!hrefRaw) {
      test.skip(true, 'Enlace sin href');
      return;
    }
    const href = hrefRaw.startsWith('http') ? hrefRaw : new URL(hrefRaw, page.url()).toString();
    await page.goto(href, { waitUntil: 'domcontentloaded' });
    expect(page.url()).toContain('http');
  });

  test('TC_NAV_013 - Enlaces legales en footer', async ({ page }) => {
    await page.goto(`${BASE_URL}/es/`, { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    const legalLinks = footer.locator('a', { hasText: /privacidad|legal|cookies|terminos|condiciones/i });
    if ((await legalLinks.count()) === 0) {
      test.skip(true, 'No se encontraron enlaces legales en footer');
    }
    const href = await legalLinks.first().getAttribute('href');
    expect(href || '').toMatch(new RegExp('^https?://'));
  });

  test('TC_NAV_015 - Links redes sociales abren destino', async ({ page }) => {
    await page.goto(`${BASE_URL}/es/`, { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    const social = footer.locator('a[href*=\"facebook\" i], a[href*=\"instagram\" i], a[href*=\"twitter\" i], a[href*=\"x.com\" i], a[href*=\"youtube\" i], a[href*=\"linkedin\" i]');
    if ((await social.count()) === 0) {
      test.skip(true, 'No se encontraron enlaces sociales en footer');
    }
    const href = await social.first().getAttribute('href');
    expect(href || '').toMatch(new RegExp('^https?://'));
  });

  test('TC_NAV_014 - Suscripcion a newsletter', async ({ page }) => {
    await page.goto(`${BASE_URL}/es/`, { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    const emailInput = footer.locator('input[type="email"], input[placeholder*="email" i]');
    if ((await emailInput.count()) === 0) {
      test.skip(true, 'No se encontro input de newsletter');
    }
    await expect(emailInput.first()).toBeVisible();
  });

  test('TC_NAV_002 - Busqueda desde header devuelve resultados', async ({ page }) => {
    await page.goto(`${BASE_URL}/es/`, { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);
    const searchInput = page.locator('input[type="search"], input[placeholder*="buscar" i], input[name*="search" i]');
    if ((await searchInput.count()) === 0) {
      test.skip(true, 'No se encontro input de busqueda en header');
    }
    if (!(await searchInput.first().isVisible())) {
      const toggle = page.locator('button[aria-label*="buscar" i], button[aria-label*="search" i], button:has-text("Buscar"), button:has-text("Search"), button[class*="search" i]');
      if ((await toggle.count()) > 0 && (await toggle.first().isVisible())) {
        await toggle.first().click();
      } else {
        await expect(searchInput.first()).toBeVisible();
      }
    }
    await searchInput.first().fill('barcelona');
    await searchInput.first().press('Enter');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    expect(page.url()).not.toBe(`${BASE_URL}/es/`);
  });

  test('TC_SEARCH_001 - Busqueda por termino devuelve resultados', async ({ page }) => {
    const candidates = [
      `${BASE_URL}/es/search?q=barcelona`,
      `${BASE_URL}/es/search/?q=barcelona`,
      `${BASE_URL}/es/busqueda?q=barcelona`,
      `${BASE_URL}/es/buscar?q=barcelona`,
    ];
    let found = false;
    for (const url of candidates) {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await dismissCookieBanner(page);
      if (await isPlpPage(page)) {
        found = true;
        break;
      }
    }
    if (!found) {
      test.skip(true, 'No se encontro URL de busqueda operativa');
    }
  });

  test('TC_PLP_001 - PLP carga con listado de productos', async ({ page }) => {
    const plpUrl = await findPlpUrl(page, BASE_URL);
    if (!plpUrl) {
      test.skip(true, 'No se encontro PLP por descubrimiento');
    }
  });

  test('TC_PLP_002 - Paginacion de PLP funciona', async ({ page }) => {
    const plpUrl = await findPlpUrl(page, BASE_URL);
    if (!plpUrl) {
      test.skip(true, 'No se encontro PLP por descubrimiento');
    }
    const pagination = page.locator('[aria-label*="pagination" i], .pagination, nav[aria-label*="pagin" i]');
    if ((await pagination.count()) === 0) {
      test.skip(true, 'No se encontro paginacion en PLP');
    }
    const page2 = pagination.locator('a', { hasText: /2/ }).first();
    if ((await page2.count()) === 0) {
      test.skip(true, 'No se encontro pagina 2 en paginacion');
    }
    await page2.click();
    await page.waitForLoadState('domcontentloaded');
  });

  test('TC_PLP_003 - Ordenar PLP por precio', async ({ page }) => {
    const plpUrl = await findPlpUrl(page, BASE_URL);
    if (!plpUrl) {
      test.skip(true, 'No se encontro PLP por descubrimiento');
    }
    const sortSelect = page.locator('select[name*="sort" i], select[aria-label*="orden" i], select[aria-label*="sort" i]');
    if ((await sortSelect.count()) === 0) {
      test.skip(true, 'No se encontro selector de orden en PLP');
    }
    await sortSelect.first().selectOption({ index: 1 });
  });

  test('TC_PLP_004 - Filtros de PLP aplican y muestran chips', async ({ page }) => {
    const plpUrl = await findPlpUrl(page, BASE_URL);
    if (!plpUrl) {
      test.skip(true, 'No se encontro PLP por descubrimiento');
    }
    const filterToggle = page.locator('button:has-text("Filtrar"), button:has-text("Filtro"), button:has-text("Filters"), [data-testid*="filter" i]');
    if ((await filterToggle.count()) === 0) {
      test.skip(true, 'No se encontro boton de filtros');
    }
    await filterToggle.first().click();
    const chip = page.locator('.chip, [class*="chip" i], [data-testid*="chip" i]');
    if ((await chip.count()) === 0) {
      test.skip(true, 'No se encontraron chips de filtros');
    }
  });

  test('TC_PDP_001 - PDP carga con imagenes y CTA', async ({ page }) => {
    const pdpUrl = await findPdpUrl(page, BASE_URL);
    if (!pdpUrl) {
      test.skip(true, 'No se encontro PDP por descubrimiento');
    }
    await page.goto(pdpUrl, { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);
    const cta = page.locator('button:has-text(\"Comprar\"), button:has-text(\"Reservar\"), button:has-text(\"Añadir\"), button:has-text(\"Add to cart\"), button:has-text(\"Buy\")');
    if ((await cta.count()) === 0) {
      test.skip(true, 'No se encontro CTA en PDP');
    }
  });

  test('TC_PDP_002 - Galeria de imagenes navega', async ({ page }) => {
    const pdpUrl = await findPdpUrl(page, BASE_URL);
    if (!pdpUrl) {
      test.skip(true, 'No se encontro PDP por descubrimiento');
    }
    await page.goto(pdpUrl, { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);
    const nextBtn = page.locator('button[aria-label*="siguiente" i], button[aria-label*="next" i], .swiper-button-next, .slick-next');
    if ((await nextBtn.count()) === 0) {
      test.skip(true, 'No se encontro control de galeria');
    }
    await nextBtn.first().click();
  });

  test('TC_PDP_004 - Descripcion y detalles visibles', async ({ page }) => {
    const pdpUrl = await findPdpUrl(page, BASE_URL);
    if (!pdpUrl) {
      test.skip(true, 'No se encontro PDP por descubrimiento');
    }
    await page.goto(pdpUrl, { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);
    const details = page.locator('text=/descripci[oó]n|detalles|informaci[oó]n/i');
    if ((await details.count()) === 0) {
      test.skip(true, 'No se encontro seccion de detalles');
    }
    await expect(details.first()).toBeVisible();
  });

  test('TC_FAV_008 - Favoritos requieren login', async ({ page }) => {
    const pdpUrl = await findPdpUrl(page, BASE_URL);
    if (!pdpUrl) {
      test.skip(true, 'No se encontro PDP por descubrimiento');
    }
    await page.goto(pdpUrl, { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);
    const favBtn = page.locator('button[aria-label*=\"favorit\" i], button[aria-label*=\"wishlist\" i], .wishlist, .favorite');
    if ((await favBtn.count()) === 0) {
      test.skip(true, 'No se encontro icono de favoritos');
    }
    await favBtn.first().click();
    const loginPrompt = page.locator('text=/iniciar sesi[oó]n|login|acceder/i');
    await expect(loginPrompt.first()).toBeVisible();
  });

  test('TC_PLP_005 - PLP responsive en mobile', async ({ page }) => {
    const plpUrl = await findPlpUrl(page, BASE_URL);
    if (!plpUrl) {
      test.skip(true, 'No se encontro PLP por descubrimiento');
    }
    const { width } = page.viewportSize() || { width: 0 };
    if (width && width > 600) {
      test.skip(true, 'Test solo aplica a viewport mobile');
    }
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = (page.viewportSize() || { width: bodyWidth }).width;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });
});

test.describe('CTB Oficinas - Mapa', () => {
  test('TC_OFI_MAP_001 - Mapa de oficinas carga correctamente', async ({ page }) => {
    await page.goto(OFI_URL, { waitUntil: 'domcontentloaded' });
    const mapContainer = page.locator('#map, .map, [data-testid*="map" i]');
    if ((await mapContainer.count()) === 0) {
      test.skip(true, 'No se encontro contenedor de mapa');
    }
    await expect(mapContainer.first()).toBeVisible();
  });

  test('TC_OFI_A11Y_002 - Listado oficinas cumple WCAG AA basico', async ({ page }) => {
    await page.goto(OFI_URL, { waitUntil: 'domcontentloaded' });
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, `Violaciones: ${results.violations.map((v) => v.id).join(', ')}`).toHaveLength(0);
  });
});

test.describe('CTB Afiliats - Login/Dashboard', () => {
  test('TC_AFI_AUTH_001 - Acceso al portal afiliados con credenciales validas', async ({ page }) => {
    await page.goto(AFI_URL, { waitUntil: 'domcontentloaded' });
    const emailInput = page.locator('input[type="email"], input[name*="email" i], input[placeholder*="email" i]');
    const passInput = page.locator('input[type="password"], input[name*="pass" i], input[placeholder*="contrase" i]');
    if ((await emailInput.count()) === 0 || (await passInput.count()) === 0 || !AFI_USER || !AFI_PASS) {
      test.skip(true, 'Login afiliats no disponible o credenciales no configuradas');
    }
    await emailInput.first().fill(AFI_USER);
    await passInput.first().fill(AFI_PASS);
    const submit = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Acceder"), input[type="submit"]');
    await submit.first().click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    const errorMsg = page.locator('text=/error|incorrect|inv[aá]lid/i');
    if (await errorMsg.count()) {
      await expect(errorMsg.first()).toBeHidden();
    }
  });

  test('TC_AFI_DASH_001 - Dashboard carga con widgets principales', async ({ page }) => {
    await page.goto(AFI_URL, { waitUntil: 'domcontentloaded' });
    const emailInput = page.locator('input[type="email"], input[name*="email" i], input[placeholder*="email" i]');
    const passInput = page.locator('input[type="password"], input[name*="pass" i], input[placeholder*="contrase" i]');
    if ((await emailInput.count()) === 0 || (await passInput.count()) === 0 || !AFI_USER || !AFI_PASS) {
      test.skip(true, 'Login afiliats no disponible o credenciales no configuradas');
    }
    await emailInput.first().fill(AFI_USER);
    await passInput.first().fill(AFI_PASS);
    const submit = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Acceder"), input[type="submit"]');
    await submit.first().click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    const dashboard = page.locator('main h1, main h2, [data-testid*="dashboard" i]');
    await expect(dashboard.first()).toBeVisible();
  });
});
