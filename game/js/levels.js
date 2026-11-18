/* ============================================================
   LEVELS — o andar corporativo virou fase de plataforma
   Cada fase termina numa estação: a frustração de sempre.
   ============================================================ */

const TILE = 44;
const GROUND_ROW = 12;                 // linha do chão, contada de cima
const LEVEL_ROWS = 15;
const GROUND_Y = GROUND_ROW * TILE;
const LEVEL_H = LEVEL_ROWS * TILE;

/* ---------- inimigos: quem são e como se comportam ----------
   stomp: pode ser derrotado pulando em cima
   duckable: passa por baixo se você se abaixar
------------------------------------------------------------- */
/* Dificuldade EASY: velocidades baixas, perseguição curta.
   O monstrinho é para ser reconhecido e pisado, não para punir. */
const ENEMY_SPEC = {
  meeting:  { w: 46, h: 48, stomp: true,  speed: 0,    name: 'Meeting Monster' },
  ping:     { w: 28, h: 30, stomp: true,  speed: 112,  name: 'The Ping' },
  deadline: { w: 40, h: 42, stomp: true,  speed: 40,   name: 'The Deadline' },
  urgent:   { w: 32, h: 38, stomp: true,  speed: 150,  name: 'The Urgent' },
  followup: { w: 36, h: 38, stomp: true,  speed: 62,   name: 'The Follow-up', returns: 2 },
  goblin:   { w: 54, h: 46, stomp: true,  speed: 34,   name: 'Spreadsheet Goblin' },
  swarm:    { w: 20, h: 20, stomp: true,  speed: 70,   name: 'Notification Swarm' },
  scope:    { w: 34, h: 34, stomp: true,  speed: 30,   name: 'Scope Creep', grows: true },
  blob:     { w: 58, h: 52, stomp: false, speed: 24,   name: 'Bureaucracy Blob' },
  ghost:    { w: 38, h: 44, stomp: false, speed: 44,   name: 'Time Zone Ghost', phases: true },

  /* CHEFE — o Grande Chat: a conversa onde tudo foi empilhado.
     Uma lâmpada enrolada em novelos de thread. */
  hub:      { w: 96, h: 104, stomp: false, speed: 34, boss: true,
              harmless: true, threads: 6, name: 'Grande Chat' },

  /* Os novelos: é NELES que se pula. Cada um é uma thread presa
     na pelúcia, e cada cor marca uma conversa diferente. */
  thread:   { w: 34, h: 34, stomp: true, speed: 0, orbiting: true,
              name: 'Thread' }
};

/* uma cor de marca por novelo — também serve de contador visual */
const THREAD_COLORS = [
  '#3957BD', '#67C4DB', '#9A75B4', '#B8D1FF', '#466795', '#07358F'
];

/* ---------- perigos fixos do trabalho remoto ----------
   Cada perigo declara COMO se passa por ele, e a caixa é
   calculada a partir disso. Alcance do pulo: 168px de altura
   e 271px de avanço — tudo aqui cabe com folga.
   drop = distância do chão até o TOPO da caixa (pendurado)
------------------------------------------------------- */
const HAZ_BOX = {
  cables:  { h: 18,  drop: 0,   maxW: 3, pass: 'pular'   },
  lag:     { h: 56,  drop: 0,   maxW: 2, pass: 'pular'   },
  overlap: { h: 68,  drop: 0,   maxW: 2, pass: 'pular'   },
  // totem de piso: encostou, morreu. Passa por cima, pulando.
  mute:    { h: 62,  drop: 0,   maxW: 2, pass: 'pular' }
};

const HAZARD_NAME = {
  cables: 'Ninho de cabos',
  mute:   'Você está no mudo',
  lag:    'Conexão instável',
  overlap:'Reuniões sobrepostas'
};

/* ============================================================
   SEGMENTOS — blocos de 8 a 16 tiles montados em sequência.
   plats: [xTile, alturaEmTilesAcimaDoChão, larguraEmTiles]
   ents:  [tipo, xTile, alturaAcimaDoChão]
   haz:   [tipo, xTile, larguraEmTiles, alturaAcimaDoChão]
   pits:  [xTile, larguraEmTiles]
   ============================================================ */
/* Regras de projeto, para nenhum trecho ficar impossível:
   - plataforma solta: no máximo 3 tiles (132px) de altura
   - plataforma a 5 tiles só existe encostada numa de 3, como degrau
   - enxame voa a 4 tiles: passa por baixo andando, atrapalha quem pula
   - pit no máximo 3 tiles (132px), contra 271px de alcance          */
