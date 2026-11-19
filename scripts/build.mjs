/* Build: copies the site into dist/, minifies JS and CSS, replaces the hand-written ?v= numbers
   with content hashes, and generates the static English pages (/en/) from the same copy the site
   already uses at runtime (content.js and tatame-content.js). Run with `npm run build`. */
import { readFile, writeFile, mkdir, cp, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { transform } from "esbuild";
import { parseHTML } from "linkedom";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const SITE = "https://julianadecampos.github.io/";
const src = f => path.join(ROOT, f);
const out = f => path.join(DIST, f);
const hash = s => createHash("sha256").update(s).digest("hex").slice(0, 10);

const { EN } = await import(pathToFileURL(src("content.js")).href);
const { EN: EN_MAT } = await import(pathToFileURL(src("tatame-content.js")).href);

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });
for (const dir of ["fonts", "vendor", "assets", "game"]) await cp(src(dir), out(dir), { recursive: true });
for (const file of ["favicon.svg", "robots.txt", "sitemap.xml"]) await cp(src(file), out(file));
await writeFile(out(".nojekyll"), "");

/* ---------- JS and CSS: minify, then version by content ---------- */
const versions = {};
async function minify(file, loader, rewrite = s => s) {
  const code = rewrite(await readFile(src(file), "utf8"));
  const { code: min } = await transform(code, { loader, minify: true, format: loader === "js" ? "esm" : undefined, target: "es2020", legalComments: "none" });
  await writeFile(out(file), min);
  versions[file] = hash(min);
}
// content first: the scripts that import it carry its hash in the import specifier
await minify("content.js", "js");
await minify("tatame-content.js", "js");
await minify("app.js", "js", s => s.replace(/(["'])\.\/content\.js(\?v=[^"']*)?\1/, `$1./content.js?v=${versions["content.js"]}$1`));
await minify("tatame.js", "js", s => s.replace(/(["'])\.\/tatame-content\.js(\?v=[^"']*)?\1/, `$1./tatame-content.js?v=${versions["tatame-content.js"]}$1`));
await minify("scene.js", "js");
await minify("styles.css", "css");
await minify("tatame.css", "css");
versions["fonts/fonts.css"] = hash(await readFile(src("fonts/fonts.css"), "utf8"));

const versioned = html => html.replace(/(href|src)="([^"?#]+\.(?:js|css))(\?v=[^"]*)?"/g,
  (m, attr, file, v) => versions[file] ? `${attr}="${file}?v=${versions[file]}"` : m);

/* ---------- pages ---------- */
const PAGES = [
  { file: "index.html", en: "en/index.html", key: "data-i18n", dict: EN,
    meta: { title: "Juliana de Campos Ribeiro · Legal doesn't have to be a maze",
            description: "Juliana de Campos Ribeiro, a lawyer in Porto Alegre: process, technology and AI for legal teams. A portfolio you walk through like a BPMN flow.",
            ogDescription: "Process, technology and AI for legal teams. A portfolio you walk through like a BPMN flow.",
            ptUrl: SITE, enUrl: `${SITE}en/` } },
  { file: "tatame.html", en: "en/tatame.html", key: "data-t", dict: EN_MAT,
    meta: { title: "The mat trail · Juliana de Campos Ribeiro",
            description: "Juliana de Campos Ribeiro's jiu-jitsu journey, belt by belt: black belt since 2024, a student of Master Yvone Duarte and creator of VOZ.",
            ogDescription: "The jiu-jitsu journey, belt by belt.",
            ptUrl: `${SITE}tatame.html`, enUrl: `${SITE}en/tatame.html` } }
];
const PAGE_LINK = /^(index|tatame)\.html(#.*)?$/;                 // links between the two pages stay as siblings
const isLocal = u => u && !/^(?:[a-z]+:|\/\/|#|\/)/i.test(u);

await mkdir(out("en"), { recursive: true });
for (const p of PAGES) {
  const pt = versioned(await readFile(src(p.file), "utf8"));
  const altEn = p.file === "index.html" ? "en/" : "en/tatame.html";
  const altPt = p.file === "index.html" ? "../" : "../tatame.html";

  // Portuguese page: same markup, plus where the language button should go
  const ptDoc = parseHTML(pt).document;
  ptDoc.documentElement.setAttribute("data-alt", altEn);
  await writeFile(out(p.file), "<!doctype html>\n" + ptDoc.documentElement.outerHTML);

  // English page: the copy swapped in from the dictionary, paths one level up, language fixed
  const { document } = parseHTML(pt);
  const html = document.documentElement;
  html.setAttribute("lang", "en");
  html.setAttribute("data-lang", "en");
  html.setAttribute("data-base", "../");
  html.setAttribute("data-alt", altPt);
  for (const el of document.querySelectorAll(`[${p.key}]`)) {
    const v = p.dict[el.getAttribute(p.key)];
    if (v != null) el.innerHTML = v;
  }
  for (const el of document.querySelectorAll("[data-i18n-ph]")) {
    const v = p.dict[el.getAttribute("data-i18n-ph")];
    if (v != null) el.setAttribute("placeholder", v);
  }
  for (const el of document.querySelectorAll("[href], [src]")) {
    for (const attr of ["href", "src"]) {
      const u = el.getAttribute(attr);
      if (isLocal(u) && !PAGE_LINK.test(u)) el.setAttribute(attr, "../" + u);
    }
  }
  const map = document.querySelector('script[type="importmap"]');
  if (map) map.textContent = map.textContent.replaceAll('"./', '"../');
  document.title = p.meta.title;
  const set = (sel, attr, v) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, v); };
  set('meta[name="description"]', "content", p.meta.description);
  set('meta[property="og:title"]', "content", p.meta.title);
  set('meta[property="og:description"]', "content", p.meta.ogDescription);
  set('meta[property="og:url"]', "content", p.meta.enUrl);
  set('meta[property="og:locale"]', "content", "en_US");
  set('meta[property="og:locale:alternate"]', "content", "pt_BR");
  set('link[rel="canonical"]', "href", p.meta.enUrl);
  await writeFile(out(p.en), "<!doctype html>\n" + html.outerHTML);
}

console.log("built dist/ with", Object.keys(versions).length, "versioned assets");
