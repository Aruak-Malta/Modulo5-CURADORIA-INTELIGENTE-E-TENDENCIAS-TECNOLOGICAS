import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatHistory from "../components/ChatHistory";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import FeedPage from "./FeedPage";
import GitHubPage from "./GitHubPage";
import { consultarArtigos } from "../services/curadoriaApi";
import "./ChatPage.css";
import "./Mobile.css";

const sugestoes = [
  "Artigos sobre machine learning",
  "Tendências em desenvolvimento de software",
  "Novidades sobre inteligência artificial",
];

const paginas = {
  tendencias: {
    titulo: "Em Alta",
    descricao: "Explore as principais tendências tecnológicas.",
  },
};

function criarMensagem(tipo, texto, adicionais = {}) {
  return {
    id: crypto.randomUUID(),
    tipo,
    texto,
    ...adicionais,
  };
}

function criarConversa() {
  return {
    id: crypto.randomUUID(),
    titulo: "Nova conversa",
    mensagens: [
      criarMensagem(
        "ia",
        "Olá! Sou o assistente de curadoria. Sobre qual tecnologia você quer pesquisar?",
      ),
    ],
  };
}

function temPergunta(conversa) {
  return conversa.mensagens.some(
    (mensagem) => mensagem.tipo === "usuario",
  );
}

