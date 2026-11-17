/* Tyba — captura de links e produtos.
   Módulo separado do app.js: recebe do app o que precisa (estado, utilidades) por `ctx` e devolve só o que o resto do app usa.
   `S` aqui é um espelho do estado do app (que troca de objeto ao importar backup ou sincronizar), então sempre aponta para o atual. */
window.TybaCaptura = function (ctx) {
  'use strict';
  const { UI, HORAS_CONFERIR } = ctx;
  const S = new Proxy({}, { get: (_, k) => ctx.S()[k], set: (_, k, v) => { ctx.S()[k] = v; return true; }, has: (_, k) => k in ctx.S(), ownKeys: () => Reflect.ownKeys(ctx.S()), getOwnPropertyDescriptor: (_, k) => ({ value: ctx.S()[k], enumerable: true, configurable: true, writable: true }) });
  const agora = (...a) => ctx.agora(...a), toast = (...a) => ctx.toast(...a), salvar = (...a) => ctx.salvar(...a), render = (...a) => ctx.render(...a);
  /* ---------------- captura (links, produtos) ---------------- */
  async function capturar(i, silencioso) {
    if (!UI.servidor) {
      i.capturaStatus = 'pendente'; salvar(); render();
      if (!silencioso) toast(i.tipo === 'desejo' ? 'Link salvo. A captura precisa do servidor ligado.' : 'Link salvo sem prévia: a captura precisa do servidor.');
      return;
    }
    i.capturaStatus = 'capturando'; render();
    try {
      const r = await fetch('api/capturar?url=' + encodeURIComponent(i.url));
      const j = await r.json();
      if (!r.ok || j.erro) throw new Error(j.erro || 'falha');
      if (j.nome && !i.tituloManual) i.titulo = j.nome;
      if (j.descricao && !i.descricao) i.descricao = j.descricao;
      if (j.imagem && !i.imagemManual) i.imagem = j.imagem;
      if (j.favicon) i.favicon = j.favicon;
      if (j.loja) i.loja = j.loja;
      if (j.estrelas != null) i.estrelas = j.estrelas;
      if (j.avaliacoes != null) i.avaliacoes = j.avaliacoes;
      if (j.moeda) i.moeda = j.moeda;
      if (i.tipo === 'desejo' && j.preco != null) {
        i.historicoPreco = i.historicoPreco || [];
        const u = i.historicoPreco[i.historicoPreco.length - 1];
        if (!u || u.preco !== j.preco) i.historicoPreco.push({ em: agora(), preco: j.preco });
        i.preco = j.preco;
      }
      i.faltando = i.tipo === 'desejo'
        ? [['nome', i.titulo], ['foto', i.imagem], ['preço', i.preco]].filter(([, v]) => v === undefined || v === null || v === '').map(([k]) => k)
        : [];
      i.capturaStatus = i.faltando.length ? 'parcial' : 'ok';
      i.capturaEm = agora(); delete i.capturaErro;
      if (!silencioso) toast(i.faltando.length ? 'Capturei em parte. Faltou: ' + i.faltando.join(', ') + '.' : 'Capturado.', 'check-circle-solid');
    } catch (e) {
      i.capturaStatus = 'falhou'; i.capturaErro = String(e.message || e);
      if (!silencioso) toast('Não consegui ler essa página (' + i.capturaErro + '). O link ficou salvo.');
    }
    i.capturaTentativaEm = agora();   // falha também conta: a conferência automática só tenta de novo depois de HORAS_CONFERIR
    salvar(); render();
  }

  return { capturar };
};
