/* ============================================================
   PLATFORMER — o andar corporativo, da esquerda para a direita
   ============================================================ */

const cv  = document.getElementById('game');
const ctx = cv.getContext('2d');

const overlay  = document.getElementById('overlay');
const macWin   = document.getElementById('window');
const winTitle = document.getElementById('winTitle');
const winBody  = document.getElementById('winBody');
const chipApp  = document.getElementById('chipApp');
const chipTag  = document.getElementById('chipTag');
const btnPri   = document.getElementById('btnPrimary');
const btnSec   = document.getElementById('btnSecondary');
const banner   = document.getElementById('banner');
const intro    = document.getElementById('intro');

const elLevel  = document.getElementById('hudLevel');
const elSub    = document.getElementById('hudSub');
const elCoffee = document.getElementById('hudCoffee');
const elDeaths = document.getElementById('hudDeaths');
const elDots   = document.getElementById('hudDots');
const bossBar  = document.getElementById('bossBar');
const bossFill = document.getElementById('bossFill');
const bossCount= document.getElementById('bossCount');
const powerBar = document.getElementById('powerBar');
const powerFill= document.getElementById('powerFill');
const powerTime= document.getElementById('powerTime');

/* ---------- física ----------
   Aceleração por constante de tempo: quanto maior TAU, mais macio.
   Antes era quase instantâneo, o que jogava a personagem para dentro
   dos inimigos sem chance de corrigir.                              */
const GRAV = 2250, MAX_FALL = 1250;
const RUN_MAX = 262;
const TAU_ACC = .15, TAU_DEC = .10, TAU_AIR = .28;
// alcance do pulo: 168px de altura, 205px de avanço na velocidade máxima
const JUMP_V = -870, JUMP_CUT = .45;
const DUCK_MAX = 120;
const P_W = 26, P_H = 58, P_DUCK_H = 36;
const STOMP_BOUNCE = -560;

/* caixa de dano: menor que o desenho, de propósito.
   Dá margem para passar raspando sem morrer injustamente. */
const HURT_INSET_X = 5, HURT_INSET_TOP = 9, HURT_INSET_BOT = 3;

/* tolerâncias generosas para acertar o inimigo */
const STOMP_REACH = 24;      // quanto acima do topo do inimigo ainda conta
const STOMP_DEEP  = .72;     // até que fração da altura dele ainda conta
const BONK_REACH  = 22;      // cabeçada por baixo dos voadores

/* invencibilidade */
const POWER_TIME = 10, POWER_WARN = 2;

/* ---------- estado ---------- */
const game = {
  started: false, paused: true, levelIdx: 0, level: null,
  coffee: 0, deaths: 0, wrongPortals: 0, power: 0, deathX: 0,
  boss: null, bossDown: false, bossNudge: 0,
  boss: null, bossDown: false, bossNudge: 0,
  t: 0, camX: 0, finished: false, phase: 'play'
};

const P = {
  x: 0, y: 0, vx: 0, vy: 0, face: 1,
  onGround: false, ducking: false, walk: 0,
  coyote: 0, buffer: 0, dead: 0, invuln: 0, state: 'idle'
};

let VW = 0, VH = 0, DPR = 1, scale = 1, viewW = 0;

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  VW = cv.clientWidth; VH = cv.clientHeight;
  cv.width = Math.round(VW * DPR); cv.height = Math.round(VH * DPR);
  const avail = VH - (VW < 760 ? 74 : 92);
  scale = Math.max(.5, Math.min(avail / LEVEL_H, 1.9));
  viewW = VW / scale;
}
addEventListener('resize', resize);

/* ---------- entrada ---------- */
const keys = Object.create(null);
const KEYMAP = {
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right',
  ArrowUp: 'jump', w: 'jump', W: 'jump', ' ': 'jump',
  ArrowDown: 'duck', s: 'duck', S: 'duck'
};

addEventListener('keydown', e => {
  const k = KEYMAP[e.key];
  if (k) e.preventDefault();
  if (k === 'jump' && !keys.jump) P.buffer = .13;
  if (k) keys[k] = true;
  if (e.key === 'Enter' && !overlay.classList.contains('hidden')) btnPri.click();
});
addEventListener('keyup', e => {
  const k = KEYMAP[e.key];
  if (k) keys[k] = false;
  if (k === 'jump' && P.vy < 0) P.vy *= JUMP_CUT;
});

/* botões de toque, para quem jogar no celular */
function bindTouch(id, key) {
  const el = document.getElementById(id);
  if (!el) return;
  const set = (v) => (ev) => {
    ev.preventDefault();
    if (key === 'jump' && v && !keys.jump) P.buffer = .13;
    if (key === 'jump' && !v && P.vy < 0) P.vy *= JUMP_CUT;
    keys[key] = v;
  };
  el.addEventListener('touchstart', set(true), { passive: false });
  el.addEventListener('touchend', set(false), { passive: false });
  el.addEventListener('mousedown', set(true));
  addEventListener('mouseup', set(false));
}

