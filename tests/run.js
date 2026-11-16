/* Testes do Tyba. Rode com:  node tests/run.js
   Precisa do Playwright (npm i -D playwright, ou já instalado). Sobe um servidor local sozinho.
   Cada teste roda em claro e escuro, em 1280px e 390px quando faz sentido. */
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const semente = require('./semente.js');

const RAIZ = path.join(__dirname, '..');
const PORTA = 8799, BASE = `http://localhost:${PORTA}/`;
const versao = () => { const m = require('fs').readFileSync(path.join(RAIZ, 'assets/js/atualizacoes.js'), 'utf8').match(/window\.ATUALIZACOES = \[\s*\{\s*versao:\s*'([^']+)'/); return m[1]; };

const falhas = [];
const conferir = (ok, msg) => { console.log((ok ? '  ok   ' : '  FALHOU ') + msg); if (!ok) falhas.push(msg); };

async function pagina(browser, { w = 1280, modo = 'claro', ajustar } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const st = semente(); st.perfil.modo = modo; if (ajustar) ajustar(st);
  await ctx.addInitScript(([s, v]) => { if (!localStorage.getItem('meuEspaco.v1')) localStorage.setItem('meuEspaco.v1', JSON.stringify(s)); localStorage.setItem('meuEspaco.novidades', v); }, [st, versao()]);
  const p = await ctx.newPage(); p.erros = []; p.on('pageerror', (e) => p.erros.push(e.message));
  return { p, ctx };
}
const estado = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('meuEspaco.v1')));

