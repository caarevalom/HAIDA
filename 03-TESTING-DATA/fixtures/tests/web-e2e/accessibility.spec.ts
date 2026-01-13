
import { test, expect } from '@playwright/test';
import axeSource from 'axe-core';

test('Accesibilidad básica (WCAG) en home', async ({ page, baseURL }) => {
  await page.goto(baseURL!, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  await page.addScriptTag({ content: axeSource.source });

  const results = await page.evaluate(async () => {
    return await (window as any).axe.run(document, {
      runOnly: ['wcag2a', 'wcag2aa']
    });
  });

  const violations = results.violations || [];
  if (violations.length) {
    const report = violations.map((v: any) => `• ${v.id} (${v.impact}) — ${v.help}`).join('\n');
    test.info().annotations.push({ type: 'accessibility', description: report });
  }
  expect(violations, `Violaciones encontradas: ${violations.map((v:any)=>v.id).join(', ')}`).toHaveLength(0);
});
