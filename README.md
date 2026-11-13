# Meu Espaço

Arquivo pessoal privado com cara de rede social: feed por tipo de post, mural de notas, biblioteca em prateleiras, pastas de estudo com leitor de PDF, wishlist capturada por link, coleções, gastos, lembretes e currículo.

## Como abrir

**No computador (completo):** dois cliques em **`iniciar.bat`**. Ele acha o Python, liga o servidor e abre `http://localhost:8000`. É o que permite capturar prévia de links e produtos e ler PDFs dentro do site. Sem Python instalado, o `.bat` avisa o que fazer.

**Rápido, sem servidor:** dois cliques em **`index.html`**. Tudo funciona, menos a captura automática (os links ficam aguardando) e o leitor de PDF (abre em nova guia).

**Publicado (Vercel):** suba a pasta como está. As funções em `api/` fazem a captura e servem os PDFs, então o site publicado funciona completo. Nada é enviado para fora além da página que você mandou capturar.

Os dados ficam salvos no navegador e são **separados por endereço**. Para levar de um lugar para outro, use **Exportar backup** e **Importar backup** em **Configurações**.

## Estrutura

```
meu-espaco/
├── index.html              ponto de entrada
├── iniciar.bat             liga o servidor local e abre o navegador
├── servidor.py             servidor local: arquivos + /api/capturar + /api/pdf
├── vercel.json             configuração do site publicado
├── api/                    as mesmas rotas como funções da Vercel
│   ├── capturar.js         lê título, descrição, imagem, preço e estrelas de uma página
│   ├── playlist.js         lê os vídeos de uma playlist do YouTube
│   ├── pdf.js              entrega o PDF para o leitor interno
│   ├── sessao.js           login com conta Google (ver docs/LOGIN.md)
│   └── status.js           diz ao site que a captura está disponível
├── config.local.exemplo.json  copie para config.local.json e preencha (fica fora do Git)
├── firestore.rules         regras de acesso do banco (publicar no Firebase)
├── assets/
│   ├── css/estilo.css      visual (v3)
│   ├── js/app.js           lógica e telas
│   ├── js/config.js        ID do cliente Google e projeto Firebase (públicos)
│   ├── js/nuvem.js         sincronização com o Firestore
│   ├── js/icones.js        ícones Iconoir embutidos ("-solid" = estado ativo)
│   ├── js/atualizacoes.js  lista do popup "O que há de novo"
│   ├── fonts/              Lexend
│   ├── vendor/             pdf.js (leitor de PDF)
│   └── img/foto-perfil.jpg
├── data/                   currículo e links de exemplo
└── docs/
    ├── ESCOPO.md  OUTRAS_FEATURES.md  DIRECAO_VISUAL_MVP.md
    ├── BIBLIOTECA_E_WISHLIST.md  ESTUDOS.md  TAREFAS.md  LOGIN.md
    ├── SINCRONIZACAO.md  ONBOARDING.md  IMAGENS.md  PWA.md  PET.md  MUSICAS.md  ATUALIZACOES.md  README-PROMPT.md
    └── historico/          capturas de cada versão, feitas antes de mudar
```

## O que funciona

- **Criar:** barra com a pergunta e os tipos (Nota, Link, Livro ou filme, Artigo, Desejo, Gasto, Lembrete). Cada tipo abre só o essencial; o resto entra por “+”. **Nada digitado se perde:** vira rascunho automático.
- **Feed:** por dia, cada tipo com seu formato. Comentar e editar no próprio post. Busca global (Ctrl+K).
- **Tarefas:** uma linha por tarefa, com prazo opcional. Colar várias linhas cria várias tarefas de uma vez.
- **Modo trabalho:** Shift + Espaço abre o quadro de tarefas por cima de tudo, com a música à mão.
- **Atalho de guardar:** botão no canto de baixo à esquerda que abre os tipos ao passar o mouse. Três visões (por prazo, quadro e por coleção), risca no clique e resumo com progresso na lateral do Início. Ver `docs/TAREFAS.md`.
- **Mural:** post-its quase quadrados, arrastáveis para reordenar, com cor e alfinete. A nota também pode ser **lista**: cada linha vira um item para marcar.
- **Biblioteca:** livros e filmes com capa, situação, estrelas, **página atual com progresso** e **anotações** separadas da opinião, em prateleiras.
- **Estudos:** pastas com capa e artigos; PDF abre em **janela dentro do site**, e o trecho selecionado vira anotação pelo botão direito.
- **Links:** grade de três colunas, com favoritos e fila de leitura.
- **Boas-vindas:** espaço novo abre um onboarding de cinco passos (nome, o que cabe, cor e aparência, atalhos, primeiro registro). Ver `docs/ONBOARDING.md`.
- **Cachorrinho:** pet em pixel art no alto do Início; late ao clique e come a comida que cai no chão. Ver `docs/PET.md`.
- **Aplicativo (PWA):** instalável, funciona offline, tem atalhos no ícone e recebe compartilhamentos. Ver `docs/PWA.md`.
- **Imagens:** grade em colunas (estilo Pinterest) com grupos; entra por Ctrl + V, arrastar, arquivo ou link, e todo campo de imagem do sistema aceita as mesmas formas. Ver `docs/IMAGENS.md`.
- **Músicas:** o disco ao lado do perfil abre um mini app no canto — lista, grupos, tocar, anterior/próxima, modo MP3 na cor do tema e os vídeos de uma playlist. Ver `docs/MUSICAS.md`.
- **Coleções em bento:** clicar numa coleção mostra tudo que está nela — tarefas, notas, links, livros, músicas, desejos, estudos e gastos — em blocos de tamanhos diferentes.
- **Menus do seu jeito:** as áreas do menu da esquerda e os blocos da coluna da direita se reordenam arrastando.
- **Wishlist:** só o link; foto, nome, preço, estrelas e loja são capturados. Ao abrir a vitrine, produtos lidos há mais de 12 horas são conferidos de novo, e **se o preço cair entra um lembrete avisando**.
- **Lembretes:** faixa no topo do Início e quadro em quatro colunas.
- **Gastos, Currículo, Perfil e Configurações.** O humor do dia se registra no próprio menu da foto; a conta e o Sair ficam em Configurações.
- **Modo claro, escuro ou automático**, no menu da foto de perfil.
- **Começa vazio:** espaço novo abre com "Meu Nome", ícone de perfil padrão e nenhum registro.
- **O que há de novo:** popup com as últimas mudanças, aberto sozinho quando o sistema muda e disponível a qualquer hora no menu da foto de perfil.
- **Login com conta Google** no servidor local e no site publicado, com lista de e-mails liberados. Abrindo o `index.html` direto, entra sem login. Detalhes e configuração em `docs/LOGIN.md`.
- **Sincronização entre aparelhos** pelo Firestore: o que você guarda no computador aparece no celular. O navegador continua salvando na hora, mesmo sem internet. Ver `docs/SINCRONIZACAO.md`.

## Regras do projeto

- Toda mudança de produto é registrada nos arquivos de `docs/`.
- **Toda mudança entra em `docs/ATUALIZACOES.md` e em `assets/js/atualizacoes.js`**, no mesmo texto, com uma versão nova no topo. É o que alimenta o popup "O que há de novo".
- Antes de mudar o visual, capturar Início e Coleções em `docs/historico/` (ver o README de lá).
