/* Meu Espaço — lista de atualizações.

   Esta é a fonte do popup de novidades e do `docs/ATUALIZACOES.md`.
   A cada mudança no sistema, acrescente um bloco NO TOPO da lista com:

     { versao: '3.5', data: '2026-11-20', titulo: 'Frase curta do que mudou',
       itens: ['uma linha por novidade, do jeito que a pessoa percebe'] }

   O popup abre sozinho quando a versão do topo é mais nova que a última vista
   neste navegador, e pode ser reaberto pelo menu da foto de perfil. */
window.ATUALIZACOES = [
  {
    versao: '5.15',
    data: '2026-11-13',
    titulo: 'Refinamento visual do Início',
    itens: [
      'Correção: nas coleções (ex.: A organizar), o card de Tarefas não fica mais coberto pelo card de baixo.',
      'Início mais leve: o bloco “O que você quer guardar?” virou um card claro com 5 atalhos (Nota, Link, Tarefa, Imagem, Lembrete) e um botão Mais para os outros tipos.',
      'Hierarquia de textos: menu e rótulos em peso regular/médio; negrito só em títulos de card, de widget e números. Cinzas secundários ajustados para contraste mínimo 4.5:1 nos modos claro e escuro.',
      'Botões Banho e Pets do pet viraram chips escuros translúcidos; o botão de música ao lado do perfil ganhou descrição ao passar o mouse.',
      'Widgets da direita com o mesmo link “ver todas”; Tarefas mostra também as concluídas (riscadas) e “+N” quando há mais, batendo com o contador.',
      'Card de filme/livro mostra um resumo curto (2 linhas) ao lado da capa; ícones de ação dos cards ficam calmos e ganham a cor do tema ao passar o mouse; “A organizar” tem o contador em destaque, como caixa de entrada.'
    ]
  },
  {
    versao: '5.14',
    data: '2026-11-13',
    titulo: 'Tyba, selecionar em lote, encaixe de cards e mais',
    itens: [
      'As confirmações (excluir, sair, descartar etc.) agora são cartões bonitos do próprio app, no estilo do onboarding, em vez das caixas do navegador; “Mover para coleção” também virou uma janela do app.',
      'Início: a linha do feed ficou só com “Hoje” à esquerda (abre o por dia) e Selecionar à direita; sumiram “Atividade recente” e “Por dia”.',
      'O rodapé saiu do site; o estado da sincronização e os créditos ficam só em Configurações.',
      'Início: o Selecionar foi para a mesma linha de “Atividade recente” (e do seletor de dia). A barra lateral esquerda fica fixa e sempre inteira na tela, sem rolagem: o espaçamento encolhe conforme a altura da janela.',
      'O sistema agora se chama Tyba: o logo (que muda com a cor do tema, claro e escuro) aparece no topo e na tela de entrada no lugar do nome, e o título da aba e o nome do aplicativo instalado também mudaram.',
      'Modo escuro: o aviso “Há uma versão nova” e o menu de texto selecionado agora têm contraste legível (antes ficavam claro sobre claro).',
      'A previsão do tempo ficou compacta (cidade, temperatura e máx/mín) e abre os detalhes e os próximos dias ao clicar.',
      'Os cards se encaixam nos vãos no Mural, Links, Wishlist e nas coleções: um card baixo deixa o seguinte subir para ocupar o espaço vazio, também ao arrastar.',
      'Ao lado do perfil, saiu o botão do modo trabalho (continua em Shift + Espaço) e o disco de música virou o ícone do YouTube Music, que acende com a cor do tema quando algo está tocando.',
      'O ícone de Músicas agora é o do YouTube Music (círculo com anel e play), na cor do tema, no menu, nos títulos e no cadastro de tipos.',
      'Mercado Livre com foto e preço automáticos: crie um app grátis em developers.mercadolivre.com.br e ponha ML_CLIENT_ID e ML_CLIENT_SECRET no config.local.json (ou nas variáveis do Vercel). Passo a passo em docs/BIBLIOTECA_E_WISHLIST.md.',
      'Selecionar em lote: o botão Selecionar (Início, Mural, Biblioteca, Links, Wishlist, coleções) deixa marcar vários cards de uma vez e então mover para uma coleção, marcar como comprado (Wishlist) ou excluir tudo junto.',
      'Os três pontinhos de todos os menus agora ficam com o ícone no centro do círculo, sem o círculo cortado no canto do card.',
      'Mercado Livre: quando a loja barra a leitura, o nome sai do endereço e a foto e o preço vêm da API pública deles; o título genérico “Mercado Libre” não vira mais nome.',
      'Shopee e Mercado Livre não dão mais erro quando a página é recusada: o card sai com o que o link traz. Use o botão de recapturar nos cards antigos.'
    ]
  },
  {
    versao: '5.13',
    data: '2026-11-13',
    titulo: 'Colar link cria o card e Shopee',
    itens: [
      'Ctrl+V de um endereço nas páginas Wishlist e Links cria o card na hora (vários endereços de uma vez também, um por linha), já buscando a prévia.',
      'Shopee: a loja bloqueia a leitura e o card ficava com “Oops! Seu navegador não é mais aceito!”. Agora o nome e a foto saem do próprio link, e o preço é buscado quando a Shopee deixar. Títulos de página de bloqueio nunca mais viram nome de produto.'
    ]
  },
  {
    versao: '5.12',
    data: '2026-11-13',
    titulo: 'Arrastar sem piscar',
    itens: [
      'Arrastar post-its e itens ficou mais estável: a troca de lugar só acontece depois que a anterior assenta e quando o ponteiro sai da vaga, o que evita os cards ficarem sobrepostos e piscando.',
      'Enquanto você arrasta, a tela não é redesenhada por nada em segundo plano (sincronização, carregamentos); ela só atualiza quando você solta.'
    ]
  },
  {
    versao: '5.11',
    data: '2026-11-13',
    titulo: 'Comentários maiores e playlist em foco',
    itens: [
      'Comentários: o campo para escrever ficou maior e cresce conforme você digita. Enter envia e Shift+Enter quebra a linha; as quebras aparecem no comentário.',
      'Mini app de música: ao clicar numa playlist, ela vira a tela principal com todos os vídeos dela e um botão Listas para voltar às outras.'
    ]
  },
  {
    versao: '5.10',
    data: '2026-11-13',
    titulo: 'Playlists no mini app',
    itens: [
      'No mini app de música, a lista agora rola de verdade: antes, ao abrir uma playlist com muitos vídeos, só os primeiros apareciam e o resto ficava cortado.',
      'Ao abrir uma playlist, ela sobe para o topo da lista para você ver os vídeos dela, e o mini app ficou um pouco mais alto.'
    ]
  },
  {
    versao: '5.9',
    data: '2026-11-13',
    titulo: 'Currículo base limpo',
    itens: [
      'O modelo base do currículo que acompanhava o projeto foi esvaziado: nenhum dado pessoal vem mais pronto, só a estrutura em branco para quem for importar o seu.'
    ]
  },
  {
    versao: '5.8',
    data: '2026-11-13',
    titulo: 'Adicionar abre só no símbolo',
    itens: [
      'No modo trabalho, a lista de itens do botão de adicionar agora só abre ao passar o mouse sobre o símbolo de mais (antes abria também ao passar perto dele). No celular, abre com um toque.'
    ]
  },
  {
    versao: '5.7',
    data: '2026-11-13',
    titulo: 'Balão do pet mais legível',
    itens: [
      'As falas do pet ficam bem mais tempo no balão (de 7 a 14 segundos, conforme o tamanho), e dá para clicar no balão para fazê-lo sumir.',
      'O balão tem no máximo três palavras por linha, e o cenário ficou um pouco mais alto para caber.'
    ]
  },
  {
    versao: '5.6',
    data: '2026-11-13',
    titulo: 'Escolha de pets em popup',
    itens: [
      'A escolha do pet agora abre como um popup no centro do cenário, com um card para cada pet (salsicha, pinscher, frajola e shollie), em vez de ficar escondida numa engrenagem.',
      'O botão do cenário agora se chama Pets, para ficar fácil de achar. Som, conversa e esconder ficam no mesmo popup.'
    ]
  },
  {
    versao: '5.5',
    data: '2026-11-13',
    titulo: 'O pet conversa com você',
    itens: [
      'O pet agora conversa com você, só com a janela visível: comenta o que você guardou (notas, imagens, links, livros, filmes, músicas), tarefas feitas, lembretes e tarefas para hoje ou atrasados, o tempo e o dia da semana.',
      'Ele também elogia, diz que gosta de você, que sentiu sua falta quando você volta depois de um tempo e que está ansioso pelo fim de semana.',
      'As frases ficam numa biblioteca própria, fácil de ampliar. Dá para desligar a conversa na engrenagem do cenário.',
      'Novo pet para escolher: o shollie.'
    ]
  },
  {
    versao: '5.4',
    data: '2026-11-13',
    titulo: 'Previsão do tempo',
    itens: [
      'A coluna da direita do Início ganhou a previsão do tempo: temperatura agora, máxima e mínima, sensação, chance de chuva, vento e os próximos 5 dias.',
      'Escolha a cidade pelo nome ou pela localização do aparelho; dá para trocar e atualizar a qualquer hora. Ela avisa quando convém levar guarda-chuva ou casaco.',
      'O bloco do tempo pode ser arrastado como os outros da coluna.'
    ]
  },
  {
    versao: '5.3',
    data: '2026-11-13',
    titulo: 'Marcar como lido ou assistido',
    itens: [
      'Na Biblioteca, cada livro e filme ganhou um botão para marcar como lido ou assistido (e desmarcar), direto na capa.',
      'Também dá para excluir pela capa ou pela página do item, com confirmação antes.'
    ]
  },
  {
    versao: '5.2',
    data: '2026-11-13',
    titulo: 'Ajustes nas vasilhas e no banho',
    itens: [
      'As vasilhas de comida e de água esvaziam a cada 5 minutos; encher agora mostra a ração e a água caindo, e o nível desce enquanto ele come.',
      'O botão Brincar saiu: para brincar, clique no chão e jogue a bolinha.',
      'Dar banho agora interrompe a brincadeira.',
      'A plaquinha do nome da casinha não muda mais de cor de forma estranha ao passar o mouse.'
    ]
  },
  {
    versao: '5.1',
    data: '2026-11-13',
    titulo: 'Três pets, bolinha e vasilhas',
    itens: [
      'Agora são três pets para escolher: salsicha, pinscher e gato frajola. Troque pela engrenagem dentro do cenário; cada um tem a sua voz.',
      'Novo botão Brincar: ele corre atrás de uma bolinha, chutando de um lado para o outro.',
      'Clicar no chão agora joga a bolinha naquele ponto, e ele vai brincar. O botão Comida saiu.',
      'Duas vasilhas, de comida e de água: o nível desce com as horas e você enche clicando nelas. Ele vai comer e beber sozinho, e avisa quando está com fome ou sede.',
      'Os botões do cenário ficaram mais legíveis ao passar o mouse.'
    ]
  },
  {
    versao: '5.0',
    data: '2026-11-13',
    titulo: 'Cuidados com o cachorrinho',
    itens: [
      'O cenário do cachorrinho agora acompanha a hora do seu aparelho, em cinco fases: amanhecer, manhã, tarde, entardecer e noite, cada uma com céu, chão, morros, nuvens e sol ou lua próprios.',
      'Depois de comer, ele faz cocô. O cocô fica no chão (com moscas) até você clicar nele para limpar.',
      'A casinha ganhou uma plaquinha: clique nela para escolher o nome do cachorrinho.',
      'Novos botões no cenário: Comida (derruba duas porções) e Banho (ele vai ao meio, ensaboa com bolhas e se sacode).'
    ]
  },
  {
    versao: '4.9',
    data: '2026-11-13',
    titulo: 'Tarefas com descrição e comentários',
    itens: [
      'Clicar numa tarefa (no card todo, não só no título) abre a janela dela, com descrição, situação, prazo e comentários, tanto na tela Tarefas quanto no modo trabalho.',
      'Dá para comentar direto na janela da tarefa, e o card mostra quantos comentários ela tem.'
    ]
  },
  {
    versao: '4.8',
    data: '2026-11-13',
    titulo: 'Um cachorrinho no Início',
    itens: [
      'Um cachorrinho em pixel art mora no alto do Início, num cenário com árvore, casinha, morros e nuvens (de noite, com lua e estrelas no tema escuro). Ele fica parado e, de vez em quando, senta.',
      'Clique nele e ele late (balão “AU! AU!” e som). Clique no chão e cai comidinha: ele vai andando até ela, abaixa e come.',
      'O botão de som no cenário silencia o latido. Em Configurações → Cachorrinho dá para esconder o pet.'
    ]
  },
  {
    versao: '4.7',
    data: '2026-11-13',
    titulo: 'Visualização, arrastar com a mão, playlists e Mercado Livre',
    itens: [
      'Clicar numa nota ou num cartão (livro, desejo, música, gasto…) abre uma visualização para ler, sem entrar na edição. Lá ficam Editar e Abrir página.',
      'Arrastar ficou mais natural: o item fica na sua mão, segue o ponteiro (um pouco inclinado) e os outros abrem espaço na hora, sem o contorno pontilhado. Vale para post-its do Mural, faixas do mini app, áreas do menu e blocos da direita. No celular, segure um instante para pegar; Esc cancela.',
      'No modo trabalho, o botão Adicionar fica no canto de baixo e as opções sobem a partir dele.',
      'A lista de vídeos de uma playlist agora aparece também na tela Músicas (botão ao lado do play) e mostra “Tentar de novo” quando a leitura falha. A leitura entende o novo formato de páginas do YouTube e usa o feed da lista como reserva.',
      'Captura de links do Mercado Livre mais completa: segue links curtos e páginas de compartilhar até o produto, lê nome, foto e preço do próprio HTML e tenta de novo como o WhatsApp faz quando a loja devolve pouco.'
    ]
  },
  {
    versao: '4.6',
    data: '2026-11-13',
    titulo: 'Aplicativo instalável (PWA)',
    itens: [
      'O Meu Espaço agora é um aplicativo instalável: no menu da foto (ou em Configurações → Aplicativo) há “Instalar o app”, e ele abre em janela própria, com ícone na tela inicial. No iPhone, o botão mostra o passo a passo do Safari.',
      'Funciona sem internet: depois da primeira visita, o app abre offline e o que você guardar fica salvo e sincroniza quando a conexão voltar.',
      'Atalhos no ícone do app: Nova nota, Nova tarefa, Guardar imagem, Guardar link e Modo trabalho.',
      'Receba compartilhamentos: no Android/Chrome, compartilhar uma página ou texto de outro app para o Meu Espaço abre o formulário de link ou nota já preenchido.',
      'Aviso “Há uma versão nova” com botão Atualizar, e aviso discreto quando você está sem conexão.',
      'A barra do sistema acompanha a cor do tema, e os botões flutuantes respeitam a área segura de celulares com notch.'
    ]
  },
  {
    versao: '4.5',
    data: '2026-11-13',
    titulo: 'Notas soltas na coleção',
    itens: [
      'Na tela de uma coleção, cada nota agora é um post-it próprio, do mesmo tamanho do Mural, em vez de ficar agrupada num cartão “Notas” com tamanhos estranhos. Clicar abre a edição.',
      'As colunas da coleção ficaram mais estreitas (mais blocos por linha).'
    ]
  },
  {
    versao: '4.4',
    data: '2026-11-13',
    titulo: 'Seu emoji do dia',
    itens: [
      'No menu da foto, o humor do dia mostra os 4 últimos emojis que você usou, para repetir com um toque.',
      'Ao lado deles há um campo para escolher qualquer emoji: digite, cole ou abra o teclado de emojis (no Windows, tecla Windows + ponto).'
    ]
  },
  {
    versao: '4.3',
    data: '2026-11-13',
    titulo: 'Menu do perfil no celular',
    itens: [
      'Correção no celular: o humor do dia, no menu da foto, aparecia como uma coluna gigante de emojis com o campo espremido. Agora os emojis ficam em linha, o botão de salvar tem cor e o menu rola se a tela for baixa.'
    ]
  },
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
