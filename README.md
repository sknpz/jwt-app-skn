# Biblioteca JWT: App

Front-end de um sistema de gestão de biblioteca, com renovação automática de sessão por refresh token.

Trabalho integrador de Desenvolvimento Back-end e Front-end (ADS, UNIPAR). A API e o enunciado estão no [jwt-api-skn](https://github.com/sknpz/jwt-api-skn).

**Stack:** Next.js 16, React 19, TypeScript, Axios.

## Como rodar

Precisa de Node.js 20 ou superior e da [API](https://github.com/sknpz/jwt-api-skn) rodando na porta 3001.

```bash
npm install
npm run dev
```

Abra `http://localhost:3000` e entre com o administrador criado pelo seed da API:

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | `admin@biblioteca.com` | `123456` |
| Atendente, criado por `npm run seed:demo` na API | `atendente@biblioteca.com` | `123456` |

### Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `API_URL` | Não | Endereço da API, lido só no servidor do Next. Padrão: `http://localhost:3001/v1` |

## Telas

| Tela | Rota | O que faz |
|---|---|---|
| Login | `/` | Validação e mensagem de erro |
| Dashboard | `/dashboard` | Cards de livros, ativos, atrasados e multas (administrador) |
| Categorias e Autores | `/dashboard/categories`, `/dashboard/authors` | Listagem, cadastro, edição e exclusão |
| Livros | `/dashboard/books` | Busca e filtros, cadastro com categoria e vários autores, exemplares disponíveis |
| Leitores | `/dashboard/readers` | Cadastro, busca e histórico de empréstimos |
| Empréstimos | `/dashboard/loans` | Novo empréstimo, filtro por status, devolução mostrando a multa |
| Atendentes | `/dashboard/users` | Cadastro e ativar/desativar (administrador) |

O nome do usuário e o botão de sair ficam no topo. O atendente não vê o menu de Atendentes nem os botões de escrita do acervo, e a API também bloqueia essas ações com 403.

## Como funciona a sessão

```text
Tela ──> /api/v1/... (route handler do Next) ──> API
         lê o token do cookie httpOnly
         e envia em Authorization: Bearer
```

1. O login roda numa server action, que grava os dois tokens em cookies httpOnly (`lib/session.ts`).
2. As telas nunca falam direto com a API: chamam `/api/v1/*` do próprio Next, que acrescenta o token (`app/api/v1/[...path]/route.ts`). Como o navegador só fala com o Next, o CORS da API não é necessário para este app.
3. Quando o access token expira, a API responde 401 e o **interceptor** (`lib/http.ts`) entra em ação:
   - chama `/api/session/refresh` **uma única vez** e repete a requisição original;
   - se várias requisições derem 401 ao mesmo tempo, todas aguardam a mesma promise de refresh, que funciona como fila;
   - se o refresh for inválido, a sessão acabou e o usuário volta para o login.
4. O `proxy.ts` redireciona para o login quem não tem sessão, e para o dashboard quem já está logado e abre o login.

### Por que cookie httpOnly, e quais são os riscos

O enunciado sugere `localStorage` ou `sessionStorage`, mas neles qualquer script da página consegue ler o token. Um ataque de **XSS** levaria o refresh token, que dura 7 dias. Com cookies httpOnly, o JavaScript da página não enxerga os tokens.

A escolha tem riscos próprios:

- **CSRF:** o navegador envia cookies sozinho. O `SameSite=Lax` impede que outro site faça POST, PUT ou DELETE com eles.
- **XSS continua perigoso:** um script injetado não rouba o token, mas consegue fazer chamadas enquanto a página estiver aberta. O cookie reduz o estrago, não elimina o problema.
- **Mais uma camada:** toda chamada passa pelo servidor do Next.

### Renovação com várias abas

A API trata o reuso de um refresh token como roubo e derruba todas as sessões. Duas abas com o token expirado poderiam disparar isso sem ninguém ter feito nada de errado. Por isso o refresh usa a [Web Locks API](https://developer.mozilla.org/docs/Web/API/Web_Locks_API): a segunda aba espera a primeira terminar e já envia o cookie novo.

## Para ver a renovação funcionando

No `.env` da API, use `ACCESS_TOKEN_EXPIRES_IN=30s` e reinicie. Abra a aba **Network** do DevTools, espere 30 segundos e navegue para outra tela: aparecem as respostas 401, **um** `session/refresh` e as mesmas requisições repetidas com 200, sem sair da tela.
