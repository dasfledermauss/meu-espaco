# Tarefas

Área para o que precisa ser feito, com um resumo fixo na coluna da direita do Início.

## O que é uma tarefa

Uma tarefa é **uma linha só**: o que precisa ser feito. Sem subtarefas, sem descrição longa — quando algo é grande demais para uma linha, vira duas tarefas.

| Campo | Obrigatório | Observação |
|---|---|---|
| Título | sim | o que precisa ser feito |
| Descrição | não | detalhes e contexto; aparece cortada na lista e inteira na janela da tarefa |
| Prazo | não | data; entra pelo “+ Prazo” |
| Situação | não | A fazer, Fazendo ou Feito |
| Coleção | não | a mesma lista de coleções do resto do sistema |

**Colar uma lista.** No campo de *Nova tarefa*, texto com várias linhas vira **uma tarefa por linha** — o aviso embaixo do campo diz quantas vão sair. Prazo, situação e coleção escolhidos valem para todas. Marcadores de lista colados junto (`-`, `*`, `•`, `1.`, `[ ]`) são removidos.

Tarefa é um tipo de post como os outros (`tipo: 'tarefa'`), então ela aparece no feed do Início, entra na busca (Ctrl+K), aceita comentário, favorito e “Mover para coleção”, e sincroniza entre aparelhos como tudo mais.

## Tarefa e lembrete

São coisas diferentes e continuam separadas:

- **Lembrete** é “me avise no dia X”.
- **Tarefa** é “isso precisa ser feito”, com ou sem data.

A ponte entre eles: ao salvar uma tarefa **com prazo** e com *Criar lembrete no prazo* marcado, o sistema cria um lembrete ligado àquela tarefa (`motivo: 'tarefa'`), que aparece na faixa do Início e no quadro de Lembretes com a etiqueta “prazo de tarefa”. Concluir esse lembrete risca a tarefa, e riscar a tarefa conclui o lembrete — os dois nunca ficam fora de sincronia. Tirar o prazo (ou desmarcar o aviso) apaga o lembrete.

## A tela

No menu lateral, **Tarefas** mostra o número de tarefas abertas. A tela tem um seletor com três visões, e a escolha vale enquanto a aba estiver aberta:

| Visão | Como organiza |
|---|---|
| **Por prazo** | Atrasadas, Hoje, Próximos 7 dias, Depois e Sem prazo. É a visão padrão. |
| **Quadro** | Três colunas — A fazer, Fazendo, Feito — com botões para mover o cartão entre elas. |
| **Por coleção** | Agrupadas pela coleção de cada uma, mais “Sem coleção”. |

Em qualquer visão, o **círculo à esquerda risca a tarefa na hora**, sem abrir janela. As feitas saem da lista e ficam num bloco recolhido “Feitas (n)” no fim da página (no Quadro, elas são a coluna Feito).

## Modo trabalho

**Shift + Espaço** abre um quadro de tarefas por cima de tudo, e fecha de novo (Esc também). O botão de lista na barra do topo faz o mesmo e fica aceso enquanto o modo está ligado.

Dentro dele só existem as três colunas — A fazer, Fazendo, Feito —, o botão de nova tarefa e o disco das músicas, à direita. O player continua por cima e tocando. Fora de um campo de texto, o atalho não atrapalha a digitação: dentro de um input ou textarea o Shift + Espaço é só um espaço.

## O atalho de guardar

O atalho existe **só dentro do modo trabalho**. No canto de baixo à esquerda há um botão redondo. **Passar o mouse** abre a lista de tipos (Nota, Tarefa, Imagem, Link, Livro, Artigo, Música, Desejo, Gasto, Lembrete) e um clique abre a janela daquele tipo. Tipo com rascunho guardado mostra um pontinho. No celular ele responde ao toque.

## O resumo na lateral

No Início, o cartão **Tarefas** da coluna direita traz a barra de progresso com a conta curta (“1/4”) e as próximas quatro abertas, as com prazo mais perto primeiro, com a data em 12/11. O texto da tarefa é o que manda: a data encolhe antes dele. Tocar numa delas abre a janela da tarefa, com descrição, situação, prazo e coleção, de onde dá para riscar ou editar. Tarefa atrasada aparece com o ponto de alerta. O cartão só existe quando há tarefa aberta ou feita hoje.

## Critérios de aceite

- Criar uma tarefa pelo compositor com só o título, sem abrir mais nada.
- Pôr prazo numa tarefa e ver o lembrete correspondente na faixa do Início.
- Riscar a tarefa e conferir que o lembrete dela sumiu dos pendentes.
- Concluir o lembrete pela faixa e conferir que a tarefa ficou riscada.
- Trocar entre as três visões sem perder o que foi marcado.
- Ver o resumo da direita mudar de “0 de 3” para “1 de 3” ao riscar uma tarefa.
