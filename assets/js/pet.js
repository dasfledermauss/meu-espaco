/* Tyba — pet (cenário do Início).
   Módulo separado do app.js: recebe do app o que precisa (estado, utilidades) por `ctx` e devolve só o que o resto do app usa.
   `S` aqui é um espelho do estado do app (que troca de objeto ao importar backup ou sincronizar), então sempre aponta para o atual. */
window.TybaPet = function (ctx) {
  'use strict';
  const { UI, salvar, render } = ctx;
  const S = new Proxy({}, { get: (_, k) => ctx.S()[k], set: (_, k, v) => { ctx.S()[k] = v; return true; }, has: (_, k) => k in ctx.S(), ownKeys: () => Reflect.ownKeys(ctx.S()), getOwnPropertyDescriptor: (_, k) => Object.getOwnPropertyDescriptor(ctx.S(), k) });
  const { modal, direita } = ctx;
  const agora = (...a) => ctx.agora(...a), atrasada = (...a) => ctx.atrasada(...a), btnIco = (...a) => ctx.btnIco(...a), climaDados = (...a) => ctx.climaDados(...a),
    compromissosDoDia = (...a) => ctx.compromissosDoDia(...a), dataLocal = (...a) => ctx.dataLocal(...a), diasAte = (...a) => ctx.diasAte(...a), esc = (...a) => ctx.esc(...a),
    evento = (...a) => ctx.evento(...a), hoje = (...a) => ctx.hoje(...a), quando = (...a) => ctx.quando(...a), somaDias = (...a) => ctx.somaDias(...a),
    tarefas = (...a) => ctx.tarefas(...a), tarefasAbertas = (...a) => ctx.tarefasAbertas(...a), tituloItem = (...a) => ctx.tituloItem(...a), txt = (...a) => ctx.txt(...a),
    vazio = (...a) => ctx.vazio(...a), venc = (...a) => ctx.venc(...a);
  /* ---------------- pet ----------------
     Um cachorrinho em pixel art no alto do Início. O cenário muda em cinco fases do dia, conforme a hora do aparelho.
     Cuidados: clicar no chão (ou em "Comida") derruba comidinha; "Banho" leva ele ao meio para ensaboar e sacudir;
     depois de comer ele faz cocô, que fica ali até você clicar para limpar; clicar na casinha escolhe o nome da placa;
     clicar nele faz latir. A folha de sprites tem 4 poses × 4 quadros (0 parado, 1 sentado, 2 andando, 3 abaixado),
     todas olhando para a direita. O estado vive aqui fora porque a tela é redesenhada a toda hora; o laço só mexe
     no que está na página. */
  /** Os bichinhos: cada folha tem 4 poses × 4 quadros, todas olhando para a direita, e o tamanho da célula próprio. */
  const PET_TIPOS = {
    salsicha: { nome: 'Salsicha', arq: 'assets/img/pet/salsicha.png', CW: 63, CH: 40, fala: 'AU! AU!', som: 'latido' },
    pinscher: { nome: 'Pinscher', arq: 'assets/img/pet/pinscher.png', CW: 45, CH: 43, fala: 'AI AI AI!', som: 'ganido' },
    frajola: { nome: 'Frajola', arq: 'assets/img/pet/frajola.png', CW: 51, CH: 38, fala: 'MIAU!', som: 'miado' },
    shollie: { nome: 'Shollie', arq: 'assets/img/pet/shollie.png', CW: 62, CH: 42, fala: 'AU AU!', som: 'latido' },
    schnauzer: { nome: 'Schnauzer', arq: 'assets/img/pet/schnauzer.png', CW: 54, CH: 40, fala: 'AU! AU!', som: 'latido' },
    jackrussell: { nome: 'Jack Russell', arq: 'assets/img/pet/jackrussell.png', CW: 54, CH: 40, fala: 'AU AU AU!', som: 'latido' }
  };
  /** Cores da casinha (parede, luz da parede, telhado, luz do telhado, rodapé): clicar na casinha troca. */
  const PET_CASAS = [
    ['#c9884f', '#dba06a', '#a2442f', '#b24f37', '#b87a44'], ['#7aa7d6', '#95bbe3', '#35547a', '#43668f', '#6892c2'],
    ['#8fbf7a', '#a8d192', '#3f6f4a', '#4d8259', '#79a966'], ['#e8c15a', '#f2d27c', '#b5532f', '#c4623c', '#d4ab45'],
    ['#e5a1b0', '#f0b8c4', '#8d4a63', '#a05a75', '#d48a9b'], ['#ece6d8', '#f7f2e6', '#4a5568', '#5b667a', '#d5cdb9']];
  /** Até dois pets, cada um com a sua casinha, nome e cor. O primeiro usa petTipo/petNome/petCasa; o segundo, perfil.pet2. */
  const petSlots = () => {
    const p = S.perfil, l = [{ k: 0, tipo: PET_TIPOS[p.petTipo] ? p.petTipo : 'salsicha', nome: (p.petNome || '').trim(), cor: (p.petCasa || 0) % PET_CASAS.length }];
    if (p.pet2 && PET_TIPOS[p.pet2.tipo]) l.push({ k: 1, tipo: p.pet2.tipo, nome: (p.pet2.nome || '').trim(), cor: (p.pet2.casa == null ? 1 : p.pet2.casa) % PET_CASAS.length });
    return l;
  };
  const petCasaVars = (c) => `--cp:${PET_CASAS[c][0]};--cpl:${PET_CASAS[c][1]};--ct:${PET_CASAS[c][2]};--ctl:${PET_CASAS[c][3]};--cpe:${PET_CASAS[c][4]}`;
  /* O estado do bichinho vive em PET (o "atual"): o laço troca PET para cada um dos dois. Algumas coisas valem para a cena toda
     (bolinha, conversa, vasilhas) e ficam em PET_COMUM, que todos enxergam. */
  const PET_COMUM = { ESC: 2, comentados: new Set(), recentes: [], ultimaCat: '', oiEm: 0, saudadeFeita: false, proxFala: 0, foraMs: 0, avisoEm: 0, interagiu: false, ant: 0, nivelT: 0, id: 0, bola: null, forcar: null };
  const novoCao = (k) => {
    const c = { k, tipo: 'salsicha', x: null, dir: 1, estado: 'parado', tEstado: 0, rel: 0, visita: null, visitaEm: 0, cocos: [], falaAte: 0, fala: '', pulo: 0, espera: 6, alvo: null, cocoEm: 0, fila: '', bolhaT: 0 };
    Object.keys(PET_COMUM).forEach((n) => Object.defineProperty(c, n, { get: () => PET_COMUM[n], set: (v) => { PET_COMUM[n] = v; }, enumerable: true }));
    return c;
  };
  const PETS = [novoCao(0), novoCao(1)];
  let PET = PETS[0];
  const petDef = () => PET_TIPOS[PET.tipo] || PET_TIPOS.salsicha;
  const PET_LINHA = { parado: 0, sentado: 1, andando: 2, comendo: 3, latindo: 1, banho: 1, sacode: 0, coco: 3, brincando: 2 };
  const PET_FPS = { parado: 4, sentado: 3, andando: 9, comendo: 6, latindo: 9, banho: 3, sacode: 0, coco: 0, brincando: 13 };
  const petReduz = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  /** Cinco fases do dia: cores do céu, do chão, dos morros e do astro. */
  const PET_FASES = {
    amanhecer: { nome: 'Amanhecer', ceu: ['#8fa3d6', '#f3b5a5 62%', '#fde2b4'], chao: ['#7fb56c', '#93c77d', '#6fa35c'], longe: '#a9b9a0', perto: '#8fb583', nuvem: '#ffd5c4', astro: '#ffb36b', estrelas: .3 },
    manha: { nome: 'Manhã', ceu: ['#86cdf0', '#e2f4fb'], chao: ['#86bd6a', '#9ccf80', '#75ab5a'], longe: '#b9d8b0', perto: '#9fcb8f', nuvem: '#ffffff', astro: '#f7d36a', estrelas: 0 },
    tarde: { nome: 'Tarde', ceu: ['#5db4ea', '#c9e8f7'], chao: ['#78b25e', '#8ec974', '#689f50'], longe: '#a6cf9a', perto: '#8cc17f', nuvem: '#ffffff', astro: '#ffe27a', estrelas: 0 },
    entardecer: { nome: 'Entardecer', ceu: ['#37478a', '#d96f5c 58%', '#f7b16c'], chao: ['#6d9553', '#80a862', '#5d8348'], longe: '#8a8f6e', perto: '#6f8a5a', nuvem: '#f4a688', astro: '#ff8a4c', estrelas: .15 },
    noite: { nome: 'Noite', ceu: ['#101731', '#2a3760'], chao: ['#2f5a44', '#3b6c52', '#264b39'], longe: '#223b3a', perto: '#1c3231', nuvem: '#3a4772', astro: '#e9ecf5', estrelas: .9 }
  };
  const petFase = () => {
    if (PET.forcar) return PET.forcar;
    const h = new Date().getHours();
    return h >= 5 && h < 8 ? 'amanhecer' : h < 12 && h >= 8 ? 'manha' : h >= 12 && h < 17 ? 'tarde' : h >= 17 && h < 19 ? 'entardecer' : 'noite';
  };
  /** Morros em degraus (pixel art): uma coluna de retângulos por posição. */
  const petMorros = (alturas, cor) => "url('data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${alturas.length} 14" shape-rendering="crispEdges">${alturas.map((h, k) => `<rect x="${k}" y="${14 - h}" width="1" height="${h}" fill="${cor}"/>`).join('')}</svg>`) + "')";
  const PET_ONDA = (n, base, amp, fase) => Array.from({ length: n }, (_, k) => Math.round(base + amp * Math.sin((k + fase) / n * Math.PI * 4)));
  const PET_MORROS = {};
  const petEstiloFase = (f) => {
    const c = PET_FASES[f];
    if (!PET_MORROS[f]) PET_MORROS[f] = [petMorros(PET_ONDA(120, 7, 3, 0), c.longe), petMorros(PET_ONDA(120, 5, 2, 30), c.perto)];
    return `--ceu:linear-gradient(${c.ceu.join(',')});--chao:${c.chao[0]};--chao-alto:${c.chao[1]};--chao-baixo:${c.chao[2]};--nuvem:${c.nuvem};--astro:${c.astro};--estrelas:${c.estrelas};--morros-longe:${PET_MORROS[f][0]};--morros-perto:${PET_MORROS[f][1]}`;
  };
  const PET_ARVORE = `<svg class="pc-arvore" viewBox="0 0 24 34" shape-rendering="crispEdges" aria-hidden="true"><rect x="10" y="22" width="4" height="12" fill="#7b5738"/><rect x="11" y="22" width="1" height="12" fill="#946b45"/>
    <rect x="6" y="14" width="12" height="10" fill="#3f8a4d"/><rect x="3" y="16" width="18" height="6" fill="#3f8a4d"/><rect x="8" y="6" width="8" height="10" fill="#4a9a58"/><rect x="5" y="9" width="14" height="5" fill="#4a9a58"/><rect x="9" y="2" width="6" height="6" fill="#58a866"/>
    <rect x="8" y="10" width="2" height="2" fill="#6dbb78"/><rect x="14" y="17" width="2" height="2" fill="#6dbb78"/><rect x="5" y="19" width="2" height="2" fill="#337a41"/></svg>`;
  const petCasinha = (sl) => `<button type="button" class="pc-casinha k${sl.k}" data-act="pet-casa" data-k="${sl.k}" style="${petCasaVars(sl.cor)}" title="Mudar a cor da casinha" aria-label="Mudar a cor da casinha"><svg viewBox="0 0 30 26" shape-rendering="crispEdges" aria-hidden="true"><rect class="cp" x="3" y="12" width="24" height="14"/><rect class="cpl" x="3" y="12" width="24" height="2"/>
    <rect class="ct" x="12" y="1" width="6" height="2"/><rect class="ct" x="9" y="3" width="12" height="2"/><rect class="ct" x="6" y="5" width="18" height="2"/><rect class="ctl" x="3" y="7" width="24" height="2"/><rect class="ctl" x="1" y="9" width="28" height="3"/>
    <rect x="11" y="15" width="8" height="11" fill="#3a2a22"/><rect x="12" y="14" width="6" height="1" fill="#3a2a22"/><rect class="cpe" x="5" y="22" width="2" height="4"/></svg></button>`;
  const PET_FLORES = `<svg class="pc-flores" viewBox="0 0 60 8" shape-rendering="crispEdges" aria-hidden="true"><rect x="5" y="3" width="2" height="2" fill="#f4c94a"/><rect x="6" y="5" width="1" height="3" fill="#4a9a58"/><rect x="22" y="2" width="2" height="2" fill="#f08a9a"/><rect x="23" y="4" width="1" height="4" fill="#4a9a58"/>
    <rect x="41" y="3" width="2" height="2" fill="#fff"/><rect x="42" y="5" width="1" height="3" fill="#4a9a58"/><rect x="54" y="2" width="2" height="2" fill="#f4c94a"/><rect x="55" y="4" width="1" height="4" fill="#4a9a58"/></svg>`;
  const PET_COCO = `<svg viewBox="0 0 12 11" shape-rendering="crispEdges" aria-hidden="true"><rect x="4" y="0" width="3" height="1" fill="#6b4226"/><rect x="3" y="1" width="5" height="2" fill="#7b4b2a"/><rect x="2" y="3" width="8" height="2" fill="#7b4b2a"/><rect x="1" y="5" width="10" height="3" fill="#8a5632"/><rect x="0" y="8" width="12" height="3" fill="#7b4b2a"/><rect x="3" y="4" width="2" height="1" fill="#a0693c"/><rect x="2" y="9" width="3" height="1" fill="#a0693c"/></svg>`;
  const PET_BOLA = `<svg viewBox="0 0 8 8" shape-rendering="crispEdges" aria-hidden="true"><rect x="2" y="0" width="4" height="8" fill="#d8452f"/><rect x="0" y="2" width="8" height="4" fill="#d8452f"/><rect x="1" y="1" width="6" height="6" fill="#d8452f"/><rect x="2" y="1" width="2" height="1" fill="#f27a63"/><rect x="0" y="3" width="8" height="2" fill="#fff"/><rect x="1" y="5" width="6" height="2" fill="#b8321f"/></svg>`;
  const petIco = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const petHTML = () => {
    if (S.perfil.petOculto) return '';
    const som = !S.perfil.petMudo, slots = petSlots(), f = petFase();
    return `<section class="pet-cena" id="pet-cena" data-fase="${f}" style="${petEstiloFase(f)}" aria-label="Seus cachorrinhos. Clique num deles para ouvir um latido; clique no chão para jogar a bolinha.">
      <div class="pc-astro"></div><div class="pc-estrelas"></div><div class="pc-nuvem n1"></div><div class="pc-nuvem n2"></div>
      <div class="pc-morros longe"></div><div class="pc-morros perto"></div>
      ${PET_ARVORE}${slots.map((sl) => petCasinha(sl) + `<button type="button" class="pc-placa k${sl.k} ${sl.nome ? '' : 'sem-nome'}" data-act="pet-nome" data-k="${sl.k}" title="Escolher o nome">${sl.nome ? esc(sl.nome) : 'Dar um nome'}</button>`).join('')}
      <div class="pc-chao"></div>${PET_FLORES}${petPotesHTML()}
      ${slots.map((sl) => `<div class="pet-cao" data-k="${sl.k}" role="img" aria-label="${sl.nome ? esc(sl.nome) : PET_TIPOS[sl.tipo].nome}"></div><div class="pet-balao" data-k="${sl.k}" hidden></div>`).join('')}
      <div class="pet-barra">
        <button type="button" class="pet-botao" data-act="pet-banho" title="Dar banho">${petIco('<path d="M12 3.5s6 6.1 6 10.2a6 6 0 0 1-12 0C6 9.6 12 3.5 12 3.5Z"/><path d="M9.5 14a2.6 2.6 0 0 0 2.2 2.4"/>')}<span>Banho</span></button>
        <button type="button" class="pet-botao" data-act="pet-config" aria-haspopup="dialog" title="Escolher o pet e ajustes">
          ${petIco('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>')}<span>Pets</span></button></div>
      <div class="pet-config" ${UI.petConfig ? '' : 'hidden'} role="dialog" aria-label="Escolha os seus pets"><div class="pet-config-card">
        <div class="pet-config-cab"><p class="pet-config-tit">Escolha os seus pets</p>${btnIco('pet-config', 'xmark', 'Fechar')}</div>
        ${[0, 1].map((k) => { const atual = k ? ((S.perfil.pet2 || {}).tipo || '') : slots[0].tipo; return `<div class="pet-slot"><p class="pet-slot-tit">Pet ${k + 1}</p>
          <div class="pet-opcoes">${k ? `<button type="button" class="pet-opcao nenhum" data-act="pet-escolher" data-slot="1" data-tipo="" aria-pressed="${!atual}"><span class="pet-mini vazio" style="height:40px">${petIco('<path d="M6 6l12 12M18 6L6 18"/>')}</span><span>Nenhum</span></button>` : ''}${Object.entries(PET_TIPOS).map(([t, d]) => `<button type="button" class="pet-opcao" data-act="pet-escolher" data-slot="${k}" data-tipo="${t}" aria-pressed="${atual === t}">
            <span class="pet-mini" style="width:${d.CW}px;height:${d.CH}px;background-image:url('${d.arq}');background-size:${d.CW * 4}px ${d.CH * 4}px"></span><span>${d.nome}</span></button>`).join('')}</div></div>`; }).join('')}
        <div class="pet-extras">
          <button type="button" class="pet-linha" data-act="pet-som" aria-pressed="${som}">Som: <b>${som ? 'ligado' : 'desligado'}</b></button>
          <button type="button" class="pet-linha" data-act="pet-bolinha" aria-pressed="${!S.perfil.petSemBola}">Bolinha: <b>${S.perfil.petSemBola ? 'desligada' : 'ligada'}</b></button>
          <button type="button" class="pet-linha" data-act="pet-papo" aria-pressed="${!S.perfil.petCala}">Conversa: <b>${S.perfil.petCala ? 'desligada' : 'ligada'}</b></button>
          <button type="button" class="pet-linha" data-act="pet-alternar" title="Para voltar, use Configurações">Esconder</button></div></div></div>
      <p class="pet-dica ${PET.interagiu || S.perfil.petDicaVista ? 'some' : ''}">Clique no chão para jogar a bolinha, na casinha para mudar a cor e na plaquinha para dar um nome</p></section>`;
  };
  let petAudio = null;
  function petLatido() {
    if (S.perfil.petMudo) return;
    try {
      petAudio = petAudio || new (window.AudioContext || window.webkitAudioContext)();
      if (petAudio.state === 'suspended') petAudio.resume();
      const t0 = petAudio.currentTime, som = petDef().som;
      // cada bicho tem a sua voz: [início do som, freq inicial, freq final, duração, onda]
      const vozes = {
        latido: [[0, 560, 220, .13, 'sawtooth'], [.17, 560, 220, .13, 'sawtooth']],
        ganido: [[0, 900, 380, .09, 'sawtooth'], [.12, 900, 380, .09, 'sawtooth'], [.24, 980, 400, .09, 'sawtooth']],
        miado: [[0, 520, 820, .14, 'triangle'], [.14, 820, 480, .36, 'triangle']]
      }[som];
      vozes.forEach(([d, f0, f1, dur, onda]) => {
        const o = petAudio.createOscillator(), g = petAudio.createGain(), f = petAudio.createBiquadFilter();
        o.type = onda; o.frequency.setValueAtTime(f0, t0 + d); o.frequency.exponentialRampToValueAtTime(f1, t0 + d + dur);
        f.type = 'lowpass'; f.frequency.value = som === 'miado' ? 2400 : 1600;
        g.gain.setValueAtTime(0.0001, t0 + d); g.gain.exponentialRampToValueAtTime(.16, t0 + d + .02); g.gain.exponentialRampToValueAtTime(.0001, t0 + d + dur + .02);
        o.connect(f); f.connect(g); g.connect(petAudio.destination); o.start(t0 + d); o.stop(t0 + d + dur + .03);
      });
    } catch (e) { /* sem áudio: só o balão */ }
  }
  /** Balão: no máximo três palavras por linha. */
  const quebra3 = (t) => { const w = String(t).trim().split(/\s+/), l = []; for (let k = 0; k < w.length; k += 3) l.push(w.slice(k, k + 3).join(' ')); return l.join('\n'); };
  function petFalar(txt, seg) { PET.fala = quebra3(txt); PET.falaAte = performance.now() + seg * 1000; }
  /* ---------------- conversa do pet ----------------
     De tempos em tempos, e só com a janela visível, o pet comenta algo do seu espaço: o que você guardou,
     lembretes e tarefas, o tempo, o fim de semana, ou diz que sentiu falta. As frases ficam em
     assets/js/pet-frases.js. */
  const PAPO_VISTO = 'meuEspaco.petVisto';
  const sorteia = (l) => l[Math.floor(Math.random() * l.length)];
  const lerVisto = () => { try { return +localStorage.getItem(PAPO_VISTO) || 0; } catch (e) { return 0; } };
  const marcarVisto = () => { try { localStorage.setItem(PAPO_VISTO, String(Date.now())); } catch (e) { /* sem espaço: segue */ } };
  const corta28 = (t) => { t = String(t || '').replace(/\s+/g, ' ').trim(); return t.length > 28 ? t.slice(0, 27) + '…' : t; };
  function petFrase(f, v = {}) {
    const nome = (S.perfil.nome || '').trim().split(/\s+/)[0], temNome = nome && nome !== 'Meu';
    return f.replace(/,? ?\{nome\}/g, temNome ? (/^\{nome\}/.test(f) ? '' : ', ' + nome) : '').replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? v[k] : '')).replace(/\s+([!.?,])/g, '$1');
  }
  /** Reúne o que há para comentar agora; cada assunto tem um peso. */
  function petAssuntos() {
    const F = window.PET_FRASES; if (!F) return [];
    const a = [], h = new Date(), dia = h.getDay(), d0 = hoje();
    const novo = (txt, cat, peso, id) => a.push({ txt, cat, peso, id });
    const rec = S.itens.filter((i) => i.criadoEm && Date.now() - new Date(i.criadoEm).getTime() < 36 * 3600e3 && !PET.comentados.has(i.id)).sort(() => Math.random() - .5)[0];
    if (rec) {
      const k = rec.tipo === 'midia' ? (rec.formato === 'filme' ? 'filme' : 'livro') : (F.post[rec.tipo] ? rec.tipo : 'generico');
      novo(petFrase(sorteia(F.post[k]), { t: corta28(tituloItem(rec)) }), 'post', 5, rec.id);
    }
    const feita = tarefas().filter((i) => i.concluida && Date.now() - new Date(i.editadoEm || i.criadoEm).getTime() < 6 * 3600e3 && !PET.comentados.has('f' + i.id))[0];
    if (feita) novo(petFrase(sorteia(F.post.feita), { t: corta28(tituloItem(feita)) }), 'post', 5, 'f' + feita.id);
    const lembs = S.lembretes.filter((l) => !l.concluido && l.data && l.data <= d0).sort((x, y) => venc(x) - venc(y));
    if (lembs.length) { const l = lembs[0], atras = l.data < d0 || venc(l) < Date.now(); novo(petFrase(sorteia(F.alerta[atras ? 'lembreteAtrasado' : 'lembreteHoje']), { t: corta28(l.texto) }), 'alerta', 5); }
    const atr = tarefasAbertas().filter((i) => atrasada(i))[0], hojeT = tarefasAbertas().filter((i) => i.prazo === d0)[0];
    if (atr) novo(petFrase(sorteia(F.alerta.tarefaAtrasada), { t: corta28(tituloItem(atr)) }), 'alerta', 4);
    else if (hojeT) novo(petFrase(sorteia(F.alerta.tarefaHoje), { t: corta28(tituloItem(hojeT)) }), 'alerta', 4);
    const ab = tarefasAbertas().length; if (ab >= 4) novo(petFrase(sorteia(F.alerta.tarefasAbertas), { n: ab }), 'alerta', 2);
    const fh = tarefas().filter((i) => i.concluida && dataLocal(i.editadoEm || i.criadoEm) === d0).length; if (fh) novo(petFrase(sorteia(F.alerta.feitasHoje), { n: fh }), 'alerta', 3);
    // Agenda: eventos de hoje, de amanhã, contagem regressiva, stickers do dia, agenda livre e eventos novos.
    const evs = (S.eventos || []).filter((e) => e.data >= d0).sort((x, y) => (x.data + (x.hora || '')).localeCompare(y.data + (y.hora || '')));
    const evHoje = evs.find((e) => e.data === d0), evAmanha = evs.find((e) => e.data === somaDias(d0, 1)), evContagem = evs.find((e) => e.contagem && e.data > d0 && diasAte(e.data) <= 60);
    if (evHoje) novo(petFrase(sorteia(F.alerta.eventoHoje), { t: corta28(evHoje.titulo) }), 'agenda', 5);
    else if (evAmanha) novo(petFrase(sorteia(F.alerta.eventoAmanha), { t: corta28(evAmanha.titulo) }), 'agenda', 4);
    if (evContagem) novo(petFrase(sorteia(F.alerta.contagem), { n: diasAte(evContagem.data), t: corta28(evContagem.titulo) }), 'agenda', 3);
    else { const prox = evs.find((e) => diasAte(e.data) >= 2 && diasAte(e.data) <= 7); if (prox) novo(petFrase(sorteia(F.alerta.eventoSemana), { n: diasAte(prox.data), t: corta28(prox.titulo) }), 'agenda', 2); }
    const stkHoje = (S.stickers || {})[d0];
    if (stkHoje && stkHoje.length && F.sticker[stkHoje[0]]) novo(petFrase(sorteia(F.sticker[stkHoje[0]])), 'agenda', 4);
    if (S.eventos && S.eventos.length && !compromissosDoDia(d0).total) novo(petFrase(sorteia(F.alerta.agendaLivre)), 'agenda', 1);
    const evNovo = (S.eventos || []).find((e) => e.criadoEm && Date.now() - new Date(e.criadoEm).getTime() < 36 * 3600e3 && !PET.comentados.has('ev' + e.id));
    if (evNovo) novo(petFrase(sorteia(F.post[evNovo.foto ? 'eventoFoto' : 'evento']), { t: corta28(evNovo.titulo) }), 'post', 5, 'ev' + evNovo.id);
    // Som de fundo e música tocando
    if (window.SONS && SONS.ambiente.tocando()) novo(petFrase(sorteia(F.ambiente.som)), 'ambiente', 2);
    else if (UI.tocando && !UI.pausado) novo(petFrase(sorteia(F.ambiente.musica)), 'ambiente', 1);
    const c = typeof climaDados === 'function' ? climaDados() : null;
    if (c && c.atual && c.dia) {
      const t = Math.round(c.atual.temperature_2m), ch = c.dia.precipitation_probability_max[0] || 0, cod = c.atual.weather_code;
      if (ch >= 50) novo(petFrase(sorteia(F.tempo.chuva), { n: ch }), 'tempo', 4);
      else if (t >= 32) novo(petFrase(sorteia(F.tempo.calor), { n: t }), 'tempo', 4);
      else if (t <= 14) novo(petFrase(sorteia(F.tempo.frio), { n: t }), 'tempo', 4);
      else if (cod <= 2) novo(petFrase(sorteia(F.tempo.sol), { n: t }), 'tempo', 3);
      else novo(petFrase(sorteia(F.tempo.nublado), { n: t }), 'tempo', 2);
    }
    const fim = F.fim[dia === 0 || dia === 6 ? 'fds' : dia === 5 ? 'sex' : dia === 1 ? 'seg' : 'meio'];
    novo(petFrase(sorteia(fim), { n: 6 - dia }), 'fim', dia === 5 || dia === 6 || dia === 0 ? 3 : 2);
    if (agora_() - PET.oiEm > 3 * 3600e3) novo(petFrase(sorteia(F.oi[petFase()])), 'oi', 2);
    novo(petFrase(sorteia(F.elogio)), 'elogio', 2);
    novo(petFrase(sorteia(F.carinho)), 'carinho', 2);
    return a;
  }
  const agora_ = () => Date.now();
  function petConversar(forcar) {
    const cena = document.getElementById('pet-cena'); if (!cena || !window.PET_FRASES) return false;
    let txt = '', cat = '', id = null;
    const fora = PET.foraMs;
    if (!PET.saudadeFeita && fora > 2 * 3600e3) { PET.saudadeFeita = true; cat = 'saudade'; txt = petFrase(sorteia(window.PET_FRASES[fora > 24 * 3600e3 ? 'sumiu' : 'saudade'])); }
    else {
      const l = petAssuntos().filter((x) => x.cat !== PET.ultimaCat || forcar === 'qualquer');
      if (!l.length) return false;
      let r = Math.random() * l.reduce((n, x) => n + x.peso, 0), x = l[0];
      for (const y of l) { r -= y.peso; if (r <= 0) { x = y; break; } }
      txt = x.txt; cat = x.cat; id = x.id;
    }
    if (PET.recentes.includes(txt)) return false;
    PET.recentes.push(txt); if (PET.recentes.length > 8) PET.recentes.shift();
    if (id) PET.comentados.add(id);
    if (cat === 'oi') PET.oiEm = Date.now();
    PET.ultimaCat = cat; PET.saudadeFeita = true;
    const quem = petSlots().map((sl) => PETS[sl.k]).filter((c) => ['parado', 'sentado', 'andando'].includes(c.estado));
    PET = quem.length ? sorteia(quem) : PETS[0];
    petFalar(txt, Math.max(7, 3 + txt.split(/\s+/).length * 1.1));
    return true;
  }
  /** Confere de 4 em 4 segundos se é hora de puxar assunto. */
  setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    marcarVistoSeguido();
    const cena = document.getElementById('pet-cena'), t = performance.now();
    const ativos = petSlots().map((sl) => PETS[sl.k]);
    if (!cena || S.perfil.petCala || UI.modal || PET.bola || !ativos.some((c) => ['parado', 'sentado', 'andando'].includes(c.estado))) return;
    if (ativos.some((c) => t < c.falaAte + 1500)) return;
    if (!PET.proxFala) PET.proxFala = t + 6000 + Math.random() * 5000;
    if (t < PET.proxFala) return;
    if (petConversar()) PET.proxFala = t + 50000 + Math.random() * 40000; else PET.proxFala = t + 15000;
  }, 4000);
  PET.foraMs = lerVisto() ? Date.now() - lerVisto() : 0;
  let ultimoVisto = 0;
  function marcarVistoSeguido() { const t = Date.now(); if (t - ultimoVisto > 30000) { ultimoVisto = t; marcarVisto(); } }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') { marcarVisto(); ultimoVisto = Date.now(); return; }
    const fora = Date.now() - lerVisto(); PET.foraMs = fora;
    if (fora > 30 * 60e3) { PET.saudadeFeita = false; PET.proxFala = performance.now() + 2500; }
  });
  window.addEventListener('pagehide', marcarVisto);
  function petLatir(c) {
    if (c) PET = c;
    PET.interagiu = true; PET.estado = 'latindo'; PET.tEstado = 0; PET.alvo = null; PET.pulo = 1;
    petFalar(petDef().fala, 1); petLatido();
  }
  /** Vasilhas: o nível cai com o tempo real (5 min cada) e sobe quando você enche. */
  const PET_POTES = { comida: { dur: 5 * 60e3, nome: 'comida', fome: 'Fome!' }, agua: { dur: 5 * 60e3, nome: 'água', fome: 'Sede!' } };
  const petNivel = (k) => { const t = (S.perfil.petPote || {})[k]; return t == null ? 1 : Math.max(0, Math.min(1, 1 - (Date.now() - t) / PET_POTES[k].dur)); };
  function petPotesHTML() {
    return Object.entries(PET_POTES).map(([k, d]) => `<button type="button" class="pc-pote ${k}" data-act="pet-encher" data-pote="${k}" style="--n:${petNivel(k).toFixed(2)}" title="Encher a vasilha de ${d.nome}" aria-label="Encher a vasilha de ${d.nome}"><span class="pote-conteudo"></span><span class="pote-borda"></span></button>`).join('');
  }
  function petPoteX(cena, k) { const el = cena.querySelector('.pc-pote.' + k); return el ? el.offsetLeft + el.offsetWidth / 2 : null; }
  function petEncher(k) {
    PET.interagiu = true; const vazio = petNivel(k) < .15;
    S.perfil.petPote = Object.assign({}, S.perfil.petPote, { [k]: Date.now() }); salvar();
    const el = document.querySelector('.pc-pote.' + k); if (el) el.style.setProperty('--n', '1');
    if (el) { el.classList.remove('enchendo'); void el.offsetWidth; el.classList.add('enchendo'); setTimeout(() => el.classList.remove('enchendo'), 700); }
    if (vazio) PETS.forEach((c) => { c.visitaEm = 0; });
  }
  function petConsumir(k) {
    const n = Math.max(0, petNivel(k) - .25);
    S.perfil.petPote = Object.assign({}, S.perfil.petPote, { [k]: Date.now() - (1 - n) * PET_POTES[k].dur }); salvar();
  }
  /** Joga a bolinha onde você clicou: cai do alto e o cão corre atrás. */
  function petBolaEm(x, cena) {
    PET.interagiu = true; PETS.forEach((c) => { c.visita = null; c.fila = ''; });
    const bx = Math.max(14, Math.min(cena.clientWidth - 14, x));
    if (PET.bola) { Object.assign(PET.bola, { x: bx, h: 130, vy: 0, vx: 0, chutes: 0, tempo: 0, cd: .4 }); }
    else PET.bola = { x: bx, h: 130, vy: 0, vx: 0, rot: 0, cd: .4, chutes: 0, tempo: 0, el: null };
  }
  /** Efeitos soltos (bolhas, gotas, brilhos): nascem, animam em CSS e somem sozinhos. */
  function petFx(cena, classe, x, base, dx = 0, tam = 10) {
    const el = document.createElement('i');
    el.className = classe; el.style.cssText = `left:${x}px;bottom:${base}px;width:${tam}px;height:${tam}px;--dx:${dx}px`;
    el.addEventListener('animationend', () => el.remove());
    cena.appendChild(el);
  }
  function petLimpar(coco, el, cena) {
    PET.interagiu = true;
    PET = PETS.find((c) => c.cocos.includes(coco)) || PET;
    PET.cocos = PET.cocos.filter((c) => c !== coco);
    const x = coco.x;
    if (el) el.remove();
    for (let k = 0; k < 5; k++) petFx(cena, 'pet-brilho', x - 4 + (k - 2) * 7, 10 + (k % 2) * 8, (k - 2) * 6, 7);
    petFalar('Limpinho!', 1);
  }
  function petQuadro(t) {
    requestAnimationFrame(petQuadro);
    const cena = document.getElementById('pet-cena');
    if (!cena || document.hidden) { PET.ant = 0; return; }
    const dt = PET.ant ? Math.min(.05, (t - PET.ant) / 1000) : 0; PET.ant = t;
    const fase = petFase();
    if (cena.dataset.fase !== fase) { cena.dataset.fase = fase; cena.style.cssText = petEstiloFase(fase); }
    const L = cena.clientWidth, solo = cena.clientHeight - 26, agora = performance.now();
    if (agora - (PET.nivelT || 0) > 400) { PET.nivelT = agora; Object.keys(PET_POTES).forEach((k) => { const el = cena.querySelector('.pc-pote.' + k); if (el) el.style.setProperty('--n', petNivel(k).toFixed(2)); }); }
    // bolinha: rola, quica e volta das paredes
    const bola = PET.bola;
    if (bola) {
      if (!bola.el || !bola.el.isConnected) { bola.el = document.createElement('div'); bola.el.className = 'pet-bola'; bola.el.innerHTML = PET_BOLA; cena.appendChild(bola.el); }
      bola.x += bola.vx * dt; bola.vx *= 1 - .5 * dt; bola.rot += bola.vx * dt * 3.2; bola.cd -= dt; bola.tempo += dt;
      if (bola.x < 12) { bola.x = 12; bola.vx = Math.abs(bola.vx) * .8; } else if (bola.x > L - 12) { bola.x = L - 12; bola.vx = -Math.abs(bola.vx) * .8; }
      bola.vy -= 900 * dt; bola.h += bola.vy * dt;
      if (bola.h <= 0) { bola.h = 0; bola.vy = bola.vy < -120 ? -bola.vy * .45 : 0; }
      bola.el.style.transform = `translate(${bola.x - 10}px, ${-bola.h}px) rotate(${bola.rot}deg)`;
    }
    petSlots().forEach((sl) => {
      PET = PETS[sl.k]; PET.tipo = sl.tipo;
      const larg = petDef().CW * PET.ESC;
      if (PET.x === null) PET.x = L * (sl.k ? .3 : .55);
      PET.x = Math.max(larg / 2, Math.min(L - larg / 2, PET.x));
    // cocôs: ficam no chão até alguém limpar
    PET.cocos.forEach((c) => {
      if (!c.el || !c.el.isConnected) { c.el = document.createElement('button'); c.el.type = 'button'; c.el.className = 'pet-coco'; c.el.title = 'Limpar'; c.el.setAttribute('aria-label', 'Limpar o cocô'); c.el.innerHTML = PET_COCO + '<b></b><b></b>'; cena.appendChild(c.el); }
      c.el.style.transform = `translateX(${c.x - 13}px)`;
    });
    // o que o cão faz agora
    const reduz = petReduz(); if (PET.estado === 'brincando' && !PET.bola) { PET.estado = 'sentado'; PET.espera = 3; }
    const e = PET.estado;
    const andarAte = (meta, vel) => { const d = meta - PET.x; if (Math.abs(d) > 3) { PET.dir = Math.sign(d) || PET.dir; PET.x += Math.sign(d) * Math.min(Math.abs(d), vel * dt); return false; } return true; };
    if (e === 'comendo') {
      PET.tEstado += dt;
      if (PET.tEstado > 1.9) {
        const v = PET.visita; PET.visita = null; if (v) petConsumir(v);
        PET.alvo = null; PET.estado = 'parado'; PET.tEstado = 0; PET.espera = 5 + Math.random() * 6; PET.visitaEm = agora + 20000 + Math.random() * 20000; petFalar('♥', .9);
        if (v === 'comida' && PET.cocos.length < 3) PET.cocoEm = agora + 7000 + Math.random() * 7000;
      }
    } else if (e === 'latindo') {
      PET.tEstado += dt; PET.pulo = Math.max(0, 1 - PET.tEstado / .9);
      if (PET.tEstado > .95) { PET.estado = 'parado'; PET.tEstado = 0; PET.pulo = 0; PET.espera = 4; }
    } else if (e === 'coco') {
      PET.tEstado += dt;
      if (PET.tEstado > 1.5) {
        // cocô novo nunca cai em cima de outro: procura o ponto livre mais perto (26px de largura + respiro)
        const todos = PETS.flatMap((d) => d.cocos), livre = (x) => x >= 16 && x <= L - 16 && todos.every((c) => Math.abs(c.x - x) >= 34);
        let cx = PET.x - PET.dir * larg * .36;
        for (let passo = 0; passo < 14 && !livre(cx); passo++) cx = PET.x - PET.dir * larg * .36 + (passo % 2 ? -1 : 1) * Math.ceil((passo + 1) / 2) * 36;
        PET.cocos.push({ id: ++PET.id, x: Math.max(16, Math.min(L - 16, cx)), el: null });
        PET.estado = 'parado'; PET.tEstado = 0; PET.espera = 5; petFalar('Ufa!', 1);
      }
    } else if (e === 'banho') {
      PET.tEstado += dt; PET.bolhaT -= dt;
      if (PET.bolhaT <= 0) { PET.bolhaT = .11; petFx(cena, 'pet-bolha', PET.x + (Math.random() - .5) * larg * .8, 26 + Math.random() * 46, (Math.random() - .5) * 24, 8 + Math.random() * 12); }
      if (PET.tEstado > 3.6) { PET.estado = 'sacode'; PET.tEstado = 0; }
    } else if (e === 'sacode') {
      PET.tEstado += dt; PET.bolhaT -= dt;
      if (PET.bolhaT <= 0) { PET.bolhaT = .05; const lado = Math.random() < .5 ? -1 : 1; petFx(cena, 'pet-gota', PET.x + lado * larg * .3, 40 + Math.random() * 30, lado * (30 + Math.random() * 40), 5); }
      if (PET.tEstado > 1.1) { PET.estado = 'parado'; PET.tEstado = 0; PET.espera = 6; petFalar('Cheiroso! ✨', 1.6); }
    } else if (PET.bola || PET.fila === 'brincar') {
      PET.alvo = null; PET.estado = 'brincando';
      if (!PET.bola) { PET.fila = ''; PET.bola = { x: Math.max(40, Math.min(L - 40, PET.x + PET.dir * larg * .7)), h: 0, vy: 0, vx: 0, rot: 0, cd: 0, chutes: 0, tempo: 0, el: null }; }
      const b = PET.bola, dx = b.x - PET.x;
      // cada cão corre na sua velocidade (e muda um pouco a cada bolinha); o mais lento fica um corpo atrás
      if (!PET.vBola) PET.vBola = (PET.k ? 105 : 175) * (.85 + Math.random() * .3);
      const atras = PET.k ? Math.sign(dx || PET.dir) * larg * .85 : 0, mdx = dx - atras;
      PET.viraT = Math.max(0, (PET.viraT || 0) - dt);   // depois de virar, espera um pouco antes de virar de novo (a bolinha cruza de um lado a outro)
      const vira = (d) => { if (d !== PET.dir && PET.viraT <= 0) { PET.dir = d; PET.viraT = .6; } };
      if ((Math.abs(mdx) > 14 && (Math.sign(mdx) === PET.dir || PET.viraT <= 0)) || (Math.abs(mdx) > 4 && Math.sign(mdx) === PET.dir)) { vira(Math.sign(mdx)); PET.x += Math.sign(mdx) * Math.min(Math.abs(mdx), PET.vBola * dt); }  // sempre de frente para onde corre; perto da bola não dá passinhos para trás
      else if (Math.abs(dx) > larg * .8) vira(Math.sign(dx));              // parado: olha para a bolinha só se ela estiver longe, sem ficar virando
      if (Math.abs(dx) < larg * .45 && b.cd <= 0 && b.chutes < 6) {
        // chuta para o lado de lá (ou para o outro, se a parede estiver perto)
        let lado = Math.sign(dx) || PET.dir; if ((lado > 0 && L - b.x < 110) || (lado < 0 && b.x < 110)) lado = -lado;
        b.vx = lado * (300 + Math.random() * 120); b.vy = 230; b.cd = .5; b.chutes++;
      }
      if ((b.chutes >= 6 && Math.abs(b.vx) < 40 && b.h === 0 && Math.abs(dx) < larg * .5) || b.tempo > 22) {
        if (b.el) b.el.remove(); PET.bola = null; PETS.forEach((c) => { c.vBola = 0; }); PET.estado = 'sentado'; PET.espera = 3; PET.rel = 0; petFalar('Que divertido!', 1.6);
      }
    } else if (PET.fila === 'banho') {
      PET.alvo = null;
      if (andarAte(L * (PET.k ? .64 : .44), 110)) { PET.fila = ''; PET.estado = 'banho'; PET.tEstado = 0; PET.rel = 0; PET.dir = 1; } else PET.estado = 'andando';
    } else {
      if (!PET.visita && agora > PET.visitaEm && (PET.estado === 'parado' || PET.estado === 'sentado')) {
        PET.visitaEm = agora + 20000 + Math.random() * 20000;
        const ks = Object.keys(PET_POTES).filter((k) => petNivel(k) > .05 && petNivel(k) < .97);
        if (ks.length) PET.visita = ks[Math.floor(Math.random() * ks.length)];
        else if (agora > PET.avisoEm) { const vz = Object.keys(PET_POTES).find((k) => petNivel(k) <= .05); if (vz) { PET.avisoEm = agora + 30000; petFalar(PET_POTES[vz].fome, 1.6); } }
      }
      const bx = PET.visita ? petPoteX(cena, PET.visita) : null;
      if (bx !== null) {
        PET.alvo = true; if (!PET.ladoPote) PET.ladoPote = bx >= PET.x ? 1 : -1;   // o lado do potinho é decidido uma vez, para não virar de um lado a outro
        const meta = Math.max(larg / 2, Math.min(L - larg / 2, bx - PET.ladoPote * larg * (.4 + PET.k * .9))), d = meta - PET.x;  // o segundo para um corpo antes, não em cima do primeiro
        if (Math.abs(d) > 3) { PET.estado = 'andando'; PET.dir = Math.sign(d); PET.x += Math.sign(d) * Math.min(Math.abs(d), 96 * dt); }
        else { PET.dir = PET.ladoPote; PET.estado = 'comendo'; PET.tEstado = 0; PET.rel = 0; }
      } else {
        PET.alvo = null; PET.ladoPote = 0;
        // dois cães não sentam (nem param) um sobre o outro: o de trás se afasta devagar até sobrar espaço
        // histerese: começa a se afastar a menos de .8 corpo e só para ao chegar a 1.05, sempre para o mesmo lado, e desiste (por um tempo) se bater na parede
        const vizinho = petSlots().map((sl) => PETS[sl.k]).find((o) => o !== PET && o.x !== null && Math.abs(o.x - PET.x) < larg * (PET.fugindo ? 1.05 : .8));
        let fugir = !!(vizinho && PET.k > vizinho.k && agora > (PET.fugaAte || 0) && ['parado', 'sentado', 'andando'].includes(PET.estado));
        if (fugir) {
          if (!PET.fugindo) {
            PET.fugindo = true; PET.fugaDir = Math.sign(PET.x - vizinho.x) || 1;
            const folga = PET.fugaDir > 0 ? L - larg / 2 - PET.x : PET.x - larg / 2;
            if (folga < larg * .4) PET.fugaDir = -PET.fugaDir;
          }
          const limite = PET.fugaDir > 0 ? L - larg / 2 : larg / 2;
          if (Math.abs(limite - PET.x) < 2) { PET.fugindo = false; PET.fugaAte = agora + 10000; fugir = false; }
          else { PET.estado = 'andando'; PET.dir = PET.fugaDir; PET.x += PET.fugaDir * Math.min(60 * dt, Math.abs(limite - PET.x)); PET.espera = 1.5; }
        } else PET.fugindo = false;
        if (fugir) {
        } else {
        if (PET.estado === 'andando') { PET.estado = 'parado'; PET.espera = 5 + Math.random() * 5; }
        PET.espera -= dt;
        if (PET.cocoEm && agora > PET.cocoEm && (PET.estado === 'parado' || PET.estado === 'sentado')) { PET.estado = 'coco'; PET.tEstado = 0; PET.cocoEm = 0; PET.rel = 0; }
        else if (PET.estado === 'parado' && PET.espera <= 0 && !reduz) { PET.estado = 'sentado'; PET.espera = 3 + Math.random() * 3; }
        else if (PET.estado === 'sentado' && PET.espera <= 0) { PET.estado = 'parado'; PET.espera = 7 + Math.random() * 7; }
        }
      }
    }
    // parado ou sentado, o cão fica de frente para o outro (com folga, para não virar de um lado a outro)
    if ((PET.estado === 'parado' || PET.estado === 'sentado') && !PET.bola) {
      const outro = petSlots().map((sl) => PETS[sl.k]).find((o) => o !== PET && o.x !== null);
      if (outro && Math.abs(outro.x - PET.x) > larg * .5) PET.dir = outro.x > PET.x ? 1 : -1;   // perto demais não vira: só olha para o outro quando há espaço
    }
    // desenho
    const cao = cena.querySelector(`.pet-cao[data-k="${PET.k}"]`), balao = cena.querySelector(`.pet-balao[data-k="${PET.k}"]`);
    if (!cao) return;
    PET.rel += dt;
    const est = PET.estado, fps = reduz && est === 'parado' ? 0 : PET_FPS[est], q = est === 'coco' ? 1 : fps ? Math.floor(PET.rel * fps) % 4 : 0;
    const def = petDef(), ew = def.CW * PET.ESC, eh = def.CH * PET.ESC, tremor = est === 'sacode' ? Math.sin(PET.rel * 70) * 4 : 0;
    cao.style.cssText = `background-image:url('${def.arq}');width:${ew}px;height:${eh}px;background-size:${ew * 4}px ${eh * 4}px;background-position:${-q * ew}px ${-PET_LINHA[est] * eh}px;transform:translate(${PET.x - ew / 2 + tremor}px, ${-Math.round(Math.sin(PET.pulo * Math.PI * 3) * 10 * PET.pulo)}px) scaleX(${PET.dir})`;
    if (balao) {
      const fala = agora < PET.falaAte;
      balao.hidden = !fala;
      if (fala) {
        if (balao.textContent !== PET.fala) balao.textContent = PET.fala;
        const bw = balao.offsetWidth, bx = Math.max(6, Math.min(L - bw - 6, PET.x - 28));
        balao.style.transform = `translate(${bx}px, 0)`; balao.style.setProperty('--seta', Math.max(12, Math.min(bw - 22, PET.x - bx - 4)) + 'px');
      }
    }
    });
    PET = PETS[0];
    const dica = cena.querySelector('.pet-dica');
    if (PET.interagiu && !S.perfil.petDicaVista) { S.perfil.petDicaVista = true; salvar(); }  // a dica só aparece até a primeira brincadeira
    if (dica && (PET.interagiu || S.perfil.petDicaVista)) dica.classList.add('some');
  }
  requestAnimationFrame(petQuadro);
  document.addEventListener('click', (e) => {
    const cena = e.target.closest && e.target.closest('#pet-cena');
    if (!cena) return;
    const painel = cena.querySelector('.pet-config');
    if (painel && !painel.hidden && !e.target.closest('.pet-config-card, [data-act="pet-config"]')) { painel.hidden = true; UI.petConfig = false; return; }
    if (e.target.closest('.pet-balao')) { PET.falaAte = 0; const bl = cena.querySelector('.pet-balao'); if (bl) bl.hidden = true; return; }
    const coco = e.target.closest('.pet-coco');
    if (coco) { for (const d of PETS) { const c = d.cocos.find((x) => x.el === coco); if (c) { petLimpar(c, coco, cena); break; } } return; }
    if (e.target.closest('button, [data-act]')) return;
    // o corpo do bichinho não pega clique (para não tapar a casinha, a plaquinha e as vasilhas): o latido é achado pela posição
    const toque = PETS.slice(0, petSlots().length).find((d) => { const el = cena.querySelector(`.pet-cao[data-k="${d.k}"]`); if (!el) return false; const r = el.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; });
    if (toque) return petLatir(toque);
    if (S.perfil.petSemBola) return;   // bolinha desligada nos ajustes do pet
    petBolaEm(e.clientX - cena.getBoundingClientRect().left, cena);
  });
  Object.values(PET_TIPOS).forEach((d) => { const folha = new Image(); folha.src = d.arq; });

  return { PETS, PET_CASAS, PET_TIPOS, petCasaVars, petDef, petEncher, petFalar, petHTML, petIco, petLatido, petLatir, petSlots,
    get PET() { return PET; }, set PET(v) { PET = v; } };
};