export default function ChatPage() {
  const [paginaAtual, setPaginaAtual] = useState("chat");
  const [repositorioAtivo, setRepositorioAtivo] = useState("");
  const [stackDetectada, setStackDetectada] = useState([]);

  const [conversas, setConversas] = useState(
    () => [criarConversa()],
  );

  const [conversaAtivaId, setConversaAtivaId] = useState(
    () => conversas[0].id,
  );

  const [pergunta, setPergunta] = useState("");

  const [conversaCarregandoId, setConversaCarregandoId] =
    useState(null);

  const [menuMobile, setMenuMobile] = useState(null);

  const conversaAtiva = conversas.find(
    (conversa) => conversa.id === conversaAtivaId,
  );

  const mensagens = conversaAtiva?.mensagens ?? [];
  const carregando = conversaCarregandoId !== null;
  const historico = conversas.filter(temPergunta);

  useEffect(() => {
    if (!menuMobile) return;

    function fecharComEscape(evento) {
      if (evento.key === "Escape") {
        setMenuMobile(null);
      }
    }

    function fecharAoAmpliar() {
      if (window.innerWidth > 850) {
        setMenuMobile(null);
      }
    }

    document.addEventListener("keydown", fecharComEscape);
    window.addEventListener("resize", fecharAoAmpliar);

    return () => {
      document.removeEventListener("keydown", fecharComEscape);
      window.removeEventListener("resize", fecharAoAmpliar);
    };
  }, [menuMobile]);

  function alternarMenu(tipo) {
    setMenuMobile((atual) =>
      atual === tipo ? null : tipo,
    );
  }

  function fecharMenu() {
    setMenuMobile(null);
  }

  function navegar(pagina) {
    if (
      pagina === "chat" ||
      pagina === "feed" ||
      pagina === "github" ||
      paginas[pagina]
    ) {
      setPaginaAtual(pagina);
      fecharMenu();
    }
  }

  function conectarRepositorio(dados) {
    setRepositorioAtivo(dados.repositorio);
    setStackDetectada(dados.stack);
    setPaginaAtual("feed");
    fecharMenu();
  }

  function removerRepositorio() {
    setRepositorioAtivo("");
    setStackDetectada([]);
  }

  function novaConversa() {
    if (conversaAtiva && !temPergunta(conversaAtiva)) {
      setPergunta("");
      setPaginaAtual("chat");
      fecharMenu();
      return;
    }

    const conversa = criarConversa();

    setConversas((atuais) => [
      conversa,
      ...atuais.filter(temPergunta),
    ]);

    setConversaAtivaId(conversa.id);
    setPergunta("");
    setPaginaAtual("chat");
    fecharMenu();
  }

  function selecionarConversa(id) {
    const existe = conversas.some(
      (conversa) => conversa.id === id,
    );

    if (!existe) return;

    setConversaAtivaId(id);
    setPergunta("");
    setPaginaAtual("chat");
    fecharMenu();
  }

  function adicionarMensagem(conversaId, mensagem) {
    setConversas((atuais) =>
      atuais.map((conversa) => {
        if (conversa.id !== conversaId) {
          return conversa;
        }

        return {
          ...conversa,
          mensagens: [...conversa.mensagens, mensagem],
        };
      }),
    );
  }

  async function enviarPergunta(texto = pergunta) {
    const perguntaEnviada = texto.trim();

    if (!perguntaEnviada || carregando || !conversaAtiva) {
      return;
    }

    const id = conversaAtiva.id;

    setPergunta("");
    setPaginaAtual("chat");
    fecharMenu();

    const mensagemUsuario = criarMensagem(
      "usuario",
      perguntaEnviada,
    );

    setConversas((atuais) =>
      atuais.map((conversa) => {
        if (conversa.id !== id) {
          return conversa;
        }

        const primeiraPergunta = !temPergunta(conversa);

        return {
          ...conversa,
          titulo: primeiraPergunta
            ? perguntaEnviada.slice(0, 45)
            : conversa.titulo,
          mensagens: [
            ...conversa.mensagens,
            mensagemUsuario,
          ],
        };
      }),
    );

    setConversaCarregandoId(id);

    try {
      const dados = await consultarArtigos(perguntaEnviada);
      const artigos = dados.artigos ?? [];

      adicionarMensagem(
        id,
        criarMensagem(
          "ia",
          artigos.length > 0
            ? `Encontrei ${artigos.length} artigo(s) relacionado(s):`
            : "Não encontrei artigos relacionados. Tente utilizar outros termos.",
          { artigos },
        ),
      );
    } catch (erro) {
      console.error("Erro ao consultar API:", erro);

      adicionarMensagem(
        id,
        criarMensagem(
          "ia",
          "Não consegui acessar a API de curadoria. Tente novamente.",
        ),
      );
    } finally {
      setConversaCarregandoId(null);
    }
  }

  function renderizarChat() {
    return (
      <>
        <ChatHistory
          conversas={historico}
          conversaAtivaId={conversaAtivaId}
          aoNovaConversa={novaConversa}
          aoSelecionarConversa={selecionarConversa}
        />

        <main className="chat">
          <header className="chat-header">
            <h1>Chat com IA</h1>
            <p>
              Pesquise tecnologias e encontre artigos
              relacionados.
            </p>
          </header>

          <MessageList
            mensagens={mensagens}
            carregando={
              conversaCarregandoId === conversaAtivaId
            }
          />

          <div className="composer-area">
            {mensagens.length === 1 && (
              <div className="suggestions">
                {sugestoes.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => enviarPergunta(item)}
                    disabled={carregando}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}

            <MessageInput
              pergunta={pergunta}
              aoAlterarPergunta={setPergunta}
              aoEnviar={enviarPergunta}
              carregando={carregando}
            />

            <small className="composer-hint">
              Enter envia · Shift+Enter quebra a linha
            </small>
          </div>
        </main>
      </>
    );
  }

  function renderizarPagina() {
    if (paginaAtual === "feed") {
      return (
        <FeedPage repositorioAtivo={repositorioAtivo} />
      );
    }

    if (paginaAtual === "github") {
      return (
        <GitHubPage
          repositorioAtivo={repositorioAtivo}
          stackDetectada={stackDetectada}
          aoConectar={conectarRepositorio}
          aoRemover={removerRepositorio}
          aoAbrirFeed={() => navegar("feed")}
        />
      );
    }

    const pagina = paginas[paginaAtual];

    if (!pagina) return null;

    return (
      <main className="chat">
        <header className="chat-header">
          <h1>{pagina.titulo}</h1>
          <p>{pagina.descricao}</p>
        </header>

        <section className="messages">
          <p>
            Esta funcionalidade será implementada nas
            próximas etapas do projeto.
          </p>
        </section>
      </main>
    );
  }

  const classeLayout =
    paginaAtual === "chat"
      ? "chat-layout"
      : "chat-layout chat-layout--page";

  return (
    <div
      className={`${classeLayout} ${
        menuMobile
          ? `mobile-drawer-open mobile-drawer-${menuMobile}`
          : ""
      }`}
    >
      <header className="mobile-topbar">
        <button
          type="button"
          className="mobile-icon-button"
          onClick={() => alternarMenu("navegacao")}
          aria-label="Abrir menu de navegação"
          aria-expanded={menuMobile === "navegacao"}
          aria-controls="mobile-navigation"
        >
          <span aria-hidden="true">☰</span>
        </button>

        <div className="mobile-brand">
          <span className="mobile-brand-icon">✦</span>
          <span>Curadoria IA</span>
        </div>

        {paginaAtual === "chat" ? (
          <button
            type="button"
            className="mobile-icon-button"
            onClick={() => alternarMenu("historico")}
            aria-label="Abrir histórico de conversas"
            aria-expanded={menuMobile === "historico"}
            aria-controls="mobile-history"
          >
            <span aria-hidden="true">☷</span>
          </button>
        ) : (
          <button
            type="button"
            className="mobile-icon-button"
            onClick={() => navegar("chat")}
            aria-label="Abrir chat"
          >
            <span aria-hidden="true">✎</span>
          </button>
        )}
      </header>

      {menuMobile && (
        <button
          type="button"
          className="mobile-backdrop"
          onClick={fecharMenu}
          aria-label="Fechar menu"
        />
      )}

      <div
        id="mobile-navigation"
        className="mobile-navigation-wrapper"
      >
        <Sidebar
          paginaAtual={paginaAtual}
          aoNavegar={navegar}
          repositorioAtivo={repositorioAtivo}
        />
      </div>

      {paginaAtual === "chat" ? (
        <div
          id="mobile-history"
          className="mobile-history-wrapper"
        >
          {renderizarChat()}
        </div>
      ) : (
        renderizarPagina()
      )}
    </div>
  );
}
