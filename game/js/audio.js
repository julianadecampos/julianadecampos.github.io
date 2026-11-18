/* ============================================================
   SFX — sons de arcade sintetizados na hora (sem arquivos)
   Tudo discreto: o jogo roda numa sala de reunião.
   ============================================================ */

const SFX = (() => {
  let ac = null, master = null, muted = false, ready = false;

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain();
    master.gain.value = 0.16;
    const soften = ac.createBiquadFilter();      // tira o brilho agressivo
    soften.type = 'lowpass';
    soften.frequency.value = 5200;
    soften.Q.value = 0.6;
    master.connect(soften).connect(ac.destination);
    ready = true;
  }

  const now = () => ac.currentTime;
  const on = () => ready && !muted && ac && ac.state === 'running';

  /* --- bloco básico: um oscilador com envelope --- */
  function tone({ freq, type = 'square', dur = .12, vol = .5, at = 0,
                  slideTo = null, detune = 0 }) {
    if (!on()) return;
    const t0 = now() + at;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    o.detune.value = detune;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(master);
    o.start(t0); o.stop(t0 + dur + .02);
  }

  /* --- ruído filtrado: vapor, papel, whoosh --- */
  function noise({ dur = .3, vol = .3, at = 0, type = 'bandpass',
                   freq = 1200, q = 1, sweepTo = null }) {
    if (!on()) return;
    const t0 = now() + at;
    const len = Math.max(1, Math.floor(ac.sampleRate * dur));
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const f = ac.createBiquadFilter();
    f.type = type; f.frequency.setValueAtTime(freq, t0); f.Q.value = q;
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t0 + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(master);
    src.start(t0); src.stop(t0 + dur + .02);
  }

  /* ============================================================
     MÚSICA — lo-fi jazz em 8 bits.
     Um agendador toca compasso a compasso; como tudo é gerado
     a partir de um contador, o loop não tem emenda audível.
     ============================================================ */
  let musicGain = null, musicTimer = null, bar = 0, nextTime = 0, playing = false;

  /* Clima: jazz noir corporativo, lento e espaçado — a sala branca
     de Severance traduzida para 8 bits. Menos notas, mais silêncio. */
  const BPM = 61;
  const BEAT = 60 / BPM;
  const SWING = .19;

  // Ré menor com cores modais: a progressão não resolve, e é de propósito
  const PROG = [
    { root: 38, ch: [53, 57, 60, 64] },    // Dm9
    { root: 34, ch: [50, 57, 60, 65] },    // Bbmaj7#11
    { root: 36, ch: [51, 55, 58, 62] },    // Cm9
    { root: 33, ch: [52, 57, 60, 63] }     // A7(b13) — pede volta ao Dm
  ];

  // frases longas e esparsas, uma por par de compassos
  const PHRASES = [
    [[0, 69, 2.4], [2.5, 67, 1.2]],
    [[1, 65, 1.6], [3, 62, 1.6]],
    [[0, 72, 1.8], [2, 70, .9], [3, 69, 1.4]],
    [[1.5, 65, 1.1], [2.5, 64, 2.2]]
  ];
  const hz = (n) => 440 * Math.pow(2, (n - 69) / 12);

  /* eco curto: dá ar de sala grande sem precisar de reverb */
  let echo = null;
  function makeEcho() {
    const d = ac.createDelay(1.2);
    d.delayTime.value = BEAT * .75;
    const fb = ac.createGain(); fb.gain.value = .32;
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1500;
    const wet = ac.createGain(); wet.gain.value = .3;
    d.connect(lp).connect(fb).connect(d);
    d.connect(wet).connect(musicGain);
    return d;
  }

  function voice(type, freq, at, dur, vol, opts = {}) {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, at);
    if (opts.glide) o.frequency.exponentialRampToValueAtTime(opts.glide, at + dur);
    if (opts.detune) o.detune.value = opts.detune;
    const atk = opts.atk === undefined ? .012 : opts.atk;
    g.gain.setValueAtTime(.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + atk);
    g.gain.exponentialRampToValueAtTime(.0001, at + dur);
    o.connect(g);
    g.connect(musicGain);
    if (opts.echo && echo) g.connect(echo);
    o.start(at); o.stop(at + dur + .05);
  }

  /* vibrafone de 8 bits: duas ondas levemente desafinadas, ataque macio */
  function bell(freq, at, dur, vol) {
    voice('sine', freq, at, dur, vol, { atk: .03, echo: true });
    voice('triangle', freq * 2, at, dur * .55, vol * .3, { atk: .02, detune: 6, echo: true });
  }

  function drum(kind, at) {
    if (kind === 'kick') {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(96, at);
      o.frequency.exponentialRampToValueAtTime(38, at + .13);
      g.gain.setValueAtTime(.24, at);
      g.gain.exponentialRampToValueAtTime(.0001, at + .2);
      o.connect(g).connect(musicGain);
      o.start(at); o.stop(at + .24);
      return;
    }
    if (kind === 'rim') {                  // aro seco, quase um estalo
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(420, at);
      g.gain.setValueAtTime(.13, at);
      g.gain.exponentialRampToValueAtTime(.0001, at + .05);
      o.connect(g).connect(musicGain);
      if (echo) g.connect(echo);
      o.start(at); o.stop(at + .07);
      return;
    }
    // vassourinha: chiado longo e suave, não um chimbal marcado
    const len = kind === 'brush' ? .22 : .05;
    const b = ac.createBuffer(1, Math.ceil(ac.sampleRate * len), ac.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      const env = kind === 'brush' ? Math.sin(Math.PI * i / d.length) : (1 - i / d.length);
      d[i] = (Math.random() * 2 - 1) * env;
    }
    const src = ac.createBufferSource(); src.buffer = b;
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = kind === 'brush' ? 4200 : 7000;
    f.Q.value = .5;
    const g = ac.createGain();
    g.gain.setValueAtTime(kind === 'brush' ? .05 : .07, at);
    g.gain.exponentialRampToValueAtTime(.0001, at + len);
    src.connect(f).connect(g).connect(musicGain);
    src.start(at); src.stop(at + len + .02);
  }

  function scheduleBar(b, t0) {
    const c = PROG[b % PROG.length];

    /* Contrabaixo: fundamental no tempo 1, quinta no 3.
       Duas notas por compasso — o vazio é parte do arranjo. */
    voice('triangle', hz(c.root), t0, BEAT * 1.5, .19, { atk: .03 });
    voice('triangle', hz(c.root + 7), t0 + BEAT * 2.5, BEAT * 1.1, .14, { atk: .03 });

    /* Acorde no piano elétrico: um só por compasso, deixado ressoar */
    const at = t0 + BEAT * .5 + SWING * BEAT;
    c.ch.forEach((n, k) =>
      voice('square', hz(n), at + k * .022, BEAT * 2.2, .028, { atk: .05, echo: true }));

    /* Bateria com vassourinha: sem chimbal marcando o tempo todo.
       Bumbo discreto no 1, aro no 3, chiado leve no contratempo. */
    drum('kick', t0);
    drum('rim', t0 + BEAT * 2);
    if (b % 2 === 1) drum('rim', t0 + BEAT * 3.5 + SWING * BEAT);
    drum('brush', t0 + BEAT * 1.5 + SWING * BEAT);
    drum('brush', t0 + BEAT * 3.5 + SWING * BEAT);

    /* Melodia: uma frase longa a cada dois compassos, em vibrafone */
    if (b % 2 === 0) {
      const phrase = PHRASES[(b / 2) % PHRASES.length];
      for (const [pos, note, len] of phrase) {
        const sw = (pos % 1) ? SWING * BEAT : 0;
        bell(hz(note), t0 + pos * BEAT + sw, BEAT * len, .09);
      }
    }

    /* Acorde grave sustentado: o zumbido do prédio vazio */
    if (b % 4 === 0)
      voice('sine', hz(c.root - 12), t0, BEAT * 8, .055, { atk: .6 });
  }

  function tick() {
    if (!ac || !playing) return;
    while (nextTime < ac.currentTime + .25) {
      scheduleBar(bar, nextTime);
      nextTime += BEAT * 4;
      bar = (bar + 1) % 8;
    }
  }

  function musicStart() {
    if (!ready || playing) return;
    if (!musicGain) {
      musicGain = ac.createGain();
      musicGain.gain.value = muted ? 0 : .62;
      const warm = ac.createBiquadFilter();       // tira o brilho: lo-fi
      warm.type = 'lowpass';
      warm.frequency.value = 2200;
      warm.Q.value = .4;
      musicGain.connect(warm).connect(master);
      echo = makeEcho();
    }
    playing = true;
    bar = 0;
    nextTime = ac.currentTime + .1;
    tick();
    musicTimer = setInterval(tick, 40);
  }

  function musicStop() {
    playing = false;
    clearInterval(musicTimer);
  }

  const api = {
    init,
    setMuted(v) {
      muted = v;
      if (musicGain) musicGain.gain.setTargetAtTime(v ? 0 : .62, ac.currentTime, .05);
    },
    isMuted: () => muted,
    musicStart, musicStop,
    setMusicVolume(v) {
      if (musicGain) musicGain.gain.setTargetAtTime(muted ? 0 : v, ac.currentTime, .05);
    },

    /* interface */
    click() { tone({ freq: 660, dur: .05, vol: .34, type: 'square' });
              tone({ freq: 990, dur: .04, vol: .18, at: .03, type: 'square' }); },

    hover() { tone({ freq: 880, dur: .03, vol: .1, type: 'triangle' }); },

    open()  { tone({ freq: 523, dur: .08, vol: .3, type: 'square' });
              tone({ freq: 784, dur: .1,  vol: .26, at: .06, type: 'square' }); },

    close() { tone({ freq: 620, dur: .07, vol: .22, type: 'square' });
              tone({ freq: 415, dur: .09, vol: .2,  at: .05, type: 'square' }); },

    rotate() { noise({ dur: .26, vol: .2, type: 'bandpass', freq: 500, sweepTo: 2400, q: 1.4 });
               tone({ freq: 340, slideTo: 620, dur: .22, vol: .12, type: 'triangle' }); },

    step() { tone({ freq: 150 + Math.random() * 28, dur: .035, vol: .07, type: 'triangle' }); },

    /* plataforma */
    jump()  { tone({ freq: 380, slideTo: 720, dur: .14, vol: .26, type: 'square' }); },

    stomp() { tone({ freq: 620, slideTo: 180, dur: .13, vol: .3, type: 'square' });
              noise({ dur: .12, vol: .16, freq: 1200, q: .8 }); },

    coffee(){ tone({ freq: 880, dur: .07, vol: .24, type: 'square' });
              tone({ freq: 1320, dur: .1, vol: .2, at: .06, type: 'square' }); },

    hurt()  { tone({ freq: 440, slideTo: 110, dur: .42, vol: .32, type: 'sawtooth' });
              tone({ freq: 220, slideTo: 70,  dur: .46, vol: .2, at: .04, type: 'square' }); },

    urgent(){ tone({ freq: 1180, dur: .06, vol: .2, type: 'square' });
              tone({ freq: 1180, dur: .06, vol: .2, at: .1, type: 'square' }); },

    /* power-up */
    power() {
      [523, 659, 784, 1046, 1318, 1568].forEach((f, i) =>
        tone({ freq: f, dur: .16, vol: .3, at: i * .045, type: 'square' }));
      tone({ freq: 220, slideTo: 880, dur: .35, vol: .16, type: 'triangle' });
    },
    powerEnd() {
      [784, 587, 440].forEach((f, i) =>
        tone({ freq: f, dur: .13, vol: .18, at: i * .07, type: 'square' }));
    },

    /* estações */
    wrong() { tone({ freq: 300, slideTo: 150, dur: .22, vol: .32, type: 'sawtooth' });
              tone({ freq: 151, slideTo: 92,  dur: .24, vol: .2, at: .02, type: 'square' }); },

    reveal() {                                    // o robô aparece
      [523, 659, 784, 1046].forEach((f, i) =>
        tone({ freq: f, dur: .3, vol: .2, at: i * .07, type: 'triangle' }));
      noise({ dur: .5, vol: .1, freq: 2000, sweepTo: 5000, at: .1 });
    },

    win() {
      [523, 659, 784, 1046, 1318].forEach((f, i) =>
        tone({ freq: f, dur: .26, vol: .3, at: i * .085, type: 'square' }));
      [261, 329, 392].forEach((f, i) =>
        tone({ freq: f, dur: .8, vol: .14, at: .34 + i * .01, type: 'triangle' }));
    },

    /* um barulhinho característico por estação */
    station(id) {
      switch (id) {
        case 'vendas':                            // e-mail sendo reencaminhado
          noise({ dur: .3, vol: .16, freq: 900, sweepTo: 2600, q: .8 });
          tone({ freq: 880, dur: .07, vol: .22, at: .2, type: 'square' });
          tone({ freq: 1174, dur: .09, vol: .18, at: .26, type: 'square' });
          break;
        case 'gchat':                             // pop de notificação, duas vezes
          tone({ freq: 740, slideTo: 1180, dur: .09, vol: .26, type: 'sine' });
          tone({ freq: 700, slideTo: 1100, dur: .09, vol: .2, at: .17, type: 'sine' });
          break;
        case 'email':                             // impressora reclamando
          tone({ freq: 1046, dur: .07, vol: .24, type: 'square' });
          tone({ freq: 1046, dur: .07, vol: .24, at: .13, type: 'square' });
          noise({ dur: .38, vol: .13, freq: 420, sweepTo: 240, q: 2, at: .22 });
          break;
        case 'ferias':                            // vapor da máquina de café
          noise({ dur: .62, vol: .17, type: 'highpass', freq: 2200, sweepTo: 4200 });
          tone({ freq: 392, dur: .16, vol: .12, at: .42, type: 'triangle' });
          break;
        case 'ninguem':                           // papelada
          noise({ dur: .18, vol: .16, freq: 3000, q: .6 });
          noise({ dur: .16, vol: .13, freq: 2400, q: .6, at: .16 });
          noise({ dur: .2,  vol: .11, freq: 3400, q: .6, at: .3 });
          break;
        case 'ia':                                // robô ligando
          tone({ freq: 220, slideTo: 880, dur: .3, vol: .2, type: 'triangle' });
          tone({ freq: 1320, dur: .12, vol: .16, at: .3, type: 'sine' });
          break;
        case 'portal':                            // portal abrindo
          [196, 262, 330].forEach((f, i) =>
            tone({ freq: f, dur: .5, vol: .2, at: i * .05, type: 'triangle' }));
          noise({ dur: .5, vol: .1, freq: 600, sweepTo: 3000 });
          break;
      }
    }
  };
  return api;
})();