/* ============================================================
   CARREGAR FASE
   ============================================================ */
function loadLevel(i) {
  game.levelIdx = i;
  const L = LEVELS[i];
  game.level = L;
  game.phase = 'play';

  const roster = L.enemies.slice();
  // a pelúcia fica no chão; os novelos orbitam em volta dela
  if (L.boss) {
    roster.push({ type: 'hub', x: L.goal.x - 160, y: GROUND_Y });
    for (let i = 0; i < ENEMY_SPEC.hub.threads; i++)
      roster.push({ type: 'thread', x: L.goal.x - 160, y: GROUND_Y - 60, orbit: i });
  }

  L.ents = roster.map((e, idx) => {
    const spec = ENEMY_SPEC[e.type];
    return {
      ...e, idx, spec, dir: -1, alive: true, homeX: e.x,
      vx: 0, vy: 0, rush: 0, scale: e.type === 'scope' ? .7 : 1,
      phase: idx * 1.4, alpha: 1, squash: 0, respawn: 0, flash: 0,
      hp: spec.hp || 1, boss: !!spec.boss,
      returns: spec.returns || 0, returned: false
    };
  });
  game.boss = L.ents.find(e => e.boss) || null;
  game.threads = L.ents.filter(e => e.type === 'thread');
  // cada novelo guarda sua cor e a referência da pelúcia que ele prende
  game.threads.forEach((e, i) => { e.color = THREAD_COLORS[i % THREAD_COLORS.length]; e.hub = game.boss; });
  game.bossDown = false;
  game.bossNudge = 0;
  bossBar.classList.remove('on');
  updateBossBar();
  L.items.forEach(it => { it.taken = false; });

  parts.length = 0;
  floaters.length = 0;
  game.power = 0;
  powerBar.classList.remove('on', 'ending');
  respawn();
  game.camX = 0;
  camLead = 0;

  // a identidade do andar troca aqui: piso, LED, HUD e aviso de fase
  const fc = FLOOR_BRAND[L.n] || FLOOR_BRAND[1];
  setFloorColors({ brand: fc.brand, soft: fc.soft, deep: fc.deep });
  document.documentElement.style.setProperty('--floor', fc.brand);
  document.documentElement.style.setProperty('--floor-soft', fc.soft);
  document.documentElement.style.setProperty('--floor-deep', fc.deep);

  elLevel.textContent = L.title;
  elSub.textContent = L.sub;
  elDots.innerHTML = LEVELS.map((_, k) =>
    `<i class="${k < i ? 'done' : k === i ? 'now' : ''}"></i>`).join('');
  showBanner('Fase final', L.title.split('— ')[1] || L.title);
}

/* Procura chão firme perto de onde ela caiu: sem buraco, sem perigo
   e sem inimigo em cima. Volta andando para trás, nunca para frente. */
function safeSpot(x) {
  const L = game.level;
  for (let step = 0; step <= 60; step++) {
    const tx = Math.max(L.spawn.x, x - step * 26);
    const probe = { x: tx - P_W / 2, y: GROUND_Y - P_H, w: P_W, h: P_H };
    const onPit = L.pits.some(p => tx > p.x - 24 && tx < p.x + p.w + 24);
    const onHaz = L.hazards.some(hz => hit(probe, hz));
    const onFoe = L.ents.some(e => e.alive &&
      Math.abs((e.x + e.spec.w / 2) - tx) < e.spec.w / 2 + 40);
    const hasGround = L.solids.some(s => s.ground &&
      tx > s.x + 10 && tx < s.x + s.w - 10);
    const underCeil = !!solidAtRect(probe, false);   // não nascer dentro do armário
    if (!onPit && !onHaz && !onFoe && !underCeil && hasGround) return tx;
    if (tx <= L.spawn.x) break;
  }
  return L.spawn.x;
}

function respawn(atDeath) {
  const L = game.level;
  // morreu? volta para perto de onde caiu, não para o começo do andar
  P.x = atDeath ? safeSpot(game.deathX) : L.spawn.x;
  P.y = atDeath ? GROUND_Y - 40 : L.spawn.y;
  P.vx = P.vy = 0; P.face = 1; P.dead = 0; P.invuln = 1.6;
  P.ducking = false; P.state = 'idle';
  game.power = 0;
  powerBar.classList.remove('on', 'ending');
  // o núcleo volta: perder o poder por um tropeço seria punição dupla
  L.items.forEach(it => { if (it.kind === 'power') it.taken = false; });
  // inimigos voltam ao lugar
  for (const e of L.ents) {
    e.x = e.homeX; e.alive = true; e.squash = 0; e.rush = 0;
    e.respawn = 0; e.returned = false;
    e.returns = e.spec.returns || 0;
    e.scale = e.type === 'scope' ? .7 : 1;
    e.dir = -1; e.charging = false;
  }
}

/* ============================================================
   COLISÃO
   ============================================================ */
