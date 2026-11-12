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
│   ├── fonts/              Lexend
│   ├── vendor/             pdf.js (leitor de PDF)
│   └── img/foto-perfil.jpg
├── data/                   currículo e links de exemplo
└── docs/
    ├── ESCOPO.md  OUTRAS_FEATURES.md  DIRECAO_VISUAL_MVP.md
    ├── BIBLIOTECA_E_WISHLIST.md  ESTUDOS.md  LOGIN.md
    ├── SINCRONIZACAO.md  README-PROMPT.md
    └── historico/          capturas de cada versão, feitas antes de mudar
```

## O que funciona

- **Criar:** barra com a pergunta e os tipos (Nota, Link, Livro ou filme, Artigo, Desejo, Gasto, Lembrete). Cada tipo abre só o essencial; o resto entra por “+”. **Nada digitado se perde:** vira rascunho automático.
- **Feed:** por dia, cada tipo com seu formato. Comentar e editar no próprio post. Busca global (Ctrl+K).
- **Mural:** post-its quase quadrados, arrastáveis para reordenar, com cor e alfinete.
- **Biblioteca:** livros e filmes com capa, situação, estrelas, **página atual com progresso** e **anotações** separadas da opinião, em prateleiras.
- **Estudos:** pastas com capa e artigos; PDF abre em **janela dentro do site**, e o trecho selecionado vira anotação pelo botão direito.
- **Links:** grade de três colunas, com favoritos e fila de leitura.
- **Wishlist:** só o link; foto, nome, preço, estrelas e loja são capturados. Mostra se o preço subiu ou caiu.
- **Lembretes:** faixa no topo do Início e quadro em quatro colunas.
- **Gastos, Currículo, Perfil e Configurações.**
- **Modo claro, escuro ou automático**, no menu da foto de perfil.
- **Começa vazio:** espaço novo abre com "Meu Nome", ícone de perfil padrão e nenhum registro.
- **Login com conta Google** no servidor local e no site publicado, com lista de e-mails liberados. Abrindo o `index.html` direto, entra sem login. Detalhes e configuração em `docs/LOGIN.md`.
- **Sincronização entre aparelhos** pelo Firestore: o que você guarda no computador aparece no celular. O navegador continua salvando na hora, mesmo sem internet. Ver `docs/SINCRONIZACAO.md`.

## Regras do projeto

- Toda mudança de produto é registrada nos arquivos de `docs/`.
- Antes de mudar o visual, capturar Início e Coleções em `docs/historico/` (ver o README de lá).
