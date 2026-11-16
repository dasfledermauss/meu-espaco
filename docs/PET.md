# Cachorrinho

Um pet em pixel art no alto do Início, acima de "O que você quer guardar?".

## Como brinca

- **Parado:** quadros de respiração; de tempos em tempos senta e volta a ficar de pé.
- **Clique nele:** late (balão "AU! AU!", pulinho e som sintetizado, sem arquivo de áudio).
- **Clique no chão:** joga a bolinha ali (cai do alto); ele corre atrás e chuta de um lado para o outro.
- **Pets:** salsicha, pinscher, frajola, shollie e schnauzer, escolhidos no botão **Pets** do cenário (popup com um card por pet). Cada um tem folha própria, tamanho de célula e voz (`PET_TIPOS`).
- **Dois pets:** o popup tem “Pet 1” (`perfil.petTipo`) e “Pet 2” (`perfil.pet2.tipo`, ou Nenhum). Cada pet tem a sua casinha, plaquinha com nome e cor. Os dois brincam com a bolinha, comem, tomam banho e fazem cocô; quem fala é sorteado entre os dois. A bolinha, as vasilhas e a conversa são da cena toda.
- **Casinha:** clique nela para trocar a cor (6 opções em `PET_CASAS`): `perfil.petCasa` e `perfil.pet2.casa`.
- **Som:** botão no canto do cenário ou Configurações → Cachorrinho. **Esconder** também fica em Configurações. Ficam em `perfil.petMudo` e `perfil.petOculto`.
- Respeita "reduzir movimento" do sistema: sem nuvens andando, sem sentar sozinho.

## Conversa

A cada 50 a 90 segundos (primeira fala uns 6 a 11 s depois de abrir), só com a janela visível, sem janela aberta e com o pet parado, sentado ou andando, ele solta uma frase no balão. Assuntos, com pesos: o que você guardou nas últimas 36 h, tarefas feitas, lembretes e tarefas de hoje ou atrasados, o tempo (se a cidade da previsão estiver definida), fim de semana, bom dia/boa tarde/boa noite, elogios e carinho. Ao voltar depois de mais de 2 h (guardado em `localStorage` `meuEspaco.petVisto`), diz que sentiu falta.

O balão dura de 7 a 14 s (3 s + 1,1 s por palavra), quebra em no máximo 3 palavras por linha e some ao clicar nele. As frases ficam em `assets/js/pet-frases.js`: é só acrescentar linhas nas listas. Marcadores: `{t}` título, `{n}` número, `{nome}` seu primeiro nome (escreva no fim da frase). Desligar: engrenagem do cenário → Conversa do pet (`perfil.petCala`).

Assuntos da Agenda: evento hoje ou amanhã, contagem regressiva, semana cheia ou livre, stickers do calendário (cada um tem fala própria) e som de fundo ou música tocando.

## Cuidados

- **Vasilhas:** comida e água (esvaziam em 5 min cada; cada refeição tira 25%), à esquerda do cenário. O nível segue o horário real e fica em `perfil.petPote` (momento do último enchimento). Clique na vasilha para encher. Ele visita sozinho as que não estão cheias, e avisa "Fome!" ou "Sede!" quando vazias. Depois de comer ele faz **cocô** (de 7 a 14 s depois, no máximo 3 no chão). Clique no cocô para limpar.
- **Banho:** botão "Banho". Ele vai ao meio do cenário, fica sentado entre bolhas e se sacode.
- **Nome:** clique na plaquinha da casinha e escolha até 14 letras. Fica em `perfil.petNome` (pet 2: `perfil.pet2.nome`).

## Fases do dia

Pela hora do aparelho: amanhecer 5h–8h, manhã 8h–12h, tarde 12h–17h, entardecer 17h–19h, noite 19h–5h. Cada fase tem céu, chão, morros, nuvens e astro em `PET_FASES` (`app.js`); a posição do sol e da lua fica no `estilo.css` por `data-fase`. Para testar uma fase: `__meuEspaco.pet.forcar = 'noite'` no console.

## Peças

| O quê | Onde |
|---|---|
| Folhas de sprites 4×4 (salsicha 63×40, pinscher 45×43, frajola 51×38, shollie 62×42, schnauzer 54×40) | `assets/img/pet/salsicha.png`, `pinscher.png`, `frajola.png`, `shollie.png`, `schnauzer.png`. Linhas: 0 parado, 1 sentado, 2 andando, 3 abaixado. Todos olham para a direita (o lado contrário é espelhado por CSS). |
| Cenário | HTML/CSS e SVG em degraus dentro de `petHTML()` (`app.js`) e bloco "pet" do `estilo.css`; versão noturna no tema escuro. |
| Lógica | Bloco "pet" do `app.js`: um laço `requestAnimationFrame` que só trabalha quando `#pet-cena` está na página. O estado (posição, bolinha, cocôs) fica fora do DOM porque a tela é redesenhada a toda hora. |

## Trocar o cachorro

Gere outra folha com a mesma grade (4 poses × 4 quadros, células iguais, pés na base, olhando para a direita) e substitua o PNG. Se o tamanho da célula mudar, ajuste `CW` e `CH` em `PET_TIPOS`. O corpo do bichinho não recebe clique (`pointer-events: none`): o latido é achado pela posição do clique.


## Espaçamento

Com dois cães, o de trás (o segundo) se afasta devagar quando para ou senta a menos de uma largura do outro. Cada cocô novo procura o ponto livre mais perto: nunca fica a menos de 34px de outro cocô, de qualquer dos cães.
