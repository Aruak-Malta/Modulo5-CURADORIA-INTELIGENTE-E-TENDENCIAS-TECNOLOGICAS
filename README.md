Frontend do Modulo 5

## CI/CD com Docker e Azure

O workflow em `.github/workflows/main.yml` executa lint, testes, auditoria de
dependências, build e validação da imagem em pull requests. Em pushes para
`main`, publica a imagem no GitHub Container Registry (GHCR) e faz o deploy
automático no Azure App Service `frontmodulo5`.

O deploy usa os secrets Azure já configurados para autenticação OIDC e o secret
`GHCR_READ_TOKEN` para que o App Service possa baixar a imagem privada. O token
deve ter permissão `read:packages` e acesso ao pacote. O App Service deve aceitar
containers Linux personalizados.
