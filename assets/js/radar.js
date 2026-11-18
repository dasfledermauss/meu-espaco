/* Tyba — Radar: um "Google Alerts" seu. Você cadastra palavras-chave, o Tyba busca em fontes públicas
   (Google Notícias, Bing Notícias e, se quiser, repositórios do GitHub) e mostra só o que é novo.
   A busca roda no servidor (`api/radar` na Vercel, `servidor.py` no computador); as palavras-chave e os achados
   ficam no seu perfil (`S.perfil.radar`) e sincronizam com a sua conta, nunca no código do repositório.
   Módulo separado do app.js: recebe do app o que precisa por `ctx`. */
window.TybaRadar = function (ctx) {
  'use strict';
  const { UI, main } = ctx;
  const S = new Proxy({}, { get: (_, k) => ctx.S()[k], set: (_, k, v) => { ctx.S()[k] = v; return true; }, has: (_, k) => k in ctx.S(), ownKeys: () => Reflect.ownKeys(ctx.S()), getOwnPropertyDescriptor: (_, k) => ({ value: ctx.S()[k], enumerable: true, configurable: true, writable: true }) });
  const esc = (...a) => ctx.esc(...a), ic = (...a) => ctx.ic(...a), btn = (...a) => ctx.btn(...a), btnIco = (...a) => ctx.btnIco(...a), toast = (...a) => ctx.toast(...a), agora = (...a) => ctx.agora(...a), uid = (...a) => ctx.uid(...a), salvar = (...a) => ctx.salvar(...a), render = (...a) => ctx.render(...a), vazio = (...a) => ctx.vazio(...a);

  const MAX_ACHADOS = 60;          // por alerta: os mais novos ficam, os antigos saem
  const MOSTRAR = 8;               // quantos aparecem antes de "Mostrar todos"
  const INTERVALO = 60 * 60e3;     // de hora em hora enquanto o Tyba está aberto

  const radar = () => (S.perfil.radar = S.perfil.radar || { alertas: [] });
  const alertas = () => radar().alertas;
  const achar = (id) => alertas().find((a) => a.id === id);
  const novos = (a) => (a.achados || []).filter((x) => !x.visto).length;
  const pendentes = () => alertas().reduce((n, a) => n + novos(a), 0);
  let buscando = false;

  const haQuanto = (iso) => {
    if (!iso) return '';
    const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (min < 1) return 'agora há pouco';
    if (min < 60) return 'há ' + min + ' min';
    if (min < 1440) return 'há ' + Math.round(min / 60) + ' h';
    const d = Math.round(min / 1440);
    return d === 1 ? 'ontem' : 'há ' + d + ' dias';
  };
  const chaveDe = (x) => String(x.url || '').replace(/^https?:\/\/(www\.)?/, '').replace(/[?#].*$/, '').replace(/\/$/, '').toLowerCase() + '|' + String(x.titulo || '').toLowerCase().replace(/[^a-z0-9à-ú]+/g, '').slice(0, 60);

  /* ---------- cadastro ---------- */
  function adicionar(d) {
    const termo = String((d && d.termo) || '').trim().replace(/\s+/g, ' ').slice(0, 120);
    if (termo.length < 2) return toast('Escreva a palavra-chave.');
    if (alertas().some((a) => a.termo.toLowerCase() === termo.toLowerCase())) return toast('Você já tem esse alerta.');
    const a = { id: uid('rad'), termo, github: !!(d && d.github), ativo: true, criadoEm: agora(), ultimaBusca: '', achados: [] };
    alertas().push(a);
    if (!salvar()) { alertas().pop(); return; }
    UI.pularColheita = true; render();
    atualizar(a.id, true);
  }
  function remover(id) {
    const a = achar(id); if (!a) return;
    radar().alertas = alertas().filter((x) => x.id !== id);
    salvar(); UI.pularColheita = true; render(); toast('Alerta “' + a.termo + '” removido.');
  }
  function pausar(id) {
    const a = achar(id); if (!a) return;
    a.ativo = !a.ativo; salvar(); UI.pularColheita = true; render();
  }

  /* ---------- busca ---------- */
  async function buscarUm(a) {
    const fontes = a.github ? 'noticias,github' : 'noticias';
    const r = await fetch('api/radar?q=' + encodeURIComponent(a.termo) + '&fontes=' + fontes, { cache: 'no-store' });
    const j = await r.json();
    if (!r.ok || j.erro) throw new Error(j.erro || 'falha');
    const primeira = !a.ultimaBusca;                 // a primeira busca só forma a base: nada vem marcado como novo
    const existentes = new Set((a.achados || []).map(chaveDe));
    const chegaram = (j.achados || []).filter((x) => !existentes.has(chaveDe(x))).map((x) => ({ id: uid('ach'), titulo: x.titulo, url: x.url, fonte: x.fonte || '', data: x.data || '', visto: primeira }));
    a.achados = chegaram.concat(a.achados || []).sort((x, y) => (y.data || '').localeCompare(x.data || '')).slice(0, MAX_ACHADOS);
    a.ultimaBusca = agora();
    return primeira ? 0 : chegaram.length;
  }
  /** Busca um alerta (id) ou todos os ativos. `quieto`: sem aviso quando não há nada novo. */
  async function atualizar(id, quieto) {
    if (buscando) return;
    if (!UI.servidor) { if (!quieto) toast('O Radar precisa do servidor ligado.'); return; }
    const lista = id ? [achar(id)].filter(Boolean) : alertas().filter((a) => a.ativo);
    if (!lista.length) return;
    buscando = true; UI.pularColheita = true; render();
    let total = 0, erros = 0;
    for (const a of lista) { try { total += await buscarUm(a); } catch (e) { erros++; } }
    buscando = false;
    salvar(); UI.pularColheita = true; render();
    if (erros && erros === lista.length) toast('Não consegui buscar agora. Tente de novo em instantes.');
    else if (total) toast(total + (total === 1 ? ' novidade no Radar.' : ' novidades no Radar.'), 'bell');
    else if (!quieto) toast('Nada de novo por enquanto.');
  }
  /** Liga a busca de hora em hora (enquanto o Tyba está aberto) e uma checagem logo ao abrir. */
  function ligar() {
    const velho = () => alertas().some((a) => a.ativo && (!a.ultimaBusca || Date.now() - new Date(a.ultimaBusca).getTime() > INTERVALO));
    setTimeout(() => { if (velho()) atualizar(null, true); }, 6000);
    setInterval(() => { if (velho()) atualizar(null, true); }, 10 * 60e3);
  }

  /* ---------- leitura ---------- */
  function marcarVistos(id) {
    (id ? [achar(id)] : alertas()).filter(Boolean).forEach((a) => (a.achados || []).forEach((x) => { x.visto = true; }));
    salvar(); UI.pularColheita = true; render();
  }
  function descartar(idAlerta, idAchado) {
    const a = achar(idAlerta); if (!a) return;
    a.achados = (a.achados || []).filter((x) => x.id !== idAchado);
    salvar(); UI.pularColheita = true; render();
  }
  function guardarEmLinks(idAlerta, idAchado) {
    const a = achar(idAlerta), x = a && (a.achados || []).find((y) => y.id === idAchado); if (!x) return;
    ctx.guardarLink(x.url, x.titulo);
    x.visto = true; salvar(); UI.pularColheita = true; render();
  }
  function mostrarTodos(id) { UI.radarTodos = UI.radarTodos || {}; UI.radarTodos[id] = true; UI.pularColheita = true; render(); }

  /* ---------- tela ---------- */
  function achadoHTML(a, x) {
    const dt = x.data ? haQuanto(x.data) : '';
    return `<li class="radar-achado ${x.visto ? '' : 'novo'}">
      <div class="radar-achado-corpo"><a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.titulo)}</a>
        <p class="meta">${x.visto ? '' : '<b class="radar-novo">Novo</b> · '}${esc(x.fonte)}${dt ? ' · ' + esc(dt) : ''}</p></div>
      <div class="radar-achado-acoes">${btnIco('radar-salvar', 'bookmark', 'Guardar em Links', `data-a="${esc(a.id)}" data-n="${esc(x.id)}"`)}${btnIco('radar-descartar', 'xmark', 'Dispensar', `data-a="${esc(a.id)}" data-n="${esc(x.id)}"`)}</div></li>`;
  }
  function alertaHTML(a) {
    const todos = (UI.radarTodos || {})[a.id], lista = a.achados || [], vis = todos ? lista : lista.slice(0, MOSTRAR), n = novos(a);
    return `<section class="cartao radar-alerta ${a.ativo ? '' : 'pausado'}" aria-label="Alerta ${esc(a.termo)}">
      <header class="radar-cab"><div><h2>${esc(a.termo)}${n ? `<em class="radar-conta">${n}</em>` : ''}</h2>
        <p class="meta">${a.ativo ? '' : 'Pausado · '}${a.github ? 'Notícias e GitHub' : 'Notícias'}${a.ultimaBusca ? ' · atualizado ' + esc(haQuanto(a.ultimaBusca)) : ' · ainda não buscou'}</p></div>
        <div class="radar-cab-acoes">${n ? btn('radar-vistos', ic('check') + 'Marcar como visto', `data-a="${esc(a.id)}"`, 'btn-f btn-p') : ''}${btnIco('radar-atualizar', 'refresh', 'Buscar agora', `data-a="${esc(a.id)}"`)}${btnIco('radar-pausar', a.ativo ? 'pause' : 'play', a.ativo ? 'Pausar alerta' : 'Retomar alerta', `data-a="${esc(a.id)}"`)}${btnIco('radar-remover', 'trash', 'Remover alerta', `data-a="${esc(a.id)}"`)}</div></header>
      ${lista.length ? `<ul class="radar-lista">${vis.map((x) => achadoHTML(a, x)).join('')}</ul>${lista.length > vis.length ? btn('radar-todos', 'Mostrar todos (' + lista.length + ')', `data-a="${esc(a.id)}"`, 'btn-f btn-p') : ''}`
        : `<p class="meta">${a.ultimaBusca ? 'Nada encontrado ainda.' : buscando ? 'Buscando…' : 'Toque em atualizar para buscar.'}</p>`}</section>`;
  }
  function renderRadar() {
    const lista = alertas(), n = pendentes();
    main.innerHTML = `<header class="pagina-cab"><h1>${ic('bell')}Radar</h1></header>
      <p class="meta" style="margin:-6px 0 14px">Cadastre palavras-chave (seu nome, um concurso, um assunto) e o Tyba busca notícias e projetos públicos de hora em hora, enquanto estiver aberto. Só aparece o que é novo.</p>
      ${UI.servidor === false ? '<p class="dica" style="margin-bottom:14px">' + ic('priority-high') + '<span>O Radar precisa do servidor ligado. No site publicado ele já funciona; no computador, abra pelo servidor.py.</span></p>' : ''}
      <section class="cartao radar-novo-alerta" aria-label="Novo alerta">
        <form class="radar-form" data-form="radar-novo"><input name="termo" type="text" required maxlength="120" autocomplete="off" placeholder="Palavra-chave, ex.: concurso Prefeitura de Anápolis" aria-label="Palavra-chave">
          <label class="radar-github"><input type="checkbox" name="github"><span>Incluir projetos do GitHub</span></label>
          <button class="btn-1" type="submit">${ic('plus')}Adicionar alerta</button></form></section>
      ${lista.length ? `<div class="radar-barra">${btn('radar-atualizar', ic('refresh') + (buscando ? 'Buscando…' : 'Atualizar tudo'), buscando ? 'disabled' : '', 'btn-f')}${n ? btn('radar-vistos', ic('check') + 'Marcar tudo como visto', '', 'btn-f') : ''}</div>
        <div class="radar-alertas">${lista.map(alertaHTML).join('')}</div>`
        : vazio('bell', 'Nenhum alerta ainda. Adicione uma palavra-chave acima.')}`;
  }

  return { renderRadar, adicionar, remover, pausar, atualizar, marcarVistos, descartar, guardarEmLinks, mostrarTodos, pendentes, ligar, achar };
};
