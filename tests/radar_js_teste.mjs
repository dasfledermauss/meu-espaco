// Testes do Radar que roda na Vercel (api/radar.js), sem rede.
import { lerRSS, lerGitHub, juntar } from '../api/radar.js';
const GOOGLE = `<?xml version="1.0"?><rss><channel><title>x</title>
<item><title>Concurso abre 500 vagas &amp; salário de R$ 5 mil - G1</title><link>https://news.google.com/rss/articles/AAA</link><pubDate>Tue, 17 Nov 2026 14:00:00 GMT</pubDate><source url="https://g1.globo.com">G1</source></item>
<item><title><![CDATA[Edital publicado - Folha]]></title><link>https://news.google.com/rss/articles/BBB</link><pubDate>Mon, 16 Nov 2026 09:30:00 GMT</pubDate><source url="https://folha.com">Folha</source></item>
</channel></rss>`;
const BING = `<?xml version="1.0"?><rss><channel>
<item><title>Edital publicado - Folha</title><link>http://www.bing.com/news/apiclick.aspx?ref=FexRss&amp;aid=&amp;url=https%3a%2f%2ffolha.com%2fedital&amp;c=1</link><pubDate>Mon, 16 Nov 2026 09:35:00 GMT</pubDate><News:Source>Folha</News:Source></item>
<item><title>Outra notícia nova</title><link>http://www.bing.com/news/apiclick.aspx?ref=FexRss&amp;url=https%3a%2f%2fexemplo.com%2fnova</link><pubDate>Wed, 18 Nov 2026 08:00:00 GMT</pubDate><News:Source>Exemplo</News:Source></item>
<item><title>Sem link válido</title><link>nao-e-url</link></item>
</channel></rss>`;
const GH = { items: [{ full_name: 'alguem/projeto-recomp', description: 'Recompilação nativa', html_url: 'https://github.com/alguem/projeto-recomp', pushed_at: '2026-11-18T10:00:00Z' }, { full_name: 'sem/url', html_url: '' }] };
let falhas = 0;
const conferir = (nome, ok, det = '') => { console.log((ok ? '  ok   ' : '  FALHOU ') + nome + (ok ? '' : ' ' + JSON.stringify(det))); if (!ok) falhas++; };
const g = lerRSS(GOOGLE, 'Google Notícias'), b = lerRSS(BING, 'Bing Notícias'), h = lerGitHub(GH), j = juntar([g, b, h]);
conferir('Google: lê título com entidade e CDATA', g.length === 2 && g[0].titulo === 'Concurso abre 500 vagas & salário de R$ 5 mil - G1' && g[1].titulo === 'Edital publicado - Folha', g);
conferir('Google: fonte e data em ISO', g[0].fonte === 'G1' && g[0].data === '2026-11-17T14:00:00.000Z', g[0]);
conferir('Bing: endereço real sai do redirecionador e item sem link some', JSON.stringify(b.map((x) => x.url)) === JSON.stringify(['https://folha.com/edital', 'https://exemplo.com/nova']), b);
conferir('Bing: fonte vem de News:Source', b[0].fonte === 'Folha');
conferir('GitHub: repositório vira achado e item sem endereço some', h.length === 1 && h[0].fonte === 'GitHub' && h[0].titulo.startsWith('alguem/projeto-recomp — '), h);
conferir('juntar: tira o título repetido entre fontes', j.length === 4, j.map((x) => x.titulo));
conferir('juntar: ordena do mais novo para o mais antigo', JSON.stringify(j.map((x) => x.data)) === JSON.stringify(j.map((x) => x.data).sort().reverse()));
process.exit(falhas ? 1 : 0);
