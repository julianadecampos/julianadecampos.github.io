/* ============================================================
   SPRITES 2D — mundo em quatro planos de profundidade
     .04 céu e nuvens   .07 skyline distante   .14 skyline médio
     .30 praça e fachadas   .46 vidro do andar   1.0 jogo
     1.18 primeiro plano
   ============================================================ */

function rr(ctx, x, y, w, h, r) {
  const k = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + k, y);
  ctx.arcTo(x + w, y, x + w, y + h, k);
  ctx.arcTo(x + w, y + h, x, y + h, k);
  ctx.arcTo(x, y + h, x, y, k);
  ctx.arcTo(x, y, x + w, y, k);
  ctx.closePath();
}

function h2(x, y, s = 0) {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const SKY_TOP = GROUND_Y - 470;        // linha do horizonte urbano

/* ============================================================
   PLANO 1 — céu, nuvens e duas camadas de skyline
   ============================================================ */
function drawSky(ctx, sky, camX, VW, t) {
  const S = SKIES[sky] || SKIES.day;

  const g = ctx.createLinearGradient(0, 0, 0, GROUND_Y + 30);
  g.addColorStop(0, S.top);
  g.addColorStop(.55, S.mid);
  g.addColorStop(1, S.bot);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VW, GROUND_Y + 30);

  // halo de sol / lua
  const sx = VW * .74 - camX * .03;
  const sg = ctx.createRadialGradient(sx, 118, 10, sx, 118, 190);
  sg.addColorStop(0, S.glow);
  sg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.arc(sx, 118, 190, 0, 7); ctx.fill();
  ctx.fillStyle = S.sun;
  ctx.beginPath(); ctx.arc(sx, 118, 34, 0, 7); ctx.fill();

  /* --- nuvens: andam sozinhas, além do parallax --- */
  for (let i = 0; i < 7; i++) {
    const a = h2(i, 1, 21), b = h2(i, 2, 21), c = h2(i, 3, 21);
    const drift = t * (5 + a * 7);
    const cw = 120 + b * 170;
    let x = ((i * 430 + drift - camX * .04) % (VW + 900)) - 380;
    const y = 58 + c * 190;
    ctx.fillStyle = S.cloud;
    ctx.globalAlpha = .5 + b * .35;
    ctx.beginPath();
    ctx.ellipse(x, y, cw * .42, 22 + a * 14, 0, 0, 7);
    ctx.ellipse(x - cw * .22, y + 7, cw * .27, 16 + b * 9, 0, 0, 7);
    ctx.ellipse(x + cw * .26, y + 6, cw * .3, 18 + c * 10, 0, 0, 7);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  /* --- skyline distante: perspectiva atmosférica, contraste baixo --- */
  const far = -camX * .07;
  const farG = ctx.createLinearGradient(0, SKY_TOP - 200, 0, SKY_TOP + 300);
  farG.addColorStop(0, S.far);
  farG.addColorStop(1, S.haze);
  for (let i = -2; i < 34; i++) {
    const a = h2(i, 5, 31), b = h2(i, 6, 31);
    const bw = 44 + a * 42;
    const bx = i * 96 + far;
    if (bx > VW + 120 || bx < -140) continue;
    const bh = 150 + b * 260;
    const by = SKY_TOP + 120 - bh;
    ctx.fillStyle = farG;
    ctx.fillRect(bx, by, bw, bh + 340);
    // face iluminada, quase imperceptível: só o suficiente para dar volume
    ctx.fillStyle = 'rgba(255,255,255,.07)';
    ctx.fillRect(bx, by, bw * .32, bh + 340);
    if (a > .72) {
      ctx.fillStyle = farG;
      ctx.fillRect(bx + bw * .48, by - 26 - a * 20, 2.4, 26 + a * 20);
      ctx.fillStyle = 'rgba(255,120,120,.4)';         // luz de obstáculo aéreo
      ctx.fillRect(bx + bw * .48 - .8, by - 27 - a * 20, 4, 3);
    }
    if (a > .4) {
      ctx.fillStyle = farG;
      ctx.fillRect(bx + bw * .16, by - 14, bw * .68, 14);
    }
  }

  /* --- skyline médio: blocos corporativos com janelas acesas --- */
  const mid = -camX * .14;
  for (let i = -2; i < 26; i++) {
    const a = h2(i, 7, 41), b = h2(i, 8, 41), c = h2(i, 9, 41);
    const bw = 92 + a * 88;
    const bx = i * 178 + mid;
    if (bx > VW + 170 || bx < -210) continue;
    const bh = 190 + b * 280;
    const by = SKY_TOP + 180 - bh;

    // corpo com queda de luz vertical
    const bg = ctx.createLinearGradient(0, by, 0, SKY_TOP + 320);
    bg.addColorStop(0, S.mid2);
    bg.addColorStop(.45, S.mid1);
    bg.addColorStop(1, S.mid3);
    ctx.fillStyle = bg;
    ctx.fillRect(bx, by, bw, bh + 320);
    // face iluminada à esquerda, com degradê próprio
    const fg = ctx.createLinearGradient(bx, 0, bx + bw * .34, 0);
    fg.addColorStop(0, 'rgba(255,255,255,.16)');
    fg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = fg;
    ctx.fillRect(bx, by, bw * .34, bh + 320);
    ctx.fillStyle = S.mid3;                           // coroamento
    ctx.fillRect(bx - 3, by, bw + 6, 9);
    ctx.fillStyle = 'rgba(255,255,255,.14)';
    ctx.fillRect(bx - 3, by, bw + 6, 2);

    // caixa d'água / casa de máquinas
    if (c > .55) {
      ctx.fillRect(bx + bw * .3, by - 20, bw * .34, 20);
      ctx.fillRect(bx + bw * .62, by - 12, 3, 12);
    }

    /* Janelas: textura do prédio, não pontos de interesse.
       Sem brilho somado, menos acesas, contraste baixo. */
    const lit = sky === 'night' ? .3 : sky === 'dusk' ? .14 : .05;
    ctx.save();
    ctx.globalAlpha = .55;
    for (let wy = by + 26; wy < SKY_TOP + 300; wy += 30)
      for (let wx = bx + 12; wx < bx + bw - 16; wx += 24) {
        const on = h2(wx | 0, wy | 0, 3) < lit;
        ctx.fillStyle = on ? S.win : S.winOff;
        ctx.fillRect(wx, wy, 10, 15);
      }
    ctx.restore();
    // faixa horizontal de laje: dá ritmo sem pontilhar
    ctx.fillStyle = 'rgba(255,255,255,.05)';
    for (let wy = by + 26; wy < SKY_TOP + 300; wy += 30)
      ctx.fillRect(bx, wy + 17, bw, 2);
  }

  // névoa que cola as camadas
  const hz = ctx.createLinearGradient(0, SKY_TOP + 30, 0, SKY_TOP + 300);
  hz.addColorStop(0, 'rgba(255,255,255,0)');
  hz.addColorStop(1, S.haze);
  ctx.fillStyle = hz;
  ctx.fillRect(0, SKY_TOP + 30, VW, 300);

  /* Véu atmosférico global: joga a cidade inteira para trás.
     É isto que impede o fundo de competir com o gameplay. */
  veil(ctx, 0, 0, VW, GROUND_Y + 30, S.bot, .3);
}

/* ============================================================
   PLANO 2 — praça: fachadas baixas, árvores, totens, painéis
   ============================================================ */
function drawMidground(ctx, sky, camX, VW, t) {
  const S = SKIES[sky] || SKIES.day;
  const off = -camX * .30;
  const BASE = GROUND_Y - 104;                 // linha da calçada ao fundo

  for (let i = -1; i < 16; i++) {
    const seed = i * 13;
    const a = h2(i, 11, 53), b = h2(i, 12, 53), c = h2(i, 13, 53);
    const x = i * 336 + off;
    if (x > VW + 340 || x < -360) continue;

    /* --- fachada corporativa baixa --- */
    const fw = 150 + a * 60, fh = 120 + b * 70;
    ctx.fillStyle = S.near1;
    ctx.fillRect(x, BASE - fh, fw, fh);
    ctx.fillStyle = S.near2;
    ctx.fillRect(x, BASE - fh, fw, 12);
    // vitrine de vidro
    ctx.fillStyle = S.glass;
    for (let gy = 0; gy < 2; gy++)
      for (let gx = 0; gx < 4; gx++)
        ctx.fillRect(x + 12 + gx * (fw - 28) / 4, BASE - fh + 26 + gy * 40,
                     (fw - 34) / 4, 30);
    // marquise
    ctx.fillStyle = S.near3;
    ctx.fillRect(x + 8, BASE - 34, fw - 16, 7);
    // marca abstrata na fachada
    ctx.globalAlpha = .55;
    appIcon(ctx, ['drive', 'chat', 'cal', 'sheet'][i % 4], x + fw * .5, BASE - fh - 18, 12, t);
    ctx.globalAlpha = 1;

    /* --- árvore --- */
    const tx = x + fw + 40 + c * 30;
    const sway = Math.sin(t * .7 + i) * 2.5;
    ctx.fillStyle = S.trunk;
    ctx.fillRect(tx - 4, BASE - 54, 8, 54);
    ctx.fillStyle = S.leafD;
    ctx.beginPath(); ctx.arc(tx - 16 + sway, BASE - 66, 22, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(tx + 16 + sway, BASE - 62, 19, 0, 7); ctx.fill();
    ctx.fillStyle = S.leafL;
    ctx.beginPath(); ctx.arc(tx + sway, BASE - 82, 26, 0, 7); ctx.fill();

    /* --- canteiro --- */
    ctx.fillStyle = S.near3;
    rr(ctx, tx - 34, BASE - 12, 68, 12, 3); ctx.fill();

    /* --- totem de sinalização: placa parada, sem piscar --- */
    if (b > .5) {
      const sx2 = x + fw + 96;
      ctx.fillStyle = S.near2;
      ctx.fillRect(sx2 - 3, BASE - 72, 6, 72);
      ctx.fillStyle = S.near3;
      rr(ctx, sx2 - 22, BASE - 116, 44, 48, 5); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.34)';
      ctx.fillRect(sx2 - 14, BASE - 104, 28, 4);
      ctx.fillRect(sx2 - 14, BASE - 94, 20, 4);
      ctx.fillRect(sx2 - 14, BASE - 84, 24, 4);
    }
  }

  // calçada do fundo
  ctx.fillStyle = S.plaza;
  ctx.fillRect(0, BASE, VW, GROUND_Y - BASE);
  ctx.fillStyle = 'rgba(255,255,255,.2)';
  ctx.fillRect(0, BASE, VW, 3);

  // segundo véu: a praça fica um degrau à frente da cidade, mas atrás do jogo
  veil(ctx, 0, 0, VW, GROUND_Y, S.bot, .16);
}

/* ============================================================
   PLANO 3 — o vidro do andar, entre a cidade e o jogo
   ============================================================ */
function drawGlassWall(ctx, camX, VW, t) {
  const off = -camX * .46;
  const TOP = 26, BOT = GROUND_Y - 4;

  // reflexo diagonal no vidro
  const gl = ctx.createLinearGradient(0, TOP, VW * .7, BOT);
  gl.addColorStop(0, 'rgba(255,255,255,.2)');
  gl.addColorStop(.45, 'rgba(255,255,255,.02)');
  gl.addColorStop(1, 'rgba(154,171,247,.1)');
  ctx.fillStyle = gl;
  ctx.fillRect(0, TOP, VW, BOT - TOP);

  // laje e forro
  ctx.fillStyle = T.off;
  ctx.fillRect(0, 0, VW, TOP);
  ctx.fillStyle = T.grey200;
  ctx.fillRect(0, TOP - 4, VW, 4);

  // luminárias pendentes
  for (let i = -1; i < 26; i++) {
    const x = i * 230 + (off % 230);
    if (x < -60 || x > VW + 60) continue;
    ctx.strokeStyle = T.grey300; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, TOP); ctx.lineTo(x, TOP + 34); ctx.stroke();
    ctx.fillStyle = T.white;
    rr(ctx, x - 26, TOP + 34, 52, 9, 4); ctx.fill();
    const lg = ctx.createLinearGradient(0, TOP + 43, 0, TOP + 190);
    lg.addColorStop(0, 'rgba(255,253,240,.16)');
    lg.addColorStop(1, 'rgba(255,253,240,0)');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.moveTo(x - 24, TOP + 43); ctx.lineTo(x + 24, TOP + 43);
    ctx.lineTo(x + 62, TOP + 190); ctx.lineTo(x - 62, TOP + 190);
    ctx.closePath(); ctx.fill();
  }

  // caixilhos
  ctx.strokeStyle = T.white; ctx.lineWidth = 8;
  for (let i = -1; i < 40; i++) {
    const x = i * 188 + (off % 188);
    if (x < -20 || x > VW + 20) continue;
    ctx.beginPath(); ctx.moveTo(x, TOP); ctx.lineTo(x, BOT); ctx.stroke();
  }
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(252,253,255,.7)';
  ctx.beginPath(); ctx.moveTo(0, TOP + 132); ctx.lineTo(VW, TOP + 132); ctx.stroke();

  // peitoril
  ctx.fillStyle = T.off;
  ctx.fillRect(0, BOT, VW, 12);
  ctx.fillStyle = T.blue300;
  ctx.fillRect(0, BOT, VW, 2.5);
  ctx.fillStyle = 'rgba(26,33,64,.1)';
  ctx.fillRect(0, BOT + 12, VW, 3);
}

