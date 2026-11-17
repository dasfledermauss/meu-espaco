/* Tyba — Correios: mandar um item guardado para outra pessoa que usa o Tyba.
   Quem recebe vê a carta na Caixa de entrada e escolhe Salvar (o item cai na mesma seção do Tyba dela) ou Dispensar.
   Só funciona com a conta Google ligada à nuvem (os dados passam pelo Firestore, ver `nuvem.js` e `firestore.rules`).
   Módulo separado do app.js: recebe do app o que precisa por `ctx`. */
window.TybaCorreios = function (ctx) {
  'use strict';
  const { UI, main } = ctx;
  const S = new Proxy({}, { get: (_, k) => ctx.S()[k], set: (_, k, v) => { ctx.S()[k] = v; return true; }, has: (_, k) => k in ctx.S(), ownKeys: () => Reflect.ownKeys(ctx.S()), getOwnPropertyDescriptor: (_, k) => ({ value: ctx.S()[k], enumerable: true, configurable: true, writable: true }) });
  const esc = (...a) => ctx.esc(...a), ic = (...a) => ctx.ic(...a), btn = (...a) => ctx.btn(...a), toast = (...a) => ctx.toast(...a), agora = (...a) => ctx.agora(...a), uid = (...a) => ctx.uid(...a), salvar = (...a) => ctx.salvar(...a), render = (...a) => ctx.render(...a), item = (...a) => ctx.item(...a), nomeTipo = (...a) => ctx.nomeTipo(...a), icoTipo = (...a) => ctx.icoTipo(...a), tituloItem = (...a) => ctx.tituloItem(...a), fmtDataHora = (...a) => ctx.fmtDataHora(...a), vazio = (...a) => ctx.vazio(...a), conta = (...a) => ctx.conta(...a), migrar = (...a) => ctx.migrar(...a);

  const API = () => (window.Nuvem && window.Nuvem.correios) || null;
  const disponivel = () => { const a = API(); return !!(a && a.disponivel()); };
  const TIPOS_QUE_VIAJAM = ['link', 'desejo', 'midia', 'artigo', 'imagem', 'nota', 'musica'];
  const LIMITE_BYTES = 700 * 1024;   // o Firestore aceita 1 MB por registro; deixa folga para o bilhete e os dados da carta

  let caixa = [];            // cartas que chegaram (mais novas primeiro)
  let membros = [];          // quem pode receber
  let parar = null;          // para de ouvir a caixa
  let uidProprio = '';
  let falha = '';            // '', 'registrar' ou 'ler': o que deu errado ao falar com o Firestore (quase sempre regras não publicadas)

  const pendentes = () => caixa.length;
  const podeEnviar = (i) => !!i && TIPOS_QUE_VIAJAM.includes(i.tipo);

  /* ---------- ligar: aparece na lista e passa a ouvir a caixa ---------- */
  async function ligar() {
    const a = API(); if (!a || !a.disponivel()) return;
    if (parar) { parar(); parar = null; }
    const u = conta() || {};
    uidProprio = (window.Nuvem && window.Nuvem.uid) || '';
    try { await a.registrar(String(u.nome || u.email || 'Alguém').split(' ')[0]); } catch (e) { falha = 'registrar'; }
    parar = a.ouvir((lista) => {
      if (!lista) return;   // erro de permissão: as regras do Firestore ainda não foram publicadas
      const antes = caixa.length;
      caixa = lista.slice().sort((x, y) => (y.enviadoEm || '').localeCompare(x.enviadoEm || ''));
      if (caixa.length > antes && UI.correiosVisto) toast('Chegou correspondência no Correios.', 'mail');
      UI.correiosVisto = true;
      UI.pularColheita = true; render();
    });
  }
  async function carregarMembros() {
    const a = API(); if (!a || !a.disponivel()) return [];
    try { membros = (await a.membros()).filter((m) => m.uid !== uidProprio); if (falha === 'ler') falha = ''; } catch (e) { membros = []; falha = 'ler'; }
    return membros;
  }

  /* ---------- o que viaja na carta ---------- */
  const NAO_VIAJA = ['id', 'colecoes', 'comentarios', 'favorito', 'criadoEm', 'editadoEm', 'atualizadoEm', 'importadoEm', 'organizar', 'anotacoes', 'notasFonte',
    'historicoPreco', 'comprado', 'compradoEm', 'lido', 'lerDepois', 'paginaAtual', 'estrelas', 'ordem', 'ordemT', 'fixado', 'capturaEm', 'capturaTentativaEm', 'origemId', 'grupo'];
  function empacotar(i) {
    const c = JSON.parse(JSON.stringify(i));
    NAO_VIAJA.forEach((k) => delete c[k]);
    if (c.tipo === 'midia') c.status = 'quero';
    return c;
  }
  const tamanho = (o) => new Blob([JSON.stringify(o)]).size;

  /** Manda os itens `ids` para a pessoa `destino` (uid). Uma carta por item. Devolve quantas seguiram. */
  async function enviar(ids, destino, bilhete) {
    const a = API(); if (!a || !a.disponivel()) { toast('Entre com a conta Google para usar o Correios.'); return 0; }
    const u = conta() || {};
    let n = 0, grandes = 0;
    for (const id of ids) {
      const i = item(id); if (!podeEnviar(i)) continue;
      const carta = { id: uid('car'), de: uidProprio, deNome: String(u.nome || 'Alguém').split(' ')[0], bilhete: String(bilhete || '').trim().slice(0, 280), enviadoEm: agora(), item: empacotar(i) };
      if (tamanho(carta) > LIMITE_BYTES) { grandes++; continue; }
      try { await a.enviar(destino, carta); n++; }
      catch (e) { toast('Não consegui enviar agora. Tente de novo em instantes.'); return n; }
    }
    if (grandes) toast(grandes + (grandes === 1 ? ' item é grande demais para enviar.' : ' itens são grandes demais para enviar.'));
    return n;
  }

  /* ---------- receber ---------- */
  const PREFIXO = { link: 'lin', desejo: 'des', midia: 'mid', artigo: 'art', imagem: 'ima', nota: 'not', musica: 'mus' };
  function salvarCarta(id) {
    const c = caixa.find((x) => x.id === id); if (!c || !c.item) return;
    const it = c.item;
    if (!TIPOS_QUE_VIAJAM.includes(it.tipo)) return dispensar(id);
    const jaTem = it.url && S.itens.some((x) => x.tipo === it.tipo && x.url === it.url);
    if (jaTem) { toast('Você já tem isso guardado.'); return dispensar(id, true); }
    const novo = Object.assign({}, it, { id: uid(PREFIXO[it.tipo] || 'itm'), colecoes: [], comentarios: [], favorito: false, criadoEm: agora(), organizar: true, deCorreios: { nome: c.deNome || '', em: c.enviadoEm || '' } });
    if (it.tipo === 'desejo') Object.assign(novo, { comprado: false, historicoPreco: [] });
    if (it.tipo === 'musica') novo.ordem = Math.min(0, ...S.itens.filter((x) => x.tipo === 'musica').map((x) => x.ordem ?? 0)) - 1;
    S.itens.push(novo);
    if (!salvar()) { S.itens.pop(); return; }
    toast('Salvo em ' + nomeTipo(novo) + '.', 'check-circle-solid');
    dispensar(id, true);
  }
  async function dispensar(id, quieto) {
    const a = API();
    caixa = caixa.filter((x) => x.id !== id);
    UI.pularColheita = true; render();
    try { if (a) await a.apagar(id); } catch (e) { /* volta na próxima escuta */ }
    if (!quieto) toast('Carta dispensada.');
  }

  /* ---------- telas ---------- */
  const capaCarta = (it) => {
    const src = it.imagem || it.capa || it.src || it.favicon || '';
    return `<span class="carta-capa">${ic(icoTipo(it))}${src && /^(https?:|data:image)/.test(src) ? `<img src="${esc(src)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}</span>`;
  };
  function cartaHTML(c) {
    const it = c.item || {};
    return `<article class="carta" data-carta="${esc(c.id)}">${capaCarta(it)}
      <div class="carta-corpo"><p class="meta carta-de">${ic('mail')}<span><b>${esc(c.deNome || 'Alguém')}</b> enviou · ${esc(nomeTipo(it))} · ${esc(fmtDataHora(c.enviadoEm))}</span></p>
        <h3>${esc(tituloItem(it))}</h3>
        ${c.bilhete ? `<p class="porque">${esc(c.bilhete)}</p>` : ''}
        ${it.url ? `<p class="meta carta-url">${esc(String(it.url).replace(/^https?:\/\/(www\.)?/, '').slice(0, 60))}</p>` : ''}
        <div class="acoes-form">${btn('carta-salvar', ic('check') + 'Salvar no meu Tyba', `data-id="${esc(c.id)}"`, 'btn-1')}${btn('carta-dispensar', 'Dispensar', `data-id="${esc(c.id)}"`, 'btn-f')}</div></div></article>`;
  }
  function renderCorreios() {
    const on = disponivel();
    main.innerHTML = `<header class="pagina-cab"><h1>${ic('mail')}Correios</h1></header>
      <p class="meta" style="margin:-6px 0 14px">Itens que outras pessoas mandaram para você. Para mandar um, abra o menu ⋯ do item e escolha “Enviar pelo Correios”.</p>
      ${!on ? vazio('mail', 'O Correios funciona com a conta Google ligada à nuvem. Entre com sua conta e espere a sincronização ligar.')
        : caixa.length ? `<div class="cartas">${caixa.map(cartaHTML).join('')}</div>`
        : vazio('mail', 'Sua caixa de entrada está vazia.')}`;
  }

  /* ---------- janela de envio ---------- */
  function modalEnvio(m) {
    const ids = m.ids || [];
    const n = ids.length;
    const lista = m.carregando ? '<p class="meta">Procurando quem está no Tyba…</p>'
      : falha ? '<p class="dica">' + ic('priority-high') + '<span>Não consegui acessar a lista do Correios no Firebase. Quase sempre é porque as regras novas ainda não foram publicadas (veja docs/CORREIOS.md).</span></p>'
      : !membros.length ? '<p class="dica">' + ic('priority-high') + '<span>Só você aparece por enquanto. A outra pessoa precisa abrir o Tyba (versão nova) logada com a conta Google, esperar "Sincronizado" e recarregar uma vez.</span></p>'
      : `<div class="opcoes-amigos" role="radiogroup" aria-label="Para quem">${membros.map((p, k) => `<label class="opcao-amigo"><input type="radio" name="destino" value="${esc(p.uid)}" ${k === 0 ? 'checked' : ''} required><span>${esc(p.nome || 'Sem nome')}</span></label>`).join('')}</div>`;
    return `<form class="modal" method="dialog" data-form="correios-enviar">
      <header class="modal-cab">${ic('send')}<h2>Enviar ${n} ${n === 1 ? 'item' : 'itens'} pelo Correios</h2>${ctx.btnIco('modal-fechar', 'xmark', 'Fechar')}</header>
      <div class="modal-corpo"><div class="form">${lista}
        <label class="campo"><span>Bilhete <span class="opcional">(opcional)</span></span><textarea name="bilhete" rows="2" maxlength="280" placeholder="ex.: lembrei de você quando vi isso"></textarea></label></div></div>
      <footer class="modal-pe"><span class="espaco"></span>${btn('modal-fechar', 'Cancelar', '', 'btn-f')}
        <button class="btn-1" type="submit" ${membros.length ? '' : 'disabled'}>${ic('send')}Enviar</button></footer></form>`;
  }
  async function abrirEnvio(ids) {
    const lista = (ids || []).filter((id) => podeEnviar(item(id)));
    if (!lista.length) return toast('Esse tipo de item não viaja pelo Correios.');
    if (!disponivel()) return toast('Entre com a conta Google para usar o Correios.');
    ctx.abrirModal({ tipo: 'correios-enviar', ids: lista, carregando: true });
    await carregarMembros();
    if (UI.modal && UI.modal.tipo === 'correios-enviar') { UI.modal.carregando = false; UI.pularColheita = true; render(); }
  }
  async function enviarForm(d) {
    const m = UI.modal || {};
    if (!d.destino) return toast('Escolha para quem enviar.');
    const bt = document.querySelector('#modal button[type=submit]');
    if (bt) { bt.disabled = true; bt.innerHTML = ic('refresh') + 'Enviando…'; }
    const n = await enviar(m.ids || [], d.destino, d.bilhete);
    if (!n && bt) { bt.disabled = false; bt.innerHTML = ic('send') + 'Enviar'; }
    if (n) {
      const quem = (membros.find((p) => p.uid === d.destino) || {}).nome || 'a pessoa';
      UI.modal = null; if (Array.isArray(UI.sel)) UI.sel = [];
      UI.pularColheita = true; render(); toast(n + (n === 1 ? ' item enviado' : ' itens enviados') + ' para ' + quem + '.', 'check-circle-solid');
    }
  }

  function desligar() { if (parar) { parar(); parar = null; } caixa = []; membros = []; UI.correiosVisto = false; }

  return { desligar, renderCorreios, modalEnvio, abrirEnvio, enviarForm, salvarCarta, dispensar, ligar, pendentes, podeEnviar, disponivel };
};
