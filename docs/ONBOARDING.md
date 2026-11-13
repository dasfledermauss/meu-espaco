# Onboarding

Cinco passos curtos para quem abre o espaço pela primeira vez. Tom amigável, um assunto por passo, muito respiro.

## Quando aparece

- Sozinho, **só quando o espaço acaba de ser criado** (primeiro uso neste navegador). Quem já tem dados não vê.
- Substitui o popup de novidades dessa primeira vez; ao terminar, a versão atual já conta como vista.
- Para rever: menu da foto de perfil → **Primeiros passos**.
- O “já viu” fica em `localStorage` (`meuEspaco.onboarding`). Pular, Esc, “Explorar sozinho” e concluir contam como visto.

## Os passos

| # | Título | O que faz |
|---|---|---|
| 1 | Oi! Este é o seu espaço. | Pergunta como quer ser chamado (Enter avança). Guarda no perfil. |
| 2 | O que cabe aqui | Oito cartões: notas, tarefas, imagens, links, livros e filmes, músicas, desejos, estudos. Só leitura. |
| 3 | Do seu jeito | Cor (azul, verde, grafite) e aparência (claro, escuro, automática). Aplica e salva na hora. |
| 4 | Atalhos que poupam tempo | Ctrl+V (cola imagem), Ctrl+K (busca), Shift+Espaço (modo trabalho). |
| 5 | Tudo pronto | Usa o nome; botões para criar a primeira nota, tarefa, imagem ou link, ou “Explorar sozinho”. |

## Listinha “Para começar”

Cartão leve no Início, abaixo do bloco de guardar, só em espaço novo (quem já tinha registros não vê). Seis itens que **se riscam sozinhos**: guardar uma nota, criar uma tarefa, colar uma imagem, guardar um link, pôr foto no perfil, abrir o modo trabalho. Clicar num item faz a ação. Some quando todos estão feitos ou em **Dispensar** (`perfil.passosFim`).

## Hierarquia

Contagem “Passo n de 5” e barra segmentada no topo; ícone em círculo, título grande, uma frase de apoio e só então o conteúdo; uma ação principal por passo (Continuar), com Voltar e Pular discretos. O conteúdo entra com um fade curto, que respeita “reduzir movimento”.

## Critérios de aceite

- Espaço novo abre o passo 1; o nome digitado aparece no topo e no passo 5.
- Trocar a cor no passo 3 muda a tela atrás na hora.
- Pular em qualquer passo fecha e não reaparece ao recarregar.
- Primeiros passos, no menu do perfil, reabre.
- No celular, nenhum passo estoura a largura.
