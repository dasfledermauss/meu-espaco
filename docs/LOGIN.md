# Meu Espaço — login com conta Google

## O que o login faz

- **Identifica você** e mostra nome, e-mail e foto no menu do perfil e em Configurações.
- **Protege a página publicada**: com a lista de e-mails liberados, só as contas dessa lista entram.
- **Usar a foto do Google** como foto de perfil, se você quiser (no menu da foto, dentro do Perfil).
- **Sair da conta** pelo menu da foto, no topo ou no Perfil.

Quando não se aplica:

| Como você abriu | Login |
|---|---|
| `index.html` com dois cliques | Desligado; entra direto no modo local |
| `iniciar.bat` / `localhost:8000` | Ligado |
| Site publicado (Vercel) | Ligado |

## A chave secreta não é usada

O arquivo `client_secret_….json` que o Google entrega tem **ID do cliente** e **chave secreta**.

- O **ID do cliente é público** — ele aparece no endereço do login. Fica em `assets/js/config.js`.
- A **chave secreta não entra no projeto**. Num site estático ela seria visível para qualquer visitante. Ela só faria sentido num fluxo servidor a servidor, que este projeto não usa.

O `.gitignore` já bloqueia `client_secret*.json`, `.env` e `config.local.json`. Se a chave secreta já tiver ido para um repositório público, gere outra no Google Cloud (**Credenciais → o cliente OAuth → Redefinir chave secreta**).

## Como a verificação funciona

1. O navegador mostra o botão do Google (biblioteca **Google Identity Services**) e recebe um **token de identidade** assinado pelo Google.
2. O token vai para `/api/sessao`, que confere com o próprio Google (`oauth2.googleapis.com/tokeninfo`): assinatura, validade, se foi emitido para este aplicativo e se o e-mail é verificado.
3. Se o e-mail estiver liberado, o servidor devolve um **cookie de sessão assinado** (HttpOnly, 30 dias). Um cookie adulterado ou vencido é recusado.

> A biblioteca antiga (`platform.js` e `gapi.auth2`) foi desligada pelo Google em 2023 e não é usada aqui.

## Configurar

### 1. No Google Cloud Console

Em **APIs e serviços → Credenciais → o seu ID do cliente OAuth**, acrescente em **Origens JavaScript autorizadas**:

```
http://localhost:8000
https://SEU-PROJETO.vercel.app
```

Sem isso o botão do Google não aparece. URIs de redirecionamento não são necessários.

### 2. No computador

Copie `config.local.exemplo.json` para **`config.local.json`** e ajuste:

```json
{
  "GOOGLE_CLIENT_ID": "…apps.googleusercontent.com",
  "EMAILS_PERMITIDOS": "seu-email@gmail.com",
  "SESSAO_SEGREDO": "um texto aleatório longo"
}
```

Esse arquivo fica fora do Git. Sem ele, o login continua funcionando, mas **qualquer conta Google entra** e a sessão cai quando o servidor reinicia.

### 3. Na Vercel

Em **Settings → Environment Variables**:

| Nome | Valor |
|---|---|
| `GOOGLE_CLIENT_ID` | o mesmo ID do cliente |
| `EMAILS_PERMITIDOS` | seu e-mail (vários, separados por vírgula) |
| `SESSAO_SEGREDO` | um texto aleatório longo |

Publique de novo depois de salvar.

## Limites honestos

- Os registros continuam **no navegador de quem acessa**. O login não sincroniza nem criptografa nada; ele identifica e barra a entrada.
- Como a página é estática, alguém com conhecimento técnico consegue ver o código da tela de entrada. O que protege de verdade é não haver dado seu no servidor: o conteúdo mora no seu navegador.
- Para sincronizar entre computador e celular de verdade, o passo seguinte é guardar os registros num banco ligado à conta — está previsto na etapa 4 do `ESCOPO.md`.
