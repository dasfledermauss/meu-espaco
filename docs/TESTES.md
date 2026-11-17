# Testes

Rode `node tests/run.js` (precisa do Playwright instalado). A suíte sobe um servidor local sozinha, na porta 8799, e roda tudo em Chromium. Para um teste só: `node tests/run.js arrastar` (filtra pelo nome).

O que cobre hoje:

- sem scroll lateral em 390px em todas as páginas, no claro e no escuro, e sem erros de script;
- onboarding: abre em espaço novo, tem 7 passos e salva a cor Personalizada;
- quadro de tarefas (Meu Espaço): arrastar pelo título até uma coluna vazia, botão de mover e nome editável;
- currículo: a tela abre e importar um JSON mostra a revisão, sem erros de script;
- músicas: a lista abre e tocar mostra o mini player (erros do iframe do YouTube são ignorados);
- wishlist: captura que falha não é repetida em loop (servidor simulado devolvendo erro);
- servidor: preço da Amazon em partes (`tests/servidor_teste.py`, sem rede);
- excluir cria a lápide e o item não volta ao recarregar;
- wishlist em lote (um link por linha, repetido pulado);
- menu em gaveta e dia do calendário em folha de baixo no celular;
- Início sem estouro de largura no celular.

**Regra do projeto:** ao criar uma função nova ou corrigir um bug, acrescente o teste em `tests/run.js` e rode a suíte antes de publicar. A versão do popup de novidades é lida de `assets/js/atualizacoes.js`, então os testes não ficam presos no aviso depois de subir a versão. Os dados de exemplo estão em `tests/semente.js`.
