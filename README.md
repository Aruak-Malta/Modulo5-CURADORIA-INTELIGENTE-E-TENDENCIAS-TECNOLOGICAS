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

## Publicar no Azure

Este repositório contém o frontend React, não uma aplicação Python nem uma
Azure Function. Publique-o como **Azure Static Web App** e use:

- Predefinição de build: **React**
- Local do aplicativo: `/`
- Local da API: vazio
- Local de saída: `dist`
- Comando de build: `npm run build` (se o Azure solicitar)

Se o GitHub Actions criado para o repositório tentar configurar Python ou
instalar `requirements.txt`, ele foi criado com a configuração errada. Use o
workflow do Azure Static Web Apps/React em vez de adicionar um `requirements.txt`
ao frontend.

Configure `VITE_API_URL` com a URL pública da API, incluindo `/consultas`, no
ambiente de build do GitHub Actions, criando uma variável de repositório
`VITE_API_URL`. O workflow do Azure Static Web Apps disponível neste repositório
usa essa variável durante o build.

Essa URL é incorporada ao frontend durante o build. A API também precisa
permitir requisições CORS originadas pelo domínio publicado no Azure.

No GitHub, crie o segredo `AZURE_STATIC_WEB_APPS_API_TOKEN` com o token de
implantação da Static Web App (Azure Portal → recurso → **Manage deployment
token**). Se já existir outro workflow Python no repositório, desative-o para
que ele não continue tentando instalar `requirements.txt`.
