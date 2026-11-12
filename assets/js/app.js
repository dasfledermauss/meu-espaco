/* Meu Espaço — v3. Uma única fonte de dados (S) alimenta todas as telas.
   Ícones: Iconoir (assets/js/icones.js). Variante "-solid" = estado ativo. */
(function () {
  'use strict';

  const CHAVE = 'meuEspaco.v1';
  const CHAVE_RASC = 'meuEspaco.rascunhos';
  const FOTO_PADRAO = 'assets/img/foto-perfil.jpg';
  const main = document.getElementById('conteudo');
  const navLateral = document.getElementById('nav-lateral');
  const direita = document.getElementById('direita');
  const layout = document.getElementById('layout');
  const topoPerfil = document.getElementById('topo-perfil');
  const buscaTopo = document.getElementById('busca-topo');
  const modal = document.getElementById('modal');

  /* ---------------- utilidades ---------------- */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = (p) => p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const pad = (n) => String(n).padStart(2, '0');
  const dataLocal = (d) => { d = new Date(d); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  const hoje = () => dataLocal(new Date());
  const agora = () => new Date().toISOString();
  const deDia = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const somaDias = (s, n) => { const d = deDia(s); d.setDate(d.getDate() + n); return dataLocal(d); };
  const fmtDia = (s) => deDia(s).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const fmtDiaCurto = (s) => deDia(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  const rotuloDia = (s) => s === hoje() ? 'Hoje' : s === somaDias(hoje(), -1) ? 'Ontem' : fmtDia(s);
  const fmtDataHora = (iso) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const fmtHora = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const brl = (v, moeda) => { try { return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: moeda || 'BRL' }); } catch (e) { return 'R$ ' + Number(v || 0).toFixed(2); } };
  const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const fmtAM = (s) => { if (!s) return ''; const [y, m] = String(s).split('-'); return m ? MESES[+m - 1] + ' ' + y : y; };
  const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const ehURL = (s) => /^(https?:\/\/|www\.)\S+$/i.test(String(s).trim());
  const dominio = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } };
  const ehPdf = (u) => /\.pdf($|[?#])/i.test(String(u || ''));
  const semVazios = (o) => { Object.keys(o).forEach((k) => o[k] === undefined && delete o[k]); return o; };
  const hashNum = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  const corta = (s, n) => { s = String(s || ''); return s.length > n ? s.slice(0, n) + '…' : s; };
  const canon = (o) => {
    if (Array.isArray(o)) return '[' + o.map(canon).join(',') + ']';
    if (o && typeof o === 'object') return '{' + Object.keys(o).filter((k) => k !== 'id' && o[k] !== undefined).sort().map((k) => JSON.stringify(k) + ':' + canon(o[k])).join(',') + '}';
    return JSON.stringify(o);
  };

  /* ícones e botões */
  const ic = (n, cls) => { const s = (window.ICONES || {})[n]; return s ? s.replace('<svg ', `<svg class="ico${cls ? ' ' + cls : ''}" aria-hidden="true" focusable="false" `) : ''; };
  const icAtivo = (n, ativo) => ic(ativo && window.ICONES[n + '-solid'] ? n + '-solid' : n);
  const btnIco = (act, icone, titulo, attrs = '', cls = '') =>
    `<button type="button" class="ico-btn ${cls}" data-act="${act}" ${attrs} aria-label="${esc(titulo)}" title="${esc(titulo)}">${ic(icone)}</button>`;
  const btnAlterna = (act, id, ativo, icone, txtOn, txtOff, cls = '') =>
    `<button type="button" class="ico-btn ${cls}" data-act="${act}" data-id="${id}" aria-pressed="${!!ativo}" aria-label="${esc(ativo ? txtOn : txtOff)}" title="${esc(ativo ? txtOn : txtOff)}">${icAtivo(icone, ativo)}</button>`;
  const btnTxt = (act, icone, texto, attrs = '', cls = '') =>
    `<button type="button" class="ico-btn txt ${cls}" data-act="${act}" ${attrs}>${ic(icone)}<span>${texto}</span></button>`;
  const btn = (act, texto, attrs = '', cls = '') => `<button type="button" class="${cls}" data-act="${act}" ${attrs}>${texto}</button>`;
  function menuMais(itens, cls = '') {
    const linhas = itens.filter(Boolean).map((i) => i === '-' ? '<hr>'
      : `<button type="button" data-act="${i.act}" ${i.id ? `data-id="${i.id}"` : ''} ${i.extra || ''} class="${i.perigo ? 'perigo' : ''}">${ic(i.ico)}<span>${i.txt}</span></button>`).join('');
    return `<details class="menu ${cls}"><summary class="ico-btn" aria-label="Mais ações" title="Mais ações">${ic('more-horiz')}</summary>
      <div class="menu-corpo">${linhas}</div></details>`;
  }
  function estrelasHTML(n, extra) {
    if (n === null || n === undefined || n === '' || isNaN(n)) return '';
    let h = '';
    for (let k = 1; k <= 5; k++) h += ic(n >= k ? 'star-solid' : 'star', n >= k ? 'on' : '');
    return `<span class="estrelas" role="img" aria-label="${String(n).replace('.', ',')} de 5 estrelas">${h}${extra ? ` <span class="meta">${extra}</span>` : ''}</span>`;
  }
  function toast(msg, icone) {
    const t = document.getElementById('toast');
    t.innerHTML = (icone ? ic(icone) : '') + '<span>' + esc(msg) + '</span>'; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => (t.hidden = true), 3600);
  }
  function redimensionar(file, w, h) {
    return new Promise((ok, falha) => {
      const img = new Image();
      img.onload = () => {
        const alvo = w / h, prop = img.width / img.height;
        let sw = img.width, sh = img.height, sx = 0, sy = 0;
        if (prop > alvo) { sw = img.height * alvo; sx = (img.width - sw) / 2; } else { sh = img.width / alvo; sy = (img.height - sh) / 2; }
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
        URL.revokeObjectURL(img.src); ok(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => falha(new Error('imagem'));
      img.src = URL.createObjectURL(file);
    });
  }

  /* ---------------- estado ---------------- */
  let S = null;
  const UI = { busca: '', feedModo: 'todos', dia: hoje(), colSel: 'todas', colFiltro: 'todos', colTipo: 'todos', colBusca: '',
    editando: null, comentando: null, cvEdit: null, cvAdd: null, plano: null, previa: false, adiando: null, lembEdit: null,
    gastoMes: hoje().slice(0, 7), bibFormato: 'todos', bibAgrupar: 'status', bibBusca: '', bibVer: null,
    wlFiltro: 'desejos', wlOrdem: 'recentes', muralCol: 'todas', pastaAberta: null, extras: {}, imagens: {}, servidor: false, janelas: [], sessao: { modo: 'local' }, nuvem: { estado: 'local', em: '', erro: '' } };
  let RASC = {};

  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(S)); if (typeof agendarSync === 'function') agendarSync(); return true; }
    catch (e) { toast('Não consegui salvar: o armazenamento do navegador está cheio. Exporte um backup e limpe o que não usa.'); return false; }
  }
  const salvarRasc = () => { try { localStorage.setItem(CHAVE_RASC, JSON.stringify(RASC)); } catch (e) { /* ignora */ } };
  function carregar(chave) { try { const raw = localStorage.getItem(chave); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }

  /* ---------------- rascunhos: nada digitado se perde ---------------- */
  const chaveForm = (f) => f.dataset.form + ':' + (f.dataset.id || f.dataset.t || 'novo');
  function colherRascunhos() {
    document.querySelectorAll('[data-form]').forEach((f) => {
      const k = chaveForm(f), d = {};
      let tem = false;
      f.querySelectorAll('input, textarea, select').forEach((el) => {
        if (el.type === 'file' || el.disabled || !el.name) return;
        if (el.type === 'checkbox' || el.type === 'radio') { if (el.checked !== el.defaultChecked) { d[el.name + '\u0000' + el.value] = el.checked; tem = true; } }
        else if (el.value !== (el.defaultValue ?? '')) { d[el.name] = el.value; tem = true; }
      });
      const ex = UI.extras[k];
      if (ex && ex.length) { d['\u0000extras'] = ex; tem = true; }
      const im = UI.imagens[k];
      if (im) { d['\u0000imagem'] = im; tem = true; }
      if (tem) RASC[k] = d; else delete RASC[k];
    });
    salvarRasc();
  }
  function restaurarRascunhos() {
    document.querySelectorAll('[data-form]').forEach((f) => {
      const d = RASC[chaveForm(f)];
      if (!d) return;
      Object.entries(d).forEach(([nome, valor]) => {
        if (nome.startsWith('\u0000')) return;
        const [n, v] = nome.split('\u0000');
        if (v !== undefined) { const el = f.querySelector(`[name="${CSS.escape(n)}"][value="${CSS.escape(v)}"]`); if (el) el.checked = valor; }
        else { const el = f.querySelector(`[name="${CSS.escape(n)}"]`); if (el) el.value = valor; }
      });
    });
  }
  function limparRascunho(k) { delete RASC[k]; delete UI.extras[k]; delete UI.imagens[k]; salvarRasc(); }
  const temRascunho = (k) => !!RASC[k];

  async function criarInicial() {
    return {
      versao: 3,
      perfil: { nome: 'Meu Nome', bio: '', foto: null, tema: 'azul', corCustom: '', modo: 'sistema', humores: {} },
      colecoes: [{ id: 'col-pessoal', nome: 'Pessoal', descricao: '' }, { id: 'col-trabalho', nome: 'Trabalho', descricao: '' }],
      pastas: [], itens: [], lembretes: [],
      curriculo: cvComIds({ perfil: {}, extras: {} }),
      destinoPadrao: { nota: '', link: '' }
    };
  }

  function migrar(st) {
    st.destinoPadrao = st.destinoPadrao || { nota: '', link: 'col-pessoal' };
    st.lembretes = st.lembretes || []; st.pastas = st.pastas || []; st.colecoes = st.colecoes || [];
    st.perfil.corCustom = st.perfil.corCustom || '';
    st.perfil.modo = st.perfil.modo || 'sistema';
    if (!st.perfil.fotoConferida) {
      if (!st.perfil.foto && !st.perfil.semFoto && (st.itens || []).length) st.perfil.foto = FOTO_PADRAO;
      st.perfil.fotoConferida = true;
    }
    (st.itens || []).forEach((i, k) => {
      i.colecoes = i.colecoes || []; i.comentarios = i.comentarios || [];
      if (i.tipo === 'nota' && i.ordem === undefined) i.ordem = k;
      if (i.tipo === 'midia') i.anotacoes = i.anotacoes || [];
      if (i.tipo === 'artigo') i.anotacoes = i.anotacoes || [];
    });
    st.versao = 3;
    return st;
  }

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




  /* ---------------- consultas ---------------- */
  const colecao = (id) => S.colecoes.find((c) => c.id === id);
  const pasta = (id) => S.pastas.find((c) => c.id === id);
  const item = (id) => S.itens.find((i) => i.id === id);
  const lembrete = (id) => S.lembretes.find((l) => l.id === id);
  const TIPOS = { nota: ['Nota', 'journal-page'], link: ['Link', 'link'], midia: ['Livro', 'book'], artigo: ['Artigo', 'page'], desejo: ['Desejo', 'shopping-bag'], gasto: ['Gasto', 'wallet'] };
  const nomeTipo = (i) => i.tipo === 'midia' ? (i.formato === 'filme' ? 'Filme' : 'Livro') : TIPOS[i.tipo][0];
  const icoTipo = (i) => i.tipo === 'midia' ? (i.formato === 'filme' ? 'movie' : 'book') : TIPOS[i.tipo][1];
  const STATUS = { livro: { quero: 'Quero ler', andamento: 'Lendo', concluido: 'Lido' }, filme: { quero: 'Quero assistir', andamento: 'Assistindo', concluido: 'Assistido' } };
  const STATUS_GRUPO = { andamento: 'Lendo e assistindo agora', quero: 'Na fila', concluido: 'Concluídos' };
  const CORES_NOTA = ['amarelo', 'rosa', 'azul', 'verde', 'laranja'];
  const corNota = (i) => i.cor || CORES_NOTA[hashNum(i.id) % CORES_NOTA.length];
  const ehImportado = (i) => !!i.importadoEm && i.importadoEm === i.criadoEm;
  const unidade = (i) => i.formato === 'filme' ? 'minuto' : 'página';
  const tituloItem = (i) => i.titulo || (i.tipo === 'gasto' ? (i.descricao || 'Gasto')
    : i.tipo === 'desejo' ? 'Produto em ' + (dominio(i.url) || 'loja')
      : i.tipo === 'artigo' ? (dominio(i.url) || 'Artigo')
        : (i.texto || '').split('\n')[0].slice(0, 90) || 'Nota sem título');
  function textoBusca(i) {
    return norm([i.titulo, i.url, i.texto, i.comentario, i.descricao, i.categoria, i.autor, i.resumo, i.loja, (i.generos || []).join(' '),
      ...(i.comentarios || []).map((c) => c.texto), ...(i.anotacoes || []).map((a) => a.texto),
      ...(i.notasFonte || []).map((n) => [n.grupo, n.original && n.original.customTitle, n.original && n.original.customDescription, n.original && n.original.title].join(' '))].join(' '));
  }
  const ordenados = () => S.itens.slice().sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  const doTipo = (t) => S.itens.filter((i) => i.tipo === t);
  const venc = (l) => new Date(l.data + 'T' + (l.hora || '00:00')).getTime();
  const pendentes = () => S.lembretes.filter((l) => !l.concluido).sort((a, b) => venc(a) - venc(b));
  const vencidos = () => pendentes().filter((l) => venc(l) <= Date.now());
  const progresso = (i) => (i.paginas && i.paginaAtual) ? Math.min(100, Math.round(i.paginaAtual / i.paginas * 100)) : null;

  /* ---------------- componentes ---------------- */
  const cartao = (titulo, corpo, extra = '', cls = '') =>
    `<section class="cartao ${cls}">${titulo ? `<div class="cartao-cab"><h2>${titulo}</h2>${extra}</div>` : ''}${corpo}</section>`;
  const vazio = (icone, txt, acao = '') => `<div class="cartao" style="text-align:center;padding:38px 22px">${ic(icone, 'g')}<p class="meta" style="margin:10px 0 14px">${txt}</p>${acao}</div>`;
  const avatarHTML = (cls = '') => {
    const p = S.perfil;
    if (p.foto) return `<img class="avatar ${cls}" src="${esc(p.foto)}" alt="">`;
    return `<span class="avatar vazio ${cls}" aria-hidden="true">${ic('user')}</span>`;
  };
  function capaHTML(i, cls = '') {
    if (i.capa) return `<img class="capa ${cls}" src="${i.capa}" alt="">`;
    const h = hashNum(i.titulo || i.id) % 360;
    return `<span class="capa capa-ph ${cls}" style="--c1:hsl(${h} 32% 44%);--c2:hsl(${(h + 40) % 360} 36% 24%)" aria-hidden="true">${esc(corta(i.titulo, 40))}</span>`;
  }
  const fotoProduto = (i, cls = '') => `<span class="foto-produto ${cls}">${ic('media-image')}${i.imagem ? `<img src="${esc(i.imagem)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}</span>`;
  function precoHTML(i) {
    if (i.preco === null || i.preco === undefined) return `<span class="preco sem">${i.capturaStatus === 'capturando' ? 'Capturando…' : 'Preço não capturado'}</span>`;
    const h = i.historicoPreco || [];
    let v = '';
    if (h.length >= 2) { const dif = i.preco - h[h.length - 2].preco; if (dif) v = `<span class="var-preco ${dif < 0 ? 'caiu' : 'subiu'}">${dif < 0 ? '↓' : '↑'} ${brl(Math.abs(dif), i.moeda)}</span>`; }
    return `<span class="preco">${brl(i.preco, i.moeda)}</span>${v}`;
  }

  /* ---------------- construtor de formulário progressivo ---------------- */
  function construtor(k, valores) {
    const ativos = UI.extras[k] = UI.extras[k] || [];
    const r = RASC[k] || {};
    const preenchido = (n) => {
      const v = valores ? valores[n] : undefined;
      if (Array.isArray(v) ? v.length : (v !== undefined && v !== null && v !== '')) return true;
      return r[n] !== undefined && r[n] !== '';
    };
    const html = [], chips = [];
    return {
      fixo(h) { html.push(h); return this; },
      opc(nome, rotulo, h, forcar) {
        const chave = Array.isArray(nome) ? nome[0] : nome;
        if (forcar || ativos.includes(chave) || (Array.isArray(nome) ? nome.some(preenchido) : preenchido(nome))) html.push(h);
        else chips.push(`<button type="button" class="chip-add" data-act="add-campo" data-k="${esc(k)}" data-campo="${chave}">${ic('plus')}${rotulo}</button>`);
        return this;
      },
      fim(rot) { return html.join('') + (chips.length ? `<div class="mais-campos"><span class="rotulo">${rot || 'Adicionar'}</span>${chips.join('')}</div>` : ''); }
    };
  }
  const campo = (id, rot, dentro, cls = '') => `<div class="campo ${cls}"><label for="${id}">${rot}</label>${dentro}</div>`;
  const txt = (id, nome, valor = '', extra = '') => `<input type="text" id="${id}" name="${nome}" value="${esc(valor)}" ${extra}>`;
  const area = (id, nome, valor = '', extra = '') => `<textarea id="${id}" name="${nome}" ${extra}>${esc(valor)}</textarea>`;
  function selectHTML(id, nome, ops, sel) {
    return `<select id="${id}" name="${nome}">${ops.map(([v, n]) => `<option value="${esc(v)}" ${String(sel) === String(v) ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>`;
  }
  const opcoesDestino = (sel) => `<option value="">Sem coleção (organizar depois)</option>`
    + S.colecoes.map((c) => `<option value="${c.id}" ${sel === c.id ? 'selected' : ''}>${esc(c.nome)}</option>`).join('')
    + `<option value="__nova">+ Criar coleção…</option>`;
  function estrelasInput(v) {
    let h = '';
    for (let k = 5; k >= 1; k--) h += `<input type="radio" name="estrelas" id="est-${k}" value="${k}" ${Number(v) === k ? 'checked' : ''}><label for="est-${k}">${ic('star', 'off')}${ic('star-solid', 'on')}<span class="sr-only">${k} estrela${k > 1 ? 's' : ''}</span></label>`;
    return `<div class="campo"><span class="rotulo">Estrelas</span><div class="linha" style="align-items:center;gap:8px"><span class="estrelas-input">${h}</span>${btn('estrelas-limpar', 'Limpar', '', 'btn-f btn-p')}</div></div>`;
  }
  function envioImagem(k, rot, formato, atual) {
    const prev = UI.imagens[k] !== undefined ? UI.imagens[k] : atual;
    const cls = formato === 'capa' ? 'previa-capa' : 'previa-quadrada';
    return `<div class="campo"><span class="rotulo">${rot}</span><div class="envio">
      ${prev ? `<div class="envio-previa ${cls}"><img src="${prev}" alt="Prévia"><button type="button" class="ico-btn remover" data-act="img-remover" data-k="${esc(k)}" aria-label="Remover imagem" title="Remover">${ic('xmark')}</button></div>` : ''}
      <label class="envio-alvo" data-solta="${esc(k)}">${ic('media-image')}<span>${prev ? 'Trocar imagem' : 'Escolher ou arrastar'}</span>
        <input type="file" accept="image/*" hidden data-act="img-escolher" data-k="${esc(k)}" data-formato="${formato}"></label>
    </div></div>`;
  }

  /* ---------------- formulários de criação e edição ---------------- */
  const TIPOS_CRIAR = [['nota', 'Nota', 'journal-page'], ['link', 'Link', 'link'], ['midia', 'Livro ou filme', 'book'],
    ['artigo', 'Artigo de estudo', 'page'], ['desejo', 'Desejo', 'shopping-bag'], ['gasto', 'Gasto', 'wallet'], ['lembrete', 'Lembrete', 'alarm']];
  const tituloCriar = { nota: 'Nova nota', link: 'Guardar link', midia: 'Novo na biblioteca', artigo: 'Novo artigo', desejo: 'Novo desejo', gasto: 'Novo gasto', lembrete: 'Novo lembrete' };

  function formulario(t, it) {
    const k = it ? 'editar:' + it.id : 'criar:' + t;
    const v = it || {};
    const c = construtor(k, v);
    if (t === 'nota') {
      c.fixo(campo('f-texto', 'Texto', area('f-texto', 'texto', v.texto, 'class="alto" required placeholder="Escreva o que aprendeu, pensou ou quer lembrar…"')));
      c.opc('titulo', 'Título', campo('f-titulo', 'Título', txt('f-titulo', 'titulo', v.titulo)));
      c.opc('destino', 'Coleção', campo('f-destino', 'Coleção', `<select id="f-destino" name="destino" data-act="destino">${opcoesDestino(it ? (v.colecoes[0] || {}).id : S.destinoPadrao.nota)}</select>`));
      c.opc('cor', 'Cor do papel', campo('f-cor', 'Cor do papel', selectHTML('f-cor', 'cor', CORES_NOTA.map((x) => [x, x[0].toUpperCase() + x.slice(1)]), v.cor || corNota(v.id ? v : { id: 'x' }))));
    } else if (t === 'link') {
      c.fixo(campo('f-url', 'Endereço', `<input type="url" id="f-url" name="url" value="${esc(v.url || '')}" required placeholder="https://…" inputmode="url">`));
      if (!it) c.fixo(`<p class="dica">${ic('priority-high')}<span>Título, descrição e imagem são capturados da página.${UI.servidor ? '' : ' Sem o servidor ligado, dá para preencher à mão.'}</span></p>`);
      c.opc('comentario', 'Por que guardei', campo('f-com', 'Por que estou guardando', txt('f-com', 'comentario', v.comentario, 'placeholder="ex.: quero testar essa navegação no próximo projeto"')));
      c.opc('destino', 'Coleção', campo('f-destino', 'Coleção', `<select id="f-destino" name="destino" data-act="destino">${opcoesDestino(it ? (v.colecoes[0] || {}).id : S.destinoPadrao.link)}</select>`));
      c.opc('titulo', 'Título', campo('f-titulo', 'Título', txt('f-titulo', 'titulo', v.titulo)));
      c.opc('descricao', 'Descrição', campo('f-desc', 'Descrição', area('f-desc', 'descricao', v.descricao)));
      c.opc('lerDepois', 'Ler mais tarde', `<label class="check"><input type="checkbox" name="lerDepois" ${v.lerDepois ? 'checked' : ''}> Ler mais tarde</label>`);
    } else if (t === 'midia') {
      const f = (RASC[k] && RASC[k].formato) || v.formato || 'livro';
      c.fixo(`<div class="segmento" role="group" aria-label="Formato">
          <button type="button" data-act="form-formato" data-v="livro" aria-pressed="${f === 'livro'}">${ic('book')} Livro</button>
          <button type="button" data-act="form-formato" data-v="filme" aria-pressed="${f === 'filme'}">${ic('movie')} Filme ou série</button></div>
        <input type="hidden" name="formato" value="${f}">`);
      c.fixo(`<div class="linha">${campo('f-titulo', 'Nome', txt('f-titulo', 'titulo', v.titulo, 'required'))}
        ${campo('f-autor', f === 'filme' ? 'Direção' : 'Autor(a)', txt('f-autor', 'autor', v.autor), 'medio')}</div>`);
      c.fixo(campo('f-status', 'Situação', selectHTML('f-status', 'status', Object.entries(STATUS[f]), v.status || 'quero'), 'medio'));
      c.fixo(envioImagem(k, 'Capa', 'capa', v.capa));
      c.opc('estrelas', 'Estrelas', estrelasInput(v.estrelas));
      c.opc(['paginaAtual', 'paginas'], f === 'filme' ? 'Onde parei' : 'Página atual', `<div class="linha">
        ${campo('f-pag', f === 'filme' ? 'Minuto atual' : 'Página atual', `<input type="number" id="f-pag" name="paginaAtual" min="0" value="${esc(v.paginaAtual || '')}">`, 'curto')}
        ${campo('f-pags', f === 'filme' ? 'Duração' : 'Total de páginas', `<input type="number" id="f-pags" name="paginas" min="0" value="${esc(v.paginas || '')}">`, 'curto')}</div>`);
      c.opc('generos', 'Gêneros', campo('f-gen', 'Gêneros <span class="opcional">(separe por vírgula)</span>',
        txt('f-gen', 'generos', (v.generos || []).join(', '), 'list="lista-generos"') + `<datalist id="lista-generos">${[...new Set(doTipo('midia').flatMap((x) => x.generos || []))].map((g) => `<option value="${esc(g)}">`).join('')}</datalist>`));
      c.opc('ano', 'Ano', campo('f-ano', 'Ano', `<input type="number" id="f-ano" name="ano" min="0" max="2200" value="${esc(v.ano || '')}">`, 'curto'));
      c.opc('resumo', 'Resumo', campo('f-resumo', 'Resumo', area('f-resumo', 'resumo', v.resumo)));
      c.opc('comentario', 'Minha opinião', campo('f-com', 'Minha opinião', area('f-com', 'comentario', v.comentario)));
    } else if (t === 'artigo') {
      c.fixo(campo('f-url', 'Endereço do artigo', `<input type="url" id="f-url" name="url" value="${esc(v.url || '')}" required placeholder="https://… ou link direto do PDF" inputmode="url">`));
      c.fixo(campo('f-pasta', 'Pasta', `<select id="f-pasta" name="pastaId">${S.pastas.map((p) => `<option value="${p.id}" ${(v.pastaId || UI.pastaAberta) === p.id ? 'selected' : ''}>${esc(p.nome)}</option>`).join('')}<option value="__nova">+ Criar pasta…</option></select>`, 'medio'));
      c.opc('titulo', 'Título', campo('f-titulo', 'Título', txt('f-titulo', 'titulo', v.titulo)));
      c.opc('descricao', 'Resumo', campo('f-desc', 'Resumo', area('f-desc', 'descricao', v.descricao)));
    } else if (t === 'desejo') {
      c.fixo(campo('f-url', 'Link do produto', `<input type="url" id="f-url" name="url" value="${esc(v.url || '')}" required placeholder="Cole o endereço da página do produto" inputmode="url">`));
      if (!it) c.fixo(`<p class="dica">${ic('priority-high')}<span>Só o link. Foto, nome, preço, estrelas e loja são lidos da página.</span></p>`);
      if (it) {
        c.fixo(`<div class="linha">${campo('f-titulo', 'Nome do produto', txt('f-titulo', 'titulo', v.titulo))}
          ${campo('f-preco', 'Preço', `<input type="number" id="f-preco" name="preco" step="0.01" min="0" value="${v.preco ?? ''}">`, 'curto')}</div>`);
        c.opc('loja', 'Loja', campo('f-loja', 'Loja', txt('f-loja', 'loja', v.loja)));
        c.opc('imagem', 'Endereço da foto', campo('f-img', 'Endereço da foto', `<input type="url" id="f-img" name="imagem" value="${esc(v.imagem || '')}">`));
      }
      c.opc('comentario', 'Comentário', campo('f-com', 'Comentário', txt('f-com', 'comentario', v.comentario)));
    } else if (t === 'gasto') {
      c.fixo(`<div class="linha">${campo('f-valor', 'Valor (R$)', `<input type="number" id="f-valor" name="valor" step="0.01" min="0.01" required inputmode="decimal" value="${v.valor ?? ''}">`, 'curto')}
        ${campo('f-desc', 'Descrição', txt('f-desc', 'descricao', v.descricao, 'required'))}</div>`);
      c.fixo(`<div class="linha">${campo('f-data', 'Data da despesa', `<input type="date" id="f-data" name="dataGasto" required value="${v.dataGasto || hoje()}">`, 'medio')}
        ${campo('f-cat', 'Categoria <span class="opcional">(opcional)</span>', txt('f-cat', 'categoria', v.categoria, 'list="lista-cat"') + `<datalist id="lista-cat">${[...new Set(S.itens.filter((x) => x.categoria).map((x) => x.categoria))].map((x) => `<option value="${esc(x)}">`).join('')}</datalist>`, 'medio')}</div>`);
    } else if (t === 'lembrete') {
      c.fixo(campo('f-texto', 'Lembrar de', txt('f-texto', 'texto', v.texto, 'required')));
      c.fixo(`<div class="linha">${campo('f-data', 'Data', `<input type="date" id="f-data" name="data" required value="${v.data || somaDias(hoje(), 1)}">`, 'medio')}
        ${campo('f-hora', 'Horário <span class="opcional">(opcional)</span>', `<input type="time" id="f-hora" name="hora" value="${esc(v.hora || '')}">`, 'curto')}</div>`);
    }
    return c.fim();
  }

  /* ---------------- modal ---------------- */
  function conteudoModal(m) {
    if (m.tipo === 'criar' || m.tipo === 'editar') {
      const it = m.tipo === 'editar' ? item(m.id) || lembrete(m.id) : null;
      const t = m.tipo === 'editar' ? (it.tipo || 'lembrete') : m.t;
      const k = m.tipo === 'editar' ? 'editar:' + m.id : 'criar:' + t;
      if (!t) return '';
      return `<form class="modal" method="dialog" data-form="${m.tipo === 'editar' ? 'editar' : 'criar'}" data-id="${m.tipo === 'editar' ? m.id : ''}" data-t="${t}">
        <header class="modal-cab">${ic(t === 'lembrete' ? 'alarm' : icoTipo({ tipo: t, formato: (RASC[k] || {}).formato || (it && it.formato) }))}
          <h2>${m.tipo === 'editar' ? 'Editar' : tituloCriar[t]}</h2>
          ${m.tipo === 'criar' ? btnIco('trocar-tipo', 'sort', 'Trocar o tipo') : ''}
          ${btnIco('modal-fechar', 'xmark', 'Fechar')}</header>
        <div class="modal-corpo"><div class="form">${formulario(t, it)}</div></div>
        <footer class="modal-pe">${temRascunho(k) ? `<span class="rascunho-aviso">${ic('check-circle-solid')}Rascunho guardado</span>` : ''}
          <span class="espaco"></span>
          ${temRascunho(k) ? btn('descartar-rascunho', 'Descartar', `data-k="${esc(k)}"`, 'btn-f btn-perigo') : btn('modal-fechar', 'Cancelar', '', 'btn-f')}
          <button class="btn-1" type="submit">${ic('check')}${m.tipo === 'editar' ? 'Salvar' : 'Guardar'}</button></footer></form>`;
    }
    if (m.tipo === 'tipo') {
      return `<div class="modal"><header class="modal-cab"><h2>O que você quer guardar?</h2>${btnIco('modal-fechar', 'xmark', 'Fechar')}</header>
        <div class="modal-corpo"><div class="compositor">${TIPOS_CRIAR.map(([v, n, i]) => `<button type="button" class="tipo-chip" data-act="criar" data-t="${v}">${ic(i)}${n}${temRascunho('criar:' + v) ? ' ·' : ''}</button>`).join('')}</div></div></div>`;
    }
    if (m.tipo === 'colecao' || m.tipo === 'pasta') {
      const ehPasta = m.tipo === 'pasta';
      const alvo = m.id ? (ehPasta ? pasta(m.id) : colecao(m.id)) : null;
      const k = m.tipo + ':' + (m.id || 'novo');
      return `<form class="modal" method="dialog" data-form="${m.tipo}" data-id="${m.id || ''}">
        <header class="modal-cab">${ic(ehPasta ? 'folder' : 'grid-plus')}<h2>${alvo ? 'Editar' : ehPasta ? 'Nova pasta de estudos' : 'Nova coleção'}</h2>${btnIco('modal-fechar', 'xmark', 'Fechar')}</header>
        <div class="modal-corpo"><div class="form">
          ${campo('f-nome', 'Nome', txt('f-nome', 'nome', alvo && alvo.nome, 'required placeholder="ex.: ' + (ehPasta ? 'Botânica' : 'Referências') + '"'))}
          ${campo('f-desc', 'Descrição <span class="opcional">(opcional)</span>', txt('f-desc', 'descricao', alvo && alvo.descricao))}
          ${ehPasta ? envioImagem(k, 'Capa da pasta', 'quadrada', alvo && alvo.capa) : ''}
        </div></div>
        <footer class="modal-pe"><span class="espaco"></span>${btn('modal-fechar', 'Cancelar', '', 'btn-f')}<button class="btn-1" type="submit">${ic('check')}Salvar</button></footer></form>`;
    }
    if (m.tipo === 'anotar') {
      const it = item(m.id);
      const f = it.tipo === 'midia' ? unidade(it) : 'página';
      return `<form class="modal" method="dialog" data-form="anotar" data-id="${m.id}">
        <header class="modal-cab">${ic('quote')}<h2>Nova anotação</h2>${btnIco('modal-fechar', 'xmark', 'Fechar')}</header>
        <div class="modal-corpo"><div class="form">
          <p class="meta">${esc(tituloItem(it))}</p>
          ${campo('f-texto', 'Anotação', area('f-texto', 'texto', m.texto || '', 'class="alto" required'))}
          ${campo('f-pag', f[0].toUpperCase() + f.slice(1) + ' <span class="opcional">(opcional)</span>', `<input type="number" id="f-pag" name="pagina" min="0" value="${esc(m.pagina || '')}">`, 'curto')}
          <label class="check"><input type="checkbox" name="citacao" ${m.citacao ? 'checked' : ''}> É uma citação do texto</label>
        </div></div>
        <footer class="modal-pe"><span class="espaco"></span>${btn('modal-fechar', 'Cancelar', '', 'btn-f')}<button class="btn-1" type="submit">${ic('check')}Guardar anotação</button></footer></form>`;
    }
    if (m.tipo === 'progresso') {
      const it = item(m.id), u = unidade(it);
      return `<form class="modal" method="dialog" data-form="progresso" data-id="${m.id}">
        <header class="modal-cab">${ic('bookmark')}<h2>Onde parei</h2>${btnIco('modal-fechar', 'xmark', 'Fechar')}</header>
        <div class="modal-corpo"><div class="form"><p class="meta">${esc(it.titulo)}</p>
          <div class="linha">${campo('f-pag', u[0].toUpperCase() + u.slice(1) + ' atual', `<input type="number" id="f-pag" name="paginaAtual" min="0" value="${esc(it.paginaAtual || '')}" autofocus>`, 'curto')}
          ${campo('f-pags', it.formato === 'filme' ? 'Duração' : 'Total', `<input type="number" id="f-pags" name="paginas" min="0" value="${esc(it.paginas || '')}">`, 'curto')}</div>
          <label class="check"><input type="checkbox" name="concluir"> Marcar como ${it.formato === 'filme' ? 'assistido' : 'lido'}</label>
        </div></div>
        <footer class="modal-pe"><span class="espaco"></span>${btn('modal-fechar', 'Cancelar', '', 'btn-f')}<button class="btn-1" type="submit">${ic('check')}Salvar</button></footer></form>`;
    }
    return '';
  }
  function abrirModal(m) { colherRascunhos(); UI.modal = m; render(); }
  function fecharModal() { colherRascunhos(); UI.modal = null; render(); }
  function renderModal() {
    if (!UI.modal) { if (modal.open) modal.close(); modal.innerHTML = ''; return; }
    modal.innerHTML = conteudoModal(UI.modal);
    if (!modal.open) modal.showModal();
    restaurarRascunhos();
    const campo1 = modal.querySelector('input:not([type=hidden]):not([type=radio]):not([type=file]), textarea');
    if (campo1 && !modal.contains(document.activeElement)) campo1.focus();
  }

  /* ---------------- posts ---------------- */
  function acoesPost(i, opts = {}) {
    const b = [btnAlterna('fav', i.id, i.favorito, 'star', 'Favorito', 'Favoritar', 'estrela')];
    const mais = [];
    if (i.tipo === 'link' || i.tipo === 'artigo') {
      b.push(btnAlterna('ler-depois', i.id, i.lerDepois, 'bookmark', 'Na fila de leitura', 'Ler mais tarde'));
      b.push(btnAlterna('lido', i.id, i.lido, 'check-circle', 'Lido', 'Marcar como lido'));
    }
    if (i.tipo === 'nota') {
      b.push(btnAlterna('fixar', i.id, i.fixado, 'pin', 'Fixada no mural', 'Fixar no mural'));
      b.push(btnIco('cor', 'palette', 'Trocar a cor', `data-id="${i.id}"`));
    }
    if (i.tipo === 'midia') {
      b.push(btnIco('progresso', 'bookmark', unidade(i) === 'minuto' ? 'Onde parei' : 'Página atual', `data-id="${i.id}"`));
      b.push(btnIco('anotar', 'page-edit', 'Nova anotação', `data-id="${i.id}"`));
    }
    if (i.tipo === 'artigo') b.push(btnIco('anotar', 'page-edit', 'Nova anotação', `data-id="${i.id}"`));
    if (i.tipo === 'desejo') {
      b.push(btnAlterna('comprei', i.id, i.comprado, 'check-circle', 'Comprado', 'Marcar como comprado'));
      b.push(btnIco('recapturar', 'refresh', 'Atualizar preço', `data-id="${i.id}"`));
    }
    const nc = (i.comentarios || []).length;
    b.push(`<button type="button" class="ico-btn ${nc ? 'ativo' : ''}" data-act="comentar" data-id="${i.id}" aria-label="Comentários" title="Comentários">${icAtivo('chat-bubble', nc)}${nc ? `<em>${nc}</em>` : ''}</button>`);
    if (i.url) b.push(btnIco('copiar-link', 'copy', 'Copiar endereço', `data-id="${i.id}"`));
    mais.push({ act: 'editar-item', id: i.id, ico: 'edit-pencil', txt: 'Editar' });
    if (i.url) mais.push({ act: 'abrir-fora', id: i.id, ico: 'open-new-window', txt: 'Abrir em nova guia' });
    if (i.tipo === 'nota' || i.tipo === 'link') mais.push({ act: 'organizar-em', id: i.id, ico: 'folder', txt: 'Mover para coleção' });
    if (i.tipo === 'midia') mais.push({ act: 'progresso', id: i.id, ico: 'bookmark', txt: 'Onde parei' });
    mais.push({ act: 'lembrar-item', id: i.id, ico: 'alarm', txt: 'Criar lembrete' });
    mais.push('-', { act: 'excluir-item', id: i.id, ico: 'trash', txt: 'Excluir', perigo: true });
    return `<footer class="post-acoes">${b.join('')}<span class="espaco"></span>${menuMais(mais)}</footer>`;
  }

  function comentariosHTML(i) {
    const nc = (i.comentarios || []).length;
    if (UI.comentando !== i.id && !nc) return '';
    if (UI.comentando !== i.id) return '';
    return `<div class="comentarios">
      ${i.comentarios.map((c) => `<div class="comentario">${avatarHTML('p')}<div class="balao">${esc(c.texto)}<time>${fmtDataHora(c.em)}</time></div></div>`).join('')}
      <form class="comentar" data-form="comentar" data-id="${i.id}">${avatarHTML('p')}
        <input name="texto" required placeholder="Comentar de novo…" autocomplete="off">
        <button class="btn-1 btn-p" type="submit">Enviar</button></form></div>`;
  }

  function corpoPost(i) {
    if (i.tipo === 'nota') return `<div class="postit ${corNota(i)}">${i.titulo ? `<h3><a href="#/item/${i.id}">${esc(i.titulo)}</a></h3>` : ''}
      <p>${esc(corta(i.texto, 420))}</p>${(i.texto || '').length > 420 ? `<a class="meta" href="#/item/${i.id}">Ler tudo</a>` : ''}</div>`;
    if (i.tipo === 'link') return `<div class="link-rico">
        ${i.imagem ? `<span class="arte"><img src="${esc(i.imagem)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentNode.remove()"></span>` : ''}
        <div class="link-dados"><h3><a href="${esc(i.url)}" target="_blank" rel="noopener">${esc(tituloItem(i))}</a></h3>
          <p class="fonte">${i.favicon ? `<img src="${esc(i.favicon)}" alt="" onerror="this.remove()">` : ic('link')}${esc(dominio(i.url))}</p>
          ${i.comentario ? `<p class="porque">${esc(corta(i.comentario, 160))}</p>` : (i.descricao ? `<p class="descricao">${esc(i.descricao)}</p>` : '')}
          ${i.capturaStatus === 'capturando' ? '<p class="meta">Capturando prévia…</p>' : ''}
        </div></div>`;
    if (i.tipo === 'midia') {
      b.push(btnIco('progresso', 'bookmark', unidade(i) === 'minuto' ? 'Onde parei' : 'Página atual', `data-id="${i.id}"`));
      b.push(btnIco('anotar', 'page-edit', 'Nova anotação', `data-id="${i.id}"`));
    }
    if (i.tipo === 'artigo') b.push(btnIco('anotar', 'page-edit', 'Nova anotação', `data-id="${i.id}"`));
    if (i.tipo === 'desejo') {
      b.push(btnAlterna('comprei', i.id, i.comprado, 'check-circle', 'Comprado', 'Marcar como comprado'));
      b.push(btnIco('recapturar', 'refresh', 'Atualizar preço', `data-id="${i.id}"`));
    }
    const nc = (i.comentarios || []).length;
    b.push(`<button type="button" class="ico-btn ${nc ? 'ativo' : ''}" data-act="comentar" data-id="${i.id}" aria-label="Comentários" title="Comentários">${icAtivo('chat-bubble', nc)}${nc ? `<em>${nc}</em>` : ''}</button>`);
    if (i.url) b.push(btnIco('copiar-link', 'copy', 'Copiar endereço', `data-id="${i.id}"`));
    mais.push({ act: 'editar-item', id: i.id, ico: 'edit-pencil', txt: 'Editar' });
    if (i.url) mais.push({ act: 'abrir-fora', id: i.id, ico: 'open-new-window', txt: 'Abrir em nova guia' });
    if (i.tipo === 'nota' || i.tipo === 'link') mais.push({ act: 'organizar-em', id: i.id, ico: 'folder', txt: 'Mover para coleção' });
    if (i.tipo === 'midia') mais.push({ act: 'progresso', id: i.id, ico: 'bookmark', txt: 'Onde parei' });
    mais.push({ act: 'lembrar-item', id: i.id, ico: 'alarm', txt: 'Criar lembrete' });
    mais.push('-', { act: 'excluir-item', id: i.id, ico: 'trash', txt: 'Excluir', perigo: true });
    return `<footer class="post-acoes">${b.join('')}<span class="espaco"></span>${menuMais(mais)}</footer>`;
  }

  function comentariosHTML(i) {
    const nc = (i.comentarios || []).length;
    if (UI.comentando !== i.id && !nc) return '';
    if (UI.comentando !== i.id) return '';
    return `<div class="comentarios">
      ${i.comentarios.map((c) => `<div class="comentario">${avatarHTML('p')}<div class="balao">${esc(c.texto)}<time>${fmtDataHora(c.em)}</time></div></div>`).join('')}
      <form class="comentar" data-form="comentar" data-id="${i.id}">${avatarHTML('p')}
        <input name="texto" required placeholder="Comentar de novo…" autocomplete="off">
        <button class="btn-1 btn-p" type="submit">Enviar</button></form></div>`;
  }

  function corpoPost(i) {
    if (i.tipo === 'nota') return `<div class="postit ${corNota(i)}">${i.titulo ? `<h3><a href="#/item/${i.id}">${esc(i.titulo)}</a></h3>` : ''}
      <p>${esc(corta(i.texto, 420))}</p>${(i.texto || '').length > 420 ? `<a class="meta" href="#/item/${i.id}">Ler tudo</a>` : ''}</div>`;
    if (i.tipo === 'link') return `<div class="link-rico">
        ${i.imagem ? `<span class="arte"><img src="${esc(i.imagem)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentNode.remove()"></span>` : ''}
        <div class="link-dados"><h3><a href="${esc(i.url)}" target="_blank" rel="noopener">${esc(tituloItem(i))}</a></h3>
          <p class="fonte">${i.favicon ? `<img src="${esc(i.favicon)}" alt="" onerror="this.remove()">` : ic('link')}${esc(dominio(i.url))} ${ic('open-new-window')}</p>
          ${i.descricao ? `<p class="descricao">${esc(i.descricao)}</p>` : ''}
          ${i.capturaStatus === 'capturando' ? '<p class="meta">Capturando prévia…</p>' : ''}
        </div></div>
      ${i.comentario ? `<p class="porque">${esc(i.comentario)}</p>` : ''}`;
    if (i.tipo === 'midia') {
      const p = progresso(i);
      return `<div class="midia-linha"><a href="#/item/${i.id}">${capaHTML(i)}</a>
        <div class="midia-dados"><h3><a href="#/item/${i.id}">${esc(i.titulo)}</a></h3>
          <p class="meta">${[i.autor, i.ano].filter(Boolean).map(esc).join(' · ')}</p>
          ${estrelasHTML(i.estrelas)}
          ${p !== null ? `<p class="progresso"><span class="barra"><i style="width:${p}%"></i></span> ${unidade(i)} ${i.paginaAtual} de ${i.paginas} · ${p}%</p>` : ''}
          <p class="tags"><span class="tag">${esc(STATUS[i.formato][i.status])}</span>${(i.generos || []).map((g) => `<span class="tag">${esc(g)}</span>`).join('')}
            ${(i.anotacoes || []).length ? `<span class="tag on">${i.anotacoes.length} anotação${i.anotacoes.length > 1 ? 'es' : ''}</span>` : ''}</p>
          ${i.comentario ? `<p class="porque">${esc(corta(i.comentario, 220))}</p>` : ''}</div></div>`;
    }
    if (i.tipo === 'artigo') {
      const p = pasta(i.pastaId);
      return `<div class="artigo"><span class="tipo ${i.ehPdf ? 'pdf' : ''}">${ic(i.ehPdf ? 'page' : 'link')}</span>
        <div class="link-dados"><h3><a href="#" data-act="abrir-artigo" data-id="${i.id}">${esc(tituloItem(i))}</a></h3>
          <p class="fonte">${ic('shop')}${esc(dominio(i.url))}${p ? ' · ' + esc(p.nome) : ''}${i.ehPdf ? ' · PDF' : ''}</p>
          ${i.descricao ? `<p class="descricao">${esc(i.descricao)}</p>` : ''}</div></div>`;
    }
    if (i.tipo === 'desejo') return `<div class="desejo-linha">${fotoProduto(i)}
        <div class="midia-dados"><h3><a href="#/item/${i.id}">${esc(tituloItem(i))}</a></h3>
          <p class="fonte">${ic('shop')}${esc(i.loja || dominio(i.url))}</p>
          <p>${precoHTML(i)}</p>${estrelasHTML(i.estrelas, i.avaliacoes ? '(' + i.avaliacoes + ')' : '')}
          ${i.comprado ? '<p class="tag">Comprado</p>' : ''}
          ${i.comentario ? `<p class="porque">${esc(i.comentario)}</p>` : ''}</div></div>`;
    return `<div class="gasto-linha"><span class="circulo ok">${ic('wallet')}</span>
      <span><strong class="post-tit" style="font-size:15.5px">${esc(i.descricao || 'Gasto')}</strong>
        <span class="meta" style="display:block">${[i.categoria, 'despesa de ' + fmtDiaCurto(i.dataGasto)].filter(Boolean).map(esc).join(' · ')}</span></span>
      <span class="valor">${brl(i.valor)}</span></div>`;
  }

  function postHTML(i, opts = {}) {
    const cols = (i.colecoes || []).map((c) => (colecao(c.id) || {}).nome).filter(Boolean);
    const quando = ehImportado(i) ? 'importado' : (opts.hora ? fmtHora(i.criadoEm) : fmtDataHora(i.criadoEm));
    return `<article class="post post-${i.tipo}" data-id="${i.id}">
      <header class="post-cab"><span class="selo">${ic(icoTipo(i))}${nomeTipo(i)}</span>
        ${cols.length ? `<span>em ${esc(cols.join(', '))}</span>` : ''}${i.organizar ? '<span>a organizar</span>' : ''}
        <time>${quando}</time></header>
      ${corpoPost(i)}${comentariosHTML(i)}${acoesPost(i, opts)}</article>`;
  }

  /* ---------------- topo, navegação e coluna direita ---------------- */
  function renderTopo() {
    const p = S.perfil, h = p.humores[hoje()];
    topoPerfil.innerHTML = `<details class="menu menu-perfil"><summary aria-label="Perfil e configurações">
        ${avatarHTML()}<span class="mp-texto"><strong>${esc(p.nome === 'Meu Nome' ? p.nome : p.nome.split(' ')[0])}</strong><span>${h ? esc(h.emoji || '') + ' ' + esc(h.texto || '') : 'como estou hoje?'}</span></span>${ic('nav-arrow-down')}</summary>
      <div class="menu-corpo">
        <a href="#/perfil">${ic('user')}<span>Editar perfil e humor</span></a>
        <a href="#/curriculo">${ic('suitcase')}<span>Meu currículo</span></a>
        <a href="#/config">${ic('settings')}<span>Configurações e backup</span></a>
        <div class="menu-modo"><span>${ic(modoAtual() === 'escuro' ? 'half-moon' : 'sun-light')}Aparência</span>
          <span class="segmento pequeno" role="group" aria-label="Aparência">
            ${[['claro', 'Claro'], ['escuro', 'Escuro'], ['sistema', 'Sistema']].map(([v, n]) =>
              `<button type="button" data-act="modo" data-v="${v}" aria-pressed="${(p.modo || 'sistema') === v}">${n}</button>`).join('')}</span></div>
        ${logado() ? `<hr><p class="menu-conta">${conta().foto ? `<img src="${esc(conta().foto)}" alt="" referrerpolicy="no-referrer">` : ic('user')}<span><strong>${esc(conta().nome)}</strong><small>${esc(conta().email)}</small></span></p>
          <button type="button" data-act="sair">${ic('log-out' in (window.ICONES || {}) ? 'log-out' : 'xmark')}<span>Sair da conta</span></button>` : ''}
      </div></details>`;
  }
  function renderNav(rota) {
    const itens = [['inicio', 'Início', 'home-simple', ''], ['mural', 'Mural', 'journal-page', doTipo('nota').length],
      ['biblioteca', 'Biblioteca', 'book-stack', doTipo('midia').length], ['estudos', 'Estudos', 'folder', doTipo('artigo').length],
      ['links', 'Links', 'link', doTipo('link').length], ['wishlist', 'Wishlist', 'shopping-bag', doTipo('desejo').filter((i) => !i.comprado).length],
      ['gastos', 'Gastos', 'wallet', ''], ['lembretes', 'Lembretes', 'alarm', pendentes().length], ['curriculo', 'Currículo', 'suitcase', '']];
    const nv = vencidos().length;
    navLateral.innerHTML = `<h2 class="sr-only">Navegação</h2>
      ${itens.map(([r, n, icone, q]) => `<a href="#/${r}" ${rota === r ? 'aria-current="page"' : ''}>${icAtivo(icone, rota === r)}<span>${n}</span>${q ? `<em class="pino ${r === 'lembretes' && nv ? 'alerta' : ''}">${q}</em>` : ''}</a>`).join('')}
      <p class="nav-sep">Coleções</p>
      ${S.colecoes.map((c) => `<a class="sub" href="#/links" data-act="col-ir" data-col="${c.id}" ${rota === 'links' && UI.colSel === c.id ? 'aria-current="true"' : ''}><span>${esc(c.nome)}</span><em class="pino">${S.itens.filter((i) => i.colecoes.some((x) => x.id === c.id)).length}</em></a>`).join('')}
      <a class="sub" href="#/links" data-act="col-ir" data-col="soltos" ${rota === 'links' && UI.colSel === 'soltos' ? 'aria-current="true"' : ''}><span>A organizar</span><em class="pino">${S.itens.filter((i) => !i.colecoes.length && (i.tipo === 'nota' || i.tipo === 'link')).length}</em></a>
      <a class="sub" href="#" data-act="nova-colecao"><span>${ic('plus')} Nova coleção</span></a>`;
  }
  function renderDireita(rota) {
    if (rota !== 'inicio') { direita.innerHTML = ''; direita.hidden = true; layout.classList.add('sem-direita'); return; }
    direita.hidden = false; layout.classList.remove('sem-direita');
    const b = [];
    const pend = pendentes().slice(0, 3);
    if (pend.length) b.push(cartao(ic('alarm') + 'Lembretes', `<div class="mini-lista">${pend.map((l) => `<p class="mini-item"><em class="ponto ${venc(l) <= Date.now() ? 'vence' : ''}"></em><span>${esc(l.texto)}</span><span class="meta">${fmtDiaCurto(l.data)}</span></p>`).join('')}</div>`, '<a href="#/lembretes">quadro</a>', 'fino'));
    const and = doTipo('midia').filter((i) => i.status === 'andamento').slice(0, 4);
    if (and.length) b.push(cartao(ic('book') + 'Lendo agora', `<div class="mini-capas">${and.map((i) => `<a href="#/item/${i.id}" title="${esc(i.titulo)}">${capaHTML(i, 'p')}</a>`).join('')}</div>`, '<a href="#/biblioteca">biblioteca</a>', 'fino'));
    const d = doTipo('desejo').filter((i) => !i.comprado).sort((a, x) => x.criadoEm.localeCompare(a.criadoEm))[0];
    if (d) b.push(cartao(ic('shopping-bag') + 'Na vitrine', `<a class="vitrine-mini" href="#/item/${d.id}">${fotoProduto(d)}<span><strong>${esc(corta(tituloItem(d), 46))}</strong>${precoHTML(d)}</span></a>`, '<a href="#/wishlist">wishlist</a>', 'fino'));
    const fila = S.itens.filter((i) => i.lerDepois && !i.lido).slice(0, 4);
    if (fila.length) b.push(cartao(ic('bookmark-solid') + 'Fila de leitura', `<div class="lista-links">${fila.map((i) => `<a href="${esc(i.url)}" target="_blank" rel="noopener">${ic(icoTipo(i))}<span>${esc(tituloItem(i))}</span></a>`).join('')}</div>`, '', 'fino'));
    const favs = ordenados().filter((i) => i.favorito).slice(0, 5);
    if (favs.length) b.push(cartao(ic('star-solid') + 'Favoritos', `<div class="lista-links">${favs.map((i) => `<a href="#/item/${i.id}">${ic(icoTipo(i))}<span>${esc(tituloItem(i))}</span></a>`).join('')}</div>`, '', 'fino'));
    if (!b.length) b.push(cartao('Seu espaço', '<p class="meta">Lembretes, leituras, favoritos e a vitrine aparecem aqui conforme você guarda coisas.</p>', '', 'fino'));
    direita.innerHTML = b.join('');
  }

  /* ---------------- Início ---------------- */
  function faixaLembrete() {
    const v = vencidos();
    if (!v.length) return '';
    const l = v[0], alvo = l.itemId && item(l.itemId);
    return `<div class="faixa-lembrete">${ic('alarm-solid')}
      <div><strong>${alvo ? `<a href="#/item/${alvo.id}">${esc(l.texto)}</a>` : esc(l.texto)}</strong>
        <span class="meta" style="display:block">Venceu ${fmtDia(l.data)}${l.hora ? ' às ' + l.hora : ''}${alvo ? ' · ' + esc(tituloItem(alvo)) : ''}</span></div>
      ${v.length > 1 ? `<a class="meta" href="#/lembretes">+${v.length - 1}</a>` : ''}
      ${btn('lemb-adiar', 'Adiar', `data-id="${l.id}"`, 'btn-2 btn-p')}${btn('lemb-concluir', 'Concluir', `data-id="${l.id}"`, 'btn-1 btn-p')}</div>`;
  }
  const compositor = () => `<section class="cartao compositor"><h2>O que você quer guardar?</h2>
    ${TIPOS_CRIAR.map(([v, n, i]) => `<button type="button" class="tipo-chip" data-act="criar" data-t="${v}">${ic(i)}${n}${temRascunho('criar:' + v) ? ' ·' : ''}</button>`).join('')}</section>`;

  function blocosFeed(lista, opts) {
    const imp = lista.filter(ehImportado);
    const lote = imp.length >= 3 ? imp : [];
    let h = lista.filter((i) => !lote.includes(i)).map((i) => postHTML(i, opts)).join('');
    if (lote.length) h += `<details class="lote"><summary>${ic('import')}<span><strong>${lote.length} links importados</strong> dos arquivos de exemplo</span>${ic('nav-arrow-down', 'seta')}</summary>
      <div class="lista-links">${lote.map((i) => `<a href="${esc(i.url)}" target="_blank" rel="noopener">${i.favicon ? `<img src="${esc(i.favicon)}" alt="" onerror="this.remove()">` : ic('link')}<span>${esc(tituloItem(i))}</span></a>`).join('')}</div>
      <p class="meta" style="margin-top:10px"><a href="#/links">Ver organizados em Links</a></p></details>`;
    return h;
  }
  function conteudoFeed() {
    const q = norm(UI.busca);
    if (q) {
      const res = ordenados().filter((i) => textoBusca(i).includes(q));
      return `<p class="secao-tit so">${res.length} resultado(s) para “${esc(UI.busca)}” ${btn('busca-limpar', 'limpar', '', 'btn-txt')}</p>`
        + (res.length ? res.map((i) => postHTML(i)).join('') : vazio('search', 'Nada encontrado. Tente outra palavra.'));
    }
    if (UI.feedModo === 'dia') {
      const d = UI.dia, doDia = ordenados().filter((i) => dataLocal(i.criadoEm) === d), h = S.perfil.humores[d];
      return `<div class="dia-nav">${btnIco('dia', 'nav-arrow-left', 'Dia anterior', 'data-n="-1"')}
          <input type="date" value="${d}" data-act="dia-sel">${btnIco('dia', 'nav-arrow-right', 'Próximo dia', 'data-n="1"')}
          ${btn('dia-hoje', 'Hoje', '', 'btn-2 btn-p')}
          <span class="dia-humor">${rotuloDia(d)} · ${h ? esc(h.emoji || '') + ' ' + esc(h.texto || '') : 'sem humor'} ${btn('humor-dia', h ? 'editar' : 'registrar', '', 'btn-txt')}</span>
          <span class="espaco"></span>${btn('feed-todos', 'Todo o feed', '', 'btn-f btn-p')}</div>
        ${doDia.length ? blocosFeed(doDia, { hora: true }) : vazio('calendar', 'Nenhum registro neste dia.')}`;
    }
    const lista = ordenados();
    let h = `<div class="secao-tit">Atividade recente ${btnTxt('feed-dia', 'calendar', 'Por dia')}</div>`;
    if (!lista.length) return h + vazio('journal-page', 'Nada guardado ainda. Comece pelos botões acima.');
    const dias = {};
    lista.forEach((i) => { const d = dataLocal(i.criadoEm); (dias[d] = dias[d] || []).push(i); });
    Object.keys(dias).sort().reverse().forEach((d) => { h += `<p class="secao-tit">${rotuloDia(d)}</p>` + blocosFeed(dias[d], { hora: true }); });
    return h;
  }
  const renderInicio = () => { main.innerHTML = faixaLembrete() + compositor() + `<div class="feed">${conteudoFeed()}</div>`; };

  /* ---------------- Mural ---------------- */
  function renderMural() {
    let ns = doTipo('nota').slice().sort((a, b) => (b.fixado ? 1 : 0) - (a.fixado ? 1 : 0) || (a.ordem ?? 0) - (b.ordem ?? 0) || b.criadoEm.localeCompare(a.criadoEm));
    if (UI.muralCol === 'soltos') ns = ns.filter((i) => !i.colecoes.length);
    else if (UI.muralCol !== 'todas') ns = ns.filter((i) => i.colecoes.some((c) => c.id === UI.muralCol));
    const nota = (i) => `<article class="postit ${corNota(i)} arrastavel" draggable="true" data-id="${i.id}" data-arrasta>
      ${i.titulo ? `<h3><a href="#/item/${i.id}">${esc(i.titulo)}</a></h3>` : ''}
      <p>${esc(corta(i.texto, 240))}</p>
      <footer><time>${i.fixado ? ic('pin-solid') + ' ' : ''}${fmtDiaCurto(dataLocal(i.criadoEm))}</time>
        ${btnAlterna('fav', i.id, i.favorito, 'star', 'Favorito', 'Favoritar', 'estrela')}
        ${btnAlterna('fixar', i.id, i.fixado, 'pin', 'Fixada', 'Fixar')}
        ${menuMais([{ act: 'cor', id: i.id, ico: 'palette', txt: 'Trocar a cor' }, { act: 'editar-item', id: i.id, ico: 'edit-pencil', txt: 'Editar' },
          { act: 'comentar', id: i.id, ico: 'chat-bubble', txt: 'Comentários' }, { act: 'mover', id: i.id, ico: 'arrow-up', txt: 'Mover para o começo', extra: 'data-dir="topo"' },
          '-', { act: 'excluir-item', id: i.id, ico: 'trash', txt: 'Excluir', perigo: true }])}</footer></article>`;
    main.innerHTML = `<header class="pagina-cab"><h1>${ic('journal-page')}Mural</h1>
        <div class="ferramentas">${selectHTML('mural-col', '', [['todas', 'Todas as coleções'], ...S.colecoes.map((c) => [c.id, c.nome]), ['soltos', 'Sem coleção']], UI.muralCol).replace('<select', '<select data-act="mural-col" style="width:auto"')}
          ${btn('criar', ic('plus') + 'Nova nota', 'data-t="nota"', 'btn-1')}</div>
        <p class="meta">Arraste os post-its para reordenar.</p></header>
      <div class="mural" data-lista-mural>${ns.map(nota).join('')}
        <button type="button" class="nova" data-act="criar" data-t="nota">${ic('plus')}Novo post-it</button></div>`;
  }

  /* ---------------- Biblioteca ---------------- */
  function renderBiblioteca() {
    let ms = doTipo('midia');
    if (UI.bibFormato !== 'todos') ms = ms.filter((i) => i.formato === UI.bibFormato);
    const q = norm(UI.bibBusca);
    if (q) ms = ms.filter((i) => textoBusca(i).includes(q));
    const grupos = [];
    if (UI.bibAgrupar === 'status') ['andamento', 'quero', 'concluido'].forEach((s) => { const l = ms.filter((i) => i.status === s); if (l.length) grupos.push([STATUS_GRUPO[s], l]); });
    else if (UI.bibAgrupar === 'estrelas') { [5, 4, 3, 2, 1].forEach((n) => { const l = ms.filter((i) => Math.round(i.estrelas || 0) === n); if (l.length) grupos.push([n + ' estrela' + (n > 1 ? 's' : ''), l]); }); const s = ms.filter((i) => !i.estrelas); if (s.length) grupos.push(['Sem nota', s]); }
    else [...new Set(ms.flatMap((i) => (i.generos && i.generos.length) ? i.generos : ['Sem gênero']))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
      .forEach((g) => grupos.push([g, ms.filter((i) => ((i.generos && i.generos.length) ? i.generos : ['Sem gênero']).includes(g))]));
    const volume = (i) => { const p = progresso(i); return `<a class="volume" href="#/item/${i.id}">${capaHTML(i)}
      <strong>${esc(i.titulo)}</strong>${estrelasHTML(i.estrelas)}
      <span class="meta">${esc(STATUS[i.formato][i.status])}${p !== null ? ' · ' + p + '%' : ''}</span>
      ${p !== null ? `<span class="barra"><i style="width:${p}%"></i></span>` : ''}</a>`; };
    const seg = (act, atual, ops) => `<span class="segmento" role="group">${ops.map(([v, n]) => `<button type="button" data-act="${act}" data-v="${v}" aria-pressed="${atual === v}">${n}</button>`).join('')}</span>`;
    main.innerHTML = `<header class="pagina-cab"><h1>${ic('book-stack')}Biblioteca</h1>
        <div class="ferramentas">${btn('criar', ic('plus') + 'Adicionar', 'data-t="midia"', 'btn-1')}</div></header>
      <div class="ferramentas">${seg('bib-formato', UI.bibFormato, [['todos', 'Tudo'], ['livro', 'Livros'], ['filme', 'Filmes']])}
        <span class="meta">Prateleiras por</span>${seg('bib-agrupar', UI.bibAgrupar, [['status', 'Situação'], ['genero', 'Gênero'], ['estrelas', 'Estrelas']])}
        <input type="search" placeholder="Buscar nome, autor, gênero…" value="${esc(UI.bibBusca)}" data-act="bib-busca" style="flex:1 1 180px;width:auto"></div>
      ${grupos.length ? grupos.map(([n, l]) => `<section class="prateleira"><p class="secao-tit">${esc(n)} · ${l.length}</p><div class="estante">${l.map(volume).join('')}</div></section>`).join('')
        : vazio('book-stack', doTipo('midia').length ? 'Nada com esses filtros.' : 'Sua estante está vazia.', btn('criar', 'Adicionar o primeiro', 'data-t="midia"', 'btn-1'))}`;
  }

  /* ---------------- Estudos ---------------- */
  function renderEstudos() {
    if (UI.pastaAberta) {
      const p = pasta(UI.pastaAberta);
      if (!p) { UI.pastaAberta = null; return renderEstudos(); }
      const arts = doTipo('artigo').filter((a) => a.pastaId === p.id).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
      main.innerHTML = `<header class="pagina-cab"><h1>${btnIco('pasta-voltar', 'nav-arrow-left', 'Voltar para as pastas')}${esc(p.nome)}</h1>
          <div class="ferramentas">${btn('criar', ic('plus') + 'Novo artigo', 'data-t="artigo"', 'btn-1')}
            ${menuMais([{ act: 'editar-pasta', id: p.id, ico: 'edit-pencil', txt: 'Editar pasta' }, '-', { act: 'excluir-pasta', id: p.id, ico: 'trash', txt: 'Excluir pasta', perigo: true }])}</div>
          ${p.descricao ? `<p class="meta">${esc(p.descricao)}</p>` : ''}</header>
        ${arts.length ? `<div class="feed">${arts.map((a) => postHTML(a)).join('')}</div>` : vazio('page', 'Nenhum artigo nesta pasta.', btn('criar', 'Guardar o primeiro', 'data-t="artigo"', 'btn-1'))}`;
      return;
    }
    const gaveta = (p) => { const n = doTipo('artigo').filter((a) => a.pastaId === p.id).length;
      return `<a class="gaveta" href="#" data-act="abrir-pasta" data-id="${p.id}"><span class="aba"></span>
        <span class="frente"><span class="capa-pasta">${p.capa ? `<img src="${p.capa}" alt="">` : ic('folder')}</span>
          <strong>${esc(p.nome)}</strong><span class="meta">${n} artigo${n === 1 ? '' : 's'}</span></span></a>`; };
    main.innerHTML = `<header class="pagina-cab"><h1>${ic('folder')}Estudos</h1>
        <div class="ferramentas">${btn('nova-pasta', ic('folder-plus') + 'Nova pasta', '', 'btn-2')}${btn('criar', ic('plus') + 'Novo artigo', 'data-t="artigo"', 'btn-1')}</div>
        <p class="meta">Pastas de assunto com os artigos que você está estudando.</p></header>
      ${S.pastas.length ? `<div class="gavetas">${S.pastas.map(gaveta).join('')}</div>` : vazio('folder', 'Crie uma pasta por assunto, como Design ou Botânica.', btn('nova-pasta', 'Criar a primeira pasta', '', 'btn-1'))}
      ${UI.servidor ? '' : `<p class="aviso">${ic('priority-high')}<span>Para ler PDFs dentro do site, abra pelo servidor (<code>iniciar.bat</code>) ou pelo endereço publicado. Sem ele, os artigos abrem em nova guia.</span></p>`}`;
  }

  /* ---------------- Links ---------------- */
  function renderLinks() {
    const c = UI.colSel;
    const nome = c === 'todas' ? 'Links' : c === 'soltos' ? 'A organizar' : (colecao(c) || {}).nome;
    let res = ordenados().filter((i) => i.tipo === 'link' || i.tipo === 'nota');
    if (c === 'soltos') res = res.filter((i) => !i.colecoes.length);
    else if (c !== 'todas') res = res.filter((i) => i.colecoes.some((x) => x.id === c));
    if (UI.colTipo !== 'todos') res = res.filter((i) => i.tipo === UI.colTipo);
    if (UI.colFiltro === 'favoritos') res = res.filter((i) => i.favorito);
    if (UI.colFiltro === 'ler') res = res.filter((i) => i.lerDepois && !i.lido);
    const q = norm(UI.colBusca);
    if (q) res = res.filter((i) => textoBusca(i).includes(q));

    let corpo;
    if (!res.length) corpo = vazio('link', 'Nenhum item com esses filtros.');
    else if (c === 'todas') {
      const grupos = S.colecoes.map((col) => [col, res.filter((i) => i.colecoes.some((x) => x.id === col.id))]).filter(([, l]) => l.length);
      const soltos = res.filter((i) => !i.colecoes.length);
      if (soltos.length) grupos.push([{ id: 'soltos', nome: 'A organizar' }, soltos]);
      corpo = grupos.map(([col, l]) => `<section class="grupo">
        <p class="secao-tit"><a href="#/links" data-act="col-ir" data-col="${col.id}">${esc(col.nome)}</a> <span class="pino">${l.length}</span></p>
        <div class="grade">${l.map((i) => postHTML(i)).join('')}</div></section>`).join('');
    } else {
      const grupos = {};
      res.forEach((i) => { const g = (i.colecoes.find((x) => x.id === c) || {}).grupo || ''; (grupos[g] = grupos[g] || []).push(i); });
      corpo = Object.entries(grupos).map(([g, l]) => `<section class="grupo">
        ${(g || Object.keys(grupos).length > 1) ? `<p class="secao-tit">${esc(g || 'Sem grupo')} <span class="pino">${l.length}</span></p>` : ''}
        <div class="grade">${l.map((i) => postHTML(i, { colAtual: c })).join('')}</div></section>`).join('');
    }
    main.innerHTML = `<header class="pagina-cab"><h1>${ic('link')}${esc(nome || 'Links')}</h1>
        <div class="ferramentas">${btn('criar', ic('plus') + 'Guardar link', 'data-t="link"', 'btn-1')}
          ${c.startsWith('col-') ? menuMais([{ act: 'editar-colecao', id: c, ico: 'edit-pencil', txt: 'Renomear coleção' }, '-', { act: 'excluir-colecao', id: c, ico: 'trash', txt: 'Excluir coleção', perigo: true }]) : ''}</div></header>
      <div class="ferramentas">
        ${selectHTML('col-sel', '', [['todas', 'Todas as coleções'], ...S.colecoes.map((x) => [x.id, x.nome]), ['soltos', 'A organizar']], c).replace('<select', '<select data-act="col-select" style="width:auto"')}
        ${selectHTML('col-tipo', '', [['todos', 'Links e notas'], ['link', 'Só links'], ['nota', 'Só notas']], UI.colTipo).replace('<select', '<select data-act="col-tipo" style="width:auto"')}
        <span class="segmento" role="group">${[['todos', 'Todos'], ['favoritos', 'Favoritos'], ['ler', 'Ler depois']].map(([v, n]) => `<button type="button" data-act="col-filtro" data-v="${v}" aria-pressed="${UI.colFiltro === v}">${n}</button>`).join('')}</span>
        <input type="search" placeholder="Buscar…" value="${esc(UI.colBusca)}" data-act="col-busca" style="flex:1 1 160px;width:auto"></div>
      ${corpo}`;
  }

  /* ---------------- Wishlist ---------------- */
  const HORAS_CONFERIR = 12;
  async function conferirPrecos() {
    if (!UI.servidor || UI.conferindo) return;
    const limite = Date.now() - HORAS_CONFERIR * 3600e3;
    const alvos = doTipo('desejo').filter((i) => !i.comprado && i.url
      && (!i.capturaEm || new Date(i.capturaEm).getTime() < limite)).slice(0, 5);
    if (!alvos.length) return;
    UI.conferindo = true;
    for (const d of alvos) {
      const antes = d.preco;
      await capturar(d, true);
      if (antes != null && d.preco != null && d.preco < antes) avisarQueda(d, antes);
    }
    UI.conferindo = false;
    salvar(); render();
  }
  function avisarQueda(d, antes) {
    const caiu = antes - d.preco;
    const texto = `Baixou de preço: ${tituloItem(d)} — de ${brl(antes, d.moeda)} para ${brl(d.preco, d.moeda)}`;
    if (!S.lembretes.some((l) => l.itemId === d.id && !l.concluido && l.motivo === 'preco')) {
      S.lembretes.push({ id: uid('lemb'), texto, data: hoje(), hora: '', itemId: d.id, concluido: false, criadoEm: agora(), motivo: 'preco' });
    }
    toast(corta(tituloItem(d), 40) + ' baixou ' + brl(caiu, d.moeda) + '.', 'shopping-bag');
  }

  function renderWishlist() {
    let ds = doTipo('desejo').filter((i) => UI.wlFiltro === 'comprados' ? i.comprado : !i.comprado);
    const sem = (i) => i.preco === null || i.preco === undefined;
    if (UI.wlOrdem === 'menor') ds.sort((a, b) => sem(a) - sem(b) || a.preco - b.preco);
    else if (UI.wlOrdem === 'maior') ds.sort((a, b) => sem(a) - sem(b) || b.preco - a.preco);
    else ds.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
    const total = ds.reduce((s, i) => s + (i.preco || 0), 0);
    const selo = (i) => i.capturaStatus === 'capturando' ? '<span class="tag">Capturando…</span>'
      : i.capturaStatus === 'pendente' ? '<span class="tag">Aguardando captura</span>'
        : i.capturaStatus === 'falhou' ? '<span class="tag">Não consegui ler a página</span>'
          : (i.faltando || []).length ? `<span class="tag">Faltou: ${esc(i.faltando.join(', '))}</span>` : '';
    const prod = (i) => `<article class="produto ${i.comprado ? 'comprado' : ''}" data-id="${i.id}">
      <a href="#/item/${i.id}" aria-label="Abrir ${esc(tituloItem(i))}">${fotoProduto(i)}</a>
      <p class="fonte">${ic('shop')}${esc(i.loja || dominio(i.url))}</p>
      <h3><a href="#/item/${i.id}">${esc(tituloItem(i))}</a></h3>
      ${estrelasHTML(i.estrelas, i.avaliacoes ? '(' + i.avaliacoes + ')' : '')}
      <p>${precoHTML(i)}</p>${selo(i)}
      <a class="btn btn-1 btn-p produto-ir" href="${esc(i.url)}" target="_blank" rel="noopener">Ver na loja ${ic('open-new-window')}</a>
      <div class="pe">${btnAlterna('fav', i.id, i.favorito, 'star', 'Favorito', 'Favoritar', 'estrela')}
        ${btnAlterna('comprei', i.id, i.comprado, 'check-circle', 'Comprado', 'Marcar como comprado')}
        ${btnIco('recapturar', 'refresh', 'Atualizar preço', `data-id="${i.id}"`)}
        ${btnIco('copiar-link', 'copy', 'Copiar endereço', `data-id="${i.id}"`)}<span class="espaco"></span>
        ${menuMais([{ act: 'editar-item', id: i.id, ico: 'edit-pencil', txt: 'Corrigir dados' }, '-', { act: 'excluir-item', id: i.id, ico: 'trash', txt: 'Excluir', perigo: true }])}</div></article>`;
    main.innerHTML = `<header class="pagina-cab"><h1>${ic('shopping-bag')}Wishlist</h1>
        <div class="ferramentas">${btn('criar', ic('plus') + 'Colar link', 'data-t="desejo"', 'btn-1')}</div>
        <p class="meta">${ds.length} produto(s)${total ? ' · ' + brl(total) + ' somados' : ''}</p></header>
      <div class="ferramentas"><span class="segmento" role="group">${[['desejos', 'Quero'], ['comprados', 'Comprados']].map(([v, n]) => `<button type="button" data-act="wl-filtro" data-v="${v}" aria-pressed="${UI.wlFiltro === v}">${n}</button>`).join('')}</span>
        ${selectHTML('wl-ord', '', [['recentes', 'Mais recentes'], ['menor', 'Menor preço'], ['maior', 'Maior preço']], UI.wlOrdem).replace('<select', '<select data-act="wl-ordem" style="width:auto"')}
        ${doTipo('desejo').some((i) => !i.comprado) ? btnTxt('recapturar-todos', 'refresh', 'Atualizar todos os preços') : ''}</div>
      ${UI.conferindo ? `<p class="meta">${ic('refresh')} Conferindo os preços…</p>` : ''}
      ${ds.length ? `<div class="vitrine">${ds.map(prod).join('')}</div>` : vazio('shopping-bag', UI.wlFiltro === 'comprados' ? 'Nada marcado como comprado.' : 'Cole o link de um produto para começar.', btn('criar', 'Colar link', 'data-t="desejo"', 'btn-1'))}`;
  }

  /* ---------------- Gastos ---------------- */
  function renderGastos() {
    const mes = UI.gastoMes;
    const doMes = doTipo('gasto').filter((i) => i.dataGasto.slice(0, 7) === mes).sort((a, b) => b.dataGasto.localeCompare(a.dataGasto));
    const total = doMes.reduce((s, i) => s + Number(i.valor), 0);
    const cats = {};
    doMes.forEach((i) => { const c = i.categoria || 'Sem categoria'; cats[c] = (cats[c] || 0) + Number(i.valor); });
    const lista = Object.entries(cats).sort((a, b) => b[1] - a[1]);
    main.innerHTML = `<header class="pagina-cab"><h1>${ic('wallet')}Gastos</h1>
        <div class="ferramentas"><input type="month" value="${mes}" data-act="gasto-mes" style="width:auto">${btn('criar', ic('plus') + 'Novo gasto', 'data-t="gasto"', 'btn-1')}</div></header>
      <section class="cartao"><p class="meta">Total do mês</p><p class="total-grande">${brl(total)}</p>
        ${lista.length ? `<div class="barras" style="margin-top:18px">${lista.map(([c, v]) => `<div><span>${esc(c)}</span><span class="barra" style="max-width:none"><i style="width:${Math.max(3, v / total * 100)}%"></i></span><strong>${brl(v)}</strong></div>`).join('')}</div>` : ''}</section>
      ${doMes.length ? `<section class="cartao"><table class="tabela"><thead><tr><th>Dia</th><th>Descrição</th><th>Categoria</th><th class="num">Valor</th><th></th></tr></thead><tbody>
        ${doMes.map((i) => `<tr><td>${fmtDiaCurto(i.dataGasto)}</td><td><a href="#/item/${i.id}">${esc(i.descricao || 'Gasto')}</a></td><td class="meta">${esc(i.categoria || '—')}</td><td class="num">${brl(i.valor)}</td>
          <td style="text-align:right">${menuMais([{ act: 'editar-item', id: i.id, ico: 'edit-pencil', txt: 'Editar' }, '-', { act: 'excluir-item', id: i.id, ico: 'trash', txt: 'Excluir', perigo: true }])}</td></tr>`).join('')}</tbody></table></section>`
        : vazio('wallet', 'Nenhum gasto neste mês.')}`;
  }

  /* ---------------- Lembretes ---------------- */
  function renderLembretes() {
    const h = hoje(), sem = somaDias(h, 7), pend = pendentes(), feitos = S.lembretes.filter((l) => l.concluido);
    const cols = [['Vencidos', pend.filter((l) => l.data < h)], ['Hoje', pend.filter((l) => l.data === h)],
      ['Próximos 7 dias', pend.filter((l) => l.data > h && l.data <= sem)], ['Depois', pend.filter((l) => l.data > sem)]];
    const card = (l) => {
      const alvo = l.itemId && item(l.itemId);
      return `<article class="lembrete ${!l.concluido && venc(l) <= Date.now() ? 'vence' : ''} ${l.concluido ? 'feito' : ''}">
        <p>${alvo ? `<a href="#/item/${alvo.id}">${esc(l.texto)}</a>` : esc(l.texto)}</p>
        <p class="meta">${l.motivo === 'preco' ? ic('shopping-bag') + ' queda de preço · ' : ic('calendar') + ' '}${fmtDiaCurto(l.data)}${l.hora ? ' · ' + l.hora : ''}${alvo ? '<br>' + ic(icoTipo(alvo)) + ' ' + esc(corta(tituloItem(alvo), 40)) : ''}</p>
        <div class="pe">${l.concluido ? btnIco('lemb-reabrir', 'undo', 'Reabrir', `data-id="${l.id}"`) : btnIco('lemb-concluir', 'check-circle', 'Concluir', `data-id="${l.id}"`)}
          ${l.concluido ? '' : btnIco('lemb-adiar', 'clock', 'Adiar', `data-id="${l.id}"`)}<span class="espaco"></span>
          ${menuMais([{ act: 'editar-item', id: l.id, ico: 'edit-pencil', txt: 'Editar' }, '-', { act: 'excluir-lembrete', id: l.id, ico: 'trash', txt: 'Excluir', perigo: true }])}</div></article>`;
    };
    main.innerHTML = `<header class="pagina-cab"><h1>${ic('alarm')}Lembretes</h1>
        <div class="ferramentas">${btn('criar', ic('plus') + 'Novo lembrete', 'data-t="lembrete"', 'btn-1')}</div></header>
      <div class="quadro">${cols.map(([n, ls]) => `<section class="quadro-col"><h2>${n}<em class="pino ${n === 'Vencidos' && ls.length ? 'alerta' : ''}">${ls.length}</em></h2>
        ${ls.map(card).join('') || '<p class="nada" style="padding:0 6px">—</p>'}</section>`).join('')}</div>
      ${feitos.length ? `<details class="cartao"><summary style="cursor:pointer;font-weight:600;font-size:14px">${ic('check-circle-solid')} Concluídos (${feitos.length})</summary>
        <div class="quadro-col" style="margin-top:14px">${feitos.map(card).join('')}</div></details>` : ''}`;
  }

  /* ---------------- Perfil e Configurações ---------------- */
  const TEMAS = [['azul', 'Azul', '#2f5fe0'], ['lilas', 'Lilás', '#6d44c8'], ['verde', 'Verde', '#157f4a'], ['grafite', 'Grafite', '#3b4252']];
  const EMOJIS = ['🙂', '😄', '🤩', '😌', '🧠', '🔥', '😴', '😮‍💨', '🫠', '😕', '😤', '🥲', '☕', '🎧', '🌱'];
  function renderPerfil() {
    const p = S.perfil, h = p.humores[hoje()] || {};
    const hist = Object.entries(p.humores).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 12);
    main.innerHTML = `<header class="pagina-cab"><h1>${ic('user')}Perfil</h1></header>
      <form class="cartao form" data-form="perfil">
        <div class="linha" style="align-items:center;gap:20px">
          <details class="menu"><summary class="foto-editavel" aria-label="Trocar ou remover a foto">${avatarHTML('g')}
              <span class="cobre">${ic('media-image')}Trocar</span></summary>
            <div class="menu-corpo esq"><button type="button" data-act="foto-trocar">${ic('upload')}<span>${p.foto ? 'Trocar a foto' : 'Enviar uma foto'}</span></button>
              ${p.foto ? `<button type="button" data-act="foto-remover" class="perigo">${ic('trash')}<span>Remover a foto</span></button>` : ''}
              ${logado() && conta().foto ? `<button type="button" data-act="foto-google">${ic('user')}<span>Usar a foto do Google</span></button>` : ''}
              ${logado() ? `<hr><button type="button" data-act="sair">${ic('log-out' in (window.ICONES || {}) ? 'log-out' : 'xmark')}<span>Sair da conta</span></button>` : ''}</div></details>
          <div class="campo" style="flex:1 1 220px"><label for="pf-nome">Nome</label><input type="text" id="pf-nome" name="nome" required value="${esc(p.nome)}"></div>
        </div>
        ${campo('pf-bio', 'Mini bio <span class="opcional">(independente do currículo)</span>', area('pf-bio', 'bio', p.bio, 'placeholder="Designer, colecionando referências de interfaces…"'))}
        <div class="campo"><span class="rotulo">Como estou hoje</span>
          <div class="emojis">${EMOJIS.map((e) => `<button type="button" class="emoji-op" data-act="humor-emoji" data-v="${e}" aria-pressed="${h.emoji === e}" aria-label="Humor ${e}">${e}</button>`).join('')}</div>
          <input type="hidden" name="humorEmoji" value="${esc(h.emoji || '')}">
          <input type="text" name="humorTexto" value="${esc(h.texto || '')}" placeholder="em uma palavra: focado, tranquilo…" list="lista-humor">
          <datalist id="lista-humor">${['animado pra criar', 'tranquilo', 'focado', 'cansado', 'inspirado', 'ansioso', 'feliz'].map((x) => `<option value="${x}">`).join('')}</datalist></div>
        <div class="campo"><span class="rotulo">Cor do tema</span><div class="temas">
          ${TEMAS.map(([v, n, c]) => `<button type="button" class="tema-op" data-act="tema" data-v="${v}" aria-pressed="${(UI.temaPrevia || p.tema) === v && !(UI.corPrevia || p.corCustom)}"><span class="amostra" style="background:${c}"></span>${n}</button>`).join('')}
          <label class="tema-op" style="cursor:pointer"><input type="color" name="corCustom" value="${esc(UI.corPrevia || p.corCustom || '#2f5fe0')}" data-act="cor-custom" style="width:30px;height:30px;padding:2px;border:0;background:none"> Personalizada</label>
          ${(UI.corPrevia || p.corCustom) ? btn('cor-limpar', 'Voltar ao tema', '', 'btn-f btn-p') : ''}</div></div>
        <div class="acoes-form"><button class="btn-1" type="submit">${ic('check')}Salvar</button>${btn('perfil-cancelar', 'Cancelar', '', 'btn-f')}</div>
      </form>
      ${hist.length ? cartao(ic('emoji') + 'Humor nos últimos dias', `<div class="mini-lista">${hist.map(([d, v]) => `<p class="mini-item"><span>${esc(v.emoji || '')} ${esc(v.texto || '')}</span><span class="meta">${fmtDiaCurto(d)}</span>${btnIco('humor-apagar', 'xmark', 'Apagar', `data-d="${d}"`)}</p>`).join('')}</div>`, '', 'fino') : ''}`;
  }
  function renderConfig() {
    const n = S.itens.length, imgs = S.itens.filter((i) => i.capa).length;
    main.innerHTML = `<header class="pagina-cab"><h1>${ic('settings')}Configurações</h1></header>
      ${UI.sessao.viaFirebase ? cartao(ic('priority-high') + 'Sessão do site', `
        <p class="meta">Você está entrando pela conta do Google guardada no navegador. A sessão do site em si caiu, o que costuma significar que falta definir <code>SESSAO_SEGREDO</code> nas variáveis de ambiente do servidor.</p>
        <p class="meta" style="margin-top:8px">Nada se perde por causa disso: seus registros continuam guardados e sincronizados.</p>`) : ''}
      ${cartao(ic('refresh') + 'Sincronização', `
        <p class="meta" id="estado-nuvem">${textoNuvem()}</p>
        ${UI.nuvem.estado === 'ligada' || UI.nuvem.estado === 'enviando'
          ? `<p class="meta" style="margin-top:8px">Seus registros ficam na sua conta e aparecem em qualquer aparelho onde você entrar. Alterações de outro aparelho chegam sozinhas.</p>
             <div class="acoes-form" style="margin-top:14px">${btn('sync-agora', ic('refresh') + 'Sincronizar agora', '', 'btn-2')}</div>`
          : UI.nuvem.estado === 'desligada'
            ? `<p class="meta" style="margin-top:8px">Entre de novo com o Google para ligar a sincronização neste navegador.</p>
               <div class="acoes-form" style="margin-top:14px">${btn('ligar-sync', ic('refresh') + 'Ligar sincronização', '', 'btn-1')}</div><div id="botao-google-config" style="margin-top:10px"></div>`
            : UI.nuvem.estado === 'erro'
              ? `<div class="acoes-form" style="margin-top:14px">${btn('sync-agora', 'Tentar de novo', '', 'btn-2')}</div>`
              : '<p class="meta" style="margin-top:8px">Os registros ficam só neste navegador. A sincronização liga ao entrar com a conta Google pelo servidor ou pelo site publicado.</p>'}`)}
      ${cartao(ic('database-backup') + 'Backup dos dados', `
        <p class="meta">Tudo fica guardado neste navegador e neste endereço. Para levar para outro navegador, outro computador ou para o endereço publicado, exporte aqui e importe lá.</p>
        <p class="meta" style="margin-top:8px">${n} registros · ${S.colecoes.length} coleções · ${S.pastas.length} pastas de estudo · ${imgs} capas guardadas</p>
        <div class="acoes-form" style="margin-top:16px">${btn('backup-exportar', ic('download') + 'Exportar backup', '', 'btn-1')}
          ${btn('backup-importar', ic('upload') + 'Importar backup', '', 'btn-2')}</div>`)}
      ${cartao(ic('user') + 'Conta', logado()
        ? `<div class="linha" style="align-items:center;gap:14px">${conta().foto ? `<img class="avatar" src="${esc(conta().foto)}" alt="" referrerpolicy="no-referrer">` : avatarHTML()}
             <div style="flex:1 1 180px"><strong>${esc(conta().nome)}</strong><p class="meta">${esc(conta().email)}</p></div>
             ${btn('sair', 'Sair da conta', '', 'btn-2')}</div>
           <p class="meta" style="margin-top:12px">${UI.sessao.restrito ? 'Só os e-mails liberados nas configurações do servidor conseguem entrar.' : 'Qualquer conta Google consegue entrar. Para liberar só a sua, defina EMAILS_PERMITIDOS no servidor ou na Vercel.'}</p>`
        : UI.sessao.modo === 'local'
          ? '<p class="meta">Abrindo o arquivo direto no navegador, o login fica desligado. Ele funciona pelo servidor local ou no site publicado.</p>'
          : '<p class="meta">Você não está em nenhuma conta.</p>')}
      ${cartao(ic('database-backup') + 'Servidor de captura', UI.servidor
        ? `<p class="meta">${ic('check-circle-solid')} Ligado. Links, produtos e PDFs são lidos normalmente.</p>`
        : `<p class="meta">Desligado. Links e produtos ficam aguardando captura e os PDFs abrem em nova guia.</p>
           <p class="meta" style="margin-top:8px">Abra pelo <code>iniciar.bat</code> (ou <code>python servidor.py</code>) e use o endereço <code>http://localhost:8000</code>, ou acesse o site publicado.</p>`)}
      ${cartao(ic('undo') + 'Recomeçar', `<p class="meta">Apaga tudo o que está neste navegador e recarrega os dados de exemplo. Exporte um backup antes.</p>
        <div class="acoes-form" style="margin-top:14px">${btn('resetar', 'Restaurar dados de exemplo', '', 'btn-perigo btn-2')}</div>`)}`;
  }

  /* ---------------- ficha ---------------- */
  function renderFicha(id) {
    const i = item(id);
    if (!i) { main.innerHTML = vazio('search', 'Este registro foi excluído.', `<a class="btn btn-1" href="#/inicio">Voltar ao Início</a>`); return; }
    const p = i.tipo === 'midia' ? progresso(i) : null;
    let topo = '';
    if (i.tipo === 'midia') topo = `<div class="midia-linha">${capaHTML(i, 'g')}
      <div class="midia-dados"><h1 class="pagina-cab" style="font-size:26px;font-weight:600">${esc(i.titulo)}</h1>
        <p class="meta">${[i.autor, i.ano].filter(Boolean).map(esc).join(' · ')}</p>
        ${estrelasHTML(i.estrelas) || '<p class="meta">Sem nota</p>'}
        <p class="tags"><span class="tag on">${esc(STATUS[i.formato][i.status])}</span>${(i.generos || []).map((g) => `<span class="tag">${esc(g)}</span>`).join('')}</p>
        ${p !== null ? `<p class="progresso"><span class="barra"><i style="width:${p}%"></i></span> ${unidade(i)} ${i.paginaAtual} de ${i.paginas} · ${p}%</p>` : ''}
        <div class="acoes-form">${btn('progresso', ic('bookmark') + 'Onde parei', `data-id="${i.id}"`, 'btn-2 btn-p')}${btn('anotar', ic('page-edit') + 'Anotar', `data-id="${i.id}"`, 'btn-2 btn-p')}</div>
        ${i.resumo ? `<p class="meta" style="margin-top:10px">${esc(i.resumo)}</p>` : ''}
        ${i.comentario ? `<p class="porque">${esc(i.comentario)}</p>` : ''}</div></div>`;
    else if (i.tipo === 'desejo') {
      const h = i.historicoPreco || [];
      topo = `<div class="desejo-linha">${fotoProduto(i, 'g')}
        <div class="midia-dados"><p class="fonte">${ic('shop')}${esc(i.loja || dominio(i.url))}</p>
          <h1 style="font-size:24px;font-weight:600">${esc(tituloItem(i))}</h1>
          ${estrelasHTML(i.estrelas, i.avaliacoes ? '(' + i.avaliacoes + ' avaliações)' : '')}
          <p>${precoHTML(i)}</p>
          <div class="acoes-form"><a class="btn btn-1" href="${esc(i.url)}" target="_blank" rel="noopener">Ver na loja ${ic('open-new-window')}</a>${btn('comprei', i.comprado ? 'Desmarcar comprado' : 'Comprei', `data-id="${i.id}"`, 'btn-2')}</div>
          <p class="meta">${i.capturaEm ? 'Capturado em ' + fmtDataHora(i.capturaEm) : 'Ainda não capturado'}${(i.faltando || []).length ? ' · faltou: ' + esc(i.faltando.join(', ')) : ''}</p>
          ${h.length > 1 ? `<div class="mini-lista" style="margin-top:8px">${h.slice().reverse().map((x) => `<p class="mini-item"><span>${brl(x.preco, i.moeda)}</span><span class="meta">${fmtDataHora(x.em)}</span></p>`).join('')}</div>` : ''}</div></div>`;
    } else topo = corpoPost(i);
    const anot = (i.anotacoes || []).slice().sort((a, b) => (b.pagina || 0) - (a.pagina || 0));
    main.innerHTML = `<p>${btnTxt('voltar', 'nav-arrow-left', 'Voltar')}</p>
      <section class="post"><header class="post-cab"><span class="selo">${ic(icoTipo(i))}${nomeTipo(i)}</span>
        ${(i.colecoes || []).map((c) => `<span>em ${esc((colecao(c.id) || {}).nome || '')}</span>`).join('')}
        <time>${ehImportado(i) ? 'importado em ' + fmtDataHora(i.importadoEm) : 'guardado em ' + fmtDataHora(i.criadoEm)}${i.editadoEm ? ' · editado' : ''}</time></header>
        ${topo}${acoesPost(i)}</section>
      ${anot.length || i.tipo === 'midia' || i.tipo === 'artigo' ? cartao(ic('quote') + `Anotações (${anot.length})`,
        anot.length ? `<div class="mini-lista">${anot.map((a) => `<div class="anotacao ${a.citacao ? 'citacao' : ''}">
          <div class="cab">${a.pagina ? esc(unidade(i)) + ' ' + a.pagina : 'sem página'}<span class="espaco"></span>${fmtDataHora(a.em)}
            ${btnIco('anot-excluir', 'trash', 'Excluir anotação', `data-id="${i.id}" data-anot="${a.id}"`)}</div><p>${esc(a.texto)}</p></div>`).join('')}</div>`
          : '<p class="nada">Nenhuma anotação ainda.</p>', btn('anotar', ic('plus') + 'Anotar', `data-id="${i.id}"`, 'btn-2 btn-p')) : ''}
      ${cartao(ic('chat-bubble') + `Comentários (${(i.comentarios || []).length})`, `
        ${(i.comentarios || []).length ? `<div class="comentarios">${i.comentarios.map((c) => `<div class="comentario">${avatarHTML('p')}<div class="balao">${esc(c.texto)}<time>${fmtDataHora(c.em)}</time></div></div>`).join('')}</div>` : '<p class="nada">Nenhum comentário ainda.</p>'}
        <form class="comentar" data-form="comentar" data-id="${i.id}" style="margin-top:12px">${avatarHTML('p')}
          <input name="texto" required placeholder="O que aconteceu depois?" autocomplete="off"><button class="btn-1 btn-p" type="submit">Enviar</button></form>`)}
      ${(i.notasFonte || []).some((n) => n.original && (n.original.customTitle || n.original.customDescription)) ? cartao(ic('import') + 'Veio dos arquivos importados',
        `<div class="mini-lista">${i.notasFonte.filter((n) => n.original && (n.original.customTitle || n.original.customDescription)).map((n) => `<p class="mini-item"><span>${esc(n.fonte)}${n.grupo ? ' › ' + esc(n.grupo) : ''}: ${esc(n.original.customTitle || '')} ${esc(n.original.customDescription || '')}</span></p>`).join('')}</div>`) : ''}`;
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
    const secoes = SECOES.filter((s) => cv[s].length || (UI.cvAdd === s)).map((s) => {
      const cfg = SEC[s];
      const linhas = cv[s].map((it) => (ed && ed.sec === s && ed.id === it.id) ? `<div class="cv-item">${formCV(s, it)}</div>` : `<div class="cv-item">${ic(s === 'experiencias' ? 'suitcase' : s === 'formacao' ? 'graduation-cap' : s === 'cursos' ? 'page-star' : s === 'idiomas' ? 'text' : 'hashtag')}
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

  /* ---------------- janelas de PDF ---------------- */
  let pdfLib = null;
  async function carregarPdfLib() {
    if (pdfLib) return pdfLib;
    const base = document.baseURI.split('#')[0];
    pdfLib = await import(new URL('assets/vendor/pdf.min.mjs', base).href);
    pdfLib.GlobalWorkerOptions.workerSrc = new URL('assets/vendor/pdf.worker.min.mjs', base).href;
    return pdfLib;
  }
  function abrirJanela(it) {
    if (UI.janelas.some((j) => j.itemId === it.id)) { foco(UI.janelas.find((j) => j.itemId === it.id).id); return; }
    const n = UI.janelas.length;
    UI.janelas.push({ id: uid('jan'), itemId: it.id, titulo: tituloItem(it), url: it.url,
      x: 90 + n * 34, y: 70 + n * 28, w: Math.min(880, innerWidth - 140), h: Math.min(660, innerHeight - 130), estado: 'carregando', paginas: 0 });
    renderJanelas();
    desenharPdf(UI.janelas[UI.janelas.length - 1]);
  }
  const foco = (id) => { const el = document.getElementById(id); if (el) { el.style.zIndex = 50 + (++foco.z || 1); el.focus(); } };
  function renderJanelas() {
    const c = document.getElementById('janelas');
    const abertas = new Set(UI.janelas.map((j) => j.id));
    [...c.children].forEach((el) => { if (!abertas.has(el.id)) el.remove(); });
    UI.janelas.forEach((j) => {
      let el = document.getElementById(j.id);
      if (!el) {
        el = document.createElement('section');
        el.id = j.id; el.className = 'janela'; el.tabIndex = -1;
        el.innerHTML = `<header class="janela-barra" data-move="${j.id}">${ic('page')}<strong>${esc(j.titulo)}</strong>
            ${btnIco('janela-anotar', 'quote', 'Anotar sobre este documento', `data-j="${j.id}"`)}
            <a class="ico-btn" href="${esc(j.url)}" target="_blank" rel="noopener" title="Abrir em nova guia" aria-label="Abrir em nova guia">${ic('open-new-window')}</a>
            ${btnIco('janela-fechar', 'xmark', 'Fechar', `data-j="${j.id}"`)}</header>
          <div class="janela-corpo" data-corpo="${j.id}"><p class="meta">Carregando…</p></div>
          <footer class="janela-pe"><span data-pe="${j.id}">—</span><span class="espaco" style="flex:1"></span>
            <span class="meta">Selecione um trecho para guardar como anotação</span></footer>
          <span class="redimensiona" data-resize="${j.id}">${ic('expand')}</span>`;
        c.appendChild(el);
      }
      el.style.cssText += `;left:${j.x}px;top:${j.y}px;width:${j.w}px;height:${j.h}px`;
    });
  }
  async function desenharPdf(j) {
    const corpo = document.querySelector(`[data-corpo="${j.id}"]`);
    const pe = document.querySelector(`[data-pe="${j.id}"]`);
    try {
      const lib = await carregarPdfLib();
      const doc = await lib.getDocument({ url: 'api/pdf?url=' + encodeURIComponent(j.url) }).promise;
      j.paginas = doc.numPages;
      corpo.innerHTML = '';
      if (pe) pe.textContent = doc.numPages + ' página(s)';
      for (let n = 1; n <= doc.numPages; n++) {
        const pg = await doc.getPage(n);
        const escala = Math.min(1.6, (j.w - 60) / pg.getViewport({ scale: 1 }).width);
        const vp = pg.getViewport({ scale: escala });
        const div = document.createElement('div');
        div.className = 'pdf-pagina'; div.dataset.pagina = n;
        div.style.width = vp.width + 'px'; div.style.height = vp.height + 'px';
        const cv = document.createElement('canvas');
        cv.width = Math.floor(vp.width * (devicePixelRatio || 1)); cv.height = Math.floor(vp.height * (devicePixelRatio || 1));
        cv.style.width = vp.width + 'px'; cv.style.height = vp.height + 'px';
        const camada = document.createElement('div');
        camada.className = 'camada-texto'; camada.dataset.pagina = n; camada.dataset.item = j.itemId;
        div.append(cv, camada); corpo.appendChild(div);
        await pg.render({ canvasContext: cv.getContext('2d'), viewport: vp, transform: devicePixelRatio > 1 ? [devicePixelRatio, 0, 0, devicePixelRatio, 0, 0] : null }).promise;
        try { await new lib.TextLayer({ textContentSource: await pg.getTextContent(), container: camada, viewport: vp }).render(); } catch (e) { /* sem camada de texto */ }
      }
    } catch (e) {
      corpo.innerHTML = `<div class="cartao" style="max-width:420px"><p>Não consegui abrir este PDF aqui dentro.</p>
        <p class="meta" style="margin-top:8px">${esc(String(e && e.message || e))}</p>
        <p style="margin-top:14px"><a class="btn btn-1" href="${esc(j.url)}" target="_blank" rel="noopener">Abrir em nova guia</a></p></div>`;
    }
  }

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
      if (j.imagem) i.imagem = j.imagem;
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
    salvar(); render();
  }

  /* ---------------- tema ---------------- */
  function mistura(hex, alvo, p) {
    const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const m = (c, a) => Math.round(c + (a - c) * p);
    return `rgb(${m(r, alvo)} ${m(g, alvo)} ${m(b, alvo)})`;
  }
  const preferenciaEscura = () => window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
  const modoAtual = () => {
    const m = UI.modoPrevia || (S.perfil.modo || 'sistema');
    return m === 'sistema' ? (preferenciaEscura() ? 'escuro' : 'claro') : m;
  };
  const claroDemais = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return (0.2126 * ((n >> 16) / 255) + 0.7152 * (((n >> 8) & 255) / 255) + 0.0722 * ((n & 255) / 255)) > 0.55;
  };
  function aplicarTema() {
    const p = S.perfil, cor = UI.corPrevia || p.corCustom;
    const raiz = document.documentElement;
    const escuro = modoAtual() === 'escuro';
    raiz.dataset.tema = UI.temaPrevia || p.tema;
    raiz.dataset.modo = escuro ? 'escuro' : 'claro';
    if (/^#[0-9a-f]{6}$/i.test(cor || '')) {
      raiz.style.setProperty('--marca', cor);
      raiz.style.setProperty('--marca-escura', mistura(cor, escuro ? 255 : 0, .18));
      raiz.style.setProperty('--marca-leve', mistura(cor, escuro ? 0 : 255, escuro ? .78 : .88));
      raiz.style.setProperty('--marca-texto', claroDemais(cor) ? '#101319' : '#fff');
    } else { ['--marca', '--marca-escura', '--marca-leve', '--marca-texto'].forEach((k) => raiz.style.removeProperty(k)); }
  }

  /* ---------------- roteamento ---------------- */
  const ROTAS = { inicio: renderInicio, mural: renderMural, biblioteca: renderBiblioteca, estudos: renderEstudos, links: renderLinks,
    wishlist: renderWishlist, gastos: renderGastos, lembretes: renderLembretes, curriculo: renderCurriculo, perfil: renderPerfil, config: renderConfig };
  function rotaAtual() { return location.hash.replace(/^#\/?/, '').split('/'); }
  function render(focar) {
    if (!UI.pularColheita) colherRascunhos();
    UI.pularColheita = false;
    const [r, id] = rotaAtual();
    const rota = r === 'item' ? 'item' : (ROTAS[r] ? r : 'inicio');
    aplicarTema();
    renderTopo(); renderNav(rota); renderDireita(rota);
    if (rota === 'item') renderFicha(id); else ROTAS[rota]();
    if (rota === 'wishlist' && !UI.conferindo) setTimeout(conferirPrecos, 400);
    restaurarRascunhos();
    renderModal(); renderJanelas();
    { const ms = document.getElementById('menu-selecao'); if (ms && !String(getSelection() || '').trim()) ms.hidden = true; }
    if (buscaTopo.value !== UI.busca && document.activeElement !== buscaTopo) buscaTopo.value = UI.busca;
    if (focar) main.focus({ preventScroll: true });
  }
  window.addEventListener('hashchange', () => {
    colherRascunhos();
    UI.cvEdit = null; UI.cvAdd = null; UI.adiando = null; UI.comentando = null; UI.erroCV = ''; UI.temaPrevia = null; UI.corPrevia = null;
    if (rotaAtual()[0] !== 'inicio' && !UI.buscando) UI.busca = '';
    UI.buscando = false;
    layout.classList.remove('nav-aberta');
    UI.pularColheita = true;
    render(true); window.scrollTo(0, 0);
  });

  /* ---------------- ações ---------------- */
  function excluirItem(i) {
    const lembs = S.lembretes.filter((l) => l.itemId === i.id && !l.concluido).length;
    if (!confirm(`Excluir “${tituloItem(i)}”?\n\nSai do feed, da busca e das coleções.` + (lembs ? `\n${lembs} lembrete(s) viram avulsos.` : ''))) return;
    S.itens = S.itens.filter((x) => x.id !== i.id);
    S.lembretes.forEach((l) => { if (l.itemId === i.id) l.itemId = null; });
    salvar(); toast('Excluído.');
    if (rotaAtual()[0] === 'item') location.hash = '#/' + ({ nota: 'mural', midia: 'biblioteca', desejo: 'wishlist', gasto: 'gastos', link: 'links', artigo: 'estudos' }[i.tipo] || 'inicio');
    else render();
  }
  function reordenarNotas(origem, destino) {
    const lista = doTipo('nota').slice().sort((a, b) => (b.fixado ? 1 : 0) - (a.fixado ? 1 : 0) || (a.ordem ?? 0) - (b.ordem ?? 0) || b.criadoEm.localeCompare(a.criadoEm));
    const de = lista.findIndex((x) => x.id === origem), para = lista.findIndex((x) => x.id === destino);
    if (de < 0 || para < 0 || de === para) return;
    lista.splice(para, 0, lista.splice(de, 1)[0]);
    lista.forEach((x, k) => (x.ordem = k));
    salvar(); render();
  }

  document.addEventListener('click', (e) => {
    document.querySelectorAll('details.menu[open]').forEach((d) => { if (!d.contains(e.target)) d.removeAttribute('open'); });
    const sel = document.getElementById('menu-selecao');
    if (sel && !sel.hidden && !sel.contains(e.target)) sel.hidden = true;
    const b = e.target.closest('[data-act]');
    if (!b || b.matches('select, input')) return;
    const act = b.dataset.act, id = b.dataset.id, i = id && item(id);
    const fecharMenu = () => { const d = b.closest('details.menu'); if (d) d.removeAttribute('open'); };
    const passa = () => { salvar(); render(); };
    if (b.tagName === 'A' && ['criar', 'abrir-pasta', 'abrir-artigo', 'nova-colecao', 'col-ir'].includes(act)) e.preventDefault();
    switch (act) {
      case 'criar': return abrirModal({ tipo: 'criar', t: b.dataset.t });
      case 'trocar-tipo': return abrirModal({ tipo: 'tipo' });
      case 'modal-fechar': e.preventDefault(); return fecharModal();
      case 'descartar-rascunho': {
        if (!confirm('Descartar o que você digitou?')) return;
        limparRascunho(b.dataset.k); UI.pularColheita = true; UI.modal = null; return render();
      }
      case 'add-campo': { const k = b.dataset.k; (UI.extras[k] = UI.extras[k] || []).push(b.dataset.campo); return render(); }
      case 'form-formato': {
        colherRascunhos();
        const k = UI.modal.tipo === 'editar' ? 'editar:' + UI.modal.id : 'criar:midia';
        RASC[k] = Object.assign(RASC[k] || {}, { formato: b.dataset.v }); salvarRasc();
        UI.pularColheita = true; return render();
      }
      case 'img-remover': { UI.imagens[b.dataset.k] = ''; return render(); }
      case 'estrelas-limpar': { const f = b.closest('.campo'); f.querySelectorAll('input').forEach((x) => (x.checked = false)); return; }
      case 'fav': i.favorito = !i.favorito; return passa();
      case 'lido': i.lido = !i.lido; if (i.lido) i.lerDepois = false; return passa();
      case 'ler-depois': i.lerDepois = !i.lerDepois; if (i.lerDepois) i.lido = false; return passa();
      case 'fixar': i.fixado = !i.fixado; return passa();
      case 'cor': fecharMenu(); i.cor = CORES_NOTA[(CORES_NOTA.indexOf(corNota(i)) + 1) % CORES_NOTA.length]; return passa();
      case 'mover': { fecharMenu(); const l = doTipo('nota'); i.ordem = Math.min(...l.map((x) => x.ordem ?? 0)) - 1; return passa(); }
      case 'comprei': {
        fecharMenu(); i.comprado = !i.comprado;
        if (i.comprado) {
          i.compradoEm = agora();
          if (i.preco != null && confirm(`Marcado como comprado.\n\nRegistrar um gasto de ${brl(i.preco, i.moeda)} hoje?`))
            S.itens.push({ id: uid('gasto'), tipo: 'gasto', valor: i.preco, dataGasto: hoje(), descricao: tituloItem(i), categoria: 'Compras', colecoes: [], comentarios: [], favorito: false, criadoEm: agora(), origemId: i.id });
        } else delete i.compradoEm;
        return passa();
      }
      case 'recapturar': fecharMenu(); return capturar(i);
      case 'recapturar-todos': {
        if (!UI.servidor) return toast('A captura precisa do servidor ligado.');
        const ds = doTipo('desejo').filter((x) => !x.comprado);
        toast('Atualizando ' + ds.length + ' produto(s)…');
        (async () => { for (const d of ds) await capturar(d, true); toast('Preços atualizados.', 'check-circle-solid'); })();
        return;
      }
      case 'comentar': fecharMenu(); UI.comentando = UI.comentando === id ? null : id; render();
        { const c = document.querySelector(`[data-form="comentar"][data-id="${id}"] input`); if (c) c.focus(); } return;
      case 'editar-item': fecharMenu(); return abrirModal({ tipo: 'editar', id });
      case 'excluir-item': fecharMenu(); return excluirItem(i);
      case 'abrir-fora': fecharMenu(); window.open(i.url, '_blank', 'noopener'); return;
      case 'copiar-link': fecharMenu(); navigator.clipboard && navigator.clipboard.writeText(i.url).then(() => toast('Endereço copiado.', 'copy'), () => toast('Não consegui copiar.')); return;
      case 'organizar-em': {
        fecharMenu();
        const nomes = S.colecoes.map((c, k) => `${k + 1}. ${c.nome}`).join('\n');
        const r = prompt(`Mover “${tituloItem(i)}” para qual coleção?\n\n${nomes}\n0. Sem coleção`, '1');
        if (r === null) return;
        const n = parseInt(r, 10);
        i.colecoes = (n >= 1 && S.colecoes[n - 1]) ? [{ id: S.colecoes[n - 1].id, grupo: '' }] : [];
        i.organizar = !i.colecoes.length;
        return passa();
      }
      case 'progresso': fecharMenu(); return abrirModal({ tipo: 'progresso', id });
      case 'anotar': fecharMenu(); return abrirModal({ tipo: 'anotar', id });
      case 'anot-excluir': {
        const it = item(id);
        it.anotacoes = it.anotacoes.filter((a) => a.id !== b.dataset.anot);
        return passa();
      }
      case 'lembrar-item': fecharMenu(); return abrirModal({ tipo: 'criar', t: 'lembrete', itemId: id });
      case 'voltar': return history.back();
      case 'feed-dia': UI.feedModo = 'dia'; UI.dia = hoje(); return render();
      case 'feed-todos': UI.feedModo = 'todos'; return render();
      case 'busca-limpar': UI.busca = ''; buscaTopo.value = ''; return render();
      case 'dia': UI.dia = somaDias(UI.dia, +b.dataset.n); return render();
      case 'dia-hoje': UI.dia = hoje(); return render();
      case 'humor-dia': return (location.hash = '#/perfil');
      case 'mural-col': return;
      case 'bib-formato': UI.bibFormato = b.dataset.v; return render();
      case 'bib-agrupar': UI.bibAgrupar = b.dataset.v; return render();
      case 'abrir-pasta': UI.pastaAberta = id; return render();
      case 'pasta-voltar': UI.pastaAberta = null; return render();
      case 'nova-pasta': return abrirModal({ tipo: 'pasta' });
      case 'editar-pasta': fecharMenu(); return abrirModal({ tipo: 'pasta', id });
      case 'excluir-pasta': {
        fecharMenu();
        const n = doTipo('artigo').filter((a) => a.pastaId === id).length;
        if (!confirm(`Excluir a pasta “${pasta(id).nome}”?\n\n${n} artigo(s) ficam sem pasta, mas continuam guardados.`)) return;
        S.pastas = S.pastas.filter((p) => p.id !== id);
        S.itens.forEach((a) => { if (a.pastaId === id) a.pastaId = ''; });
        UI.pastaAberta = null; return passa();
      }
      case 'abrir-artigo': {
        e.preventDefault();
        if (i.ehPdf && UI.servidor) return abrirJanela(i);
        window.open(i.url, '_blank', 'noopener');
        if (i.ehPdf) toast('Sem o servidor, o PDF abre em nova guia.');
        return;
      }
      case 'janela-fechar': UI.janelas = UI.janelas.filter((j) => j.id !== b.dataset.j); return renderJanelas();
      case 'janela-anotar': { const j = UI.janelas.find((x) => x.id === b.dataset.j); return abrirModal({ tipo: 'anotar', id: j.itemId }); }
      case 'anot-selecao': {
        const s = document.getElementById('menu-selecao');
        s.hidden = true;
        return abrirModal({ tipo: 'anotar', id: s.dataset.item, texto: s.dataset.texto, pagina: s.dataset.pagina, citacao: true });
      }
      case 'col-ir': UI.colSel = b.dataset.col; UI.colFiltro = 'todos';
        if (rotaAtual()[0] === 'links') { layout.classList.remove('nav-aberta'); return render(); } return;
      case 'col-filtro': UI.colFiltro = b.dataset.v; return render();
      case 'nova-colecao': return abrirModal({ tipo: 'colecao' });
      case 'editar-colecao': fecharMenu(); return abrirModal({ tipo: 'colecao', id });
      case 'excluir-colecao': {
        fecharMenu();
        const c = colecao(id), n = S.itens.filter((x) => x.colecoes.some((y) => y.id === id)).length;
        if (!confirm(`Excluir a coleção “${c.nome}”?\n\nOs ${n} item(ns) continuam guardados; só o agrupamento é desfeito.`)) return;
        S.colecoes = S.colecoes.filter((x) => x.id !== id);
        S.itens.forEach((x) => (x.colecoes = x.colecoes.filter((y) => y.id !== id)));
        Object.keys(S.destinoPadrao).forEach((k) => { if (S.destinoPadrao[k] === id) S.destinoPadrao[k] = ''; });
        if (UI.colSel === id) UI.colSel = 'todas';
        if (UI.muralCol === id) UI.muralCol = 'todas';
        return passa();
      }
      case 'wl-filtro': UI.wlFiltro = b.dataset.v; return render();
      case 'lemb-concluir': { const l = lembrete(id); l.concluido = true; l.concluidoEm = agora(); toast('Lembrete concluído.', 'check-circle-solid'); return passa(); }
      case 'lemb-reabrir': { const l = lembrete(id); l.concluido = false; return passa(); }
      case 'lemb-adiar': { const l = lembrete(id); return abrirModal({ tipo: 'editar', id: l.id }); }
      case 'excluir-lembrete': { fecharMenu(); const l = lembrete(id); if (!confirm(`Excluir o lembrete “${l.texto}”?`)) return; S.lembretes = S.lembretes.filter((x) => x.id !== id); return passa(); }
      case 'modo': {
        S.perfil.modo = b.dataset.v; UI.modoPrevia = null;
        salvar(); aplicarTema(); renderTopo();
        const d = document.querySelector('.menu-perfil'); if (d) d.setAttribute('open', '');
        return;
      }
      case 'sair': fecharMenu(); return sair();
      case 'foto-google': fecharMenu(); S.perfil.foto = conta().foto; return passa();
      case 'foto-trocar': fecharMenu(); return document.getElementById('arquivo-foto').click();
      case 'foto-remover': fecharMenu(); S.perfil.foto = null; return passa();
      case 'humor-emoji': {
        const f = b.closest('form');
        const atual = f.querySelector('[name=humorEmoji]');
        atual.value = atual.value === b.dataset.v ? '' : b.dataset.v;
        f.querySelectorAll('[data-act=humor-emoji]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.v === atual.value)));
        return;
      }
      case 'humor-apagar': delete S.perfil.humores[b.dataset.d]; return passa();
      case 'tema': UI.temaPrevia = b.dataset.v; UI.corPrevia = ''; return render();
      case 'cor-limpar': UI.corPrevia = ''; S.perfil.corCustom = ''; return passa();
      case 'perfil-cancelar': UI.temaPrevia = null; UI.corPrevia = null; return (location.hash = '#/inicio');
      case 'sync-agora': UI.nuvem.erro = ''; if (!nuvemLigada()) UI.nuvem.estado = 'ligada'; agendarSync(0); toast('Enviando…', 'refresh'); return;
      case 'ligar-sync': {
        const alvo = document.getElementById('botao-google-config');
        if (!alvo) return;
        alvo.innerHTML = '<p class="meta">Carregando o botão do Google…</p>';
        carregarScript('https://accounts.google.com/gsi/client').then(() => {
          google.accounts.id.initialize({ client_id: CLIENTE_GOOGLE, callback: aoEntrar, cancel_on_tap_outside: false });
          alvo.innerHTML = '';
          google.accounts.id.renderButton(alvo, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', locale: 'pt-BR' });
        }).catch(() => { alvo.innerHTML = `<p class="erro">Não consegui carregar o login do Google.</p>`; });
        return;
      }
      case 'backup-exportar': baixar('meu-espaco-backup-' + hoje() + '.json', Object.assign({ tipoArquivo: 'meu-espaco-backup' }, S)); return toast('Backup exportado.', 'download');
      case 'backup-importar': return document.getElementById('arquivo-backup').click();
      case 'resetar':
        if (!confirm('Apagar tudo deste navegador e recarregar os dados de exemplo?\n\nExporte um backup antes.')) return;
        try { localStorage.removeItem(CHAVE); localStorage.removeItem(CHAVE_RASC); } catch (er) { /* ignora */ }
        location.hash = '#/inicio'; return location.reload();
      case 'cv-importar': UI.erroCV = ''; return document.getElementById('arquivo-cv').click();
      case 'cv-exportar': return exportarCV();
      case 'cv-previa': UI.previa = !UI.previa; return render();
      case 'cv-adicionar': UI.cvAdd = b.dataset.sec || document.getElementById('cv-add').value; UI.cvEdit = null; return render();
      case 'cv-editar': fecharMenu(); UI.cvEdit = { sec: b.dataset.sec, id }; UI.cvAdd = null; return render();
      case 'cv-cancelar': UI.cvEdit = null; UI.cvAdd = null; return render();
      case 'cv-excluir': {
        fecharMenu();
        const s = b.dataset.sec, it = S.curriculo[s].find((x) => x.id === id);
        if (!confirm(`Excluir “${SEC[s].titulo(it)}”?`)) return;
        S.curriculo[s] = S.curriculo[s].filter((x) => x.id !== id); return passa();
      }
      case 'pl-confirmar': S.curriculo = aplicarImportacao(UI.plano); UI.plano = null; salvar(); toast('Importação concluída.', 'check-circle-solid'); return render();
      case 'pl-cancelar': UI.plano = null; toast('Importação cancelada. Nada mudou.'); return render();
    }
  });

  document.addEventListener('change', (e) => {
    const t = e.target, act = t.dataset && t.dataset.act;
    if (t.id === 'arquivo-foto') return escolherFoto(t);
    if (t.id === 'arquivo-cv') return escolherCV(t);
    if (t.id === 'arquivo-backup') return escolherBackup(t);
    if (!act) return;
    if (act === 'img-escolher') {
      const f = t.files[0]; t.value = '';
      if (!f) return;
      const k = t.dataset.k, fmt = t.dataset.formato;
      return redimensionar(f, fmt === 'capa' ? 300 : 440, fmt === 'capa' ? 450 : 440)
        .then((u) => { UI.imagens[k] = u; render(); }).catch(() => toast('Não consegui abrir essa imagem.'));
    }
    if (act === 'destino' && t.value === '__nova') { t.value = ''; return abrirModal({ tipo: 'colecao', voltar: UI.modal }); }
    if (act === 'dia-sel' && t.value) { UI.dia = t.value; return render(); }
    if (act === 'mural-col') { UI.muralCol = t.value; return render(); }
    if (act === 'col-select') { UI.colSel = t.value; return render(); }
    if (act === 'col-tipo') { UI.colTipo = t.value; return render(); }
    if (act === 'wl-ordem') { UI.wlOrdem = t.value; return render(); }
    if (act === 'gasto-mes' && t.value) { UI.gastoMes = t.value; return render(); }
    if (act === 'cv-add-sec') { UI.cvAddSec = t.value; return; }
    if (act === 'cor-custom') { UI.corPrevia = t.value; UI.temaPrevia = null; return aplicarTema(); }
    if (act === 'pl-escolha') {
      if (t.dataset.sec === 'perfil') UI.plano.perfil.escolha = t.value;
      else UI.plano.secoes[t.dataset.sec][+t.dataset.idx].escolha = t.value;
    }
  });

  document.addEventListener('input', (e) => {
    const t = e.target, act = t.dataset && t.dataset.act;
    if (t === buscaTopo) {
      UI.busca = t.value;
      if ((rotaAtual()[0] || 'inicio') !== 'inicio') { UI.buscando = true; return (location.hash = '#/inicio'); }
      const f = document.querySelector('.feed'); if (f) f.innerHTML = conteudoFeed();
      return;
    }
    if (act === 'col-busca' || act === 'bib-busca') {
      const pos = t.selectionStart;
      if (act === 'col-busca') UI.colBusca = t.value; else UI.bibBusca = t.value;
      UI.pularColheita = true; render();
      const n = document.querySelector(`[data-act="${act}"]`);
      if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (er) { /* ignora */ } }
    }
  });
  document.getElementById('form-busca').addEventListener('submit', (e) => e.preventDefault());
  modal.addEventListener('cancel', (e) => { e.preventDefault(); fecharModal(); });
  modal.addEventListener('click', (e) => { if (e.target === modal) fecharModal(); });

  /* ---------------- envio de formulários ---------------- */
  document.addEventListener('submit', (e) => {
    const f = e.target, tipo = f.dataset.form;
    if (!tipo) return;
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f).entries());
    const t = agora();
    const ok = (msg, icone) => { salvar(); UI.pularColheita = true; if (msg) toast(msg, icone); };

    if (tipo === 'criar' || tipo === 'editar') {
      const alvo = f.dataset.t, id = f.dataset.id;
      const k = tipo === 'editar' ? 'editar:' + id : 'criar:' + alvo;
      const img = UI.imagens[k];
      if (alvo === 'lembrete') {
        if (!d.texto.trim() || !d.data) return toast('Informe o texto e a data.');
        if (tipo === 'editar') { const l = lembrete(id); Object.assign(l, { texto: d.texto.trim(), data: d.data, hora: d.hora || '' }); }
        else S.lembretes.push({ id: uid('lemb'), texto: d.texto.trim(), data: d.data, hora: d.hora || '', itemId: (UI.modal && UI.modal.itemId) || null, concluido: false, criadoEm: t });
        limparRascunho(k); UI.modal = null; ok('Lembrete guardado.', 'alarm'); return render();
      }
      let i = tipo === 'editar' ? item(id) : null;
      const novo = !i;
      if (novo) i = { id: uid(alvo.slice(0, 3)), tipo: alvo, colecoes: [], comentarios: [], favorito: false, criadoEm: t };
      if (alvo === 'nota') {
        if (!d.texto || !d.texto.trim()) return toast('Escreva o texto da nota.');
        if (novo && ehURL(d.texto) && !d.titulo) return toast('Isso parece um endereço. Guarde como Link para ter a prévia.');
        Object.assign(i, { titulo: (d.titulo || '').trim(), texto: d.texto.trim(), cor: d.cor || i.cor });
        if (d.destino !== undefined) { i.colecoes = d.destino ? [{ id: d.destino, grupo: '' }] : []; i.organizar = !d.destino; if (novo) S.destinoPadrao.nota = d.destino; }
        if (novo) i.ordem = Math.min(0, ...doTipo('nota').map((x) => x.ordem ?? 0)) - 1;
      } else if (alvo === 'link' || alvo === 'desejo' || alvo === 'artigo') {
        let url = (d.url || '').trim();
        if (!url) return toast('Cole o endereço.');
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        try { new URL(url); } catch (er) { return toast('Esse endereço não parece válido.'); }
        if (novo) {
          const ja = S.itens.find((x) => x.tipo === alvo && x.url === url);
          if (ja) { limparRascunho(k); UI.modal = null; UI.pularColheita = true; render(); toast('Isso já está guardado.'); location.hash = '#/item/' + ja.id; return; }
        }
        i.url = url;
        if (d.titulo !== undefined && d.titulo.trim()) { i.titulo = d.titulo.trim(); i.tituloManual = true; }
        if (d.descricao !== undefined) i.descricao = d.descricao.trim();
        if (d.comentario !== undefined) i.comentario = d.comentario.trim();
        if (alvo === 'link') {
          i.lerDepois = !!d.lerDepois; i.favicon = i.favicon || '';
          if (d.destino !== undefined) { i.colecoes = d.destino ? [{ id: d.destino, grupo: '' }] : []; i.organizar = !d.destino; if (novo) S.destinoPadrao.link = d.destino; }
          if (novo) i.titulo = i.titulo || url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 70);
        }
        if (alvo === 'artigo') {
          i.pastaId = d.pastaId === '__nova' ? '' : d.pastaId; i.ehPdf = ehPdf(url); i.anotacoes = i.anotacoes || [];
          if (novo) i.titulo = i.titulo || url.split('/').pop().replace(/\.pdf.*$/i, '').replace(/[-_]+/g, ' ').slice(0, 80) || dominio(url);
        }
        if (alvo === 'desejo') {
          i.moeda = i.moeda || 'BRL'; i.historicoPreco = i.historicoPreco || []; i.comprado = i.comprado || false;
          if (!novo) {
            const p = d.preco === '' || d.preco === undefined ? null : parseFloat(d.preco);
            if (p !== i.preco) { i.preco = p; if (p != null) i.historicoPreco.push({ em: t, preco: p, manual: true }); }
            if (d.loja !== undefined) i.loja = d.loja.trim();
            if (d.imagem !== undefined) i.imagem = d.imagem.trim();
          } else i.preco = null;
        }
      } else if (alvo === 'midia') {
        if (!d.titulo.trim()) return toast('Informe o nome.');
        Object.assign(i, { formato: d.formato === 'filme' ? 'filme' : 'livro', titulo: d.titulo.trim(), autor: (d.autor || '').trim(),
          status: d.status || 'quero', ano: d.ano ? +d.ano : '', generos: (d.generos || '').split(',').map((g) => g.trim()).filter(Boolean),
          estrelas: d.estrelas ? +d.estrelas : (i.estrelas ?? null), resumo: (d.resumo || '').trim(), comentario: (d.comentario || '').trim(),
          paginaAtual: d.paginaAtual ? +d.paginaAtual : i.paginaAtual, paginas: d.paginas ? +d.paginas : i.paginas });
        i.anotacoes = i.anotacoes || [];
        if (img !== undefined) { if (img) i.capa = img; else delete i.capa; }
      } else if (alvo === 'gasto') {
        const v = parseFloat(String(d.valor).replace(',', '.'));
        if (!(v > 0)) return toast('Informe um valor maior que zero.');
        if (!d.descricao.trim()) return toast('Informe a descrição.');
        Object.assign(i, { valor: Math.round(v * 100) / 100, dataGasto: d.dataGasto || hoje(), descricao: d.descricao.trim(), categoria: (d.categoria || '').trim() });
      }
      if (!novo) i.editadoEm = t;
      if (novo) S.itens.push(i);
      if (!salvar() && i.capa) { delete i.capa; salvar(); toast('Salvei sem a capa: o armazenamento está cheio.'); }
      limparRascunho(k); UI.modal = null; UI.pularColheita = true;
      if (novo && (alvo === 'link' || alvo === 'desejo' || alvo === 'artigo')) { render(); return capturar(i); }
      render();
      return toast(novo ? 'Guardado.' : 'Alterações salvas.', 'check-circle-solid');
    }

    if (tipo === 'colecao' || tipo === 'pasta') {
      const nome = (d.nome || '').trim();
      if (!nome) return toast('Dê um nome.');
      const lista = tipo === 'pasta' ? S.pastas : S.colecoes;
      const k = tipo + ':' + (f.dataset.id || 'novo');
      let alvo = f.dataset.id ? lista.find((x) => x.id === f.dataset.id) : null;
      if (!alvo && lista.some((c) => norm(c.nome) === norm(nome))) return toast('Já existe com esse nome.');
      if (!alvo) { alvo = { id: uid(tipo === 'pasta' ? 'pst' : 'col'), nome, descricao: '' }; lista.push(alvo); }
      alvo.nome = nome; alvo.descricao = (d.descricao || '').trim();
      if (tipo === 'pasta' && UI.imagens[k] !== undefined) { if (UI.imagens[k]) alvo.capa = UI.imagens[k]; else delete alvo.capa; }
      limparRascunho(k);
      const voltar = UI.modal && UI.modal.voltar;
      UI.modal = voltar || null;
      ok(tipo === 'pasta' ? 'Pasta salva.' : 'Coleção salva.', 'check-circle-solid');
      render();
      if (voltar) { const s = document.getElementById('f-destino'); if (s) s.value = alvo.id; }
      return;
    }
    if (tipo === 'anotar') {
      const it = item(f.dataset.id);
      if (!d.texto.trim()) return;
      it.anotacoes = it.anotacoes || [];
      it.anotacoes.push({ id: uid('an'), texto: d.texto.trim(), pagina: d.pagina ? +d.pagina : null, citacao: !!d.citacao, em: t });
      UI.modal = null; ok('Anotação guardada.', 'quote'); return render();
    }
    if (tipo === 'progresso') {
      const it = item(f.dataset.id);
      it.paginaAtual = d.paginaAtual ? +d.paginaAtual : null;
      it.paginas = d.paginas ? +d.paginas : it.paginas;
      if (d.concluir) it.status = 'concluido';
      else if (it.paginaAtual && it.status === 'quero') it.status = 'andamento';
      UI.modal = null; ok('Progresso salvo.', 'bookmark'); return render();
    }
    if (tipo === 'comentar') {
      const it = item(f.dataset.id);
      if (!d.texto.trim()) return;
      it.comentarios.push({ id: uid('com'), texto: d.texto.trim(), em: t });
      UI.comentando = it.id; ok(); render();
      { const c = document.querySelector(`[data-form="comentar"][data-id="${it.id}"] input`); if (c) c.focus(); }
      return;
    }
    if (tipo === 'perfil') {
      const p = S.perfil;
      p.nome = d.nome.trim() || p.nome;
      p.bio = d.bio.trim();
      if ((d.humorEmoji || '').trim() || (d.humorTexto || '').trim()) p.humores[hoje()] = { emoji: d.humorEmoji || '', texto: (d.humorTexto || '').trim() };
      else delete p.humores[hoje()];
      if (UI.corPrevia) { p.corCustom = UI.corPrevia; }
      else if (UI.corPrevia === '') p.corCustom = '';
      if (UI.temaPrevia) { p.tema = UI.temaPrevia; p.corCustom = ''; }
      UI.temaPrevia = null; UI.corPrevia = null;
      ok('Perfil salvo.', 'check-circle-solid'); return (location.hash = '#/inicio');
    }
    if (tipo === 'cv-perfil') {
      const p = S.curriculo.perfil = S.curriculo.perfil || {};
      PERFIL_CAMPOS.forEach(([k]) => { const v = (d[k] || '').trim(); if (v) p[k] = v; else delete p[k]; });
      const c = Object.assign({}, p.contato || {});
      Object.keys(d).filter((k) => k.startsWith('contato.')).forEach((k) => { const ck = k.slice(8), v = d[k].trim(); if (v) c[ck] = v; else delete c[ck]; });
      if (Object.keys(c).length) p.contato = c; else delete p.contato;
      UI.cvEdit = null; ok('Apresentação salva.'); return render();
    }
    if (tipo === 'cv-item') {
      const s = f.dataset.sec, cfg = SEC[s], idAtual = f.dataset.id;
      const base = idAtual ? clone(S.curriculo[s].find((x) => x.id === idAtual)) : {};
      for (const [k, n, tp] of cfg.campos) {
        const raw = (d[k] ?? '').trim();
        if (tp === 'linhas') { const arr = raw.split('\n').map((x) => x.trim()).filter(Boolean); if (arr.length) base[k] = arr; else delete base[k]; continue; }
        if (tp === 'num') { if (!raw) { delete base[k]; continue; } if (!/^\d{4}$/.test(raw)) return toast(`“${n}” precisa ter 4 dígitos.`); base[k] = +raw; continue; }
        if (k === 'fim' && s === 'experiencias') {
          if (raw) { base.fim = raw; if (base.em_andamento) base.em_andamento = false; }
          else if (idAtual) { if (base.fim !== undefined && base.fim !== null) base.fim = null; }
          else if (d.inicio && d.inicio.trim()) base.fim = null;
          continue;
        }
        if (raw) base[k] = raw; else delete base[k];
      }
      if (idAtual) S.curriculo[s][S.curriculo[s].findIndex((x) => x.id === idAtual)] = base;
      else { base.id = proximoId(S.curriculo[s], cfg.prefixo); S.curriculo[s].push(base); }
      UI.cvEdit = null; UI.cvAdd = null; ok('Currículo atualizado.'); return render();
    }
  });

  /* ---------------- arquivos ---------------- */
  function escolherFoto(t) {
    const f = t.files[0]; t.value = '';
    if (!f) return;
    redimensionar(f, 320, 320).then((u) => { S.perfil.foto = u; salvar(); toast('Foto atualizada.'); render(); })
      .catch(() => toast('Não consegui abrir essa imagem.'));
  }
  function escolherBackup(t) {
    const f = t.files[0]; t.value = '';
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      let raw;
      try { raw = JSON.parse(r.result); } catch (er) { return toast('Esse arquivo não é um JSON válido.'); }
      if (!raw || !Array.isArray(raw.itens) || !raw.perfil || !Array.isArray(raw.colecoes)) return toast('Esse arquivo não é um backup do Meu Espaço.');
      if (!confirm(`Substituir os dados deste navegador pelo backup “${f.name}” (${raw.itens.length} registros)?`)) return;
      delete raw.tipoArquivo; S = migrar(raw); salvar(); toast('Backup importado.', 'check-circle-solid');
      UI.pularColheita = true; location.hash = '#/inicio'; render();
    };
    r.readAsText(f);
  }
  function escolherCV(t) {
    const f = t.files[0]; t.value = '';
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      let raw;
      try { raw = JSON.parse(r.result); }
      catch (er) { UI.erroCV = 'O arquivo “' + esc(f.name) + '” não é um JSON válido. Nada mudou.'; return render(); }
      const res = adaptarCV(raw);
      if (res.erro) { UI.erroCV = esc(res.erro) + ' Nada mudou.'; return render(); }
      UI.plano = planejarImportacao(S.curriculo, res.cv); UI.plano.arquivo = f.name; UI.erroCV = '';
      UI.pularColheita = true; render(true);
    };
    r.readAsText(f);
  }

  /* ---------------- arrastar: notas e janelas ---------------- */
  let arrastando = null;
  document.addEventListener('dragstart', (e) => {
    const n = e.target.closest('[data-arrasta]');
    if (!n) return;
    arrastando = n.dataset.id; n.classList.add('arrastando');
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', arrastando); } catch (er) { /* ignora */ }
  });
  document.addEventListener('dragend', () => { document.querySelectorAll('.arrastando, .alvo-solta').forEach((x) => x.classList.remove('arrastando', 'alvo-solta')); arrastando = null; });
  document.addEventListener('dragover', (e) => {
    const n = e.target.closest && e.target.closest('[data-arrasta]');
    if (!arrastando || !n) return;
    e.preventDefault();
    document.querySelectorAll('.alvo-solta').forEach((x) => x.classList.remove('alvo-solta'));
    if (n.dataset.id !== arrastando) n.classList.add('alvo-solta');
  });
  document.addEventListener('drop', (e) => {
    const n = e.target.closest && e.target.closest('[data-arrasta]');
    if (!arrastando || !n) return;
    e.preventDefault();
    const de = arrastando; arrastando = null;
    if (n.dataset.id !== de) reordenarNotas(de, n.dataset.id);
  });

  let movendo = null;
  document.addEventListener('mousedown', (e) => {
    const barra = e.target.closest('[data-move]'), canto = e.target.closest('[data-resize]');
    if (e.target.closest('.ico-btn, a')) return;
    if (barra) { const j = UI.janelas.find((x) => x.id === barra.dataset.move); movendo = { j, modo: 'mover', x: e.clientX - j.x, y: e.clientY - j.y }; foco(j.id); e.preventDefault(); }
    else if (canto) { const j = UI.janelas.find((x) => x.id === canto.dataset.resize); movendo = { j, modo: 'tamanho', x: e.clientX - j.w, y: e.clientY - j.h }; e.preventDefault(); }
  });
  document.addEventListener('mousemove', (e) => {
    if (!movendo) return;
    const { j, modo } = movendo;
    if (modo === 'mover') { j.x = Math.max(0, Math.min(innerWidth - 120, e.clientX - movendo.x)); j.y = Math.max(0, Math.min(innerHeight - 60, e.clientY - movendo.y)); }
    else { j.w = Math.max(320, e.clientX - movendo.x); j.h = Math.max(240, e.clientY - movendo.y); }
    const el = document.getElementById(j.id);
    if (el) el.style.cssText += `;left:${j.x}px;top:${j.y}px;width:${j.w}px;height:${j.h}px`;
  });
  document.addEventListener('mouseup', () => { movendo = null; });

  /* seleção de texto no PDF -> anotação */
  function mostrarMenuSelecao(e) {
    const camada = e.target.closest && e.target.closest('.camada-texto');
    const menu = document.getElementById('menu-selecao');
    if (!camada) return;
    const s = getSelection();
    const texto = s ? String(s).trim() : '';
    if (!texto) { menu.hidden = true; return; }
    e.preventDefault();
    menu.dataset.texto = texto; menu.dataset.item = camada.dataset.item; menu.dataset.pagina = camada.dataset.pagina;
    menu.hidden = false;
    menu.style.left = Math.min(innerWidth - 230, e.clientX) + 'px';
    menu.style.top = Math.max(8, e.clientY - 52) + 'px';
  }
  document.addEventListener('contextmenu', mostrarMenuSelecao);
  document.addEventListener('mouseup', (e) => { if (e.target.closest && e.target.closest('.camada-texto')) setTimeout(() => mostrarMenuSelecao(e), 0); });

  document.getElementById('btn-menu').addEventListener('click', (e) => {
    const aberto = layout.classList.toggle('nav-aberta');
    e.currentTarget.setAttribute('aria-expanded', String(aberto));
  });
  addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); buscaTopo.focus(); buscaTopo.select(); }
  });
  addEventListener('beforeunload', colherRascunhos);
  if (window.matchMedia) {
    const consulta = matchMedia('(prefers-color-scheme: dark)');
    const aoTrocar = () => { if ((S.perfil.modo || 'sistema') === 'sistema') { aplicarTema(); renderTopo(); } };
    consulta.addEventListener ? consulta.addEventListener('change', aoTrocar) : consulta.addListener(aoTrocar);
  }
  setInterval(() => { if ((rotaAtual()[0] || 'inicio') === 'inicio' && !UI.modal) { const f = document.querySelector('.faixa-lembrete'); const novo = faixaLembrete(); if (!f && novo) render(); } }, 60000);

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
        <span class="marca-selo grande">${ic('archive')}</span>
        <h1>Meu Espaço</h1>
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
    if (!confirm('Sair da conta? Os registros continuam guardados neste navegador.')) return;
    try { await fetch('api/sessao', { method: 'DELETE' }); } catch (e) { /* ignora */ }
    try { if (window.google && google.accounts) google.accounts.id.disableAutoSelect(); } catch (e) { /* ignora */ }
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
    destinoPadrao: S.destinoPadrao, curriculo: S.curriculo, versao: S.versao, atualizadoEm: S.baseEm || '' });

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
      ['perfil', 'colecoes', 'pastas', 'destinoPadrao', 'curriculo'].forEach((k) => { if (r.base[k] !== undefined) S[k] = r.base[k]; });
      S.baseEm = r.base.atualizadoEm; mudou = true;
    }
    [['itens', r.itens], ['lembretes', r.lembretes]].forEach(([nome, remotos]) => {
      remotos.forEach((rem) => {
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
      ['perfil', 'colecoes', 'pastas', 'destinoPadrao', 'curriculo'].forEach((k) => { if (d.base[k] !== undefined) S[k] = d.base[k]; });
      S.baseEm = d.base.atualizadoEm; ULTIMO.base = canon(baseNuvem()); mudou = true;
    }
    [['itens', d.itens, d.apagarItens], ['lembretes', d.lembretes, d.apagarLembretes]].forEach(([nome, novos, fora]) => {
      (novos || []).forEach((rem) => {
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
      UI.nuvem.estado = 'ligada'; UI.nuvem.em = agora(); UI.nuvem.erro = '';
      UI.pularColheita = true; render();
      agendarSync(300);
      if (primeira) toast('Sincronização ligada.', 'check-circle-solid');
    } catch (e) {
      UI.nuvem.estado = 'erro'; UI.nuvem.erro = String(e.message || e);
      pintarNuvem();
    }
  }

  /* ---------------- início ---------------- */
  (async function iniciar() {
    S = carregar(CHAVE);
    RASC = carregar(CHAVE_RASC) || {};
    if (!S) { S = await criarInicial(); salvar(); } else migrar(S);
    S.itens.forEach((i) => { if (i.capturaStatus === 'capturando') i.capturaStatus = 'pendente'; });
    if (location.protocol !== 'file:') {
      try { const r = await fetch('api/status', { cache: 'no-store' }); UI.servidor = r.ok && (await r.json()).ok === true; } catch (e) { UI.servidor = false; }
    }
    UI.sessao = await lerSessao();
    if (!location.hash) history.replaceState(null, '', '#/inicio');
    UI.pularColheita = true;

    // A sessão do Firebase vale por si: se o cookie do site se perdeu, ela mantém você dentro.
    let doFirebase = null;
    const temNuvem = window.Nuvem && Nuvem.configurado() && UI.sessao.modo !== 'local';
    if (temNuvem) {
      try {
        doFirebase = await Nuvem.iniciar((novo) => { if (!novo) { UI.nuvem.estado = 'desligada'; pintarNuvem(); } });
      } catch (e) { UI.nuvem.estado = 'erro'; UI.nuvem.erro = String(e.message || e); }
    }
    if (UI.sessao.modo === 'deslogado' && doFirebase) {
      UI.sessao = { modo: 'logado', restrito: UI.sessao.restrito, viaFirebase: true,
        usuario: { nome: doFirebase.nome || doFirebase.email, email: doFirebase.email, foto: doFirebase.foto || '' } };
    }
    if (UI.sessao.modo === 'deslogado') { renderEntrada(); return; }
    render();
    if (temNuvem) {
      if (doFirebase) await ligarNuvem();
      else if (UI.nuvem.estado !== 'erro') { UI.nuvem.estado = 'desligada'; pintarNuvem(); }
      else pintarNuvem();
    }
    window.__meuEspaco = { get estado() { return S; }, get ui() { return UI; } };
  })();
})();
