/* The 3D journey: a maze of grey process flows, one blue path, a beacon to the north.
   Scrolling moves the camera along the blue path; every BPMN element is a portal you pass through. */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const root = document.documentElement;
const canvas = document.getElementById("scene");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isSmall = () => innerWidth < 820;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
} catch (e) {
  root.classList.add("no3d");
  throw e;
}
root.classList.add("has3d");
renderer.setPixelRatio(Math.min(devicePixelRatio, isSmall() ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const C = { bg: 0xF3F1EC, blue: 0x2B3BFF, ink: 0x14110F, grey: 0xB9B2A4, greyNode: 0xDDD8CD, white: 0xFBFAF7, orange: 0xFF5B1F };

const scene = new THREE.Scene();
{ const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .45; }
scene.background = new THREE.Color(C.bg);
scene.fog = new THREE.Fog(C.bg, 14, 75);
const camera = new THREE.PerspectiveCamera(isSmall() ? 62 : 52, innerWidth / innerHeight, 0.1, 600);

scene.add(new THREE.HemisphereLight(0xffffff, 0xe6e0d4, 1.7));
const sun = new THREE.DirectionalLight(0xffffff, 1.3);
sun.position.set(12, 24, 10);
scene.add(sun);

const grid = new THREE.GridHelper(480, 240, 0xE0DBD1, 0xE6E2D9);
scene.add(grid);

/* ---------------- helpers ---------------- */
const V = (x, z, y = 0.06) => new THREE.Vector3(x, y, z);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* orthogonal connector with rounded corners, like a BPMN sequence flow */
function orthoPath(pts, r = 3) {
  const path = new THREE.CurvePath();
  let prev = pts[0].clone();
  for (let i = 1; i < pts.length; i++) {
    const cur = pts[i];
    if (i < pts.length - 1) {
      const next = pts[i + 1];
      const dIn = cur.clone().sub(prev).normalize();
      const dOut = next.clone().sub(cur).normalize();
      if (dIn.dot(dOut) > 0.999) continue;
      const rr = Math.min(r, cur.distanceTo(prev) * 0.5, cur.distanceTo(next) * 0.5);
      const a = cur.clone().addScaledVector(dIn, -rr);
      const b = cur.clone().addScaledVector(dOut, rr);
      path.add(new THREE.LineCurve3(prev, a));
      path.add(new THREE.QuadraticBezierCurve3(a, cur.clone(), b));
      prev = b;
    } else {
      path.add(new THREE.LineCurve3(prev, cur.clone()));
    }
  }
  return path;
}

/* ---------------- BPMN portal shapes ---------------- */
function rr(w, h, r, S = THREE.Shape) {
  const s = new S(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function poly(p, S = THREE.Shape) { const s = new S(); s.moveTo(...p[0]); p.slice(1).forEach(q => s.lineTo(...q)); s.closePath(); return s; }
function circ(r, S = THREE.Shape) { const s = new S(); s.absarc(0, 0, r, 0, Math.PI * 2, false); return s; }
function page(w, h, f, S = THREE.Shape) { return poly([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2 - f], [w / 2 - f, h / 2], [-w / 2, h / 2]], S); }

const GEO = {};
function portalGeo(type) {
  if (GEO[type]) return GEO[type];
  let outer, inner, cy, top;
  if (type === "task") { outer = rr(5, 3.4, .6); inner = rr(4.4, 2.8, .35, THREE.Path); cy = 2.0; top = 1.7; }
  if (type === "gateway") { outer = poly([[0, 3], [3, 0], [0, -3], [-3, 0]]); inner = poly([[0, 2.55], [2.55, 0], [0, -2.55], [-2.55, 0]], THREE.Path); cy = 3.3; top = 3; }
  if (type === "ring") { outer = circ(2.2); inner = circ(1.96, THREE.Path); cy = 2.5; top = 2.2; }
  if (type === "end") { outer = circ(2.2); inner = circ(1.6, THREE.Path); cy = 2.5; top = 2.2; }
  if (type === "data") { outer = page(3.8, 4.6, 1.0); inner = page(3.2, 4.0, .75, THREE.Path); cy = 2.6; top = 2.3; }
  outer.holes.push(inner);
  const g = new THREE.ExtrudeGeometry(outer, { depth: .28, bevelEnabled: true, bevelThickness: .04, bevelSize: .04, bevelSegments: 2, curveSegments: 48 });
  g.translate(0, 0, -.14);
  const e = new THREE.EdgesGeometry(g, 25);
  return (GEO[type] = { g, e, cy, top });
}
function makePortal(type, { x, z, scale = 1, color = C.white, edge = C.ink, edgeOpacity = .35, facing = 0 }) {
  const { g, e, cy, top } = portalGeo(type);
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, roughness: .55, metalness: 0 });
  const lmat = new THREE.LineBasicMaterial({ color: edge, transparent: true, opacity: edgeOpacity });
  group.add(new THREE.Mesh(g, mat), new THREE.LineSegments(e, lmat));
  group.scale.setScalar(scale);
  group.position.set(x, cy * scale, z);
  group.rotation.y = facing;
  scene.add(group);
  return { group, mat, lmat, topY: (cy + top) * scale };
}

/* ---------------- labels (canvas sprites) ---------------- */
function labelTexture(text, { bg = "#FBFAF7", fg = "#14110F", border = "#14110F" } = {}) {
  const c = document.createElement("canvas"), x = c.getContext("2d");
  const fs = 44, padX = 30, font = `500 ${fs}px "DM Mono", ui-monospace, monospace`;
  x.font = font;
  const w = Math.ceil(x.measureText(text).width) + padX * 2, h = Math.round(fs * 1.9);
  c.width = w; c.height = h;
  x.font = font;
  x.fillStyle = bg; x.strokeStyle = border; x.lineWidth = 3;
  x.beginPath(); x.roundRect(2, 2, w - 4, h - 4, h / 2 - 2); x.fill(); x.stroke();
  x.fillStyle = fg; x.textAlign = "center"; x.textBaseline = "middle";
  x.fillText(text, w / 2, h / 2 + 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return { t, aspect: w / h };
}
function makeLabel(text, x, y, z, size = .8, style) {
  const { t, aspect } = labelTexture(text, style);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }));
  s.scale.set(size * aspect, size, 1);
  s.position.set(x, y, z);
  s.userData = { size, style };
  scene.add(s);
  return s;
}
function setLabel(s, text) {
  const { t, aspect } = labelTexture(text, s.userData.style);
  s.material.map.dispose(); s.material.map = t; s.material.needsUpdate = true;
  s.scale.set(s.userData.size * aspect, s.userData.size, 1);
}

