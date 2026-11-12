#!/usr/bin/env python3
"""Servidor local do Meu Espaço.

Serve os arquivos desta pasta e oferece a captura de produtos para a Wishlist:
    GET /api/status              -> {"ok": true}
    GET|POST|DELETE /api/sessao  -> login com conta Google (ver docs/LOGIN.md)
    GET /api/capturar?url=...    -> {"nome", "descricao", "imagem", "favicon", "preco", "moeda", "estrelas", "avaliacoes", "loja"}
    GET /api/pdf?url=...         -> devolve o PDF para o leitor interno (contorna o bloqueio entre sites)

Só usa a biblioteca padrão do Python 3. Rode:  python servidor.py   (ou dois cliques em iniciar.bat)
"""
import base64
import gzip
import hashlib
import hmac
import html
import json
import re
import os
import secrets
import sys
import threading
import webbrowser
import zlib
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import time
from urllib.parse import parse_qs, quote, unquote, urljoin, urlparse
from urllib.request import Request, urlopen

PORTA = next((int(a) for a in sys.argv[1:] if a.isdigit()), 8000)
RAIZ = Path(__file__).resolve().parent
LIMITE = 4 * 1024 * 1024  # lê no máximo 4 MB da página

# --- sessão com conta Google -------------------------------------------------
# A chave secreta do cliente OAuth NÃO é usada: o login pelo navegador usa só o
# ID do cliente, que é público. Guarde a chave secreta fora do projeto.
def _config_local():
    """Lê config.local.json (fora do git) para não precisar mexer em variáveis de ambiente no Windows."""
    caminho = Path(__file__).resolve().parent / "config.local.json"
    if caminho.exists():
        try:
            return json.loads(caminho.read_text(encoding="utf-8"))
        except Exception as e:
            print(f"config.local.json ignorado: {e}")
    return {}


LOCAL = _config_local()
CLIENT_ID = LOCAL.get("GOOGLE_CLIENT_ID") or os.environ.get("GOOGLE_CLIENT_ID", "")
PERMITIDOS = [e.strip().lower() for e in (LOCAL.get("EMAILS_PERMITIDOS") or os.environ.get("EMAILS_PERMITIDOS", "")).split(",") if e.strip()]
SEGREDO = LOCAL.get("SESSAO_SEGREDO") or os.environ.get("SESSAO_SEGREDO") or secrets.token_hex(32)
DIAS = 30
CABECALHOS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.6",
    "Accept-Encoding": "gzip, deflate",
}


def baixar(url):
    req = Request(url, headers=CABECALHOS)
    with urlopen(req, timeout=15) as r:
        bruto = r.read(LIMITE)
        enc = (r.headers.get("Content-Encoding") or "").lower()
        if "gzip" in enc:
            bruto = gzip.decompress(bruto) if bruto[:2] == b"\x1f\x8b" else bruto
        elif "deflate" in enc:
            try:
                bruto = zlib.decompress(bruto)
            except zlib.error:
                bruto = zlib.decompress(bruto, -zlib.MAX_WBITS)
        charset = r.headers.get_content_charset() or "utf-8"
        return bruto.decode(charset, errors="replace"), r.geturl()


def numero(valor):
    """Converte '1.234,56', '1,234.56', 'R$ 99,90' ou 99.9 em float."""
    if valor is None or isinstance(valor, bool):
        return None
    if isinstance(valor, (int, float)):
        return float(valor)
    s = re.sub(r"[^\d.,]", "", str(valor))
    if not s:
        return None
    if "," in s and "." in s:
        s = s.replace(".", "").replace(",", ".") if s.rfind(",") > s.rfind(".") else s.replace(",", "")
    elif "," in s:
        partes = s.split(",")
        s = s.replace(",", ".") if len(partes[-1]) in (1, 2) else s.replace(",", "")
    elif s.count(".") > 1 or (s.count(".") == 1 and len(s.split(".")[-1]) == 3):
        s = s.replace(".", "")
    try:
        return float(s)
    except ValueError:
        return None


def metas(pagina):
    achados = {}
    for tag in re.findall(r"<meta\b[^>]*>", pagina, flags=re.I):
        attrs = {k.lower(): html.unescape(v) for k, _, v in re.findall(r'([\w:-]+)\s*=\s*(["\'])(.*?)\2', tag, flags=re.S)}
        chave = attrs.get("property") or attrs.get("name") or attrs.get("itemprop")
        if chave and "content" in attrs:
            achados.setdefault(chave.lower(), attrs["content"].strip())
    return achados


