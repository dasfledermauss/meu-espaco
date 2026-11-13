# Cachorrinho

Um pet em pixel art no alto do Início, acima de "O que você quer guardar?".

## Como brinca

- **Parado:** quadros de respiração; de tempos em tempos senta e volta a ficar de pé.
- **Clique nele:** late (balão "AU! AU!", pulinho e som sintetizado, sem arquivo de áudio).
- **Clique no chão:** cai comida (até 6 de uma vez). Ele anda até a mais próxima, abaixa e come; depois aparece um coração.
- **Som:** botão no canto do cenário ou Configurações → Cachorrinho. **Esconder** também fica em Configurações. Ficam em `perfil.petMudo` e `perfil.petOculto`.
- Respeita "reduzir movimento" do sistema: sem nuvens andando, sem sentar sozinho.

## Peças

| O quê | Onde |
|---|---|
| Folha de sprites 4×4 (célula 63×40) | `assets/img/pet/cachorro.png`. Linhas: 0 parado, 1 sentado, 2 andando, 3 abaixado. Todos olham para a direita (o lado contrário é espelhado por CSS). |
| Cenário | HTML/CSS e SVG em degraus dentro de `petHTML()` (`app.js`) e bloco "pet" do `estilo.css`; versão noturna no tema escuro. |
| Lógica | Bloco "pet" do `app.js`: um laço `requestAnimationFrame` que só trabalha quando `#pet-cena` está na página. O estado (posição, comidas) fica fora do DOM porque a tela é redesenhada a toda hora. |

## Trocar o cachorro

Gere outra folha com a mesma grade (4 poses × 4 quadros, células iguais, pés na base, olhando para a direita) e substitua o PNG. Se o tamanho da célula mudar, ajuste `PET.CW` e `PET.CH`.
