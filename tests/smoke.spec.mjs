// What must always hold on the published site, in both languages, on desktop and phone.
import { test, expect } from "@playwright/test";

const PAGES = [
  { path: "/", lang: "pt-BR", h1: /labirinto/i },
  { path: "/en/", lang: "en", h1: /maze/i },
  { path: "/tatame.html", lang: "pt-BR", h1: /tatame/i },
  { path: "/en/tatame.html", lang: "en", h1: /mat/i }
];

/* console errors and failed requests fail the test; WebGL driver notices from headless Chrome do not */
function watch(page) {
  const problems = [];
  page.on("pageerror", e => problems.push(`pageerror: ${e.message}`));
  page.on("console", m => { if (m.type() === "error" && !/WebGL|GPU|GL_|swiftshader/i.test(m.text())) problems.push(`console: ${m.text()}`); });
  page.on("requestfailed", r => problems.push(`failed: ${r.url()}`));
  page.on("response", r => { if (r.status() >= 400 && new URL(r.url()).hostname === "localhost") problems.push(`${r.status()}: ${r.url()}`); });
  return problems;
}

for (const p of PAGES) {
  test(`${p.path} loads cleanly`, async ({ page }) => {
    const problems = watch(page);
    await page.goto(p.path);
    await expect(page.locator("html")).toHaveAttribute("lang", p.lang);
    await expect(page.locator("h1")).toHaveText(p.h1);
    await expect(page.locator("html")).toHaveClass(/scene-ready/, { timeout: 15_000 });
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await page.waitForTimeout(800);
    expect(problems, problems.join("\n")).toEqual([]);
  });
}

test("main page: tools, certifications, email and no horizontal scroll", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#eco .tool-b")).toHaveCount(14);
  await expect(page.locator("#techCerts .cert")).toHaveCount(8);
  await expect(page.locator("#lawCerts .cert")).toHaveCount(5);
  await expect(page.locator(".mail-line .em")).toHaveText(/@/);              // assembled at runtime (the served HTML is checked below)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.locator('#eco .tool-b[data-id="ccode"]').click();
  await expect(page.locator("#gwOut h4")).toHaveText("Claude Code");
});

test("served HTML does not contain the email address", async ({ request }) => {
  for (const path of ["/", "/en/"]) {
    const body = await (await request.get(path)).text();
    expect(body).not.toContain("juridicojulianacampos@gmail.com");
  }
});

test("language button switches between the two URLs", async ({ page }) => {
  await page.goto("/");
  await page.locator("#lang").click();
  await expect(page).toHaveURL(/\/en\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.locator("#lang").click();
  await expect(page).toHaveURL(/localhost:4173\/$/);
});

test("finale: reaching the end turns the screen orange", async ({ page, isMobile }) => {
  test.skip(isMobile, "checked once, on desktop");
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/scene-ready/, { timeout: 15_000 });
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; scrollTo(0, document.body.scrollHeight); });
  await expect(page.locator(".finale-wave")).toHaveClass(/on/, { timeout: 20_000 });
});

test("gateway: the tunnel card leads to the mat trail", async ({ page, isMobile }) => {
  test.skip(isMobile, "checked once, on desktop");
  await page.goto("/");
  await page.locator("#openMat").scrollIntoViewIfNeeded();
  await page.locator("#openMat").click();
  await expect(page).toHaveURL(/tatame\.html$/, { timeout: 10_000 });
});