def json_ld(pagina):
    itens = []
    for bloco in re.findall(r"<script[^>]+type=[\"']application/ld\+json[\"'][^>]*>(.*?)</script>", pagina, flags=re.S | re.I):
        try:
            dado = json.loads(bloco.strip())
        except ValueError:
            continue
        pilha = [dado]
        while pilha:
            d = pilha.pop()
            if isinstance(d, list):
                pilha.extend(d)
            elif isinstance(d, dict):
                itens.append(d)
                if "@graph" in d:
                    pilha.append(d["@graph"])
    return itens


def eh_tipo(d, nome):
    t = d.get("@type")
    return nome in t if isinstance(t, list) else t == nome


def primeiro(v):
    if isinstance(v, list):
        v = v[0] if v else None
    if isinstance(v, dict):
        v = v.get("url") or v.get("contentUrl") or v.get("name")
    return v


ROBO = ("validateCaptcha", "Digite os caracteres", "Enter the characters you see",
        "To discuss automated access", "Sorry, we just need to make sure you")


def bloqueado(pagina):
    return any(m in pagina for m in ROBO) and len(pagina) < 200000


def amazon(pagina, r):
    """A Amazon não publica dados estruturados de produto; é preciso ler a própria página."""
    if not r["nome"]:
        m = re.search(r'id="productTitle"[^>]*>(.*?)<', pagina, flags=re.S)
        if m:
            r["nome"] = m.group(1)
    if not r["imagem"]:
        m = re.search(r'id="landingImage"[^>]*data-old-hires="([^"]+)"', pagina)
        if not m:
            d = re.search(r"data-a-dynamic-image=\"({[^\"]+})\"", pagina)
            if d:
                try:
                    r["imagem"] = next(iter(json.loads(html.unescape(d.group(1)))), None)
                except ValueError:
                    pass
        else:
            r["imagem"] = m.group(1)
        if not r["imagem"]:
            m = re.search(r'id="landingImage"[^>]*\ssrc="([^"]+)"', pagina)
            if m:
                r["imagem"] = m.group(1)
    if r["preco"] is None:
        for padrao in (r'id="corePrice[^"]*"[\s\S]{0,800}?class="a-offscreen">\s*([^<]+)<',
                       r'class="a-price[^"]*"[^>]*>\s*<span class="a-offscreen">\s*([^<]+)<',
                       r'id="priceblock_[^"]*"[^>]*>\s*([^<]+)<'):
            m = re.search(padrao, pagina)
            if m:
                r["preco"] = numero(m.group(1))
                break
    if r["estrelas"] is None:
        m = re.search(r'([\d.,]+)\s*(?:de|out of)\s*5\s*(?:estrelas|stars)', pagina)
        if m:
            v = numero(m.group(1))
            r["estrelas"] = round(v, 1) if v is not None and v <= 5 else None
    if r["avaliacoes"] is None:
        m = re.search(r'id="acrCustomerReviewText"[^>]*>\s*([\d.,]+)', pagina)
        if m:
            q = numero(m.group(1))
            r["avaliacoes"] = int(q) if q else None