// caixa física: usada contra chão, plataformas e armários
const box = () => ({
  x: P.x - P_W / 2, y: P.y - (P.ducking ? P_DUCK_H : P_H),
  w: P_W, h: P.ducking ? P_DUCK_H : P_H
});

// caixa de dano: encolhida, para encostões de raspão não matarem
const hurtBox = () => {
  const h = P.ducking ? P_DUCK_H : P_H;
  return {
    x: P.x - P_W / 2 + HURT_INSET_X,
    y: P.y - h + HURT_INSET_TOP,
    w: P_W - HURT_INSET_X * 2,
    h: h - HURT_INSET_TOP - HURT_INSET_BOT
  };
};

const hit = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function solidAtRect(r, includePlat) {
  for (const s of game.level.solids) {
    if (s.plat && !includePlat) continue;
    if (hit(r, s)) return s;
  }
  return null;
}

function moveAndCollide(dt) {
  const L = game.level;
  const h = P.ducking ? P_DUCK_H : P_H;

  // --- eixo X ---
  P.x += P.vx * dt;
  let r = box();
  for (const s of L.solids) {
    if (s.plat) continue;
    if (!hit(r, s)) continue;
    if (P.vx > 0) P.x = s.x - P_W / 2 - .01;
    else if (P.vx < 0) P.x = s.x + s.w + P_W / 2 + .01;
    P.vx = 0;
    r = box();
  }
  P.x = Math.max(P_W / 2, Math.min(L.width - P_W / 2, P.x));

  // --- eixo Y ---
  const prevBottom = P.y;
  P.y += P.vy * dt;
  P.onGround = false;
  r = box();
  for (const s of L.solids) {
    if (!hit(r, s)) continue;
    if (s.plat) {
      // plataforma de mão única: só apoia quando vem de cima
      if (P.vy < 0 || prevBottom > s.y + 6) continue;
      P.y = s.y; P.vy = 0; P.onGround = true;
    } else if (P.vy > 0) {
      P.y = s.y; P.vy = 0; P.onGround = true;
    } else if (P.vy < 0) {
      P.y = s.y + s.h + h; P.vy = 0;
    }
    r = box();
  }

  // buraco: caiu do andar
  if (P.y > LEVEL_H + 120) kill();
}

/* ============================================================
   ATUALIZAÇÃO
   ============================================================ */
function update(dt) {
  const L = game.level;
  game.t += dt;

  if (P.dead > 0) {
    P.dead -= dt;
    P.vy = Math.min(MAX_FALL, P.vy + GRAV * dt * .6);
    P.y += P.vy * dt;
    if (P.dead <= 0) respawn(true);
    updateCamera(dt);
    return;
  }

  if (P.invuln > 0) P.invuln -= dt;

  /* --- invencibilidade --- */
  if (game.power > 0) {
    const was = game.power;
    game.power = Math.max(0, game.power - dt);
    powerBar.classList.add('on');
    powerBar.classList.toggle('ending', game.power <= POWER_WARN);
    powerFill.style.width = `${(game.power / POWER_TIME) * 100}%`;
    powerTime.textContent = `${game.power.toFixed(1)}s`;
    // rastro de energia enquanto corre
    if (Math.abs(P.vx) > 40 && Math.random() < .5)
      parts.push({ x: P.x - P.face * 8, y: P.y - 26 + (Math.random() - .5) * 28,
                   vx: -P.face * 40, vy: -20 - Math.random() * 40, life: 1,
                   decay: 2.4, r: 2.4, color: Math.random() < .5 ? T.amber : T.purple300,
                   kind: 'dot', spin: 0, rot: 0 });
    if (was > 0 && game.power === 0) { SFX.powerEnd(); powerBar.classList.remove('on', 'ending'); }
  }

  /* --- agachar --- */
  const wantDuck = keys.duck && P.onGround;
  if (!wantDuck && P.ducking) {
    // só levanta se houver espaço — e se levantar não for suicídio
    const test = { x: P.x - P_W / 2, y: P.y - P_H, w: P_W, h: P_H };
    const roof = solidAtRect(test, false);
    const sign = L.hazards.some(hz => hit(test, hz));
    if (!roof && !sign) P.ducking = false;
  } else if (wantDuck) P.ducking = true;

  /* --- correr: aceleração e frenagem macias --- */
  const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  const maxV = P.ducking ? DUCK_MAX : RUN_MAX;
  const tau = !P.onGround ? TAU_AIR : (dir ? TAU_ACC : TAU_DEC);
  const target = dir * maxV;
  P.vx += (target - P.vx) * (1 - Math.exp(-dt / tau));
  if (dir) P.face = dir;
  if (!dir && Math.abs(P.vx) < 6) P.vx = 0;
  if (Math.abs(P.vx) > maxV) P.vx += (Math.sign(P.vx) * maxV - P.vx) * .3;

  /* --- pular --- */
  P.coyote = P.onGround ? .1 : Math.max(0, P.coyote - dt);
  P.buffer = Math.max(0, P.buffer - dt);
  if (P.buffer > 0 && P.coyote > 0 && !P.ducking) {
    P.vy = JUMP_V; P.onGround = false; P.coyote = 0; P.buffer = 0;
    SFX.jump();
  }

  P.vy = Math.min(MAX_FALL, P.vy + GRAV * dt);
  moveAndCollide(dt);

  /* --- animação --- */
  if (!P.onGround) P.state = P.vy < 0 ? 'jump' : 'fall';
  else if (P.ducking) P.state = 'duck';
  else if (Math.abs(P.vx) > 20) { P.state = 'run'; P.walk += dt * (6 + Math.abs(P.vx) * .026); }
  else P.state = 'idle';

  updateEnemies(dt);
  updateItems();
  updateHazards();
  updateCamera(dt);

  // chegou na estação? só depois de desembaraçar o Grande Chat
  if (P.x > L.goal.x - 26 && game.phase === 'play') {
    if (L.boss && !game.bossDown) {
      if (!game.bossNudge || game.t - game.bossNudge > 3) {
        game.bossNudge = game.t;
        flashBanner('O Grande Chat está soterrado de threads', 'pule nos novelos para ajudar a desembaraçar');
      }
      P.x = L.goal.x - 30;
      P.vx = Math.min(P.vx, 0);
    } else {
      game.phase = 'done';
      reachStation();
    }
  }
}

