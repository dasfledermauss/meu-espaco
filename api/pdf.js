/* Entrega um PDF de outro site para o leitor interno (Vercel Serverless Function).
   O navegador não deixa a página ler arquivos de outros domínios; esta função busca e devolve. */
export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://x').searchParams.get('url') || '';
  let alvo;
  try { alvo = new URL(url); } catch (e) { alvo = null; }
  if (!alvo || !/^https?:$/.test(alvo.protocol)) return res.status(400).json({ erro: 'endereço inválido' });
  const corta = new AbortController();
  const tempo = setTimeout(() => corta.abort(), 25000);
  try {
    const r = await fetch(alvo.href, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36', Accept: 'application/pdf,*/*' },
      redirect: 'follow', signal: corta.signal
    });
    if (!r.ok) throw new Error(r.status + '');
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', r.headers.get('content-type') || 'application/pdf');
    res.setHeader('Content-Length', String(buf.length));
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(buf);
  } catch (e) {
    return res.status(502).json({ erro: `não consegui baixar o PDF (${e.name === 'AbortError' ? 'demorou demais' : e.message})` });
  } finally { clearTimeout(tempo); }
}
