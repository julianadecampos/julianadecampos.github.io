/* Site content: every text, tool and certificate lives here, separate from behaviour (app.js).
 PT body copy stays in index.html; EN copy, data and labels in both languages are below.
 The build also reads this file to generate the static English pages. */

/* brand marks from Simple Icons (CC0), simple-icons@13.21.0 */
export const LOGO = {
  claude: ["#D97757", "m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"],
  anthropic: ["#191919", "M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z"],
  jira: ["#0052CC", "M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0Z"],
  atlassian: ["#0052CC", "M7.12 11.084a.683.683 0 00-1.16.126L.075 22.974a.703.703 0 00.63 1.018h8.19a.678.678 0 00.63-.39c1.767-3.65.696-9.203-2.406-12.52zM11.434.386a15.515 15.515 0 00-.906 15.317l3.95 7.9a.703.703 0 00.628.388h8.19a.703.703 0 00.63-1.017L12.63.38a.664.664 0 00-1.196.006z"],
  googlegemini: ["#8E75B2", "M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81"],
  github: ["#181717", "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"],
  html5: ["#E34F26", "M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z"],
  markdown: ["#000000", "M22.27 19.385H1.73A1.73 1.73 0 010 17.655V6.345a1.73 1.73 0 011.73-1.73h20.54A1.73 1.73 0 0124 6.345v11.308a1.73 1.73 0 01-1.73 1.731zM5.769 15.923v-4.5l2.308 2.885 2.307-2.885v4.5h2.308V8.078h-2.308l-2.307 2.885-2.308-2.885H3.46v7.847zM21.232 12h-2.309V8.077h-2.307V12h-2.308l3.461 4.039z"],
  openai: ["#412991", "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"],
  google: ["#4285F4", "M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"],
  totvs: ["#363636", "M12 0C5.385 0 0 5.339 0 12c0 6.614 5.385 12 12 12 6.614 0 12-5.386 12-12S18.614 0 12 0ZM8.648 3.813c1.275-.068 10.697 2.302 11.43 2.943.614.85.614 9.118 0 9.685-.284.095-2.127-.283-4.205-.755 0 2.031-.143 3.966-.426 4.203-.756.236-10.772-2.267-11.527-2.928-.615-.85-.615-9.119 0-9.686.283-.094 2.079.284 4.205.756 0-2.031.142-3.969.425-4.205a.448.448 0 0 1 .098-.013Zm-.523 4.265c-.048 2.362.095 4.961.425 5.434.426.378 4.158 1.418 7.276 2.174.047-2.41-.095-5.008-.426-5.481-.425-.378-4.157-1.418-7.275-2.127Z"],
  googledrive: ["#4285F4", "M12.01 1.485c-2.082 0-3.754.02-3.743.047.01.02 1.708 3.001 3.774 6.62l3.76 6.574h3.76c2.081 0 3.753-.02 3.742-.047-.005-.02-1.708-3.001-3.775-6.62l-3.76-6.574zm-4.76 1.73a789.828 789.861 0 0 0-3.63 6.319L0 15.868l1.89 3.298 1.885 3.297 3.62-6.335 3.618-6.33-1.88-3.287C8.1 4.704 7.255 3.22 7.25 3.214zm2.259 12.653-.203.348c-.114.198-.96 1.672-1.88 3.287a423.93 423.948 0 0 1-1.698 2.97c-.01.026 3.24.042 7.222.042h7.244l1.796-3.157c.992-1.734 1.85-3.23 1.906-3.323l.104-.167h-7.249z"],
};
/* marks that are not in Simple Icons: the official icon published by each tool or institution */
export const IMG = { rovo: "rovo.svg", fluig: "fluig.png", nblm: "nblm.png", bizagi: "bizagi.png", futurelaw: "futurelaw.png", ufv: "ufv.png",
  tcu: "tcu.png", trybe: "trybe.png", enap: "enap.svg", fgv: "fgv.png", oab: "oab.png", pucrs: "pucrs.png" };

