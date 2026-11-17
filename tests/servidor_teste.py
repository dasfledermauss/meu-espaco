"""Testes do servidor de captura (sem rede): preço da Amazon em partes e em centavos."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import servidor as sv

def pagina(preco_html, extra=""):
    return f'<html><head><title>Livro</title></head><body><span id="productTitle">Livro</span>{preco_html}{extra}</body></html>'

URL = "https://www.amazon.com.br/dp/B000TESTE1"
casos = [
    ("inteiro + centavos", pagina('<span class="a-price"><span class="a-price-whole">20<span class="a-price-decimal">,</span></span><span class="a-price-fraction">60</span></span>'), 20.60),
    ("milhar", pagina('<span class="a-price-whole">1.234<span class="a-price-decimal">,</span></span><span class="a-price-fraction">05</span>'), 1234.05),
    ("a-offscreen com espaço de entidade", pagina('<span class="a-price"><span class="a-offscreen">R$&#160;52,04</span></span>'), 52.04),
    ("JSON em centavos não vale", pagina('', '<script>{"price":2060,"priceAmount":2060}</script>'), None),
]
falhas = 0
for nome, html_, esperado in casos:
    r = sv.extrair(html_, URL)
    ok = r["preco"] == esperado
    print(("  ok   " if ok else "  FALHOU ") + f"{nome}: {r['preco']}")
    falhas += not ok
sys.exit(1 if falhas else 0)
