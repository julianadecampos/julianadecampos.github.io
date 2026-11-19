/* A trilha do tatame — the same flow world as the main page, drawn on a tatami floor.
   The belt is the path: one ribbon that changes colour at every graduation.
   Graduations are BPMN intermediate events, the other moments are tasks, VOZ is the end event.
   As you walk, each portal takes the colour of the belt you were wearing. */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EN, STAGE_LABEL } from "./tatame-content.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isSmall = () => innerWidth < 820;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch {} } };

/* ================= i18n ================= */
const PT = {};
$$("[data-t]").forEach(el => { if (!(el.dataset.t in PT)) PT[el.dataset.t] = el.innerHTML; });
const root = document.documentElement, FIXED = root.dataset.lang;   // built /en/ pages fix their language
let lang = FIXED || (store.get("jcr-lang") === "en" ? "en" : "pt");
const onLang = [];
function applyLang() {
  document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
  const d = lang === "en" ? EN : PT;
  $$("[data-t]").forEach(el => { if (d[el.dataset.t] != null) el.innerHTML = d[el.dataset.t]; });
  $("#lang").textContent = lang === "en" ? "PT" : "EN";
  $("#lang").setAttribute("aria-label", lang === "en" ? "PT · mudar para português" : "EN · switch to English");
  onLang.forEach(f => f());
}
$("#lang").addEventListener("click", () => {
  const next = lang === "en" ? "pt" : "en"; store.set("jcr-lang", next);
  if (root.dataset.alt) { location.href = root.dataset.alt + location.hash; return; }
  lang = next; applyLang();
});