const SEGMENTS = [
  /* --- tier 0: respiro, ensina o movimento --- */
  { t: 0, w: 10, ents: [['meeting', 7, 0]], deco: ['window', 'plant'] },
  { t: 0, w: 12, ents: [['swarm', 9, 4]], items: [[5, 3], [6, 3], [7, 3]], plats: [[5, 3, 3]], deco: ['desk'] },
  { t: 0, w: 12, ents: [['ping', 8, 0]], deco: ['plant', 'cooler'] },
  { t: 0, w: 12, ents: [['deadline', 10, 0]], plats: [[4, 3, 3], [8, 5, 3]], items: [[9, 6], [10, 6]], deco: ['window', 'lounge'] },
  { t: 0, w: 12, ents: [['followup', 8, 0]], items: [[4, 0], [5, 0], [6, 0]], deco: ['totem', 'plant'] },

  /* --- tier 1: primeiros obstáculos --- */
  { t: 1, w: 13, pits: [[6, 2]], plats: [[5, 3, 4]], items: [[6, 4], [7, 4]],
    ents: [['ping', 11, 0]], deco: ['desk', 'boxes'] },
  { t: 1, w: 12, ents: [['meeting', 7, 0], ['swarm', 4, 4]], haz: [['cables', 9, 2]], deco: ['whiteboard'] },
  { t: 1, w: 14, ents: [['deadline', 9, 0]], plats: [[3, 3, 3], [8, 3, 3]], items: [[9, 4]], deco: ['clocks'] },
  { t: 1, w: 13, ents: [['swarm', 7, 4]], plats: [[6, 3, 4]], deco: ['window', 'plant'] },
  { t: 1, w: 13, haz: [['mute', 6, 2]], items: [[5, 0], [9, 0]],
    ents: [['meeting', 10, 0]], deco: ['printer', 'booth'] },
  { t: 1, w: 12, ceils: [[5, 4]], items: [[6, 0], [7, 0]],
    ents: [['swarm', 10, 4]], deco: ['shelf'] },

  /* --- tier 2: aperta --- */
  { t: 2, w: 15, pits: [[5, 3], [10, 2]], plats: [[4, 3, 3], [9, 3, 3]], ents: [['ping', 13, 0]], deco: ['window'] },
  { t: 2, w: 14, ents: [['goblin', 8, 0], ['swarm', 11, 4]], plats: [[10, 3, 3]], deco: ['shelf'] },
  { t: 2, w: 14, ents: [['blob', 8, 0]], plats: [[3, 3, 3], [7, 3, 4], [12, 3, 2]], items: [[8, 4], [9, 4]], deco: ['desk', 'plant'] },
  { t: 2, w: 15, ents: [['urgent', 12, 0], ['meeting', 5, 0]], haz: [['lag', 8, 2]], deco: ['whiteboard'] },
  { t: 2, w: 14, ents: [['followup', 9, 0]], plats: [[5, 3, 3], [10, 3, 3]], items: [[11, 4]], deco: ['clocks'] },
  { t: 2, w: 14, ceils: [[4, 5]], ents: [['ping', 11, 0], ['meeting', 2, 0]],
    items: [[5, 0], [6, 0], [7, 0]], deco: ['printer', 'server'] },
  { t: 2, w: 15, ceils: [[5, 5]], ents: [['swarm', 11, 4], ['blob', 12, 0]], deco: ['shelf', 'plant'] },

  /* --- tier 3: caos de fim de trimestre --- */
  { t: 3, w: 16, pits: [[6, 3], [11, 3]], plats: [[5, 3, 3], [10, 3, 3]], ents: [['swarm', 8, 4]], deco: ['window'] },
  { t: 3, w: 16, ents: [['scope', 7, 0], ['ping', 13, 0]], haz: [['cables', 10, 2]], plats: [[9, 3, 4]], deco: ['printer'] },
  { t: 3, w: 15, ents: [['ghost', 8, 0], ['deadline', 12, 0]], plats: [[4, 3, 3], [9, 3, 3]], items: [[10, 4], [11, 4]], deco: ['clocks', 'plant'] },
  { t: 3, w: 16, ents: [['goblin', 6, 0], ['urgent', 12, 0], ['swarm', 9, 4]], haz: [['overlap', 9, 2]], deco: ['desk'] },
  { t: 3, w: 15, ents: [['blob', 7, 0], ['followup', 12, 0]], pits: [[10, 2]], plats: [[9, 3, 4]], deco: ['window', 'shelf'] },
  { t: 3, w: 14, haz: [['mute', 5, 2], ['cables', 9, 2]], ents: [['ping', 12, 0]], deco: ['whiteboard'] }
];