/* Câmera: olha um pouco à frente na direção em que ela corre,
   com zona morta para não tremer a cada passo. */
let camLead = 0;
function updateCamera(dt) {
  const L = game.level;
  const want = P.face * Math.min(1, Math.abs(P.vx) / RUN_MAX) * viewW * .09;
  camLead += (want - camLead) * Math.min(1, dt * 2.2);

  const target = P.x + camLead - viewW * .40;
  const max = Math.max(0, L.width - viewW);
  const clamped = Math.max(0, Math.min(max, target));
  const d = clamped - game.camX;
  if (Math.abs(d) > 2) game.camX += d * Math.min(1, dt * 4.6);
}

/* ---------- inimigos ---------- */
function groundUnder(x, y) {
  const probe = { x: x - 4, y: y + 2, w: 8, h: 10 };
  return !!solidAtRect(probe, true);
}

function updateEnemies(dt) {
  const L = game.level;
  const pb = box();

  for (const e of L.ents) {
    // o achatado some em ~0,4s, vivo ou não
    if (e.squash > 0) e.squash = Math.max(0, e.squash - dt * 2.6);

    if (!e.alive) {
      if (e.respawn > 0) {
        e.respawn -= dt;
        if (e.respawn <= 0) { e.alive = true; e.x = e.homeX; e.returned = true; e.squash = 0; }
      }
      continue;
    }

    const spec = e.spec;
    let sp = spec.speed;
    const dxp = P.x - (e.x + spec.w / 2);

    switch (e.type) {
      case 'meeting': sp = 0; break;
      case 'ping':
        if (Math.abs(dxp) < 430) e.dir = Math.sign(dxp) || 1; else sp = 0;
        break;
      case 'deadline':
        e.rush = Math.min(1, e.rush + dt * .12);
        sp *= 1 + e.rush * 3.4;
        break;
      case 'urgent':
        if (!e.charging && Math.abs(dxp) < 470) { e.charging = true; e.dir = Math.sign(dxp) || 1; SFX.urgent(); }
        sp = e.charging ? sp : 0;
        break;
      case 'scope': {
        const prog = Math.max(0, Math.min(1, (P.x - 200) / Math.max(1, L.width - 400)));
        e.scale = .7 + prog * 1.05;
        break;
      }
      case 'ghost': {
        const ph = (Math.sin(game.t * .9 + e.phase) + 1) / 2;
        e.alpha = ph;
        e.dir = Math.sign(dxp) || 1;
        sp *= .6 + ph * .8;
        break;
      }
      case 'swarm':
        e.dir = Math.sign(dxp) || -1;
        break;

      case 'hub': {
        // anda devagarinho de um lado para o outro, sem perseguir ninguém
        const arenaL = L.goal.x - 470, arenaR = L.goal.x - 70;
        if (e.x < arenaL) { e.x = arenaL; e.dir = 1; }
        if (e.x > arenaR) { e.x = arenaR; e.dir = -1; }
        if (e.flash > 0) e.flash -= dt;
        if (!game.bossDown && P.x > arenaL - 120) bossBar.classList.add('on');
        break;
      }

      case 'thread': {
        /* Os novelos giram em volta da pelúcia, numa elipse baixa
           o bastante para caber num pulo. É neles que se pisa. */
        sp = 0;
        const hub = e.hub;
        if (!hub) break;
        const live = game.threads.filter(x => x.alive).length || 1;
        const idx = game.threads.indexOf(e);
        const ang = game.t * .55 + (idx / Math.max(1, game.threads.length)) * Math.PI * 2;
        const hx = hub.x + hub.spec.w / 2;
        // alto o bastante para ela passar por baixo em pé,
        // e baixo o bastante para caber num pulo
        const hy = GROUND_Y - 86;
        e.x = hx + Math.cos(ang) * 76 - spec.w / 2;
        e.y = hy + Math.sin(ang) * 26 + spec.h / 2;
        e.spin = ang;
        break;
      }
    }

    if (sp) {
      const nx = e.x + e.dir * sp * dt;
      if (e.type === 'swarm') {
        e.x = nx;                                   // voa, ignora o chão
      } else {
        const aheadSolid = solidAtRect(
          { x: nx + (e.dir > 0 ? spec.w - 4 : 0), y: e.y - spec.h + 6, w: 4, h: spec.h - 10 }, false);
        const edge = !groundUnder(nx + (e.dir > 0 ? spec.w : 0), e.y);
        if (aheadSolid || (edge && !e.charging)) e.dir *= -1;
        else e.x = nx;
      }
    }

    // colisão com a personagem
    const fly = e.type === 'swarm';
    const eb = fly
      ? { x: e.x, y: e.y - spec.h + Math.sin(game.t * 9 + e.phase) * 3 - 6, w: spec.w, h: spec.h }
      : { x: e.x, y: e.y - spec.h * (e.scale || 1), w: spec.w * (e.scale || 1), h: spec.h * (e.scale || 1) };

    if (e.type === 'ghost' && e.alpha < .35) continue;     // sumiu: não machuca
    if (spec.harmless) continue;                           // a pelúcia nunca machuca

    // sobreposição horizontal generosa: não exige acertar o centro
    const overX = Math.min(pb.x + pb.w, eb.x + eb.w) - Math.max(pb.x, eb.x);
    if (overX <= -10) continue;

    const feet = pb.y + pb.h, head = pb.y;
    const eTop = eb.y, eBot = eb.y + eb.h;

    // pisar: caindo e com os pés perto do topo dele
    const stomping = P.vy > 20 && feet > eTop - STOMP_REACH && feet < eTop + eb.h * STOMP_DEEP;
    // cabeçada por baixo: só vale para quem voa
    const bonking = fly && P.vy < -20 && head < eBot + BONK_REACH && head > eTop;

    const touching = hit(pb, eb);
    if (!touching && !(stomping && overX > 0) && !(bonking && overX > 0)) continue;

    if (game.power > 0) {                                  // invencível: derruba tudo
      defeatEnemy(e, spec, 'power');
      continue;
    }

    if ((stomping || bonking) && spec.stomp) {
      defeatEnemy(e, spec, bonking ? 'bonk' : 'stomp');
      P.vy = bonking ? 90 : STOMP_BOUNCE;
      P.buffer = 0;
    } else if (P.invuln <= 0 && hit(hurtBox(), eb)) {
      kill();                              // só a caixa encolhida machuca
    }
  }
}

