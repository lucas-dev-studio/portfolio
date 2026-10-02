import { test, expect } from '@playwright/test';
import * as THREE from 'three';
import { createMobileBlade, MOBILE_BLADE_SCALE, MOBILE_BLADE_SPACING, createRibbonRib, createRibbonSection, RIB_COUNT, RIB_SPACING } from '../src/components/studio-geometry';

test('fabricated hero ribs have disjoint solid bounds and a nonintersecting section', () => {
  const geometry = createRibbonRib();
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox!;
  expect(RIB_COUNT).toBeGreaterThan(20);
  expect(RIB_SPACING - (bounds.max.z - bounds.min.z)).toBeGreaterThan(.01);
  const points = createRibbonSection().getPoints(80);
  const cross = (a: {x:number;y:number}, b: {x:number;y:number}, c: {x:number;y:number}) => (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
  let crossings=0;
  for (let i = 0; i < points.length-1; i++) for (let j = i+2; j < points.length-1; j++) {
    if (i === 0 && j === points.length-2) continue;
    const a=points[i], b=points[i+1], c=points[j], d=points[j+1];
    const intersects=cross(a,b,c)*cross(a,b,d)<-1e-10 && cross(c,d,a)*cross(c,d,b)<-1e-10;
    if (intersects) crossings++;
  }
  expect(crossings).toBe(0);
  geometry.dispose();
});

test('WebGL failure leaves project evidence and contact usable', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type: string, ...args: unknown[]) {
      if (/webgl/i.test(type)) return null;
      return original.call(this, type, ...args);
    } as typeof original;
  });
  await page.goto('/');
  const hero = page.locator('[data-scene="hero"]');
  await expect(hero).toHaveAttribute('data-fallback', 'true', { timeout: 15000 });
  await expect(hero.locator('.studio-scene-fallback')).toBeVisible();
  const sandbox = page.locator('#sobre-sandbox');
  await sandbox.scrollIntoViewIfNeeded();
  await expect(sandbox.locator('[data-scene="sandbox"]')).toHaveAttribute('data-fallback','true');
  await expect(sandbox.locator('img[src="/images/sandbox.png"]')).toBeVisible();
  await expect(sandbox.getByRole('link', {name:'Criar algo assim'})).toBeVisible();
  const contact=page.locator('#contato');
  await contact.scrollIntoViewIfNeeded();
  await expect(contact.getByRole('link',{name:'Falar com Lucas no WhatsApp'})).toBeVisible();
});

test('kinetic contact blades remain separated through their animation range', () => {
  const geometry = createMobileBlade();
  const blades = Array.from({ length: 5 }, (_, i) => {
    const blade = new THREE.Mesh(geometry);
    blade.position.x = (i - 2) * MOBILE_BLADE_SPACING;
    blade.scale.setScalar(MOBILE_BLADE_SCALE);
    blade.rotation.set(.1, 0, -.2 + i * .10);
    return blade;
  });
  let minimumGap = Infinity;
  for (let sample = 0; sample < 1000; sample++) {
    const boxes = blades.map((blade, i) => {
      blade.rotation.y = -.35 + i * .16 + Math.sin(sample / 40 * .55 + i) * .23;
      blade.updateMatrixWorld(true);
      return new THREE.Box3().setFromObject(blade);
    });
    for (let i = 1; i < boxes.length; i++) minimumGap = Math.min(minimumGap, boxes[i].min.x - boxes[i - 1].max.x);
  }
  expect(minimumGap).toBeGreaterThan(.3);
  geometry.dispose();
});
