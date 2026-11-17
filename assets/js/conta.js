/* Tyba — conta Google e sincronização com a nuvem.
   Módulo separado do app.js: recebe do app o que precisa (estado, utilidades) por `ctx` e devolve só o que o resto do app usa.
   `S` aqui é um espelho do estado do app (que troca de objeto ao importar backup ou sincronizar), então sempre aponta para o atual. */
window.TybaConta = function (ctx) {
  'use strict';
  const { UI, main, navLateral, direita, layout, topoPerfil } = ctx;
  const S = new Proxy({}, { get: (_, k) => ctx.S()[k], set: (_, k, v) => { ctx.S()[k] = v; return true; }, has: (_, k) => k in ctx.S(), ownKeys: () => Reflect.ownKeys(ctx.S()), getOwnPropertyDescriptor: (_, k) => ({ value: ctx.S()[k], enumerable: true, configurable: true, writable: true }) });
  const esc = (...a) => ctx.esc(...a), agora = (...a) => ctx.agora(...a), fmtHora = (...a) => ctx.fmtHora(...a), corta = (...a) => ctx.corta(...a), canon = (...a) => ctx.canon(...a), ic = (...a) => ctx.ic(...a), toast = (...a) => ctx.toast(...a), salvar = (...a) => ctx.salvar(...a), carregar = (...a) => ctx.carregar(...a), migrar = (...a) => ctx.migrar(...a), cartao = (...a) => ctx.cartao(...a), rotaAtual = (...a) => ctx.rotaAtual(...a), render = (...a) => ctx.render(...a), confirmar = (...a) => ctx.confirmar(...a), excluidoAntes = (...a) => ctx.excluidoAntes(...a);
  /* ---------------- conta Google ---------------- */
  const CLIENTE_GOOGLE = (window.CONFIG || {}).googleClientId || '';
  const logado = () => UI.sessao.modo === 'logado';
  const conta = () => UI.sessao.usuario || null;

  function carregarScript(src) {
    return new Promise((ok, falha) => {
      if (document.querySelector(`script[src="${src}"]`)) return ok();
      const el = document.createElement('script');
      el.src = src; el.async = true; el.onload = () => ok(); el.onerror = () => falha(new Error('não carregou'));
      document.head.appendChild(el);
    });
  }
  async function lerSessao() {
    if (location.protocol === 'file:' || !CLIENTE_GOOGLE) return { modo: 'local' };
    try {
      const r = await fetch('api/sessao', { cache: 'no-store' });
      if (!r.ok) return { modo: 'local' };
      const d = await r.json();
      return d.logado ? { modo: 'logado', usuario: d.usuario, restrito: d.restrito } : { modo: 'deslogado', restrito: d.restrito };
    } catch (e) { return { modo: 'local' }; }
  }
  function renderEntrada() {
    document.body.classList.add('entrando');
    main.innerHTML = `<div class="entrada"><section class="cartao entrada-cartao">
        <span class="logo-tyba grande" role="img" aria-label="Tyba"></span>
        <h1 class="sr-only">Tyba</h1>
        <p class="meta">Entre com sua conta Google para abrir seu arquivo pessoal.</p>
        <div id="botao-google"></div>
        ${UI.erroEntrada ? `<p class="erro">${esc(UI.erroEntrada)}</p>` : ''}
        <p class="meta">Os registros ficam guardados neste navegador. A conta serve para identificar você e proteger a página publicada.</p>
      </section></div>`;
    navLateral.innerHTML = ''; direita.innerHTML = ''; direita.hidden = true; topoPerfil.innerHTML = '';
    layout.classList.add('sem-direita');
    carregarScript('https://accounts.google.com/gsi/client').then(() => {
      google.accounts.id.initialize({ client_id: CLIENTE_GOOGLE, callback: aoEntrar, cancel_on_tap_outside: false });
      google.accounts.id.renderButton(document.getElementById('botao-google'), { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', locale: 'pt-BR', width: 280 });
    }).catch(() => {
      document.getElementById('botao-google').innerHTML = `<p class="aviso">${ic('priority-high')}<span>Não consegui carregar o login do Google. Verifique a conexão e recarregue a página.</span></p>`;
    });
  }
  async function aoEntrar(resposta) {
    UI.erroEntrada = '';
    try {
      const r = await fetch('api/sessao', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ credential: resposta.credential }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.erro || 'não deu certo');
      UI.sessao = { modo: 'logado', usuario: d.usuario, restrito: UI.sessao.restrito };
      document.body.classList.remove('entrando');
      UI.pularColheita = true; render();
      toast('Bem-vindo, ' + d.usuario.nome.split(' ')[0] + '.', 'check-circle-solid');
      if (window.Nuvem && Nuvem.configurado()) {
        try { await Nuvem.entrarComGoogle(resposta.credential); await ligarNuvem(true); }
        catch (er) { UI.nuvem.estado = 'erro'; UI.nuvem.erro = String(er.message || er); pintarNuvem(); }
      }
    } catch (e) {
      UI.erroEntrada = String(e.message || e); renderEntrada();
    }
  }
  async function sair() {
    if (!(await confirmar('Sair da conta?\n\nOs registros continuam guardados neste navegador.', { ok: 'Sair', perigo: false, icone: 'undo' }))) return;
    try { await fetch('api/sessao', { method: 'DELETE' }); } catch (e) { /* ignora */ }
    try { if (window.google && google.accounts) google.accounts.id.disableAutoSelect(); } catch (e) { /* ignora */ }
    try { ctx.correiosDesligar(); } catch (e) { /* ignora */ }
    try { if (window.Nuvem) await Nuvem.sair(); } catch (e) { /* ignora */ }
    UI.nuvem = { estado: 'local', em: '', erro: '' };
    UI.sessao = { modo: 'deslogado', restrito: UI.sessao.restrito };
    renderEntrada();
  }

  /* ---------------- sincronização com a nuvem ---------------- */
  let ULTIMO = { base: '', itens: {}, lembretes: {} };
  let timerSync = null;
  const limpo = (o) => JSON.parse(JSON.stringify(o));
  const quando = (x) => x.atualizadoEm || x.editadoEm || x.criadoEm || '';
  const nuvemLigada = () => UI.nuvem.estado === 'ligada' || UI.nuvem.estado === 'enviando';
  const baseNuvem = () => limpo({ perfil: S.perfil, colecoes: S.colecoes, pastas: S.pastas,
    destinoPadrao: S.destinoPadrao, curriculo: S.curriculo, eventos: S.eventos || [], stickers: S.stickers || {}, versao: S.versao, atualizadoEm: S.baseEm || '' });

  function diferencas() {
    const b = baseNuvem();
    const mud = { itens: [], lembretes: [], apagar: { itens: [], lembretes: [] } };
    if (canon(b) !== ULTIMO.base) { S.baseEm = agora(); b.atualizadoEm = S.baseEm; mud.base = b; }
    [['itens', S.itens], ['lembretes', S.lembretes]].forEach(([nome, lista]) => {
      const vistos = new Set();
      lista.forEach((x) => {
        vistos.add(x.id);
        if (ULTIMO[nome][x.id] !== canon(x)) { x.atualizadoEm = agora(); mud[nome].push(limpo(x)); }
      });
      Object.keys(ULTIMO[nome]).forEach((id) => { if (!vistos.has(id)) mud.apagar[nome].push(id); });
      Object.keys((S.excluidos || {})[nome] || {}).forEach((id) => { if (!vistos.has(id) && !mud.apagar[nome].includes(id)) mud.apagar[nome].push(id); });
    });
    return mud;
  }
  function registrarEnviado(mud) {
    if (mud.base) ULTIMO.base = canon(baseNuvem());
    ['itens', 'lembretes'].forEach((n) => {
      S[n].forEach((x) => (ULTIMO[n][x.id] = canon(x)));
      mud.apagar[n].forEach((id) => delete ULTIMO[n][id]);
    });
  }
  function agendarSync(espera = 1200) {
    if (!nuvemLigada()) return;
    clearTimeout(timerSync);
    timerSync = setTimeout(async () => {
      const mud = diferencas();
      if (!mud.base && !mud.itens.length && !mud.lembretes.length && !mud.apagar.itens.length && !mud.apagar.lembretes.length) return;
      UI.nuvem.estado = 'enviando'; pintarNuvem();
      try {
        await Nuvem.enviar(mud);
        registrarEnviado(mud);
        UI.nuvem.estado = 'ligada'; UI.nuvem.em = agora(); UI.nuvem.erro = '';
        salvar();
      } catch (e) {
        UI.nuvem.estado = 'erro'; UI.nuvem.erro = String(e.message || e);
      }
      pintarNuvem();
    }, espera);
  }
  function pintarNuvem() {
    if ((rotaAtual()[0] || '') === 'config' && !UI.modal) { UI.pularColheita = true; return render(); }
    const el = document.getElementById('estado-nuvem');
    if (el) el.innerHTML = textoNuvem();
  }
  function textoNuvem() {
    const e = UI.nuvem.estado;
    if (e === 'enviando') return ic('refresh') + ' Salvando na nuvem…';
    if (e === 'ligada') return ic('check-circle-solid') + ' Sincronizado' + (UI.nuvem.em ? ' · ' + fmtHora(UI.nuvem.em) : '');
    if (e === 'erro') return ic('priority-high') + ' Não consegui sincronizar agora. O que você salvou continua guardado neste navegador.<br><span class="suave">' + esc(corta(UI.nuvem.erro, 140)) + '</span>';
    if (e === 'ligando') return ic('refresh') + ' Ligando…';
    if (e === 'desligada') return ic('priority-high') + ' Sincronização desligada neste navegador';
    return ic('database-backup') + ' Só neste navegador';
  }

  async function puxarEMesclar() {
    const r = await Nuvem.baixarTudo();
    if (!r) return false;
    let mudou = false;
    if (r.base && (r.base.atualizadoEm || '') > (S.baseEm || '')) {
      ['perfil', 'colecoes', 'pastas', 'destinoPadrao', 'curriculo', 'eventos', 'stickers'].forEach((k) => { if (r.base[k] !== undefined) S[k] = k === 'eventos' ? r.base[k] : r.base[k]; });
      S.baseEm = r.base.atualizadoEm; mudou = true;
    }
    [['itens', r.itens], ['lembretes', r.lembretes]].forEach(([nome, remotos]) => {
      remotos.forEach((rem) => {
        if (excluidoAntes(nome, rem.id)) return;   // apagado aqui: não volta (a exclusão é reenviada à nuvem)
        const k = S[nome].findIndex((x) => x.id === rem.id);
        if (k < 0) { S[nome].push(rem); mudou = true; }
        else if (quando(rem) > quando(S[nome][k])) { S[nome][k] = rem; mudou = true; }
      });
    });
    migrar(S);
    ULTIMO = { base: canon(baseNuvem()), itens: {}, lembretes: {} };
    [['itens', r.itens], ['lembretes', r.lembretes]].forEach(([nome, remotos]) => {
      remotos.forEach((rem) => {
        const local = S[nome].find((x) => x.id === rem.id);
        if (local && canon(local) === canon(rem)) ULTIMO[nome][rem.id] = canon(rem);
      });
    });
    if (r.base && canon(baseNuvem()) !== canon(r.base)) ULTIMO.base = '';
    if (mudou) salvar();
    return mudou;
  }
  function aplicarRemoto(d) {
    let mudou = false;
    if (d.base && (d.base.atualizadoEm || '') > (S.baseEm || '')) {
      ['perfil', 'colecoes', 'pastas', 'destinoPadrao', 'curriculo', 'eventos', 'stickers'].forEach((k) => { if (d.base[k] !== undefined) S[k] = k === 'eventos' ? d.base[k] : d.base[k]; });
      S.baseEm = d.base.atualizadoEm; ULTIMO.base = canon(baseNuvem()); mudou = true;
    }
    [['itens', d.itens, d.apagarItens], ['lembretes', d.lembretes, d.apagarLembretes]].forEach(([nome, novos, fora]) => {
      (novos || []).forEach((rem) => {
        if (excluidoAntes(nome, rem.id)) return;
        const k = S[nome].findIndex((x) => x.id === rem.id);
        if (k < 0) { S[nome].push(rem); mudou = true; }
        else if (quando(rem) > quando(S[nome][k])) { S[nome][k] = rem; mudou = true; }
        ULTIMO[nome][rem.id] = canon(S[nome].find((x) => x.id === rem.id));
      });
      (fora || []).forEach((id) => {
        if (S[nome].some((x) => x.id === id)) { S[nome] = S[nome].filter((x) => x.id !== id); mudou = true; }
        delete ULTIMO[nome][id];
      });
    });
    if (mudou) { migrar(S); salvar(); UI.pularColheita = true; render(); toast('Atualizado de outro aparelho.', 'refresh'); }
  }

  async function ligarNuvem(primeira) {
    UI.nuvem.estado = 'ligando'; pintarNuvem();
    try {
      await puxarEMesclar();
      Nuvem.ouvir(aplicarRemoto);
      try { ctx.correiosLigar(); } catch (e) { /* o Correios é opcional */ }
      UI.nuvem.estado = 'ligada'; UI.nuvem.em = agora(); UI.nuvem.erro = '';
      UI.pularColheita = true; render();
      agendarSync(300);
      if (primeira) toast('Sincronização ligada.', 'check-circle-solid');
    } catch (e) {
      UI.nuvem.estado = 'erro'; UI.nuvem.erro = String(e.message || e);
      pintarNuvem();
    }
  }

  return { CLIENTE_GOOGLE, logado, conta, carregarScript, lerSessao, renderEntrada, aoEntrar, sair, limpo, quando, nuvemLigada, agendarSync, pintarNuvem, textoNuvem, ligarNuvem };
};
