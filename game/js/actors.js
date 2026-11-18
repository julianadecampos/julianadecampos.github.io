/* ============================================================
   ACTORS — protagonista, inimigos, itens, perigos e a estação
   ============================================================ */

/* Profissional de uma empresa global de tecnologia:
   bomber azul da marca, detalhes roxos, calça off-white, tênis,
   crachá no cordão e headset no pescoço. */
const HER2 = {
  hair:   '#3d2418', hairMid: '#57311c', hairHi: '#8a5230',
  skin:   '#e8b48d', skinSh:  '#c9945f', skinHi: '#f3cbab',
  coat:   '#3f57d8', coatSh:  '#2c3ea6', coatHi: '#6e82ef',
  trim:   '#8b5cf0', trim2:   '#c2a8f9',
  shirt:  '#fcfdff',
  pants:  '#e9ecf6', pantsSh: '#ccd2e6',
  shoe:   '#fcfdff', shoeSole:'#8b5cf0', shoeDk: '#2a3357',
  strap:  '#2a3357', badge:   '#dfe5fc',
  gear:   '#1f2745'
};

/**
 * Protagonista em vista lateral. Pés em (0,0), virada para +x.
 * state: idle | run | jump | fall | duck | hurt
 */
/* power: segundos restantes de invencibilidade (0 = normal) */
function drawHero(ctx, x, y, face, state, walk, t, power) {
  // aura de invencibilidade, atrás da personagem
  if (power > 0) {
    const ending = power <= 2;
    const blink = ending ? (Math.sin(t * 22) > -.2) : true;
    if (blink) {
      const pulse = .5 + Math.sin(t * 7) * .5;
      const g = ctx.createRadialGradient(x, y - 30, 4, x, y - 30, 46);
      g.addColorStop(0, `rgba(242,169,59,${.26 + pulse * .14})`);
      g.addColorStop(.6, `rgba(139,92,240,${.16 + pulse * .1})`);
      g.addColorStop(1, 'rgba(139,92,240,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(x, y - 30, 30, 42, 0, 0, 7); ctx.fill();
      // anel de energia girando na cintura
      ctx.strokeStyle = `rgba(255,214,140,${.5 + pulse * .4})`;
      ctx.lineWidth = 2;
      ctx.save();
      ctx.translate(x, y - 26 + Math.sin(t * 3) * 4);
      ctx.scale(1, .3);
      ctx.beginPath(); ctx.arc(0, 0, 26 + pulse * 4, 0, 7); ctx.stroke();
      ctx.restore();
    }
  }

  const duck = state === 'duck';
  const air = state === 'jump' || state === 'fall';
  const run = state === 'run';
  const sw = run ? Math.sin(walk) : 0;
  const bob = run ? Math.abs(Math.sin(walk * 2)) * 2.2 : 0;
  // parada: respiração lenta
  const breathe = (!run && !air && !duck) ? Math.sin(t * 1.9) * .9 : 0;

  // sombra de contato, mais apertada no ar
  shadowUnder(ctx, x, y + 2, air ? 11 : 16, air ? 3.5 : 5, air ? .1 : .18);

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(face, 1);

  const K = duck ? .64 : 1;
  const hipY = -26 * K - bob + breathe * .3;
  const shoY = -48 * K - bob + breathe;
  const headY = -58 * K - bob + breathe * 1.2;

  if (state === 'hurt') ctx.globalAlpha = .55 + Math.sin(t * 40) * .35;

  /* --- pernas: calça off-white e tênis brancos --- */
  const legPose = air ? [.75, -.45] : duck ? [.3, -.3] : [sw, -sw];
  for (let i = 0; i < 2; i++) {
    const s = legPose[i];
    const footX = s * 17;
    const len = duck ? 16 : 26;
    ctx.strokeStyle = i ? HER2.pantsSh : HER2.pants;
    ctx.lineWidth = duck ? 11 : 9.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, hipY);
    ctx.quadraticCurveTo(s * 6, hipY + len * .55, footX, hipY + len - 2);
    ctx.stroke();
    // barra da calça
    ctx.strokeStyle = i ? HER2.pantsSh : '#dfe3f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(footX - 4, hipY + len - 5); ctx.lineTo(footX + 4, hipY + len - 5);
    ctx.stroke();
    // tênis
    ctx.save();
    ctx.translate(footX, hipY + len + 1);
    ctx.rotate(air ? -.28 : s * .16);
    ctx.fillStyle = i ? '#e6eaf5' : HER2.shoe;
    rr(ctx, -5, -5, 15, 7, 3); ctx.fill();
    ctx.fillStyle = HER2.shoeSole;
    rr(ctx, -5, 0, 15, 2.6, 1.3); ctx.fill();
    ctx.fillStyle = i ? '#c9d0e4' : HER2.trim2;
    ctx.fillRect(1, -4, 2.4, 4);
    ctx.restore();
  }

  /* --- braço de trás --- */
  const armPose = air ? -1.1 : duck ? .2 : -sw * .9;
  ctx.strokeStyle = HER2.coatSh; ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-1, shoY + 5);
  ctx.quadraticCurveTo(armPose * 9 - 4, shoY + 15, armPose * 15 - 3, shoY + 23);
  ctx.stroke();

  /* --- tronco: bomber azul com detalhes roxos --- */
  ctx.save();
  if (duck) ctx.rotate(.26);
  const gc = ctx.createLinearGradient(-11, shoY, 11, hipY + 8);
  gc.addColorStop(0, HER2.coatSh);
  gc.addColorStop(.42, HER2.coat);
  gc.addColorStop(1, HER2.coatHi);
  ctx.fillStyle = gc;
  rr(ctx, -10.5, shoY, 22, hipY - shoY + 9, 8); ctx.fill();

  // punho e barra elásticos, em roxo
  ctx.fillStyle = HER2.trim;
  rr(ctx, -10.5, hipY + 3, 22, 6, 3); ctx.fill();
  // zíper
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.moveTo(4, shoY + 3); ctx.lineTo(4, hipY + 3); ctx.stroke();
  // gola e camiseta branca
  ctx.fillStyle = HER2.shirt;
  ctx.beginPath();
  ctx.moveTo(-1, shoY + 1); ctx.lineTo(8, shoY + 2); ctx.lineTo(4.5, shoY + 12);
  ctx.closePath(); ctx.fill();
  // luz no ombro
  ctx.fillStyle = 'rgba(255,255,255,.2)';
  rr(ctx, -9, shoY + 1, 6, 12, 3); ctx.fill();
  ctx.restore();

  /* --- cordão do crachá --- */
  ctx.strokeStyle = HER2.trim; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-3, shoY + 3); ctx.lineTo(1, shoY + 16); ctx.lineTo(6, shoY + 3);
  ctx.stroke();
  ctx.fillStyle = HER2.badge;
  rr(ctx, -2, shoY + 15, 8, 11, 2); ctx.fill();
  ctx.fillStyle = HER2.coat;
  ctx.fillRect(-1, shoY + 17, 6, 2);
  ctx.fillStyle = HER2.trim;
  ctx.fillRect(-1, shoY + 21, 4, 1.6);

  /* --- mochila de tecido --- */
  ctx.fillStyle = HER2.strap;
  rr(ctx, -17, shoY + 4, 10, 20, 4); ctx.fill();
  ctx.fillStyle = HER2.trim;
  ctx.fillRect(-16, shoY + 11, 8, 2.4);

  /* --- braço da frente --- */
  const armF = air ? -1.5 : duck ? .5 : sw * 1.05;
  ctx.strokeStyle = HER2.coat; ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(3, shoY + 5);
  ctx.quadraticCurveTo(armF * 10 + 6, shoY + 15, armF * 16 + 5, shoY + 23);
  ctx.stroke();
  ctx.strokeStyle = HER2.trim; ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(armF * 14 + 5, shoY + 20); ctx.lineTo(armF * 16 + 5, shoY + 23);
  ctx.stroke();
  ctx.fillStyle = HER2.skin;
  ctx.beginPath(); ctx.arc(armF * 16 + 5, shoY + 25.5, 3.6, 0, Math.PI * 2); ctx.fill();

  /* --- headset no pescoço --- */
  ctx.strokeStyle = HER2.gear; ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.arc(1, headY + 11, 9, Math.PI * .1, Math.PI * .9); ctx.stroke();
  ctx.fillStyle = HER2.gear;
  rr(ctx, -10, headY + 8, 6, 8, 3); ctx.fill();
  rr(ctx, 6, headY + 8, 6, 8, 3); ctx.fill();
  ctx.fillStyle = HER2.trim2;
  ctx.fillRect(7.4, headY + 10, 3, 4);

  /* --- pescoço e cabeça --- */
  ctx.fillStyle = HER2.skinSh;
  ctx.fillRect(-2.5, headY + 8, 6, 5);

  // rabo de cavalo, com inércia
  const flow = run ? -sw * 4 : air ? -4.5 : Math.sin(t * 1.6) * .8;
  ctx.fillStyle = HER2.hair;
  ctx.beginPath();
  ctx.moveTo(-6, headY - 6);
  ctx.quadraticCurveTo(-17 + flow, headY - 2, -19 + flow * 1.4, headY + 12);
  ctx.quadraticCurveTo(-13 + flow, headY + 9, -9, headY + 2);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = HER2.hairMid;
  ctx.beginPath();
  ctx.moveTo(-7, headY - 4);
  ctx.quadraticCurveTo(-15 + flow, headY, -16 + flow * 1.3, headY + 9);
  ctx.quadraticCurveTo(-12 + flow, headY + 6, -9, headY + 1);
  ctx.closePath(); ctx.fill();
  // elástico roxo
  ctx.fillStyle = HER2.trim;
  ctx.beginPath(); ctx.ellipse(-7.5, headY - 3, 2.6, 2, .4, 0, 7); ctx.fill();

  // volume de trás da cabeça
  ctx.fillStyle = HER2.hair;
  ctx.beginPath();
  ctx.ellipse(-3.5, headY + 1, 9, 11.5, .08, 0, Math.PI * 2);
  ctx.fill();

  // rosto
  ctx.fillStyle = HER2.skin;
  ctx.beginPath(); ctx.ellipse(1, headY, 9.4, 10.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = HER2.skinSh;
  ctx.beginPath(); ctx.ellipse(-4, headY + 2, 4.4, 7.4, 0, 0, Math.PI * 2); ctx.fill();

  // olho, cílio e boca de perfil
  const shut = state === 'hurt' || (Math.floor(t * 1.3) % 7 === 0 && (t * 1.3 % 1) < .12);
  ctx.fillStyle = '#2a1a12';
  if (shut) {
    ctx.fillRect(3, headY - 1, 4.4, 1.5);
  } else {
    ctx.beginPath(); ctx.ellipse(5, headY - 1, 1.6, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(5.6, headY - 1.8, .7, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = '#3a2418'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(2.4, headY - 5.2); ctx.lineTo(7.6, headY - 4.4); ctx.stroke();
  ctx.fillStyle = 'rgba(224,138,126,.42)';
  ctx.beginPath(); ctx.ellipse(6.2, headY + 3, 2.6, 1.7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c4645c';
  ctx.beginPath();
  ctx.ellipse(8.4, headY + 4.4, 2, state === 'hurt' ? 2 : 1.2, .2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = HER2.skinSh;
  ctx.beginPath(); ctx.ellipse(9.6, headY + .8, 1.6, 1.3, 0, 0, Math.PI * 2); ctx.fill();

  // franja e volume
  const gh = ctx.createLinearGradient(-9, headY - 12, 9, headY);
  gh.addColorStop(0, HER2.hairMid);
  gh.addColorStop(1, HER2.hairHi);
  ctx.fillStyle = gh;
  ctx.beginPath();
  ctx.ellipse(0, headY - 6, 11, 7.4, -.08, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = HER2.hairMid;
  ctx.beginPath();
  ctx.moveTo(-2, headY - 11);
  ctx.quadraticCurveTo(10, headY - 10, 9.6, headY - 1);
  ctx.quadraticCurveTo(5, headY - 6, -2, headY - 5);
  ctx.closePath(); ctx.fill();
  // mechas de luz no topo
  ctx.strokeStyle = 'rgba(214,150,104,.5)'; ctx.lineWidth = .9;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-4 + i * 3, headY - 12);
    ctx.quadraticCurveTo(2 + i * 3, headY - 10, 5 + i * 2.4, headY - 4);
    ctx.stroke();
  }
  // fio solto na testa
  ctx.strokeStyle = HER2.hairMid; ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(6, headY - 9);
  ctx.quadraticCurveTo(11 + flow * .3, headY - 5, 9.5, headY + 1);
  ctx.stroke();

  ctx.globalAlpha = 1;
  ctx.restore();
}

/* ============================================================
   INIMIGOS
   ============================================================ */
function bugEyes(ctx, x, y, r, dir, angry) {
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x - r * .9, y, r, 0, Math.PI * 2);
  ctx.arc(x + r * .9, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = T.ink;
  ctx.beginPath();
  ctx.arc(x - r * .9 + dir * r * .3, y, r * .52, 0, Math.PI * 2);
  ctx.arc(x + r * .9 + dir * r * .3, y, r * .52, 0, Math.PI * 2);
  ctx.fill();
  if (angry) {
    ctx.strokeStyle = T.ink; ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(x - r * 1.9, y - r * 1.5); ctx.lineTo(x - r * .2, y - r * .8);
    ctx.moveTo(x + r * 1.9, y - r * 1.5); ctx.lineTo(x + r * .2, y - r * .8);
    ctx.stroke();
  }
}

function legs(ctx, w, y, t, col, n = 2) {
  ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + (w / (n - 1 || 1)) * i;
    const k = Math.sin(t * 9 + i * 2.1) * 4;
    ctx.beginPath();
    ctx.moveTo(x, y - 3);
    ctx.lineTo(x + k, y + 6);
    ctx.stroke();
  }
}

const ENEMY_ART = {
  meeting(ctx, e, t) {                       // bloco de agenda que espera você
    const open = (Math.sin(t * 2) + 1) / 2;
    legs(ctx, 30, 24, t * .3, '#7a5d3a', 3);
    ctx.fillStyle = T.white; rr(ctx, -23, -24, 46, 48, 5); ctx.fill();
    ctx.fillStyle = T.coral; rr(ctx, -23, -24, 46, 13, 5); ctx.fill();
    ctx.fillStyle = T.white; ctx.fillRect(-23, -14, 46, 4);
    ctx.fillStyle = '#8d7a5e';
    ctx.fillRect(-14, -29, 4, 8); ctx.fillRect(10, -29, 4, 8);
    bugEyes(ctx, 0, -2, 4.6, 0, false);
    // boca-zíper que abre
    ctx.fillStyle = T.ink;
    rr(ctx, -11, 9, 22, 2 + open * 9, 2); ctx.fill();
    ctx.strokeStyle = T.white; ctx.lineWidth = 1.4;
    for (let i = 0; i < 5; i++) {
      const x = -9 + i * 4.6;
      ctx.beginPath(); ctx.moveTo(x, 9); ctx.lineTo(x, 11 + open * 9); ctx.stroke();
    }
  },

  ping(ctx, e, t) {                          // balãozinho que corre atrás
    const b = Math.abs(Math.sin(t * 14)) * 3;
    legs(ctx, 14, 14, t, T.blue900);
    ctx.fillStyle = T.blue500;
    rr(ctx, -13, -15 - b, 26, 22, 9); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-6, 6 - b); ctx.lineTo(-1, 13 - b); ctx.lineTo(2, 6 - b);
    ctx.closePath(); ctx.fill();
    bugEyes(ctx, 0, -6 - b, 3.4, e.dir, false);
    ctx.fillStyle = '#fff';
    ctx.font = '700 8px -apple-system, Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    if (Math.sin(t * 6) > .3) ctx.fillText('ping', 0, -20 - b);
  },

  deadline(ctx, e, t) {                      // relógio que acelera
    const rush = Math.min(1, (e.rush || 0));
    legs(ctx, 22, 20, t * (1 + rush * 2.4), '#5a4632');
    ctx.fillStyle = T.amber;
    ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = T.white;
    ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = T.coralDark; ctx.lineWidth = 2.4;
    const sp = t * (3 + rush * 14);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(sp) * 11, Math.sin(sp) * 11); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(sp * .3) * 7, Math.sin(sp * .3) * 7); ctx.stroke();
    ctx.fillStyle = T.amber;
    ctx.beginPath(); ctx.arc(-11, -17, 5, 0, Math.PI * 2); ctx.arc(11, -17, 5, 0, Math.PI * 2); ctx.fill();
    bugEyes(ctx, 0, -5, 3.2, e.dir, true);
  },

  urgent(ctx, e, t) {                        // aparece correndo do nada
    legs(ctx, 16, 19, t * 1.8, '#7a1d16');
    ctx.fillStyle = T.coral; rr(ctx, -14, -19, 28, 34, 6); ctx.fill();
    ctx.fillStyle = '#ffd9d3';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(-9 + i * 8, -14, 3.4, 12);
      ctx.beginPath(); ctx.arc(-7.3 + i * 8, 3, 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = 'rgba(242,112,95,.3)';
    const puff = (t * 3) % 1;
    ctx.beginPath(); ctx.arc(-e.dir * (18 + puff * 14), 10, 6 - puff * 5, 0, Math.PI * 2); ctx.fill();
  },

  followup(ctx, e, t) {                      // volta sempre
    legs(ctx, 18, 19, t, '#6b5a2e');
    ctx.fillStyle = T.white; rr(ctx, -17, -14, 34, 26, 3); ctx.fill();
    ctx.strokeStyle = T.grey300; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(-17, -14); ctx.lineTo(0, 0); ctx.lineTo(17, -14); ctx.stroke();
    bugEyes(ctx, 0, 3, 3.2, e.dir, false);
    // setinha de retorno girando
    ctx.strokeStyle = T.purple600; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.arc(0, -22, 8, t % (Math.PI * 2), t % (Math.PI * 2) + 4.2); ctx.stroke();
    ctx.fillStyle = T.purple600;
    const a = t % (Math.PI * 2) + 4.2;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 8, -22 + Math.sin(a) * 8, 3, 0, Math.PI * 2);
    ctx.fill();
    if (e.returned) {
      ctx.fillStyle = '#c05b4a';
      ctx.font = '700 9px -apple-system, Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('de novo', 0, -34);
    }
  },

  goblin(ctx, e, t) {                        // carregando uma planilha enorme
    legs(ctx, 24, 23, t * .8, T.leafDark, 2);
    ctx.fillStyle = T.leaf;
    rr(ctx, -16, -16, 32, 34, 8); ctx.fill();
    ctx.fillStyle = T.leafDark;
    ctx.beginPath(); ctx.moveTo(-16, -10); ctx.lineTo(-26, -20); ctx.lineTo(-14, -16);
    ctx.closePath();
    ctx.moveTo(16, -10); ctx.lineTo(26, -20); ctx.lineTo(14, -16);
    ctx.closePath(); ctx.fill();
    bugEyes(ctx, 0, -4, 3.6, e.dir, true);
    ctx.fillStyle = T.white;
    const sway = Math.sin(t * 2) * 2;
    rr(ctx, -22, -54 + sway, 44, 30, 2); ctx.fill();
    ctx.strokeStyle = T.grey300; ctx.lineWidth = 1;
    for (let i = 1; i < 6; i++) {
      ctx.beginPath(); ctx.moveTo(-22 + i * 7.3, -54 + sway); ctx.lineTo(-22 + i * 7.3, -24 + sway); ctx.stroke();
    }
    for (let i = 1; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(-22, -54 + sway + i * 7.5); ctx.lineTo(22, -54 + sway + i * 7.5); ctx.stroke();
    }
    ctx.fillStyle = T.mint; ctx.fillRect(-21, -53 + sway, 6, 6);
  },

  swarm(ctx, e, t) {                         // sininho de notificação voando
    const f = Math.sin(t * 9 + (e.phase || 0)) * 3;
    ctx.fillStyle = 'rgba(242,112,95,.25)';
    ctx.beginPath(); ctx.arc(0, f, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = T.coral;
    ctx.beginPath();
    ctx.moveTo(0, -9 + f);
    ctx.quadraticCurveTo(8, -7 + f, 8, 4 + f);
    ctx.lineTo(-8, 4 + f);
    ctx.quadraticCurveTo(-8, -7 + f, 0, -9 + f);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = T.coralDark;
    ctx.beginPath(); ctx.arc(0, 6 + f, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-2.6, -2 + f, 1.4, 0, Math.PI * 2);
    ctx.arc(2.6, -2 + f, 1.4, 0, Math.PI * 2); ctx.fill();
    // asinhas
    ctx.strokeStyle = 'rgba(255,255,255,.65)'; ctx.lineWidth = 1.6;
    const wing = Math.sin(t * 26) * 5;
    ctx.beginPath();
    ctx.moveTo(-7, -4 + f); ctx.lineTo(-14, -8 + f + wing);
    ctx.moveTo(7, -4 + f); ctx.lineTo(14, -8 + f - wing);
    ctx.stroke();
  },

  scope(ctx, e, t) {                         // cresce conforme você avança
    const k = e.scale || 1;
    ctx.save(); ctx.scale(k, k);
    legs(ctx, 20, 17, t * .7, T.purple800);
    ctx.fillStyle = T.purple600;
    ctx.beginPath(); ctx.arc(0, 0, 17, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 2;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath(); ctx.arc(0, 0, 17 - i * 4.4, 0, Math.PI * 2); ctx.stroke();
    }
    bugEyes(ctx, 0, -3, 3.6, e.dir, false);
    ctx.fillStyle = '#fff';
    ctx.font = '700 8px -apple-system, Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('+1', 0, -22);
    ctx.restore();
  },

  blob(ctx, e, t) {                          // gelatina de aprovações
    const wob = Math.sin(t * 3) * 3;
    ctx.fillStyle = 'rgba(196,203,223,.92)';
    ctx.beginPath();
    ctx.moveTo(-29, 26);
    ctx.quadraticCurveTo(-33 - wob, -8, -10, -24 - wob);
    ctx.quadraticCurveTo(14, -32 + wob, 27, -10);
    ctx.quadraticCurveTo(34 + wob, 14, 29, 26);
    ctx.closePath(); ctx.fill();
    // papéis boiando dentro
    ctx.fillStyle = 'rgba(250,248,238,.9)';
    for (let i = 0; i < 4; i++) {
      const a = h2(i, 2, 9);
      ctx.save();
      ctx.translate(-16 + i * 11, 2 + Math.sin(t * 2 + i) * 4);
      ctx.rotate((a - .5) * 1.2);
      ctx.fillRect(-6, -8, 12, 16);
      ctx.restore();
    }
    ctx.fillStyle = T.coral;
    ctx.beginPath(); ctx.arc(8, -4, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.font = '700 6px -apple-system, Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OK', 8, -2);
    bugEyes(ctx, -6, -12, 4, e.dir, false);
  },

  ghost(ctx, e, t) {                         // fuso horário que some
    const a = e.alpha === undefined ? 1 : e.alpha;
    ctx.globalAlpha = a;
    const wob = Math.sin(t * 2.4) * 2;
    ctx.fillStyle = 'rgba(223,229,252,.88)';
    ctx.beginPath();
    ctx.moveTo(-17, 20);
    ctx.quadraticCurveTo(-19, -20 + wob, 0, -22);
    ctx.quadraticCurveTo(19, -20 - wob, 17, 20);
    for (let i = 3; i >= -3; i--)
      ctx.quadraticCurveTo(i * 5.6 + 2.8, 20 + (i % 2 ? 7 : -3), i * 5.6, 20);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#123c52';
    ctx.beginPath(); ctx.arc(0, -6, 9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = T.blue100; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(0, -12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(Math.cos(t) * 5, -6 + Math.sin(t) * 5); ctx.stroke();
    ctx.fillStyle = T.ink;
    ctx.beginPath(); ctx.arc(-8, 5, 2, 0, Math.PI * 2); ctx.arc(8, 5, 2, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
};

/* NOVELO — uma thread presa na pelúcia. É nele que se pula.
   O fio volta até a lâmpada, mostrando o que ainda prende. */
ENEMY_ART.thread = function (ctx, e, t) {
  const col = e.color || '#3957BD';
  const R = 15;
  const spin = e.spin || 0;

  // o fio que ainda liga este novelo à pelúcia
  if (e.hub && e.alive) {
    const hx = (e.hub.x + e.hub.spec.w / 2) - (e.x + e.spec.w / 2);
    const hy = (GROUND_Y - 52) - (e.y - e.spec.h / 2);
    ctx.strokeStyle = col;
    ctx.globalAlpha = .55;
    ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(hx * .45, hy * .45 + Math.sin(t * 2 + spin) * 10, hx, hy);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // corpo do novelo, com volume
  ctx.fillStyle = 'rgba(2,24,65,.2)';
  ctx.beginPath(); ctx.arc(1.5, 2.5, R, 0, 7); ctx.fill();
  const g = ctx.createRadialGradient(-R * .35, -R * .4, R * .15, 0, 0, R);
  g.addColorStop(0, shadeC(col, .22));
  g.addColorStop(.62, col);
  g.addColorStop(1, shadeC(col, -.12));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill();

  // voltas grossas do fio
  ctx.lineCap = 'round';
  for (let k = -2; k <= 2; k++) {
    ctx.strokeStyle = shadeC(col, -.16);
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.ellipse(0, 0, R * .86, R * .32, k * .58 + spin * .4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.34)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, -1, R * .86, R * .32, k * .58 + spin * .4, 0, Math.PI * 2);
    ctx.stroke();
  }
  // brilho
  ctx.fillStyle = 'rgba(255,255,255,.28)';
  ctx.beginPath(); ctx.ellipse(-R * .38, -R * .42, R * .3, R * .18, -.6, 0, 7); ctx.fill();

  // seta de "pise aqui", só enquanto está preso
  if (e.alive) {
    const bob = Math.sin(t * 3.4 + spin) * 2.5;
    ctx.fillStyle = 'rgba(242,192,55,.9)';
    ctx.beginPath();
    ctx.moveTo(0, -R - 12 + bob);
    ctx.lineTo(-5, -R - 20 + bob);
    ctx.lineTo(5, -R - 20 + bob);
    ctx.closePath(); ctx.fill();
  }
};

/* ============================================================
   GRANDE CHAT — uma lâmpada de pelúcia. Não é vilão: está presa
   em threads e precisa de ajuda para se desenrolar. Tecido
   acolchoado, costura aparente, bochechas coradas e carinha
   fechadinha que vai relaxando conforme os novelos saem.
   ============================================================ */
ENEMY_ART.hub = function (ctx, e, t) {
  const total = (e.spec.threads || 6);
  const left = (typeof game !== 'undefined' && game.threads)
    ? game.threads.filter(x => x.alive).length : total;
  const free = 1 - left / total;              // 0 = enrolado, 1 = livre
  const bob = Math.sin(t * 1.5) * 4;
  const hop = e.flash > 0 ? Math.sin(e.flash * 24) * 5 : 0;

  ctx.save();
  ctx.translate(0, bob - hop);

  // brilho macio ao redor, cresce conforme se solta
  const glow = .18 + free * .34 + Math.sin(t * 2.4) * .05;
  const ga = ctx.createRadialGradient(0, -6, 6, 0, -6, 76);
  ga.addColorStop(0, `rgba(242,192,55,${glow})`);
  ga.addColorStop(.55, `rgba(242,209,165,${glow * .4})`);
  ga.addColorStop(1, 'rgba(242,209,165,0)');
  ctx.fillStyle = ga;
  ctx.beginPath(); ctx.arc(0, -6, 76, 0, 7); ctx.fill();

  /* --- rosca: tecido franzido, não metal --- */
  const sg = ctx.createLinearGradient(-16, 0, 16, 0);
  sg.addColorStop(0, '#C9A371');
  sg.addColorStop(.38, '#F2D1A5');
  sg.addColorStop(1, '#B08D29');
  ctx.fillStyle = sg;
  rr(ctx, -15, 20, 30, 22, 9); ctx.fill();
  ctx.strokeStyle = 'rgba(176,141,41,.55)'; ctx.lineWidth = 2;
  for (let k = 0; k < 3; k++) {               // franzidos macios
    ctx.beginPath();
    ctx.moveTo(-15, 25 + k * 6);
    ctx.quadraticCurveTo(0, 28.5 + k * 6, 15, 25 + k * 6);
    ctx.stroke();
  }
  ctx.fillStyle = '#9A8156';
  rr(ctx, -7, 40, 14, 5, 2.5); ctx.fill();

  /* --- bulbo de tecido: silhueta de lâmpada, acabamento de pelúcia --- */
  const bg = ctx.createRadialGradient(-11, -24, 4, 0, -8, 42);
  bg.addColorStop(0, '#FFF6D8');
  bg.addColorStop(.5, '#F7CF63');
  bg.addColorStop(1, '#E0AC2E');
  ctx.fillStyle = bg;
  ctx.beginPath();
  // contorno levemente irregular, como bicho de pelúcia cheio
  ctx.moveTo(-14, 21);
  ctx.bezierCurveTo(-30, 10, -34, -16, -22, -31);
  ctx.bezierCurveTo(-12, -43, 12, -43, 22, -31);
  ctx.bezierCurveTo(34, -16, 30, 10, 14, 21);
  ctx.closePath();
  ctx.fill();

  // costura central, ponto por ponto
  ctx.strokeStyle = 'rgba(176,141,41,.6)';
  ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  ctx.setLineDash([3.5, 4]);
  ctx.beginPath();
  ctx.moveTo(0, -42); ctx.quadraticCurveTo(-3, -10, 0, 21);
  ctx.stroke();
  ctx.setLineDash([]);

  // remendo de luz costurado no meio, no lugar do filamento
  ctx.fillStyle = `rgba(255,249,222,${.5 + free * .4})`;
  ctx.beginPath();
  ctx.ellipse(0, -14, 13, 15, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(176,141,41,.45)';
  ctx.lineWidth = 1.2; ctx.setLineDash([3, 3.5]);
  ctx.beginPath(); ctx.ellipse(0, -14, 13, 15, 0, 0, 7); ctx.stroke();
  ctx.setLineDash([]);

  // brilho de tecido acetinado
  ctx.fillStyle = 'rgba(255,255,255,.4)';
  ctx.beginPath(); ctx.ellipse(-13, -26, 6.5, 10, -.5, 0, 7); ctx.fill();

  /* --- rosto: olhinhos fechados sorrindo quando já respira --- */
  const happy = free > .45;
  ctx.strokeStyle = '#6B4A12';
  ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  if (happy) {
    for (const sx of [-9, 9]) {               // ^ ^
      ctx.beginPath();
      ctx.arc(sx, -9, 5, Math.PI * 1.12, Math.PI * 1.88);
      ctx.stroke();
    }
  } else {
    for (const sx of [-9, 9]) {               // arregalado e preocupado
      ctx.fillStyle = '#FFFDF5';
      ctx.beginPath(); ctx.ellipse(sx, -9, 5, 5.6, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#3A2A08';
      ctx.beginPath(); ctx.ellipse(sx + Math.sin(t * 1.6) * .8, -8, 2.6, 3, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(sx - 1, -10.4, 1.1, 0, 7); ctx.fill();
    }
    ctx.strokeStyle = '#6B4A12'; ctx.lineWidth = 1.8;
    ctx.beginPath();                           // sobrancelhas aflitas
    ctx.moveTo(-14, -18); ctx.lineTo(-5, -15.5);
    ctx.moveTo(14, -18); ctx.lineTo(5, -15.5);
    ctx.stroke();
  }

  // bochechas coradas
  ctx.fillStyle = 'rgba(213,164,151,.6)';
  ctx.beginPath();
  ctx.ellipse(-17, -2, 5.5, 3.6, 0, 0, 7);
  ctx.ellipse(17, -2, 5.5, 3.6, 0, 0, 7);
  ctx.fill();

  // boquinha
  ctx.strokeStyle = '#6B4A12'; ctx.lineWidth = 2;
  ctx.beginPath();
  if (happy) ctx.arc(0, 1, 6, Math.PI * .15, Math.PI * .85);
  else { ctx.moveTo(-5, 7); ctx.quadraticCurveTo(0, 3.5, 5, 7); }
  ctx.stroke();

  /* --- bracinhos curtos de pelúcia, acenando quando livre --- */
  const wave = happy ? Math.sin(t * 4) * .5 : .1;
  for (const s of [-1, 1]) {
    ctx.save();
    ctx.translate(s * 26, 2);
    ctx.rotate(s * (0.5 + (s > 0 ? wave : -wave)));
    ctx.fillStyle = '#F7CF63';
    rr(ctx, -5, -5, 16, 10, 5); ctx.fill();
    ctx.strokeStyle = 'rgba(176,141,41,.45)'; ctx.lineWidth = 1.2;
    rr(ctx, -5, -5, 16, 10, 5); ctx.stroke();
    ctx.restore();
  }

  // etiqueta de pelúcia, costurada na lateral
  ctx.fillStyle = '#F8F9F5';
  rr(ctx, 16, 12, 9, 7, 1.5); ctx.fill();
  ctx.strokeStyle = 'rgba(2,24,65,.2)'; ctx.lineWidth = .8;
  rr(ctx, 16, 12, 9, 7, 1.5); ctx.stroke();

  // coraçãozinho de alívio quando está quase livre
  if (free > .7) {
    const hb = (t * .9) % 1;
    ctx.globalAlpha = 1 - hb;
    ctx.fillStyle = '#EA4E58';
    const hyy = -50 - hb * 26, hs = 4;
    ctx.beginPath();
    ctx.moveTo(26, hyy + hs);
    ctx.bezierCurveTo(26 - hs, hyy - hs * .4, 26 - hs * .3, hyy - hs, 26, hyy - hs * .3);
    ctx.bezierCurveTo(26 + hs * .3, hyy - hs, 26 + hs, hyy - hs * .4, 26, hyy + hs);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
};

function drawEnemy(ctx, e, t) {
  const spec = ENEMY_SPEC[e.type];
  const k = e.scale || 1;
  const cx = e.x + spec.w / 2;

  // sombra no chão: cola o monstrinho no cenário
  if (e.alive && e.type !== 'swarm' && e.type !== 'ghost' && e.type !== 'thread')
    shadowUnder(ctx, cx, e.y + 2, spec.w * .52 * k, 6 * k, .17);
  if (e.alive && e.type === 'thread') {
    shadowUnder(ctx, cx, GROUND_Y + 2, 13, 4, .1);
  }
  if (e.alive && e.type === 'swarm') {
    const fly = Math.sin(t * 9 + (e.phase || 0)) * 3;
    shadowUnder(ctx, cx, GROUND_Y + 2, 11 + fly * .4, 3.6, .08);
  }

  // respiração leve quando vivo e parado
  const idle = e.alive ? 1 + Math.sin(t * 2.4 + (e.phase || 0)) * .028 : 1;

  ctx.save();
  ctx.translate(cx, e.y - spec.h / 2);
  if (e.alive) ctx.scale(1 / idle, idle);
  if (!e.alive) {                     // derrotado: achata contra o chão e some
    ctx.globalAlpha = Math.max(0, e.squash);
    ctx.translate(0, spec.h * .5 * (1 - e.squash));
    ctx.scale(1 + (1 - e.squash) * .4, Math.max(.05, e.squash * .5));
  } else if (e.squash) {
    ctx.scale(1 + e.squash * .3, 1 - e.squash * .4);
  }
  (ENEMY_ART[e.type] || ENEMY_ART.ping)(ctx, e, t);
  ctx.globalAlpha = 1;
  ctx.restore();
}

/* ============================================================
   ITENS — cafezinho
   ============================================================ */
/* Coletável: um cartão de tarefa que vira "concluída".
   TASK → COMPLETE → COLLECT */
/* Núcleo de foco: o power-up. Cristal girando dentro de um anel. */
function drawPowerCore(ctx, it, t) {
  const ph = t * 2.2 + it.x * .01;
  const b = Math.sin(ph) * 6;
  ctx.save();
  ctx.translate(it.x, it.y + b);

  // aura
  const pulse = .5 + Math.sin(ph * 1.6) * .5;
  const g = ctx.createRadialGradient(0, 0, 3, 0, 0, 34);
  g.addColorStop(0, `rgba(242,169,59,${.2 + pulse * .12})`);
  g.addColorStop(.55, `rgba(139,92,240,${.1 + pulse * .06})`);
  g.addColorStop(1, 'rgba(139,92,240,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, 34, 0, 7); ctx.fill();

  // anel orbital
  ctx.strokeStyle = T.purple300; ctx.lineWidth = 2;
  ctx.save();
  ctx.rotate(t * 1.1);
  ctx.scale(1, .34);
  ctx.beginPath(); ctx.arc(0, 0, 21, 0, 7); ctx.stroke();
  ctx.restore();

  // cristal
  ctx.save();
  ctx.rotate(Math.sin(ph * .5) * .22);
  const cg = ctx.createLinearGradient(-11, -15, 11, 15);
  cg.addColorStop(0, '#ffd98a');
  cg.addColorStop(.5, T.amber);
  cg.addColorStop(1, T.purple500);
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.moveTo(0, -16); ctx.lineTo(11, -4); ctx.lineTo(6, 15);
  ctx.lineTo(-6, 15); ctx.lineTo(-11, -4);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.55)';
  ctx.beginPath();
  ctx.moveTo(0, -16); ctx.lineTo(-11, -4); ctx.lineTo(-2, 2);
  ctx.closePath(); ctx.fill();
  ctx.restore();

  // faíscas orbitando
  for (let i = 0; i < 3; i++) {
    const a = t * 2.4 + i * 2.1;
    ctx.fillStyle = i % 2 ? T.amber : T.purple300;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 23, Math.sin(a) * 9, 2.2, 0, 7);
    ctx.fill();
  }
  ctx.restore();
}

function drawItem(ctx, it, t) {
  if (it.kind === 'power') { drawPowerCore(ctx, it, t); return; }
  const ph = t * 2.4 + it.x * .015;
  const b = Math.sin(ph) * 4.5;
  ctx.save();
  ctx.translate(it.x, it.y + b);

  // halo pulsante
  const pulse = .5 + Math.sin(ph) * .5;
  const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 22);
  g.addColorStop(0, `rgba(55,196,164,${.13 + pulse * .07})`);
  g.addColorStop(1, 'rgba(55,196,164,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, 22, 0, 7); ctx.fill();

  // cartão levemente inclinado
  ctx.save();
  ctx.rotate(Math.sin(ph * .7) * .08);
  ctx.fillStyle = 'rgba(26,33,64,.1)';
  rr(ctx, -10, -9, 21, 20, 4); ctx.fill();
  ctx.fillStyle = T.white;
  rr(ctx, -11, -10, 21, 20, 4); ctx.fill();
  outline(ctx, 1.8, .3);
  ctx.fillStyle = T.blue300;
  ctx.fillRect(-7, -6, 13, 2);
  ctx.fillRect(-7, -2, 9, 2);
  ctx.fillStyle = T.purple300;
  ctx.fillRect(-7, 2, 11, 2);
  ctx.restore();

  // selo de concluído
  appIcon(ctx, 'check', 8, 8, 7.5, t);
  ctx.restore();
}

/* ============================================================
   PERIGOS FIXOS
   ============================================================ */
/* Todos desenhados dentro da própria caixa (x,y = canto superior
   esquerdo), para o que se vê ser exatamente o que machuca. */
function drawHazard(ctx, hz, t) {
  const cx = hz.x + hz.w / 2, cy = hz.y + hz.h / 2;
  ctx.save();
  ctx.textAlign = 'center';

  if (hz.kind === 'cables') {
    ctx.translate(hz.x, hz.y + hz.h);
    ctx.strokeStyle = '#2b3a44'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let i = 0; i < Math.ceil(hz.w / 26); i++) {
      const x = i * 26 + 10;
      ctx.beginPath();
      ctx.moveTo(x - 12, 2);
      ctx.bezierCurveTo(x - 4, -18, x + 6, 10, x + 14, -8);
      ctx.stroke();
    }
    ctx.strokeStyle = '#c05b4a'; ctx.lineWidth = 2.4;
    for (let i = 0; i < Math.ceil(hz.w / 40); i++) {
      const x = i * 40 + 16;
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.bezierCurveTo(x + 10, -14, x + 18, 6, x + 28, -6);
      ctx.stroke();
    }
    // faísca correndo pelo emaranhado
    if (Math.sin(t * 7 + hz.x * .01) > .82) {
      ctx.fillStyle = '#ffd97a';
      ctx.beginPath(); ctx.arc((t * 60) % hz.w, -10, 3.4, 0, Math.PI * 2); ctx.fill();
    }
  } else if (hz.kind === 'mute') {
    /* Totem de piso, apoiado no chão: encostou, morreu.
       Sem texto — o microfone cortado já diz tudo. */
    const pulse = .5 + Math.sin(t * 2.6) * .5;
    const base = hz.y + hz.h;

    shadowUnder(ctx, cx, base + 2, hz.w * .5, 7, .2);

    // base pesada e haste
    ctx.fillStyle = T.grey700;
    rr(ctx, cx - 20, base - 8, 40, 9, 4); ctx.fill();
    // chapa em Azul Profundo
    const pw = hz.w - 14, ph = 40;
    const px = cx - pw / 2, py = hz.y + 2;
    ctx.fillStyle = T.grey600;
    ctx.fillRect(cx - 3.5, py + ph - 2, 7, base - py - ph - 4);
    ctx.fillStyle = 'rgba(2,24,65,.2)';
    rr(ctx, px + 2, py + 3, pw, ph, 7); ctx.fill();
    const pg = ctx.createLinearGradient(0, py, 0, py + ph);
    pg.addColorStop(0, '#0B2A5E');
    pg.addColorStop(1, T.ink);
    ctx.fillStyle = pg;
    rr(ctx, px, py, pw, ph, 7); ctx.fill();
    ctx.fillStyle = T.coral;
    rr(ctx, px, py, pw, 4, 2); ctx.fill();
    ctx.strokeStyle = `rgba(234,78,88,${.4 + pulse * .45})`;
    ctx.lineWidth = 1.8;
    rr(ctx, px + 1, py + 1, pw - 2, ph - 2, 6); ctx.stroke();

    // microfone cortado, grande e centralizado na chapa
    const dx = cx, dy = py + ph / 2, R = 13;
    ctx.fillStyle = `rgba(234,78,88,${.2 + pulse * .16})`;
    ctx.beginPath(); ctx.arc(dx, dy, R + 4, 0, 7); ctx.fill();
    ctx.fillStyle = T.coral;
    ctx.beginPath(); ctx.arc(dx, dy, R, 0, 7); ctx.fill();
    ctx.fillStyle = T.white;
    rr(ctx, dx - 3, dy - 8, 6, 9.5, 3); ctx.fill();
    ctx.strokeStyle = T.white; ctx.lineWidth = 1.7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(dx, dy - 1, 5.6, .3, Math.PI - .3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(dx, dy + 4.8); ctx.lineTo(dx, dy + 7.4); ctx.stroke();
    ctx.strokeStyle = T.ink; ctx.lineWidth = 3.4;
    ctx.beginPath(); ctx.moveTo(dx - 9, dy - 10); ctx.lineTo(dx + 9, dy + 8); ctx.stroke();
    ctx.strokeStyle = T.white; ctx.lineWidth = 1.9;
    ctx.beginPath(); ctx.moveTo(dx - 9, dy - 10); ctx.lineTo(dx + 9, dy + 8); ctx.stroke();

    badge(cx, base + 22, 'você está no mudo', T.coralDark, 10);

  } else if (hz.kind === 'lag') {
    const j = Math.sin(t * 30) * 2;
    ctx.fillStyle = 'rgba(240,160,75,.16)';
    rr(ctx, hz.x, hz.y, hz.w, hz.h, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(224,139,43,.55)'; ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#e08b2b';
    for (let i = 0; i < 4; i++) {
      ctx.globalAlpha = (Math.floor(t * 4) % 4) > i ? 1 : .22;
      const bh = 10 + i * 9;
      ctx.fillRect(cx - 22 + i * 11 + j, hz.y + hz.h - 8 - bh, 8, bh);
    }
    ctx.globalAlpha = 1;
    badge(cx + j, hz.y + hz.h + 18, 'conexão instável', T.amberDark, 10);

  } else {                                     // overlap
    const g = Math.sin(t * 3) * 5;
    for (let i = 0; i < 2; i++) {
      ctx.save();
      ctx.translate(cx + (i ? g : -g), cy + (i ? 5 : -5));
      ctx.fillStyle = i ? 'rgba(47,111,125,.9)' : 'rgba(192,57,43,.9)';
      rr(ctx, -hz.w / 2 + 6, -24, hz.w - 12, 34, 5); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      ctx.fillRect(-hz.w / 2 + 12, -17, hz.w - 24, 3);
      ctx.fillRect(-hz.w / 2 + 12, -9, (hz.w - 24) * .6, 3);
      ctx.restore();
    }
    badge(cx, hz.y + hz.h + 18, 'reuniões sobrepostas', T.coralDark, 10);
  }
  ctx.restore();
}

/* ============================================================
   A ESTAÇÃO NO FIM DA FASE
   ============================================================ */
function drawGoal(ctx, g, t, labelTxt) {
  const pulse = .5 + Math.sin(t * 2.4) * .5;
  ctx.save();
  ctx.translate(g.x, g.y);

  // feixe de luz
  const lg = ctx.createLinearGradient(0, -300, 0, 0);
  lg.addColorStop(0, `rgba(139,92,240,0)`);
  lg.addColorStop(1, `rgba(139,92,240,${.14 + pulse * .12})`);
  ctx.fillStyle = lg;
  ctx.beginPath();
  ctx.moveTo(-26, -300); ctx.lineTo(26, -300); ctx.lineTo(56, 0); ctx.lineTo(-56, 0);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = 'rgba(26,33,64,.14)';
  ctx.beginPath(); ctx.ellipse(0, 2, 58, 9, 0, 0, Math.PI * 2); ctx.fill();

  // mesa
  ctx.fillStyle = T.grey500;
  ctx.fillRect(-42, -58, 5, 58); ctx.fillRect(37, -58, 5, 58);
  ctx.fillStyle = T.white;
  rr(ctx, -52, -66, 104, 9, 3); ctx.fill();
  // monitor grande
  ctx.fillStyle = T.ink;
  rr(ctx, -34, -124, 68, 56, 4); ctx.fill();
  const sg = ctx.createLinearGradient(0, -120, 0, -74);
  sg.addColorStop(0, T.blue700);
  sg.addColorStop(1, T.blue900);
  ctx.fillStyle = sg;
  ctx.fillRect(-30, -120, 60, 46);
  ctx.fillStyle = `rgba(194,168,249,${.6 + pulse * .35})`;
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 5; c++) {
      ctx.globalAlpha = (r * 5 + c) % 3 ? .4 : .9;
      rr(ctx, -27 + c * 11.4, -116 + r * 10.6, 9, 8, 1.6); ctx.fill();
    }
  ctx.globalAlpha = 1;
  ctx.fillStyle = T.grey500; ctx.fillRect(-5, -68, 10, 4);

  // haste da placa; a chapa em si é desenhada em resolução cheia
  const py = -158 + Math.sin(t * 2.2) * 4;
  ctx.strokeStyle = T.grey500; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -124); ctx.lineTo(0, py + 12); ctx.stroke();
  ctx.restore();
  badge(g.x, g.y + py, labelTxt, T.ink, 12);
}
