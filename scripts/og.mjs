/* Renders the share images (og.png, og-tatame.png) and the iOS touch icon into dist/,
   from scripts/og.html, so they always match the site's fonts and palette. Run after the build. */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 1500 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.join(ROOT, "scripts", "og.html")).href);
await page.evaluate(() => document.fonts.ready);

await page.locator("#main").screenshot({ path: path.join(ROOT, "dist", "og.png") });
await page.locator("#tatame").screenshot({ path: path.join(ROOT, "dist", "og-tatame.png") });
await page.locator("#icon").screenshot({ path: path.join(ROOT, "dist", "apple-touch-icon.png") });

await browser.close();
console.log("rendered og.png, og-tatame.png, apple-touch-icon.png");
