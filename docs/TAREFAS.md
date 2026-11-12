# Tarefas

Área para o que precisa ser feito, com um resumo fixo na coluna da direita do Início.

## O que é uma tarefa

Uma tarefa é **uma linha só**: o que precisa ser feito. Sem subtarefas, sem descrição longa — quando algo é grande demais para uma linha, vira duas tarefas.

| Campo | Obrigatório | Observação |
|---|---|---|
| Título | sim | o que precisa ser feito |
| Prazo | não | data; entra pelo “+ Prazo” |
| Situação | não | A fazer, Fazendo ou Feito |
| Coleção | não | a mesma lista de coleções do resto do sistema |

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

## O resumo na lateral

No Início, o primeiro cartão da coluna direita é **Tarefas**: barra de progresso com “X de Y feitas hoje” e as próximas três abertas, as com prazo mais perto primeiro. Tarefa atrasada aparece com o ponto de alerta. O cartão só existe quando há tarefa aberta ou feita hoje.

## Critérios de aceite

- Criar uma tarefa pelo compositor com só o título, sem abrir mais nada.
- Pôr prazo numa tarefa e ver o lembrete correspondente na faixa do Início.
- Riscar a tarefa e conferir que o lembrete dela sumiu dos pendentes.
- Concluir o lembrete pela faixa e conferir que a tarefa ficou riscada.
- Trocar entre as três visões sem perder o que foi marcado.
- Ver o resumo da direita mudar de “0 de 3” para “1 de 3” ao riscar uma tarefa.
