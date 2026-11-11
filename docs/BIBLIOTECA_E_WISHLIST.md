# Meu Espaço — Biblioteca e Wishlist

Complementa o `ESCOPO.md`. Descreve os dois módulos como estão no protótipo (v2).

## 1. Biblioteca (livros e filmes)

Tudo é preenchido pela própria pessoa. Nada é buscado em catálogos externos.

| Campo | Regra |
|---|---|
| Formato | Livro, ou Filme/série. Muda o rótulo do autor (Autor(a) ou Direção) e os nomes da situação. |
| Nome | Obrigatório. |
| Autor(a) ou direção, ano | Opcionais. |
| Gêneros | Texto livre separado por vírgula. Os já usados aparecem como sugestão. Um item pode ter vários. |
| Situação | Livro: Quero ler, Lendo, Lido. Filme: Quero assistir, Assistindo, Assistido. |
| Estrelas | De 1 a 5, opcional, com botão Limpar. Estrela vazada = não marcada, preenchida = marcada. |
| Onde parei | Página atual e total (livro) ou minuto atual e duração (filme). Vira barra de progresso com a porcentagem. O botão **Página** no post atualiza em dois cliques, e marcar como concluído é uma caixa ali mesmo. |
| Anotações | Lista própria, separada da opinião. Cada anotação guarda texto, página e data, e pode ser marcada como citação. |
| Capa | Imagem enviada do computador, reduzida para 240×360 e guardada com os dados. Sem capa, o sistema desenha uma lombada colorida com o nome. |
| Resumo e minha opinião | Texto livre. A opinião é o que aparece em destaque no feed. Anotações ficam na ficha. |

**Onde cadastrar:** no Início, tipo **Livro ou filme**, ou em **Biblioteca → Adicionar**. A janela pede só formato, nome, autor, situação e capa; estrelas, progresso, gêneros, ano, resumo e opinião entram por “+”. O item entra no feed do dia como um post com capa.

**Tela em prateleiras.** As capas ficam em pé sobre tábuas de madeira, com nome, estrelas e situação na legenda. Controles:

- Filtro **Tudo / Livros / Filmes**.
- **Prateleiras por** Situação (Lendo ou assistindo agora, Na fila, Concluídos), Gênero (uma prateleira por gênero; um item com dois gêneros aparece nas duas) ou Estrelas.
- Busca por nome, autor, gênero, resumo e comentário.

**Ficha.** Capa grande, dados, resumo, comentário, favoritar, lembrar depois, editar (inclusive trocar ou remover a capa), excluir e a conversa de comentários datados.

**Critérios de aceite**

- Atualizar a página atual pelo botão **Página** e ver a barra de progresso mudar no feed e na prateleira.
- Selecionar um trecho e guardar como anotação; conferir que ela aparece na ficha com a página.
- Adicionar um livro com capa, 4 estrelas e dois gêneros. Ele aparece no feed, na prateleira da situação escolhida e nas duas prateleiras de gênero.
- Mudar a situação para Lido. O livro troca de prateleira e mantém capa, estrelas e data original.
- Adicionar um filme sem capa. A prateleira mostra a lombada desenhada com o nome.
- Recarregar a página e encontrar tudo igual.

## 2. Wishlist (vitrine)

A pessoa só cola o **link do produto**. O resto é capturado da página.

| Dado | De onde vem |
|---|---|
| Nome | Dados de produto da página (schema.org Product), depois `og:title`, depois o título da página. |
| Foto | Imagem do produto nos dados estruturados, depois `og:image`. É exibida direto do site da loja. |
| Preço e moeda | Oferta nos dados estruturados, depois metadados de preço, depois padrões comuns no HTML. |
| Estrelas e nº de avaliações | Avaliação agregada do produto, quando a página publica. |
| Loja | Nome do site (`og:site_name`), ou o domínio do link. |

**Como a captura funciona.** O navegador não pode ler outros sites sozinho. Por isso existe o `servidor.py` (aberto pelo `iniciar.bat`), que roda só no computador, busca a página do produto e devolve os dados. Sem o servidor, o link é salvo como “Aguardando captura” e pode ser capturado depois.

| Situação do cartão | Significado |
|---|---|
| Sem selo | Captura completa. |
| Faltou: … | A página entregou só parte dos dados. O cartão mostra o que veio. |
| Não consegui ler a página | A loja bloqueou ou está fora do ar. O link continua salvo; dá para tentar de novo. |
| Aguardando captura | Salvo sem o servidor ligado. |

Corrigir à mão (nome, preço, foto, loja) é opcional, em Editar. Um nome corrigido à mão não é sobrescrito pela próxima captura.

**Tela em vitrine.** Grade de cartões de produto: foto, loja, nome, estrelas, preço grande e botão **Ver na loja**. Ações por ícone: favoritar, comprei, atualizar preço, excluir. Controles: **Quero / Comprados**, ordenação (mais recentes, menor preço, maior preço), **Atualizar todos os preços** e a soma dos preços da lista.

**Preço ao longo do tempo.** Cada captura com preço diferente entra no histórico da ficha. O cartão mostra “↓ caiu R$ X” ou “↑ subiu R$ X” em relação à captura anterior.

**Comprei.** Marca o produto como comprado e oferece registrar um gasto com o preço atual, na categoria Compras, com data de hoje.

**Limitações conhecidas**

- Algumas lojas bloqueiam leitura automática (acontece com frequência na Amazon) ou só mostram o preço depois de carregar scripts. Nesses casos a captura vem parcial.
- A foto depende do site da loja continuar servindo a imagem.
- Os dados do protótipo ficam no navegador, separados por endereço. Quem usava abrindo o `index.html` direto precisa **Exportar backup** lá e **Importar backup** em `http://localhost:8000` (menu do perfil).

**Critérios de aceite**

- Colar o link de um produto com dados estruturados e ver foto, nome, preço, estrelas e loja sem digitar mais nada.
- Colar um link de página que só tem título e imagem: o cartão aparece com “Faltou: preço”.
- Atualizar o preço depois de uma mudança na loja e ver a variação no cartão e o histórico na ficha.
- Marcar como comprado, aceitar o registro do gasto e conferir o valor em Gastos.
