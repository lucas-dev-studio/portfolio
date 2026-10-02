import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const scene = (chapter: string) => `[data-scene="${chapter}"]`;

test('Lucas presents two real projects and a direct quotation route', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/Lucas/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/próximo\s*salto/i);
  await expect(page.locator(scene('hero'))).toHaveAttribute('data-ready', 'true', { timeout: 15000 });
  for (const id of ['sobre-sandbox', 'sobre-educacional']) {
    const project = page.locator(`#${id}`);
    await project.scrollIntoViewIfNeeded();
    await expect(project.getByRole('heading')).toBeVisible();
    const details = project.locator('details');
    await expect(details).not.toHaveAttribute('open', '');
    await details.locator('summary').click();
    await expect(details).toHaveAttribute('open', '');
    await expect(project).toContainText(/Azure/);
    await expect(details).toContainText(/desafio/i);
  }
  await expect(page.locator('#sobre-educacional')).toContainText(/representação/i);
  const quote = page.getByRole('link', { name: 'Começar um projeto', exact: true }).first();
  const contact = new URL((await quote.getAttribute('href'))!);
  expect(contact.origin).toBe('https://wa.me');
  expect(contact.pathname).toBe('/5511965117938');
  expect(errors).toEqual([]);
});

for (const chapter of ['hero', 'sandbox', 'education', 'systems', 'contact']) {
  test('spatial chapter renders a usable canvas: ' + chapter, async ({ page }) => {
    await page.goto('/');
    const world = page.locator(scene(chapter));
    await world.evaluate(el => el.scrollIntoView({block: 'center', behavior: 'instant'}));
    await expect(world).toHaveAttribute('data-ready', 'true', { timeout: 15000 });
    await expect(world.locator('canvas')).toHaveCount(1);
    const box = (await world.locator('canvas').boundingBox())!;
    expect(box.width).toBeGreaterThan(300);
    expect(box.height).toBeGreaterThan(300);
  });
}

test('service controls select distinct spatial assemblies and contextual contact', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('#servicos');
  await section.scrollIntoViewIfNeeded();
  for (const [name, value] of [['Sites', 'sites'], ['Automação', 'automation'], ['IA', 'ai']]) {
    const control = section.getByRole('button', { name, exact: true });
    await control.click();
    await expect(control).toHaveAttribute('aria-pressed', 'true');
    await expect(section.locator(scene('systems'))).toHaveAttribute('data-service', value);
    await expect(section.locator(scene('systems'))).toHaveAttribute('data-ready', 'true', { timeout: 15000 });
  }
});

test('global pause freezes rendered 3D and remains active in later chapters', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator(scene('hero'))).toHaveAttribute('data-ready', 'true', { timeout: 15000 });
  await page.getByRole('button', { name: 'Pausar animações', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Reproduzir animações', exact: true })).toBeVisible();
  await expect(page.locator('[data-scene][data-paused="false"]')).toHaveCount(0);
  const canvas = page.locator(`${scene('hero')} canvas`);
  await page.waitForTimeout(200);
  const first = await canvas.screenshot();
  await page.waitForTimeout(300);
  expect((await canvas.screenshot()).equals(first)).toBe(true);
  const contact = page.locator(scene('contact'));
  await contact.scrollIntoViewIfNeeded();
  await expect(contact).toHaveAttribute('data-paused', 'true');
  await expect(contact).toHaveAttribute('data-ready', 'true', { timeout: 15000 });
});

test('portrait navigation and all chapter layouts preserve access without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Abrir menu', exact: true });
  await menu.click();
  await expect(page.getByRole('button', { name: 'Fechar menu', exact: true })).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await menu.click();
  await page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('link', { name: /Projetos/ }).click();
  await expect(page).toHaveURL(/#projetos$/);
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
});

for (const width of [375, 390, 768, 1024, 1440]) {
  test('chapter layouts avoid overflow at ' + width + 'px', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width, height: 900 });
    for (const id of ['inicio', 'sobre-sandbox', 'sobre-educacional', 'servicos', 'contato']) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}

test('reduced motion preserves final project evidence, controls and contact', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Movimento reduzido', exact: true })).toBeDisabled();
  await expect(page.locator('[data-scene][data-paused="false"]')).toHaveCount(0);
  for (const id of ['sobre-sandbox', 'sobre-educacional', 'contato']) {
    const section = page.locator(`#${id}`);
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole('heading').first()).toBeVisible();
    await expect(section.getByRole('link').first()).toBeVisible();
  }
});

test('internal anchors and accessibility scan preserve the whole experience', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const invalid = await page.locator('a[href^="#"]').evaluateAll(links => links.map(el => el.getAttribute('href')).filter(href => !href || !document.getElementById(href.slice(1))));
  expect(invalid).toEqual([]);
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
});
