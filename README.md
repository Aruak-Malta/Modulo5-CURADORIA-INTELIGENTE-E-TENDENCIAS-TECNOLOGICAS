# Módulo 5 — Curadoria Inteligente e Tendências Tecnológicas | Frontend

Interface web desenvolvida com **React e Vite** para o Módulo 5 do projeto de Engenharia de Software. O frontend permite visualizar artigos e tendências tecnológicas, explorar recomendações, integrar repositórios GitHub e acessar funcionalidades de conversa e histórico integradas aos demais módulos.

## Links

- **Frontend publicado (Azure):** https://frontmodulo5-ecaqg8fghzhyeuh2.brazilsouth-01.azurewebsites.net/
- **Backend publicado (Azure):** https://agente-tendencias-tecnologicas-fyd3bzerc9a2cqcu.chilecentral-01.azurewebsites.net
- **Documentação da API (Swagger):** https://agente-tendencias-tecnologicas-fyd3bzerc9a2cqcu.chilecentral-01.azurewebsites.net/docs
- **Repositório do backend:** https://github.com/masteguim/Modulo5-AGENTE-DE-CURADORIA-INTELIGENTE-E-TENDENCIAS-TECNOLOGICAS

> A disponibilidade das URLs publicadas depende dos serviços ativos no Azure.

## Funcionalidades da interface

- **Autenticação:** login, verificação de sessão e integração com o serviço de identidade do Módulo 1.
- **Feed tecnológico:** artigos selecionados por temas e contexto.
- **Em Alta:** visualização de notícias e conteúdos em destaque.
- **GitHub:** associação de repositórios, identificação de tecnologias e recomendações contextuais.
- **Alertas:** apresentação de informações sobre tendências, monitoramento e segurança.
- **Interface de chat e histórico:** páginas para interação e acompanhamento de conversas integradas ao serviço do Módulo 7 e às APIs do sistema.
- **Tema visual:** componentes de navegação e alternância de tema.

**Responsabilidades:** o Módulo 5 cuida de curadoria, feed, análise de stack e recomendações. O chat/assistente pertence ao **Módulo 7**; a interface o integra, mas não redefine a propriedade funcional do chat. Um **microfrontend integrador** conecta os módulos no sistema completo.

## Tecnologias

| Função | Tecnologia |
|---|---|
| Biblioteca de UI | React 18 |
| Build e desenvolvimento | Vite 6 |
| Linguagem | JavaScript / JSX |
| Estilos | CSS |
| Consumo da API | Fetch / serviços JavaScript |
| Validação | ESLint e testes com Node.js |
| Publicação | Azure App Service |

## Estrutura do projeto

```text
.
├── public/
│   ├── nav.js                   # Navegação de integração entre módulos
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ArticleCard.jsx
│   │   ├── ChatHistory.jsx
│   │   ├── MessageInput.jsx
│   │   ├── MessageList.jsx
│   │   ├── Sidebar.jsx
│   │   └── ThemeToggle.jsx
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── ChatPage.jsx
│   │   ├── FeedPage.jsx
│   │   ├── EmAltaPage.jsx
│   │   ├── GitHubPage.jsx
│   │   └── AlertasPage.jsx
│   ├── services/
│   │   ├── apiClient.js
│   │   ├── authApi.js
│   │   ├── authSession.js
│   │   ├── curadoriaApi.js
│   │   ├── feedApi.js
│   │   ├── emAltaApi.js
│   │   └── alertasApi.js
│   ├── styles/
│   │   ├── global.css
│   │   ├── theme.css
│   │   └── tokens.css
│   ├── App.jsx
│   └── main.jsx
├── test/
├── .env.example
├── package.json
├── vite.config.js
├── Dockerfile
└── nginx.conf
```

## Requisitos

- Node.js e npm compatíveis com a versão do Vite utilizada;
- Backend FastAPI em execução, localmente ou no Azure;
- Conexão com a internet para serviços externos e autenticação.

## Executar localmente (Linux)

Clone o repositório:

