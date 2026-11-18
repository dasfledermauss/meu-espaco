# Atualizações

Histórico do que mudou no Meu Espaço, do mais novo para o mais antigo.

**Regra do projeto:** toda mudança no sistema entra aqui **e** em `assets/js/atualizacoes.js`, no mesmo texto. O arquivo JS é o que alimenta o popup "O que há de novo", que abre sozinho quando a versão do topo é mais nova que a última vista no navegador. Quem quiser rever depois usa **O que há de novo**, no menu da foto de perfil.

Como escrever: uma linha por novidade, do jeito que a pessoa percebe na tela — não o nome da função que mudou.

---

## 5.81 — 18/11/2026 · Radar de palavras-chave e Imagens no Mural

- **Radar** (aba da Biblioteca): alertas por palavra-chave, como o Google Alerts. Busca Google Notícias, Bing Notícias e, se marcado, repositórios do GitHub; de hora em hora enquanto o Tyba está aberto, e ao abrir. A primeira busca só forma a base; depois aparece só o que é novo, com contagem na aba. Guardar em Links, dispensar, pausar, remover. Ver `docs/RADAR.md`.
- **Imagens** passou a ser aba do **Mural** (Notas · Imagens). Saiu das abas da Biblioteca; o endereço `#/imagens` continua igual.
- Servidor: `GET /api/radar` em `servidor.py` e `api/radar.js` (mesma lógica, com testes nos dois).

## 5.80 — 18/11/2026 · Correios: enviar da Wishlist e do Mural

- "Enviar pelo Correios" no menu ⋯ dos produtos da Wishlist (vitrine e comprados) e das notas do Mural.

## 5.79 — 17/11/2026 · Correios: envio direto pela API do Firebase

- Enviar a carta usa a API REST do Firestore (PATCH com o token do login), não mais a fila de escrita do SDK. Erros aparecem com o código HTTP e a mensagem do Firebase.

## 5.78 — 17/11/2026 · Correios: envio com mais tempo e sem duplicar

- O envio espera até 30 s e mostra o motivo se falhar. Reenviar o mesmo item para a mesma pessoa reaproveita o id da carta, então não duplica se a primeira tentativa tiver chegado.

## 5.77 — 17/11/2026 · Correios: escrita não fica mais presa entre janelas

- O Firestore passa a usar cache só em memória (antes: em disco, compartilhado entre abas). Com o app instalado e o navegador abertos juntos, a escrita podia ficar esperando a outra janela ("tempo-esgotado"). Os dados continuam no navegador e são reenviados pelo ciclo de sincronização.

## 5.76 — 17/11/2026 · Correios com feedback em cada etapa

- O código mostra "registrando…" ou "não registrado" (com o motivo); "Procurando…" ao adicionar amigo; só tenta outro código quando o Firebase recusa, não quando falta rede.

## 5.75 — 17/11/2026 · Conexão com o Firebase mais resistente

- O Firestore passa a detectar bloqueio do canal de tempo real (rede, extensão, proxy) e usa long polling. Corrige escritas penduradas ("tempo esgotado" no Correios).

## 5.74 — 17/11/2026 · Correios mostra o motivo quando falha

- O aviso de falha do Correios mostra o motivo do Firebase (ex.: `permission-denied`), e as chamadas desistem em 10 s em vez de ficarem penduradas.

## 5.73 — 17/11/2026 · Correios: amigos por código

- Cada conta tem um **código de amigo** (ex.: `ABC-123`), mostrado na página Correios. Você adiciona o código de um amigo uma vez e ele passa a aparecer na sua lista de envio. A lista automática de "quem abriu o Tyba" saiu.
- Quem recebe uma carta de alguém que não é amigo vê o botão "Adicionar … aos amigos".
- **Passo manual:** publicar de novo o `firestore.rules` (trocou `membros` por `codigos`).

## 5.72 — 17/11/2026 · Correios: cadastro mais confiável

- O cadastro (que faz os outros te verem na lista) é refeito ao abrir o Correios e a janela de envio, com aviso se falhar.

## 5.71 — 17/11/2026 · Correios mostra que está enviando

- Ao clicar em Enviar, o botão vira "Enviando…"; ao terminar, aviso "enviado para [nome]". Se falhar ou faltar escolher a pessoa, o app avisa.

## 5.70 — 17/11/2026 · Botão Enviar do Correios fica apagado sem destinatário

- Sem ninguém na lista, o botão Enviar aparece apagado (antes parecia ativo e não fazia nada).

## 5.69 — 17/11/2026 · Correios avisa quando não consegue ler a lista

- Na janela de envio, se o Firebase recusar a leitura da lista de pessoas (quase sempre regras não publicadas), o aviso explica isso. Se a lista só está sem outras pessoas, o texto diz que só você aparece.

## 5.68 — 17/11/2026 · Correios: mande itens para outra pessoa

- Novo lugar no menu, **Correios**. Pelo menu ⋯ de um item (ou pelo modo Selecionar, para vários), "Enviar pelo Correios" abre a lista de quem usa o Tyba, com um bilhete opcional.
- Quem recebe vê a carta na **Caixa de entrada**, com selo no menu. **Salvar** copia o item para a mesma seção do Tyba dela; **Dispensar** apaga a carta.
- Vale para link, livro/filme, artigo, imagem, nota, música e desejo. Comentários, favorito, coleção e histórico de preço não viajam.
- **Passo manual:** publicar de novo o `firestore.rules` no Firebase (ver `docs/CORREIOS.md`).

## 5.67 — 17/11/2026 · Texto da Agenda não escapa mais do cartão

- Títulos longos no painel do dia da Agenda agora quebram linha dentro do cartão em vez de vazar. A causa era o `white-space: nowrap` global dos botões, que anulava a quebra.

## 5.66 — 17/11/2026 · Ícone na contagem regressiva

