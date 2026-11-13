/* Captura de prévia de página (Vercel Serverless Function, Node 18+, sem dependências).
   GET /api/capturar?url=...  ->  { nome, descricao, imagem, favicon, preco, moeda, estrelas, avaliacoes, loja }
   O mesmo que o servidor.py faz no computador; aqui é o que roda no site publicado. */

const CABECALHOS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.6'
};

/* Algumas lojas (Mercado Livre à frente) mostram uma página quase vazia para navegadores "de fora".
   Quando falta dado, tentamos de novo com o mesmo identificador que o WhatsApp e o Facebook usam para gerar prévias. */
const CABECALHOS_PREVIA = { ...CABECALHOS, 'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)' };

const desescapar = (s) => String(s).replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, g) => {
  const t = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'", '#x27': "'" };
  if (t[g.toLowerCase()]) return t[g.toLowerCase()];
  if (g[0] === '#') { const n = g[1] === 'x' || g[1] === 'X' ? parseInt(g.slice(2), 16) : parseInt(g.slice(1), 10); return isNaN(n) ? m : String.fromCodePoint(n); }
  return m;
});

function numero(v) {
  if (v === null || v === undefined || typeof v === 'boolean') return null;
  if (typeof v === 'number') return v;
  let s = String(v).replace(/[^\d.,]/g, '');
  if (!s) return null;
  if (s.includes(',') && s.includes('.')) s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  else if (s.includes(',')) { const p = s.split(','); s = (p[p.length - 1].length === 1 || p[p.length - 1].length === 2) ? s.replace(',', '.') : s.replace(/,/g, ''); }
  else if ((s.match(/\./g) || []).length > 1 || (s.split('.')[1] || '').length === 3) s = s.replace(/\./g, '');
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function metas(pagina) {
  const out = {};
  for (const tag of pagina.match(/<meta\b[^>]*>/gi) || []) {
    const attrs = {};
    for (const m of tag.matchAll(/([\w:-]+)\s*=\s*("|')(.*?)\2/gs)) attrs[m[1].toLowerCase()] = desescapar(m[3]).trim();
    const chave = attrs.property || attrs.name || attrs.itemprop;
    if (chave && attrs.content !== undefined && out[chave.toLowerCase()] === undefined) out[chave.toLowerCase()] = attrs.content;
  }
  return out;
}

function jsonLd(pagina) {
  const itens = [];
  for (const m of pagina.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    let dado;
    try { dado = JSON.parse(m[1].trim()); } catch (e) { continue; }
    const pilha = [dado];
    while (pilha.length) {
      const d = pilha.pop();
      if (Array.isArray(d)) pilha.push(...d);
      else if (d && typeof d === 'object') { itens.push(d); if (d['@graph']) pilha.push(d['@graph']); }
    }
  }
  return itens;
}
const ehTipo = (d, n) => Array.isArray(d['@type']) ? d['@type'].includes(n) : d['@type'] === n;
function primeiro(v) {
  if (Array.isArray(v)) v = v[0];
  if (v && typeof v === 'object') v = v.url || v.contentUrl || v.name;
  return v;
}

const ROBO = ['Seu navegador não é mais aceito', 'validateCaptcha', 'Digite os caracteres', 'Enter the characters you see',
  'To discuss automated access', 'Sorry, we just need to make sure you'];
/** Títulos que as lojas devolvem quando barram o robô: não servem de nome de produto. */
const TITULO_BLOQUEIO = /navegador n[ãa]o [ée] mais aceito|oops!|access denied|acesso negado|just a moment|attention required|captcha|robot check|are you a human|403 forbidden|enable javascript/i;
/** Shopee barra a leitura da página; nome e foto saem do próprio link (o endereço traz o nome e `image_ids`). */
function shopee(url, r) {
  const u = new URL(url);
  if (!/(^|\.)shopee\./.test(u.hostname)) return null;
  const a = u.pathname.match(/^\/(.+)-i\.(\d+)\.(\d+)/);
  if (a) {
    let nome = a[1]; try { nome = decodeURIComponent(nome); } catch (e) { /* mantém */ }
    nome = nome.replace(/-+/g, ' ').replace(/\s+/g, ' ').trim();
    if (nome && (!r.nome || TITULO_BLOQUEIO.test(r.nome))) r.nome = nome;
  }
  const img = (u.searchParams.get('image_ids') || '').split(',')[0].trim();
  if (img && !r.imagem) r.imagem = 'https://down-br.img.susercontent.com/file/' + img;
  r.loja = 'Shopee';
  return a ? { loja: a[2], item: a[3] } : null;
}
const bloqueado = (pagina) => pagina.length < 200000 && ROBO.some((m) => pagina.includes(m));

/* A Amazon não publica dados estruturados de produto; é preciso ler a própria página. */
function amazon(pagina, r) {
  if (!r.nome) { const m = pagina.match(/id="productTitle"[^>]*>([\s\S]*?)</); if (m) r.nome = m[1]; }
  if (!r.imagem) {
    let m = pagina.match(/id="landingImage"[^>]*data-old-hires="([^"]+)"/);
    if (m) r.imagem = m[1];
    if (!r.imagem) {
      const d = pagina.match(/data-a-dynamic-image="({[^"]+})"/);
      if (d) { try { r.imagem = Object.keys(JSON.parse(desescapar(d[1])))[0]; } catch (e) { /* ignora */ } }
    }
    if (!r.imagem) { m = pagina.match(/id="landingImage"[^>]*\ssrc="([^"]+)"/); if (m) r.imagem = m[1]; }
  }
  if (r.preco === null) {
    for (const p of [/id="corePrice[^"]*"[\s\S]{0,800}?class="a-offscreen">\s*([^<]+)</,
      /class="a-price[^"]*"[^>]*>\s*<span class="a-offscreen">\s*([^<]+)</,
      /id="priceblock_[^"]*"[^>]*>\s*([^<]+)</]) {
      const m = pagina.match(p);
      if (m) { r.preco = numero(m[1]); break; }
    }
  }
  if (r.estrelas === null) {
    const m = pagina.match(/([\d.,]+)\s*(?:de|out of)\s*5\s*(?:estrelas|stars)/);
    if (m) { const v = numero(m[1]); r.estrelas = v !== null && v <= 5 ? Math.round(v * 10) / 10 : null; }
  }
  if (r.avaliacoes === null) {
    const m = pagina.match(/id="acrCustomerReviewText"[^>]*>\s*([\d.,]+)/);
    if (m) { const q = numero(m[1]); r.avaliacoes = q ? Math.round(q) : null; }
  }
}

