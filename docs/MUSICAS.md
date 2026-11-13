# Músicas

Guardar música e playlist do YouTube e ouvir sem sair do Meu Espaço.

## Como guarda

Só o **link do YouTube** — vídeo, playlist ou mix. O endereço é lido e guardado em duas partes:

| Guardado | De onde vem |
|---|---|
| `video` | `watch?v=…`, `youtu.be/…`, `/shorts/…`, `/embed/…` |
| `listaYT` | o parâmetro `list=` do endereço |
| Nome e artista | capturados da página pelo servidor; dá para corrigir à mão em Editar |
| Capa | `img.youtube.com`, montada a partir do id do vídeo — não precisa de captura |

Link que não seja do YouTube é recusado na hora, com aviso.

## O mini app

O disco ao lado da foto de perfil abre um painel no canto inferior direito, por cima do sistema. Ele é o lugar das músicas no dia a dia:

| Parte | O que faz |
|---|---|
| Barra de cima | capa, nome do que está tocando, **anterior**, **tocar/pausar**, **próxima**, **modo MP3** e **guardar no canto** |
| Vídeo | aparece quando algo está tocando; no modo MP3 ele some e o som continua |
| Seletor de grupo | Todas as músicas, cada grupo criado, ou Sem grupo |
| Botões | **+ Música** (guarda uma nova) e **Grupo** (cria um grupo) |
| Lista | tudo do grupo escolhido, com tocar, mover para grupo, editar, abrir no YouTube e excluir |

**Ordem e grupos.** Segure e arraste uma faixa: ela segue o ponteiro e as outras abrem espaço; a ordem fica guardada. Um grupo é uma lista sua (“Para trabalhar”, “Domingo”), independente das coleções do resto do sistema — uma música fica em um grupo só, e o seletor filtra por ele.

**Playlist do YouTube.** O cartão de uma playlist toca com um toque, como antes. A setinha ao lado dele (no mini app) ou o botão de lista (na tela Músicas) abre **os vídeos da lista**, lidos pelo servidor direto da página da playlist (com o feed público do YouTube como reserva; se falhar, aparece “Tentar de novo”), e tocar um deles continua dentro da lista. Os vídeos ficam guardados no item, então na segunda vez abrem na hora.

**Modo MP3.** A barra fica na **cor do tema**, com capa quadrada e o nome passando devagar. Numa playlist, o nome que passa é o **do vídeo que está tocando**, não o do cartão: o player do YouTube avisa a cada troca de faixa. Clicar na capa ou num espaço vazio da barra volta para o painel inteiro.

**Guardar no canto.** O X não para a música: o painel vira um disco girando, flutuando na borda direita. Um clique nele traz o painel de volta, com a música no mesmo ponto. Esconder, guardar e navegar **nunca recriam o vídeo** — o iframe é o mesmo do começo ao fim.

O embed usa `youtube-nocookie.com`. O YouTube é quem toca: o Meu Espaço não baixa nem hospeda nada, e vale o que estiver disponível na região.

## Onde aparece

- **Disco na barra do topo**, à direita do perfil: abre o mini app, na cor do tema. Ele gira enquanto algo está tocando.
- **Músicas**, no menu lateral: grade de capas com tocar, favoritar e abrir no YouTube.
- **Início**: entra no feed como qualquer outro registro, com a capa e o botão de tocar.
- **Coleção**: as músicas da coleção aparecem no bloco Músicas do bento, com um toque para tocar.

## Lido pelo servidor

`GET /api/playlist?lista=PL…` devolve `{ faixas: [{ video, titulo }] }`. A página da playlist traz os vídeos num JSON embutido, e é de lá que eles saem — tanto no `servidor.py` quanto na função do Vercel. Sem servidor ligado, o app avisa em vez de ficar tentando.

## Critérios de aceite

- Colar o link de um vídeo e ver capa e nome sem digitar mais nada.
- Colar o link de uma playlist e ver que ela toca em sequência.
- Tocar algo, ir para outra tela e conferir que o som não parou.
- Esconder o vídeo e continuar ouvindo, com o nome da faixa passando na barra.
- Fechar o player, ver o disco na borda direita e voltar com a música no mesmo ponto.
- Abrir os vídeos de uma playlist e tocar um deles do meio da lista.
- Criar um grupo, mover uma música para ele e filtrar por grupo.
