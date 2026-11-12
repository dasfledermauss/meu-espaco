/* Meu Espaço — lista de atualizações.

   Esta é a fonte do popup de novidades e do `docs/ATUALIZACOES.md`.
   A cada mudança no sistema, acrescente um bloco NO TOPO da lista com:

     { versao: '3.5', data: '2026-11-20', titulo: 'Frase curta do que mudou',
       itens: ['uma linha por novidade, do jeito que a pessoa percebe'] }

   O popup abre sozinho quando a versão do topo é mais nova que a última vista
   neste navegador, e pode ser reaberto pelo menu da foto de perfil. */
window.ATUALIZACOES = [
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