/* ---------------- the blue path ---------------- */
const MAIN = [[0, 10], [0, -22], [12, -22], [12, -56], [-4, -56], [-4, -88], [6, -88], [6, -97]];   // the path ends inside the end event
const path = orthoPath(MAIN.map(([x, z]) => V(x, z)), 3);
const L = path.getLength();
const blueMat = new THREE.MeshBasicMaterial({ color: C.blue });
scene.add(new THREE.Mesh(new THREE.TubeGeometry(path, 700, .11, 8, false), blueMat));

const SAMPLES = 3000, samples = path.getSpacedPoints(SAMPLES);
function sOf(x, z) {
  let best = 0, bd = Infinity;
  samples.forEach((p, i) => { const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < bd) { bd = d; best = i; } });
  return best / SAMPLES * L;
}

const NODES = [
  { key: "start", type: "ring", x: 0, z: 0, stage: 0 },
  { key: "triage", type: "task", x: 0, z: -12, back: 8, h: 1.8, stage: 1 },
  { key: "gateway", type: "gateway", x: 12, z: -32, back: 6, h: 8.5, ahead: 15, ly: .6, stage: 2 },
  { key: "agent", type: "task", x: 12, z: -48, back: 8, h: 1.8, stage: 3 },
  { key: "teach", type: "task", x: -4, z: -68, back: 8, h: 1.8, stage: 4 },
  { key: "record", type: "data", x: -4, z: -80, back: 8, h: 1.8, stage: 5 },
  { key: "end", type: "end", x: 6, z: -97, back: 8, h: 1.8, stage: 6 }
];
const LBL = {
  pt: { start: "00 · início", triage: "01 · triagem", gateway: "02 · gateway", agent: "03 · agente de IA", teach: "04 · capacitação", record: "05 · histórico", end: "06 · resolução", north: "norte" },
  en: { start: "00 · start", triage: "01 · triage", gateway: "02 · gateway", agent: "03 · AI agent", teach: "04 · enablement", record: "05 · record", end: "06 · resolution", north: "north" }
};
let lang = root.lang.startsWith("en") ? "en" : "pt";

