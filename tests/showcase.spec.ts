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
  await expect(page.locator(".ns-service-stage .ns-world-sites")).toHaveAttribute("data-ready", "true");
  const automation = page.getByRole("button", { name: /02 Automação em movimento/ });
  await automation.click();
  await expect(automation).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("O trabalho repetitivo sai de cena.", { exact: true })).toBeVisible();
  await expect(page.locator(".ns-service-stage .ns-world-automation")).toHaveAttribute("data-ready", "true");
  const ai = page.getByRole("button", { name: /03 Inteligência que age/ });
  await ai.click();
  await expect(ai).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".ns-service-stage .ns-world-ai")).toHaveAttribute("data-ready", "true");
});

test("project chapters lead with visuals and reveal supporting details on request", async ({ page }) => {
  await page.goto("/");
  for (const id of ["sobre-sandbox", "sobre-educacional"]) {
    const chapter = page.locator(`#${id}`);
    const visual = chapter.locator(".ns-project-showcase");
    const info = chapter.locator(".ns-project-info");
    expect((await visual.boundingBox())!.width).toBeGreaterThan((await info.boundingBox())!.width * 0.8);
    const details = chapter.locator("details");
    await expect(details).not.toHaveAttribute("open", "");
    await details.locator("summary").click();
    await expect(details).toHaveAttribute("open", "");
    await expect(details.getByText("O DESAFIO")).toBeVisible();
  }
});

test("different 3D worlds render in services, about and contact", async ({ page }) => {
  await page.goto("/");
  for (const [section, variant] of [["#servicos", "sites"], ["#sobre", "monolith"], ["#contato", "burst"]] as const) {
    const world = page.locator(`${section} .ns-world-${variant}`);
    await world.scrollIntoViewIfNeeded();
    await expect(world).toHaveAttribute("data-ready", "true");
    await expect(world.locator("canvas")).toHaveCount(1);
  }
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