export const TOOL_MARK = { jira: "jira", rovo: "rovo", fluig: "fluig", totvs: "totvs", gws: "google", nblm: "nblm", bizagi: "bizagi",
  claude: "claude", ccode: "claude", cowork: "claude", gemini: "googlegemini", gpt: "openai", github: "github", web: "code" };

export const EN = {
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

  k2: "02 · technology · task",
  h2: "Tools that work together, each with its own <em>role</em>.",
  p2: "These are not mutually exclusive paths: I integrate tools according to the diagnosis of each problem, each with its own role in the flow. Tap a tool to see what it is and the related certifications.",
  toolsT: "tools I master",
  sg1: "generative AI", sg2: "process and management", sg3: "building and productivity",
  certLeg: "credentialed", credT: "02 · technology · certifications", cAiFl: "AI Fluency", cAnd: "and",
  credH: "Certifications in <em>technology</em>.", credSub: "Generative AI, service management and process modelling. Tap a tool in the technology stage and the related certifications stand out.",
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
  dtK: "gateway · optional detour", dtT: "The mat trail", dtS: "Jiu-jitsu black belt, for the curious.",
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
  eduT: "legal education",
  dg1l: "postgraduate · in progress", dg1t: "Mergers and Acquisitions (M&amp;A)", dgPrev: "completion",
  dg2l: "specialization", dg2t: "Public Law", dg3l: "bachelor's degree", dg3t: "Law",
  e2: "Postgraduate degree in Communication and Media Studies", e2d: "The foundation of my visual and design repertoire.", trajT: "career", designT: "communication and design", dtGo: "enter",
  lawCertT: "legal certifications",
  insT: "05 · record · insights", insH: "The trajectory, <em>year by year</em>.",
  insP: "Each dot is one year in one area. The deeper the colour, the more dated records that year: roles, degrees, certifications and milestones on the mat. Hover or tap to see the records.",
  less: "less", more: "more",

  k6: "06 · end event", h6: "Request <em>approved</em>.",
  p6: "The journey ends here. The next stage is a conversation.",
  c1: "Get in touch", cpy: "copy", cpyOk: "copied", cpyPt: "copiado",
  mkT: "behind the scenes · how this site was made",
  mkP: "This site was developed in collaboration with Claude Code, from concept to code, over successive iterations. The 3D scene is generated in code with three.js. The method is also part of the portfolio.",
  mq: "process <i>✦</i> technology <i>✦</i> artificial intelligence <i>✦</i> teaching <i>✦</i> legal doesn't have to be a maze <i>✦</i> <span class='em'></span> <i>✦</i>&nbsp;"
};

