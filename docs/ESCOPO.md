# Meu Espaço — escopo do produto

## 1. Objetivo

Meu Espaço é um arquivo pessoal privado com uma interface de rede social. Jack pode abrir o app no dia a dia, colar um link, anotar um gasto ou contar algo que aprendeu. Cada registro aparece no feed e fica disponível em uma área permanente para consulta, edição e organização.

O motivo para guardar um item faz parte dele. Um link pode vir acompanhado de “quero testar essa navegação no próximo projeto”. Meses depois, buscar essa frase deve levar ao link, aos comentários escritos depois e ao registro do projeto em que a ideia foi aplicada.

## 2. Primeira entrega

> **Estado atual (v3, nov/2026):** o protótipo tem Início, Mural, Biblioteca, **Estudos**, Links, Wishlist, Gastos, Lembretes, Currículo, Perfil e Configurações. Os detalhes estão em `BIBLIOTECA_E_WISHLIST.md` e `ESTUDOS.md`; o layout, em `DIRECAO_VISUAL_MVP.md`. A captura de links, produtos e PDFs roda no `servidor.py` (no computador) e como função em `api/` (no site publicado). O acesso ao espaço publicado é protegido por **login com conta Google** (`docs/LOGIN.md`). Antes de cada mudança, a versão anterior é registrada em `historico/`.

A primeira versão será local, com dois fluxos completos baseados nas telas já desenhadas. **Início** permite registrar e reencontrar notas e links. **Meu currículo** permite trazer dados anteriores em JSON, revisar, editar e exportar. O acesso aos links salvos em **Coleções** faz parte do primeiro fluxo, mesmo que comece como uma lista simples.