NODES.forEach(n => {
  n.s = sOf(n.x, n.z);
  n.portal = makePortal(n.type, { x: n.x, z: n.z });
  n.label = makeLabel(LBL[lang][n.key], n.x, n.portal.topY + .7, n.z, .55);
});

/* the north beacon: always visible, through the fog */
const endNode = NODES[NODES.length - 1];
const beacon = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, 80, 8), new THREE.MeshBasicMaterial({ color: C.blue, fog: false, transparent: true, opacity: .85 }));
beacon.position.set(endNode.x, 40, endNode.z);
scene.add(beacon);
const beaconCap = new THREE.Mesh(new THREE.OctahedronGeometry(.7), new THREE.MeshBasicMaterial({ color: C.blue, fog: false }));
beaconCap.position.set(endNode.x, 8.5, endNode.z);
scene.add(beaconCap);
const northLabel = makeLabel("↑ " + LBL[lang].north, endNode.x, 10, endNode.z, 1, { bg: "#2B3BFF", fg: "#FBFAF7", border: "#2B3BFF" });
northLabel.material.fog = false;

/* ---------------- the finale: the request reaches the end event, the ring closes
   into an orange sphere, and the sphere bursts towards the screen ---------------- */
const finale = { phase: 0, t: 0 };
const tmp = new THREE.Vector3();
const orb = new THREE.Mesh(new THREE.SphereGeometry(2.05, 64, 48),
  new THREE.MeshStandardMaterial({ color: C.orange, emissive: C.orange, emissiveIntensity: .35, roughness: .32 }));
orb.visible = false; scene.add(orb);
/* the burst is a DOM wave: two discs scaled on the compositor, so the edge stays crisp
   and the motion stays smooth at any resolution. It takes the whole screen and stays orange. */
const wave = document.createElement("div");
wave.className = "finale-wave"; wave.setAttribute("aria-hidden", "true");
wave.innerHTML = "<i></i><i></i>"; document.body.appendChild(wave);
function burstWave(on) {
  if (!on) { wave.classList.remove("on"); document.documentElement.classList.remove("finale-done"); return; }
  const p = orb.position.clone().project(camera);
  const cx = (p.x + 1) / 2 * innerWidth, cy = (1 - p.y) / 2 * innerHeight;
  const R = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)) + 4;
  const edge = orb.position.clone().add(tmp.set(2.05 * orb.scale.x, 0, 0).applyQuaternion(camera.quaternion)).project(camera);
  const r0 = Math.max(8, Math.abs((edge.x - p.x) / 2 * innerWidth));
  wave.style.setProperty("--cx", `${cx}px`); wave.style.setProperty("--cy", `${cy}px`);
  wave.style.setProperty("--R", `${R}px`); wave.style.setProperty("--s0", (r0 / R).toFixed(4));
  wave.classList.remove("on"); void wave.offsetWidth;                     // restart from the orb
  wave.classList.add("on"); document.documentElement.classList.add("finale-done");
}
const easeOutBack = x => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);

