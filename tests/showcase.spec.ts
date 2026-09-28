import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("desktop: projects, navigation, scrolling and keyboard access", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveTitle(/Luca/);
  await expect(page.locator(".work-chapter")).toHaveCount(2);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(
    page.locator(".hero-sequence .sculpture-canvas"),
  ).toHaveAttribute("data-ready", "true");
  await page.getByRole("button", { name: "Pausar animação 3D" }).click();
  await page.screenshot({
    path: "../preview-desktop.png",
    animations: "disabled",
  });
  await page
    .getByRole("link", { name: "Explorar projetos", exact: true })
    .click();
  await expect(page).toHaveURL(/#projetos$/);
  await page
    .getByRole("link", { name: "Conhecer o projeto SANDBOX", exact: true })
    .focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", {
      name: "Conhecer o projeto Sistema Educacional",
      exact: true,
    }),
  ).toBeFocused();
  await expect
    .poll(async () =>
      page
        .locator(".work-educacional")
        .evaluate(
          (e) => e.getBoundingClientRect().right <= window.innerWidth + 1,
        ),
    )
    .toBe(true);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#sobre-educacional$/);
  await expect
    .poll(async () =>
      page
        .locator("#sobre-educacional")
        .evaluate((e) => Math.abs(e.getBoundingClientRect().top) < 100),
    )
    .toBe(true);
  await page.getByRole("link", { name: "Voltar ao topo" }).click();
  await expect(page).toHaveURL(/#inicio$/);
  expect(errors).toEqual([]);
});