def extrair(pagina, url):
    m = metas(pagina)
    r = {"nome": None, "descricao": None, "imagem": None, "favicon": None, "preco": None, "moeda": None,
         "estrelas": None, "avaliacoes": None, "loja": None}

    produto = next((d for d in json_ld(pagina) if eh_tipo(d, "Product")), None)
    if produto:
        r["nome"] = produto.get("name")
        r["imagem"] = primeiro(produto.get("image"))
        ofertas = produto.get("offers")
        if isinstance(ofertas, list):
            ofertas = ofertas[0] if ofertas else None
        if isinstance(ofertas, dict):
            r["preco"] = numero(ofertas.get("price") or ofertas.get("lowPrice"))
            if r["preco"] is None and isinstance(ofertas.get("priceSpecification"), dict):
                r["preco"] = numero(ofertas["priceSpecification"].get("price"))
            if r["preco"] is None and isinstance(ofertas.get("offers"), list) and ofertas["offers"]:
                r["preco"] = numero(ofertas["offers"][0].get("price"))
            r["moeda"] = ofertas.get("priceCurrency")
            vendedor = ofertas.get("seller")
            if isinstance(vendedor, dict) and vendedor.get("name"):
                r["loja"] = vendedor["name"]
        nota = produto.get("aggregateRating")
        if isinstance(nota, dict):
            valor = numero(nota.get("ratingValue"))
            melhor = numero(nota.get("bestRating")) or 5
            if valor is not None and melhor:
                r["estrelas"] = round(valor / melhor * 5, 1)
            qtd = numero(nota.get("reviewCount") or nota.get("ratingCount"))
            r["avaliacoes"] = int(qtd) if qtd else None

    if "amazon." in (urlparse(url).hostname or "") or 'id="productTitle"' in pagina:
        amazon(pagina, r)
    r["nome"] = r["nome"] or m.get("og:title") or m.get("twitter:title")
    if not r["nome"]:
        t = re.search(r"<title[^>]*>(.*?)</title>", pagina, flags=re.S | re.I)
        r["nome"] = html.unescape(t.group(1)).strip() if t else None
    r["imagem"] = r["imagem"] or m.get("og:image") or m.get("og:image:secure_url") or m.get("twitter:image")
    if r["preco"] is None:
        r["preco"] = numero(m.get("product:price:amount") or m.get("og:price:amount") or m.get("price"))
    r["moeda"] = r["moeda"] or m.get("product:price:currency") or m.get("og:price:currency") or m.get("pricecurrency")
    if r["preco"] is None:  # últimos recursos para páginas sem dados estruturados
        for padrao in (r'"priceAmount"\s*:\s*"?([\d.,]+)', r'class="a-offscreen"[^>]*>\s*R\$\s*([\d.,]+)', r'itemprop="price"[^>]*content="([\d.,]+)"', r'"price"\s*:\s*"?(\d[\d.,]*)'):
            achou = re.search(padrao, pagina)
            if achou:
                r["preco"] = numero(achou.group(1))
                break
    if r["estrelas"] is None:
        achou = re.search(r'"ratingValue"\s*:\s*"?([\d.,]+)', pagina)
        if achou:
            v = numero(achou.group(1))
            r["estrelas"] = round(v, 1) if v is not None and v <= 5 else None

    r["descricao"] = m.get("og:description") or m.get("description") or m.get("twitter:description")
    icone = re.search(r'<link[^>]+rel=["\'][^"\']*icon[^"\']*["\'][^>]*>', pagina, flags=re.I)
    if icone:
        href = re.search(r'href=["\']([^"\']+)', icone.group(0), flags=re.I)
        if href:
            r["favicon"] = urljoin(url, html.unescape(href.group(1)))
    host = urlparse(url).hostname or ""
    if not r["favicon"] and host:
        r["favicon"] = f"{urlparse(url).scheme}://{host}/favicon.ico"
    r["loja"] = m.get("og:site_name") or r["loja"] or host.replace("www.", "")
    if r["nome"]:
        r["nome"] = re.sub(r"\s+", " ", html.unescape(str(r["nome"]))).strip()[:200]
    if r["descricao"]:
        r["descricao"] = re.sub(r"\s+", " ", html.unescape(str(r["descricao"]))).strip()[:400]
    if r["imagem"]:
        r["imagem"] = urljoin(url, str(r["imagem"]))
    if r["preco"] is not None and not r["moeda"]:
        r["moeda"] = "BRL"
    return r


def _b64(txt):
    return base64.urlsafe_b64encode(txt.encode("utf-8")).decode().rstrip("=")


def _deb64(txt):
    return base64.urlsafe_b64decode(txt + "=" * (-len(txt) % 4)).decode("utf-8")


def _assinar(dados):
    return base64.urlsafe_b64encode(hmac.new(SEGREDO.encode(), dados.encode(), hashlib.sha256).digest()).decode().rstrip("=")


def criar_cookie(usuario):
    corpo = _b64(json.dumps({**usuario, "ate": int(time.time() * 1000) + DIAS * 86400000}))
    return corpo + "." + _assinar(corpo)


def ler_cookie(cabecalho):
    bruto = next((c.strip() for c in (cabecalho or "").split(";") if c.strip().startswith("sessao=")), None)
    if not bruto:
        return None
    partes = unquote(bruto[7:]).split(".")
    if len(partes) != 2:
        return None
    corpo, assinatura = partes
    if not hmac.compare_digest(assinatura, _assinar(corpo)):
        return None
    try:
        d = json.loads(_deb64(corpo))
    except Exception:
        return None
    return d if d.get("ate", 0) > time.time() * 1000 else None


def verificar_token(credential):
    url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + quote(credential, safe="")
    with urlopen(Request(url, headers={"User-Agent": "MeuEspaco"}), timeout=15) as r:
        d = json.loads(r.read(64 * 1024).decode("utf-8"))
    if CLIENT_ID and d.get("aud") != CLIENT_ID:
        raise ValueError("token de outro aplicativo")
    if d.get("iss") not in ("accounts.google.com", "https://accounts.google.com"):
        raise ValueError("origem inesperada")
    if int(d.get("exp", 0)) * 1000 < time.time() * 1000:
        raise ValueError("token vencido")
    if str(d.get("email_verified")).lower() != "true":
        raise ValueError("e-mail não verificado no Google")
    return {"email": d.get("email"), "nome": d.get("name") or d.get("email"), "foto": d.get("picture", "")}