/* ================= renderer: identical to the main page ================= */
const canvas = $("#scene");
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" }); }
catch (e) { document.documentElement.classList.add("no3d"); throw e; }
const LOW_POWER = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
renderer.setPixelRatio(Math.min(devicePixelRatio, LOW_POWER ? 1 : isSmall() ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const C = { bg: 0xEEF1F6, ink: 0x14110F, grey: 0xADB5C4, greyNode: 0xD8DEE8, white: 0xFBFCFE, line: 0xDCE1EA, edge: 0xC8CFDB };
const BELT = { none: "#ADB5C4", white: "#F4F6F9", blue: "#2346C8", purple: "#5B2D91", brown: "#6B4224", black: "#14110F" };
const BAR = { none: "#ADB5C4", white: "#14110F", blue: "#14110F", purple: "#14110F", brown: "#14110F", black: "#C8102E" };

const scene = new THREE.Scene();
{ const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .45; }
scene.background = new THREE.Color(C.bg);
scene.fog = new THREE.Fog(C.bg, 14, 75);
const camera = new THREE.PerspectiveCamera(isSmall() ? 62 : 52, innerWidth / innerHeight, .1, 600);
scene.add(new THREE.HemisphereLight(0xffffff, 0xE0E5ED, 1.7));
const sun = new THREE.DirectionalLight(0xffffff, 1.3); sun.position.set(12, 24, 10); scene.add(sun);

/* ================= helpers (shared vocabulary with the main scene) ================= */
const V = (x, z, y = .06) => new THREE.Vector3(x, y, z);
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function orthoPath(pts, r = 3) {
  const path = new THREE.CurvePath(); let prev = pts[0].clone();
  for (let i = 1; i < pts.length; i++) {
    const cur = pts[i];
    if (i < pts.length - 1) {
      const next = pts[i + 1], dIn = cur.clone().sub(prev).normalize(), dOut = next.clone().sub(cur).normalize();
      if (dIn.dot(dOut) > .999) continue;
      const rr = Math.min(r, cur.distanceTo(prev) * .5, cur.distanceTo(next) * .5);
      const a = cur.clone().addScaledVector(dIn, -rr), b = cur.clone().addScaledVector(dOut, rr);
      path.add(new THREE.LineCurve3(prev, a)); path.add(new THREE.QuadraticBezierCurve3(a, cur.clone(), b)); prev = b;
    } else path.add(new THREE.LineCurve3(prev, cur.clone()));
  }
  return path;
}
function rr(w, h, r, S = THREE.Shape) {
  const s = new S(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function circ(r, S = THREE.Shape) { const s = new S(); s.absarc(0, 0, r, 0, Math.PI * 2, false); return s; }
function ring(ro, ri) { const s = circ(ro); s.holes.push(circ(ri, THREE.Path)); return s; }
const EXT = { depth: .28, bevelEnabled: true, bevelThickness: .04, bevelSize: .04, bevelSegments: 2, curveSegments: 64 };
const GEO = {};
function portalGeo(type) {
  if (GEO[type]) return GEO[type];
  let shapes, cy, top;
  if (type === "task") { const o = rr(5, 3.4, .6); o.holes.push(rr(4.4, 2.8, .35, THREE.Path)); shapes = [o]; cy = 2.0; top = 1.7; }
  if (type === "event") { shapes = [ring(2.2, 1.98), ring(1.84, 1.62)]; cy = 2.5; top = 2.2; }   // intermediate event: double ring
  if (type === "end") { shapes = [ring(2.2, 1.6)]; cy = 2.5; top = 2.2; }
  if (type === "start") { shapes = [ring(2.2, 1.96)]; cy = 2.5; top = 2.2; }
  const g = new THREE.ExtrudeGeometry(shapes, EXT); g.translate(0, 0, -.14);
  return (GEO[type] = { g, e: new THREE.EdgesGeometry(g, 25), cy, top });
}
function makePortal(type, { x, z, scale = 1, color = C.white, edgeOpacity = .35, facing = 0 }) {
  const { g, e, cy, top } = portalGeo(type), group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, roughness: .55, metalness: 0 });
  const lmat = new THREE.LineBasicMaterial({ color: C.ink, transparent: true, opacity: edgeOpacity });
  group.add(new THREE.Mesh(g, mat), new THREE.LineSegments(e, lmat));
  group.scale.setScalar(scale); group.position.set(x, cy * scale, z); group.rotation.y = facing;
  scene.add(group);
  return { group, mat, lmat, topY: (cy + top) * scale };
}
function labelTexture(text, { bg = "#FBFCFE", fg = "#14110F", border = "#14110F", swatch = null, bar = null } = {}) {
  const c = document.createElement("canvas"), x = c.getContext("2d");
  const fs = 44, padX = 30, sw = swatch ? 74 : 0, font = `500 ${fs}px "DM Mono", ui-monospace, monospace`;
  x.font = font;
  const w = Math.ceil(x.measureText(text).width) + padX * 2 + sw, h = Math.round(fs * 1.9);
  c.width = w; c.height = h; x.font = font;
  x.fillStyle = bg; x.strokeStyle = border; x.lineWidth = 3;
  x.beginPath(); x.roundRect(2, 2, w - 4, h - 4, h / 2 - 2); x.fill(); x.stroke();
  if (swatch) {                                   // a little belt, with its rank bar
    x.fillStyle = swatch; x.beginPath(); x.roundRect(padX, h / 2 - 9, 56, 18, 4); x.fill();
    x.strokeStyle = "rgba(20,17,15,.35)"; x.lineWidth = 2; x.stroke();
    x.fillStyle = bar; x.fillRect(padX + 38, h / 2 - 9, 11, 18);
  }
  x.fillStyle = fg; x.textAlign = "center"; x.textBaseline = "middle";
  x.fillText(text, (w + sw) / 2, h / 2 + 2);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return { t, aspect: w / h };
}
function makeLabel(text, x, y, z, size, style) {
  const { t, aspect } = labelTexture(text, style);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }));
  s.scale.set(size * aspect, size, 1); s.position.set(x, y, z); s.userData = { size, style };
  scene.add(s); return s;
}
function setLabel(s, text) {
  const { t, aspect } = labelTexture(text, s.userData.style);
  s.material.map.dispose(); s.material.map = t; s.material.needsUpdate = true;
  s.scale.set(s.userData.size * aspect, s.userData.size, 1);
}

