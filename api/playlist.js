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
  const add = (video, titulo) => {
    if (!video || vistos.has(video) || achados.length >= 200 || !/^[\w-]{6,20}$/.test(video)) return;
    vistos.add(video);
    achados.push({ video, titulo: String(titulo || '').trim() || 'Sem nome' });
  };
  const texto = (t) => (t && (t.simpleText || (t.runs && t.runs.map((r) => r.text).join('')) || t.content)) || '';
  // 1) O JSON que a página traz embutido; cobre o formato antigo (playlistVideoRenderer) e o novo (lockupViewModel).
  const j = pagina.match(/ytInitialData\s*=\s*(\{[\s\S]*?\});\s*<\/script>/);
  if (j) {
    try {
      const andar = (o) => {
        if (!o || typeof o !== 'object') return;
        if (Array.isArray(o)) return o.forEach(andar);
        if (o.playlistVideoRenderer) add(o.playlistVideoRenderer.videoId, texto(o.playlistVideoRenderer.title));
        if (o.lockupViewModel && /VIDEO/.test(o.lockupViewModel.contentType || '')) {
          const meta = o.lockupViewModel.metadata && o.lockupViewModel.metadata.lockupMetadataViewModel;
          add(o.lockupViewModel.contentId, texto(meta && meta.title));
        }
        for (const k in o) andar(o[k]);
      };
      andar(JSON.parse(j[1]));
    } catch (e) { /* cai para o texto */ }
  }
  // 2) Último recurso no texto cru.
  if (!achados.length) {
    const padrao = /"playlistVideoRenderer":\{"videoId":"([\w-]{6,20})"[\s\S]*?"title":\{(?:"runs":\[\{"text":"((?:[^"\\]|\\.)*)"|"simpleText":"((?:[^"\\]|\\.)*)")/g;
    let m;
    while ((m = padrao.exec(pagina))) {
      const bruto = m[2] || m[3] || '';
      let titulo;
      try { titulo = JSON.parse('"' + bruto + '"'); } catch (e) { titulo = bruto; }
      add(m[1], titulo);
    }
  }
  return achados;
}

/* O feed público da lista traz só os 15 mais recentes, mas quase nunca é bloqueado. */
function faixasDoFeed(xml) {
  const achados = [];
  for (const e of xml.match(/<entry>[\s\S]*?<\/entry>/g) || []) {
    const v = (e.match(/<yt:videoId>([\w-]+)<\/yt:videoId>/) || [])[1];
    const t = (e.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
    if (v) achados.push({ video: v, titulo: t.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim() || 'Sem nome' });
  }
  return achados;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const lista = String((req.query && req.query.lista) || '').trim();
  if (!/^[\w-]{8,60}$/.test(lista)) return res.status(400).json({ erro: 'lista inválida' });
  try {
    const r = await fetch('https://www.youtube.com/playlist?list=' + encodeURIComponent(lista) + '&hl=pt-BR',
      { headers: { ...CABECALHOS, Cookie: 'CONSENT=YES+1; SOCS=CAI' }, redirect: 'follow' });
    const pagina = await r.text();
    let faixas = faixasDaPlaylist(pagina);
    if (!faixas.length) {
      try {
        const f = await fetch('https://www.youtube.com/feeds/videos.xml?playlist_id=' + encodeURIComponent(lista), { headers: CABECALHOS });
        if (f.ok) faixas = faixasDoFeed(await f.text());
      } catch (e) { /* segue para o erro */ }
    }
    if (!faixas.length) return res.status(502).json({ erro: 'não consegui ler os vídeos dessa lista' });
    return res.status(200).json({ faixas });
  } catch (e) {
    return res.status(502).json({ erro: 'o YouTube não respondeu (' + (e.message || e.name) + ')' });
  }
};

module.exports.faixasDaPlaylist = faixasDaPlaylist;
module.exports.faixasDoFeed = faixasDoFeed;