- A contagem regressiva do Início ("12 dias para…") ganhou um ícone de calendário com check à esquerda, num bloco de 40 px na cor principal. O título longo agora quebra linha (antes vazava do cartão).

## 5.65 — 17/11/2026 · Contorno nos lembretes vencidos

- O cartão de lembrete vencido e a faixa do Início ganharam um contorno de 1 px na cor principal (45% de opacidade), feito com sombra interna para não mudar o tamanho da caixa.

## 5.64 — 17/11/2026 · Lembretes na cor principal

- Lembrete vencido (cartão e faixa do Início), etiqueta e barrinha de lembrete na Agenda, ponto da lista do Início e contador da coluna Vencidos usam a cor principal (`--marca`) em vez do amarelo. Contraste medido em teste: 15:1 (claro) e 12:1 (escuro) nos blocos claros; 5,5:1 na etiqueta sólida da Agenda. O amarelo continua só para tarefas atrasadas.

## 5.63 — 16/11/2026 · Preço da Amazon corrigido também no site publicado

- A correção da v5.60 estava só no `servidor.py` (computador). O site publicado usa `api/capturar.js` (Vercel), que tinha o mesmo defeito. Agora os dois leem inteiro e centavos do bloco de preço e ignoram o JSON em centavos na Amazon. Teste novo: `tests/capturar_js_teste.mjs`.

## 5.62 — 16/11/2026 · Bastidores: tempo, captura e novidades em arquivos próprios

- Previsão do tempo (`clima.js`), captura de links e produtos (`captura.js`) e popup de novidades (`novidades.js`) saíram do `app.js`, que passou de ~4900 para ~3400 linhas. Nada muda na tela. Fecha o plano de divisão (ver `docs/ARQUITETURA.md`).

## 5.61 — 16/11/2026 · Repositório sem dados pessoais

- Foto de perfil, currículo e links pessoais antigos, capturas de tela do histórico e e-mail foram apagados do código **e de todo o histórico do Git** (que foi reescrito). Nomes de pessoas nos exemplos de teste foram trocados por genéricos. O `.gitignore` agora barra `data/links-*.json` (menos o exemplo), `foto-perfil.*` e as capturas de `docs/historico`.
- O app não muda: os dados ficam no navegador e na conta do usuário.

## 5.60 — 16/11/2026 · Preço da Amazon sem a vírgula errada

- Livros da Amazon apareciam com o preço cem vezes maior (R$ 20,60 virava R$ 2.060,00): na falta de outro dado, a captura pegava um valor em centavos do JSON da página. Agora lê inteiro e centavos do bloco de preço e ignora o JSON em centavos na Amazon. Desejos já guardados com o valor errado se corrigem ao recapturar.

## 5.59 — 16/11/2026 · Fim do loop na captura de links que falham

- Quando uma loja bloqueia a captura (como a Centauro), o desejo fica marcado como falho e o Tyba só tenta de novo depois de 12 horas, em vez de repetir sem parar. O botão de recapturar continua funcionando na hora. Antes, o item que falhava nunca ganhava data de captura e a conferência da Wishlist o pegava a cada redesenho da tela (12 tentativas em 5 s no teste).
- Bastidores: o código de arrastar e reordenar saiu do arquivo principal para `assets/js/arrastar.js`. Nada muda na tela.

## 5.58 — 16/11/2026 · Bastidores: conta e sincronização em arquivo próprio

- O código da conta Google e da sincronização com a nuvem (a parte que roda no app) saiu do arquivo principal para `assets/js/conta.js`. O acesso ao Firestore continua em `assets/js/nuvem.js`. Nada muda na tela.

## 5.57 — 16/11/2026 · Bastidores: músicas em arquivo próprio

- O código das músicas (lista, ambiente) e do mini player saiu do arquivo principal para `assets/js/musica.js`. Nada muda na tela.

## 5.56 — 16/11/2026 · Bastidores: currículo em arquivo próprio

- O código do currículo (importação e tela) saiu do arquivo principal para `assets/js/curriculo.js`. Nada muda na tela. A arquitetura está em `docs/ARQUITETURA.md`.

## 5.55 — 16/11/2026 · Bastidores: pet em arquivo próprio

- O código do pet saiu do arquivo principal para `assets/js/pet.js`. Nada muda na tela.

## 5.54 — 16/11/2026 · Jack Russell do tamanho dos outros

- O Jack Russell agora tem o mesmo tamanho do Schnauzer.

## 5.53 — 16/11/2026 · Novo pet: Jack Russell

- O Jack Russell entrou na lista de pets (botão Pets do cenário): parado, sentado, andando e abaixado, como os outros.

## 5.52 — 16/11/2026 · Reordenar tarefas arrastando

- Arraste uma tarefa para qualquer posição, na mesma coluna ou em outra: os cartões deslizam para abrir o espaço onde ela vai entrar, e a ordem fica salva.
- No celular, arrastar até a aba coloca a tarefa no topo da coluna.

## 5.51 — 16/11/2026 · Pets: bolinha mais calma e com botão para desligar

- Atrás da bolinha, o cachorrinho não vira de um lado a outro sem parar: espera um instante entre uma virada e outra e nunca anda de costas.
- Nos ajustes do pet há um botão Bolinha para ligar ou desligar a brincadeira.

## 5.50 — 16/11/2026 · Limpeza: nome Tyba, avatar neutro e dados pessoais fora

- Novos espaços começam com o avatar neutro; a foto do Seu Nome deixou de ser o padrão.
- O atalho do ícone do app agora se chama Meu Espaço (o quadro de tarefas).
- Docs e comentários do código passam a chamar o produto de Tyba.
- O ícone do app (tela inicial, instalação e aba do navegador) agora é a logo do Tyba, em branco sobre o azul da marca.

## 5.49 — 16/11/2026 · Quadro de tarefas em abas no celular