```bash
git clone https://github.com/Aruak-Malta/Modulo5-CURADORIA-INTELIGENTE-E-TENDENCIAS-TECNOLOGICAS.git
cd Modulo5-CURADORIA-INTELIGENTE-E-TENDENCIAS-TECNOLOGICAS
```

Instale as dependências:

```bash
npm install
```

Copie a configuração de exemplo:

```bash
cp .env.example .env
```

Para usar o backend local, mantenha no `.env`:

```dotenv
VITE_API_URL=http://127.0.0.1:8000
```

Para utilizar o backend publicado, altere para:

```dotenv
VITE_API_URL=https://agente-tendencias-tecnologicas-fyd3bzerc9a2cqcu.chilecentral-01.azurewebsites.net
```

Inicie o frontend:

```bash
npm run dev
```

Acesse http://localhost:5173 (ou o endereço informado pelo Vite no terminal).

## Comandos disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia servidor de desenvolvimento Vite |
| `npm run lint` | Executa ESLint |
| `npm test` | Executa testes usando Node.js |
| `npm run build` | Gera a versão de produção em `dist/` |
| `npm run preview` | Pré-visualiza o build localmente |

## Comunicação com a API

```text
Navegador
   |
   v
Frontend React/Vite (Módulo 5)
   |
   | VITE_API_URL / HTTP / JSON
   v
Backend FastAPI (Módulo 5)
   |              |                |
   |              |                +-- GitHub e fontes externas
   |              +------------------- Neon PostgreSQL
   +---------------------------------- Serviços dos Módulos 1 e 7
```

O backend possui endpoints para `/artigos`, `/feed`, `/em-alta`, `/github/stack`, `/github/repositorios`, `/github/recomendacoes`, `/alertas`, `/consultas`, `/assistente` e operações de autenticação. Algumas chamadas exigem sessão válida.

### Identidade e sessões

O login é integrado ao **Módulo 1** por intermédio da API do backend. O frontend utiliza os serviços em `src/services/authApi.js` e `src/services/authSession.js` para consultar a sessão e gerenciar tokens. Requisições autenticadas exigem credenciais válidas e permissões de acesso ao projeto quando aplicável.

### Integração entre módulos

- **Módulo 1:** autenticação e identidade dos usuários.
- **Módulo 5:** feed, tendências, integração GitHub, curadoria e recomendações.
- **Módulo 7:** serviço de assistente/chat de IA.
- **Microfrontend integrador:** navegação e composição dos módulos do sistema.

O arquivo `public/nav.js` participa da integração de navegação. Ele deve ser preservado ao realizar alterações na interface.

## Publicação

O projeto possui `Dockerfile`, `nginx.conf` e fluxo de CI/CD em `.github/workflows/`.

Para gerar o build:

```bash
npm run lint
npm test
npm run build
```

Configure `VITE_API_URL` no **ambiente de build** com a URL do backend publicado antes da geração dos arquivos. O Vite incorpora essa variável durante o build; alterá-la somente após a publicação não altera o bundle já gerado.

O backend deve incluir a origem HTTPS do frontend nas configurações de CORS.

## Verificação funcional

Após publicar backend e frontend, valide:

1. Abertura do frontend no Azure.
2. Autenticação e consulta de sessão.
3. Exibição do **Feed** e de **Em Alta**.
4. Integração de repositórios e recomendações GitHub.
5. Acesso aos alertas e às funcionalidades de chat/histórico integradas.
6. Ausência de erros de requisição no console do navegador.

## Segurança

- Não inclua tokens ou senhas no repositório.
- Não armazene credenciais do PostgreSQL no frontend: a conexão com o Neon pertence ao backend.
- Utilize a API HTTPS publicada para comunicações de produção.
- O arquivo `.env` local não deve ser versionado com dados privados.

## Projeto acadêmico

Frontend desenvolvido para o projeto de **Engenharia de Software — Módulo 5: Agente de Curadoria Inteligente e Tendências Tecnológicas**.
