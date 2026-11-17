/* Tyba — previsão do tempo.
   Módulo separado do app.js: recebe do app o que precisa (estado, utilidades) por `ctx` e devolve só o que o resto do app usa.
   `S` aqui é um espelho do estado do app (que troca de objeto ao importar backup ou sincronizar), então sempre aponta para o atual. */
window.TybaClima = function (ctx) {
  'use strict';
  const { UI, main } = ctx;
  const S = new Proxy({}, { get: (_, k) => ctx.S()[k], set: (_, k, v) => { ctx.S()[k] = v; return true; }, has: (_, k) => k in ctx.S(), ownKeys: () => Reflect.ownKeys(ctx.S()), getOwnPropertyDescriptor: (_, k) => ({ value: ctx.S()[k], enumerable: true, configurable: true, writable: true }) });
  const esc = (...a) => ctx.esc(...a), hoje = (...a) => ctx.hoje(...a), agora = (...a) => ctx.agora(...a), ic = (...a) => ctx.ic(...a), btnIco = (...a) => ctx.btnIco(...a), btn = (...a) => ctx.btn(...a), salvar = (...a) => ctx.salvar(...a), cartao = (...a) => ctx.cartao(...a), vazio = (...a) => ctx.vazio(...a), txt = (...a) => ctx.txt(...a), render = (...a) => ctx.render(...a), limpo = (...a) => ctx.limpo(...a);
  /* ---------------- previsão do tempo ----------------
     Open-Meteo (sem chave, sem cadastro). A cidade fica em perfil.clima; a última resposta é guardada
     por 30 minutos no navegador para não consultar a cada tela. Sem internet, mostra a última guardada. */
  const CLIMA_CHAVE = 'meuEspaco.clima', CLIMA_VALE = 30 * 60e3;
  const CLIMA_COD = (c) => c === 0 ? ['Céu limpo', 'sol'] : c <= 2 ? ['Poucas nuvens', 'solnuvem'] : c === 3 ? ['Nublado', 'nuvem'] : c <= 48 ? ['Neblina', 'nevoa']
    : c <= 57 ? ['Garoa', 'chuva'] : c <= 67 ? ['Chuva', 'chuva'] : c <= 77 ? ['Neve', 'neve'] : c <= 82 ? ['Pancadas de chuva', 'chuva'] : c <= 86 ? ['Neve', 'neve'] : ['Tempestade', 'raio'];
  const CLIMA_SVG = {
    sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/>',
    solnuvem: '<circle cx="9" cy="8.5" r="3"/><path d="M9 2.5v1.2M3 8.5h1.2M4.8 4.3l.9.9M13.2 4.3l-.9.9"/><path d="M8 20h9a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.4 1.3A3 3 0 0 0 8 20Z"/>',
    nuvem: '<path d="M7 19h10.5a4 4 0 0 0 .5-8 6 6 0 0 0-11.4 1.6A3.3 3.3 0 0 0 7 19Z"/>',
    nevoa: '<path d="M4 9h16M3 13h18M6 17h12"/>',
    chuva: '<path d="M7 15h10.5a3.8 3.8 0 0 0 .5-7.6 6 6 0 0 0-11.3 1.5A3.2 3.2 0 0 0 7 15Z"/><path d="M8.5 18l-1 2.5M12.5 18l-1 2.5M16.5 18l-1 2.5"/>',
    neve: '<path d="M7 14h10.5a3.8 3.8 0 0 0 .5-7.6A6 6 0 0 0 6.700 7.900 3.200 3.200 0 0 0 7 14Z"/><path d="M8.500 18h.01M12 20h.01M15.500 18h.01"/>',
    raio: '<path d="M7 14h10.5a3.8 3.8 0 0 0 .5-7.6A6 6 0 0 0 6.700 7.900 3.200 3.200 0 0 0 7 14Z"/><path d="M12.500 14l-2.500 4h3.500l-2 3.500"/>'
  };
  const climaIco = (k, cls = '') => `<svg class="clima-ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${CLIMA_SVG[k] || CLIMA_SVG.nuvem}</svg>`;
  const graus = (n) => Math.round(n) + '°';
  const climaGuardado = () => { try { return JSON.parse(localStorage.getItem(CLIMA_CHAVE) || 'null'); } catch (e) { return null; } };
  function climaDados() {
    const l = S.perfil.clima; if (!l) return null;
    const g = UI.clima || climaGuardado();
    return g && g.lat === l.lat && g.lon === l.lon ? g : null;
  }
  async function carregarClima(forcar) {
    const l = S.perfil.clima; if (!l || UI.climaCarregando) return;
    const g = climaDados(); if (!forcar && g && Date.now() - g.em < CLIMA_VALE) { UI.clima = g; return; }
    UI.climaCarregando = true; UI.climaErro = false; climaAtualizar();
    try {
      const u = `https://api.open-meteo.com/v1/forecast?latitude=${l.lat}&longitude=${l.lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=6`;
      const r = await fetch(u); if (!r.ok) throw new Error(r.status);
      const j = await r.json();
      UI.clima = { lat: l.lat, lon: l.lon, em: Date.now(), atual: j.current, dia: j.daily };
      try { localStorage.setItem(CLIMA_CHAVE, JSON.stringify(UI.clima)); } catch (e) { /* sem espaço: segue sem guardar */ }
    } catch (e) { UI.climaErro = true; }
    UI.climaCarregando = false; climaAtualizar();
  }
  const climaAtualizar = () => { const el = document.getElementById('clima-card'); if (el) el.outerHTML = climaHTML(true); };
  function climaHTML(semBusca) {
    const l = S.perfil.clima;
    if (!l) return `<section class="cartao clima clima-vazio" id="clima-card">${climaIco('solnuvem')}<div><strong>Previsão do tempo</strong><p class="meta">Escolha a sua cidade para ver o tempo de hoje e dos próximos dias.</p></div>${btn('clima-local', 'Escolher cidade', '', 'btn-1')}</section>`;
    const g = climaDados();
    if (!semBusca && (!g || Date.now() - g.em >= CLIMA_VALE)) setTimeout(() => carregarClima(false), 0);
    const cab = `<div class="clima-cab"><span class="clima-cidade">${ic('pin')}${esc(l.nome)}</span><span class="clima-acoes">${btnIco('clima-atualizar', 'refresh', 'Atualizar')}${btnIco('clima-local', 'edit-pencil', 'Trocar a cidade')}</span></div>`;
    if (!g) return `<section class="cartao clima" id="clima-card" aria-busy="true">${cab}<p class="meta">${UI.climaErro ? 'Não deu para buscar a previsão agora. Tente atualizar.' : 'Buscando a previsão…'}</p></section>`;
    const a = g.atual, d = g.dia, [txt, ico] = CLIMA_COD(a.weather_code), chuva = d.precipitation_probability_max[0] || 0;
    const dias = d.time.slice(1, 6).map((t, k) => { const x = new Date(t + 'T12:00'); return `<li><span>${x.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span>${climaIco(CLIMA_COD(d.weather_code[k + 1])[1])}<b>${graus(d.temperature_2m_max[k + 1])}</b><span class="min">${graus(d.temperature_2m_min[k + 1])}</span></li>`; }).join('');
    const dica = chuva >= 50 ? 'Leve guarda-chuva.' : a.temperature_2m >= 32 ? 'Dia quente: água por perto.' : a.temperature_2m <= 14 ? 'Frio: leve um casaco.' : '';
    const aberto = !!UI.climaAberto;
    const fatos = `<ul class="clima-fatos"><li><span>Máx / mín</span><b>${graus(d.temperature_2m_max[0])} / ${graus(d.temperature_2m_min[0])}</b></li><li><span>Sensação</span><b>${graus(a.apparent_temperature)}</b></li><li><span>Chuva</span><b>${chuva}%</b></li><li><span>Vento</span><b>${Math.round(a.wind_speed_10m)} km/h</b></li></ul>`;
    return `<section class="cartao clima ${aberto ? 'aberto' : ''}" id="clima-card" aria-label="Previsão do tempo em ${esc(l.nome)}">${cab}
      <div class="clima-corpo" data-act="clima-alternar" role="button" tabindex="0" aria-expanded="${aberto}" title="${aberto ? 'Recolher' : 'Ver mais'}">
        <div class="clima-agora">${climaIco(ico, 'grande')}<div><p class="clima-temp">${graus(a.temperature_2m)}</p><p class="clima-txt">${txt}</p></div>
          <span class="clima-mm">${graus(d.temperature_2m_max[0])} / ${graus(d.temperature_2m_min[0])}</span><span class="clima-seta">${ic('nav-arrow-down')}</span></div>
        ${aberto ? `${fatos}<ul class="clima-dias">${dias}</ul>${dica ? `<p class="clima-dica">${dica}</p>` : ''}` : ''}</div></section>`;
  }
  async function climaBuscar(cidade) {
    const r = await fetch('https://geocoding-api.open-meteo.com/v1/search?count=1&language=pt&name=' + encodeURIComponent(cidade));
    const j = await r.json(); const x = (j.results || [])[0]; if (!x) return null;
    return { nome: [x.name, x.admin1].filter(Boolean).join(', '), lat: +x.latitude.toFixed(3), lon: +x.longitude.toFixed(3) };
  }
  function climaDefinir(l) { S.perfil.clima = l; UI.clima = null; salvar(); UI.modal = null; render(); carregarClima(true); }

  return { climaDados, carregarClima, climaHTML, climaBuscar, climaDefinir };
};
