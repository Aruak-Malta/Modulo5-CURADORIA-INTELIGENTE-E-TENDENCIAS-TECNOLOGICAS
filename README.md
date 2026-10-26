# Curadoria Inteligente

Frontend React para o assistente de curadoria de artigos sobre tecnologia.

## Rodar localmente

Requer Node.js 18 ou superior.

```bash
npm install
npm run dev
```

Por padrão, a interface consulta a API local em
`http://127.0.0.1:8000/consultas`. Para usar outro endereço, crie um arquivo
`.env` na raiz, copiando `.env.example`, e ajuste `VITE_API_URL`.

Para validar o build de produção:

```bash
npm run build
```

## CI/CD e publicação no Azure

O workflow em `.github/workflows/ci-cd.yml` executa lint, testes, build do
frontend e build Docker em pull requests. Em push na `main`, publica a imagem
no GitHub Container Registry (GHCR) e atualiza automaticamente o Azure App
Service para Containers. Docker não é obrigatório para toda forma de publicação
do frontend, mas foi adotado aqui para atender à atividade de App Service com
containers.

### Configuração necessária no GitHub

Em **Settings → Secrets and variables → Actions**, configure:

- Secret `GHCR_READ_TOKEN`: Personal Access Token com permissão `read:packages`
  para o proprietário da imagem no GHCR. O valor é usado pelo App Service para
  baixar a imagem privada; não o coloque no código.
- Secrets Azure `AZUREAPPSERVICE_CLIENTID_...`,
  `AZUREAPPSERVICE_TENANTID_...` e `AZUREAPPSERVICE_SUBSCRIPTIONID_...`: use
  os secrets da identidade federada autorizada a atualizar esse App Service.
- Variables `AZURE_CLIENT_ID_SECRET`, `AZURE_TENANT_ID_SECRET` e
  `AZURE_SUBSCRIPTION_ID_SECRET`: informe em cada uma o **nome exato** do secret
  Azure correspondente (não o valor secreto). Isso permite escolher o conjunto
  correto caso existam várias identidades cadastradas.
- Variable `VITE_API_URL`: URL pública da API, incluindo `/consultas`.
- Opcional: variable `AZURE_WEBAPP_NAME` se o nome do App Service for diferente
  de `FrontModulo5`.

A identidade Azure precisa ter uma credencial federada para este repositório e
o branch `main`, além de permissão para configurar e reiniciar o App Service
(por exemplo, **Contributor** no recurso ou grupo de recursos). O workflow
descobre o grupo de recursos pelo nome do app.

O token criado para GHCR deve ter acesso de leitura ao pacote. A publicação no
GHCR usa o `GITHUB_TOKEN` do próprio workflow, com permissão `packages: write`.
Configure também a API para aceitar CORS do domínio do frontend publicado.

### Dependabot

O `.github/dependabot.yml` verifica semanalmente dependências npm e GitHub
Actions. Pull requests também passam pela verificação de alterações de
dependências antes de serem aceitos.

### Docker local

```bash
docker build --build-arg VITE_API_URL=https://sua-api/consultas -t curadoria-inteligente .
docker run --rm -p 8080:80 curadoria-inteligente
```

Abra `http://localhost:8080` para testar o container.
