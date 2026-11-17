/* Tyba — arrastar para reordenar (página inicial, colunas do Início e cartões de tarefa).
   Módulo separado do app.js: recebe do app o que precisa (estado, utilidades) por `ctx` e devolve só o que o resto do app usa.
   `S` aqui é um espelho do estado do app (que troca de objeto ao importar backup ou sincronizar), então sempre aponta para o atual. */
window.TybaArrastar = function (ctx) {
  'use strict';
  const { UI, direita, layout, GRUPO_DE } = ctx;
  const S = new Proxy({}, { get: (_, k) => ctx.S()[k], set: (_, k, v) => { ctx.S()[k] = v; return true; }, has: (_, k) => k in ctx.S(), ownKeys: () => Reflect.ownKeys(ctx.S()), getOwnPropertyDescriptor: (_, k) => ({ value: ctx.S()[k], enumerable: true, configurable: true, writable: true }) });
  const agora = (...a) => ctx.agora(...a), salvar = (...a) => ctx.salvar(...a), item = (...a) => ctx.item(...a), etapa = (...a) => ctx.etapa(...a), cartao = (...a) => ctx.cartao(...a), vazio = (...a) => ctx.vazio(...a), area = (...a) => ctx.area(...a), musicas = (...a) => ctx.musicas(...a), moverTarefa = (...a) => ctx.moverTarefa(...a), abasOrdenadas = (...a) => ctx.abasOrdenadas(...a), areasOrdenadas = (...a) => ctx.areasOrdenadas(...a), ordemDireita = (...a) => ctx.ordemDireita(...a), empacotarTudo = (...a) => ctx.empacotarTudo(...a), render = (...a) => ctx.render(...a), conta = (...a) => ctx.conta(...a);
  /* ---------------- arrastar para reordenar ----------------
     O item fica "na mão": segue o ponteiro, levemente inclinado, e os outros abrem espaço na hora.
     Vale para post-its, faixas do mini app, áreas do menu e blocos da direita (data-ordena="grupo" + data-oid="id").
     No toque, segure um instante para pegar (assim a tela ainda rola). Esc cancela. */
  const SALVAR_ORDEM = {
    notas(ids) { reordenarPorValores(ids); },
    musicas(ids) { reordenarPorValores(ids); },
    areas(ids) { S.perfil.ordemNav = ids.concat(areasOrdenadas().map((a) => a[0]).filter((r) => !ids.includes(r))); },
    abas(ids) { const g = GRUPO_DE[ids[0]]; if (!g) return; S.perfil.ordemAbas = S.perfil.ordemAbas || {}; S.perfil.ordemAbas[g] = ids.concat(abasOrdenadas(g).filter((r) => !ids.includes(r))); },
    blocos(ids) { S.perfil.ordemDireita = ids.concat(ordemDireita().filter((x) => !ids.includes(x))); }
  };
  /** Redistribui os valores de "ordem" já usados entre os itens, na nova sequência (o resto da lista não muda de lugar). */
  function reordenarPorValores(ids) {
    const l = ids.map(item).filter(Boolean);
    const v = l.map((x) => x.ordem ?? 0).sort((a, b) => a - b);
    const unico = v.every((x, k) => !k || x > v[k - 1]);
    l.forEach((x, k) => { x.ordem = unico ? v[k] : v[0] + k; });
  }
  (function ordenarArrastando() {
    let s = null;
    const IGNORA = 'button, input, select, textarea, summary, details.menu, label, [data-nodrag]';
    const irmaos = (c, g) => [...c.children].filter((x) => x.dataset && x.dataset.ordena === g);
    const dentro = (r, x, y) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    /** Muda o DOM e anima cada irmão do lugar antigo para o novo (técnica FLIP). */
    function animarTroca(els, mudar) {
      const antes = new Map(els.map((x) => [x, x.getBoundingClientRect()]));
      els.forEach((x) => { x.style.transition = 'none'; x.style.transform = ''; });
      mudar(); empacotarTudo();
      els.forEach((x) => {
        const a = antes.get(x), d = x.getBoundingClientRect(), dx = a.left - d.left, dy = a.top - d.top;
        if (!dx && !dy) return;
        x.style.transform = `translate(${dx}px, ${dy}px)`; x.getBoundingClientRect();
        x.style.transition = 'transform .2s ease-out'; x.style.transform = '';
      });
    }
    function rolavel(el) {
      for (let n = el; n && n !== document.body; n = n.parentElement) { const o = getComputedStyle(n).overflowY; if ((o === 'auto' || o === 'scroll') && n.scrollHeight > n.clientHeight) return n; }
      return null;
    }
    function iniciar() {
      if (!s || s.ativo) return;
      s.ativo = true; UI.arrastando = true; clearTimeout(s.timer);
      const it = s.it, r = it.getBoundingClientRect();
      s.dx = s.x - r.left; s.dy = s.y - r.top; s.proximo = it.nextSibling; s.ordemIni = irmaos(s.c, s.g).map((x) => x.dataset.oid).join();
      const f = it.cloneNode(true);
      f.removeAttribute('data-ordena'); f.removeAttribute('data-act'); f.removeAttribute('id'); f.classList.add('fantasma');
      f.style.cssText = `width:${r.width}px;height:${r.height}px;transform:translate(0,0)`;
      s.c.appendChild(f);
      const base = f.getBoundingClientRect(); s.ox = base.left; s.oy = base.top; s.f = f;
      s.c.querySelectorAll('.ma-faixas, .ma-vazio').forEach((x) => { x.style.display = 'none'; });
      it.classList.add('vaga'); document.body.classList.add('arrastando-ord');
      s.rolar = rolavel(s.c); s.tilt = 0; s.pxAnt = s.x; s.ultTroca = 0;
      const volta = () => { if (!s || !s.ativo) return; quadro(); s.raf = requestAnimationFrame(volta); };
      s.raf = requestAnimationFrame(volta);
    }
    function quadro() {
      const px = s.x - s.dx, py = s.y - s.dy;
      s.tilt += (Math.max(-6, Math.min(6, (px - s.pxAnt) * .6)) - s.tilt) * .2; s.pxAnt = px;
      s.f.style.transform = `translate(${px - s.ox}px, ${py - s.oy}px) rotate(${s.tilt.toFixed(2)}deg)`;
      // quem está sob o ponteiro abre espaço: o item pega o lugar dele
      const cs = irmaos(s.c, s.g), agora = performance.now();
      // só troca depois que a troca anterior assentou e se o ponteiro não está sobre a própria vaga (evita o vaivém)
      const sobreVaga = dentro(s.it.getBoundingClientRect(), s.x, s.y);
      const alvo = !sobreVaga && agora - s.ultTroca > 230 ? cs.find((x) => x !== s.it && dentro(x.getBoundingClientRect(), s.x, s.y)) : null;
      if (alvo) {
        s.ultTroca = agora;
        animarTroca(cs, () => s.c.insertBefore(s.it, cs.indexOf(s.it) < cs.indexOf(alvo) ? alvo.nextSibling : alvo));
      }
      // perto da borda: rola a tela (ou a lista) junto
      const area = s.rolar ? s.rolar.getBoundingClientRect() : { top: 0, bottom: innerHeight };
      const passo = s.y < area.top + 56 ? -14 : s.y > area.bottom - 56 ? 14 : 0;
      if (passo) (s.rolar || window).scrollBy(0, passo);
    }
    function encerrar(cancelar) {
      if (!s) return;
      const sessao = s; s = null; clearTimeout(sessao.timer); cancelAnimationFrame(sessao.raf);
      if (!sessao.ativo) return;
      UI.arrastando = false;
      document.body.classList.remove('arrastando-ord');
      sessao.c.querySelectorAll('.ma-faixas, .ma-vazio').forEach((x) => { x.style.display = ''; });
      if (cancelar) sessao.c.insertBefore(sessao.it, sessao.proximo);
      const alvo = sessao.it.getBoundingClientRect(), f = sessao.f;
      f.style.transition = 'transform .18s ease-out, box-shadow .18s ease-out';
      f.style.transform = `translate(${alvo.left - sessao.ox}px, ${alvo.top - sessao.oy}px) rotate(0deg)`; f.style.boxShadow = 'none';
      setTimeout(() => { f.remove(); sessao.it.classList.remove('vaga'); }, 190);
      sessao.it.style.transition = ''; irmaos(sessao.c, sessao.g).forEach((x) => { x.style.transition = ''; x.style.transform = ''; });
      suprimirClique = true; setTimeout(() => { suprimirClique = false; }, 60);
      const ids = irmaos(sessao.c, sessao.g).map((x) => x.dataset.oid);
      if (!cancelar && ids.join() !== sessao.ordemIni) { SALVAR_ORDEM[sessao.g](ids); salvar(); UI.pularColheita = true; render(); }
      else if (UI.renderPendente) { UI.pularColheita = true; render(); }
      UI.renderPendente = false;
    }
    let suprimirClique = false;
    document.addEventListener('click', (e) => { if (suprimirClique) { e.stopPropagation(); e.preventDefault(); } }, true);
    document.addEventListener('dragstart', (e) => { if (e.target.closest && e.target.closest('[data-ordena]')) e.preventDefault(); });
    document.addEventListener('contextmenu', (e) => { if (s && s.toque) e.preventDefault(); });
    document.addEventListener('touchmove', (e) => { if (s && s.ativo) e.preventDefault(); }, { passive: false });
    document.addEventListener('pointerdown', (e) => {
      if (s || (e.pointerType === 'mouse' && e.button !== 0) || !SALVAR_ORDEM || UI.modal) return;
      const it = e.target.closest && e.target.closest('[data-ordena]');
      if (!it || !SALVAR_ORDEM[it.dataset.ordena]) return;
      const interno = e.target.closest(IGNORA);
      if (interno && it.contains(interno) && interno !== it) return;
      s = { it, g: it.dataset.ordena, c: it.parentElement, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, id: e.pointerId, toque: e.pointerType !== 'mouse', ativo: false };
      if (s.toque) s.timer = setTimeout(iniciar, 280);
    });
    document.addEventListener('pointermove', (e) => {
      if (!s || e.pointerId !== s.id) return;
      s.x = e.clientX; s.y = e.clientY;
      if (s.ativo) return;
      const d = Math.hypot(s.x - s.x0, s.y - s.y0);
      if (s.toque) { if (d > 9) { clearTimeout(s.timer); s = null; } } else if (d > 5) iniciar();
    });
    document.addEventListener('pointerup', (e) => { if (s && e.pointerId === s.id) encerrar(false); });
    document.addEventListener('pointercancel', (e) => { if (s && e.pointerId === s.id) encerrar(true); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && s && s.ativo) { e.stopPropagation(); encerrar(true); } }, true);
  })();
  /* Cartões de tarefa: arrastar entre as colunas do quadro (Meu Espaço e página Tarefas).
     Mesma mecânica de "na mão" do reordenar: o cartão segue o ponteiro, levemente inclinado, e a coluna sob ele acende.
     No toque, segure um instante para pegar. Esc cancela. */
  (function arrastarTarefas() {
    let s = null, suprimir = false;
    const IGNORA = 'input, select, textarea, [data-nodrag]';
    /* O alvo é, nesta ordem: a aba do celular sob o ponteiro, ou a coluna visível cuja faixa horizontal contém o ponteiro
       (soltar em qualquer altura da coluna já conta, mesmo vazia). Devolve { etapa, col, aba }. */
    const colunaSob = (x, y) => {
      const aba = (document.elementFromPoint(x, y) || document.body).closest('[data-aba-alvo]');
      if (aba) return { etapa: aba.dataset.abaAlvo, aba };
      const col = [...document.querySelectorAll('.quadro-col[data-etapa-alvo]')].find((c) => { const r = c.getBoundingClientRect(); return r.width > 0 && x >= r.left - 6 && x <= r.right + 6; });
      return col ? { etapa: col.dataset.etapaAlvo, col } : null;
    };
    const reduz = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
    /** Faz `mudanca()` e, em seguida, desliza os cartões das colunas da posição antiga para a nova (técnica FLIP). */
    function deslizar(mudanca) {
      const els = [...document.querySelectorAll('.quadro-col > .tar-cartao, .quadro-col > .tar-silhueta')].filter((e) => e !== s.it);
      const antes = new Map(els.map((e) => [e, e.getBoundingClientRect().top]));
      mudanca();
      if (reduz()) return;
      els.forEach((e) => {
        const d = antes.get(e) - e.getBoundingClientRect().top;
        if (!d) return;
        e.style.transition = 'none'; e.style.transform = `translateY(${d}px)`;
        requestAnimationFrame(() => { e.style.transition = 'transform .2s ease-out'; e.style.transform = ''; setTimeout(() => { e.style.transition = ''; }, 230); });
      });
    }
    function iniciar() {
      if (!s || s.ativo) return;
      s.ativo = true; UI.arrastando = true; clearTimeout(s.timer);
      const r = s.it.getBoundingClientRect();
      s.dx = s.x - r.left; s.dy = s.y - r.top; s.tilt = 0; s.pxAnt = s.x; s.altura = r.height;
      if (innerWidth <= 640) { s.dx = r.width / 2; s.dy = r.height + 18; }   // no celular o cartão fica acima do dedo, para o destino (as abas) continuar à vista
      s.origem = (s.it.closest('[data-etapa-alvo]') || { dataset: {} }).dataset.etapaAlvo;
      const f = s.it.cloneNode(true);
      f.removeAttribute('data-tarefa'); f.classList.add('fantasma');
      f.style.cssText = `width:${r.width}px;height:${r.height}px;transform:translate(${r.left}px,${r.top}px)`;
      document.body.appendChild(f); s.f = f;
      // a silhueta ocupa o lugar do cartão (que some da lista): é ela que anda entre os outros cartões
      const sil = document.createElement('div'); sil.className = 'tar-silhueta'; sil.style.height = s.altura + 'px';
      s.it.before(sil); s.it.style.display = 'none'; s.sil = sil;
      document.body.classList.add('arrastando-ord');
      const volta = () => { if (!s || !s.ativo) return; quadro(); s.raf = requestAnimationFrame(volta); };
      s.raf = requestAnimationFrame(volta);
    }
    function quadro() {
      const px = s.x - s.dx, py = s.y - s.dy;
      s.tilt += (Math.max(-6, Math.min(6, (px - s.pxAnt) * .6)) - s.tilt) * .2; s.pxAnt = px;
      s.f.style.transform = `translate(${px}px, ${py}px) rotate(${s.tilt.toFixed(2)}deg)`;
      const alvo = colunaSob(s.x, s.y);
      document.querySelectorAll('.quadro-aba.alvo-aba').forEach((x) => { if (!alvo || x !== alvo.aba) x.classList.remove('alvo-aba'); });
      if (alvo && alvo.aba && alvo.etapa !== s.origem) alvo.aba.classList.add('alvo-aba');
      const c = alvo && alvo.col;
      if (!c) return;   // fora das colunas (ou numa aba): a silhueta fica onde está
      // posição: antes do primeiro cartão cujo meio está abaixo do ponteiro (em "Feito" a lista é por data, então entra no topo).
      // Usa a posição de layout (offsetTop), não a visual, para os cartões em deslize não causarem vai e vem.
      const cartoes = [...c.children].filter((e) => e.classList.contains('tar-cartao') && e !== s.it);
      const yCol = s.y - c.getBoundingClientRect().top + c.offsetTop;
      const ref = c.dataset.etapaAlvo === 'feito' ? (cartoes[0] || null) : (cartoes.find((e) => yCol < e.offsetTop + e.offsetHeight / 2) || null);
      const prox = ref || null, ja = s.sil.parentElement === c && (prox ? s.sil.nextElementSibling === prox : !cartoes.some((e) => e.compareDocumentPosition(s.sil) & Node.DOCUMENT_POSITION_PRECEDING));
      if (!ja) deslizar(() => c.insertBefore(s.sil, prox));
    }
    function encerrar(cancelar) {
      if (!s) return;
      const e = s; s = null; clearTimeout(e.timer); cancelAnimationFrame(e.raf);
      if (!e.ativo) return;
      UI.arrastando = false; document.body.classList.remove('arrastando-ord');
      const alvo = cancelar ? null : colunaSob(e.x, e.y);
      document.querySelectorAll('.alvo-aba').forEach((x) => x.classList.remove('alvo-aba'));
      suprimir = true; setTimeout(() => { suprimir = false; }, 60);
      const id = e.it.dataset.tarefa;
      if (alvo) {
        // ordem final = a dos cartões da coluna, com a silhueta no lugar do cartão solto (numa aba, ele entra no topo)
        const col = alvo.col || document.querySelector(`.quadro-col[data-etapa-alvo="${alvo.etapa}"]`);
        const ids = alvo.col && e.sil.parentElement === col
          ? [...col.children].map((el) => (el === e.sil ? id : (el.classList.contains('tar-cartao') && el !== e.it ? el.dataset.tarefa : null))).filter(Boolean)
          : [id, ...[...col.children].filter((el) => el.classList.contains('tar-cartao') && el !== e.it).map((el) => el.dataset.tarefa)];
        e.f.remove(); e.sil.remove(); e.it.style.display = '';
        UI.pularColheita = true; UI.renderPendente = false; moverTarefa(id, alvo.etapa, ids); return;
      }
      // cancelado ou solto fora: o cartão volta ao lugar de origem
      e.sil.remove(); e.it.style.display = '';
      const r = e.it.getBoundingClientRect();
      e.f.style.transition = 'transform .18s ease-out'; e.f.style.transform = `translate(${r.left}px, ${r.top}px) rotate(0deg)`;
      setTimeout(() => { e.f.remove(); }, 190);
      if (UI.renderPendente) { UI.pularColheita = true; render(); }
      UI.renderPendente = false;
    }
    document.addEventListener('click', (e) => { if (suprimir) { e.stopPropagation(); e.preventDefault(); } }, true);
    // sem isto o navegador começa a arrastar o link do título (arrasto nativo) e cancela o nosso
    document.addEventListener('dragstart', (e) => { if (e.target.closest && e.target.closest('[data-tarefa]')) e.preventDefault(); });
    document.addEventListener('contextmenu', (e) => { if (s && s.toque) e.preventDefault(); });
    document.addEventListener('touchmove', (e) => { if (s && s.ativo) e.preventDefault(); }, { passive: false });
    document.addEventListener('pointerdown', (e) => {
      if (s || (e.pointerType === 'mouse' && e.button !== 0) || UI.modal) return;
      const it = e.target.closest && e.target.closest('[data-tarefa]');
      if (!it || e.target.closest(IGNORA)) return;
      s = { it, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, id: e.pointerId, toque: e.pointerType !== 'mouse', ativo: false };
      if (s.toque) s.timer = setTimeout(iniciar, 280);
    });
    document.addEventListener('pointermove', (e) => {
      if (!s || e.pointerId !== s.id) return;
      s.x = e.clientX; s.y = e.clientY;
      if (s.ativo) return;
      const d = Math.hypot(s.x - s.x0, s.y - s.y0);
      if (s.toque) { if (d > 9) { clearTimeout(s.timer); s = null; } } else if (d > 5) iniciar();
    });
    document.addEventListener('pointerup', (e) => { if (s && e.pointerId === s.id) encerrar(false); });
    document.addEventListener('pointercancel', (e) => { if (s && e.pointerId === s.id) encerrar(true); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && s && s.ativo) { e.stopPropagation(); encerrar(true); } }, true);
  })();
  return {  };
};
