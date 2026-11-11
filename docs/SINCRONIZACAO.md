# Meu Espaço — sincronização (Firebase)

Com a sincronização ligada, os registros deixam de viver só no navegador: eles ficam na sua conta e aparecem em qualquer aparelho onde você entrar. O que você muda num lugar chega no outro sozinho.

## Como funciona

- **Login:** o mesmo botão do Google da tela de entrada. O token que o Google devolve entra também no Firebase Auth, então não existe segundo login.
- **Onde os dados ficam:**

| Caminho | Conteúdo |
|---|---|
| `espacos/{uid}` | perfil, coleções, pastas de estudo, currículo |
| `espacos/{uid}/itens/{id}` | notas, links, livros e filmes, artigos, desejos, gastos |
| `espacos/{uid}/lembretes/{id}` | lembretes |

- **O navegador continua sendo o primeiro lugar.** Tudo é salvo no aparelho na hora e enviado para a nuvem logo depois, só o que mudou. Sem internet, você continua usando normalmente e o envio acontece quando a conexão volta.
- **Conflito:** vence a versão mais recente de cada registro, comparando a hora da última alteração. Como é um espaço de uma pessoa só, isso só aparece se você editar o mesmo item em dois aparelhos ao mesmo tempo.
- **Capas e fotos** vão junto, como imagem reduzida dentro do próprio registro. Cada registro tem limite de 1 MB no Firestore, o que é bastante para as capas que o app gera (cerca de 40 KB).
- **O estado aparece em Configurações:** “Sincronizado”, “Salvando na nuvem…”, “Só neste navegador” ou o erro, quando houver.

## Configurar (uma vez)

### 1. Firebase Console → Authentication
- **Sign-in method:** ative o provedor **Google**.
- **Settings → Authorized domains:** acrescente `meu-espaco-eight.vercel.app`. O `localhost` já vem na lista.

### 2. Firebase Console → Firestore Database
- **Criar banco de dados** → modo de produção → escolha a região (`southamerica-east1`, em São Paulo, é a mais perto).
- **Rules:** cole o conteúdo de `firestore.rules`, na raiz do projeto, e publique:

```
match /espacos/{uid} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
  match /{documento=**} {
    allow read, write: if request.auth != null && request.auth.uid == uid;
  }
}
```

Sem essa regra, ou o banco recusa tudo, ou fica aberto para qualquer pessoa. Ela garante que cada conta só alcança o próprio espaço.

### 3. Nada a fazer no código
A configuração do projeto já está em `assets/js/config.js`. A `apiKey` do Firebase é pública por natureza: ela identifica o projeto e não autoriza nada sozinha. Quem protege os dados são as regras acima.

## Primeira vez que você entra

O que já estava no navegador é enviado para a nuvem. Se outro aparelho já tiver mandado coisas, as duas listas se juntam por identificador, sem duplicar. Antes de migrar, vale exportar um backup em **Configurações → Backup dos dados**.

## Se algo der errado

| Situação | O que fazer |
|---|---|
| “Sincronização desligada neste navegador” | Entre de novo com o Google pelo botão em Configurações. Acontece quando a sessão do Firebase expira mas a do site continua. |
| “Não consegui sincronizar agora” | Veja a conexão e use **Tentar de novo**. O que você salvou continua no aparelho. |
| Erro de permissão | As regras do Firestore não foram publicadas, ou o banco ainda não foi criado. |
| Abrindo o `index.html` com dois cliques | O login fica desligado e a sincronização também. Use o `iniciar.bat` ou o site publicado. |
