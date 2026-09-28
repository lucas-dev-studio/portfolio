import { test, expect } from '@playwright/test';

test('security headers enforce the static-site boundary', async ({ request }) => {
  const response = await request.get('/');
  expect(response.status()).toBe(200);
  const h = response.headers();
  expect(h['content-security-policy']).toContain("script-src 'self'");
  expect(h['content-security-policy']).not.toMatch(/unsafe-eval|script-src[^;]*unsafe-inline/);
  for (const directive of ['connect-src', 'frame-ancestors', 'object-src', 'base-uri', 'form-action', 'worker-src']) expect(h['content-security-policy']).toContain(`${directive} 'none'`);
  expect(h['strict-transport-security']).toMatch(/max-age=31536000/);
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['x-frame-options']).toBe('DENY');
  expect(h['referrer-policy']).toBe('no-referrer');
  expect(h['permissions-policy']).toContain('microphone=()');
  expect(h['permissions-policy']).toContain('camera=()');
  expect(h['cross-origin-opener-policy']).toBe('same-origin');
  expect(h['cross-origin-resource-policy']).toBe('same-origin');
  expect(h['set-cookie']).toBeUndefined();
});

for (const path of ['/.env','/.env.production','/.git/config','/package.json','/package-lock.json','/src/main.tsx','/vite.config.ts','/@vite/client','/backup.zip','/db.sql','/admin','/api/chat','/assets/index.js.map','/_headers']) {
  test(`private or nonexistent path returns 404: ${path}`, async ({ request }) => {
    const response = await request.get(path);
    expect(response.status()).toBe(404);
    const body = await response.text();
    expect(body).not.toMatch(/PRIVATE KEY|node_modules|stack trace|DATABASE_URL|VITE_.*KEY/);
  });
}

test('untrusted origins receive no CORS access or credential grant', async ({ request }) => {
  const response = await request.get('/', { headers: { Origin: 'https://untrusted.invalid' } });
  expect(response.headers()['access-control-allow-origin']).toBeUndefined();
  expect(response.headers()['access-control-allow-credentials']).toBeUndefined();
});

test('CSP blocks inline script, external scripts and data connections', async ({ page }) => {
  await page.goto('/');
  const results = await page.evaluate(async () => {
    const marker = document.createElement('script');
    marker.textContent = "document.documentElement.dataset.inlineExecuted='yes'";
    document.body.append(marker);
    const external = await new Promise<boolean>(resolve => {
      const script = document.createElement('script');
      script.src = 'https://untrusted.invalid/payload.js';
      script.onerror = () => resolve(false); script.onload = () => resolve(true);
      document.body.append(script);
    });
    const connection = await fetch('/security-probe').then(() => true, () => false);
    return { inline: document.documentElement.dataset.inlineExecuted, external, connection };
  });
  expect(results).toEqual({ inline: undefined, external: false, connection: false });
});

test('3D, navigation, panels and contact work under CSP without violations', async ({ page, context }) => {
  const errors: string[] = [];
  const requests: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', message => { if (/Content Security Policy|Refused to/i.test(message.text())) errors.push(message.text()); });
  page.on('request', r => requests.push(r.url()));
  await page.goto('/');
  await expect(page.locator('.hero-sequence .sculpture-canvas')).toHaveAttribute('data-ready','true');
  await page.getByRole('button', {name:'Pausar animação 3D', exact:true}).click();
  await expect(page.getByRole('button', {name:'Reproduzir animação 3D',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'02 Menos tarefas. Mais tempo.'}).click();
  await expect(page.locator('#painel-automacao')).toBeVisible();
  for (const selector of ['.service-sculpture','.about-sculpture','.contact-sculpture']) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await expect(page.locator(`${selector} .sculpture-canvas`)).toHaveAttribute('data-ready','true');
  }
  const links = await page.locator('a[target="_blank"]').evaluateAll(links => links.map(el => ({href:(el as HTMLAnchorElement).href,rel:el.getAttribute('rel')})));
  expect(links.length).toBeGreaterThan(5);
  for (const link of links) {
    expect(new URL(link.href).origin).toBe('https://wa.me');
    expect(new URL(link.href).pathname).toBe('/5511965117938');
    expect(link.rel).toContain('noopener'); expect(link.rel).toContain('noreferrer');
  }
  const origin = new URL(page.url()).origin;
  expect(requests.filter(url => new URL(url).origin !== origin)).toEqual([]);
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => ({local:localStorage.length,session:sessionStorage.length}))).toEqual({local:0,session:0});
  expect(errors).toEqual([]);
});

test('query and fragment payloads are never rendered as markup or redirects', async ({ page }) => {
  await page.goto('/?next=https://untrusted.invalid&name=%3Csvg%20onload%3Dalert(1)%3E#%3Cimg%20src%3Dx%3E');
  await expect(page.locator('h1')).toContainText('SEU PRÓXIMO');
  expect(new URL(page.url()).hostname).not.toBe('untrusted.invalid');
  expect(await page.locator('svg[onload],img[src="x"]').count()).toBe(0);
});
