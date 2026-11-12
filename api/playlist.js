/* Vídeos de uma playlist do YouTube (Vercel Serverless Function, Node 18+, sem dependências).
   GET /api/playlist?lista=PL...  ->  { faixas: [{ video, titulo }] }
   Gêmeo do /api/playlist do servidor.py. A página da playlist traz os vídeos
   num JSON embutido (ytInitialData); é de lá que eles saem. */

const CABECALHOS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.6'
};

function faixasDaPlaylist(pagina) {
  const achados = [], vistos = new Set();
  const padrao = /"playlistVideoRenderer":\{"videoId":"([\w-]{6,20})"[\s\S]*?"title":\{(?:"runs":\[\{"text":"((?:[^"\\]|\\.)*)"|"simpleText":"((?:[^"\\]|\\.)*)")/g;
  let m;
  while ((m = padrao.exec(pagina)) && achados.length < 200) {
    const video = m[1];
    if (vistos.has(video)) continue;
    vistos.add(video);
    const bruto = m[2] || m[3] || '';
    let titulo;
    try { titulo = JSON.parse('"' + bruto + '"'); } catch (e) { titulo = bruto; }
    achados.push({ video, titulo: (titulo || '').trim() || 'Sem nome' });
  }
  return achados;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const lista = String((req.query && req.query.lista) || '').trim();
  if (!/^[\w-]{8,60}$/.test(lista)) return res.status(400).json({ erro: 'lista inválida' });
  try {
    const r = await fetch('https://www.youtube.com/playlist?list=' + encodeURIComponent(lista) + '&hl=pt-BR',
      { headers: CABECALHOS, redirect: 'follow' });
    const pagina = await r.text();
    const faixas = faixasDaPlaylist(pagina);
    if (!faixas.length) return res.status(502).json({ erro: 'não consegui ler os vídeos dessa lista' });
    return res.status(200).json({ faixas });
  } catch (e) {
    return res.status(502).json({ erro: 'o YouTube não respondeu (' + (e.message || e.name) + ')' });
  }
};

module.exports.faixasDaPlaylist = faixasDaPlaylist;