- No celular, o quadro mostra uma coluna por vez, com abas A fazer / Fazendo / Feito. Arraste um cartão até uma aba para mudar a situação dele.

## 5.48 — 16/11/2026 · Arrastar tarefa pelo título

- Agora dá para arrastar o cartão da tarefa pegando também pelo título (antes o navegador tratava como arrastar o link e o movimento falhava).

## 5.47 — 16/11/2026 · Itens apagados não voltam mais

- Um item apagado (como o livro ou o grampeador da wishlist) não volta mais ao abrir o app: o app guarda por 30 dias o que você apagou e reenvia a exclusão para a nuvem, mesmo que a internet tenha falhado na hora ou outro aparelho esteja desatualizado.

## 5.46 — 16/11/2026 · Pets sem tremer no celular

- No celular, os cachorrinhos não ficam mais virando de um lado a outro quando um está sentado perto do outro: o que está atrás se afasta para o mesmo lado até sobrar espaço, e só olham um para o outro quando há distância.

## 5.45 — 16/11/2026 · Menu em gaveta e dia em folha de baixo

- No celular, o menu lateral abre como uma gaveta pela esquerda, com o fundo escurecido; fecha ao tocar fora, num item ou no Esc.
- No celular, ao tocar num dia do calendário, os detalhes do dia sobem como uma folha de baixo, com botão de fechar.

## 5.44 — 16/11/2026 · Pets mais naturais

- Os cachorrinhos não viram de um lado a outro nem andam de costas: sempre olham para onde estão indo.
- Parados ou sentados, ficam de frente um para o outro.
- Cada um corre numa velocidade ao ir atrás da bolinha; o mais lento chega depois.

## 5.43 — 16/11/2026 · Descrição do evento no celular

- No celular, a descrição do evento no feed agora quebra em linhas (até 3) em vez de passar por cima da data.

## 5.42 — 16/11/2026 · Wishlist em lote

- Em Novo desejo, cole vários links de produto, um por linha: todos entram de uma vez e as páginas são lidas uma a uma. Links repetidos ou inválidos são avisados e pulados.

## 5.41 — 16/11/2026 · Pets andam um atrás do outro

- Quando os dois vão ao mesmo lugar (potinho ou bolinha), um chega na frente e o outro fica um corpo atrás, sem se cobrirem.

## 5.40 — 16/11/2026 · Pets sem se sobrepor

- Os dois cachorrinhos não ficam mais um sobre o outro quando param ou sentam: o de trás se afasta sozinho.
- Os cocôs também não caem mais um em cima do outro.

## 5.39 — 16/11/2026 · Dica do pet só no começo

- A dica de como brincar com os cachorrinhos aparece só até a primeira brincadeira e não volta mais.

## 5.38 — 16/11/2026 · Silhueta ao arrastar no quadro

- No quadro do Meu Espaço, cada coluna vale por toda a altura: solte o cartão em qualquer ponto dela, mesmo vazia. Os botões de mover continuam funcionando.
- Ao arrastar, a coluna de destino mostra só a silhueta do espaço que o cartão ocuparia, sem contorno.

## 5.35 — 16/11/2026 · Arrastar tarefas ficou mais fácil

- Arrastar um cartão do quadro agora funciona pegando em qualquer ponto dele, com o cartão seguindo o mouse e a coluna de destino acendendo.

## 5.34 — 16/11/2026 · Quadro Meu Espaço: arraste e renomeie

- No modo trabalho (e no quadro da página Tarefas), arraste um cartão para outra coluna: A fazer, Fazendo ou Feito. Os botões de mover continuam lá.
- O “Modo trabalho” agora se chama Meu Espaço, e o nome é seu: clique no título do quadro e escreva o que quiser.

## 5.33 — 16/11/2026 · Cor personalizada no onboarding

- No passo “Do seu jeito” do onboarding ganhou a opção Personalizada: escolha qualquer cor e ela vira a cor do seu espaço na hora.

## 5.32 — 16/11/2026 · Primeiros passos com o nome Tyba e os pets

- O primeiro uso agora tem 7 passos: um novo explica o nome Tyba (do tupi: o sufixo -tyba/-tiba indica abundância e ajuntamento, como em Itatiba e Ubatuba) e outro apresenta os pets, com escolha do Pet 1 e do Pet 2 na hora.
- Para rever: menu da sua foto → Primeiros passos.

## 5.31 — 16/11/2026 · Schnauzer, dois pets e casinhas coloridas

- Novo pet: o Schnauzer, feito em pixel art a partir da sua folha (parado, sentado, andando e abaixado).
- Agora dá para ter dois pets ao mesmo tempo, cada um com a sua casinha, plaquinha com nome e voz. Escolha o Pet 1 e o Pet 2 (ou “Nenhum”) no botão Pets do cenário; os dois brincam com a bolinha, comem, tomam banho e conversam.
- Clique na casinha para mudar a cor (6 cores); a cor fica salva no perfil de cada pet. O nome continua na plaquinha.
- O corpo do bichinho não tapa mais a casinha, a plaquinha nem as vasilhas: o latido é por clique na posição dele.

## 5.30 — 16/11/2026 · Player com pin e capa da faixa

- Player de música: clicar fora minimiza e passar o mouse sobre a barra abre; ao tirar o mouse ele volta a minimizar.
- O botão de subir/descer virou um pin (quando aberto): fixado, o player fica aberto mesmo ao tirar o mouse ou clicar fora. A escolha fica salva no seu perfil.
- A capinha da barra sempre mostra a capa do vídeo que está tocando agora, e troca sozinha quando a playlist avança.

## 5.29 — 13/11/2026 · Barra de rolagem fixa

- A barra de rolagem lateral agora fica sempre no lugar, então a página não “quica” mais quando o conteúdo passa a caber ou deixa de caber na tela.

## 5.28 — 13/11/2026 · Anotações dos artigos à vista

