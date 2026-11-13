/* Meu Espaço — lista de atualizações.

   Esta é a fonte do popup de novidades e do `docs/ATUALIZACOES.md`.
   A cada mudança no sistema, acrescente um bloco NO TOPO da lista com:

     { versao: '3.5', data: '2026-11-20', titulo: 'Frase curta do que mudou',
       itens: ['uma linha por novidade, do jeito que a pessoa percebe'] }

   O popup abre sozinho quando a versão do topo é mais nova que a última vista
   neste navegador, e pode ser reaberto pelo menu da foto de perfil. */
window.ATUALIZACOES = [
  {
    versao: '4.2',
    data: '2026-11-13',
    titulo: 'Boas-vindas',
    itens: [
      'Boas-vindas para quem chega: cinco passos curtos, com barra de progresso e “Pular” a qualquer hora.',
      'Passo 1 pergunta como você quer ser chamado; o 2 mostra o que cabe em cada área; o 3 troca cor e aparência na hora; o 4 ensina os três atalhos (Ctrl+V, Ctrl+K, Shift+Espaço); o 5 leva ao primeiro registro.',
      'Para rever: menu da foto de perfil → Primeiros passos.',
      'Listinha “Para começar” no Início, com seis coisas para experimentar (nota, tarefa, imagem, link, foto, modo trabalho). Ela risca sozinha, some quando acaba e pode ser dispensada.'
    ]
  },
  {
    versao: '4.1',
    data: '2026-11-13',
    titulo: 'Imagens',
    itens: [
      'Nova área Imagens: uma grade em colunas, estilo Pinterest, com cada imagem na proporção que tem.',
      'Para guardar uma imagem: Ctrl + V cola a que você copiou, arraste um arquivo, escolha do computador ou use um link. Na tela de Imagens, colar guarda na hora.',
      'Grupos de imagens: crie, renomeie e apague grupos, e arraste uma imagem sobre o nome do grupo para movê-la.',
      'Clicar numa imagem abre ela grande, com setas para passar as próximas.',
      'Todo campo de imagem do sistema agora aceita colar, arrastar e link: capa de livro, capa de pasta, foto do produto da wishlist e foto do perfil.',
      'O atalho redondo de adicionar agora existe só dentro do modo trabalho, no canto de baixo à esquerda.',
      'Correção: o menu “⋯” do post-it abria a edição em vez do menu, e por isso não dava para excluir. Agora abre o menu normalmente.'
    ]
  },
  {
    versao: '4.0',
    data: '2026-11-12',
    titulo: 'Modo trabalho',
    itens: [
      'Shift + Espaço abre um quadro de tarefas por cima de tudo, para quando o assunto é só executar. Esc fecha.',
      'A música fica à mão dentro dele, no canto direito, e continua tocando.',
      'Novo atalho redondo no canto de baixo à esquerda: passe o mouse e escolha o que guardar.'
    ]
  },
  {
    versao: '3.9',
    data: '2026-11-12',
    titulo: 'Perfil, conta e acertos de leitura',
    itens: [
      'O humor do dia fica direto no menu da foto: escolha o emoji, escreva a palavra e pronto. O Perfil segue para foto, bio e cores.',
      'O e-mail da conta e o Sair da conta passaram para Configurações, e o atalho do currículo saiu do menu.',
      'As novidades viram uma página por dia, com Mais novo e Mais antigo.',
      'No lembrete, a data desceu para a linha dos botões.',
      'Hover com contraste decente no perfil, nos menus e nas janelas do modo escuro.'
    ]
  },
  {
    versao: '3.8',
    data: '2026-11-12',
    titulo: 'Música como mini app',
    itens: [
      'O disco ao lado do perfil abre um mini app no canto: lista das músicas, tocar, anterior e próxima, guardar música e criar grupos.',
      'Modo MP3: a barra fica na cor do tema, com capa quadrada e o nome do vídeo passando — numa playlist, o nome é o da faixa que está tocando.',
      'Arraste para reordenar as músicas e use grupos para separar o que é de quê.',
      'Playlist do YouTube: continua tocando com um toque, e a setinha abre os vídeos da lista para escolher um.',
      'Fechar guarda o player como um disco flutuando na direita, sem parar a música.',
      'Post-its de volta com cor no modo escuro, e o bloco de guardar com contraste decente no escuro.',
      'Correção no celular: a tela de Links aparecia em três colunas espremidas e o conteúdo escorregava para o lado.'
    ]
  },
  {
    versao: '3.7',
    data: '2026-11-12',
    titulo: 'Músicas, coleções em bento e menus que você arruma',
    itens: [
      'Nova área Músicas: cole um link do YouTube e ouça num quadro no canto, que continua tocando enquanto você navega.',
      'Clicar numa coleção abre uma tela com tudo que está nela, em blocos de tamanhos diferentes.',
      'As áreas do menu da esquerda e os blocos da coluna da direita podem ser arrastados para a ordem que você quiser.',
      'Tarefa ganhou campo de descrição, e tocar numa tarefa da lateral abre a janela dela.',
      'Na lateral o texto manda: datas viraram 12/11 e o progresso virou 1/4.',
      'Post-its com cores mais cheias no modo claro e nota limpa no escuro; hover do modo escuro corrigido.',
      'No Início, "Atividade recente" e o dia agora dividem a mesma linha, e o bloco de guardar está na cor do tema.',
      'Clicar num post-it já abre a nota para editar.',
      'Correção: a janela de editar mostrava um texto abandonado no lugar do que estava salvo. Agora rascunho vale só para post novo.',
      'Correção: as bolinhas da nota em lista estavam recuadas demais.',
      'Disco na barra do topo, ao lado do perfil: atalho para as músicas, que gira enquanto algo toca.',
      'Esconder o vídeo não reinicia mais a música, e a barra minimizada mostra capa quadrada, o nome passando e os controles.',
      'Correção: o menu "…" do cartão de música ficava preso dentro dele.'
    ]
  },
  {
    versao: '3.6',
    data: '2026-11-12',
    titulo: 'Listas',
    itens: [
      'A nota agora tem dois modos: Texto e Lista. Na Lista, cada linha vira um item para marcar, com a conta de quantos já foram.',
      'Em Nova tarefa, colar várias linhas cria uma tarefa por linha, com o mesmo prazo e a mesma coleção.',
      'Marcadores colados como “-”, “•”, “1.” e “[ ]” são removidos sozinhos.'
    ]
  },
  {
    versao: '3.5',
    data: '2026-11-12',
    titulo: 'Tarefas',
    itens: [
      'Nova área Tarefas, com uma linha por tarefa e o círculo que risca na hora.',
      'Três visões da mesma lista: por prazo, em quadro (A fazer, Fazendo, Feito) e por coleção.',
      'Tarefa com prazo cria um lembrete ligado a ela — concluir um risca o outro.',
      'Resumo de tarefas no topo da coluna direita do Início, com o progresso do dia.',
      'As janelas não fecham mais ao clicar fora: só pelo X ou pela tecla Esc.'
    ]
  },
  {
    versao: '3.4',
    data: '2026-11-12',
    titulo: 'Preços conferidos sozinhos',
    itens: [
      'Ao abrir a Wishlist, produtos ainda não comprados lidos há mais de 12 horas são conferidos de novo em segundo plano.',
      'Se o preço cair, entra um lembrete avisando quanto baixou, ligado ao produto.',
      'A Amazon ganhou um leitor próprio: nome, foto, preço e estrelas. Quando a loja bloqueia a leitura, o aviso é claro em vez de um cartão vazio.',
      'Esta janela de novidades, que aparece quando o sistema muda.'
    ]
  },
  {
    versao: '3.3',
    data: '2026-11-12',
    titulo: 'Modo escuro e espaço limpo',
    itens: [
      'Modo claro, escuro ou automático, no menu da foto de perfil.',
      'Um espaço novo começa vazio, com "Meu Nome" e ícone de perfil padrão.'
    ]
  },
  {
    versao: '3.2',
    data: '2026-11-11',
    titulo: 'Sincronização entre aparelhos',
    itens: [
      'O que você guarda no computador aparece no celular, pelo Firestore.',
      'O navegador continua salvando na hora, mesmo sem internet.',
      'A sessão se mantém quando o cookie do site se perde.'
    ]
  },
  {
    versao: '3.1',
    data: '2026-11-11',
    titulo: 'Ajustes de uso',
    itens: [
      'Ações do post numa linha só, por ícone, com Editar dentro do menu "⋯".',
      'Botão para copiar o link, filtro de dia numa linha e links agrupados por site.'
    ]
  },
  {
    versao: '3.0',
    data: '2026-11-11',
    titulo: 'Meu Espaço v3',
    itens: [
      'Visual claro e espaçado, com Mural de post-its, Biblioteca em prateleiras, Estudos com PDF em janelas e Wishlist em vitrine.',
      'Criação pelo tipo primeiro, com formulário progressivo e rascunho guardado.',
      'Login com conta Google e backup em Configurações.'
    ]
  }
];