/* ================= the floor: a tatami layout, drawn in the same fine lines as the main grid ================= */
{
  const MW = 3.6, MD = 1.8, X0 = -70, X1 = 70, Z0 = 40, Z1 = -220, pts = [];
  for (let z = Z0, row = 0; z > Z1; z -= MD, row++) {
    pts.push(X0, 0, z, X1, 0, z);                                         // the long edges of a row of mats
    const off = row % 2 ? MW / 2 : 0;                                     // rows are staggered: no four corners meet
    for (let x = X0 + off; x <= X1; x += MW) pts.push(x, 0, z, x, 0, z - MD);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  scene.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: C.line })));
}

/* ================= the path: the belt itself ================= */
/* every milestone sits on a straight run, so each portal is crossed head-on */
const ROUTE = [[0, 12], [0, -26], [12, -26], [12, -60], [-4, -60], [-4, -94], [8, -94], [8, -128], [0, -128], [0, -141]];
const path = orthoPath(ROUTE.map(([x, z]) => V(x, z)), 3);
const L = path.getLength();
const SAMPLES = 3000, samples = path.getSpacedPoints(SAMPLES);
const sOf = (x, z) => { let b = 0, bd = Infinity; samples.forEach((p, i) => { const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < bd) { bd = d; b = i; } }); return b / SAMPLES * L; };

const NODES = [
  { type: "event", belt: "white", x: 0, z: -4 }, { type: "event", belt: "blue", x: 0, z: -18 },
  { type: "event", belt: "purple", x: 12, z: -36 }, { type: "task", belt: "purple", x: 12, z: -50 },
  { type: "event", belt: "brown", x: -4, z: -70 }, { type: "event", belt: "black", x: -4, z: -84 },
  { type: "task", belt: "black", x: 8, z: -104 }, { type: "task", belt: "black", x: 8, z: -118 },
  { type: "end", belt: "black", x: 0, z: -141 }
];
NODES.forEach(n => { n.s = sOf(n.x, n.z); });
const beltAt = s => { let b = "none"; NODES.forEach(n => { if (s >= n.s - .01) b = n.belt; }); return b; };

function ribbon(half, y, colorAt) {                // a flat strip that follows the path
  const n = Math.ceil(L / .12), pos = [], col = [], idx = [], c = new THREE.Color();
  for (let i = 0; i <= n; i++) {
    const s = Math.min(L, i * .12), u = s / L, p = path.getPointAt(u), t = path.getTangentAt(u), nx = -t.z, nz = t.x;
    c.set(colorAt(s));
    pos.push(p.x - nx * half, y, p.z - nz * half, p.x + nx * half, y, p.z + nz * half);
    col.push(c.r, c.g, c.b, c.r, c.g, c.b);
    if (i < n) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx); return g;
}
const unlit = new THREE.MeshBasicMaterial({ vertexColors: true });
scene.add(new THREE.Mesh(ribbon(.36, .055, () => "#C8CFDB"), unlit));                 // the hem that outlines the belt
scene.add(new THREE.Mesh(ribbon(.3, .06, s => {
  const b = beltAt(s);
  const next = NODES.find(n => n.s > s + .01);                                        // the rank bar, just before each graduation
  if (next && next.type === "event" && b !== "none" && s > next.s - 2.6 && s < next.s - 1.6) return BAR[b];
  return BELT[b];
}), unlit));
{ // stitching: fine lines along the belt, like the rows of a real one
  const pts = [], n = Math.ceil(L / .5);
  for (const off of [-.2, -.1, .1, .2]) for (let i = 0; i < n; i++) {
    const s0 = i * .5, s1 = Math.min(L, s0 + .28), a = path.getPointAt(s0 / L), b = path.getPointAt(s1 / L), t = path.getTangentAt(s0 / L);
    pts.push(a.x - t.z * off, .065, a.z + t.x * off, b.x - t.z * off, .065, b.z + t.x * off);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  scene.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: C.ink, transparent: true, opacity: .12 })));
}

