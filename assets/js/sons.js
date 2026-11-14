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

  window.SONS = {
    tocar,
    config(ligado, volume) { cfg.ligado = ligado !== false; cfg.volume = Number.isFinite(+volume) ? Math.max(0, Math.min(100, +volume)) : 40; },
    ligado: () => cfg.ligado,
    volume: () => cfg.volume
  };
})();
