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

## O player

Clicar na capa (ou no botão de tocar) abre um quadro de 360 px **preso no canto inferior direito**, por cima do sistema. Ele fica fora da área que é redesenhada a cada tela, então **continua tocando enquanto você navega** pelo Mural, Tarefas ou qualquer outra parte.

- A seta esconde o vídeo e deixa só a barra com o nome — útil para ouvir música enquanto trabalha.
- O X fecha e para.
- Playlist sem vídeo específico toca pelo `videoseries`, na ordem da playlist.

O embed usa `youtube-nocookie.com`. O YouTube é quem toca: o Meu Espaço não baixa nem hospeda nada, e vale o que estiver disponível na região.

## Onde aparece

- **Músicas**, no menu lateral: grade de capas com tocar, favoritar e abrir no YouTube.
- **Início**: entra no feed como qualquer outro registro, com a capa e o botão de tocar.
- **Coleção**: as músicas da coleção aparecem no bloco Músicas do bento, com um toque para tocar.

## Critérios de aceite

- Colar o link de um vídeo e ver capa e nome sem digitar mais nada.
- Colar o link de uma playlist e ver que ela toca em sequência.
- Tocar algo, ir para outra tela e conferir que o som não parou.
- Esconder o vídeo e continuar ouvindo.
