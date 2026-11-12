/* Meu Espaço — lista de atualizações.

   Esta é a fonte do popup de novidades e do `docs/ATUALIZACOES.md`.
   A cada mudança no sistema, acrescente um bloco NO TOPO da lista com:

     { versao: '3.5', data: '2026-11-20', titulo: 'Frase curta do que mudou',
       itens: ['uma linha por novidade, do jeito que a pessoa percebe'] }

   O popup abre sozinho quando a versão do topo é mais nova que a última vista
   neste navegador, e pode ser reaberto pelo menu da foto de perfil. */
window.ATUALIZACOES = [
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
      'Clicar num post-it já abre a nota para editar.'
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