| Referência visual | O que orienta na implementação |
|---|---|
| [Início — painel minimalista](https://chatgpt.com/library?file_id=libfile_6444873599d08191a8b51d73254f6748&account_id=personal) | Busca no topo, captura rápida, atividade recente, navegação lateral e cartões compactos para retomar um item. |
| [Meu currículo](https://chatgpt.com/library?file_id=libfile_5af5238a86708191aed588cddfd6a96e&account_id=personal) | Importação e inclusão no topo, registros agrupados por seção, ações em cada linha e prévia do documento. |

Os livros, produtos, datas e valores desenhados nos cartões são exemplos visuais. Ao abrir um perfil novo, a interface mostra os dados que a pessoa cadastrar ou importar.

## 3. Mecânica do feed e das coleções

1. Em **O que você quer guardar?**, a pessoa primeiro escolhe o tipo de post (Nota, Link, Gasto, Lembrete) e depois o destino no dropdown **Salvar em** (ver seção 7). Um link pode receber título, comentário, coleção e a marca **Ler mais tarde**. Basta o endereço para salvar.
2. Ao salvar, o item ganha um identificador e aparece no feed por data de criação, do mais recente para o mais antigo. A biblioteca mostra o mesmo item.
3. Em **Coleções → Links**, a pessoa abre, edita, favorita, organiza por tema ou exclui o registro. Favorito e estado de leitura são independentes. Um artigo lido pode continuar favorito.
4. A busca considera título, endereço, notas e comentários. Os filtros permitem restringir por tipo, coleção, favorito e estado de leitura.
5. Ao revisitar o item, é possível comentar o que aconteceu depois ou vinculá-lo a outro registro. Marcar um artigo como lido o retira da fila **Ler mais tarde** e preserva sua ficha.
6. Editar o título no feed atualiza a biblioteca. Remover de uma coleção desfaz apenas aquele agrupamento. **Excluir registro** informa que ele sairá de todas as visualizações e pede confirmação.

A captura também pode começar dentro da coleção. Por exemplo, adicionar um livro em **Livros** já preenche o tipo e cria a atividade correspondente no feed.

## 4. Áreas permanentes do produto

| Área | O que guardar | O que fazer ao voltar |
|---|---|---|
| Links e favoritos | Endereço, título, motivo para salvar, temas e coleção | Abrir a fonte, filtrar favoritos, consultar referências de um projeto, gerenciar a fila de leitura. |
| Biblioteca (livros e filmes) | Nome, capa enviada pela pessoa, autor ou direção, ano, gêneros, estrelas, situação, resumo e comentário. Tudo preenchido à mão | Ver em prateleiras por situação, gênero ou estrelas. Abrir a ficha, mudar a situação, comentar de novo. |
| Músicas | Faixa ou álbum, artista, link para ouvir e anotação | Reabrir no serviço de origem e encontrar pelo artista ou pelo motivo do registro. |
| Wishlist | Só o link do produto. Foto, nome, preço, estrelas e loja são capturados da página | Ver como vitrine de loja, atualizar o preço (mostra se subiu ou caiu), abrir na loja e marcar como comprado, com opção de registrar o gasto. |
| Mural de notas | Texto, título opcional e coleção | Ver as notas como post-its quase quadrados, **reordenar arrastando**, fixar, trocar a cor, favoritar e comentar. |
| Estudos | Pastas por assunto com capa, e artigos em link | Abrir PDFs em janelas dentro do site, guardar trechos selecionados como anotação, marcar como lido. Ver `ESTUDOS.md`. |
| Gastos | Valor em reais, data, descrição e categoria opcional | Consultar por mês e categoria. O total do mês acompanha inclusões, edições e exclusões. |
| Aprendizados e conquistas | Curso, entrega, habilidade, projeto, relato e evidências | Anexar certificado, imagem ou PDF, relacionar aprendizado e aplicação, recuperar exemplos profissionais. |
| Currículo | Dados profissionais estruturados | Importar, adicionar, editar, excluir, revisar sugestões e exportar JSON. |
| Brag document | Histórico de contribuições com contexto, ação, resultado e evidência | Preparar uma avaliação, consultar um período e abrir os registros que sustentam cada relato. |

A navegação lateral tem acesso direto a Início, Mural de notas, Biblioteca, Coleções de links, Wishlist, Gastos, Lembretes e Currículo, e lista as coleções (Pessoal, Trabalho e as criadas) logo abaixo. A localização final de Aprendizados e Brag document na navegação pode ser definida quando esses módulos entrarem na implementação.

## 5. Tela Início

- **Layout em colunas.** Barra do topo com a marca, a busca e o perfil (foto, nome, humor) com o menu de configurações: editar perfil, aparência, currículo, exportar e importar backup, restaurar exemplos. Coluna esquerda com a navegação do sistema. Centro com captura e feed. Coluna direita com resumo: próximos lembretes, lendo ou assistindo, vitrine da wishlist, fila de leitura e favoritos.
- **Busca** acessível no topo, em todas as telas. A pesquisa alcança registros antigos mesmo que já tenham saído da parte visível do feed.
- **Captura** com uma ação principal para salvar. Primeiro a pessoa escolhe o tipo de post; os campos específicos e o destino padrão aparecem conforme o tipo. Um gasto pede valor e data. Um link pede endereço. O dropdown **Salvar em** permite trocar a coleção.
- **Feed** agrupado por dia, em que cada tipo de post tem o próprio formato e peso: nota como post-it, link com título grande e o motivo em destaque, livro ou filme com capa e estrelas, desejo com foto e preço, gasto em linha compacta com o valor à direita. Importações em lote aparecem recolhidas num único bloco.
- **Retomar** leva diretamente à leitura ou ao item em andamento. **Wishlist** mostra um desejo salvo e dá acesso à lista completa. Esses cartões entram quando suas áreas estiverem disponíveis.
- **Direção visual** com fundo claro, destaque lilás, poucos cartões simultâneos, espaço entre grupos e ícones Material em SVG com rótulos acessíveis. No celular, priorizar captura e feed, mantendo as coleções acessíveis pela navegação.

## 6. Tela Meu currículo

A pessoa pode começar com um currículo vazio ou importar informações anteriores. A tela agrupa **Experiência profissional**, **Formação** e **Cursos e certificações**. Dados pessoais de apresentação ficam no cabeçalho da prévia. Uma experiência inclui cargo, organização, período e descrição. Um curso inclui título, instituição e ano, com certificado opcional.

- **Adicionar informação** abre o formulário da seção escolhida.
- **Editar** carrega os valores atuais. Salvar atualiza a linha e a prévia. Cancelar descarta o rascunho.
- **Excluir** identifica o item antes da confirmação. Excluir uma experiência do currículo preserva o post ou certificado que lhe deu origem.
- **Prévia** mostra como os dados ficam no documento, com opção de ampliar. **Exportar JSON** gera uma cópia editável do estado atual, incluindo as correções manuais.

### Formato proposto para o JSON v1

Exemplo ilustrativo de um arquivo aceito pela primeira versão. Os identificadores acompanham os itens em todas as exportações.

```json
{
  "versao": 1,
  "perfil": {
    "nome": "Jackson Rubens",
    "titulo": "Designer de produto"
  },
  "experiencias": [
    {
      "id": "exp-001",
      "cargo": "Designer de produto",
      "organizacao": "Empresa de exemplo",
      "inicio": "2025-11",
      "fim": null,
      "descricao": "Design de interfaces para experiências interativas."
    }
  ],
  "formacao": [
    {
      "id": "form-001",
      "titulo": "Pós-graduação em Experiência do Usuário",
      "instituicao": "Anhanguera Educacional",
      "ano": 2023
    }
  ],
  "cursos": [
    {
      "id": "curso-001",
      "titulo": "Acessibilidade web",
      "instituicao": "WAI / W3C",
      "ano": 2024
    }
  ]
}
```

### Comportamento da importação

1. **Selecionar e validar.** Ler o arquivo, verificar a versão e os tipos de campos. Aceitar importação parcial por seção. Uma seção ausente preserva os dados atuais. Para experiências, usar mês e ano quando conhecidos. No exemplo, o fim nulo representa um vínculo atual.
2. **Mostrar prévia.** Apresentar itens novos, já existentes e com alterações. O mesmo ID na mesma seção identifica o mesmo registro. Um conteúdo idêntico é ignorado. Para um ID conhecido com conteúdo diferente, mostrar os valores atuais e importados para escolha.
3. **Tratar informações anteriores sem ID.** Procurar candidatos por cargo ou título, instituição ou organização e período. Apresentar coincidências para revisão. Atribuir ID estável aos registros novos. Se a estrutura do arquivo for desconhecida, explicar o formato esperado e mostrar o exemplo.
4. **Confirmar e salvar.** Aplicar as escolhas em uma única operação. Cancelar a prévia ou receber JSON inválido preserva o currículo anterior. Informar o campo ou item que precisa de correção.
5. **Reimportar.** Importar duas vezes o mesmo arquivo exportado deve produzir uma só ocorrência de cada item. Omitir um item no arquivo importado não solicita sua exclusão.

## 7. Direcionamento na captura (tipo de post e destino)

O produto não depende de IA para organizar o que é salvo. Quem decide para onde cada registro vai é a própria pessoa, em dois passos rápidos dentro de **O que você quer guardar?**:

1. **Escolher o tipo de post.** A barra de criar tem só a pergunta e os tipos: **Nota**, **Link**, **Livro ou filme**, **Artigo de estudo**, **Desejo**, **Gasto** e **Lembrete**. Escolher um abre a janela com os campos essenciais daquele tipo; os demais entram por “+”. O que for digitado vira rascunho automático e não se perde ao sair. O tipo define os campos e o destino padrão. Um gasto pede valor e data e vai para **Gastos**. Um lembrete pede data e vai para **Lembretes**. Se o texto colado numa nota for um endereço, a interface sugere trocar para **Link**.
2. **Escolher o destino no dropdown “Salvar em”.** Lista as coleções (grupos/hubs) existentes, como **Pessoal** e **Trabalho**, mais **Sem coleção (a organizar depois)** e **+ Nova coleção…**, que cria o grupo ali mesmo sem sair da captura. O último destino usado para cada tipo vira o padrão da próxima vez.

| Tipo escolhido | Campos | Destino padrão | Pode mudar no dropdown? |
|---|---|---|---|
| Nota | Texto | Mural, na coleção usada por último ou “a organizar” | Sim |
| Link | Endereço, título, por que estou guardando, Ler mais tarde | Último usado para links | Sim |
| Livro ou filme | Formato, nome, autor ou direção, situação e capa. O resto entra por “+” | Biblioteca | Não (prateleiras por situação, gênero ou estrelas) |
| Artigo de estudo | Link e pasta | Estudos | Sim, entre as pastas |
| Desejo | Só o link do produto | Wishlist | Não |
| Gasto | Valor, data da despesa, descrição, categoria | Gastos | Não (categoria livre) |
| Lembrete | Texto, data, horário opcional | Lembretes | Não |
| Aprendizado / Conquista *(futuro)* | Relato, data, evidência | Aprendizados | Sim, e caixas “Adicionar também ao currículo” e “Registrar no brag document” |

**Currículo e brag document sem sugestão automática.** Ao salvar um Aprendizado ou Conquista, a pessoa marca manualmente se o registro também deve virar item do currículo ou entrada do brag document. Cada destino abre um formulário curto pré-preenchido com o texto da postagem, que pode ser editado antes de confirmar. O item criado guarda o vínculo com a postagem original.

A consulta “O que aprendi nos últimos seis meses e apliquei em projetos?” é respondida por filtros: tipo Aprendizado + período + coleção do projeto, com links para as evidências.

## 8. Dados, acesso e dispositivos

**Protótipo atual.** Os dados e os rascunhos ficam no armazenamento do navegador, separados por endereço: o que foi salvo abrindo o `index.html` direto não aparece em `http://localhost:8000` e vice-versa. **Exportar backup** e **Importar backup**, no menu do perfil, levam tudo de um para o outro. A captura da Wishlist depende do servidor local (`servidor.py`, aberto pelo `iniciar.bat`), que lê a página do produto. Capas da biblioteca são reduzidas e guardadas junto dos dados.

**Primeira versão local.** A proposta é guardar o banco SQLite e uma pasta de anexos dentro de uma pasta escolhida no PC. O banco mantém registros, coleções, comentários, vínculos e dados do currículo. A interface lê e grava nessa base. Fechar e reabrir o app recupera os dados. O JSON exportado leva o currículo. Para transportar todo o arquivo pessoal, a cópia precisa incluir a base e os anexos.

**Uso no PC e no celular.** A evolução prevista inclui conta privada com login e sincronização. Um registro feito offline fica salvo no aparelho e recebe uma indicação de sincronização pendente. Ao reconectar, o mesmo ID evita duplicação. Edições concorrentes que alterem o mesmo campo precisam de resolução visível. Para acessar dados no celular com o PC desligado, será necessário um serviço disponível independentemente do computador.

**Decisões técnicas abertas.** Escolha da tecnologia da interface, distribuição como app instalado ou app web, provedor de login e hospedagem da sincronização. A primeira entrega pode ser construída antes dessas decisões.

## 9. Sequência de entrega e critérios de aceite

| Etapa | Entrega | Como verificar |
|---|---|---|
| 1 · Início e links | Captura, feed, favoritos, ler mais tarde, busca, edição e persistência local | Salvar um artigo com comentário, reencontrá-lo pela frase, favoritar, marcar como lido e conferir o mesmo registro após reabrir o app. |
| 1 · Currículo | Importação com prévia, inclusão, edição, exclusão e exportação | Importar o exemplo duas vezes, editar um cargo, excluir um curso e exportar. Reabrir a aplicação e conferir a prévia. O JSON exportado deve refletir as duas mudanças. |
| 2 · Biblioteca, wishlist, mural e gastos *(feito no protótipo)* | Prateleiras de livros e filmes, vitrine capturada por link, mural de post-its, quadro de lembretes, gastos | Adicionar um livro com capa e estrelas e vê-lo na prateleira. Colar o link de um produto e ver foto, nome e preço. Marcar como comprado e conferir o gasto. Corrigir um gasto e ver o total mudar. |
| 3 · Aprendizados e carreira | Tipos Aprendizado e Conquista, envio manual para currículo e brag document | Registrar um curso como Aprendizado, marcar apenas “Registrar no brag document” e abrir a evidência por ele. O currículo não recebe nada sem a marcação correspondente. |
| 4 · Acesso entre dispositivos | Conta privada, sincronização e registro offline | Salvar um item no celular sem conexão, reconectar e reencontrar no PC uma única vez. |

As duas primeiras linhas compõem a mesma versão inicial. As demais registram a visão completa do produto e uma ordem proposta para implementá-la.
