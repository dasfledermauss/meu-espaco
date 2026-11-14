# Tyba — Universo sonoro

Sons curtos e suaves, sintetizados com Web Audio em `assets/js/sons.js` (sem arquivos de áudio; funcionam offline).

| Som | Quando toca |
|---|---|
| `guardar` | Guardar ou salvar um item (formulário e colar link) |
| `concluir` | Concluir tarefa, lembrete, mídia ou marcar como comprado |
| `favoritar` | Favoritar |
| `desfazer` | Desfazer favorito, tarefa, compra ou mídia concluída |
| `excluir` | Confirmar uma exclusão (item ou lembrete) |
| `abrir` | Abrir uma janela (muito leve) |
| `logo` | Trocar o logo com 3 cliques |

Não há som em navegação, hover ou rolagem. O pet tem o próprio latido (ver `PET.md`).

**Ajustes:** Configurações → Sons (liga/desliga e volume). Guardados no perfil (`somUI`, `somVolume`; padrão: ligado, 40).

**Para ligar um som novo:** adicione a lista de notas em `SONS` (em `sons.js`) e chame `SONS.tocar('nome')`. Os cliques de ações ficam centralizados no início do despachante de cliques do `app.js`.
