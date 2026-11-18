/* ============================================================
   THEME — identidade visual única do jogo.
   Tudo (personagem, monstrinhos, cenário, UI) puxa cor daqui,
   para nada destoar. Azul + roxo + office white.
   ============================================================ */

/* ============================================================
   PALETA DO JOGO.
   Regra da marca: o AZUL PRINCIPAL predomina; as vibrantes entram
   só em destaque; as neutras sustentam fundo e respiro.
   ============================================================ */
const T = {
  /* --- azuis: o coração da identidade --- */
  ink:      '#021841',   // Azul Profundo
  blue900:  '#07358F',   // Noite
  blue700:  '#2A46A6',   // tom de ligação Noite→AZUL PRINCIPAL
  blue500:  '#3957BD',   // AZUL PRINCIPAL — a cor principal
  blue400:  '#5D79D0',   // tinta clara do AZUL PRINCIPAL
  blue300:  '#B8D1FF',   // Lírio
  blue100:  '#ECEFF9',   // AZUL PRINCIPAL Claro
  topazio:  '#466795',   // Topázio — azul dessaturado, ótimo para fundo
  capri:    '#67C4DB',   // Capri

  /* --- violetas: apoio --- */
  purple800:'#633758',   // Ameixa
  purple600:'#7E5C9C',   // Violeta escurecida
  purple500:'#9A75B4',   // Violeta
  purple300:'#D5BFD7',   // Lavanda
  purple100:'#EDE4EE',

  /* --- neutras da marca --- */
  white:    '#F8F9F5',   // branco
  cream:    '#FBF5E7',   // Creme
  off:      '#F1F2EC',
  off2:     '#E4E6DE',
  grey200:  '#D8DBD0',
  grey300:  '#C5C9BA',   // Cinza Quente
  grey500:  '#9A9E90',
  grey600:  '#82867A',
  grey700:  '#6E6E64',   // Concreto

  /* --- vibrantes: só em destaque --- */
  amber:    '#F2C037',   // Manteiga
  amberDark:'#B08D29',   // Ocre
  mint:     '#009850',   // Floresta
  mintDark: '#242825',   // Musgo
  coral:    '#EA4E58',   // Blush
  coralDark:'#9D264F',   // Cereja
  lime:     '#D1CF29',   // Lima

  /* --- pastéis, para vegetação e superfícies suaves --- */
  leaf:     '#A3C7A1',   // Primavera
  leafDark: '#009850',   // Floresta
  sand:     '#D5A497',   // Areia
  wheat:    '#F2D1A5',   // Trigo
  peanut:   '#C9A371',   // Amendoim
  petrol:   '#46777A',   // Petróleo

  /* --- medidas constantes --- */
  radius: 8,
  outline: 'rgba(2,24,65,.2)'
};

/* Cor do andar em curso. O render inteiro lê daqui, então a
   identidade do piso muda junto com a fase, sem tocar em nada. */
let FLOOR = { brand: T.blue500, soft: T.blue300, deep: T.blue900 };
function setFloorColors(c) { FLOOR = c; }

/* ============================================================
   LEGENDAS — texto que o jogador PRECISA ler não passa pelo
   buffer de pixels: é desenhado depois, em resolução cheia.
   ============================================================ */
const LABELS = [];

/* texto solto, para quando já existe uma superfície por baixo */
function label(x, y, txt, color, size, align) {
  LABELS.push({ x, y, txt, color: color || T.ink, size: size || 11,
                align: align || 'center', plate: false });
}

/* etiqueta com chapa própria: é assim que um aviso de gameplay
   se lê sobre qualquer fundo, sem depender da sorte do cenário */
function badge(x, y, txt, color, size) {
  LABELS.push({ x, y, txt, color: color || T.ink, size: size || 11,
                align: 'center', plate: true });
}

/* ============================================================
   LUZ GLOBAL — uma única direção para o jogo inteiro.
   A luz natural entra pelas janelas, acima e à direita.
   Toda sombra cai para a esquerda e para baixo.
   ============================================================ */
const LIGHT = { x: -0.34, y: 1, tilt: 10 };