/* ---------- gerador determinístico por fase ---------- */
function mkRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Monta uma fase encadeando segmentos, com dificuldade crescente.
 * `tiers` diz quais níveis de segmento essa fase pode usar.
 */
function buildLevel(def) {
  const rnd = mkRng(def.seed);
  const solids = [], hazards = [], enemies = [], items = [], deco = [], pits = [];

  let cursor = 2;                       // tiles de sobra na largura inicial

  // trecho inicial seguro
  const pick = (tier) => {
    const pool = SEGMENTS.filter(s => s.t === tier);
    return pool[Math.floor(rnd() * pool.length)];
  };

  const plan = [];
  plan.push(SEGMENTS[0]);
  for (let i = 0; i < def.segments; i++) {
    const p = i / Math.max(1, def.segments - 1);
    const maxTier = Math.min(3, def.tierBase + Math.round(p * def.tierSpan));
    const minTier = Math.max(0, maxTier - 1);
    // a maioria dos trechos vem do topo da faixa; de vez em quando alivia
    const tier = rnd() < .66 ? maxTier : minTier;
    plan.push(pick(tier));
  }
  plan.push(SEGMENTS[0]);               // respiro antes da estação

  for (const seg of plan) {
    const ox = cursor;
    // chão, descontando os buracos
    const holes = (seg.pits || []).map(([px, pw]) => [ox + px, pw]);
    let run = ox;
    const edge = ox + seg.w;
    for (const [hx, hw] of holes.sort((a, b) => a[0] - b[0])) {
      if (hx > run) solids.push({ x: run * TILE, y: GROUND_Y, w: (hx - run) * TILE, h: LEVEL_H - GROUND_Y, ground: true });
      pits.push({ x: hx * TILE, w: hw * TILE });
      run = hx + hw;
    }
    if (run < edge) solids.push({ x: run * TILE, y: GROUND_Y, w: (edge - run) * TILE, h: LEVEL_H - GROUND_Y, ground: true });

    for (const [px, py, pw] of seg.plats || [])
      solids.push({ x: (ox + px) * TILE, y: GROUND_Y - py * TILE, w: pw * TILE, h: 18, plat: true });

    // teto baixo: borda inferior a 52px do chão, a mesma linha do "mudo"
    for (const [px, pw] of seg.ceils || [])
      solids.push({ x: (ox + px) * TILE, y: GROUND_Y - 3 * TILE,
                    w: pw * TILE, h: 3 * TILE - 52, ceil: true });

    for (const [type, px, py] of seg.ents || [])
      enemies.push({ type, x: (ox + px) * TILE, y: GROUND_Y - py * TILE });

    // x,y é o canto superior esquerdo da caixa — igual para colisão e desenho
    for (const [kind, px, pw] of seg.haz || []) {
      const b = HAZ_BOX[kind] || HAZ_BOX.lag;
      hazards.push({
        kind, pass: b.pass,
        x: (ox + px) * TILE,
        y: GROUND_Y - (b.drop || b.h),
        w: Math.min(pw, b.maxW) * TILE,
        h: b.h
      });
    }

    for (const [px, py] of seg.items || [])
      items.push({ kind: 'task', x: (ox + px) * TILE + TILE / 2,
                   y: GROUND_Y - py * TILE - 18, taken: false });

    for (const d of seg.deco || [])
      deco.push({ kind: d, x: (ox + 1 + rnd() * (seg.w - 3)) * TILE, seed: (rnd() * 1e6) | 0 });

    cursor += seg.w;
  }

  /* --- núcleo de energia: obrigatório em toda fase ---
     Fica entre 52% e 62% do caminho: longe do início, mas não
     escondido. Prefere uma plataforma dessa faixa; se não houver,
     fica no chão, sempre em lugar sem buraco nem perigo.        */
  {
    const total = cursor;
    const lo = total * .52, hi = total * .64;
    const cand = solids.filter(s => s.plat &&
      s.x / TILE + s.w / TILE / 2 > lo && s.x / TILE < hi);
    let px, py;
    if (cand.length) {
      const s = cand[Math.floor(rnd() * cand.length)];
      px = s.x + s.w / 2;
      py = s.y - 58;                    // acima da plataforma: exige pulo
    } else {
      // procura um trecho de chão limpo dentro da faixa
      let tx = Math.floor((lo + hi) / 2);
      for (let k = 0; k < 40; k++) {
        const test = (tx + k) * TILE;
        const onPit = pits.some(p => test > p.x - TILE && test < p.x + p.w + TILE);
        const onHaz = hazards.some(hz => test > hz.x - TILE && test < hz.x + hz.w + TILE);
        if (!onPit && !onHaz) { tx = tx + k; break; }
      }
      px = tx * TILE + TILE / 2;
      py = GROUND_Y - 134;              // no alto: só com pulo bem dado
    }
    items.push({ kind: 'power', x: px, y: py, taken: false });
  }

  // plataforma final com a estação
  const endX = cursor;
  solids.push({ x: endX * TILE, y: GROUND_Y, w: 9 * TILE, h: LEVEL_H - GROUND_Y, ground: true });
  const width = (endX + 9) * TILE;

  return {
    ...def,
    solids, hazards, enemies, items, deco, pits,
    width,
    spawn: { x: 2.4 * TILE, y: GROUND_Y - 80 },
    goal:  { x: (endX + 4.6) * TILE, y: GROUND_Y }
  };
}

