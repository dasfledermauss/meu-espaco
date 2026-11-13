# Aplicativo (PWA)

O Meu Espaço é um PWA: instala como app, abre em janela própria e funciona sem internet.

## Peças

| Arquivo | Função |
|---|---|
| `manifest.webmanifest` | Nome, ícones, cores, atalhos do ícone e destino de compartilhamento. |
| `sw.js` | Service worker: guarda o app em cache e serve offline. A versão do cache vem de `ATUALIZACOES[0].versao`, então **cada nova versão em `atualizacoes.js` renova o cache** automaticamente. |
| `assets/js/pwa.js` | Registra o service worker, guarda o convite de instalação e avisa o app (`window.PWA`). |
| `assets/img/pwa/` | Ícones (SVG, 192, 512, maskable, Apple touch, favicon). |
| `app.js` | Botões “Instalar o app”, cartão Aplicativo em Configurações, avisos de atualização/offline, `tratarEntrada()`. |

## Cache

- Páginas: rede primeiro, cache se estiver offline.
- Fontes e PDF.js: cache primeiro.
- Demais arquivos: servem do cache e atualizam em segundo plano.
- `/api/*` e outros domínios (Firebase, YouTube) nunca passam pelo cache.

## Instalar

- **Chrome/Edge/Android:** “Instalar o app” no menu da foto ou em Configurações → Aplicativo.
- **iPhone/iPad:** Safari → Compartilhar → Adicionar à Tela de Início (o app mostra o passo a passo).
- O service worker só roda em **https** ou **localhost**; no Vercel funciona direto.

## Atalhos e compartilhamento

- `#/novo/nota`, `#/novo/tarefa`, `#/novo/imagem`, `#/novo/link`, `#/novo/trabalho` abrem o formulário certo (usados pelos atalhos do ícone).
- `?url=…&titulo=…&texto=…` (compartilhar de outro app) abre um link ou nota já preenchido. Funciona no Android/Chrome; o iPhone não oferece compartilhar para PWA.

## Ao mudar o app

Basta registrar a nova versão no topo de `atualizacoes.js`. Se criar arquivo novo que precisa funcionar offline, inclua em `ESSENCIAIS` no `sw.js`.