/* ============================================================
   PLANO 5 — primeiro plano, à frente da personagem
   ============================================================ */
function drawForeground(ctx, camX, VW, t) {
  const off = -camX * 1.18;
  ctx.save();
  ctx.globalAlpha = .82;
  for (let i = -1; i < 14; i++) {
    const a = h2(i, 17, 71), b = h2(i, 18, 71);
    const x = i * 620 + (off % 620) + 620;
    if (x < -220 || x > VW + 220) continue;

    if (a < .4) {
      // jiboia em silhueta entrando pela borda de baixo
      ctx.fillStyle = '#1e5340';
      for (let k = 0; k < 7; k++) {
        const ang = -Math.PI / 2 + (k - 3) * .3 + Math.sin(t * .55 + k) * .045;
        const L = 46 + h2(i, k, 9) * 30;
        ctx.save();
        ctx.translate(x, LEVEL_H + 20);
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.moveTo(0, -L - 14);
        ctx.bezierCurveTo(-13, -L - 4, -14, -L + 12, -6, -L + 16);
        ctx.bezierCurveTo(-2, -L + 18, -1, -L + 13, 0, -L + 11);
        ctx.bezierCurveTo(1, -L + 13, 2, -L + 18, 6, -L + 16);
        ctx.bezierCurveTo(14, -L + 12, 13, -L - 4, 0, -L - 14);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#1e5340'; ctx.lineWidth = 2.6;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -L + 12); ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = T.ink;
      rr(ctx, x - 28, LEVEL_H - 20, 56, 38, 6); ctx.fill();
    } else if (a < .72) {
      // canto de mesa com cabos pendurados
      ctx.fillStyle = T.ink;
      rr(ctx, x - 90, LEVEL_H - 34, 180, 44, 6); ctx.fill();
      ctx.strokeStyle = T.ink; ctx.lineWidth = 5; ctx.lineCap = 'round';
      for (let k = 0; k < 3; k++) {
        const cx2 = x - 40 + k * 40;
        ctx.beginPath();
        ctx.moveTo(cx2, LEVEL_H - 34);
        ctx.quadraticCurveTo(cx2 + 10, LEVEL_H - 8 + Math.sin(t + k) * 3, cx2 - 6, LEVEL_H + 8);
        ctx.stroke();
      }
    } else {
      // divisória acústica
      ctx.fillStyle = T.blue900;
      rr(ctx, x - 26, LEVEL_H - 120 - b * 60, 52, 200, 8); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.07)';
      for (let k = 0; k < 8; k++)
        ctx.fillRect(x - 18, LEVEL_H - 112 - b * 60 + k * 16, 36, 6);
    }
  }
  ctx.restore();
}