/* ============================================================
   FASE FINAL — versão de demonstração para o portfólio
   ============================================================ */
const FLOOR_BRAND = {
  5: { brand: '#9A75B4', soft: '#D5BFD7', deep: '#633758' }
};

const LEVEL_DEFS = [
  { id: 'final', n: 5, title: 'Fase final — A Central de Serviços',
    sub: 'O Grande Chat precisa de ajuda para desembaraçar as threads.',
    seed: 5505, segments: 7, tierBase: 1, tierSpan: 2, sky: 'night',
    boss: true }
];

const LEVELS = LEVEL_DEFS.map(buildLevel);

/* ---------- paletas de céu ---------- */
const SKIES = {
  morning: {
    top: '#B8D1FF', mid: '#DCE6FB', bot: '#ECEFF9', glow: 'rgba(251,245,231,.8)',
    sun: '#FBF5E7', cloud: '#F8F9F5',
    far: '#C7D5EE', mid1: '#A9BCDE', mid2: '#BECDEA', mid3: '#8FA5CC',
    win: 'rgba(251,245,231,.7)', winOff: 'rgba(248,249,245,.1)',
    haze: 'rgba(236,239,249,.92)',
    near1: '#DFE6F5', near2: '#C8D4EC', near3: '#AFC0E2', glass: '#B8D1FF',
    trunk: '#816242', leafD: '#009850', leafL: '#A3C7A1', plaza: '#DDE3F1'
  },
  day: {
    top: '#96B4E8', mid: '#C6D7F3', bot: '#ECEFF9', glow: 'rgba(248,249,245,.85)',
    sun: '#F8F9F5', cloud: '#F8F9F5',
    far: '#B4C6E5', mid1: '#8FA5CC', mid2: '#A6B9DC', mid3: '#758CB8',
    win: 'rgba(248,249,245,.62)', winOff: 'rgba(248,249,245,.1)',
    haze: 'rgba(236,239,249,.94)',
    near1: '#DCE4F3', near2: '#C2D0E9', near3: '#A7B8DC', glass: '#A9C4EF',
    trunk: '#816242', leafD: '#009850', leafL: '#A3C7A1', plaza: '#D7DEEE'
  },
  dusk: {
    top: '#466795', mid: '#A3A0B4', bot: '#FBF5E7', glow: 'rgba(242,209,165,.7)',
    sun: '#F2D1A5', cloud: '#E6DACF',
    far: '#7A8AA8', mid1: '#5E7291', mid2: '#70859F', mid3: '#4A5C7C',
    win: 'rgba(242,192,55,.75)', winOff: 'rgba(248,249,245,.08)',
    haze: 'rgba(251,245,231,.9)',
    near1: '#B9AFAC', near2: '#A3999C', near3: '#8A8189', glass: '#8FA0B8',
    trunk: '#6E6E64', leafD: '#009850', leafL: '#A3C7A1', plaza: '#CFC6BE'
  },
  night: {
    top: '#021841', mid: '#07358F', bot: '#1E4AA3', glow: 'rgba(184,209,255,.4)',
    sun: '#ECEFF9', cloud: '#123163',
    far: '#03204F', mid1: '#08316F', mid2: '#0C3E86', mid3: '#021841',
    win: 'rgba(242,192,55,.85)', winOff: 'rgba(248,249,245,.06)',
    haze: 'rgba(30,74,163,.82)',
    near1: '#0B2E6B', near2: '#103880', near3: '#061F4F', glass: '#2A4FA0',
    trunk: '#4B3800', leafD: '#00693A', leafL: '#5C8C68', plaza: '#0E2A5E'
  }
};
