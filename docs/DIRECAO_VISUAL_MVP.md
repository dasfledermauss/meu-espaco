# Meu Espaço — direção visual do MVP

## Conceito

Um portal pessoal dos anos 2000, com perfil no estilo MySpace e biblioteca de links no estilo GeoCities. Ao entrar, Jack vê o próprio perfil, escreve uma nota ou cola um link e consulta o que publicou por dia. A personalidade vem da foto, do humor, das coleções e da cor escolhida.

Esta direção atualiza a apresentação visual do [escopo principal](https://chatgpt.com/library?file_id=libfile_ed820f435ad0819185d58b0bef310242&account_id=personal) e acompanha as [features complementares](https://chatgpt.com/library?file_id=libfile_725aae9956688191ba15c1ad0054c4fd&account_id=personal). Os rascunhos de Início e Currículo continuam servindo de referência para os fluxos. As medidas e cores abaixo são propostas para a primeira implementação.

## Atualização v3: leve, claro e com respiro (vigente)

A v3 mantém a estrutura de colunas da v2 e troca a pele retrô por uma estética leve, no espírito dos painéis atuais. Onde este trecho divergir do resto do documento, vale este.

**Fundamentos**

| Decisão | Valor |
|---|---|
| Tipografia | Lexend (variável, embutida em `assets/fonts/`), corpo 15 px, títulos 600, rótulos 13 px |
| Fundo | Cinza-azulado claro (`--fundo`) |
| Superfície | Cartão branco, raio 22 px, **sem borda e sem sombra**; a separação vem do contraste e do espaço |
| Itálico | Não se usa em lugar nenhum |
| Cor | Quase tudo neutro. Cor só em ação principal, estado e dado (ouro em estrelas, verde em queda de preço, amarelo em lembrete vencido, vermelho em exclusão) |
| Selos de tipo | Neutros: fundo cinza-claro e ícone cinza. O tipo é dito pelo ícone e pela palavra, não pela cor |
| Botões | Pílula. Principal cheio na cor da marca; secundário cinza; fantasma sem fundo |
| Espaçamento | 20 px dentro do cartão, 18–20 px entre cartões, 26 px entre colunas |

**Criar (estilo Tumblr).** O Início abre com uma barra só: a pergunta **“O que você quer guardar?”** e os tipos em pílula (Nota, Link, Livro ou filme, Artigo de estudo, Desejo, Gasto, Lembrete). Não há campo de texto nessa barra. Escolher o tipo abre uma janela com **só o essencial** daquele tipo; o resto entra por **“+ Gêneros”, “+ Ano”, “+ Resumo”** e assim por diante. Campos curtos ficam lado a lado, sem esticar na largura toda.

**Nada digitado se perde.** O que estiver escrito é guardado como rascunho ao fechar a janela, trocar de página ou fechar o navegador. A janela mostra **“Rascunho guardado”** e um **Descartar**; o tipo com rascunho ganha um ponto na barra de criar.

**Imagens.** Capa de livro, capa de pasta e foto de perfil mostram **prévia antes de salvar**, com botão de remover. A área de envio aceita clique ou arrastar.

**Menos botões.** Cada post mostra no máximo três ícones à esquerda (favoritar, e os próprios do tipo), as ações de texto à direita (Comentar, Editar) e **“⋯”** com o resto. Favoritar, fixar, marcar como lido, atualizar e excluir são **ícone sozinho**, com dica ao passar o mouse e `aria-label`; estado ativo é ícone preenchido mais cor.

**Ações do post: uma linha só.** Todas as ações são **ícones sem legenda**, numa única linha no rodapé do cartão, com dica ao passar o mouse e nome acessível: favoritar, e então os do tipo (ler depois e lido; fixar e cor; página e anotar; comprado e atualizar preço), comentar com o número ao lado e **copiar endereço**. **Editar** e o resto ficam no **“⋯”** à direita. Nenhum botão de texto no rodapé.

**Card de link.** O título é o protagonista, em duas linhas no máximo. Abaixo, o domínio com favicon e, quando houver, o “por que guardei” em citação; a descrição capturada entra no lugar quando não há comentário. A imagem fica à esquerda no feed e no topo do cartão na grade.

**Links agrupados.** Com “Todas as coleções”, a página mostra um bloco por coleção, com o nome e a contagem no título, e os cartões numa grade densa — como num gerenciador de abas. Escolhendo uma coleção, o agrupamento passa a ser pelos grupos de dentro dela.

**Lembrete vencido** aparece antes da barra de criar, no topo do Início.

**Ordem das telas:** Início · Mural · Biblioteca · Estudos · Links · Wishlist · Gastos · Lembretes · Currículo, e as coleções abaixo.

**Temas.** Azul, Lilás, Verde e Grafite, mais **cor personalizada** por seletor; o tom escuro e o tom claro da marca são calculados a partir dela.

**Modo claro e escuro.** A escolha fica no menu da foto de perfil, no topo: **Claro**, **Escuro** e **Sistema** (padrão, acompanha o aparelho e muda junto quando o sistema troca). O escuro não é uma inversão: usa fundo quase preto (`#10131a`), superfícies um pouco mais claras que o fundo e texto cinza-claro, nunca preto nem branco puros. A cor da marca clareia o suficiente para manter contraste de leitura, e os post-its ganham versões escuras dos cinco papéis. Com cor personalizada, o texto do botão principal é calculado pela luminosidade da cor escolhida.

**Começo vazio.** Um espaço novo abre sem nenhum registro: nome **Meu Nome**, um ícone genérico no lugar da foto, as coleções Pessoal e Trabalho prontas e o currículo em branco. Os arquivos em `data/` continuam no projeto apenas como exemplo para importar.

## Atualização v2: hierarquia, colunas, temas por módulo e ícones (histórico)

A v1 (registrada em `historico/2026-11-10_v1-retro-lista/`) era retrô, mas sem hierarquia: todo registro era uma linha igual e o feed parecia lista de notificações. A v2 mantém o portal dos anos 2000 e muda o seguinte. Onde este trecho divergir das seções abaixo, vale este.

**Estrutura da página**

| Região | Conteúdo |
|---|---|
| Barra do topo (fixa) | Marca, busca global e perfil (foto, nome, humor do dia). O perfil abre o menu de configurações: editar perfil e humor, aparência, currículo, exportar e importar backup, restaurar exemplos. |
| Coluna esquerda | Navegação do sistema com ícone e contador: Início, Mural de notas, Biblioteca, Coleções de links, Wishlist, Gastos, Lembretes, Currículo. Abaixo, a lista de coleções. |
| Centro | Conteúdo da tela. No Início: lembrete vencido, captura e feed. |
| Coluna direita (só no Início) | Resumo: próximos lembretes, lendo ou assistindo, um item da vitrine, fila de leitura, favoritos. Some quando não há conteúdo. |

No celular a navegação fica atrás do botão de menu, a busca ocupa a segunda linha do topo e a coluna direita desce para depois do feed.

**Hierarquia do post.** Três níveis em todo post: cabeçalho pequeno (ícone e tipo em maiúsculas, coleção, hora), conteúdo grande e ações discretas no rodapé. O conteúdo muda por tipo:

| Tipo | Como aparece no feed | Tela própria (tema) |
|---|---|---|
| Nota | Post-it colorido com o texto em destaque | **Mural**: quadro de cortiça com post-its levemente girados, alfinete nas fixadas, cores trocáveis |
| Link | Título grande, domínio com favicon e o “por que guardei” em citação | **Coleções**: diretório por coleção e grupo |
| Livro ou filme | Capa à esquerda, nome, autor, estrelas, situação e gêneros | **Biblioteca**: prateleiras de madeira com as capas em pé |
| Desejo | Foto do produto, nome, preço grande, loja e estrelas | **Wishlist**: vitrine de loja em grade, com botão “Ver na loja” |
| Gasto | Linha compacta, valor grande à direita | **Gastos**: extrato com total do mês, barras por categoria e tabela |
| Lembrete | Faixa amarela no topo quando vence | **Lembretes**: quadro com colunas Vencidos, Hoje, Próximos 7 dias e Depois |

Importações em lote entram recolhidas num único bloco do feed, para não empurrar os posts escritos à mão.

**Ícones.** Biblioteca [Iconoir](https://iconoir.com/) (licença MIT), embutida em `assets/js/icones.js` para funcionar sem internet. Traço de 1,5 px, tamanho acompanhando o texto. Regras:

- Todo ícone de ação vem com texto ao lado. Só nos cartões compactos (post-it, produto, lembrete, tabela) o ícone aparece sozinho, com nome acessível e dica ao passar o mouse.
- **Inativo = contorno, ativo = preenchido**, mais a mudança de texto e de cor. Pares usados: Favoritar/Favorito (estrela), Ler mais tarde/Na fila (marcador), Marcar como lido/Lido (círculo com visto), Fixar/Fixada (alfinete), Comprei/Comprado (círculo com visto), Comentar/N comentários (balão). Na navegação, o item atual usa a versão preenchida quando existe.
- A estrela de avaliação segue a mesma regra: preenchida até a nota, contorno no restante.
- Estado nunca depende só da cor: há sempre texto ou `aria-pressed`.

**Cores novas.** Dourado para estrelas e favorito, tons de madeira para prateleira e moldura do mural, cinco papéis de post-it (amarelo, rosa, azul, verde, laranja). O amarelo de aviso continua reservado a lembretes e pendências de captura.

## Referências e aplicação

| Referência | O que aproveitar no Meu Espaço |
|---|---|
| [SpaceHey](https://chatgpt.com/library?file_id=libfile_5c48bf26e94c81919cdbcf99bd813f86&account_id=personal) — perfil social clássico | Foto pequena, mini bio e humor na lateral. Links de ação próximos ao conteúdo que modificam. |
| [Yahoo! GeoCities](https://chatgpt.com/library?file_id=libfile_69804f62c6808191b3e421583d26bf5b&account_id=personal) — portal e diretório | Títulos em faixas de cor, agrupamento por assunto e listas de links com descrições curtas. |
| [RPG Revelation](https://chatgpt.com/library?file_id=libfile_8a84cf5c84bc8191ab0441af89c2963f&account_id=personal) — fansite e fórum | Menu por assunto, data visível e comentários ligados ao post original. |

Para buscar outras referências, usar *old web*, *2000s web portal*, *classic MySpace layout* e *gaming fansite layout*. A moldura do Internet Explorer nas imagens pertence ao navegador. O desenho do produto começa no conteúdo da página.

## Aparência base

- **Cor.** Começar com fundo branco, texto quase preto, azul escuro nos cabeçalhos e azul sublinhado nos links. Reservar o amarelo claro para o lembrete que precisa de atenção.
- **Forma.** Usar painéis retangulares com borda de 1 px, um cabeçalho compacto e conteúdo alinhado à esquerda. Cada post é um cartão separado. Sombras duras e pequenas só nos objetos temáticos (post-it, capa, produto).
- **Texto.** Usar fonte do sistema, corpo em torno de 16 px e metadados em torno de 14 px. A densidade vem de frases curtas e agrupamento por assunto. Preservar a legibilidade das datas e dos controles.
- **Layout.** No desktop, usar navegação lateral de aproximadamente 216 px, coluna principal flexível e, no Início, coluna de resumo de 270 px. No celular, recolher a navegação e organizar captura, feed e listas em uma coluna. Manter o botão de salvar ao alcance com o teclado aberto.
- **Tema pessoal.** Definir as cores em variáveis CSS compartilhadas. Ao escolher outro tema, atualizar cabeçalhos, seleção e foco. Manter links sublinhados e estados identificáveis por texto em todas as paletas.

## Componentes que se repetem

| Componente | Conteúdo e comportamento | Onde usar |
|---|---|---|
| Painel | Faixa com título, conteúdo e ação opcional no cabeçalho | Perfil, captura, coleções, experiência profissional |
| Linha de registro | Título, uma linha de contexto, metadados e ações | Links, notas, cursos, wishlist |
| Post | Data, texto e acesso aos comentários. O título abre a ficha do registro | Feed e visão por dia |
| Formulário | Rótulos visíveis, campos simples e ações Salvar e Cancelar | Captura, edição de perfil e currículo |
| Faixa de aviso | Uma mensagem curta e uma ação pertinente. Um lembrete vencido permite abrir, concluir ou adiar | Topo do Início |
| Navegação | Links com nomes de destinos e indicação da área atual | Menu lateral e menu móvel |

Links navegam. Botões executam ações, mesmo quando sua aparência é de texto compacto. Prever foco visível, nomes acessíveis para ícones e confirmação de exclusão identificando o item.

## Aplicação nas telas

### Início

1. Mostrar o lembrete no topo quando houver uma pendência.
2. No topo, mostrar foto, nome e humor com o menu de configurações. Na lateral esquerda, a navegação. Na direita, o resumo.
3. No centro, abrir com **O que você quer guardar?**: uma fileira de tipos (Nota, Link, Gasto, Lembrete), os campos do tipo, o dropdown **Salvar em** e a ação **Salvar**. O tipo selecionado tem marca ✓ além da cor.
4. Exibir o feed em ordem cronológica, com grupos por data e controle **Por dia**. Editar um post atualiza o mesmo registro que aparece na coleção.
5. Quando a redescoberta entrar no produto, inserir um único painel **Do seu arquivo** abaixo da atividade recente. Top 8, música e fases anteriores ficam no Perfil.

### Biblioteca de links

Abrir com busca e filtros **Todos**, **Favoritos** e **Ler mais tarde**. Mostrar cada endereço como uma linha de diretório. Exemplo de conteúdo:

> **Menu de navegação por ambientes**  
> Guardei pela transição entre a planta e a imagem do ambiente.  
> Referências de interface · Para ler  
> Marcar como lido · Favoritar · Editar

O título abre a fonte. A ficha reúne notas e comentários. No celular, permitir que as ações quebrem para a linha seguinte. Um link pode continuar favorito depois de ser marcado como lido.

### Meu currículo

No topo, apresentar **Importar JSON**, **Adicionar informação** e **Exportar JSON**. Cada seção usa o mesmo painel da biblioteca. Uma experiência cabe em uma linha com cargo, organização, período e ações **Editar** e **Excluir**. A importação abre uma revisão dos dados antes de gravar. A prévia completa abre sob demanda, preservando espaço para editar em telas menores.

## Ordem de implementação

1. Construir um painel, uma linha de registro e um formulário usando uma única folha de estilos.
2. Aplicar os componentes ao ciclo de salvar, reencontrar e editar notas e links.
3. Montar o currículo com os mesmos componentes e verificar a importação, a edição, a exclusão e a exportação de JSON.
4. Acrescentar humor, lembretes, temas e curadoria pessoal conforme a ordem do escopo complementar. Só adicionar uma opção ao menu quando houver um destino utilizável.

## Critérios de aceite visual

- Na primeira visita ao Início, o campo de captura e o botão Salvar são fáceis de localizar.
- Cada registro continua legível com título longo, em tela de celular e ao aumentar o tamanho do texto.
- Cabeçalhos, links, formulários e seleção usam as mesmas regras em Início, Coleções e Currículo.
- Navegar pelo teclado permite localizar o foco, abrir um registro e concluir sua edição.
- O MVP pode ser construído com HTML semântico, CSS compartilhado e os componentes acima. A escolha do framework fica com a implementação.

## Prompt curto para o projeto

> Implemente os fluxos do ESCOPO.md seguindo a direção visual deste documento. Use um portal pessoal dos anos 2000, com perfil lateral inspirado no SpaceHey, links em diretório como no GeoCities e posts datados como em um fórum. Reutilize painéis retangulares, listas compactas, links sublinhados e formulários simples. Comece por salvar, buscar e editar registros e por importar e gerenciar o currículo. No celular, use uma coluna e preserve o acesso à captura rápida.
