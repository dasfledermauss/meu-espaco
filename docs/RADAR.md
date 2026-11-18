# Radar

Um "Google Alerts" do Tyba. Fica como aba da **Biblioteca** (Livros e filmes · Links · **Radar** · Estudos).

## Como usa

- Escreva uma palavra-chave (seu nome, um concurso, um assunto) e **Adicionar alerta**. Marque "Incluir projetos do GitHub" se quiser achar repositórios (útil para acompanhar projetos de código aberto).
- A primeira busca só forma a base: nada vem marcado como novo. Depois, só o que for novo aparece com **Novo**, e a aba Radar mostra a contagem.
- Em cada achado: **guardar em Links**, **dispensar** (some da lista). Em cada alerta: **buscar agora**, **pausar**, **remover**, **marcar como visto**.
- A busca roda sozinha **de hora em hora enquanto o Tyba está aberto** e uma vez logo ao abrir. Com o Tyba fechado ela não roda (ver "Limites").

## Fontes

Públicas e sem chave: Google Notícias (RSS), Bing Notícias (RSS) e, se pedido, a busca de repositórios do GitHub. Não é a busca geral do Google: acha notícias e projetos, não qualquer página.

## Onde ficam os dados

As palavras-chave e os achados ficam no seu perfil (`S.perfil.radar`) e sincronizam com a sua conta. **Nunca** vão para o código do repositório. O servidor só recebe a palavra-chave para fazer a busca e devolve os resultados, sem guardar nada.

## Como funciona por dentro

- `GET /api/radar?q=...&fontes=noticias,github` devolve `{ achados: [{ titulo, url, fonte, data }], avisos: [] }`.
- Duas implementações com a mesma lógica: `servidor.py` (no computador) e `api/radar.js` (Vercel). Qualquer ajuste vale nos dois, com os testes em `tests/radar_teste.py` e `tests/radar_js_teste.mjs`.
- Repetidos (mesmo título em fontes diferentes) são juntados; guarda até 60 achados por alerta.
- O módulo é `assets/js/radar.js`.

## Limites

- A Vercel grátis só roda tarefas agendadas uma vez por dia, então a busca de hora em hora acontece **com o Tyba aberto**. Para rodar com ele fechado, o caminho é uma rotina no GitHub Actions gravando no Firebase (precisa de uma chave de serviço): fica como evolução.
- O Radar não procura cópias piratas nem links de download; é para acompanhar notícias e projetos públicos.
