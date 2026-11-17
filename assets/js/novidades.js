/* Tyba — popup de novidades (O que há de novo).
   Módulo separado do app.js: recebe do app o que precisa (estado, utilidades) por `ctx` e devolve só o que o resto do app usa.
   `S` aqui é um espelho do estado do app (que troca de objeto ao importar backup ou sincronizar), então sempre aponta para o atual. */
window.TybaNovidades = function (ctx) {
  'use strict';
  const { UI, CHAVE_NOVID } = ctx;
  const S = new Proxy({}, { get: (_, k) => ctx.S()[k], set: (_, k, v) => { ctx.S()[k] = v; return true; }, has: (_, k) => k in ctx.S(), ownKeys: () => Reflect.ownKeys(ctx.S()), getOwnPropertyDescriptor: (_, k) => ({ value: ctx.S()[k], enumerable: true, configurable: true, writable: true }) });
  const esc = (...a) => ctx.esc(...a), fmtDia = (...a) => ctx.fmtDia(...a), ic = (...a) => ctx.ic(...a), btn = (...a) => ctx.btn(...a), quando = (...a) => ctx.quando(...a);
  /* ---------------- novidades ----------------
     A lista vem de assets/js/atualizacoes.js, da mais nova para a mais antiga.
     O popup abre sozinho quando a versão do topo ainda não foi vista aqui. */
  const listaNovidades = () => (Array.isArray(window.ATUALIZACOES) ? window.ATUALIZACOES : []);
  const versaoNova = () => (listaNovidades()[0] || {}).versao || '';
  const versaoVista = () => { try { return localStorage.getItem(CHAVE_NOVID) || ''; } catch (e) { return versaoNova(); } };
  const temNovidade = () => !!versaoNova() && versaoVista() !== versaoNova();
  function marcarNovidadesVistas() { try { localStorage.setItem(CHAVE_NOVID, versaoNova()); } catch (e) { /* ignora */ } }
  function novidadesHTML() {
    const lista = listaNovidades();
    if (!lista.length) return '<p class="meta">Nada por aqui ainda.</p>';
    // uma página por dia, da mais nova para a mais antiga
    const dias = [];
    lista.forEach((a) => {
      const d = dias.find((x) => x.data === a.data);
      (d ? d.itens : (dias.push({ data: a.data, itens: [] }), dias[dias.length - 1].itens)).push(a);
    });
    const vista = versaoVista();
    let n = UI.novidPagina;
    if (n === undefined || n < 0 || n >= dias.length) {
      n = dias.findIndex((d) => d.itens.some((a) => !vista || a.versao > vista));
      if (n < 0) n = 0;
    }
    const pag = dias[n];
    const bloco = (a) => `<section class="novid">
      <h3>${esc(a.titulo)}<small>versão ${esc(a.versao)}</small></h3>
      <ul>${(a.itens || []).map((t) => `<li>${esc(t)}</li>`).join('')}</ul></section>`;
    return `<div class="novid-dia"><span>${ic('calendar')}${esc(fmtDia(pag.data))}</span>
        <span class="meta">${n + 1} de ${dias.length}</span></div>
      ${pag.itens.map(bloco).join('')}
      ${dias.length > 1 ? `<div class="novid-pag">
        ${btn('novid-ir', ic('nav-arrow-left') + 'Mais novo', `data-n="${n - 1}" ${n === 0 ? 'disabled' : ''}`, 'btn-f btn-p')}
        <span class="espaco"></span>
        ${btn('novid-ir', 'Mais antigo' + ic('nav-arrow-right'), `data-n="${n + 1}" ${n === dias.length - 1 ? 'disabled' : ''}`, 'btn-f btn-p')}</div>` : ''}`;
  }

  return { versaoNova, temNovidade, marcarNovidadesVistas, novidadesHTML };
};