const TESTES = {
  async 'sem scroll lateral nas páginas (390px, claro e escuro)'(b) {
    for (const modo of ['claro', 'escuro']) {
      const { p, ctx } = await pagina(b, { w: 390, modo });
      for (const rota of ['inicio', 'agenda', 'tarefas', 'mural', 'musicas', 'biblioteca', 'wishlist', 'gastos', 'curriculo']) {
        await p.goto(`${BASE}#/${rota}`); await p.waitForTimeout(450);
        const [sw, iw] = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
        conferir(sw <= iw, `${modo} #/${rota}: largura ${sw} ≤ ${iw}`);
      }
      conferir(!p.erros.length, `${modo}: sem erros de script ${p.erros.join('|')}`); await ctx.close();
    }
  },
  async 'onboarding: 7 passos e cor Personalizada salva'(b) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage(); p.erros = []; p.on('pageerror', (e) => p.erros.push(e.message));
    await p.goto(BASE + '#/inicio'); await p.waitForTimeout(1200);
    conferir(await p.$$eval('.modal-onb', (a) => a.length) === 1, 'onboarding abre em espaço novo');
    conferir(/de 7/.test(await p.textContent('.modal-onb')), 'tem 7 passos');
    for (let i = 0; i < 3; i++) { await p.click('[data-act="onb-prox"]'); await p.waitForTimeout(250); }
    await p.$eval('[data-act="onb-cor"]', (e) => { e.value = '#d9480f'; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); });
    await p.waitForTimeout(200);
    conferir((await estado(p)).perfil.corCustom === '#d9480f', 'cor personalizada salva no perfil');
    conferir(!p.erros.length, 'sem erros de script'); await ctx.close();
  },
  async 'arrastar tarefa entre colunas e botões de mover'(b) {
    const { p, ctx } = await pagina(b, { ajustar: (s) => { s.itens = s.itens.filter((i) => i.tipo !== 'tarefa'); ['afazer', 'afazer'].forEach((e, k) => s.itens.push({ id: 'tt' + k, tipo: 'tarefa', titulo: 'T' + k, etapa: e, concluida: false, colecoes: [], comentarios: [], criadoEm: '2026-11-15T10:00:00.000Z' })); } });
    await p.goto(BASE + '#/inicio'); await p.waitForTimeout(500); await p.keyboard.press('Shift+Space'); await p.waitForTimeout(250);
    const cols = () => p.$$eval('.trab-interno .quadro-col', (c) => c.map((x) => x.querySelectorAll('.tar-cartao').length));
    conferir(JSON.stringify(await cols()) === '[2,0,0]', 'quadro começa com 2 em A fazer');
    const a = await (await p.$('.trab-interno [data-etapa-alvo="afazer"] .tar-cartao')).boundingBox();
    const d = await (await p.$('.trab-interno [data-etapa-alvo="fazendo"]')).boundingBox();
    await p.mouse.move(a.x + 90, a.y + 20); await p.mouse.down(); await p.mouse.move(a.x + 100, a.y + 40, { steps: 4 });
    await p.mouse.move(d.x + d.width / 2, d.y + 250, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(250);
    const dep = JSON.stringify(await cols()); conferir(dep === '[1,1,0]', 'arrastar para a coluna Fazendo vazia, soltando bem abaixo (' + dep + ')');
    await p.click('.trab-interno [data-act="tar-para"][data-v="feito"] >> nth=0'); await p.waitForTimeout(250);
    conferir((await cols())[2] === 1, 'botão "Mover para Feito" funciona');
    await p.fill('.trab-nome', 'Estudo'); await p.keyboard.press('Enter');
    conferir((await estado(p)).perfil.nomeTrabalho === 'Estudo', 'nome do quadro editável e salvo');
    conferir(!p.erros.length, 'sem erros de script'); await ctx.close();
  },
  async 'quadro no celular: abas, uma coluna por vez e arrastar até a aba (390px)'(b) {
    for (const modo of ['claro', 'escuro']) {
      const { p, ctx } = await pagina(b, { w: 390, modo, ajustar: (s) => { s.itens = s.itens.filter((i) => i.tipo !== 'tarefa'); ['afazer', 'afazer', 'fazendo'].forEach((e, k) => s.itens.push({ id: 'tt' + k, tipo: 'tarefa', titulo: 'T' + k, etapa: e, concluida: false, colecoes: [], comentarios: [], criadoEm: '2026-11-15T10:00:00.000Z' })); } });
      await p.goto(BASE + '#/tarefas'); await p.waitForTimeout(500);
      await p.click('[data-act="tar-visao"][data-v="quadro"]'); await p.waitForTimeout(300);
      const visiveis = () => p.$$eval('.quadro.tres .quadro-col', (c) => c.filter((x) => getComputedStyle(x).display !== 'none').length);
      conferir(await p.$$eval('.quadro-aba', (a) => a.length) === 3, `${modo}: 3 abas`);
      conferir(await visiveis() === 1, `${modo}: só uma coluna visível`);
      await p.click('.quadro-aba[data-v="fazendo"]'); await p.waitForTimeout(250);
      conferir(await p.$$eval('.quadro-col.ativa .tar-cartao', (a) => a.length) === 1, `${modo}: aba Fazendo mostra 1 tarefa`);
      await p.click('.quadro-aba[data-v="afazer"]'); await p.waitForTimeout(250);
      const c = await (await p.$('.quadro-col.ativa .tar-cartao')).boundingBox(), t = await (await p.$('.quadro-aba[data-v="fazendo"]')).boundingBox();
      await p.mouse.move(c.x + 90, c.y + 20); await p.mouse.down(); await p.mouse.move(c.x + 110, c.y + 10, { steps: 4 });
      await p.mouse.move(t.x + t.width / 2, t.y + t.height / 2, { steps: 8 }); await p.waitForTimeout(150);
      conferir(await p.$$eval('.quadro-aba.alvo-aba', (a) => a.length) === 1, `${modo}: a aba de destino acende durante o arrasto`);
      await p.mouse.up(); await p.waitForTimeout(300);
      const st = (await estado(p)).itens.filter((i) => i.tipo === 'tarefa').map((i) => i.etapa).sort().join();
      conferir(st === 'afazer,fazendo,fazendo', `${modo}: arrastar até a aba Fazendo move a tarefa (${st})`);
      const [sw, iw] = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
      conferir(sw <= iw, `${modo}: sem scroll lateral`); conferir(!p.erros.length, `${modo}: sem erros de script`); await ctx.close();
    }
  },
  async 'excluir cria lápide e não volta após recarregar'(b) {
    const { p, ctx } = await pagina(b);
    await p.goto(BASE + '#/links'); await p.waitForTimeout(500);
    const antes = (await estado(p)).itens.length;
    await p.click('[data-act=sel-ligar]'); await p.click('.post >> nth=0'); await p.click('[data-act=sel-excluir]'); await p.waitForTimeout(250);
    await p.click('.dialogo-conf [data-r="1"]'); await p.waitForTimeout(350);
    await p.reload(); await p.waitForTimeout(500);
    const s = await estado(p);
    conferir(s.itens.length === antes - 1, 'item some e continua fora após recarregar');
    conferir(Object.keys((s.excluidos || {}).itens || {}).length === 1, 'lápide registrada'); await ctx.close();
  },
  async 'wishlist em lote: um link por linha, pula repetido e inválido'(b) {
    const { p, ctx } = await pagina(b, { ajustar: (s) => { s.itens = s.itens.filter((i) => i.tipo !== 'desejo'); } });
    await p.goto(BASE + '#/wishlist'); await p.waitForTimeout(500);
    await p.click('[data-act="criar"][data-t="desejo"]'); await p.waitForTimeout(250);
    await p.fill('#f-url', 'https://loja.com/a\nloja.com/b\nhttps://loja.com/a\nhttps://loja.com/c');
    await p.click('#modal button[type="submit"]'); await p.waitForTimeout(600);
    const urls = (await estado(p)).itens.filter((i) => i.tipo === 'desejo').map((i) => i.url);
    conferir(urls.length === 3, `3 desejos guardados (${urls.length})`); await ctx.close();
  },
  async 'menu em gaveta e dia do calendário em folha de baixo (390px)'(b) {
    const { p, ctx } = await pagina(b, { w: 390 });
    await p.goto(BASE + '#/inicio'); await p.waitForTimeout(500);
    await p.click('#btn-menu'); await p.waitForTimeout(350);
    conferir(await p.$eval('.nav-lateral', (e) => getComputedStyle(e).visibility) === 'visible', 'gaveta abre');
    await p.click('.nav-lateral a[href="#/agenda"]'); await p.waitForTimeout(450);
    conferir(await p.$eval('.ag-painel', (e) => getComputedStyle(e).visibility) === 'hidden', 'folha do dia começa fechada');
    await p.click('.ag-dia:not(.fora) >> nth=10'); await p.waitForTimeout(400);
    conferir(await p.$eval('.ag-painel', (e) => getComputedStyle(e).visibility) === 'visible', 'tocar num dia abre a folha');
    await p.click('.ag-painel .ag-sheet-cab .ico-btn'); await p.waitForTimeout(350);
    conferir(await p.$eval('.ag-painel', (e) => getComputedStyle(e).visibility) === 'hidden', 'botão fecha a folha'); await ctx.close();
  },
  async 'cabeçalho do feed com "Selecionar" só em ícone no celular'(b) {
    const { p, ctx } = await pagina(b, { w: 390 });
    await p.goto(BASE + '#/inicio'); await p.waitForTimeout(500);
    const [sw, iw] = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    conferir(sw <= iw, `Início sem scroll lateral (${sw} ≤ ${iw})`); await ctx.close();
  }
};

(async () => {
  const srv = spawn('python3', ['-m', 'http.server', String(PORTA)], { cwd: RAIZ, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 900));
  const b = await chromium.launch();
  const filtro = process.argv[2];
  try {
    for (const [nome, fn] of Object.entries(TESTES)) {
      if (filtro && !nome.includes(filtro)) continue;
      console.log('\n' + nome);
      try { await fn(b); } catch (e) { falhas.push(nome + ': ' + e.message.split('\n')[0]); console.log('  ERRO ' + e.message.split('\n')[0]); }
    }
  } finally { await b.close(); srv.kill(); }
  console.log(falhas.length ? `\n${falhas.length} falha(s):\n- ` + falhas.join('\n- ') : '\nTudo certo.');
  process.exit(falhas.length ? 1 : 0);
})();
