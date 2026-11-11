# Meu Espaço — Estudos

Área para guardar o que você está estudando, organizada em **pastas por assunto**, como gavetas de arquivo.

## 1. Pastas

Cada pasta tem nome, descrição opcional e uma **capa** que você envia do computador (a prévia aparece antes de salvar). Na tela, a pasta aparece como uma gaveta com aba, capa e a contagem de artigos. Exemplos: Design, Botânica, Tipografia.

Excluir uma pasta não apaga os artigos: eles ficam sem pasta e continuam guardados e na busca.

## 2. Artigos

Todo artigo é um **link**. Ao guardar, o sistema captura título, resumo e imagem da página (o mesmo mecanismo da Wishlist). Você pode corrigir ou escrever à mão.

| Campo | Origem |
|---|---|
| Endereço | Você cola |
| Pasta | Você escolhe (ou cria na hora) |
| Título e resumo | Capturados da página; editáveis |
| É PDF | Detectado pelo endereço terminado em `.pdf` |
| Lido / Ler mais tarde | Marcadores manuais |
| Anotações | Escritas por você ou capturadas da seleção no PDF |

## 3. Leitor de PDF em janelas

Quando o artigo é um PDF, **Abrir** mostra o documento numa **janela flutuante sobre o sistema**:

- Dá para abrir **várias janelas ao mesmo tempo**, arrastar pela barra do título e redimensionar pelo canto inferior direito.
- O PDF é renderizado página a página com camada de texto, então o texto é selecionável.
- **Selecionar um trecho e clicar com o botão direito** mostra **Guardar como anotação**: o trecho vira uma anotação daquele artigo, marcada como citação, com a página e a data.
- O botão de aspas na barra da janela cria uma anotação escrita à mão.

Links que não são PDF abrem em **nova guia**.

### Por que o leitor precisa do servidor

O navegador não deixa uma página ler arquivos de outro site (CORS e X-Frame-Options). Por isso o PDF é buscado por `/api/pdf`, que roda no `servidor.py` (no computador) ou como função na Vercel (no site publicado). Abrindo o `index.html` com dois cliques não há `/api`, então o artigo abre em nova guia e aparece um aviso na tela de Estudos.

A biblioteca de leitura é a [pdf.js](https://mozilla.github.io/pdf.js/) (Apache 2.0), guardada em `assets/vendor/`, então funciona sem internet.

## 4. Critérios de aceite

- Criar a pasta “Design” com capa e ver a gaveta com a capa e a contagem.
- Guardar o link de um artigo HTML e ver título, resumo e imagem capturados sozinhos.
- Guardar o link de um PDF, abrir e ver as páginas dentro da janela.
- Abrir dois PDFs ao mesmo tempo, mover um deles e fechar o outro.
- Selecionar um trecho, usar o botão direito, guardar como anotação e encontrá-la na ficha do artigo com a página.
- Abrir o `index.html` direto: o artigo em PDF abre em nova guia e o aviso aparece.
