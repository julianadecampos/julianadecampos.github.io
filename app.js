/* Content, demos, the process rail and the visitor's request. The 3D journey lives in scene.js, the maze in maze.js. */
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

  /* ================= i18n (PT lives in the HTML) ================= */
  const EN = {
    skip: "Skip straight to the facts",
    k0: "Juliana de Campos Ribeiro · legal, process and AI",
    h0: "Legal doesn't have to be a <em>maze</em>.",
    p0: "I design the path legal requests travel, with process, technology and AI, and I teach people to walk it. Here, you are the request.",
    start: "Start the process", hint0: "or scroll to enter the flow ↓",

    k1: "01 · process · triage task",
    h1: "I start from the work people <em>actually</em> do.",
    p1: "I read the flow as it really happens and formalize it into a process: every step gets a record, an owner and a defined path. Requests stop getting lost in emails and chats, and gain an intake, a triage and a trail.",
    fdRaw: "Informal", fdOk: "Formalized", fdIntake: "single intake channel",
    fdS1: "chat", fdR1: "“hi! got a minute? it's quick”", fdO1: "[Contracts] Confidentiality clause",
    fdS2: "email", fdR2: "“FW: FW: RE: amendment (v7 final)”", fdO2: "[Contracts] Supplier amendment review",
    fdS3: "hallway", fdR3: "“remember that power of attorney?”", fdO3: "[Powers of attorney] Renewal to sign a lease",
    fdS4: "spreadsheet", fdR4: "“row 47: check with legal”", fdO4: "[Corporate] Shareholders' meeting minutes",
    fdM: "owner · deadline · history",
    fdNote: "Illustration: the same requests, before and after a formalized process. Drag the board sideways.",
    pr1t: "Centralized requests", pr1d: "A single intake channel, with triage, a record and follow-up for every request.",
    pr2t: "Information management", pr2d: "Contracts and powers of attorney organized and easy to look up: what exists, who signs, what expires.",
    tLabel: "simulate an incoming request", tBtn: "Run triage", tCat: "category", tPri: "priority", tQueue: "queue", tTitle: "standardized title",
    tNote: "A demonstration based on simple rules, running in your browser. The production version operates on Jira + Rovo.",

    k2: "02 · technology · gateway",
    h2: "Diagnosis first. Then, the <em>tool</em>.",
    p2: "These are not mutually exclusive paths: I integrate tools, each with its own role in the flow. I start from a diagnosis of the problem to define the right combination. Select a scenario.",
    toolsT: "tools I master",
    sg1: "generative AI", sg2: "process and management", sg3: "building and productivity",
    certLeg: "credentialed", credT: "02 · technology · credentials", cAiFl: "AI Fluency", cAnd: "and",
    credH: "The training behind every <em>choice</em>.", credSub: "Courses and certifications in generative AI, service management and process modelling. Select a scenario above and the related credentials stand out.",
    vf: "verify", cgAi: "generative AI", cgSvc: "service management", cgProc: "processes",

    k3: "03 · AI · service task",
    h3: "Agents that answer <em>with a source</em>.",
    p3: "The power-of-attorney base used to live in a Drive folder. Now it has a defined process and a query agent. Chat with the demo version.",
    p3b: "I also built an assistant that guides requesters through drafting SMS and Terms of Reference, and the Friday newsletter that sums up the busiest legal space on Google Chat.",
    aHead: "agent · powers of attorney", aBadge: "fictional data", aPh: "Ask about the powers of attorney…", aSend: "Send",

    k4: "04 · teaching · subprocess",
    h4: "Mastery that becomes <em>teaching</em>.",
    p4: "Technology only creates value once it is adopted. That is why, after mastering a tool or a process, I translate it for the people who will use it, through workshops, one-on-one guidance and learning resources designed for the purpose.",
    m1t: "Mastery", m1d: "I study and apply the tool or process until I understand it in full.",
    m2t: "Translation", m2d: "I turn technical knowledge into the language and examples of everyday legal work.",
    m3t: "Practice", m3d: "I guide people through applying it until the use becomes routine.",
    fmtT: "formats",
    f1t: "AI workshops", f1d: "For legal teams, from small groups to the entire department.",
    f2t: "One-on-one guidance", f2d: "Dedicated sessions that bring the learning into each person's routine.",
    f3t: "Applied training", f3d: "Such as going beyond the obvious with AI: structuring content in Markdown and HTML and building one's first tools.",
    gKick: "educational game · developed with Claude Code",
    gDesc: "A five-level platform game that teaches the people who reach out to legal which channel to use for each request. The character must deliver a legal opinion while making her way through corporate routine.",
    gCap: "platform game · 5 levels", gPlay: "Play the final level", gDlg: "final level", gLoad: "loading the labyrinth…", geObs: "obstacle",
    ge1: "The follow-up that always comes back", ge2: "Stacks of paper", ge3: "Mic on mute", ge4: "Power of focus",
    dtK: "optional detour", dtT: "The mat trail", dtS: "Jiu-jitsu black belt, for the curious.",
    mtLead: "On the mat, technique is built through repetition, with someone attentive to the details.",
    mb1: "White belt", mb2: "Blue belt", mb3: "Purple belt", mb4: "Brown belt", mb5: "Black belt",
    ma1: "Started at Soul Fighters", ma2: "Starts training at SBA", ma3: "Starts training at Yvone Duarte Jiu-Jitsu, as a student of Master Yvone Duarte",
    me1: "Open Class on Feminism and Self-Defense at Teatro de Arena, Porto Alegre, with the NGO Emancipa Mulher",
    me2: "Women's Leadership Development Project in Jiu-Jitsu",
    me3: "Public Self-Defense Seminar with Master Yvone Duarte at UFRGS",
    mtFoot: "Creator of <b>VOZ</b>, a social project that develops women through jiu-jitsu.",
    vozq: "On the mat, technique is built through repetition, with someone attentive to the details. It is the same principle I apply when teaching technology.",
    voz: "Jiu-jitsu black belt since 2024, a student of Master Yvone Duarte and the creator of VOZ, a social project that develops women through jiu-jitsu.",

    k5: "05 · data object · record",
    h5: "Over a decade in law. Recent years, <em>redesigning</em> how it works.",
    y1: "2026 → now",
    l1t: "Legal Analyst",
    l1d: "Corporate contracts, M&amp;A, AI governance and centralizing requests. I build tools with Claude and Claude Code for the team.",
    l2o: "Autonomous Social Services",
    l2t: "Contracts &amp; Procurement · Pregoeira · CPL President",
    l2d: "Corporate governance in procurement for a parastatal entity, AI to manage information and reduce bureaucracy, and internal training of staff in purchasing and procurement.",
    lane: "law practice and consulting", rCoord: "· Coordinator",
    rCons: "Public procurement consulting", rAdvLic: "Legal practice and advisory in Business, Corporate and Administrative Law", rAdv: "Lawyer",
    eduT: "education",
    e1: "Postgrad in M&amp;A · Galícia Educação · 2027", e2: "Postgrad in Social Media Communication · FADERGS · 2019",
    e3: "Specialization in Public Law · FMP/RS · 2016", e4: "Law · PUCRS · 2013",

    k6: "06 · end event", h6: "Request <em>approved</em>.",
    p6: "The journey ends here. The next stage is a conversation.",
    c1: "Get in touch",
    mkT: "behind the scenes · how this site was made",
    mkP: "This site was developed in collaboration with Claude Code, from concept to code, over successive iterations. The 3D scene is generated in code with three.js. The method is also part of the portfolio.",
    mq: "process <i>✦</i> technology <i>✦</i> artificial intelligence <i>✦</i> teaching <i>✦</i> legal doesn't have to be a maze <i>✦</i> juridicojulianacampos@gmail.com <i>✦</i>&nbsp;"
  };
  const PT = {};
  $$("[data-i18n]").forEach(el => { if (!(el.dataset.i18n in PT)) PT[el.dataset.i18n] = el.innerHTML; });
  $$("[data-i18n-ph]").forEach(el => PT[el.dataset.i18nPh] = el.placeholder);

  const D = {
    pt: {
      stages: ["início", "triagem", "gateway", "agente de IA", "capacitação", "histórico", "resolução"],
      quizOk: "Correto. Pelo canal oficial, a solicitação é registrada e rastreável.",
      quizNo: "Por esse canal, a solicitação perde registro e rastreabilidade.",
      examples: [
        "Bom dia, preciso com urgência renovar a procuração do diretor para assinar o contrato de locação na próxima semana.",
        "Podemos utilizar IA generativa com dados de clientes? Qual é a política interna?"
      ],
      cats: { poa: ["Procurações", "Societário"], ma: ["M&A", "Legal Corporate"], ai: ["Governança de IA", "Compliance"], ct: ["Contratos", "Contratos"], gen: ["Consulta geral", "Triagem humana"] },
      pri: { high: "Alta", mid: "Média", low: "Normal" },
      problems: [
        ["Solicitações recebidas por múltiplos canais", ["jira", "rovo"], "O Jira concentra a entrada em um canal único; o Rovo automatiza a triagem e a padronização dos títulos. Cada solicitação ganha dono, prazo e histórico."],
        ["Contratos dispersos, sem visão consolidada", ["fluig", "totvs", "gws"], "O Fluig estrutura o portal de contratos, integrado aos dados do RM Totvs; o Google Workspace sustenta documentos e colaboração. Informação centralizada, rastreável e com responsáveis."],
        ["Processos que ainda não foram mapeados e materializados", ["claude", "bizagi"], "Com o Claude, levanto o inventário de tarefas; no Bizagi, mapeio o fluxo em BPMN. O resultado se converte em norma interna e procedimento."],
        ["Atividades recorrentes e de baixo valor agregado", ["claude", "github", "gws"], "Com o Claude Code, desenvolvo scripts e automações versionados no GitHub e integrados ao Google Workspace, como a newsletter semanal no Google Chat."],
        ["Conhecimento disperso e difícil de consultar", ["claude", "cowork", "gemini", "nblm", "gpt"], "Claude, Gemini Enterprise, NotebookLM e ChatGPT, cada um em seu papel: pesquisa, síntese de documentos, rascunhos e agentes que respondem com fonte."]
      ],
      gwWait: "Selecione um cenário para ver as ferramentas que se combinam.", routedTo: "combinação indicada",
      layers: { intake: "entrada e triagem", info: "informação", proc: "processos", ai: "IA generativa", build: "construção" },
      agentHello: "Olá. Sou o agente da base de procurações (versão demo, dados fictícios). Pergunte quem pode assinar, o que vence ou que poderes alguém tem.",
      agentQs: ["Quem pode assinar contratos de locação?", "Quais procurações vencem nos próximos 90 dias?", "A procuração de Ana Souza abrange operações de M&A?"],
      powers: { lease: "contratos de locação", ma: "operações de M&A", bank: "movimentação bancária", hr: "atos trabalhistas" },
      src: "fonte",
      ansWho: (p, names) => `Para ${p}, há procuração vigente para: ${names}.`,
      ansNone: p => `Não há procuração vigente com poderes para ${p}. Recomenda-se abrir uma solicitação pelo canal oficial.`,
      ansExp: list => list.length ? `Vencem nos próximos 90 dias: ${list}. Recomenda-se iniciar a renovação.` : "Nenhuma procuração vence nos próximos 90 dias.",
      ansHas: (n, p, yes, d) => yes ? `Sim. A procuração de ${n} inclui ${p}, válida até ${d}.` : `Não. A procuração de ${n} não inclui ${p}. Poderes atuais: ${d}.`,
      ansPerson: (n, r, p, st) => `${n} · ${r}. Poderes: ${p} (${st}).`,
      valid: d => `válida até ${d}`, expired: d => `vencida em ${d}`,
      ansFallback: "Não há base suficiente para responder com segurança, e reconhecer esse limite é parte de um agente confiável. Consulte signatários, poderes ou vigências.",
      rTitle: "comprovante de tramitação", rFor: "Juliana de Campos Ribeiro", rOpen: "aberta", rClose: "concluída", rDur: "tempo de tramitação", rPending: "em andamento",
      sumDid: "Ao longo do percurso, você:",
      sumNone: "Você percorreu o fluxo sem interagir com as demonstrações. Elas permanecem disponíveis em cada etapa.",
      sumItems: { triage: () => "viu demandas informais ganharem dono, prazo e histórico", route: n => `analisou ${n} cenário${n > 1 ? "s" : ""} no gateway`, agent: n => `consultou o agente ${n} ${n > 1 ? "vezes" : "vez"}`, quiz: () => "conduziu a solicitação ao canal correto no Labirinto" },
      dur: (m, s) => m ? `${m} min ${s} s` : `${s} s`
    },
    en: {
      stages: ["start", "triage", "gateway", "AI agent", "enablement", "record", "resolution"],
      quizOk: "Correct. Through the official channel, the request is recorded and traceable.",
      quizNo: "Through this channel, the request loses its record and traceability.",
      examples: [
        "Good morning, I urgently need to renew the director's power of attorney to sign the lease next week.",
        "May we use generative AI with client data? What is the internal policy?"
      ],
      cats: { poa: ["Powers of attorney", "Corporate"], ma: ["M&A", "Legal Corporate"], ai: ["AI governance", "Compliance"], ct: ["Contracts", "Contracts"], gen: ["General inquiry", "Human triage"] },
      pri: { high: "High", mid: "Medium", low: "Normal" },
      problems: [
        ["Requests received through multiple channels", ["jira", "rovo"], "Jira concentrates intake in a single channel; Rovo automates triage and title standardization. Every request gains an owner, a deadline and a history."],
        ["Dispersed contracts, no consolidated view", ["fluig", "totvs", "gws"], "Fluig structures the contracts portal, integrated with RM Totvs data; Google Workspace supports documents and collaboration. Information centralized, traceable and owned."],
        ["Processes not yet mapped and documented", ["claude", "bizagi"], "With Claude, I build the task inventory; in Bizagi, I map the flow in BPMN. The result becomes internal rules and procedures."],
        ["Recurring, low-value activities", ["claude", "github", "gws"], "With Claude Code, I build scripts and automations versioned on GitHub and integrated with Google Workspace, such as the weekly newsletter on Google Chat."],
        ["Knowledge scattered and hard to consult", ["claude", "cowork", "gemini", "nblm", "gpt"], "Claude, Gemini Enterprise, NotebookLM and ChatGPT, each in its role: research, document synthesis, drafting and agents that answer with a source."]
      ],
      gwWait: "Select a scenario to see which tools work together.", routedTo: "recommended combination",
      layers: { intake: "intake and triage", info: "information", proc: "processes", ai: "generative AI", build: "building" },
      agentHello: "Hello. I'm the power-of-attorney agent (demo version, fictional data). Ask who can sign, what's expiring, or what powers someone has.",
      agentQs: ["Who can sign lease agreements?", "Which powers of attorney expire in the next 90 days?", "Does Ana Souza's power of attorney cover M&A transactions?"],
      powers: { lease: "lease agreements", ma: "M&A transactions", bank: "banking operations", hr: "employment acts" },
      src: "source",
      ansWho: (p, names) => `For ${p}, there's a valid power of attorney for: ${names}.`,
      ansNone: p => `There is no valid power of attorney covering ${p}. Opening a request through the official channel is recommended.`,
      ansExp: list => list.length ? `Expiring in the next 90 days: ${list}. Starting the renewal is recommended.` : "No powers of attorney expire in the next 90 days.",
      ansHas: (n, p, yes, d) => yes ? `Yes. ${n}'s power of attorney covers ${p}, valid until ${d}.` : `No. ${n}'s power of attorney doesn't cover ${p}. Current powers: ${d}.`,
      ansPerson: (n, r, p, st) => `${n} · ${r}. Powers: ${p} (${st}).`,
      valid: d => `valid until ${d}`, expired: d => `expired on ${d}`,
      ansFallback: "There is not enough basis to answer reliably, and recognizing that limit is part of a trustworthy agent. Ask about signatories, powers or validity.",
      rTitle: "routing receipt", rFor: "Juliana de Campos Ribeiro", rOpen: "opened", rClose: "completed", rDur: "processing time", rPending: "in progress",
      sumDid: "Along the journey, you:",
      sumNone: "You went through the flow without interacting with the demonstrations. They remain available at each stage.",
      sumItems: { triage: () => "watched informal requests gain an owner, a deadline and a history", route: n => `analyzed ${n} scenario${n > 1 ? "s" : ""} at the gateway`, agent: n => `consulted the agent ${n} time${n > 1 ? "s" : ""}`, quiz: () => "guided the request to the right channel in O Labirinto" },
      dur: (m, s) => m ? `${m} min ${s} s` : `${s} s`
    }
  };
  let lang = store.get("jcr-lang") === "en" ? "en" : "pt";
  const L = () => D[lang];
  window.jcr = { t: k => L()[k] };

  /* ================= the request ================= */
  const T = { id: "JCR-26-" + Math.floor(1000 + Math.random() * 9000), opened: new Date(), closed: null, status: "open", counts: { triage: 0, route: 0, agent: 0, quiz: 0 } };
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
  $$(".stage").forEach(s => io.observe(s.querySelector(".panel") || s));

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

  /* ================= 02 gateway ================= */
  let gwSel = null;
  const TOOLS = [
    ["intake", "jira", "Jira · JSM"], ["intake", "rovo", "Rovo"],
    ["info", "fluig", "Fluig"], ["info", "totvs", "RM Totvs"], ["info", "gws", "Google Workspace"], ["info", "nblm", "NotebookLM"],
    ["proc", "bizagi", "Bizagi · BPMN"],
    ["ai", "claude", "Claude · Claude Code"], ["ai", "cowork", "Claude Cowork"], ["ai", "gemini", "Gemini Enterprise"], ["ai", "gpt", "ChatGPT"],
    ["build", "github", "GitHub"], ["build", "web", "HTML · Markdown"]
  ];
  function renderGateway() {
    const l = L(), sel = gwSel === null ? null : l.problems[gwSel];
    $("#gwProblems").innerHTML = l.problems.map((p, i) => `<button type="button" class="${gwSel === i ? "sel" : ""}" data-i="${i}" aria-pressed="${gwSel === i}">${esc(p[0])}</button>`).join("");
    $$("#gwProblems button").forEach(b => b.addEventListener("click", () => {
      gwSel = +b.dataset.i; T.counts.route++;
      emit("jcr:route", gwSel < 4 ? gwSel : null);
      renderGateway();
    }));
    $("#eco").className = "eco" + (sel ? " has-sel" : "");
    $("#eco").innerHTML = Object.keys(l.layers).map(k => `<div class="eco-row"><span class="mono eco-l">${esc(l.layers[k])}</span><div class="eco-pills">${
      TOOLS.filter(t => t[0] === k).map(t => `<span class="eco-t${sel && sel[1].includes(t[1]) ? " on" : ""}">${esc(t[2])}</span>`).join("")}</div></div>`).join("");
    /* credentials that back the selected combination light up */
    const aiIds = TOOLS.filter(t => t[0] === "ai").map(t => t[1]);
    $("#creds").classList.toggle("has-sel", !!sel);
    $$("#creds .cred").forEach(c => {
      const ids = c.dataset.tools.split(" ");
      c.classList.toggle("on", !!sel && ids.some(id => sel[1].includes(id) || (id === "ai" && sel[1].some(s => aiIds.includes(s)))));
    });
    if (!sel) { $("#gwOut").innerHTML = `<p class="gw-wait">${esc(l.gwWait)}</p>`; return; }
    const names = TOOLS.filter(t => sel[1].includes(t[1])).map(t => t[2]).join(" + ");
    $("#gwOut").innerHTML = `<div class="in"><span class="lbl mono">${esc(l.routedTo)}</span><h4>${esc(names)}</h4><p>${esc(sel[2])}</p></div>`;
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
  $("#agentForm").addEventListener("submit", e => { e.preventDefault(); ask($("#agentIn").value); $("#agentIn").value = ""; });
  function renderAgent() {
    logEl.innerHTML = ""; msg("a", esc(L().agentHello));
    $("#agentChips").innerHTML = L().agentQs.map((q, i) => `<button type="button" class="chip" data-i="${i}">${esc(q)}</button>`).join("");
    $$("#agentChips .chip").forEach(b => b.addEventListener("click", () => ask(L().agentQs[b.dataset.i])));
  }

  /* ================= 06 end: the routing receipt ================= */
  function finish() { if (!T.closed) T.closed = new Date(); renderSummary(); }
  const SHAPES = ["ring", "task", "gateway", "task", "sub", "data", "end"];
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
      frame.src = "game/index.html";
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
  function applyLang() {
    document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
    const dict = lang === "en" ? EN : PT;
    $$("[data-i18n]").forEach(el => { const v = dict[el.dataset.i18n]; if (v != null) el.innerHTML = v; });
    $$("[data-i18n-ph]").forEach(el => { const v = dict[el.dataset.i18nPh]; if (v != null) el.placeholder = v; });
    $("#lang").textContent = lang === "en" ? "PT" : "EN";
    nodes.forEach((n, i) => { const label = `${String(i).padStart(2, "0")} · ${L().stages[i]}`; n.dataset.label = label; n.setAttribute("aria-label", label); });
    renderGateway(); renderAgent(); renderSummary(); updateRail();
    emit("jcr:lang", lang);
  }
  $("#lang").addEventListener("click", () => { lang = lang === "en" ? "pt" : "en"; store.set("jcr-lang", lang); applyLang(); });

  applyLang();
  if (document.fonts) document.fonts.ready.then(updateRail);
})();