function defeatEnemy(e, spec, how) {
  /* Novelo solto: a thread saiu da pelúcia e virou registro. */
  if (e.type === 'thread') {
    e.alive = false;
    e.squash = 1;
    const bx = e.x + spec.w / 2, by = e.y - spec.h / 2;
    burst(bx, by, e.color || T.blue300, 12, 220, 'square');
    burst(bx, by, T.white, 6, 150, 'dot');
    if (e.hub) e.hub.flash = .45;                 // a pelúcia dá um pulinho feliz
    const left = game.threads.filter(x => x.alive).length;
    floatText(bx, by - 26, left ? '+1 thread organizada' : 'tudo desembaraçado ✓', 'win');
    updateBossBar();
    SFX.stomp();

    if (!left && !game.bossDown) {
      game.bossDown = true;
      bossBar.classList.remove('on');
      const h = game.boss;
      const hx = h.x + h.spec.w / 2, hy = h.y - h.spec.h * .5;
      for (let k = 0; k < 4; k++)
        setTimeout(() => burst(hx + (Math.random() - .5) * 90, hy + (Math.random() - .5) * 70,
                               k % 2 ? T.amber : T.capri, 14, 280, 'square'), k * 130);
      SFX.win();
      setTimeout(bossDefeated, 1200);
    }
    return;
  }

  e.alive = false;
  e.squash = 1;
  if (e.returns > 0) { e.returns--; e.respawn = 2.6; }
  const ex = e.x + spec.w / 2, ey = e.y - spec.h * .5;
  floatText(ex, e.y - spec.h - 8, e.returns > 0 ? 'volta já' : 'resolvido ✓', 'win');
  burst(ex, ey, how === 'power' ? T.amber : T.purple300, 9, 190, 'square');
  burst(ex, ey, T.blue300, 6, 140, 'dot');
  parts.push({ x: ex, y: ey, vx: 0, vy: 0, life: 1, decay: 2.6,
               r: 11, color: how === 'power' ? T.amber : T.purple500,
               kind: 'ring', spin: 0, rot: 0 });
  SFX.stomp();
}