/* ---------------- gateway branches (tools) ---------------- */
const gw = NODES[2];
const TOOLS = [{ x: 2, name: "Jira + Rovo" }, { x: 6.5, name: "Fluig + RM Totvs" }, { x: 17.5, name: "Bizagi · BPMN" }, { x: 22, name: "Claude Code" }];
const greyMat = new THREE.MeshBasicMaterial({ color: C.grey });
TOOLS.forEach(t => {
  const side = t.x < gw.x ? -1 : 1;
  const bp = orthoPath([V(gw.x + side * 3, gw.z), V(t.x, gw.z), V(t.x, gw.z - 14)], 1.6);
  t.mat = greyMat.clone();
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(bp, 80, .07, 6, false), t.mat));
  t.portal = makePortal("task", { x: t.x, z: gw.z - 9, scale: .5, color: C.greyNode, edgeOpacity: .25 });
  t.end = makePortal("end", { x: t.x, z: gw.z - 14, scale: .3, color: C.greyNode, edgeOpacity: .2 });
  t.label = makeLabel(t.name, t.x, t.portal.topY + .55, gw.z - 9, .55, { bg: "#FBFAF7", fg: "#6E685E", border: "#CDC7BB" });
});
function highlightTool(i) {
  TOOLS.forEach((t, k) => {
    const on = k === i;
    t.mat.color.setHex(on ? C.blue : C.grey);
    t.portal.mat.color.setHex(on ? C.blue : C.greyNode);
    t.end.mat.color.setHex(on ? C.blue : C.greyNode);
    t.label.material.opacity = on || i == null ? 1 : .45;
  });
  mapHighlight(i);
}
document.addEventListener("jcr:route", e => highlightTool(e.detail));

/* ---------------- the maze: grey decoy flows ---------------- */
const avoid = [...path.getSpacedPoints(500)];
TOOLS.forEach(t => { for (let z = gw.z; z >= gw.z - 15; z -= 1) avoid.push(V(t.x, z)); for (let x = Math.min(t.x, gw.x); x <= Math.max(t.x, gw.x); x++) avoid.push(V(x, gw.z)); });
const near = (x, z, r) => avoid.some(p => (p.x - x) ** 2 + (p.z - z) ** 2 < r * r);
const rand = rng(1984);
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const TYPES = ["task", "task", "gateway", "ring", "end", "data"];
const decoys = isSmall() ? 28 : 56;
for (let k = 0, tries = 0; k < decoys && tries < 900; tries++) {
  let x = Math.round((-44 + rand() * 92) / 2) * 2, z = Math.round((24 - rand() * 150) / 2) * 2;
  if (near(x, z, 5)) continue;
  const pts = [V(x, z)];
  let dir = DIRS[Math.floor(rand() * 4)], ok = true;
  const segs = 2 + Math.floor(rand() * 3);
  for (let s = 0; s < segs && ok; s++) {
    const len = 4 + Math.round(rand() * 5) * 2;
    for (let step = 1; step <= len; step++) if (near(x + dir[0] * step, z + dir[1] * step, 4.5)) { ok = false; break; }
    if (!ok) break;
    x += dir[0] * len; z += dir[1] * len;
    pts.push(V(x, z));
    const turn = DIRS.filter(d => d[0] !== -dir[0] || d[1] !== -dir[1]).filter(d => d[0] !== dir[0] || d[1] !== dir[1]);
    dir = turn[Math.floor(rand() * turn.length)];
  }
  if (!ok || pts.length < 2) continue;
  const dp = orthoPath(pts, 1.4);
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(dp, 60, .065, 5, false), greyMat));
  const last = pts[pts.length - 1], prev = pts[pts.length - 2];
  const d = last.clone().sub(prev).normalize();
  makePortal(TYPES[Math.floor(rand() * TYPES.length)], { x: last.x, z: last.z, scale: .45, color: C.greyNode, edgeOpacity: .18, facing: Math.atan2(d.x, d.z) });
  avoid.push(...dp.getSpacedPoints(30));
  k++;
}

/* ---------------- flow particles + your request (token) ---------------- */
const FLOW = 60;
const flow = new THREE.InstancedMesh(new THREE.SphereGeometry(.08, 10, 10), new THREE.MeshBasicMaterial({ color: C.blue }), FLOW);
scene.add(flow);
const dummy = new THREE.Object3D();

const token = new THREE.Mesh(new THREE.SphereGeometry(.22, 24, 24), new THREE.MeshBasicMaterial({ color: C.orange }));
scene.add(token);
const haloTex = (() => {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,91,31,.55)"); g.addColorStop(1, "rgba(255,91,31,0)");
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, depthWrite: false }));
halo.scale.set(1.6, 1.6, 1);
scene.add(halo);