export const D = {
  pt: {
    stages: ["início", "triagem", "tecnologia", "agente de IA", "capacitação", "histórico", "resolução"],
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
      ["Atividades recorrentes e de baixo valor agregado", ["ccode", "github", "gws"], "Com o Claude Code, desenvolvo scripts e automações versionados no GitHub e integrados ao Google Workspace, como a newsletter semanal no Google Chat."],
      ["Conhecimento disperso e difícil de consultar", ["claude", "cowork", "gemini", "nblm", "gpt"], "Claude, Gemini Enterprise, Gemini Notebook e ChatGPT, cada um em seu papel: pesquisa, síntese de documentos, rascunhos e agentes que respondem com fonte."]
    ],
    gwWait: "Toque em uma ferramenta para saber o que ela é.", certsLit: n => `${n} certificaç${n > 1 ? "ões relacionadas" : "ão relacionada"}`, fork: "gateway · trilha do tatame",
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
    sumItems: { triage: () => "viu demandas informais ganharem dono, prazo e histórico", tools: n => `conheceu ${n} ferramenta${n > 1 ? "s" : ""} do ecossistema`, agent: n => `consultou o agente ${n} ${n > 1 ? "vezes" : "vez"}`, quiz: () => "conduziu a solicitação ao canal correto no Labirinto" },
    dur: (m, s) => m ? `${m} min ${s} s` : `${s} s`
  },
  en: {
    stages: ["start", "triage", "technology", "AI agent", "enablement", "record", "resolution"],
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
      ["Recurring, low-value activities", ["ccode", "github", "gws"], "With Claude Code, I build scripts and automations versioned on GitHub and integrated with Google Workspace, such as the weekly newsletter on Google Chat."],
      ["Knowledge scattered and hard to consult", ["claude", "cowork", "gemini", "nblm", "gpt"], "Claude, Gemini Enterprise, Gemini Notebook and ChatGPT, each in its role: research, document synthesis, drafting and agents that answer with a source."]
    ],
    gwWait: "Tap a tool to see what it is.", certsLit: n => `${n} related certification${n > 1 ? "s" : ""}`, fork: "gateway · the mat trail",
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
    sumItems: { triage: () => "watched informal requests gain an owner, a deadline and a history", tools: n => `explored ${n} tool${n > 1 ? "s" : ""} of the ecosystem`, agent: n => `consulted the agent ${n} time${n > 1 ? "s" : ""}`, quiz: () => "guided the request to the right channel in O Labirinto" },
    dur: (m, s) => m ? `${m} min ${s} s` : `${s} s`
  }
};

/* what each tool is (not what I do with it) */
export const ROLE = {
  pt: {
    jira: "Plataforma da Atlassian para gestão de trabalho. O Jira Service Management é a versão para centrais de atendimento, com portal de solicitações, filas, SLAs e automações.",
    rovo: "A camada de IA da Atlassian, integrada ao Jira e ao Confluence: busca, chat e agentes que criam automações e ajustam itens em linguagem natural.",
    fluig: "Plataforma da TOTVS para gestão de processos (BPM), documentos e portais, com formulários e fluxos de aprovação configuráveis.",
    totvs: "Sistema de gestão (ERP) da TOTVS que integra áreas como finanças, compras, contratos e pessoas.",
    gws: "Suíte de produtividade do Google: Gmail, Drive, Docs, Planilhas, Meet e Chat, com edição colaborativa em tempo real.",
    nblm: "Ferramenta de pesquisa do Google, antes chamada NotebookLM: responde e produz sínteses com base nas fontes carregadas, sempre citando-as.",
    bizagi: "Plataforma de modelagem e automação de processos. O Bizagi Modeler desenha fluxos no padrão BPMN.",
    claude: "Assistente de IA da Anthropic para conversa, pesquisa, análise de documentos e escrita.",
    cowork: "O modo agente do Claude no computador: executa tarefas de várias etapas com arquivos e aplicativos, sob supervisão.",
    gemini: "A plataforma de IA do Google para empresas: assistente e agentes conectados aos dados e aplicativos da organização.",
    gpt: "Assistente de IA da OpenAI para conversa, escrita, análise e pesquisa.",
    ccode: "Ferramenta de programação com IA da Anthropic: lê, escreve e executa código a partir do terminal ou do editor.",
    github: "Plataforma de hospedagem de código com controle de versão (Git), colaboração e publicação de sites.",
    web: "Linguagens de marcação: o HTML estrutura páginas da web; o Markdown formata texto de modo simples e legível."
  },
  en: {
    jira: "Atlassian's work management platform. Jira Service Management is its service desk edition, with a request portal, queues, SLAs and automations.",
    rovo: "Atlassian's AI layer, built into Jira and Confluence: search, chat and agents that create automations and adjust work items in natural language.",
    fluig: "TOTVS's platform for process management (BPM), documents and portals, with configurable forms and approval flows.",
    totvs: "TOTVS's management system (ERP), integrating areas such as finance, purchasing, contracts and people.",
    gws: "Google's productivity suite: Gmail, Drive, Docs, Sheets, Meet and Chat, with real-time collaborative editing.",
    nblm: "Google's research tool, formerly NotebookLM: it answers and summarizes from the sources you upload, always citing them.",
    bizagi: "A process modelling and automation platform. Bizagi Modeler draws flows in the BPMN standard.",
    claude: "Anthropic's AI assistant for conversation, research, document analysis and writing.",
    cowork: "Claude's agent mode on the desktop: it carries out multi-step tasks across files and apps, under supervision.",
    gemini: "Google's AI platform for businesses: an assistant and agents connected to the organization's data and apps.",
    gpt: "OpenAI's AI assistant for conversation, writing, analysis and research.",
    ccode: "Anthropic's AI coding tool: it reads, writes and runs code from the terminal or the editor.",
    github: "A code hosting platform with version control (Git), collaboration and website publishing.",
    web: "Markup languages: HTML structures web pages; Markdown formats text in a simple, readable way."
  }
};
export const TOOLS = [
  ["intake", "jira", "Jira · JSM"], ["intake", "rovo", "Rovo"],
  ["info", "fluig", "Fluig"], ["info", "totvs", "RM Totvs"], ["info", "gws", "Google Workspace"], ["info", "nblm", "Gemini Notebook"],
  ["proc", "bizagi", "Bizagi · BPMN"],
  ["ai", "claude", "Claude"], ["ai", "cowork", "Claude Cowork"], ["ai", "gemini", "Gemini Enterprise"], ["ai", "gpt", "ChatGPT"],
  ["build", "ccode", "Claude Code"], ["build", "github", "GitHub"], ["build", "web", "HTML · Markdown"]
];

