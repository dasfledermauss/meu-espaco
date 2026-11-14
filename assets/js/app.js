/* Meu Espaço — v3. Uma única fonte de dados (S) alimenta todas as telas.
   Ícones: Iconoir (assets/js/icones.js). Variante "-solid" = estado ativo. */
(function () {
  'use strict';

  const CHAVE = 'meuEspaco.v1';
  const CHAVE_RASC = 'meuEspaco.rascunhos';
  const CHAVE_NOVID = 'meuEspaco.novidades';
  const CHAVE_ONB = 'meuEspaco.onboarding';
  const FOTO_PADRAO = 'assets/img/foto-perfil.jpg';
  const main = document.getElementById('conteudo');
  const navLateral = document.getElementById('nav-lateral');
  const direita = document.getElementById('direita');
  const layout = document.getElementById('layout');
  const topoPerfil = document.getElementById('topo-perfil');
  const topoMusica = document.getElementById('topo-musica');
  const caixaTrabalho = document.getElementById('trabalho');
  const caixaAtalho = document.getElementById('atalho-add');
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
  const fmtNum = (s) => deDia(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });  // 12/11
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

  /** Reduz sem cortar: o lado maior fica em `max` px. JPEG com fundo claro, para PNG transparente não virar preto. */
  function reduzir(file, max = 1200) {
    return new Promise((ok, falha) => {
      const img = new Image();
      img.onload = () => {
        const f = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * f)), h = Math.max(1, Math.round(img.height * f));
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(img.src); ok({ src: c.toDataURL('image/jpeg', 0.82) });
      };
      img.onerror = () => falha(new Error('imagem'));
      img.src = URL.createObjectURL(file);
    });
  }
  /** Porta única de entrada de imagem: arquivo, imagem colada ou link. Devolve { src, link?, soEndereco? }.
      Formatos: 'capa' (300×450), 'quadrada' (440×440) e 'livre' (proporção original). */
  async function carregarImagem(fonte, formato) {
    const preparar = (blob) => formato === 'capa' ? redimensionar(blob, 300, 450).then((src) => ({ src }))
      : formato === 'banner' ? redimensionar(blob, 480, 300).then((src) => ({ src }))
      : formato === 'quadrada' ? redimensionar(blob, 440, 440).then((src) => ({ src }))
        : reduzir(blob, 1200);
    if (typeof fonte !== 'string') return preparar(fonte);
    const url = fonte.trim();
    if (/^data:image\//i.test(url)) return preparar(await (await fetch(url)).blob());
    try {
      const r = await fetch(url, { mode: 'cors' });
      if (!r.ok) throw new Error('http');
      const b = await r.blob();
      if (!/^image\//.test(b.type)) throw new Error('tipo');
      const res = await preparar(b); res.link = url; return res;
    } catch (e) { /* o site não libera a cópia: guarda só o endereço, se for mesmo uma imagem */ }
    await new Promise((ok, no) => { const im = new Image(); im.referrerPolicy = 'no-referrer'; im.onload = ok; im.onerror = () => no(new Error('imagem')); im.src = url; });
    return { src: url, link: url, soEndereco: true };
  }
  const EXT_IMAGEM = /\.(png|jpe?g|gif|webp|avif|bmp|svg)(\?|#|$)/i;
  const arquivoDeImagem = (dt) => {
    const f = [...(dt.files || [])].find((x) => /^image\//.test(x.type));
    if (f) return f;
    const it = [...(dt.items || [])].find((x) => x.kind === 'file' && /^image\//.test(x.type));
    return it ? it.getAsFile() : null;
  };
  /** Endereço de imagem vindo da área de transferência: <img src> do HTML copiado, ou o texto, se for um link. */
  function linkDeImagem(dt) {
    const html = dt.getData('text/html');
    const m = html && html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (m) return m[1].replace(/&amp;/g, '&');
    const t = ((dt.getData('text/uri-list') || dt.getData('text/plain') || '').trim().split(/\s+/)[0]) || '';
    return /^https?:\/\//i.test(t) ? t : '';
  }

  /* ---------------- estado ---------------- */
  let S = null;
  const UI = { busca: '', feedModo: 'todos', dia: hoje(), colSel: 'todas', colFiltro: 'todos', colTipo: 'todos', colBusca: '',
    editando: null, comentando: null, cvEdit: null, cvAdd: null, plano: null, previa: false, adiando: null, lembEdit: null,
    gastoMes: hoje().slice(0, 7), bibFormato: 'todos', bibAgrupar: 'status', bibBusca: '', bibVer: null,
    grupoImagem: '', origens: {}, wlFiltro: 'desejos', wlOrdem: 'recentes', muralCol: 'todas', pastaAberta: null, extras: {}, imagens: {}, servidor: false, janelas: [], sessao: { modo: 'local' }, nuvem: { estado: 'local', em: '', erro: '' } };
  let RASC = {};

  function aplicarSons() {
    if (!(window.SONS && typeof S !== 'undefined' && S && S.perfil)) return;
    SONS.config(S.perfil.somUI !== false, S.perfil.somVolume == null ? 40 : S.perfil.somVolume);
    if (S.perfil.ambiente && !aplicarSons.ambiente) { aplicarSons.ambiente = true; SONS.ambiente.definir(S.perfil.ambiente.niveis, S.perfil.ambiente.geral); }
  }
  function salvar() {
    aplicarSons();
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
      // Rascunho só vale para post novo. Numa edição, o que vale é o que está salvo:
      // guardar aqui fazia a janela reabrir com um texto abandonado no lugar do verdadeiro.
      if (f.dataset.form === 'editar') { if (RASC[k]) { delete RASC[k]; salvarRasc(); } return; }
      let tem = false;
      f.querySelectorAll('input, textarea, select').forEach((el) => {
        if (el.type === 'file' || el.disabled || !el.name) return;
        // Campos ocultos de escolha (modo da nota, formato da mídia): guardar quando saem do padrão.
        // Sem isso, abrir um campo opcional fazia a escolha voltar atrás.
        if (el.type === 'hidden') { if (el.dataset.padrao === undefined) return; d[el.name] = el.value; if (el.value !== el.dataset.padrao) tem = true; return; }
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
    if (st.destinoPadrao.tarefa === undefined) st.destinoPadrao.tarefa = '';
    if (st.destinoPadrao.imagem === undefined) st.destinoPadrao.imagem = '';
    st.gruposMusica = st.gruposMusica || [];
    st.gruposImagem = st.gruposImagem || [];
    // Quem já tinha registros não precisa da listinha de começo.
    if (st.perfil.passosFim === undefined) st.perfil.passosFim = (st.itens || []).length > 0;
    (st.itens || []).forEach((i, k) => { if (i.tipo === 'musica' && i.ordem === undefined) i.ordem = k; });
    st.eventos = st.eventos || []; st.stickers = st.stickers || {};
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
    { let mexeu = false; Object.keys(RASC || {}).forEach((k) => { if (k.startsWith('editar:')) { delete RASC[k]; mexeu = true; } }); if (mexeu) salvarRasc(); }
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
  const evento = (id) => (S.eventos || []).find((e) => e.id === id);
  const TIPOS = { nota: ['Nota', 'journal-page'], tarefa: ['Tarefa', 'list'], imagem: ['Imagem', 'media-image'], musica: ['Música', 'ytmusic'], link: ['Link', 'link'], midia: ['Livro', 'book'], artigo: ['Artigo', 'page'], desejo: ['Desejo', 'shopping-bag'], gasto: ['Gasto', 'wallet'] };
  /* Tarefa: uma linha só. A situação guarda as três colunas do quadro; "feito" é o mesmo que concluída. */
  const ETAPAS = { afazer: 'A fazer', fazendo: 'Fazendo', feito: 'Feito' };
  const etapa = (i) => i.concluida ? 'feito' : (i.etapa === 'fazendo' ? 'fazendo' : 'afazer');
  const tarefas = () => doTipo('tarefa');
  const tarefasAbertas = () => tarefas().filter((i) => !i.concluida);
  const atrasada = (i) => !i.concluida && i.prazo && i.prazo < hoje();
  const nomeTipo = (i) => i.tipo === 'midia' ? (i.formato === 'filme' ? 'Filme' : 'Livro') : TIPOS[i.tipo][0];
  const icoTipo = (i) => i.tipo === 'midia' ? (i.formato === 'filme' ? 'movie' : 'book') : TIPOS[i.tipo][1];
  const STATUS = { livro: { quero: 'Quero ler', andamento: 'Lendo', concluido: 'Lido' }, filme: { quero: 'Quero assistir', andamento: 'Assistindo', concluido: 'Assistido' } };
  const STATUS_GRUPO = { andamento: 'Lendo e assistindo agora', quero: 'Na fila', concluido: 'Concluídos' };
  const CORES_NOTA = ['amarelo', 'rosa', 'azul', 'verde', 'laranja'];
  const corNota = (i) => i.cor || CORES_NOTA[hashNum(i.id) % CORES_NOTA.length];
  const ehImportado = (i) => !!i.importadoEm && i.importadoEm === i.criadoEm;
  const unidade = (i) => i.formato === 'filme' ? 'minuto' : 'página';
  const tituloItem = (i) => i.titulo || (i.tipo === 'imagem' ? 'Imagem' : i.tipo === 'gasto' ? (i.descricao || 'Gasto')
    : i.tipo === 'desejo' ? 'Produto em ' + (dominio(i.url) || 'loja')
      : i.tipo === 'artigo' ? (dominio(i.url) || 'Artigo')
        : (i.texto || '').split('\n')[0].slice(0, 90) || 'Nota sem título');
  function textoBusca(i) {
    return norm([i.titulo, i.nota, i.origem, i.url, i.texto, i.comentario, i.descricao, i.categoria, i.autor, i.resumo, i.loja, (i.generos || []).join(' '),
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
  /* O que ainda falta de verdade (a lista guardada na captura pode estar velha: o dado pode ter sido corrigido depois). */
  const faltouAgora = (i) => (i.faltando || []).filter((k) => {
    const v = k === 'nome' ? i.titulo : k === 'foto' ? i.imagem : k === 'preço' ? i.preco : undefined;
    return v === undefined || v === null || v === '';
  });
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
  /** Campo de imagem usado em todo o sistema: escolher arquivo, arrastar, colar (Ctrl + V) ou usar um link. */
  function envioImagem(k, rot, formato, atual) {
    const prev = UI.imagens[k] !== undefined ? UI.imagens[k] : atual;
    const cls = formato === 'banner' ? 'previa-banner' : formato === 'capa' ? 'previa-capa' : formato === 'livre' ? 'previa-livre' : 'previa-quadrada';
    return `<div class="campo"><span class="rotulo">${rot}</span><div class="envio" data-envio="${esc(k)}" data-formato="${formato}">
      ${prev ? `<div class="envio-previa ${cls}"><img src="${esc(prev)}" alt="Prévia" referrerpolicy="no-referrer"><button type="button" class="ico-btn remover" data-act="img-remover" data-k="${esc(k)}" aria-label="Remover imagem" title="Remover">${ic('xmark')}</button></div>` : ''}
      <div class="envio-lado">
        <label class="envio-alvo">${ic('media-image')}<span>${prev ? 'Trocar imagem' : 'Escolher, arrastar ou colar'}</span><small>Ctrl + V cola uma imagem copiada</small>
          <input type="file" accept="image/*" hidden data-act="img-escolher" data-k="${esc(k)}" data-formato="${formato}"></label>
        <div class="envio-link"><input type="url" data-act="img-link" data-k="${esc(k)}" data-formato="${formato}" placeholder="ou cole o link de uma imagem" autocomplete="off" inputmode="url" aria-label="Link da imagem">
          <button type="button" class="btn-f btn-p" data-act="img-link-ok">Usar</button></div>
      </div>
    </div></div>`;
  }
  /** Carrega a imagem (arquivo, colada ou link) para o campo `k` e redesenha o formulário. */
  function definirImagem(k, formato, fonte) {
    toast('Carregando a imagem…', 'media-image');
    return carregarImagem(fonte, formato).then((r) => {
      UI.imagens[k] = r.src;
      if (r.link) UI.origens[k] = r.link; else delete UI.origens[k];
      render();
      toast(r.soEndereco ? 'Guardei só o endereço da imagem: o site não deixa copiar o arquivo.' : 'Imagem pronta.', 'check-circle-solid');
    }).catch(() => toast('Não consegui abrir essa imagem.'));
  }
  /** Guarda direto como imagem nova, sem abrir janela: usado ao colar ou soltar fora de um formulário. */
  function guardarImagemRapido(fonte) {
    toast('Guardando a imagem…', 'media-image');
    return carregarImagem(fonte, 'livre').then((r) => {
      const rota = rotaAtual();
      const cols = rota[0] === 'colecao' && rota[1] && rota[1] !== 'soltos' && colecao(rota[1]) ? [{ id: rota[1], grupo: '' }] : [];
      const grupo = rota[0] === 'imagens' && grupoImagem(UI.grupoImagem) ? UI.grupoImagem : '';
      const i = { id: uid('ima'), tipo: 'imagem', src: r.src, origem: r.link || '', titulo: '', nota: '', grupo, colecoes: cols, organizar: !cols.length,
        comentarios: [], favorito: false, criadoEm: agora() };
      S.itens.push(i);
      if (!salvar()) { S.itens.pop(); return; }
      UI.pularColheita = true; render();
      toast(r.soEndereco ? 'Imagem guardada pelo endereço (o site não deixa copiar).' : 'Imagem guardada.', 'check-circle-solid');
    }).catch(() => toast('Não consegui abrir essa imagem.'));
  }

  /** Ctrl+V de um endereço nas páginas Links e Wishlist: cria o card direto e busca a prévia. */
  function guardarLinkRapido(texto, tipo) {
    let url = texto.trim(); if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    try { new URL(url); } catch (e) { return toast('Esse endereço não parece válido.'); }
    const ja = S.itens.find((x) => x.tipo === tipo && x.url === url);
    if (ja) { toast('Isso já está guardado.'); return; }
    const t = agora(), col = tipo === 'link' && UI.colSel && UI.colSel !== 'todas' && UI.colSel !== 'soltos' && colecao(UI.colSel) ? [{ id: UI.colSel, grupo: '' }] : [];
    const i = { id: uid(tipo.slice(0, 3)), tipo, url, colecoes: col, comentarios: [], favorito: false, criadoEm: t };
    if (tipo === 'link') Object.assign(i, { lerDepois: false, favicon: '', organizar: !col.length, titulo: url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 70) });
    else Object.assign(i, { moeda: 'BRL', historicoPreco: [], comprado: false, preco: null });
    S.itens.push(i);
    if (!salvar()) { S.itens.pop(); return; }
    UI.pularColheita = true; render(); if (window.SONS) SONS.tocar('guardar'); toast('Link guardado.', 'check-circle-solid');
    return capturar(i, true);
  }

  /* ---------------- formulários de criação e edição ---------------- */
  const TIPOS_CRIAR = [['nota', 'Nota', 'journal-page'], ['tarefa', 'Tarefa', 'list'], ['imagem', 'Imagem', 'media-image'], ['link', 'Link', 'link'], ['midia', 'Livro ou filme', 'book'],
    ['artigo', 'Artigo de estudo', 'page'], ['musica', 'Música', 'ytmusic'], ['desejo', 'Desejo', 'shopping-bag'], ['gasto', 'Gasto', 'wallet'], ['lembrete', 'Lembrete', 'alarm']];
  const tituloCriar = { nota: 'Nova nota', tarefa: 'Nova tarefa', imagem: 'Guardar imagem', link: 'Guardar link', midia: 'Novo na biblioteca', artigo: 'Novo artigo', musica: 'Guardar música', desejo: 'Novo desejo', gasto: 'Novo gasto', lembrete: 'Novo lembrete' };

  /** Coleção do post: vira campo fixo quando a pessoa clicou em "Guardar aqui" dentro de uma coleção. */
  function campoDestino(c, tipo, it, v) {
    const sel = (UI.colPadrao != null && !it) ? UI.colPadrao : (it ? ((v.colecoes || [])[0] || {}).id : (S.destinoPadrao[tipo] || ''));
    const html = campo('f-destino', 'Coleção', `<select id="f-destino" name="destino" data-act="destino">${opcoesDestino(sel)}</select>`);
    if (UI.colPadrao != null && !it) c.fixo(html); else c.opc('destino', 'Coleção', html);
  }
  function formulario(t, it) {
    const k = it ? 'editar:' + it.id : 'criar:' + t;
    const v = it || (UI.modal && UI.modal.valores) || {};
    const c = construtor(k, v);
    if (t === 'nota') {
      const md = (RASC[k] && RASC[k].modo) || v.modo || 'texto';
      c.fixo(`<div class="segmento" role="group" aria-label="Formato da nota">
          <button type="button" data-act="form-modo" data-v="texto" aria-pressed="${md === 'texto'}">${ic('journal-page')} Texto</button>
          <button type="button" data-act="form-modo" data-v="lista" aria-pressed="${md === 'lista'}">${ic('check-circle')} Lista</button></div>
        <input type="hidden" name="modo" value="${md}" data-padrao="texto">`);
      if (md === 'lista') {
        c.fixo(campo('f-texto', 'Itens', area('f-texto', 'texto', textoDaLista(v), 'class="alto" required placeholder="Um item por linha — cole uma lista pronta se quiser"'))
          + `<p class="dica">${ic('priority-high')}<span>Cada linha vira um item para marcar. Marcadores como “-”, “•” e “1.” são removidos.</span></p>`);
      } else c.fixo(campo('f-texto', 'Texto', area('f-texto', 'texto', v.texto, 'class="alto" required placeholder="Escreva o que aprendeu, pensou ou quer lembrar…"')));
      c.opc('titulo', 'Título', campo('f-titulo', 'Título', txt('f-titulo', 'titulo', v.titulo)));
      campoDestino(c, 'nota', it, v);
      c.opc('cor', 'Cor do papel', campo('f-cor', 'Cor do papel', selectHTML('f-cor', 'cor', CORES_NOTA.map((x) => [x, x[0].toUpperCase() + x.slice(1)]), v.cor || corNota(v.id ? v : { id: 'x' }))));
    } else if (t === 'tarefa') {
      c.fixo(campo('f-titulo', 'O que precisa ser feito', area('f-titulo', 'titulo', v.titulo, 'class="uma-linha" rows="1" required placeholder="ex.: mandar a proposta da paróquia"'))
        + (it ? '' : `<p class="dica" id="dica-colar">${ic('priority-high')}<span>Colou uma lista? Cada linha vira uma tarefa.</span></p>`));
      c.opc('descricao', 'Descrição', campo('f-desc', 'Descrição', area('f-desc', 'descricao', v.descricao, 'placeholder="Detalhes, contexto, o que precisa estar pronto…"')));
      c.opc('prazo', 'Prazo', campo('f-prazo', 'Prazo <span class="opcional">(opcional)</span>', `<input type="date" id="f-prazo" name="prazo" value="${esc(v.prazo || '')}">`, 'medio')
        + `<label class="check"><input type="checkbox" name="avisar" ${v.lembreteId || !it ? 'checked' : ''}> Criar lembrete no prazo</label>`);
      c.opc('etapa', 'Situação', campo('f-etapa', 'Situação', selectHTML('f-etapa', 'etapa', Object.entries(ETAPAS), etapa(v)), 'medio'));
      campoDestino(c, 'tarefa', it, v);
    } else if (t === 'imagem') {
      c.fixo(envioImagem(k, 'Imagem', 'livre', v.src));
      c.fixo(campo('f-titulo', 'Título <span class="opcional">(opcional)</span>', txt('f-titulo', 'titulo', v.titulo)));
      if ((S.gruposImagem || []).length) c.fixo(campo('f-grupo', 'Grupo', selectHTML('f-grupo', 'grupo', [['', 'Sem grupo'], ...S.gruposImagem.map((g) => [g.id, g.nome])],
        v.grupo || (!it && grupoImagem(UI.grupoImagem) ? UI.grupoImagem : '')), 'medio'));
      c.opc('nota', 'Anotação', campo('f-nota', 'Anotação', area('f-nota', 'nota', v.nota, 'placeholder="De onde veio, por que guardou, o que chamou a atenção…"')));
      campoDestino(c, 'imagem', it, v);
    } else if (t === 'musica') {
      c.fixo(campo('f-url', 'Link do YouTube', `<input type="url" id="f-url" name="url" value="${esc(v.url || '')}" required placeholder="Cole o link do vídeo ou da playlist" inputmode="url">`));
      if (!it) c.fixo(`<p class="dica">${ic('priority-high')}<span>Vale vídeo, playlist ou mix. A capa e o nome vêm do próprio YouTube.</span></p>`);
      c.opc('titulo', 'Nome', campo('f-titulo', 'Nome', txt('f-titulo', 'titulo', v.titulo)));
      c.opc('artista', 'Artista', campo('f-artista', 'Artista', txt('f-artista', 'artista', v.artista)));
      c.opc('grupo', 'Grupo', campo('f-grupo', 'Grupo', selectHTML('f-grupo', 'grupo', [['', 'Sem grupo'], ...(S.gruposMusica || []).map((g) => [g.id, g.nome])], v.grupo || '')));
      campoDestino(c, 'musica', it, v);
    } else if (t === 'link') {
      c.fixo(campo('f-url', 'Endereço', `<input type="url" id="f-url" name="url" value="${esc(v.url || '')}" required placeholder="https://…" inputmode="url">`));
      if (!it) c.fixo(`<p class="dica">${ic('priority-high')}<span>Título, descrição e imagem são capturados da página.${UI.servidor ? '' : ' Sem o servidor ligado, dá para preencher à mão.'}</span></p>`);
      c.opc('comentario', 'Por que guardei', campo('f-com', 'Por que estou guardando', txt('f-com', 'comentario', v.comentario, 'placeholder="ex.: quero testar essa navegação no próximo projeto"')));
      campoDestino(c, 'link', it, v);
      c.opc('titulo', 'Título', campo('f-titulo', 'Título', txt('f-titulo', 'titulo', v.titulo)));
      c.opc('descricao', 'Descrição', campo('f-desc', 'Descrição', area('f-desc', 'descricao', v.descricao)));
      c.opc('lerDepois', 'Ler mais tarde', `<label class="check"><input type="checkbox" name="lerDepois" ${v.lerDepois ? 'checked' : ''}> Ler mais tarde</label>`);
    } else if (t === 'midia') {
      const f = (RASC[k] && RASC[k].formato) || v.formato || 'livro';
      c.fixo(`<div class="segmento" role="group" aria-label="Formato">
          <button type="button" data-act="form-formato" data-v="livro" aria-pressed="${f === 'livro'}">${ic('book')} Livro</button>
          <button type="button" data-act="form-formato" data-v="filme" aria-pressed="${f === 'filme'}">${ic('movie')} Filme ou série</button></div>
        <input type="hidden" name="formato" value="${f}" data-padrao="livro">`);
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
        c.opc('imagem', 'Foto do produto', envioImagem(k, 'Foto', 'quadrada', v.imagem));
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
    if (m.tipo === 'imagem-ver') {
      const i = item(m.id);
      if (!i) return '';
      const lista = imagens(), n = lista.findIndex((x) => x.id === i.id), gr = grupoImagem(i.grupo);
      return `<div class="modal modal-imagem"><header class="modal-cab">${ic('media-image')}<h2>${esc(i.titulo || 'Imagem')}</h2>${btnIco('modal-fechar', 'xmark', 'Fechar')}</header>
        <div class="modal-corpo"><div class="img-palco">
          ${lista.length > 1 ? btnIco('imagem-nav', 'nav-arrow-left', 'Anterior', `data-v="-1"`, 'nav-img') : ''}
          <img class="img-grande" src="${esc(i.src)}" alt="${esc(i.titulo || '')}" referrerpolicy="no-referrer">
          ${lista.length > 1 ? btnIco('imagem-nav', 'nav-arrow-right', 'Próxima', `data-v="1"`, 'nav-img dir') : ''}</div>
          ${i.nota ? `<p class="porque">${esc(i.nota)}</p>` : ''}
          <p class="meta">${[gr ? 'Grupo ' + esc(gr.nome) : '', i.origem ? `<a href="${esc(i.origem)}" target="_blank" rel="noopener">${esc(dominio(i.origem))}</a>` : '', lista.length > 1 ? (n + 1) + ' de ' + lista.length : ''].filter(Boolean).join(' · ')}</p></div>
        <footer class="modal-pe">${btn('imagem-excluir', ic('trash') + 'Excluir', `data-id="${i.id}"`, 'btn-f btn-perigo')}<span class="espaco"></span>
          ${btn('imagem-grupo', ic('folder') + 'Grupo', `data-id="${i.id}"`, 'btn-f')}
          ${btn('editar-item', ic('edit-pencil') + 'Editar', `data-id="${i.id}"`, 'btn-1')}</footer></div>`;
    }
    if (m.tipo === 'grupo-imagem') {
      const g = m.id ? grupoImagem(m.id) : null;
      return `<form class="modal" method="dialog" data-form="grupo-imagem" data-id="${m.id || ''}">
        <header class="modal-cab">${ic('folder')}<h2>${g ? 'Renomear grupo' : 'Novo grupo de imagens'}</h2>${btnIco('modal-fechar', 'xmark', 'Fechar')}</header>
        <div class="modal-corpo"><div class="form">${campo('f-nome', 'Nome', txt('f-nome', 'nome', g ? g.nome : '', 'required placeholder="ex.: Referências de capa"'))}</div></div>
        <footer class="modal-pe"><span class="espaco"></span>${btn('modal-fechar', 'Cancelar', '', 'btn-f')}
          <button class="btn-1" type="submit">${ic('check')}Salvar</button></footer></form>`;
    }
    if (m.tipo === 'mover-lote') {
      const n = UI.moverUm ? 1 : (UI.sel || []).length;
      return `<form class="modal" method="dialog" data-form="mover-lote">
        <header class="modal-cab">${ic('folder')}<h2>Mover ${n} ${n === 1 ? 'item' : 'itens'}</h2>${btnIco('modal-fechar', 'xmark', 'Fechar')}</header>
        <div class="modal-corpo"><div class="form">${campo('f-colecao', 'Para a coleção', selectHTML('f-colecao', 'colecao', [['', 'Sem coleção (A organizar)'], ...S.colecoes.map((c) => [c.id, c.nome])], ''))}</div></div>
        <footer class="modal-pe"><span class="espaco"></span>${btn('modal-fechar', 'Cancelar', '', 'btn-f')}
          <button class="btn-1" type="submit">${ic('check')}Mover</button></footer></form>`;
    }
    if (m.tipo === 'imagem-grupo') {
      const i = item(m.id);
      if (!i) return '';
      const gs = S.gruposImagem || [];
      return `<form class="modal" method="dialog" data-form="imagem-grupo" data-id="${m.id}">
        <header class="modal-cab">${ic('folder')}<h2>Mover para grupo</h2>${btnIco('modal-fechar', 'xmark', 'Fechar')}</header>
        <div class="modal-corpo"><div class="form">${campo('f-grupo', 'Grupo', selectHTML('f-grupo', 'grupo', [['', 'Sem grupo'], ...gs.map((g) => [g.id, g.nome])], i.grupo || ''))}
          ${gs.length ? '' : '<p class="dica">' + ic('priority-high') + '<span>Nenhum grupo criado ainda. Use o botão Grupo na tela de Imagens.</span></p>'}</div></div>
        <footer class="modal-pe"><span class="espaco"></span>${btn('modal-fechar', 'Cancelar', '', 'btn-f')}
          <button class="btn-1" type="submit">${ic('check')}Mover</button></footer></form>`;
    }
    if (m.tipo === 'foto-perfil') {
      return `<form class="modal" method="dialog" data-form="foto-perfil">
        <header class="modal-cab">${ic('user')}<h2>Foto do perfil</h2>${btnIco('modal-fechar', 'xmark', 'Fechar')}</header>
        <div class="modal-corpo"><div class="form">${envioImagem('foto-perfil', 'Foto', 'quadrada', S.perfil.foto)}</div></div>
        <footer class="modal-pe"><span class="espaco"></span>${btn('modal-fechar', 'Cancelar', '', 'btn-f')}
          <button class="btn-1" type="submit">${ic('check')}Salvar</button></footer></form>`;
    }
    if (m.tipo === 'evento-ver') {
      const e = evento(m.id); if (!e) return '';
      const d = deDia(e.data), n = diasAte(e.data);
      const dow = d.toLocaleDateString('pt-BR', { weekday: 'long' }), mes = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
      const falta = n === 0 ? 'É hoje' : n === 1 ? 'É amanhã' : n > 1 ? 'Faltam ' + n + ' dias' : 'Já passou';
      return `<div class="modal modal-ticket" data-id="${e.id}">
        <header class="modal-cab">${ic('calendar')}<h2>Evento</h2>${btnIco('modal-fechar', 'xmark', 'Fechar')}</header>
        <div class="modal-corpo"><article class="ticket" aria-label="${esc(e.titulo)}">
          <div class="tk-topo ${e.foto ? 'com-foto' : ''}">${e.foto ? `<img src="${e.foto}" alt="">` : `<span class="tk-vazio">${ic('calendar')}</span>`}<span class="tk-selo">${n < 0 ? 'Encerrado' : 'Evento'}</span></div>
          <div class="tk-meio"><h3 class="tk-titulo">${esc(e.titulo)}</h3>${e.nota ? `<p class="tk-nota">${esc(e.nota)}</p>` : ''}</div>
          <div class="tk-corte" aria-hidden="true"><i></i><hr><i></i></div>
          <div class="tk-pe">
            <div class="tk-data"><b>${d.getDate()}</b><span>${esc(mes)}</span></div>
            <dl class="tk-info"><div><dt>Dia</dt><dd>${esc(dow)}</dd></div><div><dt>Horário</dt><dd>${e.hora ? esc(e.hora) : 'o dia todo'}</dd></div></dl>
            <span class="tk-falta">${falta}</span></div></article></div>
        <footer class="modal-pe">${btn('ev-excluir', ic('trash') + 'Excluir', `data-id="${e.id}"`, 'btn-f btn-perigo')}<span class="espaco"></span>
          ${btn('ev-editar', ic('edit-pencil') + 'Editar', `data-id="${e.id}"`, 'btn-2')}</footer></div>`;
    }
    if (m.tipo === 'evento') {
      const e = m.id ? evento(m.id) : null, v = e || { data: m.dia || hoje() };
      return `<form class="modal" method="dialog" data-form="evento" data-id="${m.id || ''}">
        <header class="modal-cab">${ic('calendar')}<h2>${e ? 'Editar evento' : 'Novo evento'}</h2>${btnIco('modal-fechar', 'xmark', 'Fechar')}</header>
        <div class="modal-corpo"><div class="form">
          ${campo('f-titulo', 'O que vai acontecer', txt('f-titulo', 'titulo', v.titulo, 'required placeholder="ex.: reunião com o cliente"'))}
          <div class="linha">${campo('f-data', 'Dia', `<input type="date" id="f-data" name="data" required value="${esc(v.data)}">`, 'medio')}
            ${campo('f-hora', 'Horário <span class="opcional">(opcional)</span>', `<input type="time" id="f-hora" name="hora" value="${esc(v.hora || '')}">`, 'curto')}</div>
          ${campo('f-nota', 'Nota <span class="opcional">(opcional)</span>', txt('f-nota', 'nota', v.nota))}
          ${envioImagem('evfoto', 'Foto <span class="opcional">(opcional, aparece no feed)</span>', 'banner', v.foto)}
          <label class="check"><input type="checkbox" name="contagem" ${v.contagem ? 'checked' : ''}> Contar os dias no Início</label></div></div>
        <footer class="modal-pe"><span class="espaco"></span>${btn('modal-fechar', 'Cancelar', '', 'btn-f')}
          <button class="btn-1" type="submit">${ic('check')}Salvar</button></footer></form>`;
    }
    if (m.tipo === 'grupo-musica') {
      const g = m.id ? grupoMusica(m.id) : null;
      return `<form class="modal" method="dialog" data-form="grupo-musica" data-id="${m.id || ''}">
        <header class="modal-cab">${ic('folder')}<h2>${g ? 'Renomear grupo' : 'Novo grupo de músicas'}</h2>${btnIco('modal-fechar', 'xmark', 'Fechar')}</header>
        <div class="modal-corpo"><div class="form">${campo('f-nome', 'Nome', txt('f-nome', 'nome', g ? g.nome : '', 'required placeholder="ex.: Para trabalhar"'))}</div></div>
        <footer class="modal-pe"><span class="espaco"></span>${btn('modal-fechar', 'Cancelar', '', 'btn-f')}
          <button class="btn-1" type="submit">${ic('check')}Salvar</button></footer></form>`;
    }
    if (m.tipo === 'musica-grupo') {
      const i = item(m.id);
      if (!i) return '';
      const gs = S.gruposMusica || [];
      return `<form class="modal" method="dialog" data-form="musica-grupo" data-id="${m.id}">
        <header class="modal-cab">${ic('folder')}<h2>Mover para grupo</h2>${btnIco('modal-fechar', 'xmark', 'Fechar')}</header>
        <div class="modal-corpo"><div class="form">${campo('f-grupo', 'Grupo',
          selectHTML('f-grupo', 'grupo', [['', 'Sem grupo'], ...gs.map((g) => [g.id, g.nome])], i.grupo || ''))}
          ${gs.length ? '' : '<p class="dica">' + ic('priority-high') + '<span>Nenhum grupo criado ainda. Use o botão Grupo no painel de músicas.</span></p>'}</div></div>
        <footer class="modal-pe"><span class="espaco"></span>${btn('modal-fechar', 'Cancelar', '', 'btn-f')}
          <button class="btn-1" type="submit">${ic('check')}Mover</button></footer></form>`;
    }
    if (m.tipo === 'tarefa-ver') {
      const i = item(m.id);
      if (!i) return '';
      const e = etapa(i), atras = atrasada(i);
      return `<div class="modal modal-tarefa"><header class="modal-cab">${ic('list')}
          <h2>Tarefa</h2>${btnIco('modal-fechar', 'xmark', 'Fechar')}</header>
        <div class="modal-corpo">
          <div class="tarefa-linha grande ${i.concluida ? 'feita' : ''}">
            <button type="button" class="tar-marca" data-act="tar-ok" data-id="${i.id}" aria-pressed="${!!i.concluida}"
              aria-label="${i.concluida ? 'Reabrir tarefa' : 'Marcar como feita'}">${ic(i.concluida ? 'check-circle-solid' : 'check-circle')}</button>
            <span class="tar-corpo"><strong class="tar-tit">${esc(i.titulo || 'Tarefa sem nome')}</strong></span></div>
          ${i.descricao ? `<p class="tar-desc-cheia">${esc(i.descricao)}</p>` : ''}
          <dl class="ficha-dados">
            <div><dt>Situação</dt><dd>${ETAPAS[e]}</dd></div>
            <div><dt>Prazo</dt><dd>${i.prazo ? (atras ? 'venceu ' : '') + fmtDiaCurto(i.prazo) : '—'}</dd></div>
            <div><dt>Coleção</dt><dd>${(i.colecoes || []).map((c) => esc((colecao(c.id) || {}).nome || '')).filter(Boolean).join(', ') || '—'}</dd></div>
          </dl>
          <section class="comentarios tar-coment"><h3 class="secao-tit">Comentários${(i.comentarios || []).length ? ' · ' + i.comentarios.length : ''}</h3>
            ${(i.comentarios || []).map((c) => `<div class="comentario">${avatarHTML('p')}<div class="balao">${esc(c.texto)}<time>${fmtDataHora(c.em)}</time></div></div>`).join('')}
            <form class="comentar" data-form="comentar" data-id="${i.id}">${avatarHTML('p')}
              <textarea name="texto" required rows="2" placeholder="Escreva um comentário…"></textarea>
              <button class="btn-1 btn-p" type="submit">Enviar</button></form></section></div>
        <footer class="modal-pe">${btn('editar-item', ic('edit-pencil') + 'Editar', `data-id="${i.id}"`, 'btn-f')}
          <span class="espaco"></span>${btn('modal-fechar', 'Fechar', '', 'btn-f')}
          <a class="btn btn-1" href="#/tarefas" data-act="modal-fechar">${ic('list')}Ver em Tarefas</a></footer></div>`;
    }
    if (m.tipo === 'item-ver') {
      const i = item(m.id);
      if (!i) return '';
      const col = (i.colecoes || []).map((c) => esc((colecao(c.id) || {}).nome || '')).filter(Boolean).join(', ');
      const p = progresso(i);
      let corpo = '';
      if (i.tipo === 'nota') corpo = `<div class="postit ${corNota(i)} lido">${i.modo === 'lista' ? listaCheckHTML(i) : `<p>${esc(i.texto || '')}</p>`}</div>`;
      else if (i.tipo === 'link' || i.tipo === 'artigo') corpo = `${i.imagem ? `<img class="ver-capa" src="${esc(i.imagem)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}
        <p class="fonte">${i.favicon ? `<img src="${esc(i.favicon)}" alt="" onerror="this.remove()">` : ic('link')}<a href="${esc(i.url)}" target="_blank" rel="noopener">${esc(dominio(i.url))}</a> ${ic('open-new-window')}</p>
        ${i.descricao ? `<p class="ver-texto">${esc(i.descricao)}</p>` : ''}${i.comentario ? `<p class="porque">${esc(i.comentario)}</p>` : ''}`;
      else if (i.tipo === 'midia') corpo = `<div class="ver-linha">${capaHTML(i)}<div>
        <p class="meta">${[i.autor, i.ano].filter(Boolean).map(esc).join(' · ')}</p>${estrelasHTML(i.estrelas)}
        <p class="tags"><span class="tag">${esc(STATUS[i.formato][i.status])}</span>${(i.generos || []).map((g) => `<span class="tag">${esc(g)}</span>`).join('')}</p>
        ${p !== null ? `<p class="progresso"><span class="barra"><i style="width:${p}%"></i></span> ${unidade(i)} ${i.paginaAtual} de ${i.paginas} · ${p}%</p>` : ''}
        <div class="acoes-form">${btn('midia-concluir', ic('check-circle') + (i.status === 'concluido' ? 'Desmarcar como ' : 'Marcar como ') + (i.formato === 'filme' ? 'assistido' : 'lido'), `data-id="${i.id}"`, i.status === 'concluido' ? 'btn-2 btn-p' : 'btn-1 btn-p')}</div></div></div>
        ${i.comentario ? `<p class="porque">${esc(i.comentario)}</p>` : ''}${(i.anotacoes || []).length ? `<p class="meta">${i.anotacoes.length} anotação${i.anotacoes.length > 1 ? 'es' : ''}</p>` : ''}`;
      else if (i.tipo === 'desejo') corpo = `<div class="ver-linha">${fotoProduto(i)}<div><p class="fonte">${ic('shop')}${esc(i.loja || dominio(i.url))}</p><p>${precoHTML(i)}</p>${estrelasHTML(i.estrelas, i.avaliacoes ? '(' + i.avaliacoes + ')' : '')}${i.comprado ? '<p class="tag">Comprado</p>' : ''}</div></div>
        ${i.comentario ? `<p class="porque">${esc(i.comentario)}</p>` : ''}`;
      else if (i.tipo === 'musica') corpo = `<div class="ver-linha"><button type="button" class="musica-capa p" data-act="tocar" data-id="${i.id}" aria-label="Tocar">${capaYT(i) ? `<img src="${esc(capaYT(i))}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : `<span class="capa-ph">${ic('playlist')}</span>`}<span class="play">${ic('play-solid')}</span></button>
        <div><p class="meta">${[i.artista, i.listaYT && !i.video ? 'playlist' : ''].filter(Boolean).map(esc).join(' · ') || 'YouTube'}</p></div></div>`;
      else if (i.tipo === 'gasto') corpo = `<p class="ver-valor">${brl(i.valor)}</p><p class="meta">${[i.categoria, 'despesa de ' + fmtDiaCurto(i.dataGasto)].filter(Boolean).map(esc).join(' · ')}</p>`;
      else corpo = `<p class="ver-texto">${esc(i.nota || i.descricao || '')}</p>`;
      const pagina = ['midia', 'desejo', 'musica', 'gasto', 'link', 'artigo'].includes(i.tipo);
      return `<div class="modal modal-ver"><header class="modal-cab">${ic(icoTipo(i))}
          <h2>${esc(i.tipo === 'gasto' ? 'Gasto' : tituloItem(i))}</h2>${btnIco('modal-fechar', 'xmark', 'Fechar')}</header>
        <div class="modal-corpo">${corpo}
          <dl class="ficha-dados"><div><dt>Tipo</dt><dd>${esc(TIPOS[i.tipo][0])}</dd></div>
            ${col ? `<div><dt>Coleção</dt><dd>${col}</dd></div>` : ''}
            <div><dt>Guardado em</dt><dd>${fmtDiaCurto(dataLocal(i.criadoEm))}</dd></div></dl></div>
        <footer class="modal-pe">${btn('editar-item', ic('edit-pencil') + 'Editar', `data-id="${i.id}"`, 'btn-f')}${btn('excluir-item', ic('trash') + 'Excluir', `data-id="${i.id}"`, 'btn-f')}
          <span class="espaco"></span>${pagina ? `<a class="btn btn-f" href="#/item/${i.id}" data-act="modal-fechar">${ic('open-new-window')}Abrir página</a>` : ''}
          ${btn('modal-fechar', 'Fechar', '', 'btn-1')}</footer></div>`;
    }
    if (m.tipo === 'instalar-ios') {
      return `<div class="modal"><header class="modal-cab">${ic('download')}<h2>Instalar no iPhone ou iPad</h2>${btnIco('modal-fechar', 'xmark', 'Fechar')}</header>
        <div class="modal-corpo"><ol class="passos-ios">
          <li><strong>Abra no Safari.</strong><span>Outros navegadores do iPhone não instalam aplicativos.</span></li>
          <li><strong>Toque em Compartilhar</strong><span>O ícone de quadrado com seta para cima, na barra do Safari.</span></li>
          <li><strong>Escolha “Adicionar à Tela de Início”</strong><span>Role a lista se não aparecer de primeira.</span></li>
          <li><strong>Toque em Adicionar</strong><span>A Tyba vira um ícone, abre em tela cheia e funciona sem internet.</span></li></ol></div>
        <footer class="modal-pe"><span class="espaco"></span><button class="btn-1" type="button" data-act="modal-fechar">Entendi</button></footer></div>`;
    }
    if (m.tipo === 'onboarding') return onboardingHTML();
    if (m.tipo === 'novidades') {
      return `<div class="modal modal-novidades"><header class="modal-cab">${ic('page-star')}
          <h2>O que há de novo</h2>${btnIco('modal-fechar', 'xmark', 'Fechar')}</header>
        <div class="modal-corpo">${novidadesHTML()}</div>
        <footer class="modal-pe"><span class="espaco"></span>
          <button class="btn-1" type="button" data-act="modal-fechar">${ic('check')}Entendi</button></footer></div>`;
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
    if (m.tipo === 'clima-local') {
      return `<form class="modal" method="dialog" data-form="clima-local">
        <header class="modal-cab">${ic('pin')}<h2>Cidade da previsão</h2>${btnIco('modal-fechar', 'xmark', 'Fechar')}</header>
        <div class="modal-corpo"><div class="form">${campo('f-cidade', 'Nome da cidade', `<input id="f-cidade" name="cidade" value="" placeholder="Ex.: Goiânia" autocomplete="off" autofocus>`)}
          <p class="meta" id="clima-msg" role="status">${UI.climaMsg ? esc(UI.climaMsg) : 'Só o nome da cidade é enviado ao serviço de previsão (Open-Meteo).'}</p>
          ${btn('clima-gps', ic('pin') + 'Usar minha localização', '', 'btn-2')}</div></div>
        <footer class="modal-pe"><span class="espaco"></span>${btn('modal-fechar', 'Cancelar', '', 'btn-f')}<button class="btn-1" type="submit">${ic('search')}Buscar</button></footer></form>`;
    }
    if (m.tipo === 'pet-nome') {
      return `<form class="modal modal-pet" method="dialog" data-form="pet-nome">
        <header class="modal-cab">${ic('heart')}<h2>Nome do cachorrinho</h2>${btnIco('modal-fechar', 'xmark', 'Fechar')}</header>
        <div class="modal-corpo"><div class="form"><p class="meta">O nome vai para a plaquinha da casinha.</p>
          ${campo('f-pet', 'Como ele se chama?', `<input id="f-pet" name="nome" maxlength="14" value="${esc(S.perfil.petNome || '')}" placeholder="Ex.: Pipoca" autocomplete="off" autofocus>`)}
        </div></div>
        <footer class="modal-pe"><span class="espaco"></span>${btn('modal-fechar', 'Cancelar', '', 'btn-f')}<button class="btn-1" type="submit">${ic('check')}Salvar</button></footer></form>`;
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
  function abrirModal(m) { colherRascunhos(); UI.modal = m; if (window.SONS) SONS.tocar('abrir'); render(); }
  function fecharModal() {
    if (UI.modal && UI.modal.tipo === 'novidades') marcarNovidadesVistas();
    if (UI.modal && UI.modal.tipo === 'onboarding') { onboardingSalvaNome(); return encerrarOnboarding(); }
    UI.colPadrao = null;
    colherRascunhos(); UI.modal = null; render();
  }
  function renderModal() {
    if (!UI.modal) { if (modal.open) modal.close(); modal.innerHTML = ''; return; }
    modal.innerHTML = conteudoModal(UI.modal);
    if (!modal.open) modal.showModal();
    restaurarRascunhos();
    const campo1 = modal.querySelector('input:not([type=hidden]):not([type=radio]):not([type=file]), textarea');
    if (campo1 && !modal.contains(document.activeElement)) campo1.focus();
  }

  /* ---------------- listas (nota em modo lista e colagem de tarefas) ----------------
     Uma linha = um item. Marcadores comuns de lista saem na leitura. */
  const SEM_MARCA = /^\s*(?:[-*•·–—]|\[[ xX]?\]|\d{1,3}[.)])\s*/;
  const linhasDe = (txt) => String(txt || '').split('\n').map((l) => l.replace(SEM_MARCA, '').trim()).filter(Boolean);
  const textoDaLista = (i) => (i.lista || []).map((x) => x.texto).join('\n') || i.texto || '';
  const feitosDaLista = (i) => (i.lista || []).filter((x) => x.feito).length;
  /** Reescreve a lista a partir do texto, preservando o que já estava marcado. */
  function listaDoTexto(texto, antes = []) {
    const marcados = new Map(antes.map((x) => [x.texto, x.feito]));
    return linhasDe(texto).map((t, n) => ({ id: 'li' + n + '-' + hashNum(t), texto: t, feito: !!marcados.get(t) }));
  }
  function listaCheckHTML(i) {
    const l = i.lista || [];
    return `<ul class="lista-check">${l.map((x) => `<li class="${x.feito ? 'feito' : ''}">
        <button type="button" data-act="nota-item" data-id="${i.id}" data-item="${x.id}"
          aria-pressed="${!!x.feito}" aria-label="${x.feito ? 'Desmarcar' : 'Marcar'} ${esc(x.texto)}">${ic(x.feito ? 'check-circle-solid' : 'check-circle')}</button>
        <span>${esc(x.texto)}</span></li>`).join('')}</ul>
      ${l.length ? `<p class="lista-conta">${feitosDaLista(i)} de ${l.length}</p>` : ''}`;
  }
  function alternarItemLista(id, item_id) {
    const n = item(id); if (!n || !n.lista) return;
    const x = n.lista.find((y) => y.id === item_id); if (!x) return;
    x.feito = !x.feito; n.editadoEm = agora(); salvar(); render();
  }

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
  /* ---------------- modo trabalho ----------------
     Um quadro de tarefas por cima de tudo, para quando o assunto é só executar.
     Abre e fecha com Shift+Espaço; a música continua visível à direita. */
  function alternarTrabalho(ligado) {
    UI.modoTrabalho = ligado === undefined ? !UI.modoTrabalho : ligado;
    document.body.classList.toggle('em-trabalho', !!UI.modoTrabalho);
    if (UI.modoTrabalho) { S.perfil.passos = S.perfil.passos || {}; if (!S.perfil.passos.trabalho) { S.perfil.passos.trabalho = true; salvar(); } }
    UI.pularColheita = true; render();
  }
  function renderTrabalho() {
    if (!caixaTrabalho) return;
    if (!UI.modoTrabalho) { caixaTrabalho.hidden = true; caixaTrabalho.innerHTML = ''; return; }
    caixaTrabalho.hidden = false;
    const todas = tarefas();
    const abertas = todas.filter((i) => !i.concluida);
    const feitas = todas.filter((i) => i.concluida).sort((a, b) => (b.editadoEm || b.criadoEm).localeCompare(a.editadoEm || a.criadoEm));
    const colunas = Object.entries(ETAPAS).map(([v, n]) => {
      const lista = v === 'feito' ? feitas.slice(0, 12) : abertas.filter((i) => etapa(i) === v);
      return `<section class="quadro-col"><h2>${n}<em class="pino">${v === 'feito' ? feitas.length : lista.length}</em></h2>
        ${lista.map((i) => `<article class="tar-cartao">${linhaTarefa(i)}
          <div class="pe">${v !== 'afazer' ? btnIco('tar-para', 'nav-arrow-left', 'Mover para A fazer', `data-id="${i.id}" data-v="afazer"`) : ''}
            ${v !== 'fazendo' ? btnIco('tar-para', 'clock', 'Mover para Fazendo', `data-id="${i.id}" data-v="fazendo"`) : ''}
            ${v !== 'feito' ? btnIco('tar-para', 'check-circle', 'Mover para Feito', `data-id="${i.id}" data-v="feito"`) : ''}
            <span class="espaco"></span>${menuTarefa(i)}</div></article>`).join('') || '<p class="nada" style="padding:0 6px">—</p>'}</section>`;
    }).join('');
    caixaTrabalho.innerHTML = `<div class="trab-interno">
      <header class="trab-cab"><h1>${ic('list')}Modo trabalho</h1>
        <p class="meta">${abertas.length} em aberto${feitas.length ? ' · ' + feitas.length + ' feita' + (feitas.length > 1 ? 's' : '') : ''}</p>
        <span class="espaco"></span>
        ${btn('criar', ic('plus') + 'Nova tarefa', 'data-t="tarefa"', 'btn-1')}
        <button type="button" class="disco ${UI.tocando ? 'girando' : ''}" data-act="abrir-musica" title="Músicas" aria-label="Músicas"><span></span></button>
        ${btnIco('trabalho-sair', 'xmark', 'Sair do modo trabalho (Shift + Espaço)')}</header>
      <div class="quadro tres">${colunas}</div>
      <p class="trab-dica">${ic('priority-high')}Shift + Espaço fecha e abre este modo.</p></div>`;
  }

  /* ---------------- atalho de adicionar ----------------
     Um botão no canto de baixo à esquerda que abre só ao passar o mouse sobre o símbolo de mais (no toque, abre com um toque). */
  function renderAtalho() {
    if (!caixaAtalho) return;
    if (UI.sessao.modo === 'deslogado' || !UI.modoTrabalho) { caixaAtalho.innerHTML = ''; return; }
    caixaAtalho.innerHTML = `<div class="atalho ${UI.atalhoAberto ? 'aberto' : ''}">
      <div class="atalho-tipos">${TIPOS_CRIAR.map(([v, n, i]) => `<button type="button" data-act="criar" data-t="${v}">
        ${ic(i)}<span>${n}</span>${temRascunho('criar:' + v) ? '<em class="ponto-rasc" title="rascunho guardado"></em>' : ''}</button>`).join('')}</div>
      <button type="button" class="atalho-botao" data-act="atalho" aria-expanded="${!!UI.atalhoAberto}" aria-label="Guardar algo">${ic('plus')}</button></div>`;
  }

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
    if (info.videoData && info.videoData.title && info.videoData.title !== UI.faixaYT) { UI.faixaYT = info.videoData.title; pintarMiniApp(); }
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
    if (capa) capa.innerHTML = i && capaYT(i) ? `<img src="${esc(capaYT(i))}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ic('music-note');
    const pp = ap.querySelector('[data-act="player-pausar"]');
    if (pp) { pp.innerHTML = ic(UI.pausado || !UI.tocando ? 'play' : 'pause'); pp.title = pp.ariaLabel = UI.pausado || !UI.tocando ? 'Tocar' : 'Pausar'; }
    const mn = ap.querySelector('[data-act="player-min"]');
    if (mn) { mn.innerHTML = ic(UI.playerMin ? 'nav-arrow-up' : 'nav-arrow-down'); mn.title = mn.ariaLabel = UI.playerMin ? 'Abrir o painel' : 'Modo MP3'; }
    const lista = ap.querySelector('#ma-lista');
    if (lista) lista.innerHTML = listaMiniApp();
    // as opções também mudam quando um grupo é criado ou renomeado
    const barra = ap.querySelector('.ma-barra');
    const sel = ap.querySelector('.ma-grupo');
    if (sel && barra) { const novo = cabecalhoMiniApp(); if (sel.outerHTML !== novo) sel.outerHTML = novo; }
  }
  function renderMiniApp() {
    const caixa = document.getElementById('player');
    if (!caixa) return;
    if (!UI.painelMusica && !UI.tocando && !(window.SONS && SONS.ambiente.tocando())) { caixa.innerHTML = ''; caixa.hidden = true; delete caixa.dataset.faixa; UI.faixaYT = ''; return; }
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
          ${btnIco('player-min', 'nav-arrow-down', 'Modo MP3')}
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
      UI.faixaYT = '';
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

  /* ---------------- imagens ----------------
     Grade em colunas, como o Pinterest: cada imagem mantém a proporção que tem. Grupos separam o que é de quê;
     arraste uma imagem sobre o nome de um grupo para movê-la. */
  const imagens = () => doTipo('imagem').slice().sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  const grupoImagem = (id) => (S.gruposImagem || []).find((g) => g.id === id);
  const imgPin = (i) => `<img src="${esc(i.src)}" alt="${esc(i.titulo || '')}" loading="lazy" draggable="false" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'pin-quebrada',textContent:'Imagem indisponível'}))">`;
  function renderImagens() {
    const todas = imagens(), gs = S.gruposImagem || [];
    if (UI.grupoImagem && UI.grupoImagem !== 'soltas' && !grupoImagem(UI.grupoImagem)) UI.grupoImagem = '';
    const g = UI.grupoImagem || '';
    const lista = todas.filter((i) => !g || (g === 'soltas' ? !i.grupo : i.grupo === g));
    const conta = (id) => todas.filter((i) => (id === 'soltas' ? !i.grupo : i.grupo === id)).length;
    const chip = (v, nome, n, alvo) => `<button type="button" class="chip-grupo" data-act="img-grupo" data-v="${v}" ${alvo ? `data-grupo-alvo="${esc(alvo)}"` : ''} aria-pressed="${g === v}">${esc(nome)}<em>${n}</em></button>`;
    const cartaoI = (i) => `<article class="pin" draggable="true" data-imagem="${i.id}">
        <button type="button" class="pin-img" data-act="imagem-ver" data-id="${i.id}" aria-label="Ver ${esc(tituloItem(i))}">${imgPin(i)}</button>
        <div class="pin-pe"><span class="pin-tit">${esc(i.titulo || '')}</span>
          <span class="pin-acoes">${btnAlterna('fav', i.id, i.favorito, 'star', 'Favorita', 'Favoritar', 'estrela')}
            ${menuMais([{ act: 'editar-item', id: i.id, ico: 'edit-pencil', txt: 'Editar' },
              { act: 'imagem-grupo', id: i.id, ico: 'folder', txt: 'Mover para grupo' },
              { act: 'organizar-em', id: i.id, ico: 'folder', txt: 'Mover para coleção' },
              i.origem ? { act: 'abrir-origem', id: i.id, ico: 'open-new-window', txt: 'Abrir a origem' } : null,
              '-', { act: 'excluir-item', id: i.id, ico: 'trash', txt: 'Excluir', perigo: true }], 'esq')}</span></div></article>`;
    main.innerHTML = `<header class="pagina-cab"><h1>${ic('media-image')}Imagens</h1>
        <div class="ferramentas">${btn('criar', ic('plus') + 'Guardar imagem', 'data-t="imagem"', 'btn-1')}</div></header>
      <div class="grupos-img" role="group" aria-label="Grupos">
        ${chip('', 'Todas', todas.length)}${gs.map((x) => chip(x.id, x.nome, conta(x.id), x.id)).join('')}${chip('soltas', 'Sem grupo', conta('soltas'), 'soltas')}
        ${btn('novo-grupo-imagem', ic('plus') + 'Grupo', '', 'btn-f btn-p')}
        ${grupoImagem(g) ? `<span class="espaco"></span>${btnIco('renomear-grupo-imagem', 'edit-pencil', 'Renomear grupo')}${btnIco('excluir-grupo-imagem', 'trash', 'Excluir grupo')}` : ''}</div>
      ${lista.length ? `<div class="pin-grade">${lista.map(cartaoI).join('')}</div>`
        : vazio('media-image', todas.length ? 'Nenhuma imagem neste grupo.' : 'Nenhuma imagem ainda. Cole uma com Ctrl + V, arraste um arquivo para cá ou guarde por link.',
          btn('criar', ic('plus') + 'Guardar imagem', 'data-t="imagem"', 'btn-1'))}
      <p class="meta dica-cola">${ic('priority-high')} Dica: com esta tela aberta, Ctrl + V guarda a imagem copiada na hora${grupoImagem(g) ? ' neste grupo' : ''}.</p>`;
  }

  /* ---------------- tarefas ---------------- */
  /** Uma tarefa é sempre uma linha: círculo para riscar, título e, se houver, prazo e situação. */
  function linhaTarefa(i, opts = {}) {
    const e = etapa(i);
    const atras = atrasada(i);
    const prazo = i.prazo ? `<span class="tar-prazo ${atras ? 'atrasada' : ''}">${ic('calendar')}${atras ? 'venceu ' : ''}${fmtDiaCurto(i.prazo)}</span>` : '';
    const cols = opts.semColecao ? '' : (i.colecoes || []).map((c) => (colecao(c.id) || {}).nome).filter(Boolean)
      .map((n) => `<span class="tar-col">${esc(n)}</span>`).join('');
    return `<div class="tarefa-linha ${i.concluida ? 'feita' : ''}">
      <button type="button" class="tar-marca" data-act="tar-ok" data-id="${i.id}"
        aria-pressed="${!!i.concluida}" aria-label="${i.concluida ? 'Reabrir tarefa' : 'Marcar como feita'}" title="${i.concluida ? 'Reabrir' : 'Marcar como feita'}">
        ${ic(i.concluida ? 'check-circle-solid' : 'check-circle')}</button>
      <span class="tar-corpo" data-act="tarefa-ver" data-id="${i.id}"><a class="tar-tit" href="#/item/${i.id}">${esc(i.titulo || 'Tarefa sem nome')}</a>
        ${i.descricao && !opts.semDescricao ? `<span class="tar-desc">${esc(corta(i.descricao, 120))}</span>` : ''}
        <span class="tar-meta">${prazo}${e === 'fazendo' ? `<span class="tar-etapa">${ic('clock')}Fazendo</span>` : ''}${(i.comentarios || []).length ? `<span class="tar-col">${ic('chat-bubble')}${i.comentarios.length}</span>` : ''}${cols}</span></span></div>`;
  }
  function alternarTarefa(id) {
    const i = item(id); if (!i) return;
    i.concluida = !i.concluida;
    i.etapa = i.concluida ? 'feito' : 'afazer';
    i.editadoEm = agora();
    if (i.concluida) concluirLembreteDe(i); // some o aviso junto com a tarefa
    salvar(); render();
    toast(i.concluida ? 'Feito: ' + corta(i.titulo, 40) : 'Tarefa reaberta.', i.concluida ? 'check-circle-solid' : 'list');
  }
  function mudarEtapa(id, nova) {
    const i = item(id); if (!i) return;
    i.etapa = nova; i.concluida = nova === 'feito'; i.editadoEm = agora();
    if (i.concluida) concluirLembreteDe(i);
    salvar(); render();
  }
  function concluirLembreteDe(i) {
    const l = i.lembreteId && lembrete(i.lembreteId);
    if (l) l.concluido = true;
  }
  /** Ponte com os lembretes: o prazo da tarefa vira um lembrete ligado a ela. */
  function sincronizarPrazo(i, avisar) {
    const atual = i.lembreteId ? lembrete(i.lembreteId) : null;
    if (!i.prazo || !avisar || i.concluida) {
      if (atual) { S.lembretes = S.lembretes.filter((l) => l.id !== atual.id); i.lembreteId = ''; }
      return;
    }
    if (atual) { atual.texto = i.titulo; atual.data = i.prazo; atual.concluido = false; return; }
    const novo = { id: uid('lemb'), texto: i.titulo, data: i.prazo, hora: '', itemId: i.id, concluido: false, criadoEm: agora(), motivo: 'tarefa' };
    S.lembretes.push(novo); i.lembreteId = novo.id;
  }

  /* ---------------- aplicativo (PWA) ----------------
     pwa.js fala com o navegador (service worker, convite de instalação); aqui ficam os botões, os avisos e o que
     chega de fora: atalhos do ícone (#/novo/nota) e conteúdo compartilhado por outros apps (?titulo=&texto=&url=). */
  const PWA_ = () => window.PWA || { instalado: false, instalavel: false, ios: false };
  const podeInstalar = () => { const P = PWA_(); return !P.instalado && (P.instalavel || P.ios); };
  let pwaAtualizacao = false, pwaDepois = false;
  function pintarAvisoPwa() {
    const el = document.getElementById('aviso-pwa');
    if (!el) return;
    if (pwaAtualizacao && !pwaDepois) {
      el.innerHTML = `${ic('refresh')}<span>Há uma versão nova da Tyba.</span><button type="button" class="aviso-btn" data-act="pwa-atualizar">Atualizar</button><button type="button" class="aviso-x" data-act="pwa-depois" aria-label="Agora não">${ic('xmark')}</button>`;
      el.hidden = false;
    } else if (!navigator.onLine) {
      el.innerHTML = `${ic('priority-high')}<span>Sem conexão. O que você guardar fica neste aparelho e sincroniza quando voltar.</span>`;
      el.hidden = false;
    } else { el.hidden = true; el.innerHTML = ''; }
  }
  window.addEventListener('pwa:atualizacao', () => { pwaAtualizacao = true; pintarAvisoPwa(); });
  window.addEventListener('pwa:mudou', () => { if (!S) return; renderTopo(); if ((rotaAtual()[0] || '') === 'config') { UI.pularColheita = true; render(); } });
  window.addEventListener('pwa:instalado', () => toast('Tyba instalada.', 'check-circle-solid'));
  window.addEventListener('offline', pintarAvisoPwa);
  window.addEventListener('online', () => { pintarAvisoPwa(); toast('Conexão de volta.', 'check-circle-solid'); try { if (typeof agendarSync === 'function') agendarSync(); } catch (e) { /* ignora */ } });
  function tratarEntrada() {
    const q = new URLSearchParams(location.search), [r, t] = rotaAtual();
    if (q.has('url') || q.has('texto') || q.has('titulo')) {
      const titulo = (q.get('titulo') || '').trim(), texto = (q.get('texto') || '').trim();
      const achou = ((q.get('url') || '').trim()) || ((texto.match(/https?:\/\/\S+/) || [''])[0]);
      history.replaceState(null, '', location.pathname + '#/inicio');
      if (achou) { delete RASC['criar:link']; return abrirModal({ tipo: 'criar', t: 'link', valores: { url: achou, titulo: titulo && titulo !== achou ? titulo : '' } }); }
      delete RASC['criar:nota']; return abrirModal({ tipo: 'criar', t: 'nota', valores: { titulo, texto } });
    }
    if (r === 'novo') {
      history.replaceState(null, '', location.pathname + location.search + '#/inicio');
      if (t === 'trabalho') return alternarTrabalho(true);
      if (TIPOS_CRIAR.some((x) => x[0] === t)) return abrirModal({ tipo: 'criar', t });
      render();
    }
  }

  /* ---------------- pet ----------------
     Um cachorrinho em pixel art no alto do Início. O cenário muda em cinco fases do dia, conforme a hora do aparelho.
     Cuidados: clicar no chão (ou em "Comida") derruba comidinha; "Banho" leva ele ao meio para ensaboar e sacudir;
     depois de comer ele faz cocô, que fica ali até você clicar para limpar; clicar na casinha escolhe o nome da placa;
     clicar nele faz latir. A folha de sprites tem 4 poses × 4 quadros (0 parado, 1 sentado, 2 andando, 3 abaixado),
     todas olhando para a direita. O estado vive aqui fora porque a tela é redesenhada a toda hora; o laço só mexe
     no que está na página. */
  /** Os bichinhos: cada folha tem 4 poses × 4 quadros, todas olhando para a direita, e o tamanho da célula próprio. */
  const PET_TIPOS = {
    salsicha: { nome: 'Salsicha', arq: 'assets/img/pet/salsicha.png', CW: 63, CH: 40, fala: 'AU! AU!', som: 'latido' },
    pinscher: { nome: 'Pinscher', arq: 'assets/img/pet/pinscher.png', CW: 45, CH: 43, fala: 'AI AI AI!', som: 'ganido' },
    frajola: { nome: 'Frajola', arq: 'assets/img/pet/frajola.png', CW: 51, CH: 38, fala: 'MIAU!', som: 'miado' },
    shollie: { nome: 'Shollie', arq: 'assets/img/pet/shollie.png', CW: 62, CH: 42, fala: 'AU AU!', som: 'latido' }
  };
  const petDef = () => PET_TIPOS[S.perfil.petTipo] || PET_TIPOS.salsicha;
  const PET = { ESC: 2, x: null, dir: 1, estado: 'parado', tEstado: 0, rel: 0, visita: null, visitaEm: 0, comentados: new Set(), recentes: [], ultimaCat: '', oiEm: 0, saudadeFeita: false, proxFala: 0, foraMs: 0, avisoEm: 0, cocos: [], falaAte: 0, pulo: 0, espera: 6, alvo: null, id: 0, cocoEm: 0, fila: '', bolhaT: 0, forcar: null, interagiu: false };
  const PET_LINHA = { parado: 0, sentado: 1, andando: 2, comendo: 3, latindo: 1, banho: 1, sacode: 0, coco: 3, brincando: 2 };
  const PET_FPS = { parado: 4, sentado: 3, andando: 9, comendo: 6, latindo: 9, banho: 3, sacode: 0, coco: 0, brincando: 13 };
  const petReduz = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  /** Cinco fases do dia: cores do céu, do chão, dos morros e do astro. */
  const PET_FASES = {
    amanhecer: { nome: 'Amanhecer', ceu: ['#8fa3d6', '#f3b5a5 62%', '#fde2b4'], chao: ['#7fb56c', '#93c77d', '#6fa35c'], longe: '#a9b9a0', perto: '#8fb583', nuvem: '#ffd5c4', astro: '#ffb36b', estrelas: .3 },
    manha: { nome: 'Manhã', ceu: ['#86cdf0', '#e2f4fb'], chao: ['#86bd6a', '#9ccf80', '#75ab5a'], longe: '#b9d8b0', perto: '#9fcb8f', nuvem: '#ffffff', astro: '#f7d36a', estrelas: 0 },
    tarde: { nome: 'Tarde', ceu: ['#5db4ea', '#c9e8f7'], chao: ['#78b25e', '#8ec974', '#689f50'], longe: '#a6cf9a', perto: '#8cc17f', nuvem: '#ffffff', astro: '#ffe27a', estrelas: 0 },
    entardecer: { nome: 'Entardecer', ceu: ['#37478a', '#d96f5c 58%', '#f7b16c'], chao: ['#6d9553', '#80a862', '#5d8348'], longe: '#8a8f6e', perto: '#6f8a5a', nuvem: '#f4a688', astro: '#ff8a4c', estrelas: .15 },
    noite: { nome: 'Noite', ceu: ['#101731', '#2a3760'], chao: ['#2f5a44', '#3b6c52', '#264b39'], longe: '#223b3a', perto: '#1c3231', nuvem: '#3a4772', astro: '#e9ecf5', estrelas: .9 }
  };
  const petFase = () => {
    if (PET.forcar) return PET.forcar;
    const h = new Date().getHours();
    return h >= 5 && h < 8 ? 'amanhecer' : h < 12 && h >= 8 ? 'manha' : h >= 12 && h < 17 ? 'tarde' : h >= 17 && h < 19 ? 'entardecer' : 'noite';
  };
  /** Morros em degraus (pixel art): uma coluna de retângulos por posição. */
  const petMorros = (alturas, cor) => "url('data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${alturas.length} 14" shape-rendering="crispEdges">${alturas.map((h, k) => `<rect x="${k}" y="${14 - h}" width="1" height="${h}" fill="${cor}"/>`).join('')}</svg>`) + "')";
  const PET_ONDA = (n, base, amp, fase) => Array.from({ length: n }, (_, k) => Math.round(base + amp * Math.sin((k + fase) / n * Math.PI * 4)));
  const PET_MORROS = {};
  const petEstiloFase = (f) => {
    const c = PET_FASES[f];
    if (!PET_MORROS[f]) PET_MORROS[f] = [petMorros(PET_ONDA(120, 7, 3, 0), c.longe), petMorros(PET_ONDA(120, 5, 2, 30), c.perto)];
    return `--ceu:linear-gradient(${c.ceu.join(',')});--chao:${c.chao[0]};--chao-alto:${c.chao[1]};--chao-baixo:${c.chao[2]};--nuvem:${c.nuvem};--astro:${c.astro};--estrelas:${c.estrelas};--morros-longe:${PET_MORROS[f][0]};--morros-perto:${PET_MORROS[f][1]}`;
  };
  const PET_ARVORE = `<svg class="pc-arvore" viewBox="0 0 24 34" shape-rendering="crispEdges" aria-hidden="true"><rect x="10" y="22" width="4" height="12" fill="#7b5738"/><rect x="11" y="22" width="1" height="12" fill="#946b45"/>
    <rect x="6" y="14" width="12" height="10" fill="#3f8a4d"/><rect x="3" y="16" width="18" height="6" fill="#3f8a4d"/><rect x="8" y="6" width="8" height="10" fill="#4a9a58"/><rect x="5" y="9" width="14" height="5" fill="#4a9a58"/><rect x="9" y="2" width="6" height="6" fill="#58a866"/>
    <rect x="8" y="10" width="2" height="2" fill="#6dbb78"/><rect x="14" y="17" width="2" height="2" fill="#6dbb78"/><rect x="5" y="19" width="2" height="2" fill="#337a41"/></svg>`;
  const PET_CASINHA = `<svg class="pc-casinha" viewBox="0 0 30 26" shape-rendering="crispEdges" aria-hidden="true"><rect x="3" y="12" width="24" height="14" fill="#c9884f"/><rect x="3" y="12" width="24" height="2" fill="#dba06a"/>
    <rect x="12" y="1" width="6" height="2" fill="#a2442f"/><rect x="9" y="3" width="12" height="2" fill="#a2442f"/><rect x="6" y="5" width="18" height="2" fill="#a2442f"/><rect x="3" y="7" width="24" height="2" fill="#b24f37"/><rect x="1" y="9" width="28" height="3" fill="#b24f37"/>
    <rect x="11" y="15" width="8" height="11" fill="#3a2a22"/><rect x="12" y="14" width="6" height="1" fill="#3a2a22"/><rect x="5" y="22" width="2" height="4" fill="#b87a44"/></svg>`;
  const PET_FLORES = `<svg class="pc-flores" viewBox="0 0 60 8" shape-rendering="crispEdges" aria-hidden="true"><rect x="5" y="3" width="2" height="2" fill="#f4c94a"/><rect x="6" y="5" width="1" height="3" fill="#4a9a58"/><rect x="22" y="2" width="2" height="2" fill="#f08a9a"/><rect x="23" y="4" width="1" height="4" fill="#4a9a58"/>
    <rect x="41" y="3" width="2" height="2" fill="#fff"/><rect x="42" y="5" width="1" height="3" fill="#4a9a58"/><rect x="54" y="2" width="2" height="2" fill="#f4c94a"/><rect x="55" y="4" width="1" height="4" fill="#4a9a58"/></svg>`;
  const PET_COCO = `<svg viewBox="0 0 12 11" shape-rendering="crispEdges" aria-hidden="true"><rect x="4" y="0" width="3" height="1" fill="#6b4226"/><rect x="3" y="1" width="5" height="2" fill="#7b4b2a"/><rect x="2" y="3" width="8" height="2" fill="#7b4b2a"/><rect x="1" y="5" width="10" height="3" fill="#8a5632"/><rect x="0" y="8" width="12" height="3" fill="#7b4b2a"/><rect x="3" y="4" width="2" height="1" fill="#a0693c"/><rect x="2" y="9" width="3" height="1" fill="#a0693c"/></svg>`;
  const PET_BOLA = `<svg viewBox="0 0 8 8" shape-rendering="crispEdges" aria-hidden="true"><rect x="2" y="0" width="4" height="8" fill="#d8452f"/><rect x="0" y="2" width="8" height="4" fill="#d8452f"/><rect x="1" y="1" width="6" height="6" fill="#d8452f"/><rect x="2" y="1" width="2" height="1" fill="#f27a63"/><rect x="0" y="3" width="8" height="2" fill="#fff"/><rect x="1" y="5" width="6" height="2" fill="#b8321f"/></svg>`;
  const petIco = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const petHTML = () => {
    if (S.perfil.petOculto) return '';
    const som = !S.perfil.petMudo, nome = (S.perfil.petNome || '').trim(), f = petFase();
    return `<section class="pet-cena" id="pet-cena" data-fase="${f}" style="${petEstiloFase(f)}" aria-label="Seu cachorrinho. Clique nele para ouvir um latido; clique no chão para jogar a bolinha.">
      <div class="pc-astro"></div><div class="pc-estrelas"></div><div class="pc-nuvem n1"></div><div class="pc-nuvem n2"></div>
      <div class="pc-morros longe"></div><div class="pc-morros perto"></div>
      ${PET_ARVORE}${PET_CASINHA}<button type="button" class="pc-placa ${nome ? '' : 'sem-nome'}" data-act="pet-nome" title="Escolher o nome">${nome ? esc(nome) : 'Dar um nome'}</button>
      <div class="pc-chao"></div>${PET_FLORES}${petPotesHTML()}
      <div class="pet-cao" role="img" aria-label="${nome ? esc(nome) : petDef().nome}"></div><div class="pet-balao" hidden></div>
      <div class="pet-barra">
        <button type="button" class="pet-botao" data-act="pet-banho" title="Dar banho">${petIco('<path d="M12 3.5s6 6.1 6 10.2a6 6 0 0 1-12 0C6 9.6 12 3.5 12 3.5Z"/><path d="M9.5 14a2.6 2.6 0 0 0 2.2 2.4"/>')}<span>Banho</span></button>
        <button type="button" class="pet-botao" data-act="pet-config" aria-haspopup="dialog" title="Escolher o pet e ajustes">
          ${petIco('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>')}<span>Pets</span></button></div>
      <div class="pet-config" ${UI.petConfig ? '' : 'hidden'} role="dialog" aria-label="Escolha o seu pet"><div class="pet-config-card">
        <div class="pet-config-cab"><p class="pet-config-tit">Escolha o seu pet</p>${btnIco('pet-config', 'xmark', 'Fechar')}</div>
        <div class="pet-opcoes">${Object.entries(PET_TIPOS).map(([k, d]) => `<button type="button" class="pet-opcao" data-act="pet-escolher" data-tipo="${k}" aria-pressed="${(S.perfil.petTipo || 'salsicha') === k}">
          <span class="pet-mini" style="width:${d.CW}px;height:${d.CH}px;background-image:url('${d.arq}');background-size:${d.CW * 4}px ${d.CH * 4}px"></span><span>${d.nome}</span></button>`).join('')}</div>
        <div class="pet-extras">
          <button type="button" class="pet-linha" data-act="pet-som" aria-pressed="${som}">Som: <b>${som ? 'ligado' : 'desligado'}</b></button>
          <button type="button" class="pet-linha" data-act="pet-papo" aria-pressed="${!S.perfil.petCala}">Conversa: <b>${S.perfil.petCala ? 'desligada' : 'ligada'}</b></button>
          <button type="button" class="pet-linha" data-act="pet-alternar" title="Para voltar, use Configurações">Esconder</button></div></div></div>
      <p class="pet-dica ${PET.interagiu ? 'some' : ''}">Clique no chão para jogar a bolinha, nele para ouvir um latido, nas vasilhas para encher e na casinha para dar um nome</p></section>`;
  };
  let petAudio = null;
  function petLatido() {
    if (S.perfil.petMudo) return;
    try {
      petAudio = petAudio || new (window.AudioContext || window.webkitAudioContext)();
      if (petAudio.state === 'suspended') petAudio.resume();
      const t0 = petAudio.currentTime, som = petDef().som;
      // cada bicho tem a sua voz: [início do som, freq inicial, freq final, duração, onda]
      const vozes = {
        latido: [[0, 560, 220, .13, 'sawtooth'], [.17, 560, 220, .13, 'sawtooth']],
        ganido: [[0, 900, 380, .09, 'sawtooth'], [.12, 900, 380, .09, 'sawtooth'], [.24, 980, 400, .09, 'sawtooth']],
        miado: [[0, 520, 820, .14, 'triangle'], [.14, 820, 480, .36, 'triangle']]
      }[som];
      vozes.forEach(([d, f0, f1, dur, onda]) => {
        const o = petAudio.createOscillator(), g = petAudio.createGain(), f = petAudio.createBiquadFilter();
        o.type = onda; o.frequency.setValueAtTime(f0, t0 + d); o.frequency.exponentialRampToValueAtTime(f1, t0 + d + dur);
        f.type = 'lowpass'; f.frequency.value = som === 'miado' ? 2400 : 1600;
        g.gain.setValueAtTime(0.0001, t0 + d); g.gain.exponentialRampToValueAtTime(.16, t0 + d + .02); g.gain.exponentialRampToValueAtTime(.0001, t0 + d + dur + .02);
        o.connect(f); f.connect(g); g.connect(petAudio.destination); o.start(t0 + d); o.stop(t0 + d + dur + .03);
      });
    } catch (e) { /* sem áudio: só o balão */ }
  }
  /** Balão: no máximo três palavras por linha. */
  const quebra3 = (t) => { const w = String(t).trim().split(/\s+/), l = []; for (let k = 0; k < w.length; k += 3) l.push(w.slice(k, k + 3).join(' ')); return l.join('\n'); };
  function petFalar(txt, seg) { PET.fala = quebra3(txt); PET.falaAte = performance.now() + seg * 1000; }
  /* ---------------- conversa do pet ----------------
     De tempos em tempos, e só com a janela visível, o pet comenta algo do seu espaço: o que você guardou,
     lembretes e tarefas, o tempo, o fim de semana, ou diz que sentiu falta. As frases ficam em
     assets/js/pet-frases.js. */
  const PAPO_VISTO = 'meuEspaco.petVisto';
  const sorteia = (l) => l[Math.floor(Math.random() * l.length)];
  const lerVisto = () => { try { return +localStorage.getItem(PAPO_VISTO) || 0; } catch (e) { return 0; } };
  const marcarVisto = () => { try { localStorage.setItem(PAPO_VISTO, String(Date.now())); } catch (e) { /* sem espaço: segue */ } };
  const corta28 = (t) => { t = String(t || '').replace(/\s+/g, ' ').trim(); return t.length > 28 ? t.slice(0, 27) + '…' : t; };
  function petFrase(f, v = {}) {
    const nome = (S.perfil.nome || '').trim().split(/\s+/)[0], temNome = nome && nome !== 'Meu';
    return f.replace(/,? ?\{nome\}/g, temNome ? (/^\{nome\}/.test(f) ? '' : ', ' + nome) : '').replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? v[k] : '')).replace(/\s+([!.?,])/g, '$1');
  }
  /** Reúne o que há para comentar agora; cada assunto tem um peso. */
  function petAssuntos() {
    const F = window.PET_FRASES; if (!F) return [];
    const a = [], h = new Date(), dia = h.getDay(), d0 = hoje();
    const novo = (txt, cat, peso, id) => a.push({ txt, cat, peso, id });
    const rec = S.itens.filter((i) => i.criadoEm && Date.now() - new Date(i.criadoEm).getTime() < 36 * 3600e3 && !PET.comentados.has(i.id)).sort(() => Math.random() - .5)[0];
    if (rec) {
      const k = rec.tipo === 'midia' ? (rec.formato === 'filme' ? 'filme' : 'livro') : (F.post[rec.tipo] ? rec.tipo : 'generico');
      novo(petFrase(sorteia(F.post[k]), { t: corta28(tituloItem(rec)) }), 'post', 5, rec.id);
    }
    const feita = tarefas().filter((i) => i.concluida && Date.now() - new Date(i.editadoEm || i.criadoEm).getTime() < 6 * 3600e3 && !PET.comentados.has('f' + i.id))[0];
    if (feita) novo(petFrase(sorteia(F.post.feita), { t: corta28(tituloItem(feita)) }), 'post', 5, 'f' + feita.id);
    const lembs = S.lembretes.filter((l) => !l.concluido && l.data && l.data <= d0).sort((x, y) => venc(x) - venc(y));
    if (lembs.length) { const l = lembs[0], atras = l.data < d0 || venc(l) < Date.now(); novo(petFrase(sorteia(F.alerta[atras ? 'lembreteAtrasado' : 'lembreteHoje']), { t: corta28(l.texto) }), 'alerta', 5); }
    const atr = tarefasAbertas().filter((i) => atrasada(i))[0], hojeT = tarefasAbertas().filter((i) => i.prazo === d0)[0];
    if (atr) novo(petFrase(sorteia(F.alerta.tarefaAtrasada), { t: corta28(tituloItem(atr)) }), 'alerta', 4);
    else if (hojeT) novo(petFrase(sorteia(F.alerta.tarefaHoje), { t: corta28(tituloItem(hojeT)) }), 'alerta', 4);
    const ab = tarefasAbertas().length; if (ab >= 4) novo(petFrase(sorteia(F.alerta.tarefasAbertas), { n: ab }), 'alerta', 2);
    const fh = tarefas().filter((i) => i.concluida && dataLocal(i.editadoEm || i.criadoEm) === d0).length; if (fh) novo(petFrase(sorteia(F.alerta.feitasHoje), { n: fh }), 'alerta', 3);
    // Agenda: eventos de hoje, de amanhã, contagem regressiva, stickers do dia, agenda livre e eventos novos.
    const evs = (S.eventos || []).filter((e) => e.data >= d0).sort((x, y) => (x.data + (x.hora || '')).localeCompare(y.data + (y.hora || '')));
    const evHoje = evs.find((e) => e.data === d0), evAmanha = evs.find((e) => e.data === somaDias(d0, 1)), evContagem = evs.find((e) => e.contagem && e.data > d0 && diasAte(e.data) <= 60);
    if (evHoje) novo(petFrase(sorteia(F.alerta.eventoHoje), { t: corta28(evHoje.titulo) }), 'agenda', 5);
    else if (evAmanha) novo(petFrase(sorteia(F.alerta.eventoAmanha), { t: corta28(evAmanha.titulo) }), 'agenda', 4);
    if (evContagem) novo(petFrase(sorteia(F.alerta.contagem), { n: diasAte(evContagem.data), t: corta28(evContagem.titulo) }), 'agenda', 3);
    else { const prox = evs.find((e) => diasAte(e.data) >= 2 && diasAte(e.data) <= 7); if (prox) novo(petFrase(sorteia(F.alerta.eventoSemana), { n: diasAte(prox.data), t: corta28(prox.titulo) }), 'agenda', 2); }
    const stkHoje = (S.stickers || {})[d0];
    if (stkHoje && stkHoje.length && F.sticker[stkHoje[0]]) novo(petFrase(sorteia(F.sticker[stkHoje[0]])), 'agenda', 4);
    if (S.eventos && S.eventos.length && !compromissosDoDia(d0).total) novo(petFrase(sorteia(F.alerta.agendaLivre)), 'agenda', 1);
    const evNovo = (S.eventos || []).find((e) => e.criadoEm && Date.now() - new Date(e.criadoEm).getTime() < 36 * 3600e3 && !PET.comentados.has('ev' + e.id));
    if (evNovo) novo(petFrase(sorteia(F.post[evNovo.foto ? 'eventoFoto' : 'evento']), { t: corta28(evNovo.titulo) }), 'post', 5, 'ev' + evNovo.id);
    // Som de fundo e música tocando
    if (window.SONS && SONS.ambiente.tocando()) novo(petFrase(sorteia(F.ambiente.som)), 'ambiente', 2);
    else if (UI.tocando && !UI.pausado) novo(petFrase(sorteia(F.ambiente.musica)), 'ambiente', 1);
    const c = typeof climaDados === 'function' ? climaDados() : null;
    if (c && c.atual && c.dia) {
      const t = Math.round(c.atual.temperature_2m), ch = c.dia.precipitation_probability_max[0] || 0, cod = c.atual.weather_code;
      if (ch >= 50) novo(petFrase(sorteia(F.tempo.chuva), { n: ch }), 'tempo', 4);
      else if (t >= 32) novo(petFrase(sorteia(F.tempo.calor), { n: t }), 'tempo', 4);
      else if (t <= 14) novo(petFrase(sorteia(F.tempo.frio), { n: t }), 'tempo', 4);
      else if (cod <= 2) novo(petFrase(sorteia(F.tempo.sol), { n: t }), 'tempo', 3);
      else novo(petFrase(sorteia(F.tempo.nublado), { n: t }), 'tempo', 2);
    }
    const fim = F.fim[dia === 0 || dia === 6 ? 'fds' : dia === 5 ? 'sex' : dia === 1 ? 'seg' : 'meio'];
    novo(petFrase(sorteia(fim), { n: 6 - dia }), 'fim', dia === 5 || dia === 6 || dia === 0 ? 3 : 2);
    if (agora_() - PET.oiEm > 3 * 3600e3) novo(petFrase(sorteia(F.oi[petFase()])), 'oi', 2);
    novo(petFrase(sorteia(F.elogio)), 'elogio', 2);
    novo(petFrase(sorteia(F.carinho)), 'carinho', 2);
    return a;
  }
  const agora_ = () => Date.now();
  function petConversar(forcar) {
    const cena = document.getElementById('pet-cena'); if (!cena || !window.PET_FRASES) return false;
    let txt = '', cat = '', id = null;
    const fora = PET.foraMs;
    if (!PET.saudadeFeita && fora > 2 * 3600e3) { PET.saudadeFeita = true; cat = 'saudade'; txt = petFrase(sorteia(window.PET_FRASES[fora > 24 * 3600e3 ? 'sumiu' : 'saudade'])); }
    else {
      const l = petAssuntos().filter((x) => x.cat !== PET.ultimaCat || forcar === 'qualquer');
      if (!l.length) return false;
      let r = Math.random() * l.reduce((n, x) => n + x.peso, 0), x = l[0];
      for (const y of l) { r -= y.peso; if (r <= 0) { x = y; break; } }
      txt = x.txt; cat = x.cat; id = x.id;
    }
    if (PET.recentes.includes(txt)) return false;
    PET.recentes.push(txt); if (PET.recentes.length > 8) PET.recentes.shift();
    if (id) PET.comentados.add(id);
    if (cat === 'oi') PET.oiEm = Date.now();
    PET.ultimaCat = cat; PET.saudadeFeita = true;
    petFalar(txt, Math.max(7, 3 + txt.split(/\s+/).length * 1.1));
    return true;
  }
  /** Confere de 4 em 4 segundos se é hora de puxar assunto. */
  setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    marcarVistoSeguido();
    const cena = document.getElementById('pet-cena'), t = performance.now();
    if (!cena || S.perfil.petCala || UI.modal || PET.bola || !['parado', 'sentado', 'andando'].includes(PET.estado)) return;
    if (t < PET.falaAte + 1500) return;
    if (!PET.proxFala) PET.proxFala = t + 6000 + Math.random() * 5000;
    if (t < PET.proxFala) return;
    if (petConversar()) PET.proxFala = t + 50000 + Math.random() * 40000; else PET.proxFala = t + 15000;
  }, 4000);
  PET.foraMs = lerVisto() ? Date.now() - lerVisto() : 0;
  let ultimoVisto = 0;
  function marcarVistoSeguido() { const t = Date.now(); if (t - ultimoVisto > 30000) { ultimoVisto = t; marcarVisto(); } }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') { marcarVisto(); ultimoVisto = Date.now(); return; }
    const fora = Date.now() - lerVisto(); PET.foraMs = fora;
    if (fora > 30 * 60e3) { PET.saudadeFeita = false; PET.proxFala = performance.now() + 2500; }
  });
  window.addEventListener('pagehide', marcarVisto);
  function petLatir() {
    PET.interagiu = true; PET.estado = 'latindo'; PET.tEstado = 0; PET.alvo = null; PET.pulo = 1;
    petFalar(petDef().fala, 1); petLatido();
  }
  /** Vasilhas: o nível cai com o tempo real (5 min cada) e sobe quando você enche. */
  const PET_POTES = { comida: { dur: 5 * 60e3, nome: 'comida', fome: 'Fome!' }, agua: { dur: 5 * 60e3, nome: 'água', fome: 'Sede!' } };
  const petNivel = (k) => { const t = (S.perfil.petPote || {})[k]; return t == null ? 1 : Math.max(0, Math.min(1, 1 - (Date.now() - t) / PET_POTES[k].dur)); };
  function petPotesHTML() {
    return Object.entries(PET_POTES).map(([k, d]) => `<button type="button" class="pc-pote ${k}" data-act="pet-encher" data-pote="${k}" style="--n:${petNivel(k).toFixed(2)}" title="Encher a vasilha de ${d.nome}" aria-label="Encher a vasilha de ${d.nome}"><span class="pote-conteudo"></span><span class="pote-borda"></span></button>`).join('');
  }
  function petPoteX(cena, k) { const el = cena.querySelector('.pc-pote.' + k); return el ? el.offsetLeft + el.offsetWidth / 2 : null; }
  function petEncher(k) {
    PET.interagiu = true; const vazio = petNivel(k) < .15;
    S.perfil.petPote = Object.assign({}, S.perfil.petPote, { [k]: Date.now() }); salvar();
    const el = document.querySelector('.pc-pote.' + k); if (el) el.style.setProperty('--n', '1');
    if (el) { el.classList.remove('enchendo'); void el.offsetWidth; el.classList.add('enchendo'); setTimeout(() => el.classList.remove('enchendo'), 700); }
    if (vazio) PET.visitaEm = 0;
  }
  function petConsumir(k) {
    const n = Math.max(0, petNivel(k) - .25);
    S.perfil.petPote = Object.assign({}, S.perfil.petPote, { [k]: Date.now() - (1 - n) * PET_POTES[k].dur }); salvar();
  }
  /** Joga a bolinha onde você clicou: cai do alto e o cão corre atrás. */
  function petBolaEm(x, cena) {
    PET.interagiu = true; PET.visita = null; PET.fila = '';
    const bx = Math.max(14, Math.min(cena.clientWidth - 14, x));
    if (PET.bola) { Object.assign(PET.bola, { x: bx, h: 130, vy: 0, vx: 0, chutes: 0, tempo: 0, cd: .4 }); }
    else PET.bola = { x: bx, h: 130, vy: 0, vx: 0, rot: 0, cd: .4, chutes: 0, tempo: 0, el: null };
  }
  /** Efeitos soltos (bolhas, gotas, brilhos): nascem, animam em CSS e somem sozinhos. */
  function petFx(cena, classe, x, base, dx = 0, tam = 10) {
    const el = document.createElement('i');
    el.className = classe; el.style.cssText = `left:${x}px;bottom:${base}px;width:${tam}px;height:${tam}px;--dx:${dx}px`;
    el.addEventListener('animationend', () => el.remove());
    cena.appendChild(el);
  }
  function petLimpar(coco, el, cena) {
    PET.interagiu = true;
    PET.cocos = PET.cocos.filter((c) => c !== coco);
    const x = coco.x;
    if (el) el.remove();
    for (let k = 0; k < 5; k++) petFx(cena, 'pet-brilho', x - 4 + (k - 2) * 7, 10 + (k % 2) * 8, (k - 2) * 6, 7);
    petFalar('Limpinho!', 1);
  }
  function petQuadro(t) {
    requestAnimationFrame(petQuadro);
    const cena = document.getElementById('pet-cena');
    if (!cena || document.hidden) { PET.ant = 0; return; }
    const dt = PET.ant ? Math.min(.05, (t - PET.ant) / 1000) : 0; PET.ant = t;
    const fase = petFase();
    if (cena.dataset.fase !== fase) { cena.dataset.fase = fase; cena.style.cssText = petEstiloFase(fase); }
    const L = cena.clientWidth, solo = cena.clientHeight - 26, larg = petDef().CW * PET.ESC, agora = performance.now();
    if (PET.x === null) PET.x = L * .55;
    PET.x = Math.max(larg / 2, Math.min(L - larg / 2, PET.x));
    if (agora - (PET.nivelT || 0) > 400) { PET.nivelT = agora; Object.keys(PET_POTES).forEach((k) => { const el = cena.querySelector('.pc-pote.' + k); if (el) el.style.setProperty('--n', petNivel(k).toFixed(2)); }); }
    // cocôs: ficam no chão até alguém limpar
    PET.cocos.forEach((c) => {
      if (!c.el || !c.el.isConnected) { c.el = document.createElement('button'); c.el.type = 'button'; c.el.className = 'pet-coco'; c.el.title = 'Limpar'; c.el.setAttribute('aria-label', 'Limpar o cocô'); c.el.innerHTML = PET_COCO + '<b></b><b></b>'; cena.appendChild(c.el); }
      c.el.style.transform = `translateX(${c.x - 13}px)`;
    });
    // bolinha: rola, quica e volta das paredes
    const bola = PET.bola;
    if (bola) {
      if (!bola.el || !bola.el.isConnected) { bola.el = document.createElement('div'); bola.el.className = 'pet-bola'; bola.el.innerHTML = PET_BOLA; cena.appendChild(bola.el); }
      bola.x += bola.vx * dt; bola.vx *= 1 - .5 * dt; bola.rot += bola.vx * dt * 3.2; bola.cd -= dt; bola.tempo += dt;
      if (bola.x < 12) { bola.x = 12; bola.vx = Math.abs(bola.vx) * .8; } else if (bola.x > L - 12) { bola.x = L - 12; bola.vx = -Math.abs(bola.vx) * .8; }
      bola.vy -= 900 * dt; bola.h += bola.vy * dt;
      if (bola.h <= 0) { bola.h = 0; bola.vy = bola.vy < -120 ? -bola.vy * .45 : 0; }
      bola.el.style.transform = `translate(${bola.x - 10}px, ${-bola.h}px) rotate(${bola.rot}deg)`;
    }
    // o que o cão faz agora
    const reduz = petReduz(), e = PET.estado;
    const andarAte = (meta, vel) => { const d = meta - PET.x; if (Math.abs(d) > 3) { PET.dir = Math.sign(d) || PET.dir; PET.x += Math.sign(d) * Math.min(Math.abs(d), vel * dt); return false; } return true; };
    if (e === 'comendo') {
      PET.tEstado += dt;
      if (PET.tEstado > 1.9) {
        const v = PET.visita; PET.visita = null; if (v) petConsumir(v);
        PET.alvo = null; PET.estado = 'parado'; PET.tEstado = 0; PET.espera = 5 + Math.random() * 6; PET.visitaEm = agora + 20000 + Math.random() * 20000; petFalar('♥', .9);
        if (v === 'comida' && PET.cocos.length < 3) PET.cocoEm = agora + 7000 + Math.random() * 7000;
      }
    } else if (e === 'latindo') {
      PET.tEstado += dt; PET.pulo = Math.max(0, 1 - PET.tEstado / .9);
      if (PET.tEstado > .95) { PET.estado = 'parado'; PET.tEstado = 0; PET.pulo = 0; PET.espera = 4; }
    } else if (e === 'coco') {
      PET.tEstado += dt;
      if (PET.tEstado > 1.5) {
        PET.cocos.push({ id: ++PET.id, x: PET.x - PET.dir * larg * .36, el: null });
        PET.estado = 'parado'; PET.tEstado = 0; PET.espera = 5; petFalar('Ufa!', 1);
      }
    } else if (e === 'banho') {
      PET.tEstado += dt; PET.bolhaT -= dt;
      if (PET.bolhaT <= 0) { PET.bolhaT = .11; petFx(cena, 'pet-bolha', PET.x + (Math.random() - .5) * larg * .8, 26 + Math.random() * 46, (Math.random() - .5) * 24, 8 + Math.random() * 12); }
      if (PET.tEstado > 3.6) { PET.estado = 'sacode'; PET.tEstado = 0; }
    } else if (e === 'sacode') {
      PET.tEstado += dt; PET.bolhaT -= dt;
      if (PET.bolhaT <= 0) { PET.bolhaT = .05; const lado = Math.random() < .5 ? -1 : 1; petFx(cena, 'pet-gota', PET.x + lado * larg * .3, 40 + Math.random() * 30, lado * (30 + Math.random() * 40), 5); }
      if (PET.tEstado > 1.1) { PET.estado = 'parado'; PET.tEstado = 0; PET.espera = 6; petFalar('Cheiroso! ✨', 1.6); }
    } else if (PET.bola || PET.fila === 'brincar') {
      PET.alvo = null; PET.estado = 'brincando';
      if (!PET.bola) { PET.fila = ''; PET.bola = { x: Math.max(40, Math.min(L - 40, PET.x + PET.dir * larg * .7)), h: 0, vy: 0, vx: 0, rot: 0, cd: 0, chutes: 0, tempo: 0, el: null }; }
      const b = PET.bola, dx = b.x - PET.x;
      if (Math.abs(dx) > 8) PET.dir = Math.sign(dx);
      PET.x += Math.sign(dx) * Math.min(Math.abs(dx), 160 * dt);
      if (Math.abs(dx) < larg * .45 && b.cd <= 0 && b.chutes < 6) {
        // chuta para o lado de lá (ou para o outro, se a parede estiver perto)
        let lado = Math.sign(dx) || PET.dir; if ((lado > 0 && L - b.x < 110) || (lado < 0 && b.x < 110)) lado = -lado;
        b.vx = lado * (300 + Math.random() * 120); b.vy = 230; b.cd = .5; b.chutes++; PET.dir = lado;
      }
      if ((b.chutes >= 6 && Math.abs(b.vx) < 40 && b.h === 0 && Math.abs(dx) < larg * .5) || b.tempo > 22) {
        if (b.el) b.el.remove(); PET.bola = null; PET.estado = 'sentado'; PET.espera = 3; PET.rel = 0; petFalar('Que divertido!', 1.6);
      }
    } else if (PET.fila === 'banho') {
      PET.alvo = null;
      if (andarAte(L * .5, 110)) { PET.fila = ''; PET.estado = 'banho'; PET.tEstado = 0; PET.rel = 0; PET.dir = 1; } else PET.estado = 'andando';
    } else {
      if (!PET.visita && agora > PET.visitaEm && (PET.estado === 'parado' || PET.estado === 'sentado')) {
        PET.visitaEm = agora + 20000 + Math.random() * 20000;
        const ks = Object.keys(PET_POTES).filter((k) => petNivel(k) > .05 && petNivel(k) < .97);
        if (ks.length) PET.visita = ks[Math.floor(Math.random() * ks.length)];
        else if (agora > PET.avisoEm) { const vz = Object.keys(PET_POTES).find((k) => petNivel(k) <= .05); if (vz) { PET.avisoEm = agora + 30000; petFalar(PET_POTES[vz].fome, 1.6); } }
      }
      const bx = PET.visita ? petPoteX(cena, PET.visita) : null;
      if (bx !== null) {
        PET.alvo = true; PET.dir = bx >= PET.x ? 1 : -1;
        const meta = Math.max(larg / 2, Math.min(L - larg / 2, bx - PET.dir * larg * .4)), d = meta - PET.x;
        if (Math.abs(d) > 3) { PET.estado = 'andando'; PET.x += Math.sign(d) * Math.min(Math.abs(d), 96 * dt); }
        else { PET.estado = 'comendo'; PET.tEstado = 0; PET.rel = 0; }
      } else {
        PET.alvo = null;
        if (PET.estado === 'andando') { PET.estado = 'parado'; PET.espera = 5 + Math.random() * 5; }
        PET.espera -= dt;
        if (PET.cocoEm && agora > PET.cocoEm && (PET.estado === 'parado' || PET.estado === 'sentado')) { PET.estado = 'coco'; PET.tEstado = 0; PET.cocoEm = 0; PET.rel = 0; }
        else if (PET.estado === 'parado' && PET.espera <= 0 && !reduz) { PET.estado = 'sentado'; PET.espera = 3 + Math.random() * 3; }
        else if (PET.estado === 'sentado' && PET.espera <= 0) { PET.estado = 'parado'; PET.espera = 7 + Math.random() * 7; }
      }
    }
    // desenho
    const cao = cena.querySelector('.pet-cao'), balao = cena.querySelector('.pet-balao');
    if (!cao) return;
    PET.rel += dt;
    const est = PET.estado, fps = reduz && est === 'parado' ? 0 : PET_FPS[est], q = est === 'coco' ? 1 : fps ? Math.floor(PET.rel * fps) % 4 : 0;
    const def = petDef(), ew = def.CW * PET.ESC, eh = def.CH * PET.ESC, tremor = est === 'sacode' ? Math.sin(PET.rel * 70) * 4 : 0;
    cao.style.cssText = `background-image:url('${def.arq}');width:${ew}px;height:${eh}px;background-size:${ew * 4}px ${eh * 4}px;background-position:${-q * ew}px ${-PET_LINHA[est] * eh}px;transform:translate(${PET.x - ew / 2 + tremor}px, ${-Math.round(Math.sin(PET.pulo * Math.PI * 3) * 10 * PET.pulo)}px) scaleX(${PET.dir})`;
    if (balao) {
      const fala = agora < PET.falaAte;
      balao.hidden = !fala;
      if (fala) {
        if (balao.textContent !== PET.fala) balao.textContent = PET.fala;
        const bw = balao.offsetWidth, bx = Math.max(6, Math.min(L - bw - 6, PET.x - 28));
        balao.style.transform = `translate(${bx}px, 0)`; balao.style.setProperty('--seta', Math.max(12, Math.min(bw - 22, PET.x - bx - 4)) + 'px');
      }
    }
    const dica = cena.querySelector('.pet-dica'); if (dica && PET.interagiu) dica.classList.add('some');
  }
  requestAnimationFrame(petQuadro);
  document.addEventListener('click', (e) => {
    const cena = e.target.closest && e.target.closest('#pet-cena');
    if (!cena) return;
    const painel = cena.querySelector('.pet-config');
    if (painel && !painel.hidden && !e.target.closest('.pet-config-card, [data-act="pet-config"]')) { painel.hidden = true; UI.petConfig = false; return; }
    if (e.target.closest('.pet-balao')) { PET.falaAte = 0; const bl = cena.querySelector('.pet-balao'); if (bl) bl.hidden = true; return; }
    const coco = e.target.closest('.pet-coco');
    if (coco) { const c = PET.cocos.find((x) => x.el === coco); if (c) petLimpar(c, coco, cena); return; }
    if (e.target.closest('button, [data-act]')) return;
    if (e.target.closest('.pet-cao')) return petLatir();
    if (e.target.closest('.pc-casinha')) return abrirModal({ tipo: 'pet-nome' });
    petBolaEm(e.clientX - cena.getBoundingClientRect().left, cena);
  });
  Object.values(PET_TIPOS).forEach((d) => { const folha = new Image(); folha.src = d.arq; });

  /* ---------------- onboarding ----------------
     Cinco passos curtos para quem chega: nome, o que dá para guardar, aparência, atalhos e o primeiro registro.
     Fica guardado como visto no navegador; dá para rever pelo menu da foto de perfil. */
  const onboardingVisto = () => { try { return !!localStorage.getItem(CHAVE_ONB); } catch (e) { return true; } };
  function marcarOnboardingVisto() { try { localStorage.setItem(CHAVE_ONB, '1'); } catch (e) { /* ignora */ } }
  const ONB_PASSOS = 5;
  function abrirOnboarding() { UI.onb = { passo: 0, entra: true }; abrirModal({ tipo: 'onboarding' }); }
  function onboardingHTML() {
    const o = UI.onb || (UI.onb = { passo: 0, entra: true }), n = o.passo, p = S.perfil;
    const primeiro = (p.nome && p.nome !== 'Meu Nome') ? p.nome.split(' ')[0] : '';
    const tiles = [['journal-page', 'Notas', 'Ideias e textos soltos, em post-its ou listas.'], ['list', 'Tarefas', 'O que precisa ser feito, com prazo e quadro.'],
      ['media-image', 'Imagens', 'Referências em grade, coladas ou por link.'], ['link', 'Links', 'Páginas para ler depois, com prévia.'],
      ['book', 'Livros e filmes', 'Sua estante, com progresso e anotações.'], ['ytmusic', 'Músicas', 'Playlists do YouTube num mini player.'],
      ['shopping-bag', 'Desejos', 'Produtos com preço acompanhado.'], ['folder', 'Estudos', 'Artigos e PDFs com anotações.']];
    const tecla = (...t) => `<span class="teclas">${t.map((x) => `<kbd>${x}</kbd>`).join('<span class="mais">+</span>')}</span>`;
    const corpo = [
      () => `<span class="onb-icone">${ic('home-simple')}</span>
        <h2 id="onb-tit">Oi! Este é o seu espaço.</h2>
        <p class="onb-sub">Um lugar só seu para guardar o que importa e encontrar depois. Em um minuto você deixa tudo com a sua cara.</p>
        <div class="campo onb-nome"><label for="onb-nome">Como você quer ser chamado?</label>
          <input type="text" id="onb-nome" autocomplete="given-name" placeholder="Seu nome" value="${esc(primeiro || (conta() && conta().nome ? conta().nome.split(' ')[0] : ''))}"></div>`,
      () => `<span class="onb-icone">${ic('folder')}</span>
        <h2 id="onb-tit">O que cabe aqui</h2>
        <p class="onb-sub">Cada coisa tem seu lugar no menu da esquerda. Você começa por onde fizer sentido.</p>
        <div class="onb-tiles">${tiles.map(([i, t, d]) => `<div class="onb-tile"><span class="onb-tile-ico">${ic(i)}</span><strong>${t}</strong><span>${d}</span></div>`).join('')}</div>`,
      () => `<span class="onb-icone">${ic('palette')}</span>
        <h2 id="onb-tit">Do seu jeito</h2>
        <p class="onb-sub">Escolha a cor e a aparência. Dá para mudar quando quiser, no menu da sua foto.</p>
        <div class="onb-grupo"><span class="rotulo">Cor</span><div class="onb-temas">${TEMAS.filter(([v]) => v !== 'lilas').map(([v, nm, c]) =>
          `<button type="button" class="tema-op" data-act="onb-tema" data-v="${v}" aria-pressed="${p.tema === v && !p.corCustom}"><span class="amostra" style="background:${c}"></span>${nm}</button>`).join('')}</div></div>
        <div class="onb-grupo"><span class="rotulo">Aparência</span><span class="segmento" role="group" aria-label="Aparência">
          ${[['claro', 'Claro'], ['escuro', 'Escuro'], ['sistema', 'Automática']].map(([v, nm]) => `<button type="button" data-act="onb-modo" data-v="${v}" aria-pressed="${(p.modo || 'sistema') === v}">${nm}</button>`).join('')}</span></div>`,
      () => `<span class="onb-icone">${ic('search')}</span>
        <h2 id="onb-tit">Atalhos que poupam tempo</h2>
        <p class="onb-sub">Três que valem a pena decorar.</p>
        <div class="onb-atalhos">
          <div class="onb-atalho">${tecla('Ctrl', 'V')}<span><strong>Cole uma imagem</strong>Ela é guardada na hora, sem abrir janela.</span></div>
          <div class="onb-atalho">${tecla('Ctrl', 'K')}<span><strong>Busque em tudo</strong>Notas, links, livros, imagens e o resto.</span></div>
          <div class="onb-atalho">${tecla('Shift', 'Espaço')}<span><strong>Modo trabalho</strong>Suas tarefas em quadro, por cima de tudo.</span></div></div>`,
      () => `<span class="onb-icone ok">${ic('check-circle-solid')}</span>
        <h2 id="onb-tit">${primeiro ? 'Tudo pronto, ' + esc(primeiro) + '.' : 'Tudo pronto.'}</h2>
        <p class="onb-sub">Que tal guardar a primeira coisa agora? Escolha uma:</p>
        <div class="onb-primeiro">${[['nota', 'Uma nota', 'journal-page'], ['tarefa', 'Uma tarefa', 'list'], ['imagem', 'Uma imagem', 'media-image'], ['link', 'Um link', 'link']].map(([t, nm, i], k) =>
          `<button type="button" class="${k === 0 ? 'btn-1' : 'btn-2'}" data-act="onb-criar" data-t="${t}">${ic(i)}${nm}</button>`).join('')}</div>
        <p class="meta onb-rodape-dica">No Início fica uma listinha “Para começar” com outras ideias; ela risca sozinha. Prefere explorar? O menu da esquerda leva a cada área.</p>`
    ][n]();
    const ultimo = n === ONB_PASSOS - 1;
    return `<div class="modal modal-onb" role="document" aria-labelledby="onb-tit">
      <div class="onb-topo"><span class="onb-contagem">Passo ${n + 1} de ${ONB_PASSOS}</span>
        ${ultimo ? '' : `<button type="button" class="btn-txt" data-act="onb-pular">Pular</button>`}</div>
      <div class="onb-barra" role="progressbar" aria-valuemin="1" aria-valuemax="${ONB_PASSOS}" aria-valuenow="${n + 1}">${Array.from({ length: ONB_PASSOS }, (_, k) => `<i class="${k <= n ? 'on' : ''}"></i>`).join('')}</div>
      <div class="onb-corpo ${o.entra ? 'entra' : ''}">${corpo}</div>
      <footer class="modal-pe">${n > 0 ? btn('onb-voltar', 'Voltar', '', 'btn-f') : ''}<span class="espaco"></span>
        ${ultimo ? btn('onb-fim', 'Explorar sozinho', '', 'btn-f') : `<button class="btn-1" type="button" data-act="onb-prox">${n === 0 ? 'Começar' : 'Continuar'}${ic('nav-arrow-right')}</button>`}</footer></div>`;
  }
  /** Passo 1 guarda o nome; os demais já salvam na hora em que a pessoa escolhe. */
  function onboardingSalvaNome() {
    const campoN = document.getElementById('onb-nome');
    if (campoN && campoN.value.trim()) { S.perfil.nome = campoN.value.trim().slice(0, 40); salvar(); renderTopo(); }
  }
  function encerrarOnboarding() {
    marcarOnboardingVisto(); marcarNovidadesVistas(); UI.onb = null; UI.colPadrao = null; UI.modal = null; UI.pularColheita = true; render();
  }

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

  /* ---------------- posts ---------------- */
  function acoesPost(i, opts = {}) {
    const b = [btnAlterna('fav', i.id, i.favorito, 'star', 'Favorito', 'Favoritar', 'estrela')];
    const mais = [];
    if (i.tipo === 'link' || i.tipo === 'artigo') {
      b.push(btnAlterna('ler-depois', i.id, i.lerDepois, 'bookmark', 'Na fila de leitura', 'Ler mais tarde'));
      b.push(btnAlterna('lido', i.id, i.lido, 'check-circle', 'Lido', 'Marcar como lido'));
    }
    if (i.tipo === 'tarefa') {
      b.push(btnAlterna('tar-ok', i.id, i.concluida, 'check-circle', 'Feita', 'Marcar como feita'));
      if (!i.concluida) b.push(btnAlterna('tar-fazendo', i.id, etapa(i) === 'fazendo', 'clock', 'Fazendo agora', 'Marcar como fazendo'));
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
    if (i.tipo === 'imagem') mais.push({ act: 'imagem-grupo', id: i.id, ico: 'folder', txt: 'Mover para grupo' });
    if (i.tipo === 'nota' || i.tipo === 'link' || i.tipo === 'tarefa' || i.tipo === 'imagem') mais.push({ act: 'organizar-em', id: i.id, ico: 'folder', txt: 'Mover para coleção' });
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
        <textarea name="texto" required rows="2" placeholder="Comentar de novo…"></textarea>
        <button class="btn-1 btn-p" type="submit">Enviar</button></form></div>`;
  }

  function corpoPost(i) {
    if (i.tipo === 'nota') {
      const cab = i.titulo ? `<h3>${esc(i.titulo)}</h3>` : '';
      if (i.modo === 'lista') return `<div class="postit ${corNota(i)} abre" data-act="ver-item" data-id="${i.id}" role="button" tabindex="0">${cab}${listaCheckHTML(i)}</div>`;
      return `<div class="postit ${corNota(i)} abre" data-act="ver-item" data-id="${i.id}" role="button" tabindex="0">${cab}
        <p>${esc(corta(i.texto, 420))}</p></div>`;
    }
    if (i.tipo === 'tarefa') return linhaTarefa(i);
    if (i.tipo === 'imagem') return `<div class="imagem-post"><button type="button" class="pin-img" data-act="imagem-ver" data-id="${i.id}" aria-label="Ver ${esc(tituloItem(i))}">${imgPin(i)}</button>
        ${i.titulo ? `<h3>${esc(i.titulo)}</h3>` : ''}${i.nota ? `<p class="descricao">${esc(corta(i.nota, 220))}</p>` : ''}
        ${i.origem ? `<p class="fonte">${ic('link')}<a href="${esc(i.origem)}" target="_blank" rel="noopener">${esc(dominio(i.origem))}</a></p>` : ''}</div>`;
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
          ${(i.resumo || i.comentario) ? `<p class="midia-resumo">${esc(corta(i.resumo || i.comentario, 220))}</p>` : ''}</div></div>`;
    }
    if (i.tipo === 'artigo') {
      const p = pasta(i.pastaId);
      return `<div class="artigo"><span class="tipo ${i.ehPdf ? 'pdf' : ''}">${ic(i.ehPdf ? 'page' : 'link')}</span>
        <div class="link-dados"><h3><a href="#" data-act="abrir-artigo" data-id="${i.id}">${esc(tituloItem(i))}</a></h3>
          <p class="fonte">${ic('shop')}${esc(dominio(i.url))}${p ? ' · ' + esc(p.nome) : ''}${i.ehPdf ? ' · PDF' : ''}</p>
          ${i.descricao ? `<p class="descricao">${esc(i.descricao)}</p>` : ''}</div></div>`;
    }
    if (i.tipo === 'desejo') {
      const h = i.historicoPreco || [], dif = h.length >= 2 ? i.preco - h[h.length - 2].preco : 0;
      return `<div class="desejo-ticket ${i.comprado ? 'comprado' : ''}">
        <a class="dt-foto" href="#/item/${i.id}" tabindex="-1" aria-hidden="true">${fotoProduto(i)}</a>
        <div class="dt-info"><h3><a href="#/item/${i.id}">${esc(tituloItem(i))}</a></h3>
          <p class="fonte">${ic('shop')}${esc(i.loja || dominio(i.url))}</p>
          ${estrelasHTML(i.estrelas, i.avaliacoes ? '(' + i.avaliacoes + ')' : '')}
          ${i.comprado ? '<p class="tag">Comprado</p>' : ''}
          ${i.comentario ? `<p class="porque">${esc(i.comentario)}</p>` : ''}</div>
        <span class="dt-corte" aria-hidden="true"><i></i><hr><i></i></span>
        <div class="dt-preco">${i.preco === null || i.preco === undefined ? precoHTML(i)
          : `<span class="preco">${brl(i.preco, i.moeda)}</span>${dif ? `<span class="var-preco ${dif < 0 ? 'caiu' : 'subiu'}">${dif < 0 ? '↓' : '↑'} ${brl(Math.abs(dif), i.moeda)}</span>` : ''}`}</div></div>`;
    }
    if (i.tipo === 'musica') {
      const capa = capaYT(i);
      return `<div class="musica-linha">
        <button type="button" class="musica-capa p" data-act="tocar" data-id="${i.id}" aria-label="Tocar ${esc(tituloItem(i))}">
          ${capa ? `<img src="${esc(capa)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : `<span class="capa-ph">${ic('playlist')}</span>`}
          <span class="play">${ic(UI.tocando === i.id ? 'pause' : 'play-solid')}</span></button>
        <div class="midia-dados"><h3><a href="#/item/${i.id}">${esc(tituloItem(i))}</a></h3>
          <p class="meta">${[i.artista, i.listaYT && !i.video ? 'playlist' : ''].filter(Boolean).map(esc).join(' · ') || 'YouTube'}</p></div></div>`;
    }
    if (i.tipo !== 'gasto') return `<p class="meta">${esc(tituloItem(i))}</p>`;
    return `<div class="gasto-linha"><span class="circulo ok">${ic('wallet')}</span>
      <span><strong class="post-tit" style="font-size:15.5px">${esc(i.descricao || 'Gasto')}</strong>
        <span class="meta" style="display:block">${[i.categoria, 'despesa de ' + fmtDiaCurto(i.dataGasto)].filter(Boolean).map(esc).join(' · ')}</span></span>
      <span class="valor">${brl(i.valor)}</span></div>`;
  }

  function eventoPostHTML(i, opts = {}) {
    const e = i.ev, n = diasAte(e.data), d = deDia(e.data), quando = opts.hora ? fmtHora(e.criadoEm) : fmtDataHora(e.criadoEm);
    const dow = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''), mes = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    return `<article class="post post-evento" data-ev="${e.id}">
      <button type="button" class="ev-ticket ${n < 0 ? 'passou' : ''}" data-act="ev-ver" data-id="${e.id}" aria-label="Abrir o evento ${esc(e.titulo)}">
        <span class="evt-foto"><img src="${e.foto}" alt="" loading="lazy"></span>
        <span class="evt-info"><span class="evt-selo">${ic('calendar')}Evento<time>${quando}</time></span>
          <strong>${esc(e.titulo)}</strong>${e.nota ? `<small>${esc(e.nota)}</small>` : ''}
          <em>${e.hora ? esc(e.hora) + ' · ' : ''}${n >= 0 ? quandoEvento(n) : 'já passou'}</em></span>
        <span class="evt-corte" aria-hidden="true"><i></i><hr><i></i></span>
        <span class="evt-data"><small>${esc(dow)}</small><b>${d.getDate()}</b><small>${esc(mes)}</small></span></button></article>`;
  }
  function postHTML(i, opts = {}) {
    if (i.tipo === 'evento' && i.ev) return eventoPostHTML(i, opts);
    const cols = (i.colecoes || []).map((c) => (colecao(c.id) || {}).nome).filter(Boolean);
    const quando = ehImportado(i) ? 'importado' : (opts.hora ? fmtHora(i.criadoEm) : fmtDataHora(i.criadoEm));
    return `<article class="post post-${i.tipo}" data-id="${i.id}">
      <header class="post-cab"><span class="selo">${ic(icoTipo(i))}${nomeTipo(i)}</span>
        ${cols.length ? `<span>em ${esc(cols.join(', '))}</span>` : ''}${i.organizar ? '<span>a organizar</span>' : ''}
        <time>${quando}</time></header>
      ${corpoPost(i)}${comentariosHTML(i)}${acoesPost(i, opts)}</article>`;
  }

  /* ---------------- topo, navegação e coluna direita ---------------- */
  /** Disco ao lado do perfil: atalho para as músicas, girando quando há algo tocando. */
  function renderDisco() {
    if (!topoMusica) return;
    const i = UI.tocando && item(UI.tocando);
    const rotulo = i ? 'Tocando: ' + tituloItem(i) + ' · abrir músicas' : 'Abrir músicas';
    topoMusica.innerHTML = `<button type="button" class="ico-btn btn-musica ${i ? 'ativo' : ''}" data-act="abrir-musica" title="${esc(rotulo)}" aria-label="${esc(rotulo)}">${ic('ytmusic')}</button>`;
  }
  function renderTopo() {
    const p = S.perfil, h = p.humores[hoje()] || {};
    // Os 4 últimos emojis usados (mais recente primeiro); se houver menos de 4, completa com sugestões.
    const recentes = [];
    Object.entries(p.humores).sort((a, b) => b[0].localeCompare(a[0])).forEach(([, x]) => { if (x.emoji && !recentes.includes(x.emoji) && recentes.length < 4) recentes.push(x.emoji); });
    EMOJIS.forEach((e) => { if (recentes.length < 4 && !recentes.includes(e)) recentes.push(e); });
    const curtos = recentes;
    topoPerfil.innerHTML = `<details class="menu menu-perfil"><summary aria-label="Perfil e configurações">
        ${avatarHTML()}<span class="mp-texto"><strong>${esc(p.nome === 'Meu Nome' ? p.nome : p.nome.split(' ')[0])}</strong><span>${h.emoji || h.texto ? esc(h.emoji || '') + ' ' + esc(h.texto || '') : 'como estou hoje?'}</span></span>${ic('nav-arrow-down')}</summary>
      <div class="menu-corpo">
        <form class="humor-rapido" data-form="humor-rapido">
          <span class="rotulo">Como estou hoje</span>
          <div class="emojis">${curtos.map((e) => `<button type="button" class="emoji-op" data-act="humor-emoji" data-v="${e}" aria-pressed="${h.emoji === e}" aria-label="Humor ${e}">${e}</button>`).join('')}
            <input type="text" name="humorEmoji" class="emoji-campo" value="${esc(h.emoji || '')}" placeholder="+" maxlength="16" autocomplete="off" inputmode="text" aria-label="Escolher outro emoji" title="Digite ou cole qualquer emoji (no Windows: tecla Windows + ponto)"></div>
          <div class="humor-linha">
            <input type="text" name="humorTexto" value="${esc(h.texto || '')}" placeholder="em uma palavra: focado, tranquilo…" aria-label="Como estou hoje">
            <button class="btn-1 btn-p" type="submit" aria-label="Salvar humor">${ic('check')}</button></div>
        </form>
        <hr>
        <div class="mp-grupo" role="group" aria-label="Conta">
          <a href="#/perfil">${ic('user')}<span>Editar perfil</span></a>
          <a href="#/config">${ic('settings')}<span>Configurações e backup</span></a></div>
        <hr>
        <div class="mp-grupo" role="group" aria-label="Ajuda">
          <button type="button" data-act="onboarding">${ic('home-simple')}<span>Primeiros passos</span></button>
          <button type="button" data-act="novidades">${ic('page-star')}<span>O que há de novo</span>${temNovidade() ? '<em class="novid-selo">novo</em>' : ''}</button></div>
        ${podeInstalar() ? `<hr><div class="mp-grupo" role="group" aria-label="App">
          <button type="button" data-act="pwa-instalar">${ic('download')}<span>Instalar o app</span></button></div>` : ''}
        <hr>
        <div class="menu-modo"><span class="mp-titulo">${ic(modoAtual() === 'escuro' ? 'half-moon' : 'sun-light')}Aparência</span>
          <span class="segmento pequeno" role="group" aria-label="Aparência">
            ${[['claro', 'Claro'], ['escuro', 'Escuro'], ['sistema', 'Sistema']].map(([v, n]) =>
              `<button type="button" data-act="modo" data-v="${v}" aria-pressed="${(p.modo || 'sistema') === v}">${n}</button>`).join('')}</span></div>
        ${logado() ? `<hr><div class="mp-grupo"><button type="button" class="mp-sair" data-act="sair"><span>Sair</span></button></div>` : ''}
      </div></details>`;
  }
  /* Teclado no menu do perfil: setas entre os itens, Home/End, Esc fecha e devolve o foco. */
  document.addEventListener('keydown', (e) => {
    const m = document.querySelector('.menu-perfil[open]');
    const sum = document.querySelector('.menu-perfil > summary');
    if (!m) return;
    if (e.key === 'Escape') { m.removeAttribute('open'); if (sum) sum.focus(); e.stopPropagation(); return; }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    if (e.target.closest && e.target.closest('.humor-rapido') && !['ArrowDown'].includes(e.key)) return;
    const itens = [...m.querySelectorAll('.mp-grupo a, .mp-grupo button, .menu-modo .segmento button')].filter((x) => x.offsetParent);
    if (!itens.length) return;
    e.preventDefault();
    const k = itens.indexOf(document.activeElement);
    const alvo = e.key === 'Home' ? 0 : e.key === 'End' ? itens.length - 1 : e.key === 'ArrowDown' ? (k + 1) % itens.length : (k <= 0 ? itens.length - 1 : k - 1);
    itens[alvo].focus();
  }, true);
  document.addEventListener('keydown', (e) => {
    const sum = document.querySelector('.menu-perfil:not([open]) > summary');
    if (sum && e.target === sum && e.key === 'ArrowDown') { e.preventDefault(); sum.parentElement.setAttribute('open', ''); const p1 = sum.parentElement.querySelector('.mp-grupo a, .mp-grupo button'); if (p1) p1.focus(); }
  });
  /* A ordem das áreas fica no perfil: arrastar muda, e áreas novas entram no fim. */
  /* A barra tem 8 áreas. Agenda e Biblioteca reúnem várias páginas, que aparecem como abas no alto da tela. */
  const GRUPO_DE = { agenda: 'agenda', tarefas: 'agenda', lembretes: 'agenda', biblioteca: 'biblioteca', links: 'biblioteca', imagens: 'biblioteca', estudos: 'biblioteca' };
  const ABAS = { agenda: ['agenda', 'tarefas', 'lembretes'], biblioteca: ['biblioteca', 'links', 'imagens', 'estudos'] };
  const ABA_NOME = { agenda: 'Calendário', tarefas: 'Tarefas', lembretes: 'Lembretes', biblioteca: 'Livros e filmes', links: 'Links', imagens: 'Imagens', estudos: 'Estudos' };
  const ABA_QTD = () => ({ agenda: '', tarefas: tarefasAbertas().length, lembretes: pendentes().length, biblioteca: doTipo('midia').length,
    links: doTipo('link').length, imagens: doTipo('imagem').length, estudos: doTipo('artigo').length });
  const AREAS = () => [['inicio', 'Início', 'home-simple', ''], ['agenda', 'Agenda', 'calendar', tarefasAbertas().length + pendentes().length],
    ['mural', 'Mural', 'journal-page', doTipo('nota').length], ['musicas', 'Músicas', 'ytmusic', musicas().length],
    ['biblioteca', 'Biblioteca', 'book-stack', doTipo('midia').length + doTipo('link').length + doTipo('imagem').length + doTipo('artigo').length],
    ['wishlist', 'Wishlist', 'shopping-bag', doTipo('desejo').filter((i) => !i.comprado).length],
    ['gastos', 'Gastos', 'wallet', ''], ['curriculo', 'Currículo', 'suitcase', '']];
  /** A ordem das abas de cada área fica no perfil (arrastar muda; abas novas entram no fim). */
  function abasOrdenadas(g) {
    const salva = ((S.perfil.ordemAbas || {})[g] || []).filter((r) => ABAS[g].includes(r));
    return salva.concat(ABAS[g].filter((r) => !salva.includes(r)));
  }
  /** Abas no alto das páginas que fazem parte de Agenda ou Biblioteca. */
  function abasPagina(rota) {
    const g = GRUPO_DE[rota]; if (!g) return;
    const q = ABA_QTD();
    const cabPag = main.querySelector('.pagina-cab');
    const abasHTML = (`<nav class="abas-pag" aria-label="${g === 'agenda' ? 'Agenda' : 'Biblioteca'}" title="Arraste uma aba para reordenar">${abasOrdenadas(g).map((r) =>
      `<a href="#/${r}" draggable="false" data-ordena="abas" data-oid="${r}" ${r === rota ? 'aria-current="page"' : ''}>${ABA_NOME[r]}${q[r] !== '' && q[r] ? `<em>${q[r]}</em>` : ''}</a>`).join('')}</nav>`);
    if (cabPag) cabPag.insertAdjacentHTML('afterend', abasHTML); else main.insertAdjacentHTML('afterbegin', abasHTML);
  }
  function areasOrdenadas() {
    const todas = AREAS();
    const salva = S.perfil.ordemNav || [], guardada = salva.every((r) => todas.some((a) => a[0] === r)) ? salva : [];   // ordem de antes da Agenda: recomeça do padrão
    const ordem = guardada.concat(todas.map((a) => a[0]).filter((r) => !guardada.includes(r)));
    return ordem.map((r) => todas.find((a) => a[0] === r));
  }
  function renderNav(rota) {
    const nv = vencidos().length;
    navLateral.innerHTML = `<h2 class="sr-only">Navegação</h2>
      <div class="nav-areas">${areasOrdenadas().map(([r, n, icone, q]) => `<a href="#/${r}" draggable="false" data-ordena="areas" data-oid="${r}" data-area="${r}" ${(GRUPO_DE[rota] || rota) === r ? 'aria-current="page"' : ''}>${icAtivo(icone, (GRUPO_DE[rota] || rota) === r)}<span>${n}</span>${q ? `<em class="pino ${r === 'agenda' && nv ? 'alerta' : ''}">${q}</em>` : ''}</a>`).join('')}</div>
      <p class="nav-sep">Coleções</p>
      ${S.colecoes.map((c) => `<a class="sub" href="#/colecao/${c.id}" ${rota === 'colecao' && rotaAtual()[1] === c.id ? 'aria-current="true"' : ''}><span>${esc(c.nome)}</span><em class="pino">${S.itens.filter((i) => i.colecoes.some((x) => x.id === c.id)).length}</em></a>`).join('')}
      <a class="sub" href="#/colecao/soltos" ${rota === 'colecao' && rotaAtual()[1] === 'soltos' ? 'aria-current="true"' : ''}><span>A organizar</span><em class="pino ${S.itens.some((i) => !i.colecoes.length) ? 'destaque' : ''}">${S.itens.filter((i) => !i.colecoes.length).length}</em></a>
      <a class="sub" href="#" data-act="nova-colecao"><span>${ic('plus')} Nova coleção</span></a>`;
  }
  /* ---------------- coluna da direita ----------------
     Cada bloco tem um id; a ordem fica no perfil e pode ser mudada arrastando. */
  const BLOCOS_DIR = ['clima', 'eventos', 'tarefas', 'lembretes', 'lendo', 'vitrine', 'fila', 'favoritos'];
  const ordemDireita = () => {
    const g = (S.perfil.ordemDireita || []).filter((x) => BLOCOS_DIR.includes(x));
    const base = (g.includes('clima') ? [] : ['clima']).concat(g, BLOCOS_DIR.filter((x) => !g.includes(x) && x !== 'clima' && x !== 'eventos'));
    if (!base.includes('eventos')) base.splice(base.indexOf('clima') + 1, 0, 'eventos');   // quem já tinha uma ordem vê os eventos logo abaixo do clima
    return base;
  };
  /** Widget do Início: contagem regressiva (evento marcado) e os próximos eventos. */
  const diasAte = (d) => Math.round((deDia(d) - deDia(hoje())) / 864e5);
  const quandoEvento = (n) => n === 0 ? 'hoje' : n === 1 ? 'amanhã' : 'em ' + n + ' dias';
  function eventosHTML() {
    const prox = (S.eventos || []).filter((e) => e.data >= hoje()).sort((a, b) => (a.data + (a.hora || '')).localeCompare(b.data + (b.hora || '')));
    const dest = prox.find((e) => e.contagem);
    const lista = prox.filter((e) => e !== dest).slice(0, dest ? 3 : 4);
    const corpo = !prox.length ? `<p class="meta">Nada marcado por vir. <a href="#/agenda">Abrir a agenda</a></p>` : `
      ${dest ? `<button type="button" class="contagem" data-act="ev-ver" data-id="${dest.id}"><b>${diasAte(dest.data) === 0 ? 'Hoje' : diasAte(dest.data)}</b>
        <span>${diasAte(dest.data) === 0 ? '' : diasAte(dest.data) === 1 ? 'dia para' : 'dias para'}<strong>${esc(dest.titulo)}</strong></span></button>` : ''}
      <div class="mini-lista">${lista.map((e) => `<button type="button" class="mini-item" data-act="ev-ver" data-id="${e.id}">
        <span class="mini-txt">${esc(e.titulo)}</span><span class="meta num">${quandoEvento(diasAte(e.data))}${e.hora ? ' · ' + esc(e.hora) : ''}</span></button>`).join('')}</div>`;
    return cartao(ic('calendar') + 'Próximos eventos', corpo, '<a href="#/agenda">ver todas</a>', 'fino');
  }
  function renderDireita(rota) {
    if (rota !== 'inicio') { direita.innerHTML = ''; direita.hidden = true; layout.classList.add('sem-direita'); return; }
    direita.hidden = false; layout.classList.remove('sem-direita');
    const blocos = { clima: climaHTML() };

    blocos.eventos = eventosHTML();

    const abertas = tarefasAbertas();
    const feitasHoje = tarefas().filter((i) => i.concluida && dataLocal(i.editadoEm || i.criadoEm) === hoje());
    if (abertas.length || feitasHoje.length) {
      const total = abertas.length + feitasHoje.length;
      const pct = Math.round((feitasHoje.length / total) * 100);
      const proximas = abertas.slice().sort((x, y) => (x.prazo || '9999').localeCompare(y.prazo || '9999')).slice(0, 4);
      const feitas = feitasHoje.slice(0, 3), escondidas = total - proximas.length - feitas.length;
      blocos.tarefas = cartao(ic('list') + 'Tarefas', `<p class="progresso compacto">
          <span class="barra"><i style="width:${pct}%"></i></span><b>${feitasHoje.length}/${total}</b></p>
        <div class="mini-lista">${proximas.map((i) => `<button type="button" class="mini-item" data-act="tarefa-ver" data-id="${i.id}">
          <em class="ponto ${atrasada(i) ? 'vence' : ''}"></em><span class="mini-txt">${esc(i.titulo)}</span>
          ${i.prazo ? `<span class="meta num">${fmtNum(i.prazo)}</span>` : ''}</button>`).join('')}${feitas.map((i) => `<button type="button" class="mini-item feito" data-act="tarefa-ver" data-id="${i.id}">
          <em class="ponto ok"></em><span class="mini-txt">${esc(i.titulo)}</span><span class="meta num">feita</span></button>`).join('')}
          ${escondidas > 0 ? `<a class="meta mais-n" href="#/tarefas">+${escondidas} em Tarefas</a>` : ''}</div>`,
        '<a href="#/tarefas">ver todas</a>', 'fino');
    }
    const pend = pendentes().slice(0, 3);
    if (pend.length) blocos.lembretes = cartao(ic('alarm') + 'Lembretes', `<div class="mini-lista">${pend.map((l) => `<p class="mini-item"><em class="ponto ${venc(l) <= Date.now() ? 'vence' : ''}"></em><span class="mini-txt">${esc(l.texto)}</span><span class="meta num">${fmtNum(l.data)}</span></p>`).join('')}</div>`, '<a href="#/lembretes">ver todas</a>', 'fino');
    const and = doTipo('midia').filter((i) => i.status === 'andamento').slice(0, 4);
    if (and.length) blocos.lendo = cartao(ic('book') + 'Lendo agora', `<div class="mini-capas">${and.map((i) => `<a href="#/item/${i.id}" title="${esc(i.titulo)}">${capaHTML(i, 'p')}</a>`).join('')}</div>`, '<a href="#/biblioteca">ver todas</a>', 'fino');
    const d = doTipo('desejo').filter((i) => !i.comprado).sort((a, x) => x.criadoEm.localeCompare(a.criadoEm))[0];
    if (d) blocos.vitrine = cartao(ic('shopping-bag') + 'Na vitrine', `<a class="vitrine-mini" href="#/item/${d.id}">${fotoProduto(d)}<span><strong>${esc(corta(tituloItem(d), 46))}</strong>${precoHTML(d)}</span></a>`, '<a href="#/wishlist">ver todas</a>', 'fino');
    const fila = S.itens.filter((i) => i.lerDepois && !i.lido).slice(0, 4);
    if (fila.length) blocos.fila = cartao(ic('bookmark-solid') + 'Fila de leitura', `<div class="lista-links">${fila.map((i) => `<a href="${esc(i.url)}" target="_blank" rel="noopener">${ic(icoTipo(i))}<span>${esc(tituloItem(i))}</span></a>`).join('')}</div>`, '', 'fino');
    const favs = ordenados().filter((i) => i.favorito).slice(0, 5);
    if (favs.length) blocos.favoritos = cartao(ic('star-solid') + 'Favoritos', `<div class="lista-links">${favs.map((i) => `<a href="#/item/${i.id}">${ic(icoTipo(i))}<span>${esc(tituloItem(i))}</span></a>`).join('')}</div>`, '', 'fino');

    const vivos = ordemDireita().filter((n) => blocos[n]);
    if (!vivos.length) { direita.innerHTML = cartao('Seu espaço', '<p class="meta">Tarefas, lembretes, leituras, favoritos e a vitrine aparecem aqui conforme você guarda coisas.</p>', '', 'fino'); return; }
    direita.innerHTML = vivos.map((n) => `<div class="bloco-dir" data-ordena="blocos" data-oid="${n}" data-bloco="${n}">
      <span class="pegar" title="Arraste para reordenar" aria-hidden="true">${ic('drag')}</span>${blocos[n]}</div>`).join('');
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
  const CHIPS_PRINCIPAIS = ['nota', 'link', 'tarefa', 'imagem', 'lembrete'];
  const compositor = () => {
    const chip = ([v, n, i]) => `<button type="button" class="tipo-chip" data-act="criar" data-t="${v}">${ic(i)}${n}${temRascunho('criar:' + v) ? ' ·' : ''}</button>`;
    const principais = CHIPS_PRINCIPAIS.map((v) => TIPOS_CRIAR.find((t) => t[0] === v)).filter(Boolean);
    const demais = TIPOS_CRIAR.filter((t) => !CHIPS_PRINCIPAIS.includes(t[0]));
    return `<section class="cartao compositor"><h2>O que você quer guardar?</h2>
      ${principais.map(chip).join('')}${UI.compMais ? demais.map(chip).join('') : ''}
      <button type="button" class="tipo-chip chip-mais" data-act="comp-mais" aria-expanded="${!!UI.compMais}">${UI.compMais ? 'Menos' : 'Mais'}</button></section>`;
  };

  function blocosFeed(lista, opts) {
    const imp = lista.filter(ehImportado);
    const lote = imp.length >= 3 ? imp : [];
    let h = lista.filter((i) => !lote.includes(i)).map((i) => postHTML(i, opts)).join('');
    if (lote.length) h += `<details class="lote"><summary>${ic('import')}<span><strong>${lote.length} links importados</strong> dos arquivos de exemplo</span>${ic('nav-arrow-down', 'seta')}</summary>
      <div class="lista-links">${lote.map((i) => `<a href="${esc(i.url)}" target="_blank" rel="noopener">${i.favicon ? `<img src="${esc(i.favicon)}" alt="" onerror="this.remove()">` : ic('link')}<span>${esc(tituloItem(i))}</span></a>`).join('')}</div>
      <p class="meta" style="margin-top:10px"><a href="#/links">Ver organizados em Links</a></p></details>`;
    return h;
  }
  /** Itens do feed: o que foi guardado e os eventos que têm foto (aparecem no dia em que foram criados). */
  const evFeed = () => (S.eventos || []).filter((e) => e.foto && e.criadoEm && e.criadoEm.length > 8).map((e) => ({ id: e.id, tipo: 'evento', criadoEm: e.criadoEm, ev: e }));
  const ordenadosFeed = () => ordenados().concat(evFeed()).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  function conteudoFeed() {
    const q = norm(UI.busca);
    if (q) {
      const res = ordenados().filter((i) => textoBusca(i).includes(q));
      return `<p class="secao-tit so">${res.length} resultado(s) para “${esc(UI.busca)}” ${btn('busca-limpar', 'limpar', '', 'btn-txt')}</p>`
        + (res.length ? res.map((i) => postHTML(i)).join('') : vazio('search', 'Nada encontrado. Tente outra palavra.'));
    }
    if (UI.feedModo === 'dia') {
      const d = UI.dia, doDia = ordenadosFeed().filter((i) => dataLocal(i.criadoEm) === d), h = S.perfil.humores[d];
      return `<div class="dia-nav">${btnIco('dia', 'nav-arrow-left', 'Dia anterior', 'data-n="-1"')}
          <input type="date" value="${d}" data-act="dia-sel">${btnIco('dia', 'nav-arrow-right', 'Próximo dia', 'data-n="1"')}
          ${btn('dia-hoje', 'Hoje', '', 'btn-2 btn-p')}
          <span class="dia-humor">${rotuloDia(d)} · ${h ? esc(h.emoji || '') + ' ' + esc(h.texto || '') : 'sem humor'} ${btn('humor-dia', h ? 'editar' : 'registrar', '', 'btn-txt')}</span>
          <span class="espaco"></span>${btn('feed-todos', 'Todo o feed', '', 'btn-f btn-p')}</div>
        ${doDia.length ? blocosFeed(doDia, { hora: true }) : vazio('calendar', 'Nenhum registro neste dia.')}`;
    }
    const lista = ordenadosFeed();
    const cab = (extra) => `<div class="secao-tit feed-cab">${btnTxt('feed-dia', 'calendar', extra || 'Por dia')}</div>`;
    if (!lista.length) return cab('') + vazio('journal-page', 'Nada guardado ainda. Comece pelos botões acima.');
    const dias = {};
    lista.forEach((i) => { const d = dataLocal(i.criadoEm); (dias[d] = dias[d] || []).push(i); });
    const ordem = Object.keys(dias).sort().reverse();
    // O primeiro dia entra na mesma linha do título, para não gastar duas linhas com um rótulo só.
    let h = cab(rotuloDia(ordem[0]));
    ordem.forEach((d, n) => { if (n) h += `<p class="secao-tit">${rotuloDia(d)}</p>`; h += blocosFeed(dias[d], { hora: true }); });
    return h;
  }
  /* Listinha "Para começar": aparece no Início de um espaço novo, risca sozinha e some quando acaba ou é dispensada. */
  const PASSOS = () => [
    ['nota', 'Guardar uma nota', () => doTipo('nota').length > 0, 'data-act="criar" data-t="nota"'],
    ['tarefa', 'Criar uma tarefa', () => doTipo('tarefa').length > 0, 'data-act="criar" data-t="tarefa"'],
    ['imagem', 'Colar uma imagem (Ctrl + V)', () => doTipo('imagem').length > 0, 'data-act="criar" data-t="imagem"'],
    ['link', 'Guardar um link', () => doTipo('link').length > 0, 'data-act="criar" data-t="link"'],
    ['foto', 'Pôr uma foto no perfil', () => !!S.perfil.foto, 'data-act="foto-trocar"'],
    ['trabalho', 'Abrir o modo trabalho (Shift + Espaço)', () => !!(S.perfil.passos || {}).trabalho, 'data-act="trabalho"']];
  function primeirosPassosHTML() {
    if (S.perfil.passosFim) return '';
    const l = PASSOS(), feitos = l.filter((x) => x[2]()).length;
    if (feitos === l.length) return '';
    return `<section class="cartao passos" aria-label="Para começar">
      <header><h2>Para começar</h2><span class="meta">${feitos} de ${l.length}</span><span class="espaco"></span>${btn('passos-dispensar', 'Dispensar', '', 'btn-txt')}</header>
      <div class="passos-barra" role="progressbar" aria-valuemin="0" aria-valuemax="${l.length}" aria-valuenow="${feitos}"><i style="width:${Math.round(feitos / l.length * 100)}%"></i></div>
      <ul>${l.map(([k, t, f, a]) => `<li><button type="button" class="${f() ? 'feito' : ''}" ${a}>${ic(f() ? 'check-circle-solid' : 'check-circle')}<span>${t}</span></button></li>`).join('')}</ul></section>`;
  }
  /* ---------------- previsão do tempo ----------------
     Open-Meteo (sem chave, sem cadastro). A cidade fica em perfil.clima; a última resposta é guardada
     por 30 minutos no navegador para não consultar a cada tela. Sem internet, mostra a última guardada. */
  const CLIMA_CHAVE = 'meuEspaco.clima', CLIMA_VALE = 30 * 60e3;
  const CLIMA_COD = (c) => c === 0 ? ['Céu limpo', 'sol'] : c <= 2 ? ['Poucas nuvens', 'solnuvem'] : c === 3 ? ['Nublado', 'nuvem'] : c <= 48 ? ['Neblina', 'nevoa']
    : c <= 57 ? ['Garoa', 'chuva'] : c <= 67 ? ['Chuva', 'chuva'] : c <= 77 ? ['Neve', 'neve'] : c <= 82 ? ['Pancadas de chuva', 'chuva'] : c <= 86 ? ['Neve', 'neve'] : ['Tempestade', 'raio'];
  const CLIMA_SVG = {
    sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/>',
    solnuvem: '<circle cx="9" cy="8.5" r="3"/><path d="M9 2.5v1.2M3 8.5h1.2M4.8 4.3l.9.9M13.2 4.3l-.9.9"/><path d="M8 20h9a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.4 1.3A3 3 0 0 0 8 20Z"/>',
    nuvem: '<path d="M7 19h10.5a4 4 0 0 0 .5-8 6 6 0 0 0-11.4 1.6A3.3 3.3 0 0 0 7 19Z"/>',
    nevoa: '<path d="M4 9h16M3 13h18M6 17h12"/>',
    chuva: '<path d="M7 15h10.5a3.8 3.8 0 0 0 .5-7.6 6 6 0 0 0-11.3 1.5A3.2 3.2 0 0 0 7 15Z"/><path d="M8.5 18l-1 2.5M12.5 18l-1 2.5M16.5 18l-1 2.5"/>',
    neve: '<path d="M7 14h10.5a3.8 3.8 0 0 0 .5-7.6A6 6 0 0 0 6.700 7.900 3.200 3.200 0 0 0 7 14Z"/><path d="M8.500 18h.01M12 20h.01M15.500 18h.01"/>',
    raio: '<path d="M7 14h10.5a3.8 3.8 0 0 0 .5-7.6A6 6 0 0 0 6.700 7.900 3.200 3.200 0 0 0 7 14Z"/><path d="M12.500 14l-2.500 4h3.500l-2 3.500"/>'
  };
  const climaIco = (k, cls = '') => `<svg class="clima-ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${CLIMA_SVG[k] || CLIMA_SVG.nuvem}</svg>`;
  const graus = (n) => Math.round(n) + '°';
  const climaGuardado = () => { try { return JSON.parse(localStorage.getItem(CLIMA_CHAVE) || 'null'); } catch (e) { return null; } };
  function climaDados() {
    const l = S.perfil.clima; if (!l) return null;
    const g = UI.clima || climaGuardado();
    return g && g.lat === l.lat && g.lon === l.lon ? g : null;
  }
  async function carregarClima(forcar) {
    const l = S.perfil.clima; if (!l || UI.climaCarregando) return;
    const g = climaDados(); if (!forcar && g && Date.now() - g.em < CLIMA_VALE) { UI.clima = g; return; }
    UI.climaCarregando = true; UI.climaErro = false; climaAtualizar();
    try {
      const u = `https://api.open-meteo.com/v1/forecast?latitude=${l.lat}&longitude=${l.lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=6`;
      const r = await fetch(u); if (!r.ok) throw new Error(r.status);
      const j = await r.json();
      UI.clima = { lat: l.lat, lon: l.lon, em: Date.now(), atual: j.current, dia: j.daily };
      try { localStorage.setItem(CLIMA_CHAVE, JSON.stringify(UI.clima)); } catch (e) { /* sem espaço: segue sem guardar */ }
    } catch (e) { UI.climaErro = true; }
    UI.climaCarregando = false; climaAtualizar();
  }
  const climaAtualizar = () => { const el = document.getElementById('clima-card'); if (el) el.outerHTML = climaHTML(true); };
  function climaHTML(semBusca) {
    const l = S.perfil.clima;
    if (!l) return `<section class="cartao clima clima-vazio" id="clima-card">${climaIco('solnuvem')}<div><strong>Previsão do tempo</strong><p class="meta">Escolha a sua cidade para ver o tempo de hoje e dos próximos dias.</p></div>${btn('clima-local', 'Escolher cidade', '', 'btn-1')}</section>`;
    const g = climaDados();
    if (!semBusca && (!g || Date.now() - g.em >= CLIMA_VALE)) setTimeout(() => carregarClima(false), 0);
    const cab = `<div class="clima-cab"><span class="clima-cidade">${ic('pin')}${esc(l.nome)}</span><span class="clima-acoes">${btnIco('clima-atualizar', 'refresh', 'Atualizar')}${btnIco('clima-local', 'edit-pencil', 'Trocar a cidade')}</span></div>`;
    if (!g) return `<section class="cartao clima" id="clima-card" aria-busy="true">${cab}<p class="meta">${UI.climaErro ? 'Não deu para buscar a previsão agora. Tente atualizar.' : 'Buscando a previsão…'}</p></section>`;
    const a = g.atual, d = g.dia, [txt, ico] = CLIMA_COD(a.weather_code), chuva = d.precipitation_probability_max[0] || 0;
    const dias = d.time.slice(1, 6).map((t, k) => { const x = new Date(t + 'T12:00'); return `<li><span>${x.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span>${climaIco(CLIMA_COD(d.weather_code[k + 1])[1])}<b>${graus(d.temperature_2m_max[k + 1])}</b><span class="min">${graus(d.temperature_2m_min[k + 1])}</span></li>`; }).join('');
    const dica = chuva >= 50 ? 'Leve guarda-chuva.' : a.temperature_2m >= 32 ? 'Dia quente: água por perto.' : a.temperature_2m <= 14 ? 'Frio: leve um casaco.' : '';
    const aberto = !!UI.climaAberto;
    const fatos = `<ul class="clima-fatos"><li><span>Máx / mín</span><b>${graus(d.temperature_2m_max[0])} / ${graus(d.temperature_2m_min[0])}</b></li><li><span>Sensação</span><b>${graus(a.apparent_temperature)}</b></li><li><span>Chuva</span><b>${chuva}%</b></li><li><span>Vento</span><b>${Math.round(a.wind_speed_10m)} km/h</b></li></ul>`;
    return `<section class="cartao clima ${aberto ? 'aberto' : ''}" id="clima-card" aria-label="Previsão do tempo em ${esc(l.nome)}">${cab}
      <div class="clima-corpo" data-act="clima-alternar" role="button" tabindex="0" aria-expanded="${aberto}" title="${aberto ? 'Recolher' : 'Ver mais'}">
        <div class="clima-agora">${climaIco(ico, 'grande')}<div><p class="clima-temp">${graus(a.temperature_2m)}</p><p class="clima-txt">${txt}</p></div>
          <span class="clima-mm">${graus(d.temperature_2m_max[0])} / ${graus(d.temperature_2m_min[0])}</span><span class="clima-seta">${ic('nav-arrow-down')}</span></div>
        ${aberto ? `${fatos}<ul class="clima-dias">${dias}</ul>${dica ? `<p class="clima-dica">${dica}</p>` : ''}` : ''}</div></section>`;
  }
  async function climaBuscar(cidade) {
    const r = await fetch('https://geocoding-api.open-meteo.com/v1/search?count=1&language=pt&name=' + encodeURIComponent(cidade));
    const j = await r.json(); const x = (j.results || [])[0]; if (!x) return null;
    return { nome: [x.name, x.admin1].filter(Boolean).join(', '), lat: +x.latitude.toFixed(3), lon: +x.longitude.toFixed(3) };
  }
  function climaDefinir(l) { S.perfil.clima = l; UI.clima = null; salvar(); UI.modal = null; render(); carregarClima(true); }

  const renderInicio = () => { main.innerHTML = faixaLembrete() + petHTML() + compositor() + primeirosPassosHTML() + `<div class="feed">${conteudoFeed()}</div>`; };

  /* ---------------- Mural ---------------- */
  function renderMural() {
    let ns = doTipo('nota').slice().sort((a, b) => (b.fixado ? 1 : 0) - (a.fixado ? 1 : 0) || (a.ordem ?? 0) - (b.ordem ?? 0) || b.criadoEm.localeCompare(a.criadoEm));
    if (UI.muralCol === 'soltos') ns = ns.filter((i) => !i.colecoes.length);
    else if (UI.muralCol !== 'todas') ns = ns.filter((i) => i.colecoes.some((c) => c.id === UI.muralCol));
    const nota = (i) => `<article class="postit ${corNota(i)} arrastavel abre" data-ordena="notas" data-oid="${i.id}" data-id="${i.id}"
        data-act="ver-item" tabindex="0" role="button" aria-label="Abrir ${esc(corta(i.titulo || i.texto || 'nota', 50))}">
      ${i.titulo ? `<h3>${esc(i.titulo)}</h3>` : ''}
      ${i.modo === 'lista' ? listaCheckHTML(i) : `<p>${esc(corta(i.texto, 240))}</p>`}
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
    const volume = (i) => { const p = progresso(i), ok = i.status === 'concluido', verbo = i.formato === 'filme' ? 'assistido' : 'lido'; return `<div class="volume-caixa"><a class="volume" href="#/item/${i.id}">${capaHTML(i)}
      <strong>${esc(i.titulo)}</strong>${estrelasHTML(i.estrelas)}
      <span class="meta">${esc(STATUS[i.formato][i.status])}${p !== null ? ' · ' + p + '%' : ''}</span>
      ${p !== null ? `<span class="barra"><i style="width:${p}%"></i></span>` : ''}</a>
      <span class="volume-acoes"><button type="button" class="ico-btn" data-act="midia-concluir" data-id="${i.id}" aria-pressed="${ok}" aria-label="${ok ? 'Desmarcar como ' + verbo : 'Marcar como ' + verbo}" title="${ok ? 'Desmarcar como ' + verbo : 'Marcar como ' + verbo}">${icAtivo('check-circle', ok)}</button><button type="button" class="ico-btn" data-act="excluir-item" data-id="${i.id}" aria-label="Excluir" title="Excluir">${ic('trash')}</button></span></div>`; };
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
  /* ---------------- Mosaico: os cards se encaixam nos vãos ----------------
     Cada card ocupa tantas linhas finas (1px) quanto a sua altura; o grid então preenche o espaço vazio embaixo dos mais baixos. */
  const MOSAICO = '.mural, .grade, .bento';
  const roMosaico = typeof ResizeObserver === 'function' ? new ResizeObserver(() => agendarMosaico()) : null;
  let rafMosaico = 0;
  function agendarMosaico() { cancelAnimationFrame(rafMosaico); rafMosaico = requestAnimationFrame(empacotarTudo); }
  function empacotarTudo() {
    main.querySelectorAll(MOSAICO).forEach((c) => {
      if (getComputedStyle(c).display !== 'grid') return;
      if (!c.dataset.gapM) c.dataset.gapM = String(parseFloat(getComputedStyle(c).rowGap) || 16);
      const gap = Number(c.dataset.gapM);
      c.classList.add('mosaico'); c.style.setProperty('--gap-m', gap + 'px');
      [...c.children].forEach((ch) => {
        if (getComputedStyle(ch).position === 'absolute' || getComputedStyle(ch).position === 'fixed') return;
        ch.style.gridRowStart = 'auto'; ch.style.gridRowEnd = 'span ' + Math.max(1, Math.ceil(ch.offsetHeight + gap));
        if (roMosaico) roMosaico.observe(ch);
      });
      if (roMosaico) roMosaico.observe(c);
    });
  }

  /* ---------------- Seleção em lote (Wishlist e Links) ---------------- */
  const selAtiva = () => Array.isArray(UI.sel) && UI.selRota === rotaAtual()[0];
  const selBtn = () => selAtiva() ? btnTxt('sel-sair', 'xmark', 'Cancelar seleção') : btnTxt('sel-ligar', 'check-circle', 'Selecionar');
  const SEL_ROTAS = ['inicio', 'mural', 'tarefas', 'imagens', 'biblioteca', 'links', 'wishlist', 'colecao'];
  const SEL_CARTOES = '.produto[data-id], .post[data-id], .postit[data-id], .pin[data-imagem], .volume-caixa, .tar-cartao';
  const idCartao = (c) => {
    const l = c.querySelector('a[href^="#/item/"]'), d = c.querySelector('[data-id]');
    return c.dataset.id || c.dataset.imagem || (l && l.getAttribute('href').slice(7)) || (d && d.dataset.id) || '';
  };
  const cartoesSel = () => [...main.querySelectorAll(SEL_CARTOES)].filter((c) => !c.parentElement.closest(SEL_CARTOES) && item(idCartao(c)));
  function alternarSel(id) { const k = UI.sel.indexOf(id); if (k < 0) UI.sel.push(id); else UI.sel.splice(k, 1); render(); }
  function prepararSelecao(rota) {
    if (!SEL_ROTAS.includes(rota)) return;
    if (!cartoesSel().length && !selAtiva()) return;
    const linhaFeed = rota === 'inicio' ? main.querySelector('.feed .dia-nav, .feed .secao-tit:not(.so)') : null;
    const cab = main.querySelector('.pagina-cab .ferramentas') || main.querySelector('.pagina-cab');
    if (linhaFeed) {
      linhaFeed.insertAdjacentHTML('beforeend', `<span class="sel-lado">${selBtn()}</span>`);
      const bt = linhaFeed.querySelector('.sel-lado button'); if (bt) { bt.title = bt.textContent.trim(); bt.setAttribute('aria-label', bt.title); }
    }
    else if (cab) cab.insertAdjacentHTML('afterbegin', selBtn());
    else main.insertAdjacentHTML('afterbegin', `<div class="ferramentas" style="justify-content:flex-end">${selBtn()}</div>`);
    aplicarSelecao();
  }
  function aplicarSelecao() {
    if (!selAtiva()) return;
    UI.sel = UI.sel.filter((id) => item(id));
    cartoesSel().forEach((c) => {
      c.classList.add('sel-modo'); c.classList.toggle('sel-marcada', UI.sel.includes(idCartao(c)));
      c.insertAdjacentHTML('afterbegin', `<span class="sel-caixa" aria-hidden="true">${ic('check')}</span>`);
    });
    const n = UI.sel.length, rota = rotaAtual()[0], vazio = !n;
    main.insertAdjacentHTML('beforeend', `<div class="barra-sel" role="toolbar" aria-label="Ações em lote"><strong>${n} selecionado${n === 1 ? '' : 's'}</strong>
      ${btn('sel-todos', 'Todos', '', 'btn-f')}
      ${rota === 'wishlist' ? btn('sel-comprar', ic('check-circle') + (UI.wlFiltro === 'comprados' ? 'Voltar para Quero' : 'Marcar comprado'), vazio ? 'disabled' : '', 'btn-f') : ''}
      ${btn('sel-mover', ic('folder') + 'Mover', vazio ? 'disabled' : '', 'btn-f')}
      ${btn('sel-excluir', ic('trash') + 'Excluir', vazio ? 'disabled' : '', 'btn-f perigo')}
      ${btnIco('sel-sair', 'xmark', 'Cancelar seleção')}</div>`);
  }

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
        : i.capturaStatus === 'falhou' ? '<span class="tag">Não consegui ler a página</span>' : '';
    const aviso = (i) => { const f = faltouAgora(i); return f.length ? `<p class="prod-aviso">Faltou: ${esc(f.join(', '))}</p>` : '<p class="prod-aviso vazio"></p>'; };
    const prod = (i) => `<article class="produto ${i.comprado ? 'comprado' : ''}" data-id="${i.id}">
      <a href="#/item/${i.id}" aria-label="Abrir ${esc(tituloItem(i))}">${fotoProduto(i)}</a>
      <p class="fonte">${ic('shop')}${esc(i.loja || dominio(i.url))}</p>
      <h3><a href="#/item/${i.id}">${esc(tituloItem(i))}</a></h3>
      ${aviso(i)}
      <div class="prod-aval">${estrelasHTML(i.estrelas, i.avaliacoes ? '(' + i.avaliacoes + ')' : '')}</div>
      <p class="prod-preco">${precoHTML(i)}${selo(i)}</p>
      <div class="prod-rodape">
        <a class="btn btn-marca btn-p produto-ir" href="${esc(i.url)}" target="_blank" rel="noopener">Ver na loja ${ic('open-new-window')}</a>
        <div class="pe">${btnAlterna('fav', i.id, i.favorito, 'star', 'Favorito', 'Favoritar', 'estrela')}
          ${btnAlterna('comprei', i.id, i.comprado, 'check-circle', 'Comprado', 'Marcar como comprado')}
          ${btnIco('recapturar', 'refresh', 'Atualizar preço', `data-id="${i.id}"`)}
          ${btnIco('copiar-link', 'copy', 'Copiar endereço', `data-id="${i.id}"`)}<span class="espaco"></span>
          ${menuMais([{ act: 'editar-item', id: i.id, ico: 'edit-pencil', txt: 'Corrigir dados' }, '-', { act: 'excluir-item', id: i.id, ico: 'trash', txt: 'Excluir', perigo: true }])}</div></div></article>`;
    main.innerHTML = `<header class="pagina-cab"><h1>${ic('shopping-bag')}Wishlist</h1>
        <div class="ferramentas">${btn('criar', ic('plus') + 'Colar link', 'data-t="desejo"', 'btn-1')}</div>
        <p class="meta wl-resumo">${ds.length} ${ds.length === 1 ? 'produto' : 'produtos'}${total ? ` · <strong>${brl(total)}</strong> no total` : ''}</p></header>
      <div class="ferramentas barra-wl"><span class="segmento" role="group">${[['desejos', 'Quero'], ['comprados', 'Comprados']].map(([v, n]) => `<button type="button" data-act="wl-filtro" data-v="${v}" aria-pressed="${UI.wlFiltro === v}">${n}</button>`).join('')}</span>
        ${selectHTML('wl-ord', '', [['recentes', 'Mais recentes'], ['menor', 'Menor preço'], ['maior', 'Maior preço']], UI.wlOrdem).replace('<select', '<select data-act="wl-ordem" style="width:auto"')}
        ${doTipo('desejo').some((i) => !i.comprado) ? btnTxt('recapturar-todos', 'refresh', 'Atualizar todos os preços') : ''}</div>
      ${UI.conferindo ? `<p class="meta">${ic('refresh')} Conferindo os preços…</p>` : ''}
      ${ds.length ? `<div class="vitrine">${ds.map(prod).join('')}</div>` : vazio('shopping-bag', UI.wlFiltro === 'comprados' ? 'Nada marcado como comprado.' : 'Cole o link de um produto para começar.', btn('criar', 'Colar link', 'data-t="desejo"', 'btn-1'))}`;
    /* o balão de dica é do CSS (aria-label); tira o title nativo para não aparecer duas vezes */
    main.querySelectorAll('.produto .menu > summary').forEach((b) => b.setAttribute('aria-label', 'Mais opções'));
    main.querySelectorAll('.produto .pe [title]').forEach((b) => b.removeAttribute('title'));
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

  /* ---------------- Agenda: calendário do mês, com a lista do dia ---------------- */
  const maiuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  /* Os 7 stickers do calendário (Twemoji, CC-BY 4.0). Cada dia aceita até 3. */
  const STICKERS = [['bolo', 'Aniversário'], ['viagem', 'Viagem'], ['saude', 'Saúde'], ['trabalho', 'Trabalho'], ['festa', 'Festa'], ['coracao', 'Coração'], ['estrela', 'Destaque']];
  const stickerImg = (id, cls = '') => `<img class="sticker ${cls}" src="assets/img/stickers/${id}.svg" alt="" draggable="false">`;
  function compromissosDoDia(d) {
    const ev = (S.eventos || []).filter((e) => e.data === d).sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));
    const tar = doTipo('tarefa').filter((t) => t.prazo === d);
    const lem = S.lembretes.filter((l) => l.data === d).sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));
    // Tarefa e lembrete ligados ao mesmo item aparecem uma vez só, com os dois selos.
    const ligadas = new Set(tar.map((t) => t.id));
    const lemSoltos = lem.filter((l) => !(l.itemId && ligadas.has(l.itemId)));
    const lemDe = (t) => lem.find((l) => l.itemId === t.id);
    const linhas = [
      ...ev.map((e) => ({ k: 'ev', id: e.id, titulo: e.titulo, hora: e.hora || '', nota: e.nota || '', selos: ['ev'], feito: false })),
      ...tar.map((t) => { const l = lemDe(t); return { k: 'tar', id: t.id, titulo: tituloItem(t), hora: l ? (l.hora || '') : '', selos: l ? ['tar', 'lem'] : ['tar'], feito: !!t.concluida }; }),
      ...lemSoltos.map((l) => ({ k: 'lem', id: l.id, titulo: l.texto, hora: l.hora || '', selos: ['lem'], feito: !!l.concluido }))
    ];
    const on = UI.agFiltro || {};
    const visiveis = linhas.map((x) => { const ativos = x.selos.filter((k) => on[k] !== false); return ativos.length ? Object.assign({}, x, { k: ativos.includes(x.k) ? x.k : ativos[0], selos: ativos }) : null; }).filter(Boolean);
    return { ev, tar, lem, linhas: visiveis, total: visiveis.length };
  }
  const SELO_NOME = { ev: 'evento', tar: 'tarefa', lem: 'lembrete' };
  function renderAgenda() {
    const h = hoje();
    if (!UI.agDia) UI.agDia = h;
    const mes = UI.agMes || UI.agDia.slice(0, 7), [ano, mm] = mes.split('-').map(Number);
    const primeiro = new Date(ano, mm - 1, 1), ultimo = new Date(ano, mm, 0);
    const semanas = Math.ceil((primeiro.getDay() + ultimo.getDate()) / 7);
    const celulas = [];
    for (let k = 0; k < semanas * 7; k++) celulas.push(dataLocal(new Date(ano, mm - 1, 1 - primeiro.getDay() + k)));
    const cel = (d) => {
      const c = compromissosDoDia(d), fora = d.slice(0, 7) !== mes, stk = (S.stickers || {})[d] || [];
      const foco = UI.agDia && UI.agDia.slice(0, 7) === mes ? d === UI.agDia : d === mes + '-01';
      return `<button type="button" class="ag-dia ${fora ? 'fora' : ''} ${d === h ? 'hoje' : ''}" data-act="ag-dia" data-d="${d}" aria-pressed="${d === UI.agDia}" tabindex="${foco ? 0 : -1}"
        aria-label="${esc(fmtDia(d))}${c.total ? ', ' + c.total + (c.total === 1 ? ' compromisso' : ' compromissos') : ''}">
        <span class="ag-cab"><span class="ag-num">${Number(d.slice(8))}</span>
          ${stk.length ? `<span class="ag-stickers">${stk.slice(0, 3).map((x) => stickerImg(x)).join('')}${stk.length > 3 ? `<span class="ag-mais">+${stk.length - 3}</span>` : ''}</span>` : ''}</span>
        <span class="ag-chips">${c.linhas.slice(0, 2).map((x) => `<span class="ag-chip ${x.k} ${x.feito ? 'feito' : ''}" title="${esc(x.titulo)}">${esc(x.titulo)}</span>`).join('')}${c.linhas.length > 2 ? `<span class="ag-mais">+${c.linhas.length - 2} mais</span>` : ''}</span>
        <span class="ag-barras" aria-hidden="true">${[...new Set(c.linhas.map((x) => x.k))].map((k) => `<i class="${k}"></i>`).join('')}</span></button>`;
    };
    const nomeMes = maiuscula(primeiro.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }));
    const sem = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
    const dia = compromissosDoDia(UI.agDia);
    const selos = (x) => `<span class="ag-selos">${x.selos.map((k) => `<span class="ag-chip ${k}">${SELO_NOME[k]}</span>`).join('')}</span>`;
    const miolo = (x) => `<span class="ag-hora">${x.hora ? esc(x.hora) : 'dia todo'}</span>
      <span class="ag-txt"><strong>${esc(x.titulo)}</strong>${x.nota ? `<small>${esc(x.nota)}</small>` : ''}${selos(x)}</span>`;
    const linha = (x) => x.k === 'ev'
      ? `<div class="ag-linha ag-clicavel" role="button" tabindex="0" data-act="ev-ver" data-id="${x.id}">${miolo(x)}${menuMais([{ act: 'ev-editar', id: x.id, ico: 'edit-pencil', txt: 'Editar' }, '-', { act: 'ev-excluir', id: x.id, ico: 'trash', txt: 'Excluir', perigo: true }])}</div>`
      : x.k === 'tar' ? `<a class="ag-linha ${x.feito ? 'feito' : ''}" href="#/item/${x.id}">${miolo(x)}</a>`
        : `<button type="button" class="ag-linha ${x.feito ? 'feito' : ''}" data-act="ag-lembrete" data-id="${x.id}">${miolo(x)}</button>`;
    main.innerHTML = `<header class="pagina-cab cab-linha"><h1>${ic('calendar')}Agenda</h1>
        <div class="ferramentas">${btn('ev-novo', ic('plus') + 'Novo evento', '', 'btn-1')}</div>
        <p class="meta">Eventos, tarefas com prazo e lembretes, juntos no mês.</p></header>
      <div class="ag-layout">
        <section class="cartao ag-cal" aria-label="Calendário">
          <div class="ag-topo"><h2>${esc(nomeMes)}</h2><span class="espaco"></span>
            ${btnIco('ag-mes', 'nav-arrow-left', 'Mês anterior', 'data-v="-1"')}${btn('ag-mes', 'Hoje', 'data-v="hoje"', 'btn-f btn-p')}${btnIco('ag-mes', 'nav-arrow-right', 'Próximo mês', 'data-v="1"')}</div>
          <div class="ag-legenda" role="group" aria-label="Mostrar no calendário">${['ev', 'tar', 'lem'].map((k) => `<button type="button" class="ag-chip ${k} ag-filtro" data-act="ag-filtro" data-k="${k}" aria-pressed="${(UI.agFiltro || {})[k] !== false}">${SELO_NOME[k]}</button>`).join('')}</div>
          <div class="ag-semana" aria-hidden="true">${sem.map((x) => `<span>${x}</span>`).join('')}</div>
          <div class="ag-grade">${celulas.map(cel).join('')}</div></section>
        <aside class="cartao ag-painel" aria-label="Dia selecionado">
          <h2>${esc(maiuscula(fmtDia(UI.agDia)))}</h2>
          <div class="ag-stk" role="group" aria-label="Stickers do dia"><span class="rotulo">Stickers</span>
            <div class="ag-stk-linha">${STICKERS.map(([id, nome]) => { const on = ((S.stickers || {})[UI.agDia] || []).includes(id);
              return `<button type="button" class="ag-stk-btn" data-act="ag-sticker" data-v="${id}" aria-pressed="${on}" aria-label="${nome}" title="${nome}">${stickerImg(id)}</button>`; }).join('')}</div></div>
          <div class="ag-lista">${dia.total ? dia.linhas.map(linha).join('') : '<p class="meta">Nada marcado para este dia.</p>'}</div>
          ${btn('ev-novo', ic('plus') + 'Evento neste dia', `data-d="${UI.agDia}"`, 'btn-2 btn-p')}</aside></div>`;
    if (UI.agFoco) { const alvo = main.querySelector(`.ag-dia[data-d="${UI.agFoco}"]`); UI.agFoco = ''; if (alvo) alvo.focus(); }
  }
  /* Teclado no calendário: setas andam entre os dias, PageUp/PageDown trocam o mês, Enter abre o dia. */
  document.addEventListener('keydown', (e) => {
    const dia = e.target.closest && e.target.closest('.ag-dia'); if (!dia) return;
    const passo = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (passo === undefined && e.key !== 'PageUp' && e.key !== 'PageDown' && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    const atual = dia.dataset.d; let alvo;
    if (passo !== undefined) alvo = somaDias(atual, passo);
    else if (e.key === 'Home' || e.key === 'End') { const d = deDia(atual); alvo = dataLocal(new Date(d.getFullYear(), d.getMonth() + (e.key === 'End' ? 1 : 0), e.key === 'End' ? 0 : 1)); }
    else { const d = deDia(atual); alvo = dataLocal(new Date(d.getFullYear(), d.getMonth() + (e.key === 'PageUp' ? -1 : 1), 1)); }
    const cel = main.querySelector(`.ag-dia[data-d="${alvo}"]`);
    if (cel) { main.querySelectorAll('.ag-dia[tabindex="0"]').forEach((x) => { x.tabIndex = -1; }); cel.tabIndex = 0; cel.focus(); return; }
    UI.agMes = alvo.slice(0, 7); UI.agFoco = alvo; render();
  });

  /* ---------------- Lembretes ---------------- */
  function renderLembretes() {
    const h = hoje(), sem = somaDias(h, 7), pend = pendentes(), feitos = S.lembretes.filter((l) => l.concluido);
    const cols = [['Vencidos', pend.filter((l) => l.data < h)], ['Hoje', pend.filter((l) => l.data === h)],
      ['Próximos 7 dias', pend.filter((l) => l.data > h && l.data <= sem)], ['Depois', pend.filter((l) => l.data > sem)]];
    const card = (l) => {
      const alvo = l.itemId && item(l.itemId);
      const motivo = l.motivo === 'preco' ? ic('shopping-bag') + ' queda de preço' : l.motivo === 'tarefa' ? ic('list') + ' prazo de tarefa' : '';
      return `<article class="lembrete ${!l.concluido && venc(l) <= Date.now() ? 'vence' : ''} ${l.concluido ? 'feito' : ''}">
        <p>${alvo ? `<a href="#/item/${alvo.id}">${esc(l.texto)}</a>` : esc(l.texto)}</p>
        ${motivo || alvo ? `<p class="meta">${motivo}${motivo && alvo ? '<br>' : ''}${alvo ? ic(icoTipo(alvo)) + ' ' + esc(corta(tituloItem(alvo), 40)) : ''}</p>` : ''}
        <div class="pe"><span class="lemb-data">${ic('calendar')}${fmtDiaCurto(l.data)}${l.hora ? ' · ' + l.hora : ''}</span><span class="espaco"></span>
          ${l.concluido ? btnIco('lemb-reabrir', 'undo', 'Reabrir', `data-id="${l.id}"`) : btnIco('lemb-concluir', 'check-circle', 'Concluir', `data-id="${l.id}"`)}
          ${l.concluido ? '' : btnIco('lemb-adiar', 'clock', 'Adiar', `data-id="${l.id}"`)}
          ${menuMais([{ act: 'editar-item', id: l.id, ico: 'edit-pencil', txt: 'Editar' }, '-', { act: 'excluir-lembrete', id: l.id, ico: 'trash', txt: 'Excluir', perigo: true }])}</div></article>`;
    };
    main.innerHTML = `<header class="pagina-cab cab-linha"><h1>${ic('alarm')}Lembretes</h1>
        <div class="ferramentas">${btn('criar', ic('plus') + 'Novo lembrete', 'data-t="lembrete"', 'btn-1')}</div>
        <p class="meta">Avisos com data para não esquecer.</p></header>
      <div class="quadro">${cols.map(([n, ls]) => `<section class="quadro-col"><h2>${n}<em class="pino ${n === 'Vencidos' && ls.length ? 'alerta' : ''}">${ls.length}</em></h2>
        ${ls.map(card).join('') || '<p class="nada" style="padding:0 6px">—</p>'}</section>`).join('')}</div>
      ${feitos.length ? `<details class="cartao"><summary style="cursor:pointer;font-weight:600;font-size:14px">${ic('check-circle-solid')} Concluídos (${feitos.length})</summary>
        <div class="quadro-col" style="margin-top:14px">${feitos.map(card).join('')}</div></details>` : ''}`;
  }

  /* ---------------- Coleção (bento) ----------------
     Mostra tudo que está na coleção, por tipo, em blocos de tamanhos diferentes. */
  function renderColecao() {
    const id = rotaAtual()[1] || 'soltos';
    const col = colecao(id);
    const nome = col ? col.nome : 'A organizar';
    const dentro = id === 'soltos' ? S.itens.filter((i) => !i.colecoes.length)
      : S.itens.filter((i) => (i.colecoes || []).some((c) => c.id === id));
    const de = (t) => dentro.filter((i) => i.tipo === t);
    const blocos = [];

    const tar = de('tarefa'), tarAb = tar.filter((i) => !i.concluida);
    if (tar.length) blocos.push({ cls: tarAb.length > 2 ? 'alto' : '', html: cartao(ic('list') + 'Tarefas',
      `<div class="bento-lista">${tarAb.slice(0, 6).map((i) => linhaTarefa(i, { semColecao: true })).join('') || `<p class="meta">Tudo feito.</p>`}</div>`,
      `<a href="#/tarefas">${tarAb.length}/${tar.length}</a>`) });

    // Cada nota é um post-it solto, no mesmo tamanho do Mural; sem cartão agrupando.
    de('nota').sort((x, y) => (y.fixado ? 1 : 0) - (x.fixado ? 1 : 0) || (x.ordem ?? 0) - (y.ordem ?? 0) || y.criadoEm.localeCompare(x.criadoEm)).forEach((i) => blocos.push({ cls: 'solta',
      html: `<article class="postit ${corNota(i)} abre solto" data-act="ver-item" data-id="${i.id}" tabindex="0" role="button" aria-label="Abrir ${esc(corta(i.titulo || i.texto || 'nota', 50))}">
        ${i.titulo ? `<h3>${esc(i.titulo)}</h3>` : ''}${i.modo === 'lista' ? listaCheckHTML(i) : `<p>${esc(corta(i.texto, 240))}</p>`}
        <footer><time>${i.fixado ? ic('pin-solid') + ' ' : ''}${fmtDiaCurto(dataLocal(i.criadoEm))}</time></footer></article>` }));

    const links = de('link');
    if (links.length) blocos.push({ cls: '', html: cartao(ic('link') + 'Links',
      `<div class="lista-links">${links.slice(0, 5).map((i) => `<a href="${esc(i.url)}" target="_blank" rel="noopener">${ic('link')}<span>${esc(tituloItem(i))}</span></a>`).join('')}</div>`,
      `<a href="#/links">${links.length}</a>`) });

    const mid = de('midia');
    if (mid.length) blocos.push({ cls: '', html: cartao(ic('book-stack') + 'Biblioteca',
      `<div class="mini-capas">${mid.slice(0, 6).map((i) => `<a href="#/item/${i.id}" title="${esc(i.titulo)}">${capaHTML(i, 'p')}</a>`).join('')}</div>`,
      `<a href="#/biblioteca">${mid.length}</a>`) });

    const ima = de('imagem');
    if (ima.length) blocos.push({ cls: ima.length > 2 ? 'largo' : '', html: cartao(ic('media-image') + 'Imagens',
      `<div class="mini-fotos">${ima.slice(0, 6).map((i) => `<button type="button" data-act="imagem-ver" data-id="${i.id}" aria-label="Ver ${esc(tituloItem(i))}">${imgPin(i)}</button>`).join('')}</div>`,
      `<a href="#/imagens">${ima.length}</a>`) });

    const mus = de('musica');
    if (mus.length) blocos.push({ cls: '', html: cartao(ic('ytmusic') + 'Músicas',
      `<div class="mini-lista">${mus.slice(0, 4).map((i) => `<button type="button" class="mini-item" data-act="tocar" data-id="${i.id}">
        ${ic('play')}<span class="mini-txt">${esc(tituloItem(i))}</span></button>`).join('')}</div>`,
      `<a href="#/musicas">${mus.length}</a>`) });

    const des = de('desejo').filter((i) => !i.comprado);
    if (des.length) blocos.push({ cls: '', html: cartao(ic('shopping-bag') + 'Wishlist',
      `<div class="mini-lista">${des.slice(0, 4).map((i) => `<p class="mini-item"><span class="mini-txt"><a href="#/item/${i.id}">${esc(tituloItem(i))}</a></span><span class="meta num">${i.preco != null ? brl(i.preco, i.moeda) : ''}</span></p>`).join('')}</div>`,
      `<a href="#/wishlist">${des.length}</a>`) });

    const art = de('artigo');
    if (art.length) blocos.push({ cls: '', html: cartao(ic('page') + 'Estudos',
      `<div class="lista-links">${art.slice(0, 5).map((i) => `<a href="#" data-act="abrir-artigo" data-id="${i.id}">${ic(i.ehPdf ? 'page' : 'link')}<span>${esc(tituloItem(i))}</span></a>`).join('')}</div>`,
      `<a href="#/estudos">${art.length}</a>`) });

    const gas = de('gasto');
    if (gas.length) {
      const soma = gas.reduce((t, g) => t + (+g.valor || 0), 0);
      blocos.push({ cls: '', html: cartao(ic('wallet') + 'Gastos',
        `<p class="bento-numero">${brl(soma)}</p><p class="meta">${gas.length} lançamento${gas.length > 1 ? 's' : ''}</p>`,
        `<a href="#/gastos">ver</a>`) });
    }

    main.innerHTML = `<header class="pagina-cab"><h1>${ic('folder')}${esc(nome)}</h1>
        <div class="ferramentas">${col ? btn('editar-colecao', ic('edit-pencil') + 'Renomear', `data-id="${col.id}"`, 'btn-f btn-p') : ''}
          ${btn('criar-em', ic('plus') + 'Guardar aqui', `data-col="${esc(id)}"`, 'btn-1')}</div></header>
      ${dentro.length ? `<p class="meta" style="margin:-10px 0 20px">${dentro.length} ${dentro.length > 1 ? 'itens guardados' : 'item guardado'}</p>
        <div class="bento">${blocos.map((x) => `<div class="bento-bloco ${x.cls}">${x.html}</div>`).join('')}</div>`
        : vazio('folder', 'Nada nesta coleção ainda.', btn('criar-em', ic('plus') + 'Guardar aqui', `data-col="${esc(id)}"`, 'btn-1'))}`;
  }

  /* ---------------- Tarefas ---------------- */
  const VISOES = [['prazo', 'Por prazo', 'calendar'], ['quadro', 'Quadro', 'view-grid'], ['colecao', 'Por coleção', 'folder']];
  function renderTarefas() {
    const visao = VISOES.some((v) => v[0] === UI.tarefaVisao) ? UI.tarefaVisao : 'prazo';
    const todas = tarefas();
    const abertas = todas.filter((i) => !i.concluida);
    const feitas = todas.filter((i) => i.concluida).sort((a, b) => (b.editadoEm || b.criadoEm).localeCompare(a.editadoEm || a.criadoEm));
    const linha = (i, o) => `<div class="tar-item">${linhaTarefa(i, o)}${acoesTarefa(i)}</div>`;
    const grupo = (nome, lista, cls, o) => lista.length
      ? `<section class="tar-grupo ${cls || ''}"><h2>${esc(nome)}<em class="pino ${cls === 'alerta' && lista.length ? 'alerta' : ''}">${lista.length}</em></h2>
          ${lista.map((i) => linha(i, o)).join('')}</section>` : '';

    let corpo = '';
    if (!todas.length) {
      corpo = vazio('list', 'Nenhuma tarefa ainda. Uma linha por tarefa, com prazo só quando fizer falta.',
        btn('criar', ic('plus') + 'Nova tarefa', 'data-t="tarefa"', 'btn-1'));
    } else if (visao === 'prazo') {
      const h = hoje(), sem = somaDias(h, 7);
      const semPrazo = abertas.filter((i) => !i.prazo);
      corpo = grupo('Atrasadas', abertas.filter((i) => atrasada(i)).sort((a, b) => a.prazo.localeCompare(b.prazo)), 'alerta')
        + grupo('Hoje', abertas.filter((i) => i.prazo === h), '')
        + grupo('Próximos 7 dias', abertas.filter((i) => i.prazo > h && i.prazo <= sem).sort((a, b) => a.prazo.localeCompare(b.prazo)), '')
        + grupo('Depois', abertas.filter((i) => i.prazo > sem).sort((a, b) => a.prazo.localeCompare(b.prazo)), '')
        + grupo('Sem prazo', semPrazo, '');
      if (!abertas.length) corpo = `<p class="nada">${ic('check-circle-solid')} Tudo feito por aqui.</p>`;
    } else if (visao === 'quadro') {
      corpo = `<div class="quadro tres">${Object.entries(ETAPAS).map(([v, n]) => {
        const lista = v === 'feito' ? feitas : abertas.filter((i) => etapa(i) === v);
        return `<section class="quadro-col"><h2>${n}<em class="pino">${lista.length}</em></h2>
          ${lista.map((i) => `<article class="tar-cartao">${linhaTarefa(i)}
            <div class="pe">${v !== 'afazer' ? btnIco('tar-para', 'nav-arrow-left', 'Mover para A fazer', `data-id="${i.id}" data-v="afazer"`) : ''}
              ${v !== 'fazendo' ? btnIco('tar-para', 'clock', 'Mover para Fazendo', `data-id="${i.id}" data-v="fazendo"`) : ''}
              ${v !== 'feito' ? btnIco('tar-para', 'check-circle', 'Mover para Feito', `data-id="${i.id}" data-v="feito"`) : ''}
              <span class="espaco"></span>${menuTarefa(i)}</div></article>`).join('') || '<p class="nada" style="padding:0 6px">—</p>'}</section>`;
      }).join('')}</div>`;
    } else {
      const porCol = new Map(S.colecoes.map((c) => [c.id, []]));
      const soltas = [];
      abertas.forEach((i) => { const c = (i.colecoes || [])[0]; (c && porCol.has(c.id) ? porCol.get(c.id) : soltas).push(i); });
      corpo = S.colecoes.map((c) => grupo(c.nome, porCol.get(c.id), '', { semColecao: true })).join('')
        + grupo('Sem coleção', soltas, '', { semColecao: true });
      if (!abertas.length) corpo = `<p class="nada">${ic('check-circle-solid')} Tudo feito por aqui.</p>`;
    }

    const feitasHTML = feitas.length && visao !== 'quadro'
      ? `<details class="cartao tar-feitas" ${UI.verFeitas ? 'open' : ''}><summary data-act="tar-feitas">${ic('check-circle-solid')} Feitas (${feitas.length})</summary>
          <div class="tar-lista-feitas">${feitas.slice(0, 50).map((i) => linha(i)).join('')}</div></details>` : '';

    main.innerHTML = `<header class="pagina-cab cab-linha"><h1>${ic('list')}Tarefas</h1>
        <div class="ferramentas">${btn('criar', ic('plus') + 'Nova tarefa', 'data-t="tarefa"', 'btn-1')}</div>
        <p class="meta">Tudo o que você precisa fazer.</p></header>
      <div class="barra-filtros"><div class="segmento" role="group" aria-label="Como ver as tarefas">
        ${VISOES.map(([v, n, icone]) => `<button type="button" data-act="tar-visao" data-v="${v}" aria-pressed="${visao === v}">${ic(icone)}${n}</button>`).join('')}</div>
        ${abertas.length ? `<p class="meta">${abertas.length} aberta${abertas.length > 1 ? 's' : ''}${feitas.length ? ' · ' + feitas.length + ' feita' + (feitas.length > 1 ? 's' : '') : ''}</p>` : ''}</div>
      ${corpo}${feitasHTML}`;
  }
  function menuTarefa(i) {
    return menuMais([{ act: 'editar-item', id: i.id, ico: 'edit-pencil', txt: 'Editar' },
      { act: 'organizar-em', id: i.id, ico: 'folder', txt: 'Mover para coleção' },
      '-', { act: 'excluir-item', id: i.id, ico: 'trash', txt: 'Excluir', perigo: true }]);
  }
  function acoesTarefa(i) {
    return `<div class="tar-acoes">${i.concluida ? '' : btnIco('tar-fazendo', etapa(i) === 'fazendo' ? 'clock' : 'clock', etapa(i) === 'fazendo' ? 'Tirar de Fazendo' : 'Marcar como fazendo', `data-id="${i.id}"`)}
      ${menuTarefa(i)}</div>`;
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
      ${logado() ? cartao(ic('user') + 'Conta', `
        <p class="menu-conta">${conta().foto ? `<img src="${esc(conta().foto)}" alt="" referrerpolicy="no-referrer">` : ic('user')}
          <span><strong>${esc(conta().nome)}</strong><small>${esc(conta().email)}</small></span></p>
        <div class="acoes-form" style="margin-top:14px">${btn('sair', ic('log-out' in (window.ICONES || {}) ? 'log-out' : 'xmark') + 'Sair da conta', '', 'btn-f')}</div>`) : ''}
      ${UI.sessao.viaFirebase ? cartao(ic('priority-high') + 'Sessão do site', `
        <p class="meta">Você está entrando pela conta do Google guardada no navegador. A sessão do site em si caiu, o que costuma significar que falta definir <code>SESSAO_SEGREDO</code> nas variáveis de ambiente do servidor.</p>
        <p class="meta" style="margin-top:8px">Nada se perde por causa disso: seus registros continuam guardados e sincronizados.</p>`) : ''}
      ${cartao(ic('heart') + 'Pet', `
        <p class="meta">Seu pet mora no alto do Início. Para trocar de bichinho (salsicha, pinscher ou frajola) use a engrenagem dentro do cenário.</p>
        <div class="acoes-form" style="margin-top:14px">${btn('pet-alternar', ic(S.perfil.petOculto ? 'eye' : 'eye-solid') + (S.perfil.petOculto ? 'Mostrar o pet' : 'Esconder o pet'), '', 'btn-f')}
          ${btn('pet-som', S.perfil.petMudo ? 'Ligar o latido' : 'Silenciar o latido', '', 'btn-f')}</div>`)}
      ${cartao(ic('download') + 'Aplicativo', `
        <p class="meta">${PWA_().instalado ? 'Você está usando a Tyba como aplicativo.' : 'Instale para abrir em janela própria, com ícone na tela inicial e funcionando sem internet.'}</p>
        <p class="meta" style="margin-top:8px">${'serviceWorker' in navigator && navigator.serviceWorker.controller ? 'Modo offline pronto: o app abre mesmo sem conexão.' : 'Modo offline: prepara-se na primeira visita ao site publicado (https).'}</p>
        ${!PWA_().instalado && !podeInstalar() ? '<p class="meta" style="margin-top:8px">No Chrome ou Edge, procure o ícone de instalar na barra de endereço, ou o menu do navegador → Instalar app.</p>' : ''}
        <div class="acoes-form" style="margin-top:14px">${podeInstalar() ? btn('pwa-instalar', ic('download') + 'Instalar o app', '', 'btn-1') : ''}${btn('pwa-procurar', ic('refresh') + 'Procurar atualização', '', 'btn-f')}</div>
        <p class="meta" style="margin-top:12px">Versão ${esc(versaoNova())}</p>`)}
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
        <div class="acoes-form" style="margin-top:14px">${btn('resetar', 'Restaurar dados de exemplo', '', 'btn-perigo btn-2')}</div>`)}
      ${cartao(ic('play') + 'Sons', `
        <p class="meta">Sons curtos e suaves ao guardar, concluir, favoritar e excluir. Feitos no próprio aparelho, sem baixar nada.</p>
        <div class="acoes-form" style="margin-top:14px">${btn('som-ui', S.perfil.somUI === false ? 'Ligar os sons' : 'Desligar os sons', '', 'btn-f')}</div>
        <label class="campo" style="margin-top:14px"><span>Volume</span><input type="range" min="0" max="100" step="5" value="${S.perfil.somVolume == null ? 40 : S.perfil.somVolume}" data-act="som-vol" ${S.perfil.somUI === false ? 'disabled' : ''}></label>`)}
      ${cartao(ic('settings') + 'Sobre', `<p class="meta">Tyba · seus registros ficam neste navegador e, com a sincronização ligada, também na sua conta. Stickers do calendário: Twemoji (CC-BY 4.0). Ícones: <a href="https://iconoir.com/" target="_blank" rel="noopener">Iconoir</a>.</p>`)}`;
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
        <div class="acoes-form">${btn('midia-concluir', ic('check-circle') + (i.status === 'concluido' ? 'Desmarcar como ' : 'Marcar como ') + (i.formato === 'filme' ? 'assistido' : 'lido'), `data-id="${i.id}"`, i.status === 'concluido' ? 'btn-2 btn-p' : 'btn-1 btn-p')}${btn('progresso', ic('bookmark') + 'Onde parei', `data-id="${i.id}"`, 'btn-2 btn-p')}${btn('anotar', ic('page-edit') + 'Anotar', `data-id="${i.id}"`, 'btn-2 btn-p')}${btn('excluir-item', ic('trash') + 'Excluir', `data-id="${i.id}"`, 'btn-2 btn-p')}</div>
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
          <p class="meta">${i.capturaEm ? 'Capturado em ' + fmtDataHora(i.capturaEm) : 'Ainda não capturado'}${faltouAgora(i).length ? ' · faltou: ' + esc(faltouAgora(i).join(', ')) : ''}</p>
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
          <textarea name="texto" required rows="2" placeholder="O que aconteceu depois?"></textarea><button class="btn-1 btn-p" type="submit">Enviar</button></form>`)}
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
    // A barra do sistema (celular e janela instalada) acompanha o fundo do tema atual.
    requestAnimationFrame(() => {
      const fundo = getComputedStyle(raiz).getPropertyValue('--fundo').trim();
      if (/^#[0-9a-f]{6}$/i.test(fundo)) document.querySelectorAll('meta[name="theme-color"]').forEach((x) => { x.removeAttribute('media'); x.content = fundo; });
    });
  }

  /* ---------------- roteamento ---------------- */
  const ROTAS = { inicio: renderInicio, colecao: renderColecao, mural: renderMural, tarefas: renderTarefas, musicas: renderMusicas, imagens: renderImagens, biblioteca: renderBiblioteca, estudos: renderEstudos, links: renderLinks,
    agenda: renderAgenda, wishlist: renderWishlist, gastos: renderGastos, lembretes: renderLembretes, curriculo: renderCurriculo, perfil: renderPerfil, config: renderConfig };
  function rotaAtual() { return location.hash.replace(/^#\/?/, '').split('/'); }
  function render(focar) {
    // durante um arraste o DOM não pode ser recriado (sincronização, carregamentos): deixa para depois
    if (UI.arrastando) { UI.renderPendente = true; return; }
    if (!UI.pularColheita) colherRascunhos();
    UI.pularColheita = false;
    const [r, id] = rotaAtual();
    const rota = r === 'item' ? 'item' : (ROTAS[r] ? r : 'inicio');
    aplicarTema();
    renderTopo(); renderDisco(); renderNav(rota); renderDireita(rota);
    if (rota === 'item') renderFicha(id); else { ROTAS[rota](); abasPagina(rota); prepararSelecao(rota); empacotarTudo(); }
    if (rota === 'wishlist' && !UI.conferindo) setTimeout(conferirPrecos, 400);
    restaurarRascunhos();
    renderModal(); renderJanelas(); renderMiniApp(); renderTrabalho(); renderAtalho();
    { const ms = document.getElementById('menu-selecao'); if (ms && !String(getSelection() || '').trim()) ms.hidden = true; }
    if (buscaTopo.value !== UI.busca && document.activeElement !== buscaTopo) buscaTopo.value = UI.busca;
    if (focar) main.focus({ preventScroll: true });
  }
  window.addEventListener('hashchange', () => {
    UI.sel = null;
    if (rotaAtual()[0] === 'novo') return tratarEntrada();
    colherRascunhos();
    UI.cvEdit = null; UI.cvAdd = null; UI.adiando = null; UI.comentando = null; UI.erroCV = ''; UI.temaPrevia = null; UI.corPrevia = null;
    if (rotaAtual()[0] !== 'inicio' && !UI.buscando) UI.busca = '';
    UI.buscando = false;
    layout.classList.remove('nav-aberta');
    UI.pularColheita = true;
    render(true); window.scrollTo(0, 0);
  });

  /* ---------------- ações ---------------- */
  /** Cartão de confirmação do app (no lugar do confirm() do navegador). A 1ª linha é o título; o resto, o texto. */
  function confirmar(msg, o = {}) {
    return new Promise((resolve) => {
      const [titulo, ...resto] = String(msg).split('\n'), texto = resto.join('\n').trim();
      const verbo = (titulo.match(/^[\p{L}]+/u) || [''])[0];
      const perigo = o.perigo !== undefined ? o.perigo : /^(Excluir|Apagar|Descartar|Substituir|Sair)$/.test(verbo);
      const icone = o.icone || ({ Excluir: 'trash', Apagar: 'trash', Descartar: 'undo', Substituir: 'refresh', Sair: 'undo' }[verbo] || 'check-circle');
      const d = document.createElement('dialog'); d.className = 'dialogo-conf'; d.setAttribute('aria-label', titulo);
      d.innerHTML = `<form class="modal conf" method="dialog"><div class="conf-corpo">
          <span class="onb-icone ${perigo ? 'perigo' : ''}">${ic(icone)}</span>
          <h2>${esc(titulo)}</h2>${texto ? `<p class="onb-sub">${esc(texto)}</p>` : ''}</div>
        <footer class="conf-pe"><button type="button" class="btn-f" data-r="0">${esc(o.cancelar || 'Cancelar')}</button>
          <button type="button" class="${perigo ? 'btn-1 btn-risco' : 'btn-1'}" data-r="1">${esc(o.ok || verbo || 'Confirmar')}</button></footer></form>`;
      let feito = false;
      const fim = (v) => { if (feito) return; feito = true; d.classList.add('saindo'); setTimeout(() => { d.close(); d.remove(); resolve(v); }, 140); };
      d.addEventListener('click', (e) => { const b = e.target.closest('[data-r]'); if (b) fim(b.dataset.r === '1'); else if (e.target === d) fim(false); });
      d.addEventListener('cancel', (e) => { e.preventDefault(); fim(false); });
      document.body.appendChild(d); d.showModal();
      const alvo = d.querySelector(perigo ? '[data-r="0"]' : '[data-r="1"]'); if (alvo) alvo.focus();
    });
  }

  async function excluirItem(i) {
    const lembs = S.lembretes.filter((l) => l.itemId === i.id && !l.concluido).length;
    if (!(await confirmar(`Excluir “${tituloItem(i)}”?\n\nSai do feed, da busca e das coleções.` + (lembs ? `\n${lembs} lembrete(s) viram avulsos.` : '')))) return;
    S.itens = S.itens.filter((x) => x.id !== i.id);
    S.lembretes.forEach((l) => { if (l.itemId === i.id) l.itemId = null; });
    if (window.SONS) SONS.tocar('excluir');
    salvar(); toast('Excluído.');
    if (rotaAtual()[0] === 'item') location.hash = '#/' + ({ nota: 'mural', midia: 'biblioteca', desejo: 'wishlist', gasto: 'gastos', link: 'links', artigo: 'estudos' }[i.tipo] || 'inicio');
    else render();
  }

  aplicarSons();
  /* Três cliques no logo trocam entre as duas versões (fica salvo neste aparelho). */
  const aplicarLogo = (v) => { document.documentElement.dataset.logo = v; };
  try { aplicarLogo(localStorage.getItem('meuEspaco.logo') || '1'); } catch (e) { aplicarLogo('1'); }
  document.addEventListener('click', (e) => {
    if (e.detail !== 3 || !e.target.closest('.logo-tyba')) return;
    const v = document.documentElement.dataset.logo === '2' ? '1' : '2';
    aplicarLogo(v); if (window.SONS) SONS.tocar('logo'); try { localStorage.setItem('meuEspaco.logo', v); } catch (x) { /* sem armazenamento */ }
  });

  document.addEventListener('click', async (e) => {
    document.querySelectorAll('details.menu[open]').forEach((d) => { if (!d.contains(e.target)) d.removeAttribute('open'); });
    const sel = document.getElementById('menu-selecao');
    if (sel && !sel.hidden && !sel.contains(e.target)) sel.hidden = true;
    if (selAtiva() && main.contains(e.target) && !e.target.closest('.barra-sel, details.menu')) {
      const cartao = cartoesSel().find((x) => x.contains(e.target));
      if (cartao) { e.preventDefault(); e.stopPropagation(); return alternarSel(idCartao(cartao)); }
    }
    const cartaoLink = e.target.closest('a[href^="#/item/"]');
    if (cartaoLink && !cartaoLink.dataset.act && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0 && rotaAtual()[0] !== 'item') {
      const alvoId = cartaoLink.getAttribute('href').slice(7), it = item(alvoId);
      if (it) {
        e.preventDefault();
        return abrirModal(it.tipo === 'tarefa' ? { tipo: 'tarefa-ver', id: alvoId } : it.tipo === 'imagem' ? { tipo: 'imagem-ver', id: alvoId } : { tipo: 'item-ver', id: alvoId });
      }
    }
    const b = e.target.closest('[data-act]');
    if (!b || b.matches('select, input')) return;
    // Clique no "⋯" (ou na área do menu) dentro de um cartão clicável só abre o menu; não aciona o cartão.
    const menuDentro = e.target.closest('details.menu');
    if (menuDentro && !menuDentro.contains(b)) return;
    const act = b.dataset.act, id = b.dataset.id, i = id && item(id);
    const fecharMenu = () => { const d = b.closest('details.menu'); if (d) d.removeAttribute('open'); };
    const passa = () => { salvar(); render(); };
    if (b.tagName === 'A' && ['criar', 'abrir-pasta', 'abrir-artigo', 'nova-colecao', 'col-ir'].includes(act)) e.preventDefault();
    if (window.SONS) {
      const T = (n) => SONS.tocar(n);
      if (act === 'fav') T(i && i.favorito ? 'desfazer' : 'favoritar');
      else if (act === 'tar-ok') T(i && i.concluida ? 'desfazer' : 'concluir');
      else if (act === 'comprei') T(i && i.comprado ? 'desfazer' : 'concluir');
      else if (act === 'midia-concluir') T(i && i.status === 'concluido' ? 'desfazer' : 'concluir');
      else if (act === 'lemb-concluir') T('concluir');
      else if (act === 'lemb-reabrir') T('desfazer');
    }
    switch (act) {
      case 'comp-mais': UI.compMais = !UI.compMais; return render();
      case 'sel-ligar': UI.sel = []; UI.selRota = rotaAtual()[0]; return render();
      case 'sel-sair': UI.sel = null; return render();
      case 'sel-todos': { const todos = cartoesSel().map(idCartao); UI.sel = UI.sel.length === todos.length ? [] : todos; return render(); }
      case 'sel-mover': return UI.sel.length ? abrirModal({ tipo: 'mover-lote' }) : undefined;
      case 'sel-comprar': {
        const alvo = UI.wlFiltro !== 'comprados';
        UI.sel.map(item).filter(Boolean).forEach((x) => { x.comprado = alvo; if (alvo) x.compradoEm = agora(); else delete x.compradoEm; x.editadoEm = agora(); });
        toast(UI.sel.length + (alvo ? ' marcado(s) como comprado.' : ' voltou(aram) para Quero.')); UI.sel = []; return passa();
      }
      case 'sel-excluir': {
        const n = UI.sel.length; if (!n || !(await confirmar(`Excluir ${n} ${n === 1 ? 'item' : 'itens'}?\n\nSaem do feed, da busca e das coleções.`))) return;
        const ids = new Set(UI.sel);
        S.itens = S.itens.filter((x) => !ids.has(x.id));
        S.lembretes.forEach((l) => { if (ids.has(l.itemId)) l.itemId = null; });
        UI.sel = []; toast(n + ' excluído(s).'); return passa();
      }
      case 'criar': return abrirModal({ tipo: 'criar', t: b.dataset.t });
      case 'trocar-tipo': return abrirModal({ tipo: 'tipo' });
      case 'modal-fechar': e.preventDefault(); return fecharModal();
      case 'trabalho': e.preventDefault(); return alternarTrabalho();
      case 'trabalho-sair': e.preventDefault(); return alternarTrabalho(false);
      case 'atalho': e.preventDefault(); if (!matchMedia('(hover: none)').matches) return; UI.atalhoAberto = !UI.atalhoAberto; return renderAtalho();
      case 'som-ui': e.preventDefault(); S.perfil.somUI = S.perfil.somUI === false; salvar(); UI.pularColheita = true; render(); if (S.perfil.somUI !== false) SONS.tocar('guardar'); return;
      case 'amb-abrir': e.preventDefault(); UI.ambAberto = !UI.ambAberto; return pintarAmbiente();
      case 'amb-tocar': e.preventDefault(); if (SONS.ambiente.tocando()) SONS.ambiente.parar(); else SONS.ambiente.ligar(); return pintarAmbiente();
      case 'amb-zerar': {
        e.preventDefault(); const z = {}; SONS.ambiente.camadas.forEach(([k]) => { z[k] = 0; }); SONS.ambiente.definir(z);
        document.querySelectorAll('#ma-amb input[data-id]').forEach((r) => { if (r.dataset.id !== 'geral') r.value = 0; });
        return salvarAmbiente();
      }
      case 'pet-som': e.preventDefault(); S.perfil.petMudo = !S.perfil.petMudo; salvar(); UI.pularColheita = true; render(); if (!S.perfil.petMudo) petLatido(); return;
      case 'pet-config': { e.preventDefault(); const pn = document.querySelector('#pet-cena .pet-config'); if (pn) { pn.hidden = !pn.hidden; UI.petConfig = !pn.hidden; } return; }
      case 'pet-escolher': e.preventDefault(); S.perfil.petTipo = b.dataset.tipo; UI.petConfig = false; salvar(); PET.estado = 'parado'; PET.alvo = null; UI.pularColheita = true; render(); petFalar(petDef().fala, 1); petLatido(); return;
      case 'pet-papo': e.preventDefault(); S.perfil.petCala = !S.perfil.petCala; salvar(); UI.pularColheita = true; render(); if (!S.perfil.petCala) petFalar('Oba, vamos conversar!', 2); return;
      case 'pet-encher': e.preventDefault(); petEncher(b.dataset.pote); return;
      case 'pet-brincar': e.preventDefault(); PET.interagiu = true; if (!PET.bola) PET.fila = 'brincar'; petFalar('Bolinha!', 1); return;
      case 'pet-banho': e.preventDefault(); PET.interagiu = true; PET.fila = 'banho'; PET.visita = null; if (PET.bola) { if (PET.bola.el) PET.bola.el.remove(); PET.bola = null; } petFalar('Banho!', 1); return;
      case 'pet-nome': e.preventDefault(); return abrirModal({ tipo: 'pet-nome' });
      case 'clima-local': e.preventDefault(); UI.climaMsg = ''; return abrirModal({ tipo: 'clima-local' });
      case 'clima-alternar': UI.climaAberto = !UI.climaAberto; return render();
      case 'clima-atualizar': e.preventDefault(); return carregarClima(true);
      case 'clima-gps': {
        e.preventDefault(); const msg = document.getElementById('clima-msg');
        if (!navigator.geolocation) { if (msg) msg.textContent = 'Este aparelho não informa a localização.'; return; }
        if (msg) msg.textContent = 'Procurando você…';
        navigator.geolocation.getCurrentPosition((pos) => climaDefinir({ nome: 'Minha localização', lat: +pos.coords.latitude.toFixed(3), lon: +pos.coords.longitude.toFixed(3) }),
          () => { const m2 = document.getElementById('clima-msg'); if (m2) m2.textContent = 'Não foi possível usar a localização. Digite o nome da cidade.'; }, { timeout: 10000 });
        return;
      }
      case 'pet-alternar': e.preventDefault(); S.perfil.petOculto = !S.perfil.petOculto; salvar(); UI.pularColheita = true; return render();
      case 'pwa-instalar': {
        e.preventDefault(); fecharMenu();
        const P = PWA_();
        if (P.instalavel) return P.instalar().then((r) => { if (r === 'accepted') toast('Instalando…', 'download'); });
        if (P.ios) return abrirModal({ tipo: 'instalar-ios' });
        return toast('Use o ícone de instalar na barra de endereço, ou o menu do navegador → Instalar app.');
      }
      case 'pwa-atualizar': e.preventDefault(); toast('Atualizando…', 'refresh'); return PWA_().aplicarAtualizacao();
      case 'pwa-depois': e.preventDefault(); pwaDepois = true; return pintarAvisoPwa();
      case 'pwa-procurar': {
        e.preventDefault();
        const P = PWA_();
        if (!P.registro) return toast('O modo offline funciona no site publicado (https) ou em localhost.');
        toast('Procurando atualização…', 'refresh');
        P.procurarAtualizacao();
        return setTimeout(() => { if (P.atualizacaoPronta) { pwaAtualizacao = true; pwaDepois = false; pintarAvisoPwa(); toast('Há uma versão nova. Toque em Atualizar.'); } else toast('Você já está na versão mais nova.', 'check-circle-solid'); }, 2600);
      }
      case 'passos-dispensar': e.preventDefault(); S.perfil.passosFim = true; return passa();
      case 'onb-prox': e.preventDefault(); if (UI.onb.passo === 0) onboardingSalvaNome(); UI.onb.passo = Math.min(ONB_PASSOS - 1, UI.onb.passo + 1); UI.onb.entra = true; UI.pularColheita = true; return render();
      case 'onb-voltar': e.preventDefault(); UI.onb.passo = Math.max(0, UI.onb.passo - 1); UI.onb.entra = true; UI.pularColheita = true; return render();
      case 'onb-pular': case 'onb-fim': e.preventDefault(); onboardingSalvaNome(); return encerrarOnboarding();
      case 'onb-tema': e.preventDefault(); S.perfil.tema = b.dataset.v; S.perfil.corCustom = ''; UI.onb.entra = false; salvar(); aplicarTema(); UI.pularColheita = true; return render();
      case 'onb-modo': e.preventDefault(); S.perfil.modo = b.dataset.v; UI.onb.entra = false; salvar(); aplicarTema(); UI.pularColheita = true; return render();
      case 'onb-criar': { e.preventDefault(); const t = b.dataset.t; encerrarOnboarding(); return abrirModal({ tipo: 'criar', t }); }
      case 'onboarding': e.preventDefault(); fecharMenu(); return abrirOnboarding();
      case 'novidades': e.preventDefault(); UI.novidPagina = undefined; return abrirModal({ tipo: 'novidades' });
      case 'novid-ir': e.preventDefault(); UI.novidPagina = +b.dataset.n; UI.pularColheita = true; return render();
      case 'ver-item': { e.preventDefault(); return abrirModal({ tipo: 'item-ver', id }); }
      case 'tarefa-ver': e.preventDefault(); return abrirModal({ tipo: 'tarefa-ver', id: b.dataset.id });
      case 'criar-em': e.preventDefault(); UI.colPadrao = b.dataset.col === 'soltos' ? '' : b.dataset.col; return abrirModal({ tipo: 'tipo' });
      case 'tocar': e.preventDefault(); return tocar(b.dataset.id);
      case 'tocar-video': e.preventDefault(); return tocar(b.dataset.id, b.dataset.video);
      case 'ma-faixas': {
        e.preventDefault();
        const mesmo = UI.listaAberta === b.dataset.id;
        UI.listaAberta = mesmo ? '' : b.dataset.id;
        const alvo = item(b.dataset.id);
        if (!mesmo && alvo && !(alvo.faixas && alvo.faixas.length)) carregarFaixas(alvo.id);
        UI.pularColheita = true; render();
        if (!mesmo) rolarListaAoTopo(b.dataset.id);
        return;
      }
      case 'ma-lista-abrir': {
        e.preventDefault(); const alvo = item(b.dataset.id); if (!alvo) return;
        UI.listaMini = alvo.id; if (!(alvo.faixas && alvo.faixas.length)) carregarFaixas(alvo.id);
        UI.pularColheita = true; render();
        { const l = document.getElementById('ma-lista'); if (l) l.scrollTop = 0; }
        return;
      }
      case 'ma-lista-voltar': e.preventDefault(); UI.listaMini = ''; UI.pularColheita = true; render(); return;
      case 'ma-faixas-recarregar': e.preventDefault(); return carregarFaixas(b.dataset.id);
      case 'player-fechar': e.preventDefault(); return fecharMusica();
      case 'player-abrir': {
        e.preventDefault();
        if (!UI.painelMusica) { UI.painelMusica = true; UI.pularColheita = true; return render(); }
        if (UI.playerMin) { UI.playerMin = false; return pintarMiniApp(); }
        location.hash = '#/musicas'; return;
      }
      case 'player-min': e.preventDefault(); UI.playerMin = !UI.playerMin; return pintarMiniApp();
      case 'player-pausar': e.preventDefault(); return pausarOuTocar();
      case 'player-anterior': { e.preventDefault(); const v = vizinha(-1); return v && tocar(v.id); }
      case 'player-proxima': { e.preventDefault(); const v = vizinha(1); return v && tocar(v.id); }
      case 'abrir-musica': e.preventDefault(); return abrirMusica();
      case 'imagem-ver': e.preventDefault(); return abrirModal({ tipo: 'imagem-ver', id });
      case 'imagem-nav': {
        e.preventDefault();
        const l = imagens(), n = l.findIndex((x) => x.id === (UI.modal && UI.modal.id));
        if (n < 0 || !l.length) return;
        UI.modal = { tipo: 'imagem-ver', id: l[(n + Number(b.dataset.v) + l.length) % l.length].id }; return render();
      }
      case 'imagem-grupo': fecharMenu(); return abrirModal({ tipo: 'imagem-grupo', id });
      case 'imagem-excluir': { const x = item(id); if (!x) return; UI.modal = null; render(); return excluirItem(x); }
      case 'abrir-origem': { fecharMenu(); const x = item(id); if (x && x.origem) window.open(x.origem, '_blank', 'noopener'); return; }
      case 'img-grupo': e.preventDefault(); UI.grupoImagem = b.dataset.v; UI.pularColheita = true; return render();
      case 'novo-grupo-imagem': e.preventDefault(); return abrirModal({ tipo: 'grupo-imagem' });
      case 'renomear-grupo-imagem': e.preventDefault(); return abrirModal({ tipo: 'grupo-imagem', id: UI.grupoImagem });
      case 'excluir-grupo-imagem': {
        e.preventDefault();
        const gr = grupoImagem(UI.grupoImagem); if (!gr) return;
        if (!(await confirmar(`Excluir o grupo “${gr.nome}”?\n\nAs imagens dele continuam guardadas, só ficam sem grupo.`))) return;
        S.itens.forEach((x) => { if (x.tipo === 'imagem' && x.grupo === gr.id) x.grupo = ''; });
        S.gruposImagem = S.gruposImagem.filter((x) => x.id !== gr.id); UI.grupoImagem = '';
        salvar(); UI.pularColheita = true; return render();
      }
      case 'img-link-ok': {
        e.preventDefault();
        const campoL = b.closest('.envio').querySelector('input[data-act="img-link"]');
        if (!campoL.value.trim()) return toast('Cole o link de uma imagem.');
        const v = campoL.value; campoL.value = '';
        return definirImagem(campoL.dataset.k, campoL.dataset.formato, v);
      }
      case 'ev-novo': e.preventDefault(); delete UI.imagens['evfoto']; return abrirModal({ tipo: 'evento', dia: b.dataset.d || (UI.agDia || hoje()) });
      case 'ev-editar': fecharMenu(); delete UI.imagens['evfoto']; return abrirModal({ tipo: 'evento', id });
      case 'ev-ver': e.preventDefault(); return abrirModal({ tipo: 'evento-ver', id });
      case 'ev-excluir': {
        fecharMenu(); const ev = evento(id); if (!ev) return;
        if (!(await confirmar(`Excluir “${ev.titulo}”?`))) return;
        S.eventos = S.eventos.filter((x) => x.id !== id); if (window.SONS) SONS.tocar('excluir'); if (UI.modal && UI.modal.tipo === 'evento-ver') fecharModal(); salvar(); toast('Evento excluído.'); return render();
      }
      case 'ag-sticker': {
        S.stickers = S.stickers || {}; const lista = S.stickers[UI.agDia] || [], k = lista.indexOf(b.dataset.v);
        if (k >= 0) lista.splice(k, 1);
        else { if (lista.length >= 3) return toast('Cada dia aceita até 3 stickers.'); lista.push(b.dataset.v); }
        if (lista.length) S.stickers[UI.agDia] = lista; else delete S.stickers[UI.agDia];
        if (window.SONS) SONS.tocar('favoritar'); return passa();
      }
      case 'ag-ir': e.preventDefault(); UI.agDia = b.dataset.d; UI.agMes = b.dataset.d.slice(0, 7); location.hash = '#/agenda'; return;
      case 'ag-lembrete': return abrirModal({ tipo: 'editar', id });
      case 'ag-filtro': { UI.agFiltro = Object.assign({ ev: true, tar: true, lem: true }, UI.agFiltro); UI.agFiltro[b.dataset.k] = !UI.agFiltro[b.dataset.k]; render(); { const f = main.querySelector(`.ag-filtro[data-k="${b.dataset.k}"]`); if (f) f.focus(); } return; }
      case 'ag-dia': {
        UI.agDia = b.dataset.d; UI.agMes = b.dataset.d.slice(0, 7); UI.agFoco = b.dataset.d; return render();
      }
      case 'ag-mes': {
        const base = UI.agMes || (UI.agDia || hoje()).slice(0, 7);
        if (b.dataset.v === 'hoje') { UI.agDia = hoje(); UI.agMes = UI.agDia.slice(0, 7); return render(); }
        const [a, m2] = base.split('-').map(Number), x = new Date(a, m2 - 1 + Number(b.dataset.v), 1);
        UI.agMes = x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0'); return render();
      }
      case 'novo-grupo-musica': e.preventDefault(); return abrirModal({ tipo: 'grupo-musica' });
      case 'musica-grupo': fecharMenu(); return abrirModal({ tipo: 'musica-grupo', id });
      case 'tar-ok': e.preventDefault(); return alternarTarefa(b.dataset.id);
      case 'tar-fazendo': { e.preventDefault(); const i = item(b.dataset.id); return mudarEtapa(i.id, etapa(i) === 'fazendo' ? 'afazer' : 'fazendo'); }
      case 'tar-visao': e.preventDefault(); UI.tarefaVisao = b.dataset.v; UI.pularColheita = true; return render();
      case 'tar-feitas': e.preventDefault(); UI.verFeitas = !UI.verFeitas; UI.pularColheita = true; return render();
      case 'tar-para': e.preventDefault(); return mudarEtapa(b.dataset.id, b.dataset.v);
      case 'descartar-rascunho': {
        if (!(await confirmar('Descartar o que você digitou?'))) return;
        limparRascunho(b.dataset.k); UI.pularColheita = true; UI.modal = null; return render();
      }
      case 'add-campo': { const k = b.dataset.k; (UI.extras[k] = UI.extras[k] || []).push(b.dataset.campo); return render(); }
      case 'nota-item': e.preventDefault(); return alternarItemLista(b.dataset.id, b.dataset.item);
      case 'form-modo': {
        colherRascunhos();
        const k = UI.modal.tipo === 'editar' ? 'editar:' + UI.modal.id : 'criar:nota';
        RASC[k] = Object.assign(RASC[k] || {}, { modo: b.dataset.v }); salvarRasc();
        UI.pularColheita = true; return render();
      }
      case 'form-formato': {
        colherRascunhos();
        const k = UI.modal.tipo === 'editar' ? 'editar:' + UI.modal.id : 'criar:midia';
        RASC[k] = Object.assign(RASC[k] || {}, { formato: b.dataset.v }); salvarRasc();
        UI.pularColheita = true; return render();
      }
      case 'img-remover': { UI.imagens[b.dataset.k] = ''; return render(); }
      case 'estrelas-limpar': { const f = b.closest('.campo'); f.querySelectorAll('input').forEach((x) => (x.checked = false)); return; }
      case 'midia-concluir': { const ok = i.status !== 'concluido'; i.status = ok ? 'concluido' : (i.paginaAtual ? 'andamento' : 'quero'); toast(ok ? 'Marcado como ' + (i.formato === 'filme' ? 'assistido' : 'lido') + '.' : (i.status === 'andamento' ? 'Voltou para ' + (i.formato === 'filme' ? 'assistindo' : 'lendo') + '.' : 'Voltou para a fila.')); return passa(); }
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
          if (i.preco != null && await confirmar(`Marcado como comprado.\n\nRegistrar um gasto de ${brl(i.preco, i.moeda)} hoje?`, { ok: 'Registrar gasto', cancelar: 'Agora não', perigo: false, icone: 'check-circle' }))
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
        { const c = document.querySelector(`[data-form="comentar"][data-id="${id}"] textarea`); if (c) c.focus(); } return;
      case 'editar-item': fecharMenu(); return abrirModal({ tipo: 'editar', id });
      case 'excluir-item': fecharMenu(); if (UI.modal && UI.modal.tipo === 'item-ver') fecharModal(); return excluirItem(i);
      case 'abrir-fora': fecharMenu(); window.open(i.url, '_blank', 'noopener'); return;
      case 'copiar-link': fecharMenu(); navigator.clipboard && navigator.clipboard.writeText(i.url).then(() => toast('Endereço copiado.', 'copy'), () => toast('Não consegui copiar.')); return;
      case 'organizar-em': fecharMenu(); UI.moverUm = id; return abrirModal({ tipo: 'mover-lote' });
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
        if (!(await confirmar(`Excluir a pasta “${pasta(id).nome}”?\n\n${n} artigo(s) ficam sem pasta, mas continuam guardados.`))) return;
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
        if (!(await confirmar(`Excluir a coleção “${c.nome}”?\n\nOs ${n} item(ns) continuam guardados; só o agrupamento é desfeito.`))) return;
        S.colecoes = S.colecoes.filter((x) => x.id !== id);
        S.itens.forEach((x) => (x.colecoes = x.colecoes.filter((y) => y.id !== id)));
        Object.keys(S.destinoPadrao).forEach((k) => { if (S.destinoPadrao[k] === id) S.destinoPadrao[k] = ''; });
        if (UI.colSel === id) UI.colSel = 'todas';
        if (UI.muralCol === id) UI.muralCol = 'todas';
        return passa();
      }
      case 'wl-filtro': UI.wlFiltro = b.dataset.v; return render();
      case 'lemb-concluir': { const l = lembrete(id); l.concluido = true; l.concluidoEm = agora();
        // Lembrete que veio de uma tarefa: concluir aqui também risca a tarefa.
        if (l.motivo === 'tarefa' && l.itemId) { const tf = item(l.itemId); if (tf) { tf.concluida = true; tf.etapa = 'feito'; tf.editadoEm = agora(); } }
        toast(l.motivo === 'tarefa' ? 'Tarefa concluída.' : 'Lembrete concluído.', 'check-circle-solid'); return passa(); }
      case 'lemb-reabrir': { const l = lembrete(id); l.concluido = false; return passa(); }
      case 'lemb-adiar': { const l = lembrete(id); return abrirModal({ tipo: 'editar', id: l.id }); }
      case 'excluir-lembrete': { fecharMenu(); const l = lembrete(id); if (!(await confirmar(`Excluir o lembrete “${l.texto}”?`))) return; if (window.SONS) SONS.tocar('excluir'); S.lembretes = S.lembretes.filter((x) => x.id !== id); return passa(); }
      case 'modo': {
        S.perfil.modo = b.dataset.v; UI.modoPrevia = null;
        salvar(); aplicarTema(); renderTopo();
        const d = document.querySelector('.menu-perfil'); if (d) d.setAttribute('open', '');
        return;
      }
      case 'sair': fecharMenu(); return sair();
      case 'foto-google': fecharMenu(); S.perfil.foto = conta().foto; return passa();
      case 'foto-trocar': fecharMenu(); delete UI.imagens['foto-perfil']; return abrirModal({ tipo: 'foto-perfil' });
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
        if (!(await confirmar('Apagar tudo deste navegador e recarregar os dados de exemplo?\n\nExporte um backup antes.', { ok: 'Apagar tudo' }))) return;
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
        if (!(await confirmar(`Excluir “${SEC[s].titulo(it)}”?`))) return;
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
      return definirImagem(t.dataset.k, t.dataset.formato, f);
    }
    if (act === 'ma-grupo') { UI.grupoMusica = t.value; UI.pularColheita = true; return pintarMiniApp(); }
    if (act === 'destino' && t.value === '__nova') { t.value = ''; return abrirModal({ tipo: 'colecao', voltar: UI.modal }); }
    if (act === 'dia-sel' && t.value) { UI.dia = t.value; return render(); }
    if (act === 'mural-col') { UI.muralCol = t.value; return render(); }
    if (act === 'col-select') { UI.colSel = t.value; return render(); }
    if (act === 'col-tipo') { UI.colTipo = t.value; return render(); }
    if (act === 'som-vol') { S.perfil.somVolume = Number(t.value); salvar(); return SONS.tocar('favoritar'); }
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
    const rg = e.target.closest && e.target.closest('input[data-act="amb-nivel"]');
    if (rg && window.SONS) {
      const A = SONS.ambiente;
      if (rg.dataset.id === 'geral') A.geral(rg.value); else A.nivel(rg.dataset.id, rg.value);
      if (!A.tocando() && Number(rg.value) > 0) { A.ligar(); pintarAmbiente(); }
      return;
    }
  });
  document.addEventListener('change', (e) => { if (e.target.matches && e.target.matches('input[data-act="amb-nivel"]')) salvarAmbiente(); });
  document.addEventListener('input', (e) => {
    if (e.target.matches && e.target.matches('.humor-rapido [name=humorEmoji]')) {
      const v = e.target.value.trim();
      if (v) { const g = typeof Intl !== 'undefined' && Intl.Segmenter ? [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(v)].map((x) => x.segment) : [...v]; e.target.value = g[g.length - 1]; }
      e.target.closest('form').querySelectorAll('[data-act=humor-emoji]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.v === e.target.value)));
    }
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
  /* Campo de nova tarefa: cresce com o texto colado e avisa quantas tarefas vão sair dele. */
  modal.addEventListener('input', (e) => {
    const a = e.target;
    if (!a.classList || !a.classList.contains('uma-linha')) return;
    a.style.height = 'auto';
    a.style.height = Math.min(a.scrollHeight, 220) + 'px';
    const dica = modal.querySelector('#dica-colar span');
    if (!dica) return;
    const n = linhasDe(a.value).length;
    dica.textContent = n > 1 ? `São ${n} linhas: vira ${n} tarefas, com o mesmo prazo e a mesma coleção.`
      : 'Colou uma lista? Cada linha vira uma tarefa.';
  });

  // Esc fecha; clicar fora, não — para não perder o que está sendo escrito.
  modal.addEventListener('cancel', (e) => { e.preventDefault(); fecharModal(); });

  /* ---------------- envio de formulários ---------------- */
  document.addEventListener('submit', (e) => {
    const f = e.target, tipo = f.dataset.form;
    if (!tipo) return;
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f).entries());
    const t = agora();
    const ok = (msg, icone) => { salvar(); UI.pularColheita = true; if (msg) toast(msg, icone); };

    if (tipo === 'humor-rapido') {
      const emoji = (d.humorEmoji || '').trim(), texto = (d.humorTexto || '').trim();
      if (!emoji && !texto) delete S.perfil.humores[hoje()];
      else S.perfil.humores[hoje()] = { emoji, texto };
      document.querySelectorAll('details.menu[open]').forEach((x) => x.removeAttribute('open'));
      ok('Anotado.', 'check-circle-solid'); return render();
    }
    if (tipo === 'evento') {
      const titulo = (d.titulo || '').trim();
      if (!titulo) return toast('Dê um nome ao evento.');
      if (!d.data) return toast('Escolha o dia.');
      S.eventos = S.eventos || [];
      const e = f.dataset.id ? evento(f.dataset.id) : null;
      const foto = UI.imagens['evfoto'] !== undefined ? UI.imagens['evfoto'] : ((e && e.foto) || '');
      delete UI.imagens['evfoto'];
      if (e) { Object.assign(e, { titulo, data: d.data, hora: d.hora || '', nota: (d.nota || '').trim(), contagem: !!d.contagem }); if (foto) e.foto = foto; else delete e.foto; }
      else S.eventos.push(Object.assign({ id: uid('ev'), titulo, data: d.data, hora: d.hora || '', nota: (d.nota || '').trim(), contagem: !!d.contagem, criadoEm: agora() }, foto ? { foto } : {}));
      UI.agDia = d.data; UI.agMes = d.data.slice(0, 7); UI.modal = null;
      if (window.SONS) SONS.tocar('guardar');
      salvar(); toast(e ? 'Evento salvo.' : 'Evento guardado.', 'check-circle-solid');
      if (rotaAtual()[0] !== 'agenda') { location.hash = '#/agenda'; return; }
      return render();
    }
    if (tipo === 'grupo-musica') {
      const nome = (d.nome || '').trim();
      if (!nome) return toast('Dê um nome ao grupo.');
      S.gruposMusica = S.gruposMusica || [];
      if (f.dataset.id) { const g = grupoMusica(f.dataset.id); if (g) g.nome = nome; }
      else { const g = { id: uid('gmus'), nome }; S.gruposMusica.push(g); UI.grupoMusica = g.id; }
      UI.modal = null; ok('Grupo guardado.', 'folder'); return render();
    }
    if (tipo === 'grupo-imagem') {
      const nome = (d.nome || '').trim();
      if (!nome) return toast('Dê um nome ao grupo.');
      S.gruposImagem = S.gruposImagem || [];
      if (f.dataset.id) { const g = grupoImagem(f.dataset.id); if (g) g.nome = nome; }
      else { const g = { id: uid('gimg'), nome }; S.gruposImagem.push(g); UI.grupoImagem = g.id; }
      UI.modal = null; ok('Grupo guardado.', 'folder'); return render();
    }
    if (tipo === 'mover-lote') {
      const ids = UI.moverUm ? [UI.moverUm] : (UI.sel || []);
      ids.map(item).filter(Boolean).forEach((x) => { x.colecoes = d.colecao ? [{ id: d.colecao, grupo: '' }] : []; x.organizar = !x.colecoes.length; x.editadoEm = agora(); });
      if (UI.moverUm) UI.moverUm = null; else UI.sel = []; UI.modal = null; ok(ids.length + ' movido(s).', 'folder'); return render();
    }
    if (tipo === 'imagem-grupo') {
      const i = item(f.dataset.id);
      if (i) { i.grupo = d.grupo || ''; i.editadoEm = agora(); }
      UI.modal = null; ok('Movida.', 'folder'); return render();
    }
    if (tipo === 'foto-perfil') {
      const u = UI.imagens['foto-perfil'];
      if (u !== undefined) S.perfil.foto = u || null;
      delete UI.imagens['foto-perfil'];
      UI.modal = null; ok('Foto atualizada.', 'check-circle-solid'); return render();
    }
    if (tipo === 'musica-grupo') {
      const i = item(f.dataset.id);
      if (i) { i.grupo = d.grupo || ''; i.editadoEm = agora(); }
      UI.modal = null; ok('Movida.', 'folder'); return render();
    }
    if (tipo === 'criar' || tipo === 'editar') {
      const alvo = f.dataset.t, id = f.dataset.id;
      const k = tipo === 'editar' ? 'editar:' + id : 'criar:' + alvo;
      const img = UI.imagens[k];
      if (alvo === 'lembrete') {
        if (!d.texto.trim() || !d.data) return toast('Informe o texto e a data.');
        if (tipo === 'editar') { const l = lembrete(id); Object.assign(l, { texto: d.texto.trim(), data: d.data, hora: d.hora || '' }); }
        else S.lembretes.push({ id: uid('lemb'), texto: d.texto.trim(), data: d.data, hora: d.hora || '', itemId: (UI.modal && UI.modal.itemId) || null, concluido: false, criadoEm: t });
        limparRascunho(k); UI.modal = null; UI.colPadrao = null; ok('Lembrete guardado.', 'alarm'); return render();
      }
      let i = tipo === 'editar' ? item(id) : null;
      const novo = !i;
      if (novo) i = { id: uid(alvo.slice(0, 3)), tipo: alvo, colecoes: [], comentarios: [], favorito: false, criadoEm: t };
      if (alvo === 'nota') {
        if (!d.texto || !d.texto.trim()) return toast('Escreva o texto da nota.');
        if (novo && ehURL(d.texto) && !d.titulo) return toast('Isso parece um endereço. Guarde como Link para ter a prévia.');
        Object.assign(i, { titulo: (d.titulo || '').trim(), texto: d.texto.trim(), cor: d.cor || i.cor });
        i.modo = d.modo === 'lista' ? 'lista' : 'texto';
        if (i.modo === 'lista') {
          i.lista = listaDoTexto(d.texto, i.lista || []);
          if (!i.lista.length) return toast('Escreva pelo menos um item.');
        } else delete i.lista;
        if (d.destino !== undefined) { i.colecoes = d.destino ? [{ id: d.destino, grupo: '' }] : []; i.organizar = !d.destino; if (novo) S.destinoPadrao.nota = d.destino; }
        if (novo) i.ordem = Math.min(0, ...doTipo('nota').map((x) => x.ordem ?? 0)) - 1;
      } else if (alvo === 'link' || alvo === 'desejo' || alvo === 'artigo' || alvo === 'musica') {
        let url = (d.url || '').trim();
        if (!url) return toast('Cole o endereço.');
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        try { new URL(url); } catch (er) { return toast('Esse endereço não parece válido.'); }
        if (novo) {
          const ja = S.itens.find((x) => x.tipo === alvo && x.url === url);
          if (ja) { limparRascunho(k); UI.modal = null; UI.colPadrao = null; UI.pularColheita = true; render(); toast('Isso já está guardado.'); location.hash = '#/item/' + ja.id; return; }
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
        if (alvo === 'musica') {
          const y = doYouTube(url);
          if (!y.video && !y.lista) return toast('Esse link não parece ser do YouTube.');
          i.video = y.video; i.listaYT = y.lista;
          if (d.artista !== undefined) i.artista = d.artista.trim();
          if (d.grupo !== undefined) i.grupo = d.grupo;
          if (novo) i.ordem = Math.min(0, ...musicas().map((x) => x.ordem ?? 0)) - 1;
          if (d.destino !== undefined) i.colecoes = d.destino ? [{ id: d.destino, grupo: '' }] : [];
          if (novo) i.titulo = i.titulo || (y.lista && !y.video ? 'Playlist do YouTube' : 'Música do YouTube');
        }
        if (alvo === 'desejo') {
          i.moeda = i.moeda || 'BRL'; i.historicoPreco = i.historicoPreco || []; i.comprado = i.comprado || false;
          if (!novo) {
            const p = d.preco === '' || d.preco === undefined ? null : parseFloat(d.preco);
            if (p !== i.preco) { i.preco = p; if (p != null) i.historicoPreco.push({ em: t, preco: p, manual: true }); }
            if (d.loja !== undefined) i.loja = d.loja.trim();
            if (img !== undefined) { i.imagem = img; i.imagemManual = !!img; }
          } else i.preco = null;
        }
      } else if (alvo === 'imagem') {
        const src = img !== undefined ? img : i.src;
        if (!src) return toast('Escolha, cole ou arraste uma imagem.');
        if (img !== undefined) { i.src = src; i.origem = UI.origens[k] || ''; }
        if (d.titulo !== undefined) i.titulo = d.titulo.trim();
        if (d.nota !== undefined) i.nota = d.nota.trim();
        if (d.grupo !== undefined) i.grupo = d.grupo;
        if (d.destino !== undefined) { i.colecoes = d.destino ? [{ id: d.destino, grupo: '' }] : []; i.organizar = !d.destino; if (novo) S.destinoPadrao.imagem = d.destino; }
        else if (novo) i.organizar = true;
      } else if (alvo === 'midia') {
        if (!d.titulo.trim()) return toast('Informe o nome.');
        Object.assign(i, { formato: d.formato === 'filme' ? 'filme' : 'livro', titulo: d.titulo.trim(), autor: (d.autor || '').trim(),
          status: d.status || 'quero', ano: d.ano ? +d.ano : '', generos: (d.generos || '').split(',').map((g) => g.trim()).filter(Boolean),
          estrelas: d.estrelas ? +d.estrelas : (i.estrelas ?? null), resumo: (d.resumo || '').trim(), comentario: (d.comentario || '').trim(),
          paginaAtual: d.paginaAtual ? +d.paginaAtual : i.paginaAtual, paginas: d.paginas ? +d.paginas : i.paginas });
        i.anotacoes = i.anotacoes || [];
        if (img !== undefined) { if (img) i.capa = img; else delete i.capa; }
      } else if (alvo === 'tarefa') {
        const linhas = linhasDe(d.titulo);
        if (!linhas.length) return toast('Escreva o que precisa ser feito.');
        const et = d.etapa && ETAPAS[d.etapa] ? d.etapa : etapa(i);
        const cols = d.destino !== undefined ? (d.destino ? [{ id: d.destino, grupo: '' }] : []) : (i.colecoes || []);
        if (d.destino !== undefined && novo) S.destinoPadrao.tarefa = d.destino;
        // Lista colada: cada linha vira uma tarefa, com o mesmo prazo e a mesma coleção.
        if (novo && linhas.length > 1) {
          const feitas = linhas.map((titulo) => {
            const nova = { id: uid('tar'), tipo: 'tarefa', colecoes: cols.slice(), comentarios: [], favorito: false, criadoEm: t,
              titulo, descricao: (d.descricao || '').trim(), prazo: d.prazo || '', etapa: et, concluida: et === 'feito' };
            S.itens.push(nova);
            sincronizarPrazo(nova, d.prazo ? !!d.avisar : false);
            return nova;
          });
          salvar(); limparRascunho(k); UI.modal = null; UI.colPadrao = null; UI.pularColheita = true; render();
          return toast(feitas.length + ' tarefas guardadas.', 'list');
        }
        Object.assign(i, { titulo: linhas[0], prazo: d.prazo || '', etapa: et, concluida: et === 'feito' });
        if (d.descricao !== undefined) i.descricao = d.descricao.trim();
        if (d.destino !== undefined) i.colecoes = cols;
        sincronizarPrazo(i, d.prazo ? !!d.avisar : false);
      } else if (alvo === 'gasto') {
        const v = parseFloat(String(d.valor).replace(',', '.'));
        if (!(v > 0)) return toast('Informe um valor maior que zero.');
        if (!d.descricao.trim()) return toast('Informe a descrição.');
        Object.assign(i, { valor: Math.round(v * 100) / 100, dataGasto: d.dataGasto || hoje(), descricao: d.descricao.trim(), categoria: (d.categoria || '').trim() });
      }
      if (!novo) i.editadoEm = t;
      if (novo) S.itens.push(i);
      if (!salvar()) {
        if (alvo === 'imagem' && novo) { S.itens = S.itens.filter((x) => x !== i); return; }
        if (i.capa) { delete i.capa; salvar(); toast('Salvei sem a capa: o armazenamento está cheio.'); }
      }
      delete UI.origens[k];
      limparRascunho(k); UI.modal = null; UI.colPadrao = null; UI.pularColheita = true;
      if (novo && (alvo === 'link' || alvo === 'desejo' || alvo === 'artigo' || alvo === 'musica')) { render(); return capturar(i); }
      render();
      if (window.SONS) SONS.tocar('guardar');
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
    if (tipo === 'clima-local') {
      const q = (d.cidade || '').trim(), msg = document.getElementById('clima-msg'); if (!q) return;
      if (msg) msg.textContent = 'Buscando…';
      climaBuscar(q).then((l) => { if (l) climaDefinir(l); else if (msg) msg.textContent = 'Não achei essa cidade. Confira o nome.'; })
        .catch(() => { if (msg) msg.textContent = 'Sem conexão com o serviço de previsão.'; });
      return;
    }
    if (tipo === 'pet-nome') {
      const nome = (d.nome || '').trim().slice(0, 14);
      S.perfil.petNome = nome; UI.modal = null; ok(nome ? 'Nome salvo.' : 'Nome removido.');
      render(); if (nome) { petLatir(); petFalar('Eu sou ' + nome + '!', 2.2); }
      return;
    }
    if (tipo === 'comentar') {
      const it = item(f.dataset.id);
      if (!d.texto.trim()) return;
      it.comentarios = it.comentarios || [];
      it.comentarios.push({ id: uid('com'), texto: d.texto.trim(), em: t });
      if (!UI.modal) UI.comentando = it.id;
      ok(); render();
      { const c = document.querySelector(`[data-form="comentar"][data-id="${it.id}"] textarea`); if (c) c.focus(); }
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
    r.onload = async () => {
      let raw;
      try { raw = JSON.parse(r.result); } catch (er) { return toast('Esse arquivo não é um JSON válido.'); }
      if (!raw || !Array.isArray(raw.itens) || !raw.perfil || !Array.isArray(raw.colecoes)) return toast('Esse arquivo não é um backup da Tyba.');
      if (!(await confirmar(`Substituir os dados deste navegador pelo backup “${f.name}” (${raw.itens.length} registros)?\n\nO que está aqui agora será trocado pelo conteúdo do arquivo.`, { ok: 'Substituir' }))) return;
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

  // Shift + Espaço abre e fecha o modo trabalho (fora de campos de texto).
  document.addEventListener('keydown', (e) => {
    const escrevendo = e.target.closest && e.target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]');
    if (e.shiftKey && (e.code === 'Space' || e.key === ' ') && !escrevendo && !UI.modal) { e.preventDefault(); return alternarTrabalho(); }
    if (e.key === 'Escape' && UI.modoTrabalho && !UI.modal) { e.preventDefault(); return alternarTrabalho(false); }
  });

  // Comentário: Enter envia, Shift+Enter quebra a linha; o campo cresce conforme você escreve.
  document.addEventListener('keydown', (e) => {
    const c = e.target.closest && e.target.closest('.comentar textarea');
    if (c && e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (c.value.trim()) c.form.requestSubmit(); }
  });
  document.addEventListener('input', (e) => {
    const c = e.target.closest && e.target.closest('.comentar textarea');
    if (c) { c.style.height = 'auto'; c.style.height = Math.min(c.scrollHeight + 2, 220) + 'px'; }
  });

  // Enter e espaço valem como clique no que é botão por papel (o post-it, por exemplo).
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const n = e.target.closest && e.target.closest('[role="button"][data-act]');
    if (!n || n.tagName === 'BUTTON' || n.tagName === 'A') return;
    e.preventDefault(); n.click();
  });

  /* ---------------- arrastar para reordenar ----------------
     O item fica "na mão": segue o ponteiro, levemente inclinado, e os outros abrem espaço na hora.
     Vale para post-its, faixas do mini app, áreas do menu e blocos da direita (data-ordena="grupo" + data-oid="id").
     No toque, segure um instante para pegar (assim a tela ainda rola). Esc cancela. */
  const SALVAR_ORDEM = {
    notas(ids) { reordenarPorValores(ids); },
    musicas(ids) { reordenarPorValores(ids); },
    areas(ids) { S.perfil.ordemNav = ids.concat(areasOrdenadas().map((a) => a[0]).filter((r) => !ids.includes(r))); },
    abas(ids) { const g = GRUPO_DE[ids[0]]; if (!g) return; S.perfil.ordemAbas = S.perfil.ordemAbas || {}; S.perfil.ordemAbas[g] = ids.concat(abasOrdenadas(g).filter((r) => !ids.includes(r))); },
    blocos(ids) { S.perfil.ordemDireita = ids.concat(ordemDireita().filter((x) => !ids.includes(x))); }
  };
  /** Redistribui os valores de "ordem" já usados entre os itens, na nova sequência (o resto da lista não muda de lugar). */
  function reordenarPorValores(ids) {
    const l = ids.map(item).filter(Boolean);
    const v = l.map((x) => x.ordem ?? 0).sort((a, b) => a - b);
    const unico = v.every((x, k) => !k || x > v[k - 1]);
    l.forEach((x, k) => { x.ordem = unico ? v[k] : v[0] + k; });
  }
  (function ordenarArrastando() {
    let s = null;
    const IGNORA = 'button, input, select, textarea, summary, details.menu, label, [data-nodrag]';
    const irmaos = (c, g) => [...c.children].filter((x) => x.dataset && x.dataset.ordena === g);
    const dentro = (r, x, y) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    /** Muda o DOM e anima cada irmão do lugar antigo para o novo (técnica FLIP). */
    function animarTroca(els, mudar) {
      const antes = new Map(els.map((x) => [x, x.getBoundingClientRect()]));
      els.forEach((x) => { x.style.transition = 'none'; x.style.transform = ''; });
      mudar(); empacotarTudo();
      els.forEach((x) => {
        const a = antes.get(x), d = x.getBoundingClientRect(), dx = a.left - d.left, dy = a.top - d.top;
        if (!dx && !dy) return;
        x.style.transform = `translate(${dx}px, ${dy}px)`; x.getBoundingClientRect();
        x.style.transition = 'transform .2s ease-out'; x.style.transform = '';
      });
    }
    function rolavel(el) {
      for (let n = el; n && n !== document.body; n = n.parentElement) { const o = getComputedStyle(n).overflowY; if ((o === 'auto' || o === 'scroll') && n.scrollHeight > n.clientHeight) return n; }
      return null;
    }
    function iniciar() {
      if (!s || s.ativo) return;
      s.ativo = true; UI.arrastando = true; clearTimeout(s.timer);
      const it = s.it, r = it.getBoundingClientRect();
      s.dx = s.x - r.left; s.dy = s.y - r.top; s.proximo = it.nextSibling; s.ordemIni = irmaos(s.c, s.g).map((x) => x.dataset.oid).join();
      const f = it.cloneNode(true);
      f.removeAttribute('data-ordena'); f.removeAttribute('data-act'); f.removeAttribute('id'); f.classList.add('fantasma');
      f.style.cssText = `width:${r.width}px;height:${r.height}px;transform:translate(0,0)`;
      s.c.appendChild(f);
      const base = f.getBoundingClientRect(); s.ox = base.left; s.oy = base.top; s.f = f;
      s.c.querySelectorAll('.ma-faixas, .ma-vazio').forEach((x) => { x.style.display = 'none'; });
      it.classList.add('vaga'); document.body.classList.add('arrastando-ord');
      s.rolar = rolavel(s.c); s.tilt = 0; s.pxAnt = s.x; s.ultTroca = 0;
      const volta = () => { if (!s || !s.ativo) return; quadro(); s.raf = requestAnimationFrame(volta); };
      s.raf = requestAnimationFrame(volta);
    }
    function quadro() {
      const px = s.x - s.dx, py = s.y - s.dy;
      s.tilt += (Math.max(-6, Math.min(6, (px - s.pxAnt) * .6)) - s.tilt) * .2; s.pxAnt = px;
      s.f.style.transform = `translate(${px - s.ox}px, ${py - s.oy}px) rotate(${s.tilt.toFixed(2)}deg)`;
      // quem está sob o ponteiro abre espaço: o item pega o lugar dele
      const cs = irmaos(s.c, s.g), agora = performance.now();
      // só troca depois que a troca anterior assentou e se o ponteiro não está sobre a própria vaga (evita o vaivém)
      const sobreVaga = dentro(s.it.getBoundingClientRect(), s.x, s.y);
      const alvo = !sobreVaga && agora - s.ultTroca > 230 ? cs.find((x) => x !== s.it && dentro(x.getBoundingClientRect(), s.x, s.y)) : null;
      if (alvo) {
        s.ultTroca = agora;
        animarTroca(cs, () => s.c.insertBefore(s.it, cs.indexOf(s.it) < cs.indexOf(alvo) ? alvo.nextSibling : alvo));
      }
      // perto da borda: rola a tela (ou a lista) junto
      const area = s.rolar ? s.rolar.getBoundingClientRect() : { top: 0, bottom: innerHeight };
      const passo = s.y < area.top + 56 ? -14 : s.y > area.bottom - 56 ? 14 : 0;
      if (passo) (s.rolar || window).scrollBy(0, passo);
    }
    function encerrar(cancelar) {
      if (!s) return;
      const sessao = s; s = null; clearTimeout(sessao.timer); cancelAnimationFrame(sessao.raf);
      if (!sessao.ativo) return;
      UI.arrastando = false;
      document.body.classList.remove('arrastando-ord');
      sessao.c.querySelectorAll('.ma-faixas, .ma-vazio').forEach((x) => { x.style.display = ''; });
      if (cancelar) sessao.c.insertBefore(sessao.it, sessao.proximo);
      const alvo = sessao.it.getBoundingClientRect(), f = sessao.f;
      f.style.transition = 'transform .18s ease-out, box-shadow .18s ease-out';
      f.style.transform = `translate(${alvo.left - sessao.ox}px, ${alvo.top - sessao.oy}px) rotate(0deg)`; f.style.boxShadow = 'none';
      setTimeout(() => { f.remove(); sessao.it.classList.remove('vaga'); }, 190);
      sessao.it.style.transition = ''; irmaos(sessao.c, sessao.g).forEach((x) => { x.style.transition = ''; x.style.transform = ''; });
      suprimirClique = true; setTimeout(() => { suprimirClique = false; }, 60);
      const ids = irmaos(sessao.c, sessao.g).map((x) => x.dataset.oid);
      if (!cancelar && ids.join() !== sessao.ordemIni) { SALVAR_ORDEM[sessao.g](ids); salvar(); UI.pularColheita = true; render(); }
      else if (UI.renderPendente) { UI.pularColheita = true; render(); }
      UI.renderPendente = false;
    }
    let suprimirClique = false;
    document.addEventListener('click', (e) => { if (suprimirClique) { e.stopPropagation(); e.preventDefault(); } }, true);
    document.addEventListener('dragstart', (e) => { if (e.target.closest && e.target.closest('[data-ordena]')) e.preventDefault(); });
    document.addEventListener('contextmenu', (e) => { if (s && s.toque) e.preventDefault(); });
    document.addEventListener('touchmove', (e) => { if (s && s.ativo) e.preventDefault(); }, { passive: false });
    document.addEventListener('pointerdown', (e) => {
      if (s || (e.pointerType === 'mouse' && e.button !== 0) || !SALVAR_ORDEM || UI.modal) return;
      const it = e.target.closest && e.target.closest('[data-ordena]');
      if (!it || !SALVAR_ORDEM[it.dataset.ordena]) return;
      const interno = e.target.closest(IGNORA);
      if (interno && it.contains(interno) && interno !== it) return;
      s = { it, g: it.dataset.ordena, c: it.parentElement, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, id: e.pointerId, toque: e.pointerType !== 'mouse', ativo: false };
      if (s.toque) s.timer = setTimeout(iniciar, 280);
    });
    document.addEventListener('pointermove', (e) => {
      if (!s || e.pointerId !== s.id) return;
      s.x = e.clientX; s.y = e.clientY;
      if (s.ativo) return;
      const d = Math.hypot(s.x - s.x0, s.y - s.y0);
      if (s.toque) { if (d > 9) { clearTimeout(s.timer); s = null; } } else if (d > 5) iniciar();
    });
    document.addEventListener('pointerup', (e) => { if (s && e.pointerId === s.id) encerrar(false); });
    document.addEventListener('pointercancel', (e) => { if (s && e.pointerId === s.id) encerrar(true); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && s && s.ativo) { e.stopPropagation(); encerrar(true); } }, true);
  })();
  /* ---------------- imagem: colar, soltar e arrastar para grupo ---------------- */
  const campoDeTexto = (el) => el && el.closest && el.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]');
  document.addEventListener('paste', (e) => {
    const dt = e.clipboardData;
    if (!dt || UI.sessao.modo === 'deslogado') return;
    const arq = arquivoDeImagem(dt);
    const envio = UI.modal && modal.open ? modal.querySelector('[data-envio]') : null;
    const campo = campoDeTexto(e.target);
    if (envio) {
      const k = envio.dataset.envio, fmt = envio.dataset.formato;
      if (arq) { e.preventDefault(); return definirImagem(k, fmt, arq); }
      if (campo && campo.dataset.act === 'img-link') {
        setTimeout(() => { const v = campo.value.trim(); if (/^https?:\/\//i.test(v)) { campo.value = ''; definirImagem(k, fmt, v); } }, 0);
        return;
      }
      const l = !campo && linkDeImagem(dt);
      if (l) { e.preventDefault(); return definirImagem(k, fmt, l); }
      return;
    }
    if (UI.modal || campo) return;
    const pagina = rotaAtual()[0], tipoLink = pagina === 'wishlist' ? 'desejo' : pagina === 'links' ? 'link' : '';
    if (tipoLink && !arq) {
      const linhas = (dt.getData('text/plain') || '').split(/\s+/).filter((x) => x && ehURL(x)).slice(0, 10);
      if (linhas.length) { e.preventDefault(); linhas.forEach((u) => guardarLinkRapido(u, tipoLink)); return; }
    }
    if (arq) { e.preventDefault(); return guardarImagemRapido(arq); }
    const l = linkDeImagem(dt);
    if (l && (EXT_IMAGEM.test(l) || rotaAtual()[0] === 'imagens')) { e.preventDefault(); guardarImagemRapido(l); }
  });
  const temArquivos = (e) => e.dataTransfer && [...(e.dataTransfer.types || [])].includes('Files');
  document.addEventListener('dragover', (e) => {
    if (!temArquivos(e)) return;
    e.preventDefault();
    document.querySelectorAll('.envio-alvo.sobre').forEach((x) => x.classList.remove('sobre'));
    const z = e.target.closest && e.target.closest('[data-envio]');
    if (z) { const a = z.querySelector('.envio-alvo'); if (a) a.classList.add('sobre'); }
  });
  document.addEventListener('dragleave', (e) => { if (!e.relatedTarget) document.querySelectorAll('.envio-alvo.sobre').forEach((x) => x.classList.remove('sobre')); });
  document.addEventListener('drop', (e) => {
    document.querySelectorAll('.envio-alvo.sobre').forEach((x) => x.classList.remove('sobre'));
    if (!temArquivos(e)) return;
    const arq = arquivoDeImagem(e.dataTransfer);
    if (!arq) return;
    e.preventDefault();
    const z = e.target.closest && e.target.closest('[data-envio]');
    if (z) return definirImagem(z.dataset.envio, z.dataset.formato, arq);
    if (UI.modal) return;
    [...e.dataTransfer.files].filter((x) => /^image\//.test(x.type)).forEach((x) => guardarImagemRapido(x));
  });
  let arrastandoImg = null;
  document.addEventListener('dragstart', (e) => {
    const p = e.target.closest && e.target.closest('[data-imagem]');
    if (!p) return;
    arrastandoImg = p.dataset.imagem; p.classList.add('arrastando'); e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', arrastandoImg); } catch (er) { /* ignora */ }
  });
  document.addEventListener('dragover', (e) => {
    const a = arrastandoImg && e.target.closest && e.target.closest('[data-grupo-alvo]');
    if (!a) return;
    e.preventDefault();
    document.querySelectorAll('.alvo-solta').forEach((x) => x.classList.remove('alvo-solta'));
    a.classList.add('alvo-solta');
  });
  document.addEventListener('drop', (e) => {
    const a = arrastandoImg && e.target.closest && e.target.closest('[data-grupo-alvo]');
    if (!a) return;
    e.preventDefault();
    const i = item(arrastandoImg); arrastandoImg = null;
    if (!i) return;
    i.grupo = a.dataset.grupoAlvo === 'soltas' ? '' : a.dataset.grupoAlvo; i.editadoEm = agora();
    salvar(); UI.pularColheita = true; render(); toast('Movida.', 'folder');
  });
  document.addEventListener('dragend', () => { arrastandoImg = null; document.querySelectorAll('.arrastando, .alvo-solta').forEach((x) => x.classList.remove('arrastando', 'alvo-solta')); });
  /* No visualizador, as setas do teclado passam as imagens; no campo do link, Enter usa o link em vez de enviar o formulário. */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.id === 'onb-nome') { e.preventDefault(); const nx = document.querySelector('[data-act="onb-prox"]'); if (nx) nx.click(); return; }
    if (e.key === 'Enter' && e.target.dataset && e.target.dataset.act === 'img-link') {
      e.preventDefault();
      const v = e.target.value.trim(); if (!v) return;
      e.target.value = ''; return definirImagem(e.target.dataset.k, e.target.dataset.formato, v);
    }
    if (UI.modal && UI.modal.tipo === 'imagem-ver' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !campoDeTexto(e.target)) {
      e.preventDefault();
      const l = imagens(), n = l.findIndex((x) => x.id === UI.modal.id);
      if (n >= 0 && l.length > 1) { UI.modal = { tipo: 'imagem-ver', id: l[(n + (e.key === 'ArrowRight' ? 1 : -1) + l.length) % l.length].id }; render(); }
    }
  });

  /* ---------------- janelas: mover e redimensionar ---------------- */
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
    const novo = !S;
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
    // Espaço recém-criado já começa em dia: o popup é para quem volta e encontra o sistema mudado.
    const veioDeFora = rotaAtual()[0] === 'novo' || /[?&](url|texto|titulo)=/.test(location.search);
    if (veioDeFora) { UI.pularColheita = true; tratarEntrada(); if (novo) marcarNovidadesVistas(); pintarAvisoPwa(); }
    else if (novo && !onboardingVisto()) abrirOnboarding();
    else if (temNovidade()) { if (novo) marcarNovidadesVistas(); else abrirModal({ tipo: 'novidades' }); }
    if (temNuvem) {
      if (doFirebase) await ligarNuvem();
      else if (UI.nuvem.estado !== 'erro') { UI.nuvem.estado = 'desligada'; pintarNuvem(); }
      else pintarNuvem();
    }
    pintarAvisoPwa();
    window.__meuEspaco = { get estado() { return S; }, get ui() { return UI; }, pet: PET };
  })();
})();
