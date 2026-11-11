# Meu Espaço — outras features

Complemento ao [escopo principal](https://chatgpt.com/library?file_id=libfile_ed820f435ad0819185d58b0bef310242&account_id=personal). Este documento descreve as interações pessoais previstas para o produto. As regras de exibição e a ordem de entrega são propostas para implementação.

> **Atualização v3:** a barra de criar virou só a pergunta e os tipos; os campos opcionais entram por “+”; nada digitado se perde (rascunho automático); imagens mostram prévia; o backup foi para **Configurações**; o humor tem emoji; o tema aceita cor personalizada; as notas do mural são reordenáveis por arrastar; a foto do perfil é trocada clicando nela. Estudos está em `ESTUDOS.md`.
>
> **Atualização v2:** o perfil foi para a barra do topo, com o menu de configurações. Notas ganharam o **Mural de post-its**, lembretes ganharam um **quadro** e os ícones seguem a regra de ativo e inativo descrita em `DIRECAO_VISUAL_MVP.md`. Biblioteca e Wishlist estão em `BIBLIOTECA_E_WISHLIST.md`.

## 1. O que cabe em cada tela

O Início continua servindo para guardar algo em poucos segundos e consultar o feed. O prazer de voltar vem de reencontrar uma anotação, retomar uma ideia e montar um perfil que tenha a cara de quem usa.

| Lugar | O que aparece | Quando ocupa espaço |
|---|---|---|
| Topo do Início | Uma faixa compacta de lembrete | Somente quando houver algo a lembrar agora. |
| Início | Campo “O que você quer guardar?”, feed e controle “Por dia” | Sempre. A data abre no próprio feed. |
| Início, depois da atividade recente | Um cartão “Do seu arquivo” | Quando houver conteúdo elegível e o recurso estiver ativado. |
| Barra do topo | Avatar, nome e humor do dia, com menu de configurações | Sempre. |
| Perfil | Foto, nome, mini bio, humor, aparência, backup, música e Top 8 | Ao abrir pelo menu do topo. |
| Mural de notas | Post-its num quadro, com campo “Novo post-it” | Ao abrir o Mural. |
| Coleções | Notas, coleções temáticas e itens a organizar | Ao abrir a biblioteca ou escolher uma coleção. |
| Perfil → Aparência | Seletor de cores com prévia | Ao personalizar o espaço. |

No celular, o campo de captura fica visível antes dos cartões de descoberta. O calendário abre ao tocar na data. Lembretes usam uma faixa recolhível. No desktop, os módulos existentes de leitura e wishlist podem usar a coluna lateral. A ausência de conteúdo opcional libera espaço para o feed.

## 2. Perfil pessoal

**Foto e mini bio.** Tocar no avatar abre o Perfil. Em **Editar perfil**, a pessoa escolhe uma imagem local, ajusta o enquadramento, escreve o nome de exibição e uma mini bio. A prévia mostra como o conjunto ficará antes de salvar. A foto pode ser trocada ou removida. Na ausência de foto, o avatar usa as iniciais. A bio aceita texto livre, por exemplo “Designer, colecionando referências de interfaces e discos para ouvir na estrada”. Alterações na bio pessoal são independentes do resumo profissional do currículo.

**Humor do dia.** No Perfil, **Como estou hoje** tem uma paleta de emojis para escolher mais um campo de texto livre, como “focado”. O emoji e a palavra aparecem juntos na barra do topo. Uma palavra acompanha o ícone ou adesivo. O valor é opcional e fica associado à data local. A pessoa pode editar ou apagar o humor de qualquer dia pela visão diária. O perfil mostra o humor registrado para hoje. Ao virar o dia, o anterior continua disponível no histórico.

**Música do perfil.** A pessoa pode destacar uma faixa da coleção Músicas e incluir uma frase sobre a escolha. A reprodução ou abertura da fonte começa ao tocar. Trocar a faixa altera apenas o destaque. A faixa anterior continua na coleção.

## 3. Top 8 da minha fase

Inspirado no espaço de personalização do MySpace. O perfil tem até oito posições que aceitam itens diferentes do arquivo pessoal. Um filme, uma música, uma referência visual e uma nota sobre um projeto podem ficar lado a lado.

- Em **Editar Top 8**, buscar itens existentes, adicionar, remover e reordenar. O perfil mostra apenas as posições preenchidas. Um toque abre o registro original.
- Em **Guardar esta fase**, dar um nome à seleção, como “Novembro de 2026”. Guardar a data, a ordem e os títulos daquele momento. A música do perfil e uma breve anotação podem acompanhar a seleção.
- Fases anteriores ficam em **Perfil → Minhas fases**. Cada uma conserva sua composição quando o Top 8 atual muda. Se o registro original for excluído, informar isso antes da exclusão e permitir remover também sua referência das fases guardadas.
- Favoritar um link, incluí-lo no Top 8 e adicioná-lo a uma coleção são escolhas independentes.

## 4. Coleções com nome e capa

Inspiradas na expressividade das comunidades do Orkut. A pessoa pode criar “Coisas que eu queria ter dirigido” e reunir um filme, um clipe e um desenho. Cada item conserva seu tipo e seus próprios campos.

Em **Coleções**, criar uma coleção com nome, descrição opcional e capa escolhida pelo usuário. Na ficha de qualquer item, **Adicionar à coleção** permite escolher uma ou mais coleções. Dentro da coleção, é possível editar nome e capa, ordenar itens, pesquisar e remover associações. Excluir a coleção desfaz o agrupamento. Os itens continuam acessíveis em suas áreas de origem.

## 5. Mandar pra mim e notas de texto

**Captura rápida.** No PC, escolher o tipo de post e escrever ou colar no campo do Início; o dropdown **Salvar em** define a coleção. No celular, quando houver suporte à integração de compartilhamento, escolher **Compartilhar → Meu Espaço** no navegador ou em outro app. O formulário chega preenchido com o endereço, texto ou anexo recebido, com o tipo já escolhido (endereço → Link, texto → Nota). Uma anotação e uma coleção podem ser acrescentadas antes ou depois de salvar.

**Mural.** As notas aparecem como post-its quase quadrados, que podem ser **reordenados arrastando** (ou por “Mover para o começo” no menu). Cada uma pode ser fixada (alfinete, vai para o começo), favoritada, mudar de cor e abrir a ficha. O primeiro cartão do mural é um post-it em branco para escrever na hora. Um filtro mostra só as notas de uma coleção.

**Notas.** Aceitar texto como conteúdo suficiente. O título é opcional. Quando estiver vazio, a lista usa a primeira linha como identificação. Preservar parágrafos, permitir edição e exclusão e incluir o texto na busca. A nota pode receber comentários, anexos, coleção ou lembrete e aparece em **Coleções → Notas** e no feed com o mesmo identificador.

**Organizar depois.** Salvar sem escolher coleção deve ser uma ação completa. O filtro **A organizar** reúne capturas marcadas para triagem. Na triagem, a pessoa pode atribuir uma coleção, marcar para ler depois ou concluir a organização mantendo o item solto. O registro continua disponível na busca.

## 6. Visão por dia

O botão **Por dia** no cabeçalho do feed abre a data atual. Setas navegam entre dias, **Hoje** retorna à data corrente e tocar na data abre o calendário. Uma marca discreta indica dias com postagens. **Todo o feed** volta à lista cronológica completa.

- **O que entra.** Listar os registros criados na data selecionada, do mais recente para o mais antigo, com horário, tipo e acesso à ficha. Mostrar o humor daquele dia junto à data, quando preenchido.
- **Qual data conta.** Usar a data local da postagem. Um gasto de segunda registrado na terça aparece na terça na visão de postagens. Em Gastos, o cálculo usa a data da despesa. Editar na quarta preserva essas duas datas.
- **Comentários posteriores.** Um comentário feito hoje num link antigo aparece na conversa daquele link. A ficha mantém a data da publicação e o horário de cada resposta.
- **Dia vazio.** Exibir “Nenhum registro neste dia” e manter a navegação entre datas disponível. A opção de registrar o humor continua acessível.

## 7. Lembretes no topo

Criar um lembrete pelo Início ou pela ação **Lembrar depois** em uma nota, link ou item da wishlist. Informar o texto e a data. O horário é opcional. Por exemplo, em uma referência de interface, registrar “Rever este menu antes da reunião”, amanhã às 9h.

| Situação | Comportamento |
|---|---|
| Agendado para o futuro | Disponível na lista de lembretes. A faixa aparece quando chegar o dia e, se informado, o horário. |
| Chegou a hora | Mostrar o texto no topo do Início. Tocar no título abre o registro relacionado ou os detalhes do lembrete avulso. |
| Há vários pendentes | Mostrar o vencimento mais antigo e um acesso “Ver todos (3)”, com a contagem real. |
| Concluir | Retirar da faixa, marcar como concluído e mostrar o próximo pendente. |
| Adiar | Escolher nova data ou hora. O lembrete volta quando vencer. |
| Editar ou excluir | Disponível na lista de lembretes. A ação atua no lembrete e preserva o item relacionado. |

**Quadro de lembretes.** A tela Lembretes organiza os pendentes em quatro colunas: Vencidos, Hoje, Próximos 7 dias e Depois. Cada cartão tem concluir, adiar, editar e excluir. Os concluídos ficam recolhidos abaixo e podem ser reabertos. Um campo no topo cria lembretes avulsos.

O app verifica os vencimentos ao abrir e enquanto estiver em uso. Um lembrete vencido com o app fechado aparece na próxima abertura. A primeira entrega desse recurso prevê avisos dentro do app. Notificações do sistema podem ser decididas junto com a versão para celular.

## 8. Do seu arquivo e comentar de novo

Uma vez por dia, destacar um item anterior ao dia atual com seu título, a data e, de preferência, **o comentário que explica por que foi salvo**. A surpresa vem do próprio acervo. A proposta inicial usa notas, links e mídia e permite ocultar itens específicos da seleção.

O cartão oferece **Abrir**, **Comentar de novo** e **Ver outro**. A seleção permanece ao recarregar a página no mesmo dia. “Ver outro” percorre os candidatos antes de repetir. Se faltar conteúdo, omitir o cartão. A pessoa pode desligá-lo em Aparência.

Exemplo de uso: em novembro, Jack salva um menu com a nota “gostei de trocar de ambiente sem voltar à planta”. Ao reencontrá-lo, acrescenta “testei isso no projeto; funcionou melhor com o andar sempre visível”. A ficha reúne os dois comentários em ordem temporal. Se quiser, ele usa **Registrar no brag document** no comentário, que abre um formulário pré-preenchido com o texto e o vínculo para a fonte.

## 9. Temas de cor e adesivos

Em **Perfil → Aparência**, apresentar amostras identificadas pelo nome, como Lilás, Azul e Verde. Tocar em uma delas mostra a prévia da seleção, dos botões, dos links e do foco de teclado. **Aplicar** salva a escolha. **Restaurar padrão** recupera o lilás das duas telas de referência.

O tema usa as mesmas regras no Início, nas Coleções e no Currículo. A seleção precisa de um indicador além da cor. Verificar legibilidade de texto e ícones em cada combinação. Como detalhe expressivo inspirado no LINE, um pequeno conjunto de adesivos pode acompanhar o humor ou um comentário; sua presença é opcional.

## 10. Persistência e vínculos

Guardar localmente o perfil, o tema, a foto, os humores por data, notas, comentários, coleções, destaques, fases e lembretes. Usar o mesmo ID do registro no feed, nas coleções, no Top 8 e nos lembretes relacionados. Na exclusão de um item, mostrar quais vínculos serão afetados. Um lembrete vinculado poderá ser mantido como lembrete avulso. O JSON do currículo continua dedicado às informações profissionais. Uma cópia integral do espaço pessoal deve incluir a base local e seus anexos.

## 11. Ordem proposta e critérios de aceite

| Entrega | Resultado observável |
|---|---|
| Captura e consulta | Salvar uma nota sem título, encontrá-la pelo texto na visão do dia, editá-la em Notas e ver a edição no feed após reabrir. |
| Lembretes | Agendar um lembrete em um link, fechar o app, voltar após o vencimento, abrir o link pela faixa, adiar e depois concluir. |
| Perfil e aparência | Trocar foto, bio e tema. Registrar humor hoje e reencontrá-lo pela data. Reabrir o app e conferir as preferências. |
| Organização pessoal | Montar uma coleção temática com dois tipos de item, trocar a capa e remover um item do agrupamento. Recuperá-lo na área de origem. |
| Redescoberta | Rever uma nota antiga, acrescentar um comentário datado e localizar os dois momentos ao abrir a ficha. |
| Curadoria de uma fase | Fixar itens no Top 8, destacar uma música, guardar a fase e montar outra seleção. A primeira fase deve continuar consultável. |
| Integração móvel | Compartilhar um link de outro app, salvar na hora e organizá-lo mais tarde. Na etapa de sincronização, verificar que surge uma única vez no PC. |

A captura de notas e a consulta por dia podem acompanhar o feed inicial. Lembretes ocupam o topo apenas quando pedem uma ação. Personalização, redescoberta e curadoria podem entrar em entregas seguintes, após o fluxo principal de links e a gestão do currículo estarem utilizáveis.
