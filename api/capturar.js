/* Captura de prévia de página (Vercel Serverless Function, Node 18+, sem dependências).
   GET /api/capturar?url=...  ->  { nome, descricao, imagem, favicon, preco, moeda, estrelas, avaliacoes, loja }
   O mesmo que o servidor.py faz no computador; aqui é o que roda no site publicado. */

const CABECALHOS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.6'
};

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
  const host = new URL(url).hostname;
  if (!r.favicon) r.favicon = new URL('/favicon.ico', url).href;
  r.loja = m['og:site_name'] || r.loja || host.replace(/^www\./, '');
  if (r.nome) r.nome = desescapar(String(r.nome)).replace(/\s+/g, ' ').trim().slice(0, 200);
  if (r.descricao) r.descricao = desescapar(String(r.descricao)).replace(/\s+/g, ' ').trim().slice(0, 400);
  if (r.imagem) r.imagem = new URL(String(r.imagem), url).href;
  if (r.preco !== null && !r.moeda) r.moeda = 'BRL';
  return r;
}

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://x').searchParams.get('url') || '';
  let alvo;
  try { alvo = new URL(url); } catch (e) { alvo = null; }
  if (!alvo || !/^https?:$/.test(alvo.protocol)) return res.status(400).json({ erro: 'endereço inválido' });
  const corta = new AbortController();
  const tempo = setTimeout(() => corta.abort(), 15000);
  try {
    const r = await fetch(alvo.href, { headers: CABECALHOS, redirect: 'follow', signal: corta.signal });
    if (!r.ok) throw new Error(r.status + '');
    const pagina = (await r.text()).slice(0, 4 * 1024 * 1024);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(extrair(pagina, r.url || alvo.href));
  } catch (e) {
    return res.status(502).json({ erro: `a página não respondeu (${e.name === 'AbortError' ? 'demorou demais' : e.message})` });
  } finally { clearTimeout(tempo); }
}
