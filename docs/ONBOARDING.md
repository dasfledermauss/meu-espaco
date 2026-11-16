# Onboarding

Sete passos curtos para quem abre o espaço pela primeira vez. Tom amigável, um assunto por passo, muito respiro.

## Quando aparece

- Sozinho, **só quando o espaço acaba de ser criado** (primeiro uso neste navegador). Quem já tem dados não vê.
- Substitui o popup de novidades dessa primeira vez; ao terminar, a versão atual já conta como vista.
- Para rever: menu da foto de perfil → **Primeiros passos**.
- O “já viu” fica em `localStorage` (`meuEspaco.onboarding`). Pular, Esc, “Explorar sozinho” e concluir contam como visto.

## Os passos

| # | Título | O que faz |
|---|---|---|
| 1 | Oi! Este é o seu espaço. | Pergunta como quer ser chamado (Enter avança). Guarda no perfil. |
| 2 | Por que Tyba? | Mostra o logo e explica o nome: do tupi, o sufixo -tyba (ou -tiba) indica abundância e ajuntamento, o lugar onde há muito de algo (Itatiba, “muitas pedras”; Ubatuba, “muitas canoas”). Só leitura. |
| 3 | O que cabe aqui | Oito cartões: notas, tarefas, imagens, links, livros e filmes, músicas, desejos, estudos. Só leitura. |
| 4 | Do seu jeito | Cor (azul, verde, grafite ou Personalizada, com seletor de cor; guarda em `perfil.corCustom`) e aparência (claro, escuro, automática). Aplica e salva na hora. |
| 5 | Seus pets moram aqui | Apresenta os pets e deixa escolher o Pet 1 e o Pet 2 (ou Nenhum). Salva na hora. |
| 6 | Atalhos que poupam tempo | Ctrl+V (cola imagem), Ctrl+K (busca), Shift+Espaço (Meu Espaço, o quadro de tarefas). |
| 7 | Tudo pronto | Usa o nome; botões para criar a primeira nota, tarefa, imagem ou link, ou “Explorar sozinho”. |

## Listinha “Para começar”

Cartão leve no Início, abaixo do bloco de guardar, só em espaço novo (quem já tinha registros não vê). Seis itens que **se riscam sozinhos**: guardar uma nota, criar uma tarefa, colar uma imagem, guardar um link, pôr foto no perfil, abrir o modo trabalho. Clicar num item faz a ação. Some quando todos estão feitos ou em **Dispensar** (`perfil.passosFim`).

## Hierarquia

Contagem “Passo n de 7” e barra segmentada no topo; ícone em círculo, título grande, uma frase de apoio e só então o conteúdo; uma ação principal por passo (Continuar), com Voltar e Pular discretos. O conteúdo entra com um fade curto, que respeita “reduzir movimento”.

## Critérios de aceite

- Espaço novo abre o passo 1; o nome digitado aparece no topo e no passo 5.
- Trocar a cor no passo 3 muda a tela atrás na hora.
- Pular em qualquer passo fecha e não reaparece ao recarregar.
- Primeiros passos, no menu do perfil, reabre.
- No celular, nenhum passo estoura a largura.
