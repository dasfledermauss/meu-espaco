"""Testes do Radar no servidor local (sem rede): leitura dos feeds, endereço real do Bing, repetidos e ordem."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import servidor as sv

GOOGLE = """<?xml version="1.0"?><rss><channel><title>x</title>
<item><title>Concurso abre 500 vagas &amp; salário de R$ 5 mil - G1</title><link>https://news.google.com/rss/articles/AAA</link><pubDate>Tue, 17 Nov 2026 14:00:00 GMT</pubDate><source url="https://g1.globo.com">G1</source></item>
<item><title><![CDATA[Edital publicado - Folha]]></title><link>https://news.google.com/rss/articles/BBB</link><pubDate>Mon, 16 Nov 2026 09:30:00 GMT</pubDate><source url="https://folha.com">Folha</source></item>
</channel></rss>"""
BING = """<?xml version="1.0"?><rss><channel>
<item><title>Edital publicado - Folha</title><link>http://www.bing.com/news/apiclick.aspx?ref=FexRss&amp;aid=&amp;url=https%3a%2f%2ffolha.com%2fedital&amp;c=1</link><pubDate>Mon, 16 Nov 2026 09:35:00 GMT</pubDate><News:Source>Folha</News:Source></item>
<item><title>Outra notícia nova</title><link>http://www.bing.com/news/apiclick.aspx?ref=FexRss&amp;url=https%3a%2f%2fexemplo.com%2fnova</link><pubDate>Wed, 18 Nov 2026 08:00:00 GMT</pubDate><News:Source>Exemplo</News:Source></item>
<item><title>Sem link válido</title><link>nao-e-url</link></item>
</channel></rss>"""
GH = {"items": [{"full_name": "alguem/projeto-recomp", "description": "Recompilação nativa", "html_url": "https://github.com/alguem/projeto-recomp", "pushed_at": "2026-11-18T10:00:00Z"}, {"full_name": "sem/url", "html_url": ""}]}

falhas = 0
def conferir(nome, ok, detalhe=""):
    global falhas
    print(("  ok   " if ok else "  FALHOU ") + nome + (" " + str(detalhe) if not ok else ""))
    falhas += not ok

g = sv.ler_rss(GOOGLE, "Google Notícias")
conferir("Google: lê título com entidade e CDATA", len(g) == 2 and g[0]["titulo"] == "Concurso abre 500 vagas & salário de R$ 5 mil - G1" and g[1]["titulo"] == "Edital publicado - Folha", g)
conferir("Google: fonte e data em ISO", g[0]["fonte"] == "G1" and g[0]["data"] == "2026-11-17T14:00:00.000Z", g[0])
b = sv.ler_rss(BING, "Bing Notícias")
conferir("Bing: endereço real sai do redirecionador e item sem link some", [x["url"] for x in b] == ["https://folha.com/edital", "https://exemplo.com/nova"], b)
conferir("Bing: fonte vem de News:Source", b[0]["fonte"] == "Folha")
h = sv.ler_github(GH)
conferir("GitHub: repositório vira achado e item sem endereço some", len(h) == 1 and h[0]["fonte"] == "GitHub" and h[0]["titulo"].startswith("alguem/projeto-recomp — "), h)
j = sv.juntar_achados([g, b, h])
conferir("juntar: tira o título repetido entre fontes", len(j) == 4, [x["titulo"] for x in j])
conferir("juntar: ordena do mais novo para o mais antigo", [x["data"] for x in j] == sorted([x["data"] for x in j], reverse=True))
sys.exit(1 if falhas else 0)