/* ============================================================
   CHÃO — carpete do andar
   ============================================================ */
/* Piso elevado corporativo, montado em três faixas:
   SUPERFÍCIE (onde ela anda) · BORDA FRONTAL (profundidade) ·
   ESTRUTURA (painéis abaixo). É isso que tira a cara de "linha". */
const SURF_H = 10;          // espessura do tampo visto de topo
const EDGE_H = 26;          // altura da borda frontal

function drawGround(ctx, level, camX, VW) {
  for (const s of level.solids) {
    if (!s.ground) continue;
    if (s.x + s.w < camX - 80 || s.x > camX + VW + 80) continue;

    const top = s.y, edge = s.y + SURF_H, low = s.y + SURF_H + EDGE_H;

    /* --- estrutura inferior: painéis de concreto, bem discretos --- */
    const lg = ctx.createLinearGradient(0, low, 0, s.y + s.h);
    lg.addColorStop(0, '#b9c0d2');
    lg.addColorStop(1, '#8d95ad');
    ctx.fillStyle = lg;
    ctx.fillRect(s.x, low, s.w, s.h - SURF_H - EDGE_H);

    ctx.strokeStyle = 'rgba(26,33,64,.1)';
    ctx.lineWidth = 1.2;
    const p0 = Math.floor(s.x / 88) * 88;
    for (let x = p0; x < s.x + s.w + 88; x += 88) {
      ctx.beginPath();
      ctx.moveTo(x, low + 6); ctx.lineTo(x, s.y + s.h);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,.14)';
    ctx.fillRect(s.x, low, s.w, 1.5);

    /* --- borda frontal: a face que dá volume --- */
    const eg = ctx.createLinearGradient(0, edge, 0, low);
    eg.addColorStop(0, '#dfe4f0');
    eg.addColorStop(.55, '#ccd3e4');
    eg.addColorStop(1, '#aab2c9');
    ctx.fillStyle = eg;
    ctx.fillRect(s.x, edge, s.w, EDGE_H);

    // LED embutido na sanca da borda
    ctx.fillStyle = FLOOR.soft;
    ctx.fillRect(s.x, edge + 3, s.w, 1.8);
    ctx.fillStyle = 'rgba(26,33,64,.1)';
    ctx.fillRect(s.x, low - 2, s.w, 2);

    // juntas verticais da borda, alinhadas com os painéis
    ctx.strokeStyle = 'rgba(26,33,64,.09)';
    ctx.lineWidth = 1;
    for (let x = p0; x < s.x + s.w + 88; x += 88) {
      ctx.beginPath();
      ctx.moveTo(x, edge + 6); ctx.lineTo(x, low - 3);
      ctx.stroke();
    }

    /* --- superfície: o tampo, mais claro que tudo abaixo --- */
    const sg = ctx.createLinearGradient(0, top, 0, edge);
    sg.addColorStop(0, T.white);
    sg.addColorStop(1, '#e3e8f3');
    ctx.fillStyle = sg;
    ctx.fillRect(s.x, top, s.w, SURF_H);

    // fio de acabamento na quina de cima: define onde ela pisa
    ctx.fillStyle = FLOOR.brand;
    ctx.fillRect(s.x, top, s.w, 2.4);
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.fillRect(s.x, top + 2.4, s.w, 1.2);

    // frisos do piso, em perspectiva leve
    ctx.save();
    ctx.beginPath(); ctx.rect(s.x, top + 4, s.w, SURF_H - 4); ctx.clip();
    ctx.strokeStyle = 'rgba(89,97,125,.13)';
    ctx.lineWidth = 1;
    for (let x = p0; x < s.x + s.w + 88; x += 44) {
      ctx.beginPath();
      ctx.moveTo(x, top + 4); ctx.lineTo(x - 5, edge);
      ctx.stroke();
    }
    ctx.restore();

    /* --- oclusão ambiente: a sombra que o piso projeta em si mesmo --- */
    const ao = ctx.createLinearGradient(0, top + SURF_H, 0, top + SURF_H + 14);
    ao.addColorStop(0, 'rgba(26,33,64,.16)');
    ao.addColorStop(1, 'rgba(26,33,64,0)');
    ctx.fillStyle = ao;
    ctx.fillRect(s.x, top + SURF_H, s.w, 14);
  }
}

