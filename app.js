/* Behaviour: demos, the process rail and the visitor's request. Content lives in content.js; the 3D journey in scene.js. */
import { LOGO, IMG, TOOL_MARK, EN, D, ROLE, TOOLS, CERTS } from "./content.js?v=2";
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} }
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const emit = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));

  /* HTML and Markdown: written code, so a plain </> */
  const CODE = `<svg viewBox="0 0 24 24" fill="none" stroke="#14110F" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7 3 12l5 5M16 7l5 5-5 5M13.5 4.5l-3 15"/></svg>`;
  const mark = (key, cls) => key === "code" ? `<span class="mk ${cls}" aria-hidden="true">${CODE}</span>`
    : LOGO[key] ? `<span class="mk ${cls}" aria-hidden="true"><svg viewBox="0 0 24 24"><path fill="${LOGO[key][0]}" d="${LOGO[key][1]}"/></svg></span>`
    : IMG[key] ? `<span class="mk ${cls} img-mk${key === "enap" ? " wide" : ""}" aria-hidden="true"><img src="${ROOT_PATH}assets/logos/${IMG[key]}" alt="" width="64" height="64" decoding="async"></span>`
    : `<span class="mk ${cls} mono-mk" aria-hidden="true">·</span>`;

  /* ================= i18n (PT lives in the HTML) ================= */
  const PT = {};
  $$("[data-i18n]").forEach(el => { if (!(el.dataset.i18n in PT)) PT[el.dataset.i18n] = el.innerHTML; });
  $$("[data-i18n-ph]").forEach(el => PT[el.dataset.i18nPh] = el.placeholder);

  /* a built page can fix its language (/en/) and its base path; otherwise the visitor's choice is remembered */
  const root = document.documentElement, ROOT_PATH = root.dataset.base || "", FIXED = root.dataset.lang;
  let lang = FIXED || (store.get("jcr-lang") === "en" ? "en" : "pt");
  const L = () => D[lang];
  window.jcr = { t: k => L()[k] };

  /* ================= the request ================= */
  const T = { id: "JCR-26-" + Math.floor(1000 + Math.random() * 9000), opened: new Date(), closed: null, status: "open", counts: { triage: 0, tools: 0, agent: 0, quiz: 0 } };
  $("#tkId").textContent = T.id;
  document.addEventListener("jcr:maze", () => { T.counts.quiz = 1; renderSummary(); });

  /* ================= the process rail (header) ================= */
  const nodes = $$("#rail .node"), rLine = $(".rail-line"), rFill = $(".rail-fill"), rToken = $(".rail-token");
  function anchors() {
    const off = innerWidth < 820 ? .42 : .2;
    const A = $$("section[data-stage]").map((s, i) => i === 0 ? 0 : scrollY + (s.querySelector(".panel") || s).getBoundingClientRect().top - innerHeight * off);
    for (let i = 1; i < A.length; i++) A[i] = Math.max(A[i], A[i - 1] + 1);
    return A;
  }
  function progress() {
    const A = anchors(), y = scrollY;
    let i = 0;
    while (i < A.length - 1 && y >= A[i + 1]) i++;
    if (i >= A.length - 1) return A.length - 1;
    return i + Math.min(1, Math.max(0, (y - A[i]) / (A[i + 1] - A[i])));
  }
  function updateRail() {
    const p = progress();
    const cx = nodes.map(n => n.offsetLeft + n.offsetWidth / 2);
    cx[0] = nodes[0].offsetLeft + nodes[0].offsetWidth + 3;
    const i = Math.floor(p), f = p - i;
    const x = i >= nodes.length - 1 ? cx[cx.length - 1] : cx[i] + (cx[i + 1] - cx[i]) * f;
    rLine.style.left = rFill.style.left = cx[0] + "px";
    rLine.style.width = (cx[cx.length - 1] - cx[0]) + "px";
    rFill.style.width = Math.max(0, x - cx[0]) + "px";
    rToken.style.left = x + "px";
    const cur = Math.min(nodes.length - 1, Math.floor(p + .08));
    nodes.forEach((n, k) => { n.classList.toggle("done", k < cur); n.classList.toggle("now", k === cur); });
    $("#tkStage").textContent = `${String(cur).padStart(2, "0")} · ${L().stages[cur]}`;
  }
  let railQueued = false;
  const queueRail = () => { if (!railQueued) { railQueued = true; requestAnimationFrame(() => { railQueued = false; updateRail(); }); } };
  addEventListener("scroll", queueRail, { passive: true });
  addEventListener("resize", queueRail);
  function goStage(i) { const A = anchors(); scrollTo({ top: A[i] + (i ? 2 : 0), behavior: reduce ? "auto" : "smooth" }); }
  nodes.forEach(n => n.addEventListener("click", () => goStage(+n.dataset.go)));
  $("#startBtn").addEventListener("click", () => goStage(1));

  /* stage in view → status (drives the receipt) */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    T.status = e.target.closest("[data-status]").dataset.status;
    if (T.status === "done") finish();
  }), { rootMargin: "-40% 0px -40% 0px" });
  $$(".stage[data-status]").forEach(s => io.observe(s.querySelector(".panel") || s));
  /* the gateway to the mat trail: the page falls into the diamond, then the trail opens out of it */
  function warpTo(href, from) {
    const r = from.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const reach = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
    const w = document.createElement("div");
    w.className = "warp"; w.setAttribute("aria-hidden", "true");
    w.style.cssText = `--cx:${cx}px;--cy:${cy}px;--k:${(reach / 14 + 4).toFixed(1)}`;
    w.innerHTML = "<i></i><i></i><i></i><i></i><i></i><i></i><b></b>";
    document.body.appendChild(w);
    document.documentElement.style.setProperty("--ox", `${cx}px`);
    document.documentElement.style.setProperty("--oy", `${cy + scrollY}px`);
    requestAnimationFrame(() => { w.classList.add("go"); document.documentElement.classList.add("warping"); });
    try { sessionStorage.setItem("jcr-warp", "1"); } catch {}
    setTimeout(() => { location.href = href; }, 1050);
  }
  $$("#openMat, #railFork").forEach(a => a.addEventListener("click", e => {
    if (reduce || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    warpTo(a.getAttribute("href"), a.querySelector(".gate-tunnel") || a.querySelector("i") || a);
  }));
  /* coming back from the trail (bfcache): clear the warp */
  addEventListener("pageshow", () => { $$(".warp").forEach(w => w.remove()); document.documentElement.classList.remove("warping"); });
  /* "N related certifications ↓" brings the certifications block in, framed like a stage */
  document.addEventListener("click", e => {
    const a = e.target.closest(".gw-certs"); if (!a) return;
    e.preventDefault();
    scrollTo({ top: scrollY + $("#creds").getBoundingClientRect().top - innerHeight * .14, behavior: reduce ? "auto" : "smooth" });
  });

  /* hero veil fades as you dive in */
  const veil = $(".veil");
  const onScroll = () => { veil.style.opacity = innerWidth >= 820 ? Math.max(0, 1 - scrollY / (innerHeight * .55)) : 1; };
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); onScroll();

  /* ================= 01 before / after board ================= */
  /* A tiny spring (mass 1, tension k, friction c): interruptible, velocity-aware. */
  function spring(onUpdate, { k = 180, c = 22, x = 0 } = {}) {
    const s = { x, v: 0, target: x, raf: 0 };
    let last = 0;
    const step = now => {
      const dt = Math.min(.032, (now - last) / 1000 || .016); last = now;
      const a = -k * (s.x - s.target) - c * s.v;
      s.v += a * dt; s.x += s.v * dt;
      onUpdate(s.x);
      if (Math.abs(s.v) < .001 && Math.abs(s.x - s.target) < .001) { s.x = s.target; onUpdate(s.x); s.raf = 0; return; }
      s.raf = requestAnimationFrame(step);
    };
    s.to = (t, v) => { s.target = t; if (v != null) s.v = v; if (reduce) { s.x = t; onUpdate(t); return; } if (!s.raf) { last = performance.now(); s.raf = requestAnimationFrame(step); } };
    s.set = xv => { cancelAnimationFrame(s.raf); s.raf = 0; s.x = xv; s.v = 0; onUpdate(xv); };
    return s;
  }

  const board = $(".fd-board"), fdBtns = $$(".fd-switch button");
  const flow = spring(p => board.style.setProperty("--p", p.toFixed(4)));
  function setMode(m, v) {
    fdBtns.forEach(b => b.classList.toggle("on", b.dataset.mode === m));
    flow.to(m === "ok" ? 1 : 0, v);
    if (m === "ok") T.counts.triage = Math.max(1, T.counts.triage);
  }
  fdBtns.forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));
  /* direct manipulation: drag the board sideways to formalize; release and it settles */
  {
    let x0 = 0, p0 = 0, lastX = 0, lastT = 0, vel = 0, dragging = false;
    board.addEventListener("pointerdown", e => {
      dragging = true; board.setPointerCapture(e.pointerId); board.classList.add("dragging");
      x0 = lastX = e.clientX; lastT = performance.now(); p0 = flow.x; vel = 0; flow.set(flow.x);
    });
    board.addEventListener("pointermove", e => {
      if (!dragging) return;
      const w = board.clientWidth * .75, now = performance.now();
      let p = p0 + (e.clientX - x0) / w;
      if (p < 0) p *= .3; if (p > 1) p = 1 + (p - 1) * .3;            // rubber-band past the ends
      flow.set(p);
      vel = ((e.clientX - lastX) / w) / Math.max(.008, (now - lastT) / 1000); lastX = e.clientX; lastT = now;
    });
    const end = () => {
      if (!dragging) return; dragging = false; board.classList.remove("dragging");
      const projected = flow.x + vel * .18;                           // honour the flick
      setMode(projected > .5 ? "ok" : "raw", vel);
    };
    board.addEventListener("pointerup", end); board.addEventListener("pointercancel", end);
  }
  new IntersectionObserver((es, o) => es.forEach(e => {
    if (e.isIntersecting) { setTimeout(() => setMode("ok"), reduce ? 0 : 700); o.disconnect(); }
  }), { threshold: .6 }).observe(board);

  /* ================= 02 technology (a task: the tools, integrated, no exclusive paths) ================= */
  let toolSel = null;
  const seenTools = new Set();
  function renderGateway() {
    const l = L(), sel = toolSel;
    /* the tools as app-icon tiles, grouped by their role in the flow; all of them stay in play */
    $("#eco").className = "eco" + (sel ? " has-sel" : "");
    $("#eco").innerHTML = Object.keys(l.layers).map(k => `<div class="eco-row"><span class="mono eco-l">${esc(l.layers[k])}</span><ul class="tiles">${
      TOOLS.filter(t => t[0] === k).map(t => `<li class="tool${sel === t[1] ? " on" : ""}"><button type="button" class="tool-b" data-id="${t[1]}" aria-pressed="${sel === t[1]}">${mark(TOOL_MARK[t[1]], "tile")}<span class="tool-n">${esc(t[2])}</span></button></li>`).join("")}</ul></div>`).join("");
    $$("#eco .tool-b").forEach(b => b.addEventListener("click", () => {
      toolSel = toolSel === b.dataset.id ? null : b.dataset.id;
      if (toolSel) { seenTools.add(toolSel); T.counts.tools = seenTools.size; }
      renderGateway(); renderSummary();
      $(`#eco .tool-b[data-id="${b.dataset.id}"]`)?.focus();
    }));
    /* certifications that back the selected tool light up */
    const aiIds = TOOLS.filter(t => t[0] === "ai").map(t => t[1]);
    $("#creds").classList.toggle("has-sel", !!sel);
    $$("#techCerts .cert").forEach(c => {
      const ids = c.dataset.tools.split(" ");
      c.classList.toggle("on", !!sel && (ids.includes(sel) || (ids.includes("ai") && aiIds.includes(sel))));
    });
    if (!sel) { $("#gwOut").innerHTML = `<p class="gw-wait">${esc(l.gwWait)}</p>`; return; }
    const tool = TOOLS.find(t => t[1] === sel), certs = $$("#techCerts .cert.on").length;
    $("#gwOut").innerHTML = `<div class="in"><span class="lbl mono">${esc(l.layers[tool[0]])}</span><h4>${esc(tool[2])}</h4><p>${esc(ROLE[lang][sel])}</p>${
      certs ? `<a class="gw-certs mono" href="#certificacoes">${esc(l.certsLit(certs))} ↓</a>` : ""}</div>`;
  }

  /* ================= certifications (tech in 02, law in 05) ================= */
  function renderCerts() {
    const row = c => {
      const title = typeof c.t === "string" ? c.t : c.t[lang];
      const meta = `<span class="mono cert-meta">${esc(c.iss)}${c.y ? ` · ${c.y}` : ""}</span>`;
      const inner = `${mark(c.m, "ci")}<span class="cert-txt"><b>${esc(title)}</b>${meta}</span>`;
      return `<li class="cert" data-tools="${c.tools || ""}">${c.url
        ? `<a href="${c.url}" target="_blank" rel="noopener">${inner}<span class="cert-go" aria-hidden="true">↗</span></a>`
        : `<div>${inner}</div>`}</li>`;
    };
    $("#techCerts").innerHTML = CERTS.tech.map(row).join("");
    $("#lawCerts").innerHTML = CERTS.law.map(row).join("");
  }

  /* ================= 03 agent (fictional base) ================= */
  const day = 864e5, now = Date.now();
  const BASE = [
    { id: "PRC-014", name: "Ana Souza", role: { pt: "Diretora Financeira", en: "CFO" }, powers: ["lease", "bank"], exp: now + 45 * day },
    { id: "PRC-022", name: "Bruno Lima", role: { pt: "Diretor Jurídico", en: "General Counsel" }, powers: ["lease", "ma", "hr"], exp: now + 300 * day },
    { id: "PRC-031", name: "Carla Mendes", role: { pt: "Gerente de RH", en: "HR Manager" }, powers: ["hr"], exp: now + 80 * day },
    { id: "PRC-008", name: "Diego Rocha", role: { pt: "Diretor de Operações", en: "COO" }, powers: ["lease"], exp: now - 20 * day }
  ];
  const fmt = t => new Date(t).toLocaleDateString(lang === "en" ? "en-GB" : "pt-BR");
  const POWER_RX = { lease: /loca[çc]|lease|aluguel|rent/, ma: /m&a|aquisi|acquisi|fus[ãa]o|merger/, bank: /banc|bank|pagament|payment/, hr: /trabalh|\brh\b|\bhr\b|employ|labor/ };
  function answer(q) {
    const s = q.toLowerCase(), l = L(), valid = BASE.filter(r => r.exp > now);
    const power = Object.keys(POWER_RX).find(k => POWER_RX[k].test(s));
    const person = BASE.find(r => new RegExp("\\b" + r.name.split(" ")[0].toLowerCase() + "\\b").test(s));
    if (/venc|expir|renov|renew|prazo|90/.test(s)) {
      const list = valid.filter(r => r.exp - now < 90 * day).sort((a, b) => a.exp - b.exp);
      return { text: l.ansExp(list.map(r => `${r.name} (${fmt(r.exp)})`).join(", ")), src: list.map(r => r.id) };
    }
    if (person && power) {
      const yes = person.exp > now && person.powers.includes(power);
      return { text: l.ansHas(person.name, l.powers[power], yes, yes ? fmt(person.exp) : person.powers.map(p => l.powers[p]).join(", ")), src: [person.id] };
    }
    if (power) {
      const who = valid.filter(r => r.powers.includes(power));
      if (!who.length) return { text: l.ansNone(l.powers[power]), src: [] };
      return { text: l.ansWho(l.powers[power], who.map(r => `${r.name} (${r.role[lang]})`).join(", ")), src: who.map(r => r.id) };
    }
    if (person) {
      const st = person.exp > now ? l.valid(fmt(person.exp)) : l.expired(fmt(person.exp));
      return { text: l.ansPerson(person.name, person.role[lang], person.powers.map(p => l.powers[p]).join(", "), st), src: [person.id] };
    }
    return { text: l.ansFallback, src: [] };
  }
  const logEl = $("#agentLog");
  function msg(cls, html) { const m = document.createElement("div"); m.className = "msg " + cls; m.innerHTML = html; logEl.appendChild(m); logEl.scrollTop = logEl.scrollHeight; return m; }
  function ask(q) {
    if (!q.trim()) return;
    /* optimistic UI: the message is on screen at once, pending; the tick confirms it */
    const u = msg("u", `${esc(q)}<span class="st" title="${lang === "en" ? "sending" : "enviando"}">◷</span>`);
    setTimeout(() => { const st = u.querySelector(".st"); st.textContent = "✓"; st.classList.add("ok"); st.title = lang === "en" ? "sent" : "enviada"; }, reduce ? 0 : 220);
    /* skeleton in the shape of the answer, instead of a generic spinner */
    const t = msg("a skel", "<i></i><i></i><i></i>"), r = answer(q);
    setTimeout(() => {
      t.className = "msg a";
      t.innerHTML = esc(r.text) + (r.src.length ? `<br><span class="src">${L().src}: ${r.src.join(" · ")}</span>` : "");
      logEl.scrollTop = logEl.scrollHeight;
    }, reduce ? 0 : 800);
    T.counts.agent++;
  }
  /* one suggestion at a time, typed out like a live prompt: click it (or send an empty field) to ask it */
  let tryI = 0, tryTimer = null, engaged = false;
  const sendBtn = $("#agentForm .btn");
  function engage() { engaged = true; sendBtn.classList.remove("nudge"); }
  function typeSuggestion() {
    clearTimeout(tryTimer);
    const qs = L().agentQs, q = qs[tryI % qs.length], el = $("#agentChips .try-q");
    if (!el) return;
    if (reduce) { el.textContent = q; tryTimer = setTimeout(() => { tryI++; typeSuggestion(); }, 4500); return; }
    let n = 0;
    const type = () => { el.textContent = q.slice(0, ++n); tryTimer = setTimeout(n < q.length ? type : erase, n < q.length ? 32 : 2600); };
    const erase = () => { el.textContent = q.slice(0, --n); tryTimer = n > 0 ? setTimeout(erase, 14) : setTimeout(() => { tryI++; typeSuggestion(); }, 260); };
    type();
  }
  $("#agentForm").addEventListener("submit", e => {
    e.preventDefault();
    const v = $("#agentIn").value.trim() || L().agentQs[tryI % L().agentQs.length];
    ask(v); $("#agentIn").value = ""; engage();
  });
  function renderAgent() {
    logEl.innerHTML = "";
    const hello = () => msg("a", esc(L().agentHello));
    $("#agentChips").innerHTML = `<button type="button" class="try"><span class="try-k mono">${lang === "en" ? "try" : "experimente"}</span><span class="try-q"></span><span class="try-caret" aria-hidden="true"></span><span class="try-go" aria-hidden="true">↵</span></button>`;
    $("#agentChips .try").addEventListener("click", () => { ask(L().agentQs[tryI % L().agentQs.length]); engage(); tryI++; typeSuggestion(); });
    if (!engaged) sendBtn.classList.add("nudge");
    /* the agent "types" its greeting the first time the chat comes into view */
    if (renderAgent.seen || reduce) { hello(); typeSuggestion(); return; }
    const dots = msg("a typing", "<i></i><i></i><i></i>");
    if (renderAgent.io) renderAgent.io.disconnect();          // a language switch before the chat was seen
    (renderAgent.io = new IntersectionObserver((es, o) => es.forEach(e => {
      if (!e.isIntersecting) return; o.disconnect(); renderAgent.seen = true;
      setTimeout(() => { dots.remove(); hello(); typeSuggestion(); }, 1100);
    }), { threshold: .5 })).observe(logEl);
  }

  /* ================= 06 end: the routing receipt ================= */
  function finish() { if (!T.closed) T.closed = new Date(); renderSummary(); }
  const SHAPES = ["ring", "task", "task", "task", "sub", "data", "gateway", "end"];
  function renderSummary() {
    const l = L(), loc = lang === "en" ? "en-GB" : "pt-BR";
    const hm = d => d.toLocaleTimeString(loc, { hour: "2-digit", minute: "2-digit" });
    const secs = Math.max(1, Math.round(((T.closed || new Date()) - T.opened) / 1000));
    const items = Object.entries(T.counts).filter(([, n]) => n > 0).map(([k, n]) => `<li>${esc(l.sumItems[k](n))}</li>`).join("");
    const trail = SHAPES.map((s, i) => `${i ? '<i class="r-link"></i>' : ""}<span class="ico ${s}${T.closed ? " on" : ""}"></span>`).join("");
    $("#summary").innerHTML = `
      <div class="r-top">
        <div><p class="mono r-kicker">${esc(l.rTitle)}</p><p class="r-for">${esc(l.rFor)}</p></div>
        <p class="mono r-id">${esc(T.id)}</p>
      </div>
      <div class="r-trail${T.closed ? " done" : ""}" aria-hidden="true">${trail}</div>
      <dl class="r-times">
        <div><dt class="mono">${esc(l.rOpen)}</dt><dd>${hm(T.opened)}</dd></div>
        <div><dt class="mono">${esc(l.rClose)}</dt><dd>${T.closed ? hm(T.closed) : esc(l.rPending)}</dd></div>
        <div><dt class="mono">${esc(l.rDur)}</dt><dd>${l.dur(Math.floor(secs / 60), secs % 60)}</dd></div>
      </dl>
      <div class="r-cut" aria-hidden="true"></div>
      <div class="r-body">${items ? `<p>${esc(l.sumDid)}</p><ul>${items}</ul>` : `<p>${esc(l.sumNone)}</p>`}</div>`;
  }

  /* ================= O Labirinto: the real final level, in a dialog ================= */
  /* Shared-element transition: the cover grows into the game window and shrinks back.
     Only one element carries the name at a time, as the View Transitions API requires. */
  const dlg = $("#gameDlg"), frame = $("#gameFrame"), playBtn = $("#playGame"), cover = playBtn;
  const vt = fn => (document.startViewTransition && !reduce) ? document.startViewTransition(fn) : fn();
  let opener = null;
  playBtn.addEventListener("click", () => {
    opener = document.activeElement;
    dlg.classList.remove("loaded");
    cover.style.viewTransitionName = "game";
    vt(() => {
      cover.style.viewTransitionName = "none";
      dlg.style.viewTransitionName = "game";
      frame.src = ROOT_PATH + "game/index.html";
      dlg.showModal();
    });
  });
  frame.addEventListener("load", () => { if (frame.src.includes("game/")) { dlg.classList.add("loaded"); frame.focus(); } });
  const closeGame = () => {
    if (!dlg.open) return;
    vt(() => { dlg.close(); dlg.style.viewTransitionName = "none"; cover.style.viewTransitionName = "game"; });
  };
  $("#closeGame").addEventListener("click", closeGame);
  dlg.addEventListener("cancel", e => { e.preventDefault(); closeGame(); });            // Esc goes through the transition too
  dlg.addEventListener("close", () => {
    frame.src = "about:blank";
    setTimeout(() => { cover.style.viewTransitionName = ""; }, 700);
    (opener && opener !== document.body && document.contains(opener) ? opener : playBtn).focus({ preventScroll: true });   // focus returns to where it came from
  });
  dlg.addEventListener("click", e => { if (e.target === dlg) closeGame(); });

  /* ================= optional detour: the mat trail ================= */
  /* (it now opens its own universe: tatame.html) */

  /* ================= language ================= */
  /* the email is assembled at runtime, so it never sits in the HTML for scrapers */
  const MAIL = ["juridicojulianacampos", "gmail.com"].join("@");
  function fillEmail() {
    $$(".em").forEach(s => { s.textContent = MAIL; });
    $("#mailCta").href = "mailto:" + MAIL;
  }
  $("#copyMail").addEventListener("click", async e => {
    const b = e.currentTarget;
    try { await navigator.clipboard.writeText(MAIL); }
    catch {                                                   // no clipboard access: select the text instead
      const range = document.createRange(), sel = window.getSelection();
      range.selectNodeContents($(".mail-line .em")); sel.empty(); sel.addRange(range);
    }
    b.textContent = lang === "en" ? EN.cpyOk : EN.cpyPt;
    setTimeout(() => { b.textContent = lang === "en" ? EN.cpy : "copiar"; }, 1600);
  });
  function applyLang() {
    document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
    const dict = lang === "en" ? EN : PT;
    $$("[data-i18n]").forEach(el => { const v = dict[el.dataset.i18n]; if (v != null) el.innerHTML = v; });
    $$("[data-i18n-ph]").forEach(el => { const v = dict[el.dataset.i18nPh]; if (v != null) el.placeholder = v; });
    $("#lang").textContent = lang === "en" ? "PT" : "EN";
    $("#lang").setAttribute("aria-label", lang === "en" ? "PT · mudar para português" : "EN · switch to English");
    nodes.forEach((n, i) => { const label = `${String(i).padStart(2, "0")} · ${L().stages[i]}`; n.dataset.label = label; n.setAttribute("aria-label", i === 0 ? `jcr · ${label}` : label); });
    const fk = $("#railFork"); fk.dataset.label = L().fork; fk.setAttribute("aria-label", L().fork);
    renderCerts(); renderGateway(); renderAgent(); renderSummary(); updateRail(); fillEmail();
    emit("jcr:lang", lang);
  }
  $("#lang").addEventListener("click", () => {
    const next = lang === "en" ? "pt" : "en"; store.set("jcr-lang", next);
    if (root.dataset.alt) { location.href = root.dataset.alt + location.hash; return; }   // built site: each language has its own URL
    lang = next; applyLang();
  });

  applyLang();
  if (document.fonts) document.fonts.ready.then(updateRail);
})();