/* ---------------- camera states ---------------- */
const start = NODES[0];
const sStart = start.s - 6;
const STATES = NODES.filter(n => n.back).map(n => ({ s: n.s - n.back, h: n.h, ahead: n.ahead || 7, ly: n.ly ?? 1.2 + n.h * .55 }));
const AERIAL = { pos: new THREE.Vector3(-8, 70, 36), look: new THREE.Vector3(0, 0, -52), near: 90, far: 340 };
const PATHFOG = { near: 14, far: 75 };

function pathPose(s, h, ahead = 7, ly = 1.2 + h * .55) {
  const pos = path.getPointAt(clamp(s / L)).add(new THREE.Vector3(0, h, 0));
  const look = path.getPointAt(clamp((s + ahead) / L)).add(new THREE.Vector3(0, ly, 0));
  return { pos, look };
}

const stages = [...document.querySelectorAll("section[data-stage]")];
function anchors() {
  const off = isSmall() ? .42 : .2;
  const A = stages.map((st, i) => {
    if (i === 0) return 0;
    const p = st.querySelector(".panel") || st;
    return scrollY + p.getBoundingClientRect().top - innerHeight * off;
  });
  for (let i = 1; i < A.length; i++) A[i] = Math.max(A[i], A[i - 1] + 1);
  return A;
}

/* The camera is driven by three scalars, smoothed every frame:
   air (1 = aerial view, 0 = on the path), s (distance along the path) and h (eye height).
   Smoothing the scalars instead of positions keeps the camera on the rails through every corner. */
const GROUND = { s: sStart, h: 1.8, ahead: 7, ly: 2.2 };
const want = { air: 1, ...GROUND };
const cur = { air: 1, ...GROUND };
let tokenS = start.s;
const mix = (a, b, q) => ({ s: lerp(a.s, b.s, q), h: lerp(a.h, b.h, q), ahead: lerp(a.ahead, b.ahead, q), ly: lerp(a.ly, b.ly, q) });

function target(y) {
  const A = anchors();
  let i = 0;
  while (i < A.length - 1 && y >= A[i + 1]) i++;
  if (i >= A.length - 1) { Object.assign(want, { air: 0, ...STATES[STATES.length - 1] }); return; }
  const p = clamp((y - A[i]) / (A[i + 1] - A[i]));
  if (i === 0) {
    if (p < .5) Object.assign(want, { air: 1 - ss(.04, .5, p), ...GROUND });
    else Object.assign(want, { air: 0, ...mix(GROUND, STATES[0], ss(.5, .95, p)) });
    return;
  }
  Object.assign(want, { air: 0, ...mix(STATES[i - 1], STATES[i], ss(.12, .88, p)) });
}

/* on wide screens the text lives on the left, so the scene is framed to the right */
function frameView() {
  const W = innerWidth, H = innerHeight;
  if (isSmall()) camera.clearViewOffset();
  else camera.setViewOffset(W, H, -W * (W >= 1100 ? .3 : .2), 0, W, H);
}
frameView();

