# Curadoria Inteligente — Módulo 5

Frontend React/Vite para curadoria tecnológica, chat com IA, histórico,
integração GitHub e recomendações por projeto.

## Executar localmente

Instale as dependências e configure a URL da API:

```powershell
npm install
Copy-Item .env.example .env
```

O `.env.example` aponta para a API local em `http://127.0.0.1:8000`.
Inicie o backend em outro terminal e execute:

```powershell
npm run dev
```

Validações disponíveis:

```powershell
npm test
npm run lint
npm run build
```

## Login e integrações

- O login usa a conta individual do Módulo 1. Para criar uma conta, acesse
  <https://green-river-02e44e810.2.azurestaticapps.net>.
- Login, MFA, renovação de token e logout passam pelas rotas proxy do backend
  Módulo 5; o navegador não chama a API de identidade diretamente.
- Access e refresh tokens ficam em `sessionStorage` e são removidos ao sair ou
  quando a sessão deixa de ser válida. Nunca os salve no repositório.
- O chat envia a pergunta para a busca de artigos e para o assistente do
  Módulo 7. O histórico é carregado do PostgreSQL do Módulo 5.
- Para uma conversa de projeto ou para salvar um repositório GitHub, use o UUID
  do projeto do Módulo 1. O backend confirma o acesso antes de persistir dados.

## Publicação

1. Publique primeiro o backend atualizado, incluindo
   `/auth/login`, `/auth/mfa/verify`, `/auth/refresh`, `/auth/logout` e
   `/auth/session`; confirme também `DATABASE_URL` e as migrações até
   `0003_integrate_user_workflows`.
2. Configure `VITE_API_URL` como a raiz HTTPS da API (sem `/consultas`) no
   ambiente de build do frontend.
3. Gere e publique novamente o frontend. O Vite incorpora `VITE_API_URL`
   durante o build; alterar uma configuração em runtime não atualiza os
   arquivos já publicados.
4. Confirme que o backend permite a origem HTTPS exata do frontend em CORS.
5. Teste login/MFA, envio de pergunta, histórico e salvamento de repositório
   com uma conta individual e um projeto ao qual ela tenha acesso.

As alterações locais nos repositórios não são publicadas automaticamente.