/* ---------- recompensas visuais: etiquetas e partículas ---------- */
const floaters = [];
function floatText(x, y, txt, tone) { floaters.push({ x, y, txt, tone, life: 1 }); }

const parts = [];
function burst(x, y, color, n = 10, spread = 170, kind = 'dot') {
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n + Math.random() * .5;
    const v = spread * (.45 + Math.random() * .75);
    parts.push({
      x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60,
      life: 1, decay: .9 + Math.random() * .8,
      r: 2 + Math.random() * 3, color, kind,
      spin: (Math.random() - .5) * 8, rot: Math.random() * 6
    });
  }
}

function updateParticles(dt) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.life -= dt * p.decay;
    if (p.life <= 0) { parts.splice(i, 1); continue; }
    p.vy += 520 * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.vx *= 1 - dt * 1.6;
    p.rot += p.spin * dt;
  }
}

function drawParticles(ctx) {
  for (const p of parts) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    if (p.kind === 'square') {
      const s = p.r * 1.6 * p.life;
      rr(ctx, -s / 2, -s / 2, s, s, 1.4); ctx.fill();
    } else if (p.kind === 'ring') {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.arc(0, 0, p.r * (2.4 - p.life * 1.4), 0, 7); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.arc(0, 0, p.r * p.life, 0, 7); ctx.fill();
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function updateItems() {
  const pb = box();
  for (const it of game.level.items) {
    if (it.taken) continue;
    const near = Math.abs(it.x - P.x) < (it.kind === 'power' ? 36 : 30) &&
                 Math.abs(it.y - (pb.y + pb.h / 2)) < (it.kind === 'power' ? 54 : 46);
    if (!near) continue;

    if (it.kind === 'power') {              // núcleo de energia: 10s invencível
      it.taken = true;
      game.power = POWER_TIME;
      SFX.power();
      floatText(it.x, it.y - 16, 'MODO FOCO', 'win');
      burst(it.x, it.y, T.amber, 16, 250, 'square');
      burst(it.x, it.y, T.purple300, 10, 190, 'dot');
      parts.push({ x: it.x, y: it.y, vx: 0, vy: 0, life: 1, decay: 1.5,
                   r: 14, color: T.amber, kind: 'ring', spin: 0, rot: 0 });
      continue;
    }

    {
      it.taken = true;
      game.coffee++;
      elCoffee.textContent = game.coffee;
      SFX.coffee();
      floatText(it.x, it.y - 12, '+1 task completed', 'win');
      burst(it.x, it.y, T.mint, 9, 150, 'dot');
      burst(it.x, it.y, T.blue300, 5, 110, 'square');
      parts.push({ x: it.x, y: it.y, vx: 0, vy: 0, life: 1, decay: 2.2,
                   r: 9, color: T.mint, kind: 'ring', spin: 0, rot: 0 });
    }
  }
}

function updateHazards() {
  if (P.invuln > 0 || P.dead > 0 || game.power > 0) return;
  const pb = hurtBox();
  for (const hz of game.level.hazards) {
    if (hit(pb, hz)) { kill(); return; }   // x,y já é o canto superior esquerdo
  }
}

function kill() {
  if (P.dead > 0) return;
  game.deathX = P.x;              // volta para cá, não para o início
  P.dead = .85;
  P.vy = -430;
  P.state = 'hurt';
  game.deaths++;
  elDeaths.textContent = game.deaths;
  burst(P.x, P.y - 28, T.coral, 10, 190, 'square');
  SFX.hurt();
}

/* ============================================================
   DESENHO
   ============================================================ */
function render() {
  const L = game.level, t = game.t;
  LABELS.length = 0;

  /* Resolução cheia, com suavização: a arte é vetorial e detalhada. */
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, VW, VH);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  // estado de texto limpo: os textos do cenário contam com o padrão
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(0, (VH / scale - LEVEL_H) * .82);

  // planos de fundo, cada um com seu próprio ritmo de parallax
  drawSky(ctx, L.sky, game.camX, viewW, t);
  drawMidground(ctx, L.sky, game.camX, viewW, t);
  drawGlassWall(ctx, game.camX, viewW, t);

  ctx.save();
  ctx.translate(-game.camX, 0);

  for (const d of L.deco)
    if (d.x > game.camX - 200 && d.x < game.camX + viewW + 200) drawDeco(ctx, d, t);

  /* Véu sobre o cenário: o mobiliário é decoração, não gameplay.
     Recuar meio passo aqui é o que faz item e inimigo saltarem. */
  veil(ctx, game.camX - 40, 0, viewW + 80, GROUND_Y, SKIES[L.sky].bot, .2);

  drawGround(ctx, L, game.camX, viewW);
  for (const s of L.solids) {
    if (s.plat) drawPlatform(ctx, s, game.camX, viewW, t);
    else if (s.ceil) drawCeiling(ctx, s, game.camX, viewW);
  }

  drawGoal(ctx, L.goal, t, L.n === 5 ? 'Central de Serviços' : 'Estação');

  for (const hz of L.hazards)
    if (hz.x < game.camX + viewW + 100 && hz.x + hz.w > game.camX - 100) drawHazard(ctx, hz, t);

  for (const it of L.items)
    if (!it.taken && it.x > game.camX - 60 && it.x < game.camX + viewW + 60) drawItem(ctx, it, t);

  for (const e of L.ents) {
    if (!e.alive && e.squash <= 0) continue;
    if (e.x < game.camX - 150 || e.x > game.camX + viewW + 150) continue;
    drawEnemy(ctx, e, t);
  }

  drawHero(ctx, P.x, P.y, P.face, P.state, P.walk, t, game.power);

  drawParticles(ctx);
  ctx.restore();

  drawForeground(ctx, game.camX, viewW, t);

  // vinheta discreta
  const vg = ctx.createLinearGradient(0, 0, 0, LEVEL_H);
  vg.addColorStop(0, 'rgba(26,33,64,.16)');
  vg.addColorStop(.22, 'rgba(26,33,64,0)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, viewW, LEVEL_H);

  /* --- texto por cima de tudo, com contorno para destacar do fundo --- */
  const s = ctx;
  s.save();
  s.translate(-game.camX, 0);
  for (const l of LABELS) {
    if (l.x < game.camX - 160 || l.x > game.camX + viewW + 160) continue;

    // estado do texto reafirmado a cada etiqueta, nunca herdado
    s.font = `700 ${l.size}px -apple-system, "Segoe UI", sans-serif`;
    s.textAlign = l.align;
    s.textBaseline = 'middle';

    if (l.plate) {
      // chapa dimensionada pelo texto medido com a MESMA fonte
      const tw = s.measureText(l.txt).width;
      const padX = 12, padY = 7;
      const w = Math.ceil(tw) + padX * 2;
      const h = Math.ceil(l.size * 1.35) + padY * 2;
      const bx = l.align === 'left' ? l.x - padX
               : l.align === 'right' ? l.x - w + padX
               : l.x - w / 2;
      const by = l.y - h / 2;
      s.fillStyle = 'rgba(2,24,65,.16)';
      rr(s, bx + 1.5, by + 2, w, h, h / 2); s.fill();
      s.fillStyle = 'rgba(248,249,245,.97)';
      rr(s, bx, by, w, h, h / 2); s.fill();
      s.strokeStyle = l.color; s.lineWidth = 1.4;
      s.globalAlpha = .45; rr(s, bx, by, w, h, h / 2); s.stroke();
      s.globalAlpha = 1;
    }

    s.fillStyle = l.color;
    s.fillText(l.txt, l.x, l.y);
  }
  /* As etiquetas acima deixaram textAlign/textBaseline em outro estado.
     Reafirmar aqui é o que mantém o texto dentro da pílula. */
  s.textAlign = 'center';
  s.textBaseline = 'middle';
  s.font = '700 12px -apple-system, "Segoe UI", sans-serif';
  for (const f of floaters) {
    const a = Math.max(0, Math.min(1, f.life * 1.4));
    const rise = (1 - f.life) * 40;
    const cy = f.y - rise;                 // centro da pílula e do texto
    const w = s.measureText(f.txt).width + 20;
    const h = 22;
    s.globalAlpha = a;
    s.fillStyle = 'rgba(2,24,65,.18)';
    rr(s, f.x - w / 2 + 1, cy - h / 2 + 2, w, h, h / 2); s.fill();
    s.fillStyle = f.tone === 'win' ? T.mint : T.blue500;
    rr(s, f.x - w / 2, cy - h / 2, w, h, h / 2); s.fill();
    s.fillStyle = '#fff';
    s.fillText(f.txt, f.x, cy);
    s.globalAlpha = 1;
  }
  s.restore();
  s.restore();
}

/* ============================================================
   FIM DE FASE E NARRATIVA
   ============================================================ */
function showBanner(title, sub) {
  banner.innerHTML = `<b>${title}</b><span>${sub}</span>`;
  banner.classList.add('show');
  setTimeout(() => banner.classList.remove('show'), 2600);
}

/* aviso curto de gameplay, menor que o de abertura de fase */
function flashBanner(title, sub) {
  banner.innerHTML = `<b class="small">${title}</b><span>${sub}</span>`;
  banner.classList.add('show');
  setTimeout(() => banner.classList.remove('show'), 2400);
}

function updateBossBar() {
  if (!game.boss || !game.threads) return;
  const total = game.threads.length;
  const left = game.threads.filter(e => e.alive).length;
  bossFill.style.width = `${(left / Math.max(1, total)) * 100}%`;
  bossCount.textContent = `${left} / ${total}`;
}

/* Threads desembaraçadas: o Grande Chat respira e libera o caminho. */
function bossDefeated() {
  game.phase = 'play';
  macWin.classList.remove('wide', 'tip');
  winTitle.textContent = 'Grande Chat';
  chipApp.textContent = 'Fila em dia';
  chipTag.textContent = 'threads organizadas';
  winBody.innerHTML = `
    <div class="ai-head">
      <div class="ai-orb">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#fff"
             stroke-width="1.7" stroke-linecap="round">
          <path d="M4 15a8 8 0 1 1 16 0"/><path d="M9 20h6M10 17h4"/>
        </svg>
      </div>
      <div>
        <div class="ai-name">Obrigado! Agora dá para respirar.</div>
        <div class="ai-tag">6 threads desembaraçadas &middot; fila em dia</div>
      </div>
    </div>
    <div class="ai-msg">
      <p style="margin:0 0 10px">O chat é <strong>ótimo para conversar</strong>:
      é ali que o contexto aparece e a dúvida destrava. O que ele não consegue
      sozinho é guardar prazo, dono e histórico.</p>
      <p style="margin:0">Com as threads organizadas, a solicitação pode seguir
      para o <strong>canal oficial</strong>. Siga até a Central de Serviços.</p>
    </div>`;
  setButtons('Seguir para a Central de Serviços →', closeModal, null, null);
  openModal();
}

function setButtons(pri, priFn, sec, secFn) {
  btnPri.textContent = pri; btnPri.onclick = priFn; btnPri.classList.remove('hidden');
  if (sec) { btnSec.textContent = sec; btnSec.onclick = secFn; btnSec.classList.remove('hidden'); }
  else btnSec.classList.add('hidden');
}

function openModal() {
  game.paused = true;
  overlay.classList.remove('hidden');
  winBody.scrollTop = 0;
  SFX.open();
}
function closeModal() {
  overlay.classList.add('hidden');
  game.paused = false;
  SFX.close();
}

function reachStation() { winGame(); }

function winGame() {
  game.finished = true;
  SFX.win();
  macWin.classList.remove('wide');
  winTitle.textContent = 'Central de Serviços';
  chipApp.textContent = 'Solicitação registrada';
  chipTag.textContent = 'com dono e prazo';
  winBody.innerHTML = `
    <div class="win-wrap">
      <div class="win-badge">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#fff"
             stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 12.5l5.2 5.2L20 7"/>
        </svg>
      </div>
      <div class="win-title">Missão cumprida</div>
      <div class="win-sub">
        A solicitação saiu do chat e entrou no canal oficial,<br>com dono, prazo e histórico.
      </div>
      <div class="win-stats">
        <div class="stat"><div class="stat-n">${game.deaths}</div><div class="stat-l">recomeços</div></div>
        <div class="stat"><div class="stat-n">${game.coffee}</div><div class="stat-l">tarefas</div></div>
        <div class="stat"><div class="stat-n">6</div><div class="stat-l">threads</div></div>
      </div>
      <div class="win-moral">
        <strong>Moral da história:</strong> a demanda vai chegar por chat, por e-mail,
        no corredor e no meio de uma call, e tudo bem. O combinado é um só:
        <strong>venha de onde vier, ela entra pelo canal oficial.</strong> É lá que ganha
        dono, prazo e histórico, e é de lá que a IA consegue ajudar.
      </div>
    </div>`;
  setButtons('Jogar de novo', () => location.reload(), null, null);
  openModal();
}

/* ============================================================
   LOOP
   ============================================================ */
let last = 0;
function loop(ms) {
  const t = ms / 1000;
  let dt = last ? t - last : 0;
  last = t;
  dt = Math.min(dt, 1 / 30);

  if (game.started && !game.paused) update(dt);

  updateParticles(dt);
  for (let i = floaters.length - 1; i >= 0; i--) {
    floaters[i].life -= dt * 1.05;
    if (floaters[i].life <= 0) floaters.splice(i, 1);
  }

  if (game.level) render();
  requestAnimationFrame(loop);
}

/* ============================================================
   BOOT
   ============================================================ */
resize();
loadLevel(0);
requestAnimationFrame(loop);

['padLeft:left', 'padRight:right', 'padJump:jump', 'padDuck:duck']
  .forEach(s => { const [id, k] = s.split(':'); bindTouch(id, k); });

document.addEventListener('click', (e) => {
  if (e.target.closest('.btn, .sound-btn')) { SFX.init(); SFX.click(); }
}, true);

const soundBtn = document.getElementById('soundBtn');
soundBtn.addEventListener('click', () => {
  const off = !SFX.isMuted();
  SFX.setMuted(off);
  soundBtn.classList.toggle('off', off);
});

document.getElementById('btnStart').addEventListener('click', () => {
  SFX.init();
  SFX.musicStart();                 // trilha começa no primeiro gesto do usuário
  intro.classList.add('gone');
  setTimeout(() => { intro.style.display = 'none'; }, 620);
  game.started = true;
  game.paused = false;
  showBanner('Fase final', LEVELS[0].title.split('— ')[1] || LEVELS[0].title);
});
