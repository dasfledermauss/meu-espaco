/* Meu Espaço — service worker.

   O que faz:
   - guarda o "casco" do app (HTML, CSS, JS, fontes, ícones) para abrir sem internet;
   - abre sempre a versão nova da página quando há rede e cai para a guardada quando não há;
   - nunca mexe em /api/, em pedidos que não sejam GET nem em outros sites (Google, Firebase, YouTube);
   - espera a pessoa aceitar a atualização antes de trocar de versão.

   A versão do cache vem da primeira entrada de assets/js/atualizacoes.js, a mesma que alimenta o popup de
   novidades. Como a regra do projeto é registrar toda mudança ali, cada versão nova troca o cache sozinha. */
self.window = self;
importScripts('assets/js/atualizacoes.js');

const VERSAO = (self.ATUALIZACOES && self.ATUALIZACOES[0] && self.ATUALIZACOES[0].versao) || '0';
const CACHE = 'meu-espaco-' + VERSAO;

/* Sem isto o app não abre: se algum falhar, a instalação do worker falha e a versão antiga continua valendo. */
const ESSENCIAIS = [
  'index.html', 'manifest.webmanifest',
  'assets/css/estilo.css',
  'assets/js/config.js', 'assets/js/icones.js', 'assets/js/atualizacoes.js', 'assets/js/pet-frases.js', 'assets/js/sons.js', 'assets/js/nuvem.js', 'assets/js/app.js', 'assets/js/pwa.js',
  'assets/fonts/lexend.woff2', 'assets/fonts/lexend-ext.woff2',
  'assets/img/pwa/icone-192.png', 'assets/img/pwa/icone-512.png', 'assets/img/pwa/icone.svg', 'assets/img/foto-perfil.jpg', 'assets/img/tyba-logo.svg', 'assets/img/tyba-logo-2.svg', 'assets/fonts/lora.woff2', 'assets/fonts/lora-ext.woff2', 'assets/img/pet/salsicha.png', 'assets/img/stickers/bolo.svg', 'assets/img/stickers/viagem.svg', 'assets/img/stickers/saude.svg', 'assets/img/stickers/trabalho.svg', 'assets/img/stickers/festa.svg', 'assets/img/stickers/coracao.svg', 'assets/img/stickers/estrela.svg', 'assets/img/pet/pinscher.png', 'assets/img/pet/frajola.png', 'assets/img/pet/shollie.png'
];
/* Bom ter, mas só carregados quando alguém abre um PDF: entram se der, sem derrubar a instalação. */
const OPCIONAIS = ['assets/vendor/pdf.min.mjs', 'assets/vendor/pdf.worker.min.mjs', 'assets/img/pwa/icone-maskable-512.png'];

const baixar = (url) => new Request(url, { cache: 'reload' });

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ESSENCIAIS.map(baixar));
    await Promise.allSettled(OPCIONAIS.map((u) => cache.add(baixar(u))));
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const nomes = await caches.keys();
    await Promise.all(nomes.filter((n) => n.startsWith('meu-espaco-') && n !== CACHE).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

/* A página pede a troca de versão depois que a pessoa toca em "Atualizar". */
self.addEventListener('message', (e) => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });

self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.includes('/api/')) return;

  // Abrir o app: rede primeiro (versão mais nova), cópia guardada se estiver sem internet.
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const r = await fetch(req);
        if (r.ok) { const c = await caches.open(CACHE); c.put('index.html', r.clone()); }
        return r;
      } catch (err) {
        return (await caches.match('index.html', { ignoreSearch: true })) || Response.error();
      }
    })());
    return;
  }

  // Fontes e bibliotecas não mudam: cópia guardada primeiro.
  if (/\/assets\/(fonts|vendor)\//.test(url.pathname)) {
    e.respondWith((async () => (await caches.match(req)) || fetchEGuarda(req))());
    return;
  }

  // O resto (CSS, JS, imagens): mostra o que está guardado e atualiza por trás.
  e.respondWith((async () => {
    const guardado = await caches.match(req);
    const rede = fetchEGuarda(req).catch(() => null);
    return guardado || (await rede) || Response.error();
  })());
});

async function fetchEGuarda(req) {
  const r = await fetch(req);
  if (r.ok && r.type === 'basic') { const c = await caches.open(CACHE); c.put(req, r.clone()); }
  return r;
}
