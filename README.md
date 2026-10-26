# Curadoria Inteligente

Frontend React para o assistente de curadoria de artigos sobre tecnologia.

## Rodar localmente

Requer Node.js 18 ou superior.

```bash
npm install
npm run dev
```

Configure `VITE_API_URL` para apontar a interface para outra API. Em ambiente
local, copie `.env.example` para `.env`; sem configuração, a aplicação usa a API
publicada do projeto.

Para validar o build de produção:

```bash
npm run build
```

## CI/CD e publicação no Azure

O workflow em `.github/workflows/main.yml` executa lint, testes, auditoria das
dependências e builds do frontend e Docker em pull requests. Em push na `main`,
publica a imagem no GitHub Container Registry (GHCR) e faz deploy automático
no Azure App Service `FrontModulo5`.

### Configuração necessária no GitHub

Em **Settings → Secrets and variables → Actions**, configure:

- Secret `GHCR_READ_TOKEN`: Personal Access Token com permissão `read:packages`
  para o proprietário da imagem no GHCR. O valor é usado pelo App Service para
  baixar a imagem privada; não o coloque no código.
- Secrets Azure `AZUREAPPSERVICE_CLIENTID_...`,
  `AZUREAPPSERVICE_TENANTID_...` e `AZUREAPPSERVICE_SUBSCRIPTIONID_...` já
  referenciados pelo workflow. A identidade federada deve ter acesso ao app.
- Opcional: variable `VITE_API_URL` com a URL pública da API, incluindo
  `/consultas`. Se não for definida, o frontend usa a API publicada do projeto.

A identidade Azure precisa ter uma credencial federada para este repositório e
o branch `main`, além de permissão para configurar e reiniciar o App Service
(por exemplo, **Contributor** no recurso ou grupo de recursos). O workflow
descobre o grupo de recursos do App Service pelo nome do app.

O token criado para GHCR deve ter acesso de leitura ao pacote. A publicação no
GHCR usa o `GITHUB_TOKEN` do próprio workflow, com permissão `packages: write`.
Configure também a API para aceitar CORS do domínio do frontend publicado.
O workflow atualiza o App Service `FrontModulo5` e configura sua porta Docker
como `8080`.

### Dependabot

O `.github/dependabot.yml` verifica semanalmente dependências npm, Docker e
GitHub Actions. O workflow também executa `npm audit` nos pull requests.

### Docker local

```bash
docker build --build-arg VITE_API_URL=https://sua-api/consultas -t curadoria-inteligente .
docker run --rm -p 8080:8080 curadoria-inteligente
```

Abra `http://localhost:8080` para testar o container.
