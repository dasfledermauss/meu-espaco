# Meu Espaço · prompt para construir o wireframe interativo

**Status:** o protótipo já foi implementado na raiz do projeto (`index.html`) e evoluiu para a v2 (colunas, módulos temáticos, ícones Iconoir). Para o estado atual, valem `ESCOPO.md`, `DIRECAO_VISUAL_MVP.md` e `BIBLIOTECA_E_WISHLIST.md`. Este arquivo fica como especificação de referência. Os caminhos abaixo seguem a organização atual da pasta.

## Pedido de implementação

Construa uma versão navegável do **Meu Espaço**, meu portal pessoal privado. Quero abrir a página, ver meu perfil, guardar uma nota ou link rapidamente, reencontrar o item por data ou coleção e administrar meu currículo. Use meus arquivos para que eu possa experimentar a interface com conteúdo que reconheço. Entregue o protótipo funcionando e explique como abri-lo no Windows.

### 1. Leia a pasta antes de implementar

| Arquivo | Como usar |
|---|---|
| `docs/ESCOPO.md` | Mecânica do feed, áreas permanentes, currículo, importação e critérios de aceite. |
| `docs/OUTRAS_FEATURES.md` | Perfil, humor, visão por dia, lembretes, coleções pessoais e redescoberta. |
| `docs/DIRECAO_VISUAL_MVP.md` | Direção visual vigente. Use a organização funcional das telas anteriores com a aparência de portal retrô deste documento. |
| `data/curriculo.json` | Modelo em branco do currículo (só a estrutura), para o importador. Inspecione as chaves, níveis, textos, datas e listas presentes. |
| `data/links-pessoal.json` | Conteúdo inicial da coleção **Pessoal**. |
| `data/links-trabalho.json` | Conteúdo inicial da coleção **Trabalho**. |
| `assets/img/foto-perfil.jpg` | Foto inicial do perfil. Use o arquivo local, com recorte proporcional. |

Preserve os arquivos de entrada. O formato v1 descrito no escopo orienta a exportação; o adaptador de entrada deve aceitar também a estrutura encontrada nos exemplos. Preserve títulos, descrições, ordem, precisão das datas e campos adicionais. Represente informações ausentes como opcionais. Quando um item de exemplo vier sem data de postagem, mostre-o na coleção como importado. Se aparecer no feed, indique a data de importação.

### 2. Estruture a entrega

Implemente um protótipo local leve, preferencialmente com HTML, CSS e JavaScript. Use uma única fonte de dados para alimentar todas as telas. Para esta etapa, a persistência no navegador é suficiente. Carregue os exemplos na primeira abertura e mantenha as edições depois de recarregar. Excluir o último item de uma coleção também é um estado válido e deve persistir. Se a leitura dos arquivos exigir um servidor local, inclua o comando de inicialização e o endereço a abrir. Priorize os fluxos abaixo antes de acrescentar módulos.

### 3. Faça estes percursos funcionarem de ponta a ponta

**Início → tipo → destino → coleção.** No desktop, mostre perfil e navegação à esquerda e, no centro, “O que você quer guardar?”. Primeiro a pessoa escolhe o tipo de post (Nota, Link, Gasto, Lembrete); os campos e o destino padrão mudam conforme o tipo. Depois o dropdown **Salvar em** mostra Pessoal, Trabalho, as demais coleções, “Sem coleção” e “+ Nova coleção…”. Links podem ser marcados como “Ler mais tarde”. Após salvar, mostre a postagem no feed. Abrir, editar ou excluir o mesmo item por outra tela deve produzir o mesmo resultado em todas as visualizações.

**Coleções → encontrar → agir.** Crie uma biblioteca navegável a partir dos dois JSONs de links. Ofereça busca por título, endereço e comentário, seleção de coleção e filtros de favoritos e leitura. Cada linha deve permitir abrir a fonte, ver a ficha, editar e favoritar. Marcar como lido retira o item da fila de leitura. Um link presente nos dois arquivos pode pertencer a Pessoal e Trabalho. Preserve as anotações que vierem de cada fonte. Remover o vínculo com uma coleção mantém o registro disponível no arquivo.

