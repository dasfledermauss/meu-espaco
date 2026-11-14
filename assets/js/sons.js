/* Tyba — universo sonoro. Sons curtos e suaves feitos na hora (Web Audio): sem arquivos, funcionam offline.
   Uso: SONS.tocar('guardar'). Liga/desliga e volume ficam em Configurações (perfil.somUI e perfil.somVolume). */
(function () {
  'use strict';
  let ctx = null;
  const cfg = { ligado: true, volume: 40 };

  // Cada som é uma lista de notas: [início (s), frequência inicial, frequência final, duração (s), onda, ganho]
  const SONS = {
    guardar:   [[0, 523, 523, .11, 'sine', 1], [.09, 784, 784, .2, 'sine', 1]],
    concluir:  [[0, 523, 523, .1, 'triangle', .9], [.08, 659, 659, .1, 'triangle', .9], [.16, 784, 784, .24, 'triangle', .9]],
    favoritar: [[0, 880, 880, .12, 'sine', .8], [.07, 1319, 1319, .26, 'sine', .7]],
    desfazer:  [[0, 494, 392, .16, 'sine', .8]],
    excluir:   [[0, 262, 147, .22, 'triangle', 1]],
    abrir:     [[0, 660, 700, .06, 'sine', .45]],
    logo:      [[0, 659, 659, .09, 'sine', .8], [.08, 880, 880, .09, 'sine', .8], [.16, 1175, 1175, .26, 'sine', .7]]
  };

  function motor() {
    if (ctx) return ctx;
    const A = window.AudioContext || window.webkitAudioContext;
    if (!A) return null;
    ctx = new A();
    return ctx;
  }

  function tocar(nome) {
    if (!cfg.ligado || cfg.volume <= 0 || !SONS[nome]) return;
    try {
      const c = motor(); if (!c) return;
      if (c.state === 'suspended') c.resume();
      const t0 = c.currentTime + .005, mestre = Math.pow(cfg.volume / 100, 1.6) * .35;
      SONS[nome].forEach(([d, f0, f1, dur, onda, g]) => {
        const o = c.createOscillator(), v = c.createGain(), f = c.createBiquadFilter();
        o.type = onda; o.frequency.setValueAtTime(f0, t0 + d);
        if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t0 + d + dur);
        f.type = 'lowpass'; f.frequency.value = 3200;
        v.gain.setValueAtTime(.0001, t0 + d);
        v.gain.exponentialRampToValueAtTime(Math.max(.0002, mestre * g), t0 + d + .012);
        v.gain.exponentialRampToValueAtTime(.0001, t0 + d + dur);
        o.connect(f); f.connect(v); v.connect(c.destination); o.start(t0 + d); o.stop(t0 + d + dur + .03);
      });
    } catch (e) { /* sem áudio: segue sem som */ }
  }

    /* ---------------- Sons ambiente (chuva, vento, fogo, mato, ruído marrom e branco) ----------------
     Cada camada é um ruído filtrado em laço, com volume próprio (0–100). Tudo gerado na hora. */
  const CAMADAS = [['chuva', 'Chuva'], ['vento', 'Vento'], ['fogo', 'Fogo'], ['mato', 'Mato'], ['marrom', 'Ruído marrom'], ['branco', 'Ruído branco']];
  const amb = { niveis: { chuva: 50, vento: 25, fogo: 0, mato: 0, marrom: 0, branco: 0 }, geral: 70, tocando: false, no: null, buffers: null };

  /* Para não dar para ouvir o laço: (1) o fim se mistura com o começo (sem queda de volume),
     (2) cada camada toca dois trechos longos de tamanhos diferentes ao mesmo tempo, então a repetição nunca coincide. */
  function criarBuffer(c, seg, preencher, emenda) {
    const sr = c.sampleRate, n = Math.floor(seg * sr), f = emenda ? Math.floor(sr * 1.5) : 0;
    const bruto = new Float32Array(n + f); preencher(bruto, n + f, sr);
    const b = c.createBuffer(1, n, sr), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = bruto[i];
    for (let i = 0; i < f; i++) { const r = i / f; d[i] = bruto[i] * Math.sin(r * Math.PI / 2) + bruto[n + i] * Math.cos(r * Math.PI / 2); }
    return b;
  }
  const geraBranco = (d, n) => { for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; };
  const geraMarrom = (d, n) => { let l = 0; for (let i = 0; i < n; i++) { l = (l + .02 * (Math.random() * 2 - 1)) / 1.02; d[i] = l * 3.5; } };
  const geraEstalos = (taxa) => (d, n, sr) => {
    const eventos = Math.floor(taxa * (n / sr));
    for (let e = 0; e < eventos; e++) {
      const p0 = Math.floor(Math.random() * (n - 800)), a = .2 + Math.random() * .8, len = 40 + Math.floor(Math.random() * 360);
      for (let k = 0; k < len; k++) d[p0 + k] += (Math.random() * 2 - 1) * a * Math.exp(-k / (len / 4));
    }
  };
  const geraGrilos = (seg) => (d, n, sr) => {
    [4150, 4480, 4700, 5050].forEach((f) => {
      const taxa = 1.7 + Math.random() * 1.6, total = Math.floor(taxa * seg);
      for (let m = 0; m < total; m++) {
        const t0 = (m / taxa) + (Math.random() - .5) * .12;
        for (let pulso = 0; pulso < 3; pulso++) {
          const ini = Math.floor((t0 + pulso * .024) * sr), len = Math.floor(.012 * sr);
          for (let k = 0; k < len; k++) { const j = ((ini + k) % n + n) % n; d[j] += Math.sin(2 * Math.PI * f * k / sr) * Math.pow(Math.sin(Math.PI * k / len), 2) * .09; }
        }
      }
    });
  };
  function buffersAmbiente(c) {
    if (amb.buffers && amb.buffers.sr === c.sampleRate) return amb.buffers;
    amb.buffers = {
      sr: c.sampleRate,
      branco: [criarBuffer(c, 13, geraBranco, true), criarBuffer(c, 17, geraBranco, true)],
      marrom: [criarBuffer(c, 13, geraMarrom, true), criarBuffer(c, 17, geraMarrom, true)],
      estalos: [criarBuffer(c, 19, geraEstalos(9)), criarBuffer(c, 23, geraEstalos(9))],
      grilos: [criarBuffer(c, 19, geraGrilos(19)), criarBuffer(c, 23, geraGrilos(23))]
    };
    return amb.buffers;
  }
  const curva = (v) => Math.pow(Math.max(0, Math.min(100, v)) / 100, 2);

  function montarAmbiente(c) {
    const B = buffersAmbiente(c), parar = [], mestre = c.createGain();
    mestre.gain.value = 0; mestre.connect(c.destination);
    const filtro = (tipo, f, q) => { const x = c.createBiquadFilter(); x.type = tipo; x.frequency.value = f; if (q) x.Q.value = q; return x; };
    const ganho = (v) => { const x = c.createGain(); x.gain.value = v; return x; };
    // duas fontes de tamanhos diferentes, começando em pontos aleatórios, somadas num ganho só
    const par = (bufs) => {
      const g = ganho(.72);
      bufs.forEach((buf) => { const s = c.createBufferSource(); s.buffer = buf; s.loop = true; s.connect(g); s.start(0, Math.random() * buf.duration); parar.push(s); });
      return g;
    };
    const lfo = (hz, prof, alvo) => { const o = c.createOscillator(), g = ganho(prof); o.frequency.value = hz; o.connect(g); g.connect(alvo); o.start(); parar.push(o); };
    const camadas = {};
    CAMADAS.forEach(([id]) => { camadas[id] = ganho(0); camadas[id].connect(mestre); });

    // chuva: ruído branco sem os graves e sem o chiado agudo
    par(B.branco).connect(filtro('highpass', 700)).connect(filtro('lowpass', 7500)).connect(ganho(.6)).connect(camadas.chuva);
    // vento: ruído marrom com um filtro que passeia devagar
    const vf = filtro('bandpass', 420, .8), vg = ganho(.7);
    par(B.marrom).connect(vf); vf.connect(vg); vg.connect(camadas.vento);
    lfo(.07, 260, vf.frequency); lfo(.11, .3, vg.gain); lfo(.031, 120, vf.frequency);
    // fogo: ronco grave que oscila + estalos
    const fg = ganho(.8);
    par(B.marrom).connect(filtro('lowpass', 450)).connect(fg).connect(camadas.fogo); lfo(.19, .2, fg.gain);
    par(B.estalos).connect(filtro('highpass', 1400)).connect(ganho(1)).connect(camadas.fogo);
    // mato: grilos + folhas mexendo
    par(B.grilos).connect(ganho(1)).connect(camadas.mato);
    const folha = ganho(.05); par(B.branco).connect(filtro('bandpass', 3200, .7)).connect(folha).connect(camadas.mato); lfo(.13, .04, folha.gain);
    // marrom e branco puros
    par(B.marrom).connect(camadas.marrom);
    par(B.branco).connect(filtro('lowpass', 12000)).connect(ganho(.4)).connect(camadas.branco);
    return { mestre, camadas, parar };
  }

  function aplicarNiveis(rapido) {
    if (!amb.no || !ctx) return;
    const t = ctx.currentTime, tc = rapido ? .02 : .15;
    CAMADAS.forEach(([id]) => amb.no.camadas[id].gain.setTargetAtTime(curva(amb.niveis[id] || 0), t, tc));
    amb.no.mestre.gain.setTargetAtTime(amb.tocando ? Math.pow(amb.geral / 100, 1.5) * .55 : 0, t, .4);
  }
  const AMBIENTE = {
    camadas: CAMADAS,
    definir(niveis, geral) { Object.assign(amb.niveis, niveis || {}); if (geral != null) amb.geral = geral; aplicarNiveis(true); },
    nivel(id, v) { amb.niveis[id] = +v; aplicarNiveis(true); },
    geral(v) { amb.geral = +v; aplicarNiveis(true); },
    niveis: () => Object.assign({}, amb.niveis),
    volumeGeral: () => amb.geral,
    tocando: () => amb.tocando,
    ligar() {
      const c = motor(); if (!c) return false;
      if (c.state === 'suspended') c.resume();
      if (!amb.no) amb.no = montarAmbiente(c);
      amb.tocando = true; aplicarNiveis(false); return true;
    },
    parar() {
      amb.tocando = false; aplicarNiveis(false);
      const no = amb.no; amb.no = null;
      if (no) setTimeout(() => { no.parar.forEach((x) => { try { x.stop(); } catch (e) { /* já parado */ } }); try { no.mestre.disconnect(); } catch (e) { /* ok */ } }, 1800);
    }
  };

  window.SONS = {
    ambiente: AMBIENTE,
    tocar,
    config(ligado, volume) { cfg.ligado = ligado !== false; cfg.volume = Number.isFinite(+volume) ? Math.max(0, Math.min(100, +volume)) : 40; },
    ligado: () => cfg.ligado,
    volume: () => cfg.volume
  };
})();
