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
  let parar = null;          // para de ouvir a caixa
  let uidProprio = '';
  let registrado = false;    // o código de amigo desta conta chegou ao Firebase (é o que permite os outros te adicionarem)
  let falha = false;         // não consegui registrar o código (quase sempre regras do Firestore não publicadas)

  const pendentes = () => caixa.length;
  const podeEnviar = (i) => !!i && TIPOS_QUE_VIAJAM.includes(i.tipo);

  /* ---------- amigos e código ---------- */
  const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // sem 0/O/1/I, para não confundir ao digitar
  const novoCodigo = () => Array.from({ length: 6 }, () => ALFABETO[Math.floor(Math.random() * ALFABETO.length)]).join('');
  const normalizar = (t) => String(t || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const mostrarCodigo = (c) => c ? c.slice(0, 3) + '-' + c.slice(3) : '';
  const amigos = () => (S.perfil.amigos = S.perfil.amigos || []);
  const meuCodigo = () => (S.perfil || {}).codigoAmigo || '';

  /** Garante que esta conta tem um código de amigo e que ele está no Firebase. Roda ao abrir o app, o Correios e o envio. */
  async function registrarMe() {
    const a = API(); if (!a || !a.disponivel()) return false;
    const u = conta() || {};
    uidProprio = (window.Nuvem && window.Nuvem.uid) || uidProprio;
    const nome = String(u.nome || u.email || 'Alguém').split(' ')[0];
    const tentativas = meuCodigo() ? 1 : 5;   // código novo pode colidir com o de outra conta: sorteia outro
    for (let k = 0; k < tentativas; k++) {
      const codigo = meuCodigo() || novoCodigo();
      try {
        await a.registrar(nome, codigo);
        if (!meuCodigo()) { S.perfil.codigoAmigo = codigo; salvar(); }
        registrado = true; falha = false; return true;
      } catch (e) { /* tenta outro código */ }
    }
    registrado = false; falha = true; return false;
  }

  /* ---------- ligar: aparece na lista e passa a ouvir a caixa ---------- */
  async function ligar() {
    const a = API(); if (!a || !a.disponivel()) return;
    if (parar) { parar(); parar = null; }
    uidProprio = (window.Nuvem && window.Nuvem.uid) || '';
    await registrarMe();
    parar = a.ouvir((lista) => {
      if (!lista) return;   // erro de permissão: as regras do Firestore ainda não foram publicadas
      const antes = caixa.length;
      caixa = lista.slice().sort((x, y) => (y.enviadoEm || '').localeCompare(x.enviadoEm || ''));
      if (caixa.length > antes && UI.correiosVisto) toast('Chegou correspondência no Correios.', 'mail');
      UI.correiosVisto = true;
      UI.pularColheita = true; render();
    });
  }
  async function adicionarAmigo(texto) {
    const a = API(); if (!a || !a.disponivel()) return toast('Entre com a conta Google para usar o Correios.');
    const codigo = normalizar(texto);
    if (codigo.length !== 6) return toast('O código tem 6 letras e números, como ABC-123.');
    if (codigo === meuCodigo()) return toast('Esse é o seu próprio código.');
    let achou = null;
    try { achou = await a.buscar(codigo); } catch (e) { return toast('Não consegui buscar agora. Confira as regras do Firebase (docs/CORREIOS.md).'); }
    if (!achou) return toast('Não achei ninguém com esse código.');
    if (achou.uid === uidProprio) return toast('Esse é o seu próprio código.');
    if (amigos().some((x) => x.uid === achou.uid)) return toast(achou.nome + ' já está nos seus amigos.');
    amigos().push({ uid: achou.uid, nome: achou.nome || 'Amigo' });
    salvar(); UI.pularColheita = true; render();
    toast(achou.nome + ' adicionado(a) aos amigos.', 'check-circle-solid');
  }
  function removerAmigo(id) {
    const a = amigos().find((x) => x.uid === id); if (!a) return;
    S.perfil.amigos = amigos().filter((x) => x.uid !== id);
    salvar(); UI.pularColheita = true; render(); toast(a.nome + ' saiu dos amigos.');
  }
  function adicionarRemetente(idCarta) {
    const c = caixa.find((x) => x.id === idCarta); if (!c || !c.de) return;
    if (amigos().some((x) => x.uid === c.de)) return;
    amigos().push({ uid: c.de, nome: c.deNome || 'Amigo' });
    salvar(); UI.pularColheita = true; render(); toast((c.deNome || 'Amigo') + ' adicionado(a) aos amigos.', 'check-circle-solid');
  }
  async function copiarCodigo() {
    try { await navigator.clipboard.writeText(mostrarCodigo(meuCodigo())); toast('Código copiado.', 'check-circle-solid'); }
    catch (e) { toast('Seu código: ' + mostrarCodigo(meuCodigo())); }
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
        <div class="acoes-form">${btn('carta-salvar', ic('check') + 'Salvar no meu Tyba', `data-id="${esc(c.id)}"`, 'btn-1')}${btn('carta-dispensar', 'Dispensar', `data-id="${esc(c.id)}"`, 'btn-f')}${c.de && !amigos().some((x) => x.uid === c.de) ? btn('carta-amigo', ic('plus') + 'Adicionar ' + esc(c.deNome || 'amigo') + ' aos amigos', `data-id="${esc(c.id)}"`, 'btn-f') : ''}</div></div></article>`;
  }
  function amigosHTML() {
    const lista = amigos();
    return `<section class="cartao amigos-cartao" aria-label="Amigos do Correios">
      <h2 class="amigos-tit">${ic('user-circle')}Amigos</h2>
      <p class="meta">Seu código: <strong class="codigo-amigo">${meuCodigo() ? esc(mostrarCodigo(meuCodigo())) : '…'}</strong> ${meuCodigo() ? btn('correios-copiar', ic('copy') + 'Copiar', '', 'btn-f btn-p') : ''}</p>
      <p class="meta">Passe seu código para quem quer te mandar coisas. Para mandar para alguém, coloque o código dessa pessoa aqui:</p>
      <form class="amigo-form" data-form="correios-amigo"><input name="codigo" type="text" required maxlength="12" autocomplete="off" autocapitalize="characters" placeholder="Código do amigo (ABC-123)" aria-label="Código do amigo"><button class="btn-1" type="submit">${ic('plus')}Adicionar</button></form>
      ${lista.length ? `<ul class="lista-amigos">${lista.map((x) => `<li><span>${esc(x.nome)}</span>${ctx.btnIco('amigo-remover', 'xmark', 'Remover ' + x.nome, `data-uid="${esc(x.uid)}"`)}</li>`).join('')}</ul>` : '<p class="meta">Nenhum amigo ainda.</p>'}</section>`;
  }
  function renderCorreios() {
    const on = disponivel();
    if (on && !registrado && !UI.correiosRegistrando) { UI.correiosRegistrando = true; registrarMe().then(() => { UI.correiosRegistrando = false; if ((location.hash || '').startsWith('#/correios')) { UI.pularColheita = true; render(); } }); }
    main.innerHTML = `<header class="pagina-cab"><h1>${ic('mail')}Correios</h1></header>
      <p class="meta" style="margin:-6px 0 14px">Itens que amigos mandaram para você. Para mandar um, abra o menu ⋯ do item e escolha “Enviar pelo Correios”.</p>
      ${on && falha ? '<p class="dica" style="margin-bottom:14px">' + ic('priority-high') + '<span>Não consegui registrar seu código no Firebase. Recarregue a página; se continuar, as regras do Firebase não foram publicadas (veja docs/CORREIOS.md).</span></p>' : ''}
      ${!on ? vazio('mail', 'O Correios funciona com a conta Google ligada à nuvem. Entre com sua conta e espere a sincronização ligar.')
        : `${amigosHTML()}<h2 class="cartas-tit">Caixa de entrada</h2>${caixa.length ? `<div class="cartas">${caixa.map(cartaHTML).join('')}</div>` : vazio('mail', 'Sua caixa de entrada está vazia.')}`}`;
  }

  /* ---------- janela de envio ---------- */
  function modalEnvio(m) {
    const ids = m.ids || [];
    const n = ids.length;
    const am = amigos();
    const lista = !am.length ? '<p class="dica">' + ic('priority-high') + '<span>Você ainda não tem amigos no Correios. Abra o <a href="#/correios">Correios</a> e adicione o código de um amigo.</span></p>'
      : `<div class="opcoes-amigos" role="radiogroup" aria-label="Para quem">${am.map((p, k) => `<label class="opcao-amigo"><input type="radio" name="destino" value="${esc(p.uid)}" ${k === 0 ? 'checked' : ''} required><span>${esc(p.nome || 'Sem nome')}</span></label>`).join('')}</div>`;
    return `<form class="modal" method="dialog" data-form="correios-enviar">
      <header class="modal-cab">${ic('send')}<h2>Enviar ${n} ${n === 1 ? 'item' : 'itens'} pelo Correios</h2>${ctx.btnIco('modal-fechar', 'xmark', 'Fechar')}</header>
      <div class="modal-corpo"><div class="form">${lista}
        <label class="campo"><span>Bilhete <span class="opcional">(opcional)</span></span><textarea name="bilhete" rows="2" maxlength="280" placeholder="ex.: lembrei de você quando vi isso"></textarea></label></div></div>
      <footer class="modal-pe"><span class="espaco"></span>${btn('modal-fechar', 'Cancelar', '', 'btn-f')}
        <button class="btn-1" type="submit" ${am.length ? '' : 'disabled'}>${ic('send')}Enviar</button></footer></form>`;
  }
  async function abrirEnvio(ids) {
    const lista = (ids || []).filter((id) => podeEnviar(item(id)));
    if (!lista.length) return toast('Esse tipo de item não viaja pelo Correios.');
    if (!disponivel()) return toast('Entre com a conta Google para usar o Correios.');
    ctx.abrirModal({ tipo: 'correios-enviar', ids: lista });
    registrarMe();
  }
  async function enviarForm(d) {
    const m = UI.modal || {};
    if (!d.destino) return toast('Escolha para quem enviar.');
    const bt = document.querySelector('#modal button[type=submit]');
    if (bt) { bt.disabled = true; bt.innerHTML = ic('refresh') + 'Enviando…'; }
    const n = await enviar(m.ids || [], d.destino, d.bilhete);
    if (!n && bt) { bt.disabled = false; bt.innerHTML = ic('send') + 'Enviar'; }
    if (n) {
      const quem = (amigos().find((p) => p.uid === d.destino) || {}).nome || 'a pessoa';
      UI.modal = null; if (Array.isArray(UI.sel)) UI.sel = [];
      UI.pularColheita = true; render(); toast(n + (n === 1 ? ' item enviado' : ' itens enviados') + ' para ' + quem + '.', 'check-circle-solid');
    }
  }

  function desligar() { if (parar) { parar(); parar = null; } caixa = []; UI.correiosVisto = false; }

  return { adicionarAmigo, removerAmigo, adicionarRemetente, copiarCodigo, amigos, meuCodigo, desligar, renderCorreios, modalEnvio, abrirEnvio, enviarForm, salvarCarta, dispensar, ligar, pendentes, podeEnviar, disponivel };
};