/* Plataforma: laje suspensa de piso elevado.
   Mesma linguagem do chão — tampo, borda frontal, estrutura —
   porém com contraste um pouco maior, porque é gameplay. */
function drawPlatform(ctx, s, camX, VW, t) {
  if (s.x + s.w < camX - 90 || s.x > camX + VW + 90) return;

  const H = 19;                      // espessura visual da laje
  const top = s.y, bot = s.y + H;

  // sombra projetada no chão, deslocada pela luz global
  shadowUnder(ctx, s.x + s.w / 2, GROUND_Y + 4, s.w * .44, 8, .13);

  // hastes de sustentação, finas e discretas
  const legs = Math.max(2, Math.round(s.w / 110));
  for (let i = 0; i < legs; i++) {
    const lx = s.x + 18 + i * ((s.w - 36) / Math.max(1, legs - 1));
    const lh = Math.min(64, GROUND_Y - bot);
    const gl = ctx.createLinearGradient(lx - 3, 0, lx + 3, 0);
    gl.addColorStop(0, '#c3c9da');
    gl.addColorStop(.4, '#9aa2ba');
    gl.addColorStop(1, '#7d85a0');
    ctx.fillStyle = gl;
    ctx.fillRect(lx - 3, bot, 6, lh);
  }

  // borda frontal
  const eg = ctx.createLinearGradient(0, top + 7, 0, bot);
  eg.addColorStop(0, '#dde2ef');
  eg.addColorStop(1, '#aeb6cc');
  ctx.fillStyle = eg;
  rr(ctx, s.x, top + 7, s.w, H - 7, 3); ctx.fill();

  // LED embutido sob o tampo
  ctx.fillStyle = FLOOR.soft;
  ctx.fillRect(s.x + 2, top + 8.5, s.w - 4, 1.6);

  // tampo
  const sg = ctx.createLinearGradient(0, top, 0, top + 8);
  sg.addColorStop(0, T.white);
  sg.addColorStop(1, '#e8ecf6');
  ctx.fillStyle = sg;
  rr(ctx, s.x, top, s.w, 8, 3); ctx.fill();
  ctx.fillStyle = FLOOR.brand;
  ctx.fillRect(s.x, top, s.w, 2.2);

  // contorno: é superfície pisável, precisa de leitura imediata
  rr(ctx, s.x, top, s.w, H, 3);
  outline(ctx, 1.6, .2);

  // oclusão sob a laje
  const ao = ctx.createLinearGradient(0, bot, 0, bot + 12);
  ao.addColorStop(0, 'rgba(26,33,64,.14)');
  ao.addColorStop(1, 'rgba(26,33,64,0)');
  ctx.fillStyle = ao;
  ctx.fillRect(s.x, bot, s.w, 12);

  // um único objeto sobre a laje, e só em parte delas
  const pick = h2(s.x | 0, s.y | 0, 3);
  const mx = s.x + s.w * .5;
  if (pick > .68) {
    ctx.fillStyle = T.ink;
    rr(ctx, mx - 16, top - 25, 32, 22, 3); ctx.fill();
    screen(ctx, mx - 13.5, top - 22.5, 27, 17, t || 0, T.blue500);
    ctx.fillStyle = T.grey500;
    ctx.fillRect(mx - 4, top - 3, 8, 3);
  } else if (pick > .44) {
    ctx.fillStyle = T.grey300;
    rr(ctx, mx - 17, top - 4, 34, 4, 2); ctx.fill();
    ctx.save();
    ctx.translate(mx - 15, top - 4); ctx.rotate(-.34);
    ctx.fillStyle = T.ink; rr(ctx, 0, -22, 30, 22, 2); ctx.fill();
    screen(ctx, 2, -20, 26, 18, t || 0, T.purple600);
    ctx.restore();
  }
}