/* sombra de contato: tudo que toca o chão usa esta */
function shadowUnder(ctx, x, y, rx, ry, a = .16) {
  const ox = x + LIGHT.x * rx * .42;
  const g = ctx.createRadialGradient(ox, y, 1, ox, y, rx);
  g.addColorStop(0, `rgba(26,33,64,${a})`);
  g.addColorStop(.58, `rgba(26,33,64,${a * .48})`);
  g.addColorStop(1, 'rgba(26,33,64,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(ox, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
}

/* ============================================================
   HIERARQUIA DE CONTRASTE
   fundo baixo · cenário médio-baixo · interativo alto
   ============================================================ */

/* véu atmosférico: empurra uma faixa inteira para trás */
function veil(ctx, x, y, w, h, color, amount) {
  ctx.save();
  ctx.globalAlpha = amount;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/* contorno que marca "isto é interativo".
   Fino, escuro e presente — não é brilho, é definição. */
function outline(ctx, w = 2, alpha = .34) {
  ctx.strokeStyle = `rgba(26,33,64,${alpha})`;
  ctx.lineWidth = w;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

/* painel branco com borda fina — a base de quase todo objeto */
function panel(ctx, x, y, w, h, r, fill, stroke) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, fill || T.white);
  g.addColorStop(1, shadeC(fill || T.white, -.05));
  ctx.fillStyle = g;
  rr(ctx, x, y, w, h, r === undefined ? T.radius : r);
  ctx.fill();
  if (stroke !== false) {
    ctx.strokeStyle = stroke || T.outline;
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }
}

/* tela acesa: usada em monitores, celulares, painéis */
function screen(ctx, x, y, w, h, t, hue) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, hue || T.blue500);
  g.addColorStop(1, hue ? shadeC(hue, -.12) : T.blue700);
  ctx.fillStyle = g;
  rr(ctx, x, y, w, h, 3); ctx.fill();
  // linhas de conteúdo
  ctx.fillStyle = 'rgba(255,255,255,.62)';
  const rows = Math.max(1, Math.floor(h / 6));
  for (let i = 0; i < rows; i++) {
    const wd = w * (.35 + ((i * 7 + (x | 0)) % 5) * .12);
    ctx.fillRect(x + 3, y + 4 + i * 6, Math.min(wd, w - 6), 1.8);
  }
  // brilho piscando de leve
  ctx.fillStyle = `rgba(255,255,255,${.06 + Math.sin(t * 1.7 + x * .05) * .05})`;
  rr(ctx, x, y, w, h, 3); ctx.fill();
}

function shadeC(col, amt) {
  let r, g, b;
  if (col[0] === '#') {
    const n = parseInt(col.slice(1), 16);
    r = n >> 16 & 255; g = n >> 8 & 255; b = n & 255;
  } else {
    const m = col.match(/[\d.]+/g) || [128, 128, 128];
    r = +m[0]; g = +m[1]; b = +m[2];
  }
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + 255 * amt)));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}

/* ============================================================
   ÍCONES DE APP — formas genéricas que evocam as ferramentas
   do dia a dia, sem reproduzir marca nenhuma.
   ============================================================ */