/* ---------------- minimap (north is up) ---------------- */
const svg = document.getElementById("map");
const NS = "http://www.w3.org/2000/svg";
const MX = { minX: -6, maxZ: 12, minZ: -106, k: (236 - 16) / 118, ox: 12, oy: 8 };
const mx = x => (x - MX.minX) * MX.k + MX.ox;
const my = z => (z - MX.minZ) * MX.k + MX.oy;
let mapDot, mapTools = [];
function el(tag, attrs, parent = svg) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; }
function buildMap() {
  if (!svg) return; // the 2D map now lives in the header rail
  svg.innerHTML = "";
  TOOLS.forEach((t, i) => {
    mapTools[i] = el("polyline", { points: `${mx(gw.x)},${my(gw.z)} ${mx(t.x)},${my(gw.z)} ${mx(t.x)},${my(gw.z - 12)}`, class: "m-branch" });
  });
  el("polyline", { points: MAIN.map(([x, z]) => `${mx(x)},${my(z)}`).join(" "), class: "m-path" });
  NODES.forEach(n => {
    const x = mx(n.x), y = my(n.z), g = el("g", { class: "m-node", "data-stage": n.stage, tabindex: 0, role: "link" });
    if (n.type === "ring") el("circle", { cx: x, cy: y, r: 4 }, g);
    if (n.type === "end") el("circle", { cx: x, cy: y, r: 4.5, class: "thick" }, g);
    if (n.type === "task") el("rect", { x: x - 6, y: y - 4, width: 12, height: 8, rx: 2 }, g);
    if (n.type === "gateway") el("rect", { x: x - 4, y: y - 4, width: 8, height: 8, transform: `rotate(45 ${x} ${y})` }, g);
    if (n.type === "data") el("path", { d: `M${x - 4} ${y - 5}h5l3 3v7h-8z` }, g);
    const t = el("text", { x: 92, y: y + 3.5 }, g);
    t.textContent = LBL[lang][n.key];
    el("line", { x1: x + 8, y1: y, x2: 88, y2: y, class: "m-lead" }, g);
    const go = () => { const A = anchors(); scrollTo({ top: A[n.stage] + (n.stage ? 2 : 0), behavior: reduce ? "auto" : "smooth" }); };
    g.addEventListener("click", go);
    g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  });
  el("text", { x: mx(endNode.x) - 3, y: 6, class: "m-n" }).textContent = "N";
  mapDot = el("circle", { r: 4, class: "m-dot" });
}
function mapHighlight(i) { mapTools.forEach((p, k) => p.classList.toggle("on", k === i)); }
buildMap();

/* ---------------- language ---------------- */
document.addEventListener("jcr:lang", e => {
  lang = e.detail === "en" ? "en" : "pt";
  NODES.forEach(n => setLabel(n.label, LBL[lang][n.key]));
  setLabel(northLabel, "↑ " + LBL[lang].north);
  buildMap();
});
document.fonts && document.fonts.ready.then(() => {
  NODES.forEach(n => setLabel(n.label, LBL[lang][n.key]));
  TOOLS.forEach(t => setLabel(t.label, t.name));
  setLabel(northLabel, "↑ " + LBL[lang].north);
});

/* ---------------- loop ---------------- */
let px = 0, py = 0;
addEventListener("pointermove", e => { px = e.clientX / innerWidth * 2 - 1; py = e.clientY / innerHeight * 2 - 1; }, { passive: true });
addEventListener("resize", () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.fov = isSmall() ? 62 : 52;
  frameView();
  camera.updateProjectionMatrix();
});

