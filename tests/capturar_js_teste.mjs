// Testes do capturador que roda na Vercel (api/capturar.js), sem rede: preço da Amazon.
import { extrair } from '../api/capturar.js';
const pag = (preco, extra = '') => `<html><head><title>Livro</title></head><body><span id="productTitle">Livro</span>${preco}${extra}</body></html>`;
const URL_ = 'https://www.amazon.com.br/dp/B000TESTE1';
const casos = [
  ['inteiro + centavos', pag('<span class="a-price"><span class="a-price-whole">20<span class="a-price-decimal">,</span></span><span class="a-price-fraction">60</span></span>'), 20.6],
  ['milhar', pag('<span class="a-price-whole">1.234<span class="a-price-decimal">,</span></span><span class="a-price-fraction">05</span>'), 1234.05],
  ['a-offscreen com entidade', pag('<span class="a-price"><span class="a-offscreen">R$&#160;52,04</span></span>'), 52.04],
  ['JSON em centavos não vale', pag('', '<script>{"price":2060,"priceAmount":2060}</script>'), null]
];
let falhas = 0;
for (const [nome, html, esperado] of casos) {
  const r = extrair(html, URL_); const ok = r.preco === esperado;
  console.log((ok ? '  ok   ' : '  FALHOU ') + `${nome}: ${r.preco}`); if (!ok) falhas++;
}
process.exit(falhas ? 1 : 0);
