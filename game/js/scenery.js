/* ============================================================
   SCENERY — mobiliário do andar, no plano do jogo.
   Tudo apoiado no chão, com sombra de contato, mesma linguagem.
   ============================================================ */

/* Vaso de cerâmica fosca: tronco-cônico, boca mais larga que a base,
   com aro e sombra interna. O mesmo para todas as espécies. */
function potCeramic(ctx, topR, h, light, dark) {
  const baseR = topR * .74;
  const g = ctx.createLinearGradient(-topR, 0, topR, 0);
  g.addColorStop(0, dark);
  g.addColorStop(.35, light);
  g.addColorStop(1, dark);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-baseR, 0);
  ctx.lineTo(-topR, -h);
  ctx.lineTo(topR, -h);
  ctx.lineTo(baseR, 0);
  ctx.closePath(); ctx.fill();

  // aro
  ctx.fillStyle = light;
  ctx.beginPath(); ctx.ellipse(0, -h, topR, topR * .3, 0, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(26,33,64,.2)';
  ctx.beginPath(); ctx.ellipse(0, -h + 1.5, topR * .84, topR * .24, 0, 0, 7); ctx.fill();
  // terra
  ctx.fillStyle = '#4a3b30';
  ctx.beginPath(); ctx.ellipse(0, -h + 2, topR * .78, topR * .21, 0, 0, 7); ctx.fill();
  // luz na borda esquerda, coerente com a luz global
  ctx.fillStyle = 'rgba(255,255,255,.3)';
  ctx.beginPath();
  ctx.moveTo(-baseR + 2, -2); ctx.lineTo(-topR + 2, -h + 3);
  ctx.lineTo(-topR + 5.5, -h + 3); ctx.lineTo(-baseR + 5, -2);
  ctx.closePath(); ctx.fill();
}