const APP_ICONS = {
  chat(ctx, s, t) {                         // balão de conversa
    ctx.fillStyle = T.blue500;
    rr(ctx, -s, -s * .8, s * 2, s * 1.4, s * .4); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-s * .4, s * .55); ctx.lineTo(-s * .1, s * 1.1);
    ctx.lineTo(s * .25, s * .55); ctx.closePath(); ctx.fill();
    ctx.fillStyle = T.white;
    for (let i = 0; i < 3; i++)
      { ctx.beginPath(); ctx.arc(-s * .5 + i * s * .5, -s * .1, s * .14, 0, 7); ctx.fill(); }
  },
  meet(ctx, s, t) {                         // câmera de vídeo
    ctx.fillStyle = T.mint;
    rr(ctx, -s, -s * .62, s * 1.5, s * 1.24, s * .26); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * .55, -s * .1); ctx.lineTo(s, -s * .55);
    ctx.lineTo(s, s * .55); ctx.lineTo(s * .55, s * .1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    ctx.beginPath(); ctx.arc(-s * .3, -s * .18, s * .16, 0, 7); ctx.fill();
  },
  mail(ctx, s, t) {                         // envelope
    ctx.fillStyle = T.white;
    rr(ctx, -s, -s * .66, s * 2, s * 1.32, s * .18); ctx.fill();
    ctx.strokeStyle = T.coral; ctx.lineWidth = Math.max(1, s * .16);
    ctx.beginPath();
    ctx.moveTo(-s * .88, -s * .5); ctx.lineTo(0, s * .18); ctx.lineTo(s * .88, -s * .5);
    ctx.stroke();
    ctx.strokeStyle = T.outline; ctx.lineWidth = 1;
    rr(ctx, -s, -s * .66, s * 2, s * 1.32, s * .18); ctx.stroke();
  },
  doc(ctx, s, t) {                          // documento
    ctx.fillStyle = T.white;
    rr(ctx, -s * .7, -s, s * 1.4, s * 2, s * .18); ctx.fill();
    ctx.strokeStyle = T.outline; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = T.blue400;
    for (let i = 0; i < 4; i++)
      ctx.fillRect(-s * .45, -s * .6 + i * s * .38, s * (.9 - i * .12), s * .13);
  },
  sheet(ctx, s, t) {                        // planilha
    ctx.fillStyle = T.white;
    rr(ctx, -s * .78, -s * .9, s * 1.56, s * 1.8, s * .16); ctx.fill();
    ctx.strokeStyle = T.leafDark; ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(-s * .78 + i * s * .52, -s * .9);
      ctx.lineTo(-s * .78 + i * s * .52, s * .9); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s * .78, -s * .9 + i * s * .6);
      ctx.lineTo(s * .78, -s * .9 + i * s * .6); ctx.stroke();
    }
    ctx.fillStyle = T.leaf;
    ctx.fillRect(-s * .78, -s * .9, s * .52, s * .6);
  },
  drive(ctx, s, t) {                        // nuvem
    ctx.fillStyle = T.blue300;
    ctx.beginPath();
    ctx.arc(-s * .42, s * .1, s * .5, 0, 7);
    ctx.arc(0, -s * .22, s * .62, 0, 7);
    ctx.arc(s * .5, s * .08, s * .46, 0, 7);
    ctx.rect(-s * .42, s * .1, s * .92, s * .42);
    ctx.fill();
  },
  ticket(ctx, s, t) {                       // cartão de tarefa
    ctx.fillStyle = T.purple500;
    rr(ctx, -s * .9, -s * .62, s * 1.8, s * 1.24, s * .2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.fillRect(-s * .6, -s * .28, s * 1.1, s * .16);
    ctx.fillRect(-s * .6, s * .04, s * .7, s * .16);
  },
  cal(ctx, s, t) {                          // calendário
    ctx.fillStyle = T.white;
    rr(ctx, -s * .8, -s * .74, s * 1.6, s * 1.5, s * .18); ctx.fill();
    ctx.fillStyle = T.coral;
    rr(ctx, -s * .8, -s * .74, s * 1.6, s * .42, s * .18); ctx.fill();
    ctx.fillRect(-s * .8, -s * .48, s * 1.6, s * .16);
    ctx.fillStyle = T.grey300;
    for (let i = 0; i < 6; i++)
      ctx.fillRect(-s * .6 + (i % 3) * s * .44, -s * .16 + Math.floor(i / 3) * s * .42,
                   s * .3, s * .26);
  },
  check(ctx, s, t) {                        // tarefa concluída
    ctx.fillStyle = T.mint;
    ctx.beginPath(); ctx.arc(0, 0, s, 0, 7); ctx.fill();
    ctx.strokeStyle = T.white;
    ctx.lineWidth = Math.max(1.6, s * .28);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-s * .42, 0); ctx.lineTo(-s * .1, s * .34); ctx.lineTo(s * .46, -s * .34);
    ctx.stroke();
  }
};

function appIcon(ctx, kind, x, y, s, t) {
  ctx.save();
  ctx.translate(x, y);
  (APP_ICONS[kind] || APP_ICONS.doc)(ctx, s, t || 0);
  ctx.restore();
}
