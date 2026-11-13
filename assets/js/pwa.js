/* Meu Espaço — ponte com o navegador para o modo aplicativo (PWA).

   Este arquivo só fala com o navegador: registra o service worker, guarda o convite de instalação e avisa
   o app (app.js) por eventos. Quem desenha botões e avisos é o app.js.

   Eventos disparados em window:
     pwa:mudou       o convite de instalação apareceu ou sumiu
     pwa:instalado   o app foi instalado
     pwa:atualizacao há uma versão nova esperando (detail: o registro do worker)  */
(function () {
  'use strict';
  const aviso = (nome, detail) => window.dispatchEvent(new CustomEvent(nome, { detail }));
  const ehIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const modoApp = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;

  const PWA = window.PWA = {
    convite: null,
    ios: ehIOS,
    get instalado() { return modoApp(); },
    get instalavel() { return !!PWA.convite; },
    registro: null,
    atualizacaoPronta: false,
    /** Abre o convite nativo de instalação. Devolve 'accepted', 'dismissed' ou 'indisponivel'. */
    async instalar() {
      if (!PWA.convite) return 'indisponivel';
      const c = PWA.convite; PWA.convite = null; aviso('pwa:mudou');
      c.prompt();
      try { return (await c.userChoice).outcome; } catch (e) { return 'dismissed'; }
    },
    /** Pede ao navegador para procurar uma versão nova agora. */
    async procurarAtualizacao() {
      if (!PWA.registro) return false;
      try { await PWA.registro.update(); } catch (e) { return false; }
      return PWA.atualizacaoPronta;
    },
    /** Troca para a versão que está esperando e recarrega. */
    aplicarAtualizacao() {
      const espera = PWA.registro && PWA.registro.waiting;
      if (!espera) return location.reload();
      aplicando = true;
      espera.postMessage('SKIP_WAITING');
    }
  };

  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); PWA.convite = e; aviso('pwa:mudou'); });
  window.addEventListener('appinstalled', () => { PWA.convite = null; aviso('pwa:instalado'); aviso('pwa:mudou'); });
  if (window.matchMedia) {
    const mq = matchMedia('(display-mode: standalone)');
    (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(() => aviso('pwa:mudou'));
  }

  // Service worker só roda em https ou localhost; em file:// o app funciona como sempre, sem modo offline.
  const seguro = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (!('serviceWorker' in navigator) || !seguro) return;

  let aplicando = false;
  const avisarAtualizacao = (reg) => { PWA.atualizacaoPronta = true; aviso('pwa:atualizacao', reg); };

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then((reg) => {
      PWA.registro = reg;
      if (reg.waiting && navigator.serviceWorker.controller) avisarAtualizacao(reg);
      reg.addEventListener('updatefound', () => {
        const novo = reg.installing;
        if (!novo) return;
        novo.addEventListener('statechange', () => { if (novo.state === 'installed' && navigator.serviceWorker.controller) avisarAtualizacao(reg); });
      });
      // Procura versão nova ao voltar para a aba e de hora em hora.
      document.addEventListener('visibilitychange', () => { if (!document.hidden) reg.update().catch(() => {}); });
      setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
    }).catch(() => { /* sem service worker o app segue normal */ });

    // Só recarrega quando a pessoa aceitou atualizar; a primeira instalação não pode recarregar a página.
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (aplicando) location.reload(); });
  });
})();