/* Mercado Livre: nome, foto e preço também ficam no HTML da página (classes ui-pdp / andes). */
function mercadolivre(pagina, r) {
  if (!r.nome) { const m = pagina.match(/class="ui-pdp-title"[^>]*>([\s\S]*?)</); if (m) r.nome = m[1]; }
  if (!r.imagem) { const m = pagina.match(/https:\/\/http2\.mlstatic\.com\/D_(?:NQ_NP|Q_NP)[^"'\s)]+?\.(?:webp|jpg|png)/); if (m) r.imagem = m[0]; }
  if (r.preco === null) {
    const m = pagina.match(/andes-money-amount__fraction[^>]*>\s*([\d.]+)</);
    if (m) { const c = pagina.match(/andes-money-amount__cents[^>]*>\s*(\d{2})</); r.preco = numero(m[1].replace(/\./g, '') + (c ? '.' + c[1] : '')); }
  }
}

/* Links curtos e páginas de "compartilhar" só repassam para a página do produto. */
function proximoSalto(pagina, url) {
  const achados = [
    (pagina.match(/<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^"']*url=([^"']+)/i) || [])[1],
    (pagina.match(/location\.(?:href|replace)\s*(?:=|\()\s*["']([^"']+)["']/) || [])[1],
    (pagina.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)/i) || [])[1],
    (pagina.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i) || [])[1],
    (pagina.match(/https?:\/\/[^"'\s<>]*mercadoli[vb]re[^"'\s<>]*\/(?:p\/)?MLB-?\d+[^"'\s<>]*/) || [])[0]
  ];
  for (const a of achados) {
    if (!a) continue;
    try { const u = new URL(desescapar(a).replace(/\\u002F/g, '/'), url); if (/^https?:$/.test(u.protocol) && u.href.split('#')[0] !== url.split('#')[0]) return u.href; } catch (e) { /* tenta o próximo */ }
  }
  return null;
}

function extrair(pagina, url) {
  const m = metas(pagina);
  const r = { nome: null, descricao: null, imagem: null, favicon: null, preco: null, moeda: null, estrelas: null, avaliacoes: null, loja: null };
  const produto = jsonLd(pagina).find((d) => ehTipo(d, 'Product'));
  if (produto) {
    r.nome = produto.name;
    r.descricao = typeof produto.description === 'string' ? produto.description : null;
    r.imagem = primeiro(produto.image);
    let of = produto.offers;
    if (Array.isArray(of)) of = of[0];
    if (of && typeof of === 'object') {
      r.preco = numero(of.price ?? of.lowPrice);
      if (r.preco === null && of.priceSpecification) r.preco = numero(of.priceSpecification.price);
      if (r.preco === null && Array.isArray(of.offers) && of.offers[0]) r.preco = numero(of.offers[0].price);
      r.moeda = of.priceCurrency || null;
      if (of.seller && of.seller.name) r.loja = of.seller.name;
    }
    const nota = produto.aggregateRating;
    if (nota && typeof nota === 'object') {
      const v = numero(nota.ratingValue), melhor = numero(nota.bestRating) || 5;
      if (v !== null && melhor) r.estrelas = Math.round((v / melhor) * 5 * 10) / 10;
      const q = numero(nota.reviewCount ?? nota.ratingCount);
      r.avaliacoes = q ? Math.round(q) : null;
    }
  }
  if (/mercadoli[vb]re|mlstatic/.test(new URL(url).hostname + pagina.slice(0, 200000))) mercadolivre(pagina, r);
  if (new URL(url).hostname.includes('amazon.') || pagina.includes('id="productTitle"')) amazon(pagina, r);
  r.nome = r.nome || m['og:title'] || m['twitter:title'] || (pagina.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || null;
  r.descricao = r.descricao || m['og:description'] || m.description || m['twitter:description'] || null;
  r.imagem = r.imagem || m['og:image'] || m['og:image:secure_url'] || m['twitter:image'] || null;
  if (r.preco === null) r.preco = numero(m['product:price:amount'] || m['og:price:amount'] || m.price);
  r.moeda = r.moeda || m['product:price:currency'] || m['og:price:currency'] || m.pricecurrency || null;
  if (r.preco === null) {
    for (const p of [/"priceAmount"\s*:\s*"?([\d.,]+)/, /class="a-offscreen"[^>]*>\s*R\$\s*([\d.,]+)/, /itemprop="price"[^>]*content="([\d.,]+)"/, /"price"\s*:\s*"?(\d[\d.,]*)/]) {
      const a = pagina.match(p);
      if (a) { r.preco = numero(a[1]); break; }
    }
  }
  if (r.estrelas === null) {
    const a = pagina.match(/"ratingValue"\s*:\s*"?([\d.,]+)/);
    if (a) { const v = numero(a[1]); r.estrelas = v !== null && v <= 5 ? Math.round(v * 10) / 10 : null; }
  }
  const icone = pagina.match(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*>/i);
  if (icone) { const h = icone[0].match(/href=["']([^"']+)/i); if (h) r.favicon = new URL(desescapar(h[1]), url).href; }
  if (r.nome && TITULO_BLOQUEIO.test(r.nome)) r.nome = null;
  if (r.descricao && TITULO_BLOQUEIO.test(r.descricao)) r.descricao = null;
  shopee(url, r);
  const host = new URL(url).hostname;
  if (!r.favicon) r.favicon = new URL('/favicon.ico', url).href;
  r.loja = m['og:site_name'] || r.loja || host.replace(/^www\./, '');
  if (r.nome) r.nome = desescapar(String(r.nome)).replace(/\s+/g, ' ').trim().slice(0, 200);
  if (r.descricao) r.descricao = desescapar(String(r.descricao)).replace(/\s+/g, ' ').trim().slice(0, 400);
  if (r.imagem) r.imagem = new URL(String(r.imagem), url).href;
  if (r.preco !== null && !r.moeda) r.moeda = 'BRL';
  return r;
}

/** Fica com o que `base` tem e completa o que está vazio com `extra`. */
const mesclar = (base, extra) => { const o = { ...base }; for (const k of Object.keys(extra)) if ((o[k] === null || o[k] === undefined || o[k] === '') && extra[k] != null) o[k] = extra[k]; return o; };
const faltaDado = (r) => !r.nome || !r.imagem || r.preco === null;

async function baixar(href, cabecalhos, sinal) {
  const r = await fetch(href, { headers: cabecalhos, redirect: 'follow', signal: sinal });
  if (!r.ok) throw new Error(r.status + '');
  return { pagina: (await r.text()).slice(0, 4 * 1024 * 1024), url: r.url || href };
}

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://x').searchParams.get('url') || '';
  let alvo;
  try { alvo = new URL(url); } catch (e) { alvo = null; }
  if (!alvo || !/^https?:$/.test(alvo.protocol)) return res.status(400).json({ erro: 'endereço inválido' });
  const corta = new AbortController();
  const tempo = setTimeout(() => corta.abort(), 20000);
  try {
    let atual = await baixar(alvo.href, CABECALHOS, corta.signal);
    if (bloqueado(atual.pagina)) {
      try { atual = await baixar(alvo.href, CABECALHOS_PREVIA, corta.signal); } catch (e) { /* segue com o bloqueio */ }
      if (bloqueado(atual.pagina) && !/(^|\.)shopee\./.test(alvo.hostname)) return res.status(502).json({ erro: 'a loja bloqueou a leitura automática desta página' });
    }
    let r = extrair(atual.pagina, atual.url);
    // Página de passagem (link curto, "compartilhar"): segue até a do produto, no máximo duas vezes.
    for (let n = 0; n < 2 && faltaDado(r); n++) {
      const prox = proximoSalto(atual.pagina, atual.url);
      if (!prox) break;
      try { atual = await baixar(prox, CABECALHOS, corta.signal); r = mesclar(extrair(atual.pagina, atual.url), r); } catch (e) { break; }
    }
    // Ainda faltando? Pede como o WhatsApp pede e completa só o que está vazio.
    if (faltaDado(r)) {
      try {
        const alt = await baixar(atual.url, CABECALHOS_PREVIA, corta.signal);
        const r2 = extrair(alt.pagina, alt.url);
        r = mesclar(r, r2);
      } catch (e) { /* o que já temos basta */ }
    }
    // Shopee: tenta a API pública do item para completar preço e foto (pode ser barrada; então fica só o que veio do link).
    const ids = shopee(atual.url, { nome: 'x', imagem: 'x' });
    if (ids && (r.preco === null || !r.imagem)) {
      try {
        const api = await fetch(`https://${new URL(atual.url).hostname}/api/v4/item/get?itemid=${ids.item}&shopid=${ids.loja}`, { headers: { ...CABECALHOS, Referer: atual.url, 'x-api-source': 'pc' }, signal: corta.signal });
        const j = await api.json(), d = j && j.data;
        if (d && d.price) { r.preco = r.preco ?? Math.round(d.price / 1000) / 100; r.moeda = r.moeda || 'BRL'; }
        if (d && d.image && !r.imagem) r.imagem = 'https://down-br.img.susercontent.com/file/' + d.image;
        if (d && d.item_rating && r.estrelas === null) r.estrelas = Math.round(d.item_rating.rating_star * 10) / 10;
      } catch (e) { /* sem a API: segue */ }
    }
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(r);
  } catch (e) {
    return res.status(502).json({ erro: `a página não respondeu (${e.name === 'AbortError' ? 'demorou demais' : e.message})` });
  } finally { clearTimeout(tempo); }
}