/* teto baixo: armário aéreo */
function drawCeiling(ctx, s, camX, VW) {
  if (s.x + s.w < camX - 90 || s.x > camX + VW + 90) return;

  const g = ctx.createLinearGradient(0, s.y, 0, s.y + s.h);
  g.addColorStop(0, T.white);
  g.addColorStop(1, T.off2);
  ctx.fillStyle = g;
  rr(ctx, s.x, s.y, s.w, s.h, 4); ctx.fill();

  ctx.fillStyle = FLOOR.brand;
  ctx.fillRect(s.x, s.y + s.h - 7, s.w, 7);
  ctx.fillStyle = FLOOR.soft;
  ctx.fillRect(s.x, s.y + s.h - 9, s.w, 2);

  ctx.strokeStyle = 'rgba(26,33,64,.14)'; ctx.lineWidth = 1.3;
  for (let x = s.x + 46; x < s.x + s.w - 10; x += 46) {
    ctx.beginPath(); ctx.moveTo(x, s.y + 7); ctx.lineTo(x, s.y + s.h - 11); ctx.stroke();
  }
  ctx.fillStyle = T.grey500;
  for (let x = s.x + 23; x < s.x + s.w - 10; x += 46)
    ctx.fillRect(x - 8, s.y + s.h - 21, 16, 3.4);

  /* Sinalização sem texto: três chevrons apontando para baixo,
     na cor de alerta. Lê-se "passe por baixo" sem palavra nenhuma. */
  const cx = s.x + s.w / 2, cy = s.y + s.h + 16;
  ctx.strokeStyle = T.amberDark;
  ctx.lineWidth = 3.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 0; i < 3; i++) {
    ctx.globalAlpha = .3 + .3 * (1 + Math.sin(performance.now() / 320 - i * .9));
    ctx.beginPath();
    ctx.moveTo(cx - 9, cy + i * 8);
    ctx.lineTo(cx, cy + 6 + i * 8);
    ctx.lineTo(cx + 9, cy + i * 8);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = 'rgba(26,33,64,.07)';
  ctx.fillRect(s.x + 6, GROUND_Y - 3, s.w - 12, 3);
}
