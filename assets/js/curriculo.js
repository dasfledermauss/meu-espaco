/* Tyba — currículo (adaptador de importação + tela).
   Módulo separado do app.js: recebe do app o que precisa (estado, utilidades) por `ctx` e devolve só o que o resto do app usa.
   `S` aqui é um espelho do estado do app (que troca de objeto ao importar backup ou sincronizar), então sempre aponta para o atual. */
window.TybaCurriculo = function (ctx) {
  'use strict';
  const { UI, main } = ctx;
  const S = new Proxy({}, { get: (_, k) => ctx.S()[k], set: (_, k, v) => { ctx.S()[k] = v; return true; }, has: (_, k) => k in ctx.S(), ownKeys: () => Reflect.ownKeys(ctx.S()), getOwnPropertyDescriptor: (_, k) => ({ value: ctx.S()[k], enumerable: true, configurable: true, writable: true }) });
  const esc = (...a) => ctx.esc(...a), hoje = (...a) => ctx.hoje(...a), agora = (...a) => ctx.agora(...a), ic = (...a) => ctx.ic(...a), btnTxt = (...a) => ctx.btnTxt(...a), btn = (...a) => ctx.btn(...a), menuMais = (...a) => ctx.menuMais(...a), toast = (...a) => ctx.toast(...a), item = (...a) => ctx.item(...a), cartao = (...a) => ctx.cartao(...a), campo = (...a) => ctx.campo(...a), txt = (...a) => ctx.txt(...a), area = (...a) => ctx.area(...a), selectHTML = (...a) => ctx.selectHTML(...a), confirmar = (...a) => ctx.confirmar(...a), fmtAM = (...a) => ctx.fmtAM(...a), norm = (...a) => ctx.norm(...a), clone = (...a) => ctx.clone(...a), semVazios = (...a) => ctx.semVazios(...a), canon = (...a) => ctx.canon(...a), vazio = (...a) => ctx.vazio(...a);
  /* ---------------- currículo: adaptador e importação ---------------- */
  const SEC = {
    experiencias: { nome: 'Experiência profissional', prefixo: 'exp',
      campos: [['cargo', 'Cargo'], ['organizacao', 'Organização'], ['inicio', 'Início (AAAA-MM)'], ['fim', 'Fim (AAAA-MM; vazio = atual)'],
        ['periodo_texto', 'Período como texto'], ['atividades', 'Atividades (uma por linha)', 'linhas'], ['descricao', 'Descrição', 'area'], ['portfolio', 'Link de portfólio']],
      chave: (i) => [i.cargo, i.organizacao], titulo: (i) => i.cargo || '(sem cargo)',
      sub: (i) => [i.organizacao, periodo(i)].filter(Boolean).join(' · ') },
    formacao: { nome: 'Formação', prefixo: 'form',
      campos: [['titulo', 'Título'], ['instituicao', 'Instituição'], ['ano', 'Ano', 'num'], ['ano_inicio', 'Ano de início', 'num'], ['ano_fim', 'Ano de conclusão', 'num']],
      chave: (i) => [i.titulo, i.instituicao], titulo: (i) => i.titulo || '(sem título)',
      sub: (i) => [i.instituicao, anos(i)].filter(Boolean).join(' · ') },
    cursos: { nome: 'Cursos e certificações', prefixo: 'curso',
      campos: [['titulo', 'Título'], ['instituicao', 'Instituição'], ['ano', 'Ano', 'num'], ['certificado', 'Link do certificado']],
      chave: (i) => [i.titulo, i.instituicao], titulo: (i) => i.titulo || '(sem título)',
      sub: (i) => [i.instituicao, anos(i)].filter(Boolean).join(' · ') },
    habilidades: { nome: 'Habilidades', prefixo: 'hab',
      campos: [['titulo', 'Grupo'], ['itens', 'Itens (um por linha)', 'linhas']],
      chave: (i) => [i.titulo], titulo: (i) => i.titulo || '(sem nome)', sub: (i) => (i.itens || []).join(' · ') },
    idiomas: { nome: 'Idiomas', prefixo: 'idi',
      campos: [['idioma', 'Idioma'], ['nivel', 'Nível']],
      chave: (i) => [i.idioma], titulo: (i) => i.idioma || '(sem idioma)', sub: (i) => i.nivel || '' }
  };
  const SECOES = Object.keys(SEC);
  const PERFIL_CAMPOS = [['nome', 'Nome'], ['titulo', 'Título profissional'], ['sobre', 'Resumo profissional', 'area']];

  function periodo(i) {
    if (i.periodo_texto) return i.periodo_texto;
    const a = fmtAM(i.inicio); if (!a) return '';
    if (i.fim === null || i.em_andamento) return a + ' – presente';
    return i.fim ? a + ' – ' + fmtAM(i.fim) : a;
  }
  function anos(i) {
    if (i.ano) return String(i.ano);
    if (i.ano_inicio || i.ano_fim) return [i.ano_inicio, i.ano_fim].filter(Boolean).join('–');
    return '';
  }

  /* Aceita o formato v1 do escopo e a estrutura do arquivo de exemplo. */
  function adaptarCV(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { erro: 'O arquivo precisa conter um objeto JSON.' };
    const ehV1 = 'versao' in raw || 'perfil' in raw || 'experiencias' in raw || 'cursos' in raw;
    const ehExemplo = 'experiencia' in raw || 'titulo_profissional' in raw || 'habilidades' in raw || 'idiomas' in raw || 'nome' in raw || 'formacao' in raw;
    if (!ehV1 && !ehExemplo) return { erro: 'Estrutura desconhecida: não encontrei perfil, experiências, formação, cursos, habilidades ou idiomas.', mostrarExemplo: true };
    if (ehV1 && raw.versao !== undefined && raw.versao !== 1) return { erro: 'Versão ' + raw.versao + ' não suportada. Este protótipo lê a versão 1.' };

    const cv = { perfil: null, extras: {} };
    const conhecidas = new Set(['versao', 'exportadoEm', 'perfil', 'experiencias', 'experiencia', 'formacao', 'cursos', 'habilidades', 'idiomas',
      'nome', 'titulo_profissional', 'contato', 'sobre', 'projeto_em_desenvolvimento']);
    Object.keys(raw).forEach((k) => { if (!conhecidas.has(k)) cv.extras[k] = raw[k]; });

    if (raw.perfil && typeof raw.perfil === 'object') cv.perfil = clone(raw.perfil);
    else if ('nome' in raw || 'titulo_profissional' in raw || 'contato' in raw || 'sobre' in raw) {
      cv.perfil = semVazios({ nome: raw.nome, titulo: raw.titulo_profissional, contato: raw.contato, sobre: raw.sobre, projeto_em_desenvolvimento: raw.projeto_em_desenvolvimento });
    }

    const lista = (k, nome) => {
      const v = raw[k];
      if (v === undefined) return undefined;
      if (!Array.isArray(v)) throw new Error('A seção "' + nome + '" precisa ser uma lista.');
      v.forEach((it, i) => { if (!it || typeof it !== 'object' || Array.isArray(it)) throw new Error('Item ' + (i + 1) + ' de "' + nome + '" não é um objeto.'); });
      return v;
    };
    try {
      const exps = lista('experiencias', 'experiencias') || lista('experiencia', 'experiencia');
      if (exps) cv.experiencias = exps.map((x, i) => {
        const o = clone(x);
        if (!('cargo' in o) && 'titulo' in o) { o.cargo = o.titulo; delete o.titulo; }
        if (o.periodo && typeof o.periodo === 'object') {
          const p = o.periodo; delete o.periodo;
          if (p.inicio !== undefined) o.inicio = p.inicio;
          if (p.fim !== undefined) o.fim = p.fim;
          if (p.em_andamento !== undefined) o.em_andamento = p.em_andamento;
          if (p.texto !== undefined) o.periodo_texto = p.texto;
        }
        if (!o.cargo && !o.organizacao) throw new Error('Item ' + (i + 1) + ' de experiência sem cargo nem organização.');
        if (o.atividades !== undefined && !Array.isArray(o.atividades)) throw new Error('Item ' + (i + 1) + ' de experiência: "atividades" precisa ser uma lista.');
        return o;
      });
      ['formacao', 'cursos', 'habilidades', 'idiomas'].forEach((s) => {
        const v = lista(s, s);
        if (!v) return;
        v.forEach((o, i) => ['ano', 'ano_inicio', 'ano_fim'].forEach((k) => {
          if (o[k] !== undefined && o[k] !== null && !Number.isInteger(Number(o[k]))) throw new Error('Item ' + (i + 1) + ' de "' + SEC[s].nome + '": "' + k + '" precisa ser um ano.');
        }));
        cv[s] = clone(v);
      });
    } catch (e) { return { erro: e.message }; }
    return { cv };
  }

  function proximoId(lista, prefixo, usados) {
    let max = 0;
    lista.concat(usados || []).forEach((i) => { const m = String(i.id || i).match(/-(\d+)$/); if (m && String(i.id || i).startsWith(prefixo)) max = Math.max(max, +m[1]); });
    return prefixo + '-' + String(max + 1).padStart(3, '0');
  }
  function cvComIds(cv) {
    const out = { perfil: cv.perfil || {}, extras: cv.extras || {} };
    SECOES.forEach((s) => {
      out[s] = [];
      (cv[s] || []).forEach((it) => { const o = clone(it); if (!o.id) o.id = proximoId(out[s], SEC[s].prefixo); out[s].push(o); });
    });
    return out;
  }

  function planejarImportacao(atual, novo) {
    const plano = { perfil: null, secoes: {}, extras: novo.extras };
    if (novo.perfil) {
      const difs = [];
      ['nome', 'titulo', 'sobre', 'contato', 'projeto_em_desenvolvimento'].forEach((k) => {
        if (novo.perfil[k] !== undefined && canon(novo.perfil[k]) !== canon(atual.perfil[k])) difs.push(k);
      });
      if (difs.length) plano.perfil = { campos: difs, novo: novo.perfil, escolha: Object.keys(atual.perfil || {}).length ? 'manter' : 'importar' };
    }
    SECOES.forEach((s) => {
      if (!novo[s]) return; // seção ausente preserva os dados atuais
      const cfg = SEC[s];
      const chave = (i) => cfg.chave(i).map(norm).join('|');
      const linhas = [];
      novo[s].forEach((it) => {
        let r;
        const porId = it.id && atual[s].find((e) => e.id === it.id);
        if (porId) r = canon(porId) === canon(it) ? { tipo: 'igual', it, alvo: porId } : { tipo: 'alterado', it, alvo: porId, escolha: 'manter' };
        else {
          const exatos = atual[s].filter((e) => chave(e) === chave(it));
          if (exatos.length === 1) r = canon(exatos[0]) === canon(it) ? { tipo: 'igual', it, alvo: exatos[0] } : { tipo: 'alterado', it, alvo: exatos[0], escolha: 'manter' };
          else if (exatos.length > 1) r = { tipo: 'ambiguo', it, candidatos: exatos, escolha: 'ignorar' };
          else {
            const partes = cfg.chave(it).map(norm);
            const parciais = atual[s].filter((e) => cfg.chave(e).map(norm).some((p, k) => p && p === partes[k]));
            r = parciais.length ? { tipo: 'ambiguo', it, candidatos: parciais, escolha: 'novo' } : { tipo: 'novo', it, escolha: 'incluir' };
          }
        }
        linhas.push(r);
      });
      plano.secoes[s] = linhas;
    });
    return plano;
  }

  function aplicarImportacao(plano) {
    const cv = clone(S.curriculo);
    if (plano.perfil && plano.perfil.escolha === 'importar') cv.perfil = Object.assign({}, cv.perfil, clone(plano.perfil.novo));
    Object.assign(cv.extras, plano.extras || {});
    Object.entries(plano.secoes).forEach(([s, linhas]) => {
      const usados = [];
      linhas.forEach((l) => {
        const novoComId = () => {
          const o = clone(l.it);
          if (!o.id || cv[s].some((e) => e.id === o.id)) o.id = proximoId(cv[s], SEC[s].prefixo, usados);
          usados.push(o.id); cv[s].push(o);
        };
        const substituir = (alvoId) => {
          const idx = cv[s].findIndex((e) => e.id === alvoId);
          if (idx >= 0) cv[s][idx] = Object.assign(clone(l.it), { id: alvoId });
        };
        if (l.tipo === 'novo' && l.escolha === 'incluir') novoComId();
        else if (l.tipo === 'alterado' && l.escolha === 'importar') substituir(l.alvo.id);
        else if (l.tipo === 'ambiguo') {
          if (l.escolha === 'novo') novoComId();
          else if (l.escolha.startsWith('sub:')) substituir(l.escolha.slice(4));
        }
      });
    });
    return cv;
  }




  /* ---------------- Currículo ---------------- */
  function renderCurriculo() {
    if (UI.plano) return renderRevisao();
    const cv = S.curriculo, p = cv.perfil || {}, c = p.contato || {};
    const ed = UI.cvEdit;
    const cabecalho = (ed && ed.sec === 'perfil')
      ? `<form class="form" data-form="cv-perfil">
          ${PERFIL_CAMPOS.map(([k, n, t]) => campo('cvp-' + k, n, t === 'area' ? area('cvp-' + k, k, p[k]) : txt('cvp-' + k, k, p[k]))).join('')}
          <div class="linha">${['email', 'telefone', 'portfolio', 'linkedin'].concat(Object.keys(c).filter((x) => !['email', 'telefone', 'portfolio', 'linkedin'].includes(x)))
            .map((k) => campo('cvc-' + k, k[0].toUpperCase() + k.slice(1), txt('cvc-' + k, 'contato.' + k, c[k]))).join('')}</div>
          <div class="acoes-form"><button class="btn-1" type="submit">${ic('check')}Salvar</button>${btn('cv-cancelar', 'Cancelar', '', 'btn-f')}</div></form>`
      : `<p><strong style="font-size:17px;font-weight:600">${esc(p.nome || '—')}</strong>${p.titulo ? ' · ' + esc(p.titulo) : ''}</p>
         ${Object.keys(c).length ? `<p class="meta">${Object.entries(c).map(([k, v]) => /^https?:/.test(v) ? `<a href="${esc(v)}" target="_blank" rel="noopener">${esc(v)}</a>` : esc(v)).join(' · ')}</p>` : ''}
         ${p.sobre ? `<p style="margin-top:10px">${esc(p.sobre)}</p>` : ''}`;
    const secoes = SECOES.filter((s) => (cv[s] || []).length || (UI.cvAdd === s)).map((s) => {
      const cfg = SEC[s];
      const linhas = (cv[s] || []).map((it) => (ed && ed.sec === s && ed.id === it.id) ? `<div class="cv-item">${formCV(s, it)}</div>` : `<div class="cv-item">${ic(s === 'experiencias' ? 'suitcase' : s === 'formacao' ? 'graduation-cap' : s === 'cursos' ? 'page-star' : s === 'idiomas' ? 'text' : 'hashtag')}
        <div><strong>${esc(cfg.titulo(it))}</strong>${cfg.sub(it) ? `<p class="meta">${esc(cfg.sub(it))}</p>` : ''}</div>
        ${menuMais([{ act: 'cv-editar', id: it.id, ico: 'edit-pencil', txt: 'Editar', extra: `data-sec="${s}"` }, '-', { act: 'cv-excluir', id: it.id, ico: 'trash', txt: 'Excluir', perigo: true, extra: `data-sec="${s}"` }])}</div>`).join('');
      return cartao(cfg.nome + ` <span class="pino">${cv[s].length}</span>`, linhas + (UI.cvAdd === s ? `<div class="cv-item">${formCV(s, null)}</div>` : ''),
        btnTxt('cv-adicionar', 'plus', 'Adicionar', `data-sec="${s}"`));
    }).join('');
    main.innerHTML = `<header class="pagina-cab"><h1>${ic('suitcase')}Meu currículo</h1>
        <div class="ferramentas" style="flex:1;justify-content:flex-end">${btn('cv-importar', ic('upload') + 'Importar JSON', '', 'btn-2')}${btn('cv-exportar', ic('download') + 'Exportar JSON', '', 'btn-2')}
          ${selectHTML('cv-add', '', SECOES.map((s) => [s, 'Adicionar em ' + SEC[s].nome.toLowerCase()]), UI.cvAddSec || 'experiencias').replace('<select', '<select data-act="cv-add-sec" style="width:auto"')}
          ${btn('cv-previa', ic(UI.previa ? 'eye-solid' : 'eye') + (UI.previa ? 'Fechar prévia' : 'Ver prévia'), '', 'btn-1')}</div>
        ${UI.erroCV ? `<p class="erro">${UI.erroCV}</p>` : ''}</header>
      ${UI.previa ? `<div class="previa-doc">${previaCV()}</div>` : ''}
      ${cartao(ic('user') + 'Apresentação', cabecalho, (ed && ed.sec === 'perfil') ? '' : btnTxt('cv-editar', 'edit-pencil', 'Editar', 'data-sec="perfil"'))}
      ${secoes}`;
  }
  function formCV(s, it) {
    const cfg = SEC[s], v = it || {};
    return `<form class="form" data-form="cv-item" data-sec="${s}" data-t="${s}" data-id="${it ? it.id : ''}" style="flex:1">
      ${cfg.campos.map(([k, n, t]) => campo('cvi-' + k, n, t === 'linhas' || t === 'area' ? area('cvi-' + k, k, t === 'linhas' ? (v[k] || []).join('\n') : v[k])
        : `<input type="${t === 'num' ? 'number' : 'text'}" id="cvi-${k}" name="${k}" value="${esc(v[k] ?? '')}" ${['cargo', 'titulo', 'idioma'].includes(k) ? 'required' : ''}>`)).join('')}
      <div class="acoes-form"><button class="btn-1" type="submit">${ic('check')}Salvar</button>${btn('cv-cancelar', 'Cancelar', '', 'btn-f')}</div></form>`;
  }
  function previaCV() {
    const cv = S.curriculo, p = cv.perfil || {}, c = p.contato || {};
    return `<h1>${esc(p.nome || '')}</h1>${p.titulo ? `<p>${esc(p.titulo)}</p>` : ''}
      ${Object.keys(c).length ? `<p class="meta">${Object.values(c).map(esc).join(' · ')}</p>` : ''}
      ${p.sobre ? `<h2>Sobre</h2><p>${esc(p.sobre)}</p>` : ''}
      ${SECOES.filter((s) => cv[s].length).map((s) => `<h2>${SEC[s].nome}</h2>${cv[s].map((it) => `<div class="bloco">
        <strong>${esc(SEC[s].titulo(it))}</strong>${SEC[s].sub(it) ? ' — ' + esc(SEC[s].sub(it)) : ''}
        ${it.descricao ? `<p>${esc(it.descricao)}</p>` : ''}
        ${(it.atividades || []).length ? `<ul>${it.atividades.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}</div>`).join('')}`).join('')}`;
  }
  function resumoItem(s, it) {
    return SEC[s].campos.filter(([k]) => it[k] !== undefined && it[k] !== '').map(([k, n]) => `${n.replace(/ <.*/, '').replace(/ \(.*/, '')}: ${Array.isArray(it[k]) ? it[k].join('; ') : it[k]}`).join('\n');
  }
  function renderRevisao() {
    const pl = UI.plano, cont = { novo: 0, igual: 0, alterado: 0, ambiguo: 0 };
    Object.values(pl.secoes).forEach((ls) => ls.forEach((l) => cont[l.tipo]++));
    let h = `<p role="status"><strong>${cont.novo}</strong> novo(s) · <strong>${cont.alterado}</strong> com diferenças · <strong>${cont.ambiguo}</strong> possível(is) coincidência(s) · <strong>${cont.igual}</strong> igual(is), ignorados.</p>
      <p class="meta">Arquivo: ${esc(pl.arquivo)}. Seções ausentes não são alteradas; itens omitidos não são excluídos.</p>`;
    if (pl.perfil) h += `<div style="margin-top:16px"><p class="secao-tit so">Apresentação</p>
      <div class="diff"><div><strong>Atual</strong><pre>${esc(pl.perfil.campos.map((k) => k + ': ' + (typeof S.curriculo.perfil[k] === 'object' ? JSON.stringify(S.curriculo.perfil[k]) : (S.curriculo.perfil[k] ?? '—'))).join('\n'))}</pre></div>
      <div><strong>Importado</strong><pre>${esc(pl.perfil.campos.map((k) => k + ': ' + (typeof pl.perfil.novo[k] === 'object' ? JSON.stringify(pl.perfil.novo[k]) : pl.perfil.novo[k])).join('\n'))}</pre></div></div>
      <div class="escolhas" style="margin-top:8px"><label class="check"><input type="radio" name="pl-perfil" value="manter" data-act="pl-escolha" data-sec="perfil" ${pl.perfil.escolha === 'manter' ? 'checked' : ''}> Manter atual</label>
      <label class="check"><input type="radio" name="pl-perfil" value="importar" data-act="pl-escolha" data-sec="perfil" ${pl.perfil.escolha === 'importar' ? 'checked' : ''}> Usar importado</label></div></div>`;
    Object.entries(pl.secoes).forEach(([s, linhas]) => {
      const rel = linhas.map((l, idx) => [l, idx]).filter(([l]) => l.tipo !== 'igual');
      const iguais = linhas.length - rel.length;
      h += `<div style="margin-top:18px"><p class="secao-tit so">${SEC[s].nome}${iguais ? ` · ${iguais} igual(is)` : ''}</p>`;
      h += rel.map(([l, idx]) => {
        const nome = `pl-${s}-${idx}`;
        const r = (v, rot) => `<label class="check"><input type="radio" name="${nome}" value="${v}" data-act="pl-escolha" data-sec="${s}" data-idx="${idx}" ${l.escolha === v ? 'checked' : ''}> ${rot}</label>`;
        if (l.tipo === 'novo') return `<div class="cv-item"><div><span class="tag">Novo</span> <strong>${esc(SEC[s].titulo(l.it))}</strong> <span class="meta">${esc(SEC[s].sub(l.it))}</span>
          <div class="escolhas" style="margin-top:6px">${r('incluir', 'Incluir')}${r('ignorar', 'Não incluir')}</div></div></div>`;
        if (l.tipo === 'alterado') return `<div class="cv-item"><div><span class="tag">Diferente</span> <strong>${esc(SEC[s].titulo(l.alvo))}</strong>
          <div class="diff" style="margin-top:8px"><div><strong>Atual</strong><pre>${esc(resumoItem(s, l.alvo))}</pre></div><div><strong>Importado</strong><pre>${esc(resumoItem(s, l.it))}</pre></div></div>
          <div class="escolhas" style="margin-top:6px">${r('manter', 'Manter atual')}${r('importar', 'Usar importado')}</div></div></div>`;
        return `<div class="cv-item"><div><span class="tag">Parecido com o que já existe</span> <strong>${esc(SEC[s].titulo(l.it))}</strong> <span class="meta">${esc(SEC[s].sub(l.it))}</span>
          <div class="escolhas" style="margin-top:6px">${r('novo', 'Incluir como novo')}${l.candidatos.map((x) => r('sub:' + x.id, `Substituir “${esc(SEC[s].titulo(x))}”`)).join('')}${r('ignorar', 'Ignorar')}</div></div></div>`;
      }).join('') + '</div>';
    });
    main.innerHTML = `<header class="pagina-cab"><h1>${ic('upload')}Revisar importação</h1></header>
      <section class="cartao">${h}<div class="acoes-form" style="margin-top:20px">${btn('pl-confirmar', ic('check') + 'Confirmar importação', '', 'btn-1')}${btn('pl-cancelar', 'Cancelar', '', 'btn-f')}</div></section>`;
  }
  function exportarCV() {
    const cv = S.curriculo, out = Object.assign({ versao: 1, exportadoEm: agora(), perfil: cv.perfil }, cv.extras);
    SECOES.forEach((s) => { out[s] = cv[s]; });
    baixar('curriculo-meu-espaco-' + hoje() + '.json', out);
    toast('Currículo exportado.', 'download');
  }
  function baixar(nome, obj) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' }));
    a.download = nome; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  return { SEC, SECOES, PERFIL_CAMPOS, adaptarCV, proximoId, cvComIds, planejarImportacao, aplicarImportacao, renderCurriculo, exportarCV, baixar };
};
