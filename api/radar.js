/* Radar (Vercel Serverless Function, Node 18+, sem dependências).
   GET /api/radar?q=palavras&fontes=noticias,github  ->  { achados: [{ titulo, url, fonte, data }], avisos: [] }
   Junta fontes públicas e sem chave: Google Notícias (RSS), Bing Notícias (RSS) e, se pedido, repositórios do GitHub.
   O mesmo que o servidor.py faz no computador; aqui é o que roda no site publicado. */

const CABECALHOS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  Accept: 'application/rss+xml, application/xml;q=0.9, application/json;q=0.8, */*;q=0.5',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.6'
};

const desescapar = (s) => String(s).replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, g) => {
  const t = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };
  if (t[g.toLowerCase()]) return t[g.toLowerCase()];
  if (g[0] === '#') { const n = g[1] === 'x' || g[1] === 'X' ? parseInt(g.slice(2), 16) : parseInt(g.slice(1), 10); return isNaN(n) ? m : String.fromCodePoint(n); }
  return m;
});
const limpa = (s) => desescapar(String(s || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const marca = (bloco, nome) => { const m = bloco.match(new RegExp('<' + nome + '(?:\\s[^>]*)?>([\\s\\S]*?)</' + nome + '>', 'i')); return m ? limpa(m[1]) : ''; };
const iso = (t) => { const d = new Date(t); return isNaN(d.getTime()) ? '' : d.toISOString(); };

/** O Bing manda o link por um redirecionador; o endereço real vem no parâmetro `url`. */
function enderecoReal(link) {
  try { const u = new URL(link); if (/bing\.com$/i.test(u.hostname) && u.searchParams.get('url')) return u.searchParams.get('url'); } catch (e) { /* devolve como veio */ }
  return link;
}

/** Lê um feed RSS e devolve [{ titulo, url, fonte, data }]. */
export function lerRSS(xml, fontePadrao) {
  const itens = [];
  for (const m of String(xml).matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)) {
    const b = m[1];
    const titulo = marca(b, 'title'), url = enderecoReal(marca(b, 'link'));
    if (!titulo || !/^https?:\/\//.test(url)) continue;
    const fonte = marca(b, 'source') || marca(b, 'News:Source') || fontePadrao || '';
    itens.push({ titulo, url, fonte, data: iso(marca(b, 'pubDate')) });
  }
  return itens;
}

/** Lê a resposta da busca de repositórios do GitHub. */
export function lerGitHub(json) {
  return ((json && json.items) || []).map((r) => ({
    titulo: r.full_name + (r.description ? ' — ' + String(r.description).slice(0, 140) : ''),
    url: r.html_url, fonte: 'GitHub', data: iso(r.pushed_at || r.updated_at)
  })).filter((r) => /^https?:\/\//.test(r.url));
}

/** Tira repetidos (mesmo título) e ordena do mais novo para o mais antigo. */
export function juntar(listas, limite = 40) {
  const visto = new Set(), todos = [];
  for (const it of listas.flat()) {
    const chave = it.titulo.toLowerCase().replace(/[^a-z0-9à-ú]+/g, '').slice(0, 80);
    if (!chave || visto.has(chave)) continue;
    visto.add(chave); todos.push(it);
  }
  return todos.sort((a, b) => (b.data || '').localeCompare(a.data || '')).slice(0, limite);
}

async function pegar(href, sinal) {
  const r = await fetch(href, { headers: CABECALHOS, redirect: 'follow', signal: sinal });
  if (!r.ok) throw new Error(String(r.status));
  return r;
}

export default async function handler(req, res) {
  const params = new URL(req.url, 'http://x').searchParams;
  const q = (params.get('q') || '').trim().slice(0, 120);
  if (q.length < 2) return res.status(400).json({ erro: 'escreva a palavra-chave' });
  const fontes = (params.get('fontes') || 'noticias').split(',');
  const corta = new AbortController();
  const tempo = setTimeout(() => corta.abort(), 15000);
  const enc = encodeURIComponent(q);
  const tarefas = [];
  if (fontes.includes('noticias')) {
    tarefas.push(['Google Notícias', async () => lerRSS(await (await pegar('https://news.google.com/rss/search?q=' + enc + '&hl=pt-BR&gl=BR&ceid=BR:pt-419', corta.signal)).text(), 'Google Notícias')]);
    tarefas.push(['Bing Notícias', async () => lerRSS(await (await pegar('https://www.bing.com/news/search?q=' + enc + '&format=rss&setlang=pt-BR&cc=BR', corta.signal)).text(), 'Bing Notícias')]);
  }
  if (fontes.includes('github')) {
    tarefas.push(['GitHub', async () => lerGitHub(await (await pegar('https://api.github.com/search/repositories?q=' + enc + '&sort=updated&order=desc&per_page=15', corta.signal)).json())]);
  }
  try {
    const feitos = await Promise.allSettled(tarefas.map(([, f]) => f()));
    const listas = [], avisos = [];
    feitos.forEach((r, k) => { if (r.status === 'fulfilled') listas.push(r.value); else avisos.push(tarefas[k][0] + ' não respondeu'); });
    if (!listas.length) return res.status(502).json({ erro: 'nenhuma fonte respondeu agora', avisos });
    return res.status(200).json({ achados: juntar(listas), avisos });
  } finally { clearTimeout(tempo); }
}