export const CERTS = {
  tech: [
    { iss: "Anthropic", m: "anthropic", tools: "claude ccode cowork", y: "2026", url: "https://verify.skilljar.com/c/wa9unusx3gei", t: { pt: "Introduction to Claude Cowork · Claude 101 · Fluência em IA", en: "Introduction to Claude Cowork · Claude 101 · AI Fluency" } },
    { iss: "Atlassian", m: "atlassian", tools: "jira rovo", y: "2026", url: "https://cp.certmetrics.com/atlassian/en/public/verify/credential", t: "Credentialed in JSM Fundamentals with AI" },
    { iss: "Google", m: "google", tools: "gemini nblm gws", y: "2026", url: "https://www.skills.google/public_profiles/1e2ddac1-0683-48f5-b39d-eb84114a8077", t: { pt: "AI Boost Bites · Gemini, NotebookLM e Workspace", en: "AI Boost Bites · Gemini, NotebookLM and Workspace" } },
    { iss: "Future Law", m: "futurelaw", tools: "claude gpt", y: "2026", url: "https://future-s-school-5d1d.thinkific.com/certificates/jtlcktzuts", t: "Agentes e Assistentes de IA no Jurídico: Claude, GPT e Ecossistema" },
    { iss: "UFV", m: "ufv", tools: "bizagi", y: "2026", t: "Modelagem de processos com o Bizagi" },
    { iss: "ISC · TCU", m: "tcu", tools: "gpt", y: "2026", t: "Engenharia de Prompt para ChatGPT" },
    { iss: "Trybe", m: "trybe", tools: "ai", y: "2024", t: "IA Generativa Aplicada ao Direito" },
    { iss: "Enap", m: "enap", tools: "ai", y: "2024", t: "Trilha fluêncIA" }
  ],
  law: [
    { iss: "FGV", m: "fgv", y: "2026", t: "Demonstrações Contábeis" },
    { iss: "OAB/RS", m: "oab", y: "2024", t: "Proteção de Dados" },
    { iss: "PUCRS", m: "pucrs", y: "2024", t: "Compliance e Proteção de Dados" },
    { iss: "Enap", m: "enap", y: "2024", t: "Direito e Novas Tecnologias" },
    { iss: "FGV", m: "fgv", y: "2022", t: "Compliance" }
  ]
};
