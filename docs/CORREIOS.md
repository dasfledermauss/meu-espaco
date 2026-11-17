# Correios

Lugar do menu para **mandar um item guardado para outra pessoa** que usa o Tyba. Quem recebe clica em Salvar e o item cai na mesma seção do Tyba dela.

## Como usa

- **Enviar:** menu ⋯ do item → "Enviar pelo Correios" → escolhe a pessoa, escreve um bilhete (opcional) → Enviar. Para vários de uma vez: modo **Selecionar** → marcar → **Enviar**.
- **Receber:** menu **Correios** (com selo de quantas cartas) → **Salvar no meu Tyba** ou **Dispensar**. Chegando carta com o app aberto, aparece um aviso.
- Vale para link, livro/filme, artigo, imagem, nota, música e desejo. Não viajam: comentários, favorito, coleção, anotações, histórico de preço, "comprado", progresso de leitura. Livro/filme chega como "na fila"; desejo chega como "quero".
- Se já existe um item com o mesmo endereço (link, desejo), o Tyba avisa e não duplica.

## Quem aparece na lista

Quem abriu o Tyba logado com a conta Google e com a nuvem ligada. Só o **primeiro nome** fica guardado (`membros/{uid}`). Não há código de amigo nem pedido de aceite: o grupo é pequeno.

## Como funciona

- `correios/{uid-de-quem-recebe}/cartas/{id}`: cada carta tem `de`, `deNome`, `bilhete`, `enviadoEm` e uma cópia do item.
- Qualquer conta logada pode **criar** carta na caixa de outra (a regra confere que `de` é ela mesma). Só a dona da caixa **lê e apaga**.
- Limite: cartas acima de ~700 KB não seguem (imagem muito grande), por causa do limite de 1 MB do Firestore.
- O módulo é `assets/js/correios.js`; o acesso ao Firestore está em `Nuvem.correios` (`nuvem.js`).

## Passo manual depois de atualizar (uma vez)

1. Firebase Console → **Firestore Database** → **Regras**.
2. Apague o conteúdo e cole o arquivo `firestore.rules` inteiro (está na raiz do projeto).
3. **Publicar**.

Sem isso o Correios mostra a caixa vazia e o envio falha com erro de permissão.

## Limites conhecidos

- Quem só usa o Tyba neste navegador, sem conta, não participa.
- Todo mundo que usa o Tyba vê o primeiro nome de todos na lista de envio. Se o grupo crescer, vale trocar por código de amigo.