/* the portals, with a label on top: a belt swatch and the year */
const labelStyle = n => ({ swatch: BELT[n.belt], bar: BAR[n.belt] });
NODES.forEach((n, i) => {
  const t = path.getTangentAt(n.s / L);
  n.portal = makePortal(n.type, { x: n.x, z: n.z, facing: Math.atan2(t.x, t.z) });
  n.label = makeLabel(STAGE_LABEL[lang][i + 1], n.x, n.portal.topY + .7, n.z, .55, labelStyle(n));
});
/* the start: a plain start event, before the first belt */
makePortal("start", { x: 0, z: 8, scale: .55 });

/* the north: VOZ, visible from everywhere, dissolving as you arrive */
const endNode = NODES[NODES.length - 1];
const beacon = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, 80, 8), new THREE.MeshBasicMaterial({ color: C.ink, fog: false, transparent: true, opacity: .85 }));
beacon.position.set(endNode.x, 40, endNode.z); scene.add(beacon);
const beaconCap = new THREE.Mesh(new THREE.OctahedronGeometry(.7), new THREE.MeshBasicMaterial({ color: C.ink, fog: false, transparent: true }));
beaconCap.position.set(endNode.x, 8.5, endNode.z); scene.add(beaconCap);
const northLabel = makeLabel("↑ VOZ", endNode.x, 10, endNode.z, 1, { bg: "#14110F", fg: "#FBFCFE", border: "#14110F" });
northLabel.material.fog = false;

/* ================= the walker and the finale (same as the main page, in the red of the black belt's bar) ================= */
const RED = 0xC8102E;
const token = new THREE.Mesh(new THREE.SphereGeometry(.22, 24, 24), new THREE.MeshBasicMaterial({ color: RED }));
scene.add(token);
const halo = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, map: (() => {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(200,16,46,.5)"); g.addColorStop(1, "rgba(200,16,46,0)");
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})() }));
halo.scale.set(1.6, 1.6, 1); scene.add(halo);
const orb = new THREE.Mesh(new THREE.SphereGeometry(2.05, 64, 48), new THREE.MeshStandardMaterial({ color: RED, emissive: RED, emissiveIntensity: .3, roughness: .32 }));
orb.visible = false; scene.add(orb);
const finale = { phase: 0, t: 0 };
const easeOutBack = x => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
const wave = document.createElement("div");
wave.className = "finale-wave red"; wave.setAttribute("aria-hidden", "true");
wave.innerHTML = "<i></i><i></i>"; document.body.appendChild(wave);
function burstWave(on) {
  if (!on) { wave.classList.remove("on"); document.documentElement.classList.remove("finale-done"); return; }
  const p = orb.position.clone().project(camera);
  const cx = (p.x + 1) / 2 * innerWidth, cy = (1 - p.y) / 2 * innerHeight;
  const R = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)) + 4;
  const edge = orb.position.clone().add(new THREE.Vector3(2.05 * orb.scale.x, 0, 0).applyQuaternion(camera.quaternion)).project(camera);
  const r0 = Math.max(8, Math.abs((edge.x - p.x) / 2 * innerWidth));
  wave.style.setProperty("--cx", `${cx}px`); wave.style.setProperty("--cy", `${cy}px`);
  wave.style.setProperty("--R", `${R}px`); wave.style.setProperty("--s0", (r0 / R).toFixed(4));
  wave.classList.remove("on"); void wave.offsetWidth;
  wave.classList.add("on"); document.documentElement.classList.add("finale-done");
}