const DECO2 = {
  /* --- estação de trabalho completa --- */
  desk(ctx, t, seed) {
    shadowUnder(ctx, 6, 2, 78, 11);
    // pés e tampo
    ctx.fillStyle = T.grey500;
    ctx.fillRect(-50, -62, 6, 62); ctx.fillRect(44, -62, 6, 62);
    ctx.fillStyle = T.grey300;
    ctx.fillRect(-50, -62, 2, 62); ctx.fillRect(44, -62, 2, 62);
    panel(ctx, -60, -70, 120, 9, 4, T.white);

    // monitor
    ctx.fillStyle = T.ink;
    rr(ctx, -24, -112, 48, 36, 3); ctx.fill();
    screen(ctx, -21, -109, 42, 30, t, T.blue500);
    ctx.fillStyle = T.grey500;
    ctx.fillRect(-4, -76, 8, 6);
    ctx.fillRect(-13, -71, 26, 3);

    // laptop de lado
    ctx.fillStyle = T.grey300;
    rr(ctx, 14, -76, 34, 5, 2); ctx.fill();
    ctx.save();
    ctx.translate(16, -76); ctx.rotate(-.36);
    ctx.fillStyle = T.ink; rr(ctx, 0, -24, 31, 24, 2); ctx.fill();
    screen(ctx, 2, -22, 27, 20, t, T.purple600);
    ctx.restore();

    // teclado, mouse, caneca, post-its
    ctx.fillStyle = T.off2; rr(ctx, -46, -76, 26, 6, 2); ctx.fill();
    ctx.fillStyle = T.grey300;
    ctx.beginPath(); ctx.ellipse(-14, -73, 4, 3, .4, 0, 7); ctx.fill();
    ctx.fillStyle = T.purple500; rr(ctx, 32, -82, 10, 11, 2); ctx.fill();
    ctx.strokeStyle = T.purple500; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(44, -76, 3.4, -1.1, 1.1); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(37, -85); ctx.quadraticCurveTo(40 + Math.sin(t * 2) * 2, -92, 37, -99); ctx.stroke();
    ['#f7d774', '#c2a8f9', '#9aabf7'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.save(); ctx.translate(-56 + i * 5, -80 - i * 3); ctx.rotate((h2(seed, i, 2) - .5) * .5);
      ctx.fillRect(-5, -5, 10, 10); ctx.restore();
    });

    // headset pendurado na lateral
    ctx.strokeStyle = T.ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(-66, -52, 11, Math.PI, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = T.ink;
    rr(ctx, -79, -53, 7, 12, 3); ctx.fill();
    rr(ctx, -61, -53, 7, 12, 3); ctx.fill();

    // cadeira
    ctx.fillStyle = T.blue700;
    rr(ctx, 66, -54, 30, 11, 5); ctx.fill();
    rr(ctx, 86, -102, 10, 50, 5); ctx.fill();
    ctx.fillStyle = T.grey500;
    ctx.fillRect(77, -43, 5, 33);
    rr(ctx, 62, -12, 36, 6, 3); ctx.fill();
  },

  /* ==========================================================
     PLANTAS — espécies reais de escritório.
     Vaso de cerâmica fosca comum às duas, para manter a família.
     ========================================================== */
  // a espécie é sorteada pela posição: variedade sem repetir vizinhos
  plant(ctx, t, seed) {
    const pick = h2(seed, 0, 77);
    if (pick < .44) DECO2.pothos(ctx, t, seed);
    else if (pick < .82) DECO2.fern(ctx, t, seed);
    else DECO2.zz(ctx, t, seed);
  },

  /* --- JIBOIA: folha em coração, caules caindo do vaso --- */
  pothos(ctx, t, seed) {
    shadowUnder(ctx, 2, 1, 32, 7.5);
    potCeramic(ctx, 19, 32, '#d9dce6', '#b3b8ca');

    // folha em coração, com nervura e recorte na base
    const heart = (x, y, s, ang, dark) => {
      ctx.save();
      ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
      ctx.fillStyle = dark ? '#2f7d58' : '#49a273';
      ctx.beginPath();
      ctx.moveTo(0, 13);                        // ponta da folha
      ctx.bezierCurveTo(-11, 5, -12, -8, -5, -11);
      ctx.bezierCurveTo(-2, -12.5, -1, -9, 0, -7);
      ctx.bezierCurveTo(1, -9, 2, -12.5, 5, -11);
      ctx.bezierCurveTo(12, -8, 11, 5, 0, 13);
      ctx.closePath(); ctx.fill();
      // variegação clara, marca da jiboia
      ctx.fillStyle = dark ? 'rgba(160,214,150,.3)' : 'rgba(214,236,176,.42)';
      ctx.beginPath();
      ctx.ellipse(-3.4, -2, 3, 5.4, -.4, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(20,60,42,.35)'; ctx.lineWidth = .8;
      ctx.beginPath(); ctx.moveTo(0, 12); ctx.lineTo(0, -8); ctx.stroke();
      ctx.restore();
    };

    // caules que sobem e caules que despencam pela borda
    for (let i = 0; i < 9; i++) {
      const a = h2(seed, i, 1), b = h2(seed, i, 2), c = h2(seed, i, 3);
      const drop = i > 5;                       // os últimos caem para os lados
      const side = (i % 2 ? 1 : -1);
      const sway = Math.sin(t * .7 + i * 1.3) * (drop ? 2.4 : 1.3);

      const x1 = side * (drop ? 16 + a * 16 : 4 + a * 12);
      const y1 = drop ? -26 + b * 12 : -40 - b * 26;
      const cx1 = side * (drop ? 20 : 7), cy1 = -36 - (drop ? 0 : b * 14);

      ctx.strokeStyle = '#3d8a5f'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(side * 3, -30);
      ctx.quadraticCurveTo(cx1 + sway, cy1, x1 + sway, y1);
      ctx.stroke();

      // duas ou três folhas ao longo do caule
      const n = 2 + Math.floor(c * 2);
      for (let k = 0; k < n; k++) {
        const f = (k + 1) / (n + .4);
        const px = side * 3 + (x1 + sway - side * 3) * f;
        const py = -30 + (y1 + 30) * f;
        const sz = (drop ? .62 : .78) + a * .3 - k * .06;
        heart(px, py, sz, (drop ? side * 1.9 : side * .5) + (a - .5) * .7, k % 2 === 0);
      }
    }
  },

  /* --- SAMAMBAIA: fronde composta, muitos folíolos --- */
  fern(ctx, t, seed) {
    shadowUnder(ctx, 2, 1, 34, 8);
    potCeramic(ctx, 17, 26, '#cfd2de', '#a9aec2');

    // uma fronde: raque curva com folíolos dos dois lados
    const frond = (ang, len, sway, dark) => {
      ctx.save();
      ctx.translate(0, -26);
      const tipX = Math.cos(ang) * len + sway;
      const tipY = Math.sin(ang) * len;
      const midX = Math.cos(ang) * len * .5 + sway * .35;
      const midY = Math.sin(ang) * len * .5 - 10;

      ctx.strokeStyle = dark ? '#2b6e4c' : '#3a8a60';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(midX, midY, tipX, tipY);
      ctx.stroke();

      // folíolos: pares cada vez menores rumo à ponta
      const N = 11;
      for (let k = 1; k <= N; k++) {
        const f = k / N;
        const px = 2 * (1 - f) * f * midX + f * f * tipX;
        const py = 2 * (1 - f) * f * midY + f * f * tipY;
        // tangente da curva, para o folíolo sair perpendicular
        const tx = 2 * (1 - f) * (midX) + 2 * f * (tipX - midX);
        const ty = 2 * (1 - f) * (midY) + 2 * f * (tipY - midY);
        const tAng = Math.atan2(ty, tx);
        const size = (1 - f * .72) * 7.5;
        for (const s of [-1, 1]) {
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(tAng + s * 1.05);
          ctx.fillStyle = dark ? '#2f7d54' : (k % 2 ? '#4aa06e' : '#3f9264');
          ctx.beginPath();
          ctx.ellipse(size * .52, 0, size * .55, size * .2, 0, 0, 7);
          ctx.fill();
          ctx.restore();
        }
      }
      ctx.restore();
    };

    // camada de trás, escura; camada da frente, mais clara
    for (let i = 0; i < 7; i++) {
      const a = h2(seed, i, 4);
      const ang = -Math.PI / 2 + (i - 3) * .36 + (a - .5) * .12;
      frond(ang, 40 + a * 14, Math.sin(t * .75 + i) * 2.2, true);
    }
    for (let i = 0; i < 6; i++) {
      const a = h2(seed, i, 5);
      const ang = -Math.PI / 2 + (i - 2.5) * .42 + (a - .5) * .16;
      frond(ang, 48 + a * 18, Math.sin(t * .75 + i * 1.7) * 3, false);
    }
  },

  /* --- ZAMIOCULCA: hastes eretas, folhas grossas e brilhantes --- */
  zz(ctx, t, seed) {
    shadowUnder(ctx, 2, 1, 28, 7);
    potCeramic(ctx, 15, 30, '#c9ccd9', '#a3a8bc');
    for (let i = 0; i < 6; i++) {
      const a = h2(seed, i, 6);
      const side = i % 2 ? 1 : -1;
      const ang = -Math.PI / 2 + (i - 2.5) * .22;
      const len = 46 + a * 22;
      const sway = Math.sin(t * .6 + i) * 1.6;
      const tipX = Math.cos(ang) * len + sway, tipY = -30 + Math.sin(ang) * len;

      ctx.strokeStyle = '#2f6b48'; ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.quadraticCurveTo(Math.cos(ang) * len * .4, -30 + Math.sin(ang) * len * .6,
                           tipX, tipY);
      ctx.stroke();

      for (let k = 1; k <= 5; k++) {
        const f = k / 5.4;
        const px = (tipX) * f, py = -30 + (tipY + 30) * f;
        for (const s of [-1, 1]) {
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(ang + s * .9);
          ctx.fillStyle = k % 2 ? '#357a52' : '#2c6845';
          ctx.beginPath(); ctx.ellipse(6, 0, 6.5, 3.4, 0, 0, 7); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,.2)';
          ctx.beginPath(); ctx.ellipse(5, -1, 3, 1.2, 0, 0, 7); ctx.fill();
          ctx.restore();
        }
      }
    }
  },

  /* --- bebedouro --- */
  cooler(ctx, t, seed) {
    shadowUnder(ctx, 2, 1, 22, 6);
    panel(ctx, -16, -54, 32, 54, 5, T.white);
    ctx.fillStyle = T.blue300;
    ctx.beginPath();
    ctx.moveTo(-12, -54); ctx.lineTo(12, -54); ctx.lineTo(8, -92); ctx.lineTo(-8, -92);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.beginPath();
    ctx.moveTo(-12, -54); ctx.lineTo(-4, -54); ctx.lineTo(-5.4, -92); ctx.lineTo(-8, -92);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = T.blue700; ctx.fillRect(-8, -53, 16, 5);
    ctx.fillStyle = T.grey500; ctx.fillRect(-3.5, -36, 7, 8);
    ctx.fillStyle = T.white;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(19 + i * 7, -12); ctx.lineTo(25 + i * 7, -12);
      ctx.lineTo(24 + i * 7, -2); ctx.lineTo(20 + i * 7, -2);
      ctx.closePath(); ctx.fill();
    }
  },

  /* --- quadro branco com plano do trimestre --- */
  whiteboard(ctx, t, seed) {
    shadowUnder(ctx, 0, 1, 46, 8);
    ctx.fillStyle = T.grey500;
    ctx.fillRect(-5, -44, 10, 44);
    rr(ctx, -38, -8, 76, 7, 3); ctx.fill();
    panel(ctx, -80, -148, 160, 104, 6, T.white);
    ctx.fillStyle = T.blue100;
    ctx.fillRect(-74, -142, 148, 16);
    ctx.fillStyle = T.blue700;
    ctx.fillRect(-70, -137, 46, 6);
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = [T.blue500, T.purple500, T.mint][i];
      const bw = 26 + h2(seed, i, 3) * 22;
      ctx.fillRect(-70, -118 + i * 18, bw, 9);
      ctx.fillStyle = T.grey200;
      ctx.fillRect(-70 + bw, -118 + i * 18, 60 - bw, 9);
    }
    ctx.strokeStyle = T.coral; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.arc(40, -96, 17, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(24, -62); ctx.lineTo(62, -70); ctx.stroke();
    appIcon(ctx, 'ticket', 40, -96, 9, t);
  },

  /* --- relógios de fuso --- */
  clocks(ctx, t, seed) {
    const labels = ['SÃO PAULO', 'CIDADE DO MÉXICO', 'LISBOA', 'SINGAPURA'];
    for (let i = 0; i < 4; i++) {
      const x = -108 + i * 72, y = -158;
      ctx.fillStyle = T.white;
      ctx.beginPath(); ctx.arc(x, y, 24, 0, 7); ctx.fill();
      ctx.strokeStyle = T.blue700; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = T.blue100;
      ctx.beginPath(); ctx.arc(x, y, 20, 0, 7); ctx.fill();
      ctx.fillStyle = T.grey500;
      for (let k = 0; k < 12; k++) {
        const a = k * Math.PI / 6;
        ctx.fillRect(x + Math.cos(a) * 16.5 - .8, y + Math.sin(a) * 16.5 - .8, 1.6, 1.6);
      }
      const hh = t * .16 + i * 1.7, mm = t * .82 + i * 2.3;
      ctx.strokeStyle = T.ink; ctx.lineWidth = 2.8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(hh) * 10, y + Math.sin(hh) * 10); ctx.stroke();
      ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(mm) * 15, y + Math.sin(mm) * 15); ctx.stroke();
      ctx.fillStyle = T.purple500;
      ctx.beginPath(); ctx.arc(x, y, 2.4, 0, 7); ctx.fill();
      ctx.fillStyle = T.grey600;
      ctx.font = '700 8px -apple-system, Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], x, y + 38);
    }
  },

  /* --- impressora --- */
  printer(ctx, t, seed) {
    shadowUnder(ctx, 2, 1, 38, 8);
    panel(ctx, -32, -48, 64, 48, 5, T.off);
    panel(ctx, -28, -74, 56, 28, 4, T.white);
    ctx.fillStyle = T.blue700; ctx.fillRect(-24, -52, 48, 6);
    ctx.fillStyle = T.ink; rr(ctx, 6, -70, 18, 10, 2); ctx.fill();
    screen(ctx, 8, -68, 14, 6, t, T.mint);
    ctx.fillStyle = T.white;
    ctx.beginPath();
    ctx.moveTo(-18, -74); ctx.lineTo(12, -74); ctx.lineTo(14, -98); ctx.lineTo(-16, -98);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = T.grey300; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = T.blue300;
    ctx.fillRect(-12, -94, 20, 3); ctx.fillRect(-12, -88, 14, 3);
    ctx.fillStyle = Math.sin(t * 5) > 0 ? T.coral : T.coralDark;
    ctx.beginPath(); ctx.arc(24, -40, 3.4, 0, 7); ctx.fill();
  },

  /* --- estante de pastas e arquivos --- */
  shelf(ctx, t, seed) {
    shadowUnder(ctx, 2, 1, 54, 9);
    panel(ctx, -50, -116, 100, 116, 5, T.off);
    ctx.fillStyle = T.grey200;
    for (const y of [-80, -44]) ctx.fillRect(-50, y, 100, 5);
    const cols = [T.blue500, T.purple500, T.mint, T.amber, T.blue300];
    for (let s = 0; s < 3; s++) {
      const base = -82 + s * 36;
      for (let i = 0; i < 10; i++) {
        const a = h2(seed, i + s * 10, 4);
        ctx.fillStyle = cols[(i + s) % 5];
        ctx.fillRect(-46 + i * 9.2, base - 28 - a * 3, 7.4, 28 + a * 3);
        ctx.fillStyle = 'rgba(255,255,255,.4)';
        ctx.fillRect(-46 + i * 9.2, base - 24 - a * 3, 7.4, 3);
      }
    }
    // caixa de arquivo em cima
    panel(ctx, -24, -140, 48, 24, 3, T.white);
    ctx.fillStyle = T.blue100; ctx.fillRect(-18, -132, 36, 4);
    appIcon(ctx, 'doc', 0, -128, 7, t);
  },

  /* --- sofá de convivência --- */
  lounge(ctx, t, seed) {
    shadowUnder(ctx, 4, 2, 62, 10);
    ctx.fillStyle = T.grey500;
    ctx.fillRect(-46, -14, 6, 14); ctx.fillRect(40, -14, 6, 14);
    ctx.fillStyle = T.blue700;
    rr(ctx, -52, -34, 104, 22, 8); ctx.fill();
    ctx.fillStyle = T.blue500;
    rr(ctx, -52, -68, 104, 36, 9); ctx.fill();
    ctx.fillStyle = T.purple500;
    rr(ctx, -44, -62, 26, 26, 6); ctx.fill();
    ctx.fillStyle = T.off;
    rr(ctx, 14, -60, 24, 24, 6); ctx.fill();
    // mesinha com café e celular
    ctx.fillStyle = T.grey500; ctx.fillRect(66, -20, 4, 20); ctx.fillRect(90, -20, 4, 20);
    panel(ctx, 60, -26, 40, 7, 3, T.white);
    ctx.fillStyle = T.purple500; rr(ctx, 66, -35, 9, 10, 2); ctx.fill();
    ctx.fillStyle = T.ink; rr(ctx, 84, -31, 8, 13, 2); ctx.fill();
    screen(ctx, 85, -30, 6, 11, t, T.blue400);
  },

  /* --- painel digital de sala --- */
  totem(ctx, t, seed) {
    shadowUnder(ctx, 0, 1, 22, 6);
    ctx.fillStyle = T.grey500;
    ctx.fillRect(-4, -96, 8, 96);
    rr(ctx, -16, -6, 32, 7, 3); ctx.fill();
    ctx.fillStyle = T.ink;
    rr(ctx, -34, -156, 68, 62, 6); ctx.fill();
    screen(ctx, -30, -152, 60, 54, t, T.blue700);
    ctx.fillStyle = T.mint;
    ctx.beginPath(); ctx.arc(-20, -142, 4, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.font = '700 8px -apple-system, Segoe UI, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('LIVRE ATÉ 14:00', -12, -139);
    appIcon(ctx, 'cal', -16, -118, 9, t);
    appIcon(ctx, 'meet', 8, -118, 9, t);
  },

  /* --- rack de dados / data room --- */
  server(ctx, t, seed) {
    shadowUnder(ctx, 2, 1, 32, 7);
    panel(ctx, -26, -120, 52, 120, 5, T.ink, 'rgba(255,255,255,.08)');
    for (let i = 0; i < 7; i++) {
      const y = -112 + i * 16;
      ctx.fillStyle = 'rgba(255,255,255,.06)';
      rr(ctx, -21, y, 42, 12, 2); ctx.fill();
      for (let k = 0; k < 4; k++) {
        const on = h2(seed, i * 4 + k, 6) < .5 + Math.sin(t * 3 + i + k) * .3;
        ctx.fillStyle = on ? (k % 2 ? T.mint : T.blue300) : 'rgba(255,255,255,.12)';
        ctx.fillRect(-17 + k * 7, y + 4, 4, 4);
      }
    }
    appIcon(ctx, 'drive', 0, -138, 12, t);
  },

  /* --- caixas de mudança --- */
  boxes(ctx, t, seed) {
    shadowUnder(ctx, 2, 1, 34, 8);
    ctx.fillStyle = T.amber;
    rr(ctx, -30, -34, 58, 34, 3); ctx.fill();
    ctx.fillStyle = shadeC(T.amber, -.08);
    rr(ctx, 0, -34, 28, 34, 3); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-1, -34); ctx.lineTo(-1, 0); ctx.stroke();
    ctx.fillStyle = shadeC(T.amber, .06);
    rr(ctx, -20, -60, 40, 26, 3); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.font = '700 8px -apple-system, Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LEGAL', 0, -44);
  },

  /* --- cabine de call --- */
  booth(ctx, t, seed) {
    shadowUnder(ctx, 2, 2, 42, 9);
    ctx.fillStyle = T.blue900;
    rr(ctx, -40, -130, 80, 130, 8); ctx.fill();
    ctx.fillStyle = 'rgba(223,229,252,.3)';
    rr(ctx, -33, -120, 66, 96, 5); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.22)';
    ctx.beginPath();
    ctx.moveTo(-30, -118); ctx.lineTo(-8, -118); ctx.lineTo(-26, -26); ctx.lineTo(-31, -26);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = T.purple500;
    rr(ctx, -40, -136, 80, 10, 4); ctx.fill();
    ctx.fillStyle = T.grey300;
    ctx.fillRect(28, -78, 5, 18);
    appIcon(ctx, 'meet', 0, -68, 13, t);
  },

  /* --- vão de luz da janela --- */
  window(ctx, t, seed) {
    const g = ctx.createLinearGradient(0, -280, 0, 0);
    g.addColorStop(0, 'rgba(255,253,244,.2)');
    g.addColorStop(1, 'rgba(255,253,244,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-58, -280); ctx.lineTo(58, -280); ctx.lineTo(96, 0); ctx.lineTo(-20, 0);
    ctx.closePath(); ctx.fill();
    // poeira dançando na luz
    for (let i = 0; i < 9; i++) {
      const a = h2(seed, i, 8), b = h2(seed, i, 9);
      ctx.fillStyle = `rgba(255,255,255,${.22 + a * .3})`;
      ctx.beginPath();
      ctx.arc(-40 + a * 110 + Math.sin(t * .5 + i) * 7,
              -240 + ((b * 240 + t * 12) % 240), 1.6 + b, 0, 7);
      ctx.fill();
    }
  }
};

function drawDeco(ctx, d, t) {
  ctx.save();
  ctx.translate(d.x, GROUND_Y);
  (DECO2[d.kind] || DECO2.plant)(ctx, t, d.seed);
  ctx.restore();
}