test("mobile, tablet and desktop resize without duplicate pins or overflow", async ({
  page,
}) => {
  await page.goto("/");
  for (const width of [375, 390, 768, 1024, 1440, 375, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(async () =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(
    page.locator(".hero-sequence .sculpture-canvas"),
  ).toHaveAttribute("data-ready", "true");
  await page.screenshot({
    path: "../preview-mobile.png",
    animations: "disabled",
  });
  await page
    .getByRole("link", { name: "Explorar projetos", exact: true })
    .click();
  await page
    .getByRole("link", {
      name: "Conhecer o projeto Sistema Educacional",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/#sobre-educacional$/);
});

test("reduced motion: static layout and preference changes clean up scrolling", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator(".work-device").first()).toHaveCSS(
    "transform",
    "none",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".work-device").first()).not.toHaveCSS(
    "transform",
    "none",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator(".work-device").first()).toHaveCSS(
    "transform",
    "none",
  );
});

test("accessibility scan and valid internal destinations", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const invalid = await page
    .locator('a[href^="#"]')
    .evaluateAll((links) =>
      links
        .map((e) => e.getAttribute("href"))
        .filter((href) => !href || !document.getElementById(href.slice(1))),
    );
  expect(invalid).toEqual([]);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    results.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
});

test("commercial flow: service panels, quote links and FAQ", async ({
  page,
}) => {
  await page.goto("/");
  const automation = page.getByRole("button", {
    name: "02 Menos tarefas. Mais tempo.",
  });
  await automation.click();
  await expect(automation).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#painel-automacao")).toBeVisible();
  await expect(page.locator("#painel-sites")).toBeHidden();
  const link = page.locator("#painel-automacao a");
  const address = new URL((await link.getAttribute("href"))!);
  expect(address.hostname).toBe("wa.me");
  expect(address.pathname).toBe("/5511965117938");
  expect(address.searchParams.get("text")).toContain("automação em Python");
  await page
    .getByRole("button", { name: "03 Inteligência que faz sentido." })
    .click();
  await expect(page.locator("#painel-ia")).toBeVisible();
  await page
    .locator("summary")
    .filter({ hasText: "Quanto custa um projeto?" })
    .click();
  await expect(
    page.getByText("O orçamento depende do escopo", { exact: false }),
  ).toBeVisible();
  const destinations = await page
    .locator('a[href^="https://wa.me/"]')
    .evaluateAll((links) =>
      links.map((link) => new URL((link as HTMLAnchorElement).href).pathname),
    );
  expect(destinations.length).toBeGreaterThan(5);
  expect(destinations.every((path) => path === "/5511965117938")).toBe(true);
});

test("3D renders once and can be paused, including reduced motion", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.locator(".hero-sequence .sculpture-canvas"),
  ).toHaveAttribute("data-ready", "true");
  await expect(
    page.locator(".hero-sequence .sculpture-canvas canvas"),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Pausar animação 3D" }).click();
  await expect(
    page.getByRole("button", { name: "Reproduzir animação 3D" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reproduzir animação 3D" }).click();
  await expect(
    page.getByRole("button", { name: "Pausar animação 3D" }),
  ).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    page.getByRole("button", {
      name: "Animação desativada pela preferência de movimento reduzido",
    }),
  ).toBeDisabled();
});

test("project chapter previews", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page
    .locator(".work-sandbox")
    .screenshot({ path: "../preview-projetos.png" });
  await page
    .locator(".work-educacional")
    .screenshot({ path: "../preview-educacional.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .locator(".work-sandbox")
    .screenshot({ path: "../preview-projetos-mobile.png" });
});

test("scroll choreography progresses and reduced motion restores readable content", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveAttribute("aria-label", /SEU/);
  const scene = page.locator(".idea-story");
  const bounds = await scene.boundingBox();
  expect(bounds).not.toBeNull();
  const distance = bounds!.height - 900;
  await page.evaluate(
    (y) => window.scrollTo({ top: y, behavior: "instant" }),
    bounds!.y,
  );
  await expect(page.locator(".idea-phase").nth(0)).toHaveCSS("opacity", "1");
  const first = await page
    .locator(".idea-particle")
    .first()
    .evaluate((el) => getComputedStyle(el).transform);
  await page.evaluate(
    (y) => window.scrollTo({ top: y, behavior: "instant" }),
    bounds!.y + distance * 0.5,
  );
  await expect(page.locator(".idea-phase").nth(1)).toHaveCSS("opacity", "1");
  await expect(page.locator(".idea-particle").first()).not.toHaveCSS(
    "transform",
    first,
  );
  await page.screenshot({ path: "../preview-motion.png" });
  await page.evaluate(
    (y) => window.scrollTo({ top: y, behavior: "instant" }),
    bounds!.y + distance,
  );
  await expect(page.locator(".idea-phase").nth(2)).toHaveCSS("opacity", "1");
  for (let i = 0; i < 2; i++) {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator(".idea-sticky")).toHaveCSS(
      "position",
      "relative",
    );
    await expect(page.locator("h1")).not.toHaveAttribute("aria-label", /SEU/);
    await expect(page.locator(".studio-contact h2")).toHaveText(/VAMOS FAZER/);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(page.locator(".idea-sticky")).toHaveCSS("position", "sticky");
    await expect(page.locator("h1")).toHaveAttribute("aria-label", /SEU/);
  }
});

test("mobile motion scene stays within viewport and keyboard skip link works", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Pular para o conteúdo" });
  await expect(skip).toBeFocused();
  await expect(skip).toHaveCSS("opacity", "1");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#conteudo$/);
  const box = await page.locator(".idea-story").boundingBox();
  await page.evaluate(
    (y) => window.scrollTo({ top: y, behavior: "instant" }),
    box!.y + (box!.height - 844) * 0.5,
  );
  await expect(page.locator(".idea-phase").nth(1)).toHaveCSS("opacity", "1");
  expect(
    await page.locator(".idea-particle").evaluateAll((els) =>
      els.every((el) => {
        const r = el.getBoundingClientRect();
        return (
          r.left >= 0 &&
          r.right <= innerWidth &&
          r.top >= 0 &&
          r.bottom <= innerHeight
        );
      }),
    ),
  ).toBe(true);
  await page.screenshot({ path: "../preview-motion-mobile.png" });
});

test("cinematic hero transforms into its second scene and project stages stay usable", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveAttribute("aria-label", /SEU/);
  const scene = await page.locator(".hero-sequence").boundingBox();
  await page.evaluate(
    (y) => window.scrollTo({ top: y, behavior: "instant" }),
    scene!.y + scene!.height - 900,
  );
  await expect(page.locator(".hero-second-scene")).toHaveCSS(
    "clip-path",
    "inset(0% 0px 0px)",
  );
  await page.screenshot({ path: "../preview-cinematic.png" });
  await page
    .getByRole("link", { name: "Explorar projetos", exact: true })
    .click();
  await expect(page).toHaveURL(/#projetos$/);
  await page
    .getByRole("link", { name: "Conhecer o projeto SANDBOX", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#sobre-sandbox$/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".hero-second-scene")).toBeHidden();
  await expect(page.locator(".work-chapter").first()).not.toHaveCSS(
    "position",
    "sticky",
  );
});