/* ================= quiet side flows: other trails on the same mat ================= */
{
  const avoid = [...path.getSpacedPoints(500)], near = (x, z, r) => avoid.some(p => (p.x - x) ** 2 + (p.z - z) ** 2 < r * r);
  const rand = rng(2014), DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]], greyMat = new THREE.MeshBasicMaterial({ color: C.grey });
  const count = isSmall() ? 18 : 36;
  for (let k = 0, tries = 0; k < count && tries < 900; tries++) {
    let x = Math.round((-46 + rand() * 96) / 2) * 2, z = Math.round((26 - rand() * 190) / 2) * 2;
    if (near(x, z, 6)) continue;
    const pts = [V(x, z)]; let dir = DIRS[Math.floor(rand() * 4)], ok = true;
    for (let s = 0, segs = 2 + Math.floor(rand() * 3); s < segs && ok; s++) {
      const len = 4 + Math.round(rand() * 5) * 2;
      for (let step = 1; step <= len; step++) if (near(x + dir[0] * step, z + dir[1] * step, 5)) { ok = false; break; }
      if (!ok) break;
      x += dir[0] * len; z += dir[1] * len; pts.push(V(x, z));
      const turn = DIRS.filter(d => (d[0] !== -dir[0] || d[1] !== -dir[1]) && (d[0] !== dir[0] || d[1] !== dir[1]));
      dir = turn[Math.floor(rand() * turn.length)];
    }
    if (!ok || pts.length < 2) continue;
    const dp = orthoPath(pts, 1.4);
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(dp, 60, .055, 5, false), greyMat));
    const last = pts[pts.length - 1], d = last.clone().sub(pts[pts.length - 2]).normalize();
    makePortal(rand() < .55 ? "task" : "event", { x: last.x, z: last.z, scale: .42, color: C.greyNode, edgeOpacity: .18, facing: Math.atan2(d.x, d.z) });
    avoid.push(...dp.getSpacedPoints(30)); k++;
  }
}

/* ================= camera on rails: aerial over the whole trail, then walking it ================= */
const stages = $$("section[data-stage]");
const STATES = NODES.map(n => ({ s: n.s - (n.type === "end" ? 9 : 8), h: 1.8, ahead: 7, ly: 2.2 }));
const GROUND = { s: Math.max(0, sOf(0, 8) - 6), h: 1.8, ahead: 7, ly: 2.2 };
const AERIAL = { pos: new THREE.Vector3(-14, 78, 30), look: new THREE.Vector3(2, 0, -72), near: 90, far: 360 };
const PATHFOG = { near: 14, far: 75 };
const want = { air: 1, ...GROUND }, cur = { air: 1, ...GROUND };
const mix = (a, b, q) => ({ s: lerp(a.s, b.s, q), h: lerp(a.h, b.h, q), ahead: lerp(a.ahead, b.ahead, q), ly: lerp(a.ly, b.ly, q) });
function anchors() {
  const off = isSmall() ? .42 : .2;
  const A = stages.map((st, i) => i === 0 ? 0 : scrollY + (st.querySelector(".panel") || st).getBoundingClientRect().top - innerHeight * off);
  for (let i = 1; i < A.length; i++) A[i] = Math.max(A[i], A[i - 1] + 1);
  return A;
}
function target(y) {
  const A = anchors(); let i = 0;
  while (i < A.length - 1 && y >= A[i + 1]) i++;
  if (i >= A.length - 1) { Object.assign(want, { air: 0, ...STATES[STATES.length - 1] }); return A.length - 1; }
  const p = clamp((y - A[i]) / (A[i + 1] - A[i]));
  if (i === 0) {
    if (p < .5) Object.assign(want, { air: 1 - ss(.04, .5, p), ...GROUND });
    else Object.assign(want, { air: 0, ...mix(GROUND, STATES[0], ss(.5, .95, p)) });
  } else Object.assign(want, { air: 0, ...mix(STATES[i - 1], STATES[i], ss(.12, .88, p)) });
  return i + p;
}
function frameView() {
  const W = innerWidth, H = innerHeight;
  if (isSmall()) camera.clearViewOffset(); else camera.setViewOffset(W, H, -W * (W >= 1100 ? .3 : .2), 0, W, H);
}
frameView();
addEventListener("resize", () => {
  renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.fov = isSmall() ? 62 : 52;
  frameView(); camera.updateProjectionMatrix();
});
onLang.push(() => NODES.forEach((n, i) => setLabel(n.label, STAGE_LABEL[lang][i + 1])));
applyLang();
if (document.fonts) document.fonts.ready.then(() => { NODES.forEach((n, i) => setLabel(n.label, STAGE_LABEL[lang][i + 1])); setLabel(northLabel, "↑ VOZ"); });

