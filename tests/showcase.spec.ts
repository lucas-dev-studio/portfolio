import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("desktop presents two real cases and a clear contact path", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveTitle(/Lucas/);
  await expect(page.locator(".ns-project")).toHaveCount(2);
  await expect(page.locator(".ns-hero-object .sculpture-canvas")).toHaveAttribute("data-ready", "true");
  await expect(page.getByRole("heading", { name: "SANDBOX®" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "APRENDER+" })).toBeVisible();
  await expect(page.locator("#sobre-sandbox img")).toHaveAttribute("src", "/images/sandbox.png");
  await expect(page.locator("#sobre-educacional [role='img']")).toHaveAttribute("aria-label", /Representação visual/);
  const quote = page.getByRole("link", { name: "Vamos construir o seu" });
  const url = new URL((await quote.getAttribute("href"))!);
  expect(url.hostname).toBe("wa.me");
  expect(url.pathname).toBe("/5511965117938");
  expect(errors).toEqual([]);
});

test("service controls switch both content and visual", async ({ page }) => {
  await page.goto("/");
  const automation = page.getByRole("button", { name: /02 Menos repetição/ });
  await automation.click();
  await expect(automation).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("Ferramentas sob medida para conectar etapas", { exact: false })).toBeVisible();
  await expect(page.locator(".ns-cap-automation")).toBeVisible();
  const ai = page.getByRole("button", { name: /03 IA onde ela realmente/ });
  await ai.click();
  await expect(ai).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".ns-cap-ai")).toBeVisible();
});

test("mobile menu, anchors and layouts work without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Abrir menu" });
  await menu.click();
  await expect(page.getByRole("button", { name: "Fechar menu" })).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: /Projetos/i }).click();
  await expect(page).toHaveURL(/#projetos$/);
  await expect(page.getByRole("button", { name: "Abrir menu" })).toHaveAttribute("aria-expanded", "false");
  for (const width of [375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test("motion can be paused and reduced-motion preference keeps content readable", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Pausar animação 3D" }).click();
  await expect(page.getByRole("button", { name: "Reproduzir animação 3D" })).toBeVisible();
  await page.getByRole("button", { name: "Pausar faixa animada" }).click();
  await expect(page.locator(".ns-marquee-paused")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.getByRole("button", { name: "Animação desativada pela preferência de movimento reduzido" })).toBeDisabled();
  await expect(page.locator(".ns-manifesto h2")).toBeVisible();
});

test("internal destinations and accessibility scan", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const invalid = await page.locator('a[href^="#"]').evaluateAll(links => links.map(e => e.getAttribute("href")).filter(href => !href || !document.getElementById(href.slice(1))));
  expect(invalid).toEqual([]);
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
});