const clock = new THREE.Clock();
let last = performance.now();
const pos = new THREE.Vector3(), look = new THREE.Vector3(), par = new THREE.Vector3();
function frame() {
  const t = clock.getElapsedTime();
  const now = performance.now(), dt = Math.min(.1, (now - last) / 1000); last = now;
  target(scrollY);

  /* frame-rate independent smoothing */
  const k = reduce ? 1 : 1 - Math.pow(.004, dt);
  for (const key of ["air", "s", "h", "ahead", "ly"]) cur[key] = lerp(cur[key], want[key], k);
  if (Math.abs(cur.air - want.air) < .001) cur.air = want.air;

  const onPath = pathPose(cur.s, cur.h, cur.ahead, cur.ly);
  pos.copy(onPath.pos).lerp(AERIAL.pos, cur.air);
  look.copy(onPath.look).lerp(AERIAL.look, cur.air);
  if (!isSmall() && !reduce) par.lerp(new THREE.Vector3(px * .45, -py * .2, 0), .05), pos.add(par);
  camera.position.copy(pos);
  camera.lookAt(look);
  scene.fog.near = lerp(PATHFOG.near, AERIAL.near, cur.air);
  scene.fog.far = lerp(PATHFOG.far, AERIAL.far, cur.air);

  /* visited portals turn blue */
  NODES.forEach(n => {
    const done = cur.air < .5 && (cur.s >= n.s - .5 || (n.key === "end" && cur.s >= n.s - n.back - .5));
    const orange = n.key === "end" && finale.phase >= 2;
    n.portal.mat.color.setHex(orange ? C.orange : done ? C.blue : C.white);
    n.portal.lmat.color.setHex(orange ? C.orange : done ? C.blue : C.ink);
    n.label.material.opacity = ss(5, 11, camera.position.distanceTo(n.label.position)) * (finale.phase >= 2 && n.key === "end" ? 0 : 1);
  });

  /* the beacon dissolves as you arrive: no line through the end event */
  const endState = STATES[STATES.length - 1], endRing = endNode.portal.group;
  const beaconA = 1 - ss(endState.s - 22, endState.s - 6, cur.s);
  beacon.material.opacity = .85 * beaconA; beaconCap.material.transparent = true; beaconCap.material.opacity = beaconA; northLabel.material.opacity = beaconA;
  beacon.visible = beaconCap.visible = northLabel.visible = beaconA > .01;

  /* finale state machine */
  const atEnd = cur.air < .5 && cur.s >= endState.s - .8;
  if (finale.phase > 0 && cur.s < endState.s - 3) {                       // scrolled back: rebuild everything
    finale.phase = 0; endRing.scale.setScalar(1); endRing.visible = true; orb.visible = false;
    orb.material.emissiveIntensity = .35; token.visible = halo.visible = true; burstWave(false);
  }
  if (finale.phase === 0 && atEnd) { finale.phase = reduce ? 5 : 1; finale.t = 0; if (reduce) { orb.position.set(endNode.x, endRing.position.y, endNode.z); orb.scale.setScalar(1); endRing.visible = false; token.visible = halo.visible = false; burstWave(true); } }
  finale.t += dt;

  /* the request token runs a little ahead of you; at the end it rises into the ring */
  const ringY = endRing.position.y;
  const wantToken = cur.air > .02 ? start.s : finale.phase === 1 ? endNode.s : Math.min(L, cur.s + 7.5);
  tokenS = lerp(tokenS, wantToken, reduce ? 1 : (finale.phase === 1 ? 1 - Math.pow(.02, dt) : k));
  const tp = path.getPointAt(clamp(tokenS / L));
  const bob = reduce ? 0 : Math.sin(t * 2.4) * .12;
  const rise = finale.phase === 1 ? ss(endNode.s - 4, endNode.s, tokenS) : 0;
  token.position.set(tp.x, lerp(1 + bob, ringY, rise), tp.z);
  halo.position.copy(token.position);

  if (finale.phase === 1 && Math.abs(tokenS - endNode.s) < .25) { finale.phase = 2; finale.t = 0; token.visible = halo.visible = false; orb.visible = true; orb.position.set(endNode.x, ringY, endNode.z); }
  if (finale.phase === 2) {                                                // the ring closes into a sphere
    const q = clamp(finale.t / .75);
    endRing.scale.setScalar(Math.max(.001, 1 - ss(0, 1, q)));
    orb.scale.setScalar(Math.max(.001, easeOutBack(q)));
    if (q >= 1) { finale.phase = 3; finale.t = 0; endRing.visible = false; }
  }
  if (finale.phase === 3) {                                                // it gathers itself, then bursts
    const q = clamp(finale.t / .55);
    orb.scale.setScalar(1 - Math.sin(q * Math.PI) * .08 + ss(.7, 1, q) * .25);
    orb.material.emissiveIntensity = .35 + q * 1.6;
    if (q >= 1) { finale.phase = 4; finale.t = 0; burstWave(true); }
  }
  if (finale.phase === 4 && finale.t > 1.4) { finale.phase = 5; orb.visible = false; }   // the wave has covered the screen

  /* flowing dots */
  for (let i = 0; i < FLOW; i++) {
    const s = ((i / FLOW) * L + (reduce ? 0 : t * 2.2)) % L;
    const p = path.getPointAt(s / L);
    dummy.position.set(p.x, .14, p.z); dummy.updateMatrix();
    flow.setMatrixAt(i, dummy.matrix);
  }
  flow.instanceMatrix.needsUpdate = true;

  beaconCap.rotation.y = t * .6;
  if (mapDot) { mapDot.setAttribute("cx", mx(tp.x)); mapDot.setAttribute("cy", my(tp.z)); }

  renderer.render(scene, camera);
  if (!root.classList.contains("scene-ready")) root.classList.add("scene-ready");
  requestAnimationFrame(frame);
}
frame();