**Feed → por dia → ficha.** Agrupe postagens por data local. Inclua calendário, dia anterior, próximo dia, Hoje e retorno ao feed inteiro. Abrir uma postagem permite comentar novamente e ver o histórico. A edição de uma nota mantém a data original. Um dia vazio mostra uma mensagem curta e permite continuar navegando.

**Currículo → importar → revisar → editar → exportar.** Abra a tela com as informações do arquivo de exemplo e apresente as seções realmente encontradas. Ofereça inclusão, edição e exclusão por item e uma prévia do documento. O botão Importar aceita um arquivo escolhido pelo usuário, valida o JSON e apresenta novos itens, coincidências e diferenças antes de gravar. Use IDs estáveis e as regras de correspondência do escopo. Se houver ambiguidade, mostre as alternativas. Cancelar ou importar um arquivo inválido preserva os dados atuais. Exportar baixa um JSON que pode ser reimportado sem duplicação. Não invente datas, instituições, competências ou descrições.

**Perfil → personalizar → voltar.** Exiba a foto fornecida. Permita editar nome e mini bio, trocar a foto, registrar o humor de hoje e escolher a cor do tema. Ao voltar ao Início, reflita as mudanças. A apresentação pessoal e o resumo profissional do currículo têm edições independentes.

**Nota ou link → lembrar depois → topo do Início.** Crie um lembrete com data e horário opcional. Mostre uma faixa quando estiver no prazo ou vencido, com acesso à origem e ações de concluir ou adiar. Se houver vários, mostre um e permita consultar a lista. Verifique os pendentes ao reabrir o protótipo.

### 4. Preserve espaço para a evolução

- **Do seu arquivo:** com itens antigos elegíveis, mostre um cartão discreto abaixo da atividade recente e permita comentar no registro original.
- **Top 8, música e fases:** pertencem ao Perfil. Coleções temáticas aceitam tipos mistos. Essas extensões podem entrar depois dos fluxos acima.
- **Filmes, livros, músicas, wishlist e gastos:** áreas previstas no escopo. Ao implementar uma delas, ofereça lista, inclusão, edição e retorno ao feed. Mostre no menu apenas destinos utilizáveis.
- **Sem IA:** o direcionamento é feito pela pessoa (tipo de post + dropdown de destino). Para currículo e brag document, os tipos Aprendizado e Conquista terão caixas manuais “Adicionar também ao currículo” e “Registrar no brag document”, com formulário pré-preenchido e vínculo para a postagem. Login, sincronização entre dispositivos e banco SQLite ficam para a evolução do produto.

### 5. Aplique o visual retrô

Use perfil lateral inspirado no SpaceHey, coleções em listas de diretório como no GeoCities e posts datados como em um fórum. Reaproveite um painel com borda fina e cabeçalho azul, uma linha de registro e um formulário. Use fonte do sistema, links sublinhados, botões reconhecíveis e ícones Material em SVG quando necessários. Reserve o destaque amarelo para lembretes. Em celular, use uma coluna com navegação recolhível e captura no topo. Inclua foco visível, rótulos de formulário e confirmação que identifique o item ao excluir. Use textos em português do Brasil.

### 6. Confira antes de entregar

- Abrir pela primeira vez exibe a foto, as duas coleções e o currículo provenientes dos arquivos locais.
- Salvar um link com comentário, encontrá-lo pela busca, editá-lo na coleção e conferir a mudança no feed após recarregar.
- Favoritar um link, marcar como lido e verificar que permanece favorito. Removê-lo de uma coleção preserva a ficha.
- Criar uma nota, vê-la no dia correto, comentar e localizar o registro após reabrir.
- Importar o currículo duas vezes, cancelar uma alteração, excluir um curso e reimportar a exportação. Conferir contagem, textos, datas e ausência de duplicatas.
- Reabrir com um lembrete vencido, adiar e concluir. Conferir que a faixa acompanha o estado.
- Verificar navegação por teclado e em largura de celular. Conferir se a captura, a importação e a edição continuam acessíveis.

Ao terminar, informe o ponto de entrada, os passos para abrir, quais fluxos estão implementados e qualquer limitação observada com os arquivos reais.
