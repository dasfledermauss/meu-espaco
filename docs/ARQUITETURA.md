# Arquitetura do código

O `assets/js/app.js` era um arquivo único de ~4900 linhas. Ele está sendo dividido em módulos, aos poucos, sempre com a suíte de testes (`node tests/run.js`) passando a cada passo.

## Como um módulo funciona

Cada módulo é um script comum (sem `import`) que define uma **fábrica** em `window`:

```js
window.TybaPet = function (ctx) { ...; return { PETS, petFalar, ... }; };
```

- O `app.js` chama a fábrica uma vez e recebe só o que o resto do app usa.
- `ctx` entrega o estado e as utilidades. As funções vão como "embrulhos" (`(...a) => fn(...a)`), para funcionar mesmo com utilidades definidas depois no `app.js`.
- `S` (o estado) troca de objeto ao importar backup ou sincronizar. Por isso o módulo recebe `ctx.S()` e usa um `Proxy`, que sempre aponta para o estado atual.
- Os scripts são carregados em `index.html` antes do `app.js` e entram na lista de cache de `sw.js`.

## Módulos

| Arquivo | O que tem | Desde |
|---|---|---|
| `assets/js/pet.js` (`TybaPet`) | cenário do pet, cuidados, conversa | v5.55 |
| `assets/js/curriculo.js` (`TybaCurriculo`) | adaptador de importação do currículo e a tela | v5.56 |
| `assets/js/musica.js` (`TybaMusica`) | lista de músicas, ambiente e mini player | v5.57 |

## Plano de extração

Mapa completo por seção, com linhas e ordem: planilha "Divisão do app.js". Ordem combinada:

1. Currículo (adaptador + tela). **Feito.** As janelas de PDF ficaram no `app.js`, porque as janelas servem também às notas.
2. Mini player de música e músicas. **Feito.**
3. Nuvem e conta Google.
4. Arrastar para reordenar, imagens e janelas.
5. Tempo, PWA, captura e novidades.

Ficam no núcleo: utilidades, estado, consultas, componentes, tema, roteamento, ações, envio de formulários, modal e as telas pequenas.

## Regras

- Um módulo por vez, com teste novo ou existente cobrindo a área.
- Ao mover código, nada muda na tela.
- Atualize a tabela acima e `docs/ATUALIZACOES.md` a cada extração.