/* ================= loop ================= */
const beltFill = $("#beltFill"), beltBar = $("#beltBar"), stageEl = $("#dojoStage"), veil = $(".veil");
let px = 0, py = 0, last = performance.now(), first = true, tokenS = GROUND.s + 6;
addEventListener("pointermove", e => { px = e.clientX / innerWidth * 2 - 1; py = e.clientY / innerHeight * 2 - 1; }, { passive: true });
const pos = new THREE.Vector3(), look = new THREE.Vector3(), par = new THREE.Vector3(), tmp = new THREE.Vector3(), col = new THREE.Color();
const pose = (s, h, ahead, ly) => [path.getPointAt(clamp(s / L)).add(tmp.set(0, h, 0)), path.getPointAt(clamp((s + ahead) / L)).add(tmp.set(0, ly, 0))];

/* idle throttle: with no input for 2 s and the camera at rest, the scene draws at ~20 fps */
let lastInput = performance.now(), lastDraw = 0;
for (const ev of ["scroll", "pointermove", "pointerdown", "keydown", "resize", "wheel", "touchmove"]) addEventListener(ev, () => { lastInput = performance.now(); }, { passive: true });
function frame() {
  { const t0 = performance.now(), atRest = Math.abs(cur.s - want.s) < .02 && Math.abs(cur.air - want.air) < .002 && (typeof finale === "undefined" || finale.phase === 0 || finale.phase === 5);
    if (atRest && t0 - lastInput > 2000 && t0 - lastDraw < 48) { requestAnimationFrame(frame); return; }
    lastDraw = t0; }
  const now = performance.now(), dt = Math.min(.1, (now - last) / 1000); last = now;
  const prog = target(scrollY);
  const k = reduce ? 1 : 1 - Math.pow(.004, dt);
  for (const key of ["air", "s", "h", "ahead", "ly"]) cur[key] = lerp(cur[key], want[key], k);
  if (Math.abs(cur.air - want.air) < .001) cur.air = want.air;

  const [p0, l0] = pose(cur.s, cur.h, cur.ahead, cur.ly);
  pos.copy(p0).lerp(AERIAL.pos, cur.air); look.copy(l0).lerp(AERIAL.look, cur.air);
  if (!isSmall() && !reduce) { par.lerp(tmp.set(px * .45, -py * .2, 0), .05); pos.add(par); }
  camera.position.copy(pos); camera.lookAt(look);
  scene.fog.near = lerp(PATHFOG.near, AERIAL.near, cur.air); scene.fog.far = lerp(PATHFOG.far, AERIAL.far, cur.air);

  /* each portal takes the colour of the belt it awarded once you have passed it */
  NODES.forEach(n => {
    const done = cur.air < .5 && cur.s >= n.s - (n.type === "end" ? 9.5 : .5);
    n.portal.mat.color.lerp(col.set(done ? BELT[n.belt] : "#FBFCFE"), reduce ? 1 : .12);
    n.portal.lmat.opacity = lerp(n.portal.lmat.opacity, done ? .7 : .35, .12);
    n.label.material.opacity = ss(5, 11, camera.position.distanceTo(n.label.position));
  });
  const endA = 1 - ss(STATES[STATES.length - 1].s - 22, STATES[STATES.length - 1].s - 6, cur.s);
  beacon.material.opacity = .85 * endA; beaconCap.material.opacity = endA; northLabel.material.opacity = endA;
  beacon.visible = beaconCap.visible = northLabel.visible = endA > .01;

  /* the walker runs a little ahead; at VOZ it rises into the ring, which closes into a sphere and bursts */
  const endState = STATES[STATES.length - 1], endRing = endNode.portal.group, ringY = endRing.position.y;
  const atEnd = cur.air < .5 && cur.s >= endState.s - .8;
  if (finale.phase > 0 && cur.s < endState.s - 3) {                       // scrolled back: rebuild everything
    finale.phase = 0; endRing.scale.setScalar(1); endRing.visible = true; orb.visible = false;
    orb.material.emissiveIntensity = .3; token.visible = halo.visible = true; burstWave(false);
  }
  if (finale.phase === 0 && atEnd) {
    finale.phase = reduce ? 5 : 1; finale.t = 0;
    if (reduce) { orb.position.set(endNode.x, ringY, endNode.z); endRing.visible = false; token.visible = halo.visible = false; burstWave(true); }
  }
  finale.t += dt;
  const wantToken = cur.air > .02 ? GROUND.s + 6 : finale.phase === 1 ? endNode.s : Math.min(L, cur.s + 7.5);
  tokenS = lerp(tokenS, wantToken, reduce ? 1 : (finale.phase === 1 ? 1 - Math.pow(.02, dt) : k));
  const tp = path.getPointAt(clamp(tokenS / L)), bob = reduce ? 0 : Math.sin(now / 1000 * 2.4) * .12;
  const rise = finale.phase === 1 ? ss(endNode.s - 4, endNode.s, tokenS) : 0;
  token.position.set(tp.x, lerp(1 + bob, ringY, rise), tp.z); halo.position.copy(token.position);
  if (finale.phase === 1 && Math.abs(tokenS - endNode.s) < .25) {
    finale.phase = 2; finale.t = 0; token.visible = halo.visible = false; orb.visible = true; orb.position.set(endNode.x, ringY, endNode.z);
  }
  if (finale.phase === 2) {                                                // the ring closes into a sphere
    const q = clamp(finale.t / .75);
    endRing.scale.setScalar(Math.max(.001, 1 - ss(0, 1, q))); orb.scale.setScalar(Math.max(.001, easeOutBack(q)));
    if (q >= 1) { finale.phase = 3; finale.t = 0; endRing.visible = false; }
  }
  if (finale.phase === 3) {                                                // it gathers itself, then bursts
    const q = clamp(finale.t / .55);
    orb.scale.setScalar(1 - Math.sin(q * Math.PI) * .08 + ss(.7, 1, q) * .25);
    orb.material.emissiveIntensity = .3 + q * 1.6;
    if (q >= 1) { finale.phase = 4; finale.t = 0; burstWave(true); }
  }
  if (finale.phase === 4 && finale.t > 1.4) { finale.phase = 5; orb.visible = false; }

  /* header: the belt fills as you walk */
  const stIdx = Math.min(NODES.length, Math.round(prog));
  const b = stIdx === 0 ? "white" : NODES[stIdx - 1].belt;
  const f = clamp(prog / (stages.length - 1));
  beltFill.style.width = `${f * 100}%`; beltFill.style.backgroundColor = BELT[b];
  beltBar.style.left = `calc(${f * 100}% - 18px)`; beltBar.style.backgroundColor = BAR[b];
  stageEl.textContent = STAGE_LABEL[lang][stIdx];
  if (veil) veil.style.opacity = Math.max(0, 1 - scrollY / (innerHeight * .55));

  renderer.render(scene, camera);
  if (first) { first = false; document.documentElement.classList.add("scene-ready"); }
  requestAnimationFrame(frame);
}
frame();
