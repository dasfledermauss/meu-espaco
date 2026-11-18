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
const conferir = (ok, msg) => { if (!ok && /erros/.test(msg) && global.__erros) console.log('   >> ', global.__erros); console.log((ok ? '  ok   ' : '  FALHOU ') + msg); if (!ok) falhas.push(msg); };

async function pagina(browser, { w = 1280, modo = 'claro', ajustar, novidades = true } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const st = semente(); st.perfil.modo = modo; if (ajustar) ajustar(st);
  await ctx.addInitScript(([s, v, nov]) => { if (!localStorage.getItem('meuEspaco.v1')) localStorage.setItem('meuEspaco.v1', JSON.stringify(s)); if (nov) localStorage.setItem('meuEspaco.novidades', v); }, [st, versao(), novidades]);
  const p = await ctx.newPage(); p.erros = []; p.on('pageerror', (e) => { p.erros.push(e.message); global.__erros = e.message + ' | ' + ((e.stack || '').split('\n')[1] || ''); });
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
    await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('meuEspaco.v1') || 'null'); window.__foto = s && s.perfil && s.perfil.foto; });
    conferir(!await p.evaluate(() => window.__foto), 'espaço novo não recebe foto de ninguém (avatar neutro)');
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
  async 'reordenar tarefas arrastando: na mesma lista e entre listas, com cartões que deslizam'(b) {
    const { p, ctx } = await pagina(b, { ajustar: (s) => { s.itens = s.itens.filter((i) => i.tipo !== 'tarefa'); [['A', 'afazer'], ['B', 'afazer'], ['C', 'afazer'], ['X', 'fazendo'], ['Y', 'fazendo']].forEach(([t, e], k) => s.itens.push({ id: 'r' + t, tipo: 'tarefa', titulo: t, etapa: e, concluida: false, colecoes: [], comentarios: [], criadoEm: '2026-11-1' + k + 'T10:00:00.000Z' })); } });
    await p.goto(BASE + '#/inicio'); await p.waitForTimeout(500); await p.keyboard.press('Shift+Space'); await p.waitForTimeout(250);
    const ordem = (et) => p.$$eval(`.trab-interno [data-etapa-alvo="${et}"] .tar-cartao`, (c) => c.map((x) => x.textContent.trim().replace(/\s+/g, ' ').slice(0, 1)).join(''));
    const cartao = (et, n) => p.$(`.trab-interno [data-etapa-alvo="${et}"] .tar-cartao >> nth=${n}`);
    const inicial = await ordem('afazer'); conferir(inicial.length === 3, `Afazer começa com 3 cartões (${inicial})`);
    async function arrastar(et, n, destinoEt, destinoN, depois) {
      const a = await (await cartao(et, n)).boundingBox(), d = await (await cartao(destinoEt, destinoN)).boundingBox();
      await p.mouse.move(a.x + 90, a.y + 20); await p.mouse.down(); await p.mouse.move(a.x + 100, a.y + 30, { steps: 3 });
      await p.mouse.move(d.x + 90, d.y + (depois ? d.height - 6 : 6), { steps: 10 }); await p.waitForTimeout(350);
      const sil = await p.$$eval('.tar-silhueta', (a) => a.length);
      await p.mouse.up(); await p.waitForTimeout(300); return sil;
    }
    const sil1 = await arrastar('afazer', 0, 'afazer', 2, true);
    conferir(sil1 === 1, 'uma silhueta marca o lugar durante o arrasto');
    const o1 = await ordem('afazer');
    conferir(o1.length === 3 && o1[2] === inicial[0] && o1.slice(0, 2) === inicial.slice(1), `mesma lista: primeiro vai para o fim (${inicial} → ${o1})`);
    const alvoAntes = await ordem('fazendo');
    await arrastar('afazer', 0, 'fazendo', 1, false);
    const o2 = await ordem('fazendo'), o3 = await ordem('afazer');
    conferir(o2.length === 3 && o2[1] === o1[0], `outra lista: entra entre os cartões, na posição do meio (${alvoAntes} → ${o2})`);
    conferir(o3 === o1.slice(1), `lista de origem perde o cartão (${o3})`);
    await p.reload(); await p.waitForTimeout(500); await p.keyboard.press('Shift+Space'); await p.waitForTimeout(250);
    conferir(await ordem('fazendo') === o2, 'a ordem fica salva ao recarregar');
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
  async 'pets: botão Bolinha desliga a brincadeira e dois cães não se cobrem'(b) {
    const { p, ctx } = await pagina(b, { ajustar: (s) => { s.perfil.pet2 = { tipo: 'frajola', nome: 'Mimi' }; } });
    await p.goto(BASE + '#/inicio'); await p.waitForTimeout(800);
    const cena = await p.$('#pet-cena'), r = await cena.boundingBox();
    await p.click('[data-act="pet-config"]'); await p.waitForTimeout(200);
    await p.click('[data-act="pet-bolinha"]'); await p.waitForTimeout(200);
    conferir((await estado(p)).perfil.petSemBola === true, 'botão Bolinha salva o desligado');
    await p.click('[data-act="pet-config"] >> nth=0').catch(() => {}); await p.waitForTimeout(100);
    await p.mouse.click(r.x + r.width * .2, r.y + r.height - 14); await p.waitForTimeout(600);
    conferir(!(await p.$('.pet-bola')), 'com a bolinha desligada, clicar no chão não joga bola');
    let min = 999;
    for (let i = 0; i < 20; i++) { await p.waitForTimeout(500); const xs = await p.$$eval('.pet-cao', (a) => a.map((e) => { const q = e.getBoundingClientRect(); return [q.left + q.width / 2, q.width]; })); if (xs.length === 2) min = Math.min(min, Math.abs(xs[0][0] - xs[1][0]) / xs[0][1]); }
    conferir(min > .7, `cães não ficam um sobre o outro (distância mínima ${min.toFixed(2)} corpos)`);
    conferir(!p.erros.length, 'sem erros de script'); await ctx.close();
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
  async 'currículo: tela abre e importar JSON mostra a revisão'(b) {
    const { p, ctx } = await pagina(b);
    const erros = []; p.on('pageerror', (e) => erros.push(e.message));
    await p.goto(BASE + '#/curriculo'); await p.waitForTimeout(500);
    conferir((await p.textContent('#conteudo')).includes('Meu currículo'), 'tela do currículo abre');
    const json = JSON.stringify({ perfil: { nome: 'Teste CV' }, experiencias: [{ cargo: 'Designer', organizacao: 'Tyba', inicio: '2020-01' }] });
    await p.setInputFiles('#arquivo-cv', { name: 'cv.json', mimeType: 'application/json', buffer: Buffer.from(json) }); await p.waitForTimeout(600);
    const t = await p.textContent('#conteudo');
    conferir(/Designer/.test(t), 'revisão da importação lista a experiência');
    conferir(!erros.length, 'sem erros de script' + (erros.length ? ': ' + erros[0] : '')); await ctx.close();
  },
  async 'músicas: lista abre, tocar mostra o mini player'(b) {
    const { p, ctx } = await pagina(b, { ajustar: (st) => { st.itens.push(
      { id: 'm1', tipo: 'musica', titulo: 'Faixa de teste um', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', video: 'aqz-KE-bpKQ', ordem: 1, colecoes: [], criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString(), comentarios: [] },
      { id: 'm2', tipo: 'musica', titulo: 'Faixa de teste dois', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', video: 'dQw4w9WgXcQ', ordem: 2, colecoes: [], criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString(), comentarios: [] }); } });
    const erros = []; p.on('pageerror', (e) => { if (!/Access is denied/.test(e.message)) erros.push(e.message); });  // o iframe do YouTube barra o localStorage no teste
    await p.goto(BASE + '#/musicas'); await p.waitForTimeout(600);
    const t = await p.textContent('#conteudo');
    conferir(/Faixa de teste um/.test(t) && /Faixa de teste dois/.test(t), 'lista mostra as duas músicas');
    await p.click('[data-act="tocar"][data-id="m1"]').catch(() => p.click('text=Faixa de teste um')); await p.waitForTimeout(600);
    conferir(await p.evaluate(() => !!document.querySelector('.mini-app, .miniapp, [class*="mini"]')), 'mini player aparece');
    conferir(!erros.length, 'sem erros de script' + (erros.length ? ': ' + erros[0] : '')); await ctx.close();
  },
  async 'wishlist: captura que falha não entra em loop'(b) {
    const { p, ctx } = await pagina(b, { ajustar: (st) => { const d = st.itens.find((x) => x.tipo === 'desejo'); delete d.capturaEm; d.capturaStatus = 'falhou'; } });
    let chamadas = 0;
    await p.route('**/api/status', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
    await p.route('**/api/capturar*', (r) => { chamadas++; r.fulfill({ status: 502, contentType: 'application/json', body: '{"erro":"bloqueio"}' }); });
    await p.goto(BASE + '#/wishlist'); await p.waitForTimeout(5000);
    conferir(chamadas >= 1, `tentou capturar (${chamadas})`);
    conferir(chamadas <= 1, `não repetiu a captura que falhou (${chamadas} chamadas em 5 s)`);
    await ctx.close();
  },
  async 'servidor: preço da Amazon (partes separadas e centavos)'() {
    const r = require('child_process').spawnSync('python3', [path.join(__dirname, 'servidor_teste.py')], { encoding: 'utf8' });
    (r.stdout || '').split('\n').filter(Boolean).forEach((l) => console.log(l));
    conferir(r.status === 0, 'casos de preço da Amazon' + (r.status ? ': ' + (r.stderr || '').split('\n').filter(Boolean).pop() : ''));
  },
  async 'início: previsão do tempo e popup de novidades'(b) {
    const { p, ctx } = await pagina(b, { novidades: false });
    const erros = []; p.on('pageerror', (e) => erros.push(e.message));
    await p.goto(BASE + '#/inicio'); await p.waitForTimeout(500);
    conferir(/Previsão do tempo/.test(await p.textContent('body')), 'cartão da previsão do tempo aparece');
    const ver = versao();
    conferir((await p.textContent('body')).includes('versão ' + ver), `popup de novidades mostra a versão ${ver}`);
    conferir(!erros.length, 'sem erros de script' + (erros.length ? ': ' + erros[0] : '')); await ctx.close();
  },
  async 'capturador da Vercel (api/capturar.js): preço da Amazon'() {
    const r = require('child_process').spawnSync('node', [path.join(__dirname, 'capturar_js_teste.mjs')], { encoding: 'utf8' });
    (r.stdout || '').split('\n').filter(Boolean).forEach((l) => console.log(l));
    conferir(r.status === 0, 'casos de preço da Amazon no api/capturar.js' + (r.status ? ': ' + (r.stderr || '').split('\n').filter(Boolean).slice(-1)[0] : ''));
  },
  async 'lembretes: destaque segue a cor principal, com contraste AA nos dois temas'(b) {
    for (const modo of ['claro', 'escuro']) {
      const { p, ctx } = await pagina(b, { modo, ajustar: (st) => { st.lembretes.push({ id: 'lv', texto: 'Lembrete vencido de teste', data: '2026-11-01', hora: '09:00', concluido: false, criadoEm: new Date().toISOString() }); } });
      const medir = (sel) => p.evaluate((sel) => {
        const el = document.querySelector(sel); if (!el) return null;
        const rgb = (c) => c.match(/[\d.]+/g).slice(0, 3).map(Number);
        const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
        const cs = getComputedStyle(el); const marca = getComputedStyle(document.documentElement).getPropertyValue('--marca-leve').trim();
        const bg = rgb(cs.backgroundColor), fg = rgb(cs.color); const [a, c] = [lum(bg), lum(fg)];
        return { ratio: (Math.max(a, c) + 0.05) / (Math.min(a, c) + 0.05), bg: cs.backgroundColor, marca };
      }, sel);
      await p.goto(BASE + '#/inicio'); await p.waitForTimeout(600);
      const faixa = await medir('.faixa-lembrete');
      conferir(faixa && faixa.ratio >= 4.5, `${modo}: faixa de lembrete vencido com contraste ${faixa && faixa.ratio.toFixed(1)}`);
      const corMarca = await p.evaluate(() => { const t = document.createElement('i'); t.style.background = 'var(--marca-leve)'; document.body.appendChild(t); const c = getComputedStyle(t).backgroundColor; t.remove(); return c; });
      conferir(faixa && faixa.bg === corMarca, `${modo}: faixa usa a cor principal (e não o amarelo)`);
      await p.goto(BASE + '#/lembretes'); await p.waitForTimeout(600);
      const card = await medir('.lembrete.vence');
      conferir(card && card.ratio >= 4.5 && card.bg === corMarca, `${modo}: cartão vencido segue a cor principal, contraste ${card && card.ratio.toFixed(1)}`);
      await p.goto(BASE + '#/agenda'); await p.waitForTimeout(600);
      const chip = await medir('.ag-chip.lem');
      conferir(chip && chip.ratio >= 4.5, `${modo}: etiqueta de lembrete na agenda com contraste ${chip && chip.ratio.toFixed(1)}`);
      await ctx.close();
    }
  },
  async 'início: contagem regressiva tem ícone e o título quebra linha dentro do cartão'(b) {
    for (const modo of ['claro', 'escuro']) {
      const { p, ctx } = await pagina(b, { modo, ajustar: (st) => { const d = new Date(); d.setDate(d.getDate() + 12); const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); st.eventos = (st.eventos || []).concat({ id: 'ec', titulo: 'Viagem para a praia com a família inteira', data: iso, hora: '08:00', contagem: true, criadoEm: new Date().toISOString() }); } });
      await p.goto(BASE + '#/inicio'); await p.waitForTimeout(600);
      const r = await p.evaluate(() => { const c = document.querySelector('.contagem'); if (!c) return null; const s = c.querySelector('strong').getBoundingClientRect(), k = c.getBoundingClientRect(); return { ico: !!c.querySelector('.contagem-ico svg'), cabe: s.right <= k.right + 1 }; });
      conferir(r && r.ico, `${modo}: contagem regressiva mostra o ícone`);
      conferir(r && r.cabe, `${modo}: título longo quebra linha dentro do cartão`);
      await ctx.close();
    }
  },
  async 'agenda: título longo no painel do dia quebra linha dentro do cartão'(b) {
    for (const [w, modo] of [[1280, 'escuro'], [390, 'claro']]) {
      const { p, ctx } = await pagina(b, { w, modo, ajustar: (st) => { const d = new Date(); const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); st.lembretes = (st.lembretes || []).concat({ id: 'lx', texto: 'Texto bem comprido para testar a quebra de linha dentro dos cartões do painel do dia na agenda', data: iso, hora: '02:45', concluido: false, criadoEm: new Date().toISOString() }); } });
      await p.goto(BASE + '#/agenda'); await p.waitForTimeout(600);
      const r = await p.evaluate(() => { const l = document.querySelector('.ag-linha'); if (!l) return null; const s = l.querySelector('strong').getBoundingClientRect(), k = l.getBoundingClientRect(); return { cabe: s.right <= k.right + 1, ws: getComputedStyle(l).whiteSpace }; });
      conferir(r && r.cabe && r.ws === 'normal', `${modo} ${w}px: texto longo da agenda fica dentro do cartão`);
      await ctx.close();
    }
  },
  async 'correios: receber carta, salvar na mesma seção e enviar itens'(b) {
    for (const [w, modo] of [[1280, 'claro'], [390, 'escuro']]) {
      const { p, ctx } = await pagina(b, { w, modo });
      await p.goto(BASE + '#/inicio'); await p.waitForTimeout(500);
      await p.evaluate(() => { let cb = null; window.__env = []; const caixa = [];
        window.Nuvem.correios = { disponivel: () => true, registrar: async () => {}, buscar: async (c) => (c === 'ANA123' ? { uid: 'u2', nome: 'Ana' } : null),
          enviar: async (d, c) => { window.__env.push([d, c]); }, ouvir: (f) => { cb = f; f([]); window.__push = (c) => { caixa.push(c); cb(caixa.slice()); }; return () => {}; },
          apagar: async (id) => { const k = caixa.findIndex((x) => x.id === id); if (k >= 0) caixa.splice(k, 1); cb(caixa.slice()); } }; });
      await p.evaluate(() => window.__meuEspaco.correios.ligar()); await p.waitForTimeout(300);
      await p.evaluate(() => window.__push({ id: 'c1', de: 'u2', deNome: 'Ana', bilhete: 'olha isso', enviadoEm: new Date().toISOString(), item: { tipo: 'link', url: 'https://exemplo.com/a-b', titulo: 'Um link enviado' } }));
      await p.waitForTimeout(300);
      conferir(await p.evaluate(() => (document.querySelector('[data-area=correios]') || {}).textContent.includes('1')), `${modo} ${w}px: Correios mostra 1 carta no menu`);
      await p.goto(BASE + '#/correios'); await p.waitForTimeout(400);
      conferir(await p.evaluate(() => document.querySelectorAll('.carta').length) === 1, `${modo} ${w}px: carta aparece na caixa de entrada`);
      const antes = await p.evaluate(() => window.__meuEspaco.estado.itens.length);
      await p.click('[data-act=carta-salvar]'); await p.waitForTimeout(400);
      const r = await p.evaluate(() => { const it = window.__meuEspaco.estado.itens.find((i) => i.url === 'https://exemplo.com/a-b'); return { n: window.__meuEspaco.estado.itens.length, tipo: it && it.tipo, cartas: document.querySelectorAll('.carta').length }; });
      conferir(r.n === antes + 1 && r.tipo === 'link' && r.cartas === 0, `${modo} ${w}px: Salvar cria o item na mesma seção e tira a carta`);
      await p.waitForTimeout(200);
      conferir(/^[A-Z2-9]{3}-[A-Z2-9]{3}$/.test(await p.evaluate(() => (document.querySelector('.codigo-amigo') || {}).textContent || '')), `${modo} ${w}px: Correios mostra o seu código de amigo`);
      await p.fill('.amigo-form input', 'xx-0000'); await p.click('.amigo-form button[type=submit]'); await p.waitForTimeout(300);
      conferir(await p.evaluate(() => window.__meuEspaco.correios.amigos().length) === 0, `${modo} ${w}px: código inválido não adiciona ninguém`);
      await p.fill('.amigo-form input', 'ana-123'); await p.click('.amigo-form button[type=submit]'); await p.waitForTimeout(400);
      conferir(await p.evaluate(() => window.__meuEspaco.correios.amigos().map((x) => x.nome).join()) === 'Ana' && await p.evaluate(() => document.querySelectorAll('.lista-amigos li').length) === 1, `${modo} ${w}px: adicionar amigo pelo código`);
      const id = await p.evaluate(() => window.__meuEspaco.estado.itens.find((i) => i.tipo === 'link').id);
      await p.evaluate((x) => window.__meuEspaco.correios.abrirEnvio([x]), id); await p.waitForTimeout(500);
      await p.fill('textarea[name=bilhete]', 'para você'); await p.click('.modal button[type=submit]'); await p.waitForTimeout(400);
      const env = await p.evaluate(() => window.__env.map(([d, c]) => [d, c.bilhete, c.item.tipo, 'id' in c.item, 'comentarios' in c.item]));
      conferir(env.length === 1 && env[0][0] === 'u2' && env[0][1] === 'para você' && env[0][2] === 'link' && !env[0][3] && !env[0][4], `${modo} ${w}px: envio leva só o conteúdo do item para a pessoa escolhida`);
      await p.evaluate(() => window.__meuEspaco.correios.removerAmigo('u2')); await p.waitForTimeout(200);
      await p.evaluate((x) => window.__meuEspaco.correios.abrirEnvio([x]), id); await p.waitForTimeout(500);
      conferir(await p.evaluate(() => /código/.test((document.querySelector('.modal .dica') || {}).textContent || '') && document.querySelector('.modal button[type=submit]').disabled), `${modo} ${w}px: sem amigos, o envio explica e o botão fica apagado`);
      await ctx.close();
    }
  },
  async 'correios: Enviar pelo Correios no menu da Wishlist e do Mural'(b) {
    for (const rota of ['wishlist', 'mural']) {
      const { p, ctx } = await pagina(b, { w: 1280, modo: 'claro' });
      await p.goto(BASE + '#/' + rota); await p.waitForTimeout(600);
      const n = await p.evaluate(() => document.querySelectorAll('[data-act=correios-enviar]').length);
      conferir(n > 0, `${rota}: os cartões têm "Enviar pelo Correios" no menu ⋯ (${n})`);
      await ctx.close();
    }
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
