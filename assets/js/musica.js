/* Tyba — música (YouTube, lista e mini player).
   Módulo separado do app.js: recebe do app o que precisa (estado, utilidades) por `ctx` e devolve só o que o resto do app usa.
   `S` aqui é um espelho do estado do app (que troca de objeto ao importar backup ou sincronizar), então sempre aponta para o atual. */
window.TybaMusica = function (ctx) {
  'use strict';
  const { UI, main } = ctx;
  const S = new Proxy({}, { get: (_, k) => ctx.S()[k], set: (_, k, v) => { ctx.S()[k] = v; return true; }, has: (_, k) => k in ctx.S(), ownKeys: () => Reflect.ownKeys(ctx.S()), getOwnPropertyDescriptor: (_, k) => ({ value: ctx.S()[k], enumerable: true, configurable: true, writable: true }) });
  const esc = (...a) => ctx.esc(...a), agora = (...a) => ctx.agora(...a), ic = (...a) => ctx.ic(...a), btnIco = (...a) => ctx.btnIco(...a), btnAlterna = (...a) => ctx.btnAlterna(...a), btn = (...a) => ctx.btn(...a), menuMais = (...a) => ctx.menuMais(...a), toast = (...a) => ctx.toast(...a), salvar = (...a) => ctx.salvar(...a), item = (...a) => ctx.item(...a), tituloItem = (...a) => ctx.tituloItem(...a), doTipo = (...a) => ctx.doTipo(...a), vazio = (...a) => ctx.vazio(...a), txt = (...a) => ctx.txt(...a), renderDisco = (...a) => ctx.renderDisco(...a), render = (...a) => ctx.render(...a), sair = (...a) => ctx.sair(...a), quando = (...a) => ctx.quando(...a);
  /* ---------------- músicas ----------------
     Guarda o link do YouTube e toca num quadro pequeno, dentro do site. */
  function doYouTube(url) {
    let u; try { u = new URL(url); } catch (e) { return {}; }
    const h = u.hostname.replace(/^www\.|^m\./, '');
    const lista = u.searchParams.get('list') || '';
    let video = '';
    if (h === 'youtu.be') video = u.pathname.slice(1);
    else if (h.endsWith('youtube.com') || h.endsWith('youtube-nocookie.com')) {
      if (u.pathname === '/watch') video = u.searchParams.get('v') || '';
      else { const m = u.pathname.match(/^\/(embed|shorts|live|v)\/([^/?#]+)/); if (m) video = m[2]; }
    }
    if (!/^[\w-]{6,20}$/.test(video)) video = '';
    return { video, lista: /^[\w-]{8,60}$/.test(lista) ? lista : '' };
  }
  const musicas = () => doTipo('musica').slice().sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0) || b.criadoEm.localeCompare(a.criadoEm));
  const grupoMusica = (id) => (S.gruposMusica || []).find((g) => g.id === id);
  const musicasDoGrupo = () => {
    const g = UI.grupoMusica || '';
    return musicas().filter((i) => !g || (g === 'soltas' ? !i.grupo : i.grupo === g));
  };
  function vizinha(passo) {
    const lista = musicasDoGrupo();
    if (!lista.length) return null;
    const n = lista.findIndex((x) => x.id === UI.tocando);
    if (n < 0) return lista[0];
    return lista[(n + passo + lista.length) % lista.length];
  }
  const miniatura = (v) => `https://img.youtube.com/vi/${encodeURIComponent(v)}/mqdefault.jpg`;
  const capaYT = (i) => i.video ? `https://img.youtube.com/vi/${encodeURIComponent(i.video)}/mqdefault.jpg` : '';
  const videoAtual = (i) => (UI.tocando === i.id && UI.videoForcado) || i.video || '';
  function urlPlayer(i) {
    const base = 'https://www.youtube-nocookie.com/embed/';
    const comum = 'autoplay=1&rel=0&modestbranding=1&enablejsapi=1';
    const v = videoAtual(i);
    if (v) return base + encodeURIComponent(v) + '?' + comum + (i.listaYT ? '&list=' + encodeURIComponent(i.listaYT) : '');
    return base + 'videoseries?' + comum + '&list=' + encodeURIComponent(i.listaYT);
  }
  /* As faixas de uma playlist são lidas pelo servidor e ficam guardadas no próprio item. */
  async function carregarFaixas(id) {
    const i = item(id);
    if (!i || !i.listaYT || i.buscandoFaixas) return;
    if (!UI.servidor) { i.faixasErro = 'Ligue o servidor (ou use o site publicado) para ler os vídeos da lista.'; UI.pularColheita = true; return render(); }
    i.buscandoFaixas = true; delete i.faixasErro; UI.pularColheita = true; render();
    try {
      const r = await fetch('api/playlist?lista=' + encodeURIComponent(i.listaYT), { cache: 'no-store' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.erro || 'não deu');
      i.faixas = d.faixas; i.faixasEm = agora();
      salvar();
    } catch (e) {
      i.faixasErro = 'Não consegui ler os vídeos dessa lista agora.';
    }
    i.buscandoFaixas = false; UI.pularColheita = true; render();
  }
  function tocar(id, video) {
    const i = item(id); if (!i) return;
    if (UI.tocando === id && !video) return pausarOuTocar();
    UI.tocando = id; UI.videoForcado = video || ''; UI.painelMusica = true;
    i.tocadoEm = agora(); salvar(); UI.pularColheita = true; render();
  }

  /** O player fica fora do main para não recomeçar a cada tela. */
  /* ---------------- mini app de música ----------------
     Um painel no canto: lista, controles e o vídeo. O iframe é criado uma vez
     por faixa e nunca é redesenhado junto com o resto, senão a música reinicia. */
  /* O YouTube avisa qual vídeo está tocando quando a gente se registra como ouvinte.
     É assim que a barra mostra o nome da faixa, e não o da playlist. */
  function ouvirYT(iframe) {
    if (!iframe) return;
    const avisar = () => { try { iframe.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*'); } catch (e) { /* ignora */ } };
    iframe.addEventListener('load', () => { avisar(); setTimeout(avisar, 900); });
    avisar();
  }
  window.addEventListener('message', (e) => {
    if (!/youtube(-nocookie)?\.com$/.test((() => { try { return new URL(e.origin).hostname; } catch (er) { return ''; } })())) return;
    let d; try { d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (er) { return; }
    const info = d && d.info;
    if (!info) return;
    if (info.videoData) {
      const t = info.videoData.title, v = info.videoData.video_id;
      if ((t && t !== UI.faixaYT) || (v && v !== UI.videoYT)) { if (t) UI.faixaYT = t; if (v) UI.videoYT = v; pintarMiniApp(); }
    }
    if (info.playerState !== undefined) {
      const pausado = info.playerState === 2;
      if (pausado !== !!UI.pausado) { UI.pausado = pausado; pintarMiniApp(); }
    }
  });
  function comandoYT(func) {
    const f = document.querySelector('#ma-video iframe');
    if (!f || !f.contentWindow) return;
    try { f.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*'); } catch (e) { /* ignora */ }
  }
  function pausarOuTocar() {
    if (!UI.tocando) { const p = musicasDoGrupo()[0]; return p ? tocar(p.id) : toast('Guarde uma música primeiro.'); }
    UI.pausado = !UI.pausado;
    comandoYT(UI.pausado ? 'pauseVideo' : 'playVideo');
    pintarMiniApp();
  }
  const abrirMusica = () => { UI.painelMusica = true; UI.pularColheita = true; render(); };
  // Fechar guarda o player no canto sem parar a música; sem nada tocando, some de vez.
  const fecharMusica = () => { UI.painelMusica = false; UI.tocando = null; UI.pausado = false; UI.playerMin = false; UI.ambAberto = false; if (window.SONS) SONS.ambiente.parar(); UI.pularColheita = true; render(); };

  function listaMiniApp() {
    const aberta = UI.listaMini && item(UI.listaMini);
    if (aberta) {
      return `<div class="ma-lista-topo">${btn('ma-lista-voltar', ic('nav-arrow-left') + 'Listas', '', 'btn-f btn-p')}<strong>${esc(tituloItem(aberta))}</strong></div>
        <div class="ma-faixas ma-faixas-cheia">${faixasHTML(aberta).replace(/^<div class="ma-faixas">|<\/div>$/g, '')}</div>`;
    }
    const lista = musicasDoGrupo();
    if (!lista.length) return `<p class="nada" style="padding:14px 16px">Nada neste grupo ainda.</p>`;
    return lista.map((i) => `<div class="ma-faixa ${UI.tocando === i.id ? 'tocando' : ''}" data-ordena="musicas" data-oid="${i.id}">
      <button type="button" class="ma-tocar" data-act="tocar" data-id="${i.id}" aria-label="Tocar ${esc(tituloItem(i))}">
        ${ic(UI.tocando === i.id && !UI.pausado ? 'pause' : 'play-solid')}</button>
      <span class="ma-nome" ${i.listaYT ? `data-act="ma-lista-abrir" data-id="${i.id}" title="Abrir a lista"` : ''}>${esc(tituloItem(i))}${i.listaYT ? ` <em class="ma-selo">${ic('playlist')}lista</em>` : ''}</span>
      ${i.listaYT ? btnIco('ma-lista-abrir', 'nav-arrow-right', 'Abrir a lista', `data-id="${i.id}"`) : ''}
      ${menuMais([{ act: 'musica-grupo', id: i.id, ico: 'folder', txt: 'Mover para grupo' },
        { act: 'editar-item', id: i.id, ico: 'edit-pencil', txt: 'Editar' },
        { act: 'abrir-fora', id: i.id, ico: 'open-new-window', txt: 'Abrir no YouTube' },
        '-', { act: 'excluir-item', id: i.id, ico: 'trash', txt: 'Excluir', perigo: true }])}</div>
      `).join('');
  }
  /** No mini app, leva a playlist aberta para o topo da lista, para ver os vídeos dela. */
  function rolarListaAoTopo(id) {
    const lista = document.getElementById('ma-lista'); if (!lista) return;
    const linha = lista.querySelector(`.ma-faixa[data-oid="${id}"]`); if (!linha) return;
    lista.scrollTo({ top: lista.scrollTop + linha.getBoundingClientRect().top - lista.getBoundingClientRect().top - 4, behavior: 'smooth' });
  }
  function faixasHTML(i) {
    if (i.buscandoFaixas) return `<p class="ma-vazio">Lendo os vídeos da lista…</p>`;
    if (!i.faixas || !i.faixas.length) return `<p class="ma-vazio">${i.faixasErro ? esc(i.faixasErro) : 'Nenhum vídeo lido ainda.'} <button type="button" class="ma-de-novo" data-act="ma-faixas-recarregar" data-id="${i.id}">Tentar de novo</button></p>`;
    const atual = videoAtual(i);
    return `<div class="ma-faixas">${i.faixas.map((f, n) => `<button type="button" class="ma-sub-faixa ${atual === f.video ? 'tocando' : ''}"
      data-act="tocar-video" data-id="${i.id}" data-video="${esc(f.video)}">
      <em>${n + 1}</em><span>${esc(f.titulo)}</span></button>`).join('')}</div>`;
  }
  /* Painel de sons ambiente: um controle de volume por camada. */
  function ambienteHTML() {
    const A = window.SONS && SONS.ambiente; if (!A) return '';
    const sv = S.perfil.ambiente || {}, niveis = Object.assign(A.niveis(), sv.niveis || {}), geral = sv.geral == null ? A.volumeGeral() : sv.geral;
    const linha = (id, nome, v) => `<label class="amb-linha"><span>${nome}</span><input type="range" min="0" max="100" step="1" value="${v}" data-act="amb-nivel" data-id="${id}" aria-label="${nome}"></label>`;
    return `<div class="amb-topo">${btn('amb-tocar', A.tocando() ? 'Pausar' : 'Tocar', '', 'btn-1 btn-p')}${btn('amb-zerar', 'Zerar', '', 'btn-f btn-p')}</div>
      ${linha('geral', 'Geral', geral)}<hr class="amb-sep">
      ${A.camadas.map(([id, nome]) => linha(id, nome, niveis[id] || 0)).join('')}`;
  }
  function pintarAmbiente() {
    const ap = document.querySelector('#player .mini-app'); if (!ap || !window.SONS) return;
    const toca = SONS.ambiente.tocando();
    ap.classList.toggle('amb-aberto', !!UI.ambAberto);
    const bt = ap.querySelector('[data-act="amb-abrir"]'); if (bt) { bt.setAttribute('aria-pressed', String(!!UI.ambAberto)); bt.classList.toggle('toca', toca); }
    const tc = ap.querySelector('[data-act="amb-tocar"]'); if (tc) tc.textContent = toca ? 'Pausar' : 'Tocar';
  }
  function salvarAmbiente() {
    const A = SONS.ambiente; S.perfil.ambiente = { niveis: A.niveis(), geral: A.volumeGeral() }; salvar();
  }
  function cabecalhoMiniApp() {
    const g = UI.grupoMusica || '';
    const ops = [['', 'Todas as músicas'], ...(S.gruposMusica || []).map((x) => [x.id, x.nome]), ['soltas', 'Sem grupo']];
    return `<select class="ma-grupo" data-act="ma-grupo" aria-label="Grupo">${ops.map(([v, n]) =>
      `<option value="${esc(v)}" ${g === v ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>`;
  }
  /** Só pinta estado: classes, ícones e a lista. Nunca mexe no iframe. */
  function pintarMiniApp() {
    const ap = document.querySelector('#player .mini-app');
    if (!ap) return;
    ap.classList.toggle('min', !!UI.playerMin);
    ap.classList.toggle('sem-video', !UI.tocando);
    ap.classList.toggle('em-lista', !!(UI.listaMini && item(UI.listaMini)));
    const i = UI.tocando && item(UI.tocando);
    const nome = i ? (UI.faixaYT || tituloItem(i)) : 'Nada tocando';
    ap.querySelectorAll('.ma-nome-atual').forEach((n) => { n.textContent = nome; });
    const sub = ap.querySelector('.ma-sub');
    if (sub) sub.textContent = i && UI.faixaYT && UI.faixaYT !== tituloItem(i) ? tituloItem(i) : 'Músicas';
    const capa = ap.querySelector('.ma-capa');
    const url = i ? (UI.videoYT ? miniatura(UI.videoYT) : capaYT(i)) : '';
    if (capa && capa.dataset.url !== url) { capa.dataset.url = url; capa.innerHTML = url ? `<img src="${esc(url)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ic('music-note'); }
    const pp = ap.querySelector('[data-act="player-pausar"]');
    if (pp) { pp.innerHTML = ic(UI.pausado || !UI.tocando ? 'play' : 'pause'); pp.title = pp.ariaLabel = UI.pausado || !UI.tocando ? 'Tocar' : 'Pausar'; }
    const fx = ap.querySelector('[data-act="player-fixar"]');
    if (fx) { const on = !!S.perfil.playerFixo; fx.innerHTML = ic(on ? 'pin-solid' : 'pin'); fx.setAttribute('aria-pressed', String(on)); fx.title = fx.ariaLabel = on ? 'Fixado: não fecha ao tirar o mouse' : 'Manter aberto ao tirar o mouse'; }
    const lista = ap.querySelector('#ma-lista');
    if (lista) lista.innerHTML = listaMiniApp();
    // as opções também mudam quando um grupo é criado ou renomeado
    const barra = ap.querySelector('.ma-barra');
    const sel = ap.querySelector('.ma-grupo');
    if (sel && barra) { const novo = cabecalhoMiniApp(); if (sel.outerHTML !== novo) sel.outerHTML = novo; }
  }
  /** Player: o mouse sobre a barra abre; ao sair (ou clicar fora) ela volta a ser a barra mini, a menos que esteja fixado. */
  (function () {
    let tempo = 0;
    const caixa = () => document.getElementById('player');
    const ocupado = (ap) => ap.contains(document.activeElement) && /^(SELECT|INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
    const minimizar = () => { const ap = document.querySelector('#player .mini-app'); if (!ap || S.perfil.playerFixo || UI.playerMin || !UI.painelMusica || ocupado(ap)) return; UI.playerMin = true; pintarMiniApp(); };
    document.addEventListener('pointerover', (e) => {
      if (e.pointerType !== 'mouse') return;
      const c = caixa(); if (!c || c.hidden || !e.target.closest || !e.target.closest('#player .mini-app')) return;
      clearTimeout(tempo);
      if (UI.playerMin) { UI.playerMin = false; pintarMiniApp(); }
    });
    document.addEventListener('pointerout', (e) => {
      if (e.pointerType !== 'mouse' || !e.target.closest || !e.target.closest('#player .mini-app')) return;
      if (e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('#player .mini-app')) return;
      if (e.buttons) return;
      clearTimeout(tempo); tempo = setTimeout(minimizar, 450);
    });
    document.addEventListener('pointerdown', (e) => {
      if (e.target.closest && e.target.closest('#player')) return;
      if (document.querySelector('.modal-fundo, dialog[open]')) return;
      minimizar();
    });
  })();
  function renderMiniApp() {
    const caixa = document.getElementById('player');
    if (!caixa) return;
    if (!UI.painelMusica && !UI.tocando && !(window.SONS && SONS.ambiente.tocando())) { caixa.innerHTML = ''; caixa.hidden = true; delete caixa.dataset.faixa; UI.faixaYT = ''; UI.videoYT = ''; return; }
    caixa.hidden = false;
    caixa.classList.toggle('guardado', !UI.painelMusica);
    if (!caixa.querySelector('.mini-app')) {
      delete caixa.dataset.faixa;
      caixa.innerHTML = `<div class="mini-app">
        <header class="ma-cab" data-act="player-abrir">
          <span class="ma-capa"></span>
          <span class="ma-titulo"><strong class="ma-nome-atual"></strong><span class="ma-sub">Músicas</span></span>
          <span class="ma-rolagem" aria-hidden="true"><span class="ma-nome-atual"></span><span class="ma-nome-atual"></span></span>
          ${btnIco('player-anterior', 'skip-prev', 'Anterior')}
          ${btnIco('player-pausar', 'play', 'Tocar')}
          ${btnIco('player-proxima', 'skip-next', 'Próxima')}
          ${btnIco('player-fixar', 'pin', 'Manter aberto', 'aria-pressed="false"')}
          ${btnIco('player-fechar', 'xmark', 'Fechar')}</header>
        <div class="ma-video" id="ma-video"></div>
        <div class="ma-barra">${cabecalhoMiniApp()}
          ${btnIco('amb-abrir', 'ambiente', 'Sons ambiente', 'aria-pressed="false"', 'ma-amb-btn')}
          ${btn('criar', ic('plus'), 'data-t="musica" aria-label="Nova música" title="Nova música"', 'btn-1 ma-novo')}</div>
        <div class="ma-amb" id="ma-amb">${ambienteHTML()}</div>
        <div class="ma-lista" id="ma-lista"></div></div>
        <button type="button" class="ma-pega" data-act="player-abrir" aria-label="Abrir o player"><span class="disco girando"><span></span></span></button>`;
    }
    // o vídeo só é recriado quando muda a faixa
    const i = UI.tocando && item(UI.tocando);
    const alvo = caixa.querySelector('#ma-video');
    const chave = i ? i.id + ':' + (UI.videoForcado || '') : '';
    if (i && caixa.dataset.faixa !== chave) {
      caixa.dataset.faixa = chave; UI.pausado = false;
      UI.faixaYT = ''; UI.videoYT = '';
      alvo.innerHTML = `<iframe src="${esc(urlPlayer(i))}" title="${esc(tituloItem(i))}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      ouvirYT(alvo.querySelector('iframe'));
    } else if (!i && caixa.dataset.faixa) { delete caixa.dataset.faixa; alvo.innerHTML = ''; }
    renderDisco();
    pintarMiniApp();
    pintarAmbiente();
  }
  function renderMusicas() {
    const lista = musicas().slice().sort((a, b2) => b2.criadoEm.localeCompare(a.criadoEm));
    const cartaoM = (i) => {
      const capa = capaYT(i);
      return `<article class="musica ${UI.tocando === i.id ? 'tocando' : ''}">
        <button type="button" class="musica-capa" data-act="tocar" data-id="${i.id}" aria-label="Tocar ${esc(tituloItem(i))}">
          ${capa ? `<img src="${esc(capa)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : `<span class="capa-ph">${ic('playlist')}</span>`}
          <span class="play">${ic(UI.tocando === i.id ? 'pause' : 'play-solid')}</span></button>
        <div class="musica-dados"><h3><a href="#/item/${i.id}">${esc(tituloItem(i))}</a></h3>
          <p class="meta">${[i.artista, i.listaYT && !i.video ? 'playlist' : (i.listaYT ? 'na playlist' : '')].filter(Boolean).map(esc).join(' · ') || 'YouTube'}</p>
          <div class="musica-acoes">${btnIco('tocar', UI.tocando === i.id ? 'pause' : 'play', UI.tocando === i.id ? 'Parar' : 'Tocar', `data-id="${i.id}"`)}
            ${i.listaYT ? btnIco('ma-faixas', UI.listaAberta === i.id ? 'nav-arrow-up' : 'playlist', UI.listaAberta === i.id ? 'Esconder os vídeos' : 'Ver os vídeos da lista', `data-id="${i.id}"`) : ''}
            ${btnAlterna('fav', i.id, i.favorito, 'star', 'Favorita', 'Favoritar', 'estrela')}
            ${btnIco('abrir-fora', 'open-new-window', 'Abrir no YouTube', `data-id="${i.id}"`)}
            ${menuMais([{ act: 'editar-item', id: i.id, ico: 'edit-pencil', txt: 'Editar' },
              { act: 'organizar-em', id: i.id, ico: 'folder', txt: 'Mover para coleção' },
              '-', { act: 'excluir-item', id: i.id, ico: 'trash', txt: 'Excluir', perigo: true }])}</div>
          ${UI.listaAberta === i.id ? faixasHTML(i) : ''}</div></article>`;
    };
    main.innerHTML = `<header class="pagina-cab"><h1>${ic('ytmusic')}Músicas</h1>
        <div class="ferramentas">${btn('criar', ic('plus') + 'Guardar música', 'data-t="musica"', 'btn-1')}</div></header>
      ${lista.length ? `<div class="grade-musicas">${lista.map(cartaoM).join('')}</div>`
        : vazio('ytmusic', 'Nenhuma música ainda. Cole o link de um vídeo ou de uma playlist do YouTube.',
          btn('criar', ic('plus') + 'Guardar música', 'data-t="musica"', 'btn-1'))}`;
  }

  return { doYouTube, musicas, grupoMusica, vizinha, capaYT, carregarFaixas, tocar, pausarOuTocar, abrirMusica, fecharMusica, rolarListaAoTopo, pintarAmbiente, salvarAmbiente, pintarMiniApp, renderMiniApp, renderMusicas };
};