def permitido(email):
    return (not PERMITIDOS) or str(email).lower() in PERMITIDOS


class Manipulador(SimpleHTTPRequestHandler):
    def responder(self, codigo, corpo, extras=()):
        dados = json.dumps(corpo, ensure_ascii=False).encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(dados)))
        self.send_header("Cache-Control", "no-store")
        for chave, valor in extras:
            self.send_header(chave, valor)
        self.end_headers()
        self.wfile.write(dados)

    def do_POST(self):
        if urlparse(self.path).path != "/api/sessao":
            return self.responder(404, {"erro": "rota desconhecida"})
        try:
            tam = int(self.headers.get("Content-Length") or 0)
            corpo = json.loads(self.rfile.read(min(tam, 64 * 1024)).decode("utf-8")) if tam else {}
        except Exception:
            return self.responder(400, {"erro": "corpo inválido"})
        if not corpo.get("credential"):
            return self.responder(400, {"erro": "faltou o token do Google"})
        try:
            usuario = verificar_token(corpo["credential"])
        except Exception as e:
            return self.responder(401, {"erro": str(e)})
        if not permitido(usuario["email"]):
            return self.responder(403, {"erro": "esta conta não tem acesso a este espaço"})
        self.responder(200, {"logado": True, "usuario": usuario},
                       [("Set-Cookie", f"sessao={criar_cookie(usuario)}; Path=/; HttpOnly; SameSite=Lax; Max-Age={DIAS * 86400}")])

    def do_DELETE(self):
        if urlparse(self.path).path != "/api/sessao":
            return self.responder(404, {"erro": "rota desconhecida"})
        self.responder(200, {"logado": False}, [("Set-Cookie", "sessao=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0")])

    def do_GET(self):
        rota = urlparse(self.path)
        if rota.path == "/api/sessao":
            s = ler_cookie(self.headers.get("Cookie"))
            return self.responder(200, {"configurado": True, "restrito": bool(PERMITIDOS), "logado": bool(s),
                                        "usuario": {"email": s["email"], "nome": s["nome"], "foto": s["foto"]} if s else None})
        if rota.path == "/api/status":
            return self.responder(200, {"ok": True})
        if rota.path == "/api/pdf":
            url = (parse_qs(rota.query).get("url") or [""])[0].strip()
            if urlparse(url).scheme not in ("http", "https"):
                return self.responder(400, {"erro": "endereço inválido"})
            try:
                req = Request(url, headers=CABECALHOS)
                with urlopen(req, timeout=25) as up:
                    dados = up.read(40 * 1024 * 1024)
                self.send_response(200)
                self.send_header("Content-Type", "application/pdf")
                self.send_header("Content-Length", str(len(dados)))
                self.send_header("Cache-Control", "no-store")
                self.end_headers()
                self.wfile.write(dados)
                return
            except Exception as e:
                motivo = getattr(e, "code", None) or getattr(e, "reason", None) or e.__class__.__name__
                return self.responder(502, {"erro": f"não consegui baixar o PDF ({motivo})"})
        if rota.path == "/api/capturar":
            url = (parse_qs(rota.query).get("url") or [""])[0].strip()
            if urlparse(url).scheme not in ("http", "https"):
                return self.responder(400, {"erro": "endereço inválido"})
            try:
                pagina, final = baixar(url)
                if bloqueado(pagina):
                    return self.responder(502, {"erro": "a loja bloqueou a leitura automática desta página"})
                return self.responder(200, extrair(pagina, final))
            except Exception as e:  # rede, bloqueio da loja, página fora do ar
                motivo = getattr(e, "code", None) or getattr(e, "reason", None) or e.__class__.__name__
                return self.responder(502, {"erro": f"a loja não respondeu ({motivo})"})
        return super().do_GET()

    def end_headers(self):
        if not self.path.startswith("/api/"):
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def log_message(self, formato, *args):
        if "/api/" in (args[0] if args else ""):
            super().log_message(formato, *args)


if __name__ == "__main__":
    servidor = ThreadingHTTPServer(("127.0.0.1", PORTA), partial(Manipulador, directory=str(RAIZ)))
    endereco = f"http://localhost:{PORTA}/"
    print(f"Meu Espaço rodando em {endereco}\nDeixe esta janela aberta. Para parar: Ctrl+C.")
    if "--sem-navegador" not in sys.argv:
        threading.Timer(0.6, lambda: webbrowser.open(endereco)).start()
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
