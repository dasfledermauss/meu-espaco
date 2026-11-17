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
| `assets/js/arrastar.js` (`TybaArrastar`) | reordenar arrastando (post-its, menu, blocos da direita) e arrastar cartões de tarefa | v5.59 |
| `assets/js/clima.js` (`TybaClima`) | previsão do tempo (cartão, busca de cidade, cache) | v5.62 |
| `assets/js/captura.js` (`TybaCaptura`) | captura de links e produtos pelo servidor | v5.62 |
| `assets/js/novidades.js` (`TybaNovidades`) | popup "O que há de novo" | v5.62 |
| `assets/js/correios.js` (`TybaCorreios`) | Correios: caixa de entrada, envio de itens para outra pessoa (usa `Nuvem.correios`) | v5.68 |
| `assets/js/conta.js` (`TybaConta`) | entrada com Google, sessão e ciclo de sincronização (usa `nuvem.js` para falar com o Firestore) | v5.58 |

## Plano de extração

Mapa completo por seção, com linhas e ordem: planilha "Divisão do app.js". Ordem combinada:

1. Currículo (adaptador + tela). **Feito.** As janelas de PDF ficaram no `app.js`, porque as janelas servem também às notas.
2. Mini player de música e músicas. **Feito.**
3. Nuvem e conta Google. **Feito.** (Sem teste automático do login: precisa de Google e Firebase reais. O teste de todas as telas garante que o app abre em modo local sem erro.)
4. Arrastar para reordenar. **Feito.** Imagens (colar/soltar) e janelas ficaram no `app.js`: misturam código de outras áreas (tarefas, menu, atalhos) e não separam sem reescrever.
5. Tempo, captura e novidades. **Feito.** O PWA ficou no `app.js`: são poucos ouvintes ligados à tela e ao topo.

**Plano concluído em 16/11/2026:** `app.js` de ~4900 para ~3400 linhas, 8 módulos.

Ficam no núcleo: utilidades, estado, consultas, componentes, tema, roteamento, ações, envio de formulários, modal e as telas pequenas.

## Regras

- Um módulo por vez, com teste novo ou existente cobrindo a área.
- Ao mover código, nada muda na tela.
- Atualize a tabela acima e `docs/ATUALIZACOES.md` a cada extração.
