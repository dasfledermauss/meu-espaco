# Previsão do tempo

Bloco no topo da coluna da direita do Início (arrastável como os demais).

- **Fonte:** [Open-Meteo](https://open-meteo.com/), sem chave nem cadastro. A busca da cidade usa a API de geocodificação deles; só o nome digitado é enviado.
- **Cidade:** botão "Escolher cidade" ou o lápis do bloco. Pode ser pelo nome ou por "Usar minha localização" (o navegador pede permissão). Fica em `perfil.clima` (`nome`, `lat`, `lon`).
- **Dados:** temperatura, sensação, vento, máxima e mínima, chance de chuva e os próximos 5 dias. Códigos do tempo (WMO) viram texto e ícone em `CLIMA_COD`/`CLIMA_SVG` (`app.js`).
- **Cache:** a última resposta fica 30 minutos em `localStorage` (`meuEspaco.clima`); sem internet, mostra a guardada. O botão de atualizar força nova busca.
- **Service worker:** ignora pedidos a outros domínios, então a previsão nunca é guardada pelo cache do app.
- **Tamanho:** o card vem compacto (cidade, temperatura, máx/mín); clicar nele abre sensação, vento, chuva e os próximos 5 dias (`UI.climaAberto`).