- As anotações dos artigos agora aparecem: no feed, as 2 últimas ficam abaixo do artigo (com link para ver todas) e, na janela do artigo, um painel lateral lista tudo, com contador no ícone, botão “Nova” e exclusão; ao guardar uma anotação, ela surge na hora.

## 5.27 — 13/11/2026 · Artigos em janela flutuante

- Artigos agora abrem numa janela flutuante: com título, botão de fechar (ou Esc), ícone para abrir em nova guia, e dá para mover pela barra e redimensionar pelo canto. Se o site não permitir abrir ali, use “Abrir em nova guia”.

## 5.26 — 13/11/2026 · Desejo no feed como etiqueta

- Desejo no feed virou uma etiqueta horizontal: foto à esquerda, título, loja e avaliação no meio e, depois do picote tracejado, o preço em destaque com a variação (↓ caiu / ↑ subiu); no celular a foto vai para cima.

## 5.25 — 13/11/2026 · Evento no feed como ticket

- Card de evento no feed virou um ticket horizontal: foto à esquerda, título, nota e horário no meio e, depois do picote tracejado, o dia em destaque; no celular a foto vai para cima. Clicar abre o ticket completo.

## 5.24 — 13/11/2026 · Cabeçalho da Agenda refinado

- Cabeçalho da Agenda reorganizado: título e botão de ação na mesma linha, subtítulo logo abaixo, depois as abas (Calendário, Tarefas, Lembretes) e o conteúdo, tudo no grid de 24px, sem o vão que havia entre as abas e o título.
- Cada aba tem seu subtítulo e seu botão: “Novo evento”, “Nova tarefa” e “Novo lembrete”.
- Aba ativa mais clara nos dois temas (fundo do cartão e sombra leve) e texto das inativas com contraste AA; a aba aberta continua na URL (#/agenda, #/tarefas, #/lembretes) e volta igual ao recarregar.
- Legenda do calendário virou filtro: toque em evento, tarefa ou lembrete para mostrar ou esconder no mês e na lista do dia; todos começam ativos e os desligados ficam opacos.

## 5.23 — 13/11/2026 · Eventos com foto e ticket

- Evento com foto: escolha o arquivo, arraste, cole com Ctrl + V ou use um link, como nas capas dos livros; a foto (reduzida a 480×300) aparece como card no feed e sincroniza com a nuvem.
- Clicar num evento (na Agenda, no feed ou em “Próximos eventos”) abre um ticket com foto, título, dia, horário e quantos dias faltam, com Editar e Excluir.
- Abas de Agenda e Biblioteca no topo: arraste para reordenar; a ordem fica salva no seu perfil.
- Menu “⋯” do evento na Agenda não fica mais cortado dentro do card.
- Pets: falas novas sobre eventos de hoje e de amanhã, contagem regressiva, semana cheia ou livre, stickers do calendário e sons de fundo.

## 5.22 — 13/11/2026 · Agenda refinada

- Agenda: “hoje”, o destaque do dia atual e as contas de “feitas hoje” agora usam sempre o fuso do seu aparelho (antes, depois das 21h, parte delas olhava a data em UTC e virava o dia cedo demais).
- Painel do dia: textos quebram dentro do card, o tipo (evento, tarefa, lembrete) aparece como selo com a mesma cor do calendário, e tarefa e lembrete ligados ao mesmo item aparecem uma vez só, com os dois selos. Itens concluídos ficam riscados e mais claros, tanto no painel quanto na célula.
- Calendário: número do dia no canto esquerdo e stickers no direito, sem sobrepor; no máximo 2 itens por dia e “+N mais”, com o título completo ao passar o mouse; legenda de cores abaixo do mês; dias fora do mês mais suaves e sem borda; “hoje” em círculo e dia selecionado com borda na cor do tema.
- Teclado no calendário: setas andam entre os dias, PageUp/PageDown trocam o mês, Enter abre o dia, com foco bem visível.

## 5.21 — 13/11/2026 · Agenda e barra enxuta

- Três cliques no logo agora trocam também a fonte do site todo para a Lora (e voltam ao normal no próximo trio de cliques).
- Início ganhou o widget “Próximos eventos”: os próximos compromissos com “hoje”, “amanhã” ou “em N dias”. Marque “Contar os dias no Início” num evento para ele aparecer como contagem regressiva em destaque.
- Calendário com 7 stickers (aniversário, viagem, saúde, trabalho, festa, coração e destaque), até 3 por dia, escolhidos no painel do dia.
- Barra lateral enxuta, com 8 áreas: Início, Agenda, Mural, Músicas, Biblioteca, Gastos, Wishlist e Currículo.
- Nova Agenda: um calendário do mês onde aparecem seus eventos, as tarefas com prazo e os lembretes. Clique num dia para ver a lista dele e use “Novo evento” (título, dia, horário e nota) para marcar o que vai fazer.
- Agenda e Biblioteca viraram abas: Calendário, Tarefas e Lembretes; Livros e filmes, Links, Imagens e Estudos. As páginas e os atalhos de antes continuam funcionando.
- A ordem da barra voltou ao padrão novo (dá para arrastar de novo); os eventos também sincronizam com a conta.

## 5.20 — 13/11/2026 · Menu do perfil refinado

- Menu do perfil reorganizado em seções com divisor fino: Conta (Editar perfil, Configurações e backup), Ajuda (Primeiros passos, O que há de novo) e App (Instalar o app, só quando o app ainda não está instalado).
- “Aparência” virou título de seção, com o mesmo estilo de “Como estou hoje”; o seletor Claro/Escuro/Sistema continua igual.
- Novo item “Sair” no fim do menu, em vermelho suave e sem ícone: encerra a sessão e volta para a tela de login (aparece quando há login).
- Itens com hover suave e raio do menu, sem mudar a altura; teclado com setas, Home/End, Esc para fechar e foco visível; contraste AA nos dois modos.

## 5.19 — 13/11/2026 · Sons ambiente no mini player

- Sons ambiente sem repetição audível: trechos longos com emenda em crossfade (sem queda de volume no laço) e duas camadas de tamanhos diferentes tocando juntas.
- Mini player: o X agora fecha de verdade, parando a música e os sons ambiente (antes só guardava o painel no canto).
- Mini player de música: o botão “Grupo” saiu e o “+” virou só o ícone, em cor primária, no canto direito.
- Novo painel de Sons ambiente no mini player: sliders de volume para chuva, vento, fogo, mato, ruído marrom e ruído branco, mais um volume geral e os botões Tocar/Pausar e Zerar. Os sons são gerados no aparelho e o equilíbrio fica salvo.

## 5.18 — 13/11/2026 · Universo sonoro

- Universo sonoro: sons curtos e suaves ao guardar, concluir (tarefa, lembrete, comprado, mídia), favoritar, excluir, abrir janelas e ao trocar o logo; desfazer um deles toca um som descendente.
- Os sons são feitos no próprio aparelho (sem arquivos) e funcionam offline. Em Configurações → Sons dá para ligar/desligar e ajustar o volume.

## 5.17 — 13/11/2026 · Refinamento visual da Wishlist

- Wishlist: o aviso “Faltou: …” agora lista só o que realmente falta (card com preço não diz mais “Faltou: preço”) e virou um texto pequeno, discreto, logo abaixo do título.
- Cards da Wishlist com altura igual por linha: imagem, loja, título (2 linhas), avaliação, preço e, presos no rodapé, o botão e as ações; grade responsiva a partir de 240 px.
- “Ver na loja” virou botão secundário (fundo suave da cor do tema, preenche ao passar o mouse); “Colar link” segue como único botão principal.
- Imagens dos produtos em quadro 100% branco, sem cortes e com margem interna igual.
- Filtros alinhados: o seletor de ordem ficou com a mesma altura, formato e fundo do Quero/Comprados, e “Atualizar todos os preços” ficou centralizado na linha.
- Ações dos cards com balão de dica (Favoritar, Marcar como comprado, Atualizar preço, Copiar endereço, Mais opções) e cinzas com contraste AA.
- Resumo do topo com singular/plural (“1 produto”) e o valor total em destaque.

## 5.16 — 13/11/2026 · Segundo logo do Tyba

- Novo logo alternativo do Tyba: clique 3 vezes no logo (canto superior esquerdo) para alternar entre as duas versões; a escolha fica salva neste aparelho.

## 5.15 — 13/11/2026 · Refinamento visual do Início

- Correção: nas coleções (ex.: A organizar), o card de Tarefas não fica mais coberto pelo card de baixo.
- Início mais leve: o bloco “O que você quer guardar?” virou um card claro com 5 atalhos (Nota, Link, Tarefa, Imagem, Lembrete) e um botão Mais para os outros tipos.
- Hierarquia de textos: menu e rótulos em peso regular/médio; negrito só em títulos de card, de widget e números. Cinzas secundários ajustados para contraste mínimo 4.5:1 nos modos claro e escuro.
- Botões Banho e Pets do pet viraram chips escuros translúcidos; o botão de música ao lado do perfil ganhou descrição ao passar o mouse.
- Widgets da direita com o mesmo link “ver todas”; Tarefas mostra também as concluídas (riscadas) e “+N” quando há mais, batendo com o contador.
- Card de filme/livro mostra um resumo curto (2 linhas) ao lado da capa; ícones de ação dos cards ficam calmos e ganham a cor do tema ao passar o mouse; “A organizar” tem o contador em destaque, como caixa de entrada.

## 5.14 — 13/11/2026 · Tyba, selecionar em lote, encaixe de cards e mais

- As confirmações (excluir, sair, descartar etc.) agora são cartões bonitos do próprio app, no estilo do onboarding, em vez das caixas do navegador; “Mover para coleção” também virou uma janela do app.
- Início: a linha do feed ficou só com “Hoje” à esquerda (abre o por dia) e Selecionar à direita; sumiram “Atividade recente” e “Por dia”.
- O rodapé saiu do site; o estado da sincronização e os créditos ficam só em Configurações.
- Início: o Selecionar foi para a mesma linha de “Atividade recente” (e do seletor de dia). A barra lateral esquerda fica fixa e sempre inteira na tela, sem rolagem: o espaçamento encolhe conforme a altura da janela.
- O sistema agora se chama Tyba: o logo (que muda com a cor do tema, claro e escuro) aparece no topo e na tela de entrada no lugar do nome, e o título da aba e o nome do aplicativo instalado também mudaram.
- Modo escuro: o aviso “Há uma versão nova” e o menu de texto selecionado agora têm contraste legível (antes ficavam claro sobre claro).
- A previsão do tempo ficou compacta (cidade, temperatura e máx/mín) e abre os detalhes e os próximos dias ao clicar.
- Os cards se encaixam nos vãos no Mural, Links, Wishlist e nas coleções: um card baixo deixa o seguinte subir para ocupar o espaço vazio, também ao arrastar.
- Ao lado do perfil, saiu o botão do modo trabalho (continua em Shift + Espaço) e o disco de música virou o ícone do YouTube Music, que acende com a cor do tema quando algo está tocando.
- O ícone de Músicas agora é o do YouTube Music (círculo com anel e play), na cor do tema, no menu, nos títulos e no cadastro de tipos.
- Mercado Livre com foto e preço automáticos: crie um app grátis em developers.mercadolivre.com.br e ponha ML_CLIENT_ID e ML_CLIENT_SECRET no config.local.json (ou nas variáveis do Vercel). Passo a passo em docs/BIBLIOTECA_E_WISHLIST.md.
- Selecionar em lote: o botão Selecionar (Início, Mural, Biblioteca, Links, Wishlist, coleções) deixa marcar vários cards de uma vez e então mover para uma coleção, marcar como comprado (Wishlist) ou excluir tudo junto.
- Os três pontinhos de todos os menus agora ficam com o ícone no centro do círculo, sem o círculo cortado no canto do card.
- Mercado Livre: quando a loja barra a leitura, o nome sai do endereço e a foto e o preço vêm da API pública deles; o título genérico “Mercado Libre” não vira mais nome.
- Shopee e Mercado Livre não dão mais erro quando a página é recusada: o card sai com o que o link traz. Use o botão de recapturar nos cards antigos.

## 5.13 — 13/11/2026 · Colar link cria o card e Shopee

- Ctrl+V de um endereço nas páginas Wishlist e Links cria o card na hora (vários endereços de uma vez também, um por linha), já buscando a prévia.
- Shopee: a loja bloqueia a leitura e o card ficava com “Oops! Seu navegador não é mais aceito!”. Agora o nome e a foto saem do próprio link, e o preço é buscado quando a Shopee deixar. Títulos de página de bloqueio nunca mais viram nome de produto.

## 5.12 — 13/11/2026 · Arrastar sem piscar

- Arrastar post-its e itens ficou mais estável: a troca de lugar só acontece depois que a anterior assenta e quando o ponteiro sai da vaga, o que evita os cards ficarem sobrepostos e piscando.
- Enquanto você arrasta, a tela não é redesenhada por nada em segundo plano (sincronização, carregamentos); ela só atualiza quando você solta.

## 5.11 — 13/11/2026 · Comentários maiores e playlist em foco

- Comentários: o campo para escrever ficou maior e cresce conforme você digita. Enter envia e Shift+Enter quebra a linha; as quebras aparecem no comentário.
- Mini app de música: ao clicar numa playlist, ela vira a tela principal com todos os vídeos dela e um botão Listas para voltar às outras.

## 5.10 — 13/11/2026 · Playlists no mini app

- No mini app de música, a lista agora rola de verdade: antes, ao abrir uma playlist com muitos vídeos, só os primeiros apareciam e o resto ficava cortado.
- Ao abrir uma playlist, ela sobe para o topo da lista para você ver os vídeos dela, e o mini app ficou um pouco mais alto.

## 5.9 — 13/11/2026 · Currículo base limpo

- O modelo base do currículo que acompanhava o projeto foi esvaziado: nenhum dado pessoal vem mais pronto, só a estrutura em branco para quem for importar o seu.

## 5.8 — 13/11/2026 · Adicionar abre só no símbolo

- No modo trabalho, a lista de itens do botão de adicionar agora só abre ao passar o mouse sobre o símbolo de mais (antes abria também ao passar perto dele). No celular, abre com um toque.

## 5.7 — 13/11/2026 · Balão do pet mais legível

- As falas do pet ficam bem mais tempo no balão (de 7 a 14 segundos, conforme o tamanho), e dá para clicar no balão para fazê-lo sumir.
- O balão tem no máximo três palavras por linha, e o cenário ficou um pouco mais alto para caber.

## 5.6 — 13/11/2026 · Escolha de pets em popup

- A escolha do pet agora abre como um popup no centro do cenário, com um card para cada pet (salsicha, pinscher, frajola e shollie), em vez de ficar escondida numa engrenagem.
- O botão do cenário agora se chama Pets, para ficar fácil de achar. Som, conversa e esconder ficam no mesmo popup.

## 5.5 — 13/11/2026 · O pet conversa com você

- O pet agora conversa com você, só com a janela visível: comenta o que você guardou (notas, imagens, links, livros, filmes, músicas), tarefas feitas, lembretes e tarefas para hoje ou atrasados, o tempo e o dia da semana.
- Ele também elogia, diz que gosta de você, que sentiu sua falta quando você volta depois de um tempo e que está ansioso pelo fim de semana.
- As frases ficam numa biblioteca própria, fácil de ampliar. Dá para desligar a conversa na engrenagem do cenário.
- Novo pet para escolher: o shollie.

## 5.4 — 13/11/2026 · Previsão do tempo

- A coluna da direita do Início ganhou a previsão do tempo: temperatura agora, máxima e mínima, sensação, chance de chuva, vento e os próximos 5 dias.
- Escolha a cidade pelo nome ou pela localização do aparelho; dá para trocar e atualizar a qualquer hora. Ela avisa quando convém levar guarda-chuva ou casaco.
- O bloco do tempo pode ser arrastado como os outros da coluna.

## 5.3 — 13/11/2026 · Marcar como lido ou assistido

- Na Biblioteca, cada livro e filme ganhou um botão para marcar como lido ou assistido (e desmarcar), direto na capa.
- Também dá para excluir pela capa ou pela página do item, com confirmação antes.

## 5.2 — 13/11/2026 · Ajustes nas vasilhas e no banho

- As vasilhas de comida e de água esvaziam a cada 5 minutos; encher agora mostra a ração e a água caindo, e o nível desce enquanto ele come.
- O botão Brincar saiu: para brincar, clique no chão e jogue a bolinha.
- Dar banho agora interrompe a brincadeira.
- A plaquinha do nome da casinha não muda mais de cor de forma estranha ao passar o mouse.

## 5.1 — 13/11/2026 · Três pets, bolinha e vasilhas

- Agora são três pets para escolher: salsicha, pinscher e gato frajola. Troque pela engrenagem dentro do cenário; cada um tem a sua voz.
- Novo botão Brincar: ele corre atrás de uma bolinha, chutando de um lado para o outro.
- Clicar no chão agora joga a bolinha naquele ponto, e ele vai brincar. O botão Comida saiu.
- Duas vasilhas, de comida e de água: o nível desce com as horas e você enche clicando nelas. Ele vai comer e beber sozinho, e avisa quando está com fome ou sede.
- Os botões do cenário ficaram mais legíveis ao passar o mouse.

## 5.0 — 13/11/2026 · Cuidados com o cachorrinho

- O cenário do cachorrinho agora acompanha a hora do seu aparelho, em cinco fases: amanhecer, manhã, tarde, entardecer e noite, cada uma com céu, chão, morros, nuvens e sol ou lua próprios.
- Depois de comer, ele faz cocô. O cocô fica no chão (com moscas) até você clicar nele para limpar.
- A casinha ganhou uma plaquinha: clique nela para escolher o nome do cachorrinho.
- Novos botões no cenário: Comida (derruba duas porções) e Banho (ele vai ao meio, ensaboa com bolhas e se sacode).

## 4.9 — 13/11/2026 · Tarefas com descrição e comentários

- Clicar numa tarefa (no card todo, não só no título) abre a janela dela, com descrição, situação, prazo e comentários, tanto na tela Tarefas quanto no modo trabalho.
- Dá para comentar direto na janela da tarefa, e o card mostra quantos comentários ela tem.

## 4.8 — 13/11/2026 · Um cachorrinho no Início

- Um cachorrinho em pixel art mora no alto do Início, num cenário com árvore, casinha, morros e nuvens (de noite, com lua e estrelas no tema escuro). Ele fica parado e, de vez em quando, senta.
- Clique nele e ele late (balão “AU! AU!” e som). Clique no chão e cai comidinha: ele vai andando até ela, abaixa e come.
- O botão de som no cenário silencia o latido. Em Configurações → Cachorrinho dá para esconder o pet.

## 4.7 — 13/11/2026 · Visualização, arrastar com a mão, playlists e Mercado Livre

- Clicar numa nota ou num cartão (livro, desejo, música, gasto…) abre uma visualização para ler, sem entrar na edição. Lá ficam Editar e Abrir página.
- Arrastar ficou mais natural: o item fica na sua mão, segue o ponteiro (um pouco inclinado) e os outros abrem espaço na hora, sem o contorno pontilhado. Vale para post-its do Mural, faixas do mini app, áreas do menu e blocos da direita. No celular, segure um instante para pegar; Esc cancela.
- No modo trabalho, o botão Adicionar fica no canto de baixo e as opções sobem a partir dele.
- A lista de vídeos de uma playlist agora aparece também na tela Músicas (botão ao lado do play) e mostra “Tentar de novo” quando a leitura falha. A leitura entende o novo formato de páginas do YouTube e usa o feed da lista como reserva.
- Captura de links do Mercado Livre mais completa: segue links curtos e páginas de compartilhar até o produto, lê nome, foto e preço do próprio HTML e tenta de novo como o WhatsApp faz quando a loja devolve pouco.

## 4.6 — 13/11/2026 · Aplicativo instalável (PWA)

- O Meu Espaço agora é um aplicativo instalável: no menu da foto (ou em Configurações → Aplicativo) há “Instalar o app”, e ele abre em janela própria, com ícone na tela inicial. No iPhone, o botão mostra o passo a passo do Safari.
- Funciona sem internet: depois da primeira visita, o app abre offline e o que você guardar fica salvo e sincroniza quando a conexão voltar.
- Atalhos no ícone do app: Nova nota, Nova tarefa, Guardar imagem, Guardar link e Modo trabalho.
- Receba compartilhamentos: no Android/Chrome, compartilhar uma página ou texto de outro app para o Meu Espaço abre o formulário de link ou nota já preenchido.
- Aviso “Há uma versão nova” com botão Atualizar, e aviso discreto quando você está sem conexão.
- A barra do sistema acompanha a cor do tema, e os botões flutuantes respeitam a área segura de celulares com notch.

## 4.5 — 13/11/2026 · Notas soltas na coleção

- Na tela de uma coleção, cada nota agora é um post-it próprio, do mesmo tamanho do Mural, em vez de ficar agrupada num cartão “Notas” com tamanhos estranhos. Clicar abre a edição.
- As colunas da coleção ficaram mais estreitas (mais blocos por linha).

## 4.4 — 13/11/2026 · Seu emoji do dia

- No menu da foto, o humor do dia mostra os 4 últimos emojis que você usou, para repetir com um toque.
- Ao lado deles há um campo para escolher qualquer emoji: digite, cole ou abra o teclado de emojis (no Windows, tecla Windows + ponto).

## 4.3 — 13/11/2026 · Menu do perfil no celular

- Correção no celular: o humor do dia, no menu da foto, aparecia como uma coluna gigante de emojis com o campo espremido. Agora os emojis ficam em linha, o botão de salvar tem cor e o menu rola se a tela for baixa.

## 4.2 — 13/11/2026 · Boas-vindas

- Boas-vindas para quem chega: cinco passos curtos, com barra de progresso e “Pular” a qualquer hora.
- Passo 1 pergunta como você quer ser chamado; o 2 mostra o que cabe em cada área; o 3 troca cor e aparência na hora; o 4 ensina os três atalhos (Ctrl+V, Ctrl+K, Shift+Espaço); o 5 leva ao primeiro registro.
- Para rever: menu da foto de perfil → Primeiros passos.
- Listinha “Para começar” no Início, com seis coisas para experimentar (nota, tarefa, imagem, link, foto, modo trabalho). Ela risca sozinha, some quando acaba e pode ser dispensada.

## 4.1 — 13/11/2026 · Imagens

- Nova área Imagens: uma grade em colunas, estilo Pinterest, com cada imagem na proporção que tem.
- Para guardar uma imagem: Ctrl + V cola a que você copiou, arraste um arquivo, escolha do computador ou use um link. Na tela de Imagens, colar guarda na hora.
- Grupos de imagens: crie, renomeie e apague grupos, e arraste uma imagem sobre o nome do grupo para movê-la.
- Clicar numa imagem abre ela grande, com setas para passar as próximas.
- Todo campo de imagem do sistema agora aceita colar, arrastar e link: capa de livro, capa de pasta, foto do produto da wishlist e foto do perfil.
- O atalho redondo de adicionar agora existe só dentro do modo trabalho, no canto de baixo à esquerda.
- Correção: o menu “⋯” do post-it abria a edição em vez do menu, e por isso não dava para excluir. Agora abre o menu normalmente.

## 4.0 — 12/11/2026 · Modo trabalho

- Shift + Espaço abre um quadro de tarefas por cima de tudo, para quando o assunto é só executar. Esc fecha.
- A música fica à mão dentro dele, no canto direito, e continua tocando.
- Novo atalho redondo no canto de baixo à esquerda: passe o mouse e escolha o que guardar.

## 3.9 — 12/11/2026 · Perfil, conta e acertos de leitura

- O humor do dia fica direto no menu da foto: escolha o emoji, escreva a palavra e pronto. O Perfil segue para foto, bio e cores.
- O e-mail da conta e o Sair da conta passaram para Configurações, e o atalho do currículo saiu do menu.
- As novidades viram uma página por dia, com Mais novo e Mais antigo.
- No lembrete, a data desceu para a linha dos botões.
- Hover com contraste decente no perfil, nos menus e nas janelas do modo escuro.

## 3.8 — 12/11/2026 · Música como mini app

- O disco ao lado do perfil abre um mini app no canto: lista das músicas, tocar, anterior e próxima, guardar música e criar grupos.
- Modo MP3: a barra fica na cor do tema, com capa quadrada e o nome do vídeo passando — numa playlist, o nome é o da faixa que está tocando.
- Arraste para reordenar as músicas e use grupos para separar o que é de quê.
- Playlist do YouTube: continua tocando com um toque, e a setinha abre os vídeos da lista para escolher um.
- Fechar guarda o player como um disco flutuando na direita, sem parar a música.
- Post-its de volta com cor no modo escuro, e o bloco de guardar com contraste decente no escuro.
- Correção no celular: a tela de Links aparecia em três colunas espremidas e o conteúdo escorregava para o lado.

## 3.7 — 12/11/2026 · Músicas, coleções em bento e menus que você arruma

- Nova área Músicas: cole um link do YouTube e ouça num quadro no canto, que continua tocando enquanto você navega.
- Clicar numa coleção abre uma tela com tudo que está nela, em blocos de tamanhos diferentes.
- As áreas do menu da esquerda e os blocos da coluna da direita podem ser arrastados para a ordem que você quiser.
- Tarefa ganhou campo de descrição, e tocar numa tarefa da lateral abre a janela dela.
- Na lateral o texto manda: datas viraram 12/11 e o progresso virou 1/4.
- Post-its com cores mais cheias no modo claro e nota limpa no escuro; hover do modo escuro corrigido.
- No Início, "Atividade recente" e o dia agora dividem a mesma linha, e o bloco de guardar está na cor do tema.
- Clicar num post-it já abre a nota para editar.
- Correção: a janela de editar mostrava um texto abandonado no lugar do que estava salvo. Agora rascunho vale só para post novo.
- Correção: as bolinhas da nota em lista estavam recuadas demais.
- Disco na barra do topo, ao lado do perfil: atalho para as músicas, que gira enquanto algo toca.
- Esconder o vídeo não reinicia mais a música, e a barra minimizada mostra capa quadrada, o nome passando e os controles.
- Correção: o menu "…" do cartão de música ficava preso dentro dele.

## 3.6 — 12/11/2026 · Listas

- A nota agora tem dois modos: Texto e Lista. Na Lista, cada linha vira um item para marcar, com a conta de quantos já foram.
- Em Nova tarefa, colar várias linhas cria uma tarefa por linha, com o mesmo prazo e a mesma coleção.
- Marcadores colados como “-”, “•”, “1.” e “[ ]” são removidos sozinhos.

## 3.5 — 12/11/2026 · Tarefas

- Nova área Tarefas, com uma linha por tarefa e o círculo que risca na hora.
- Três visões da mesma lista: por prazo, em quadro (A fazer, Fazendo, Feito) e por coleção.
- Tarefa com prazo cria um lembrete ligado a ela — concluir um risca o outro.
- Resumo de tarefas no topo da coluna direita do Início, com o progresso do dia.
- As janelas não fecham mais ao clicar fora: só pelo X ou pela tecla Esc.

## 3.4 — 12/11/2026 · Preços conferidos sozinhos

- Ao abrir a Wishlist, produtos ainda não comprados lidos há mais de 12 horas são conferidos de novo em segundo plano.
- Se o preço cair, entra um lembrete avisando quanto baixou, ligado ao produto.
- A Amazon ganhou um leitor próprio: nome, foto, preço e estrelas. Quando a loja bloqueia a leitura, o aviso é claro em vez de um cartão vazio.
- Esta janela de novidades, que aparece quando o sistema muda.

## 3.3 — 12/11/2026 · Modo escuro e espaço limpo

- Modo claro, escuro ou automático, no menu da foto de perfil.
- Um espaço novo começa vazio, com "Meu Nome" e ícone de perfil padrão.

## 3.2 — 11/11/2026 · Sincronização entre aparelhos

- O que você guarda no computador aparece no celular, pelo Firestore.
- O navegador continua salvando na hora, mesmo sem internet.
- A sessão se mantém quando o cookie do site se perde.

## 3.1 — 11/11/2026 · Ajustes de uso

- Ações do post numa linha só, por ícone, com Editar dentro do menu "⋯".
- Botão para copiar o link, filtro de dia numa linha e links agrupados por site.

## 3.0 — 11/11/2026 · Meu Espaço v3

- Visual claro e espaçado, com Mural de post-its, Biblioteca em prateleiras, Estudos com PDF em janelas e Wishlist em vitrine.
- Criação pelo tipo primeiro, com formulário progressivo e rascunho guardado.
- Login com conta Google e backup em Configurações.
