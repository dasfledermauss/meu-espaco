# Tyba — Agenda e Calendário

**Barra com 8 áreas:** Início, Agenda, Mural, Músicas, Biblioteca, Gastos, Wishlist, Currículo.

- **Agenda** reúne três páginas como abas: Calendário (`#/agenda`), Tarefas (`#/tarefas`) e Lembretes (`#/lembretes`).
- **Biblioteca** reúne quatro: Livros e filmes (`#/biblioteca`), Links, Imagens e Estudos. As rotas antigas continuam valendo; só aparecem as abas no alto e a área certa fica marcada na barra.

## Calendário
Grade do mês (semana começa no domingo). Em cada dia aparecem os **eventos**, as **tarefas com prazo** e os **lembretes**; clicar num dia mostra a lista dele ao lado (embaixo no celular). No celular as células mostram só barrinhas de cor por tipo.

**Evento:** título, dia, horário (opcional) e nota (opcional). Fica em `S.eventos` (`id`, `titulo`, `data`, `hora`, `nota`, `criadoEm`) e sincroniza junto com o perfil.

**Stickers:** 7 opções (aniversário, viagem, saúde, trabalho, festa, coração, destaque), até 3 por dia, escolhidos no painel do dia. Ficam em `S.stickers` (`{ 'AAAA-MM-DD': ['bolo', ...] }`). Imagens: Twemoji (© Twitter/X, CC-BY 4.0), em `assets/img/stickers/`.

## Início: próximos eventos e contagem
O widget **Próximos eventos** (coluna da direita, arrastável como os outros) lista os próximos 3–4 eventos com “hoje / amanhã / em N dias”. Um evento marcado com **Contar os dias no Início** (`contagem: true`) vira a contagem regressiva em destaque no topo do widget (o mais próximo, se houver vários).

## Datas e fuso (regra do projeto)
Dias são sempre textos `AAAA-MM-DD` no **fuso local** (`hoje()`, `dataLocal()`, `deDia()`). Carimbos de tempo (`criadoEm`, `editadoEm`) são ISO em UTC e, ao compará-los com um dia, passam por `dataLocal(...)`; nunca `slice(0, 10)` neles nem `new Date('AAAA-MM-DD')` sem hora.

## Teclado
No calendário: ← → andam um dia, ↑ ↓ uma semana, PageUp/PageDown o mês, Home/End o primeiro/último dia do mês, Enter ou espaço abre o dia.
