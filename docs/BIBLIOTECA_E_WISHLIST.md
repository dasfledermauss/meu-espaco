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

**Lido / assistido e excluir:** passe o mouse na capa (no celular os botões ficam sempre visíveis) para marcar como lido ou assistido, ou excluir. A página do item tem os mesmos botões. Desmarcar volta para "Lendo/Assistindo" se houver progresso, senão para a fila.

**Colar direto:** na Wishlist e em Links, Ctrl+V com um endereço cria o card (vários, um por linha, também). **Shopee:** a loja barra a leitura; o nome e a foto vêm do próprio link e o preço só aparece se a API deles responder (senão, preencha à mão).

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

**Como os cards se comportam (v5.17).** Grade de colunas a partir de 240 px, todos com a mesma altura por linha. Ordem fixa: imagem (quadro branco, sem corte) → loja → título (2 linhas) → aviso → avaliação (espaço reservado mesmo sem estrelas) → preço → botão “Ver na loja” (secundário) e ações presos ao rodapé. O aviso “Faltou: …” é calculado na hora, só com o que está realmente vazio (nome, foto, preço). Cada ação tem balão de dica. “Colar link” é o único botão principal da página.

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

**Preço ao longo do tempo.** O preço é lido quando você cola o link, quando pede **Atualizar preço** (ou **Atualizar todos os preços**) e, sozinho, quando você abre a Wishlist: até 5 produtos ainda não comprados cuja última leitura passou de **12 horas** são relidos em segundo plano, com “Conferindo os preços…” no topo da vitrine. Cada captura com preço diferente entra no histórico da ficha, e o cartão mostra “↓ caiu R$ X” ou “↑ subiu R$ X” em relação à anterior.

**Aviso de queda.** Quando a releitura encontra um preço **menor** que o anterior, o app cria um lembrete `Baixou de preço: <produto> — de R$ X para R$ Y`, ligado ao produto e marcado como queda de preço (o cartão do lembrete mostra o ícone de sacola e “queda de preço”). O lembrete aparece na faixa do Início e na lista de lembretes; enquanto não for concluído, uma nova queda do mesmo produto não cria um segundo lembrete.

**Comprei.** Marca o produto como comprado e oferece registrar um gasto com o preço atual, na categoria Compras, com data de hoje.

**Limitações conhecidas**

- **Amazon.** A Amazon não publica dados estruturados de produto, então o leitor tem um caminho próprio para ela (título em `productTitle`, foto em `data-old-hires` / `landingImage`, preço no bloco `corePrice`, estrelas em “x,y de 5 estrelas”). Ela também bloqueia leitura automática com frequência — e quase sempre quando o pedido vem de um servidor na nuvem. Resultado prático: na Amazon a captura funciona bem pelo `iniciar.bat`, no seu computador, e costuma falhar no site publicado; quando a página devolvida é a de verificação, o app avisa “a loja bloqueou a leitura automática desta página” e o link fica salvo para tentar de novo.
- Outras lojas também bloqueiam ou só mostram o preço depois de carregar scripts. Nesses casos a captura vem parcial e dá para completar em **Corrigir dados**.
- A foto depende do site da loja continuar servindo a imagem.
- Os dados do protótipo ficam no navegador, separados por endereço. Quem usava abrindo o `index.html` direto precisa **Exportar backup** lá e **Importar backup** em `http://localhost:8000` (menu do perfil).

**Critérios de aceite**

- Colar o link de um produto com dados estruturados e ver foto, nome, preço, estrelas e loja sem digitar mais nada.
- Colar um link de página que só tem título e imagem: o cartão aparece com “Faltou: preço”.
- Atualizar o preço depois de uma mudança na loja e ver a variação no cartão e o histórico na ficha.
- Marcar como comprado, aceitar o registro do gasto e conferir o valor em Gastos.


## Mercado Livre: foto e preço automáticos

O Mercado Livre bloqueia a leitura da página, então foto e preço vêm da API oficial dele. É preciso um aplicativo gratuito:

1. Entre em developers.mercadolivre.com.br com sua conta e escolha **Criar aplicação**.
2. Dê um nome, marque o uso como consulta de dados públicos e salve.
3. Copie o **App ID** e a **Chave secreta**.
4. No `config.local.json`, acrescente `"ML_CLIENT_ID": "<App ID>"` e `"ML_CLIENT_SECRET": "<chave>"` (veja `config.local.exemplo.json`). No Vercel, crie as duas variáveis de ambiente com esses nomes.
5. Reinicie o `servidor.py` e use Atualizar preço nos cards.

Sem as chaves, só o nome sai do link; foto e preço ficam para preencher em Corrigir dados.

## Desejo no feed

No feed, o desejo é uma etiqueta horizontal: foto à esquerda, título (até 2 linhas), loja e avaliação no meio e, depois do picote tracejado, o preço com a variação. No celular a foto fica em cima.

## Artigos em janela flutuante

Clicar num artigo abre uma janela flutuante com o título, botão de fechar (ou Esc), ícone para abrir em nova guia e botão de anotar. Dá para mover pela barra e redimensionar pelo canto (com mouse ou toque); várias janelas podem ficar abertas e a clicada vem para a frente. PDF com o servidor ligado usa o leitor interno; o resto abre a página num quadro. Sites que proíbem ser embutidos não aparecem ali: use "Abrir em nova guia". No celular a janela ocupa quase toda a tela.
