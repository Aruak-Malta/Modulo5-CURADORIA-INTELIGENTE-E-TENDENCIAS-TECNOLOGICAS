import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatHistory from "../components/ChatHistory";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import FeedPage from "./FeedPage";
import GitHubPage from "./GitHubPage";
import AlertasPage from "./AlertasPage";
import EmAltaPage from "./EmAltaPage";
import {
  consultarArtigos,
  listarConversas,
  obterConversa,
  perguntarAoAssistente,
} from "../services/curadoriaApi";
import "./ChatPage.css";
import "./Mobile.css";

const sugestoes = [
  "Artigos sobre machine learning",
  "Tendências em desenvolvimento de software",
  "Novidades sobre inteligência artificial",
];

function criarMensagem(tipo, texto, adicionais = {}) {
  return {
    id: crypto.randomUUID(),
    tipo,
    texto,
    ...adicionais,
  };
}

function criarConversa(projectId = "") {
  return {
    id: `novo-${crypto.randomUUID()}`,
    chat_id: null,
    project_id: projectId || null,
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
function converterConversa(conversa) {
  return {
    id: String(conversa.chat_id),
    chat_id: conversa.chat_id,
    project_id: conversa.project_id,
    titulo: conversa.titulo,
    mensagens: [],
  };
}

function converterHistorico(conversa) {
  const mensagens = [];
  let perguntaAtual = null;
  let tiposDeResposta = new Set();

  for (const item of conversa.mensagens ?? []) {
    const resposta = item.resposta;
    const tipoResposta = Array.isArray(resposta)
      ? "artigos"
      : resposta && typeof resposta === "object"
        ? "assistente"
        : "texto";

    if (
      item.pergunta !== perguntaAtual ||
      tiposDeResposta.has(tipoResposta)
    ) {
      mensagens.push(criarMensagem("usuario", item.pergunta));
      perguntaAtual = item.pergunta;
      tiposDeResposta = new Set();
    }

    tiposDeResposta.add(tipoResposta);

    if (Array.isArray(resposta)) {
      mensagens.push(
        criarMensagem(
          "ia",
          resposta.length
            ? `Encontrei ${resposta.length} artigo(s) relacionado(s):`
            : "Não encontrei artigos relacionados. Tente utilizar outros termos.",
          { artigos: resposta },
        ),
      );
    } else if (resposta && typeof resposta === "object") {
      mensagens.push(
        criarMensagem(
          "ia",
          typeof resposta.content === "string"
            ? resposta.content
            : "O assistente não retornou uma resposta textual.",
          {
            sources: Array.isArray(resposta.sources)
              ? resposta.sources
              : [],
          },
        ),
      );
    } else if (typeof resposta === "string" && resposta) {
      mensagens.push(criarMensagem("ia", resposta));
    }
  }

  return mensagens;
}

export default function ChatPage({ usuario, aoSair }) {
  const conversaInicial = criarConversa();
  const [paginaAtual, setPaginaAtual] = useState("feed");
  const [repositorioAtivo, setRepositorioAtivo] = useState("");
  const [stackDetectada, setStackDetectada] = useState([]);
  const [conversas, setConversas] = useState([conversaInicial]);
  const [conversaAtivaId, setConversaAtivaId] = useState(
    conversaInicial.id,
  );
  const [pergunta, setPergunta] = useState("");
  const [conversaCarregandoId, setConversaCarregandoId] =
    useState(null);
  const [menuMobile, setMenuMobile] = useState(null);
  const [erroOperacao, setErroOperacao] = useState("");

  const conversaAtiva = conversas.find(
    (conversa) => conversa.id === conversaAtivaId,
  );
  const mensagens = conversaAtiva?.mensagens ?? [];
  const carregando = conversaCarregandoId !== null;
  const historico = conversas.filter(
    (conversa) => conversa.chat_id || temPergunta(conversa),
  );

  useEffect(() => {
    let ativo = true;

    listarConversas()
      .then((dados) => {
        if (!ativo) return;
        const doServidor = (dados.conversas ?? []).map(
          converterConversa,
        );
        setConversas((atuais) => {
          const idsDoServidor = new Set(
            doServidor.map((conversa) => conversa.id),
          );
          const locais = atuais.filter(
            (conversa) =>
              !conversa.chat_id ||
              !idsDoServidor.has(conversa.id),
          );
          return [...locais, ...doServidor];
        });
      })
      .catch((error) => {
        if (ativo) setErroOperacao(error.message);
      });

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!menuMobile) return undefined;

    function fecharComEscape(evento) {
      if (evento.key === "Escape") setMenuMobile(null);
    }

    function fecharAoAmpliar() {
      if (window.innerWidth > 850) setMenuMobile(null);
    }

    document.addEventListener("keydown", fecharComEscape);
    window.addEventListener("resize", fecharAoAmpliar);

    return () => {
      document.removeEventListener("keydown", fecharComEscape);
      window.removeEventListener("resize", fecharAoAmpliar);
    };
  }, [menuMobile]);

  function alternarMenu(tipo) {
    setMenuMobile((atual) => (atual === tipo ? null : tipo));
  }

  function fecharMenu() {
    setMenuMobile(null);
  }

  function navegar(pagina) {
    const paginasValidas = [
      "chat",
      "feed",
      "github",
      "alertas",
      "tendencias",
    ];

    if (!paginasValidas.includes(pagina)) return;
    setPaginaAtual(pagina);
    fecharMenu();
  }

  function conectarRepositorio(dados) {
    setRepositorioAtivo(dados.repositorio);
    setStackDetectada(dados.stack ?? []);
    fecharMenu();
  }

  function removerRepositorio() {
    setRepositorioAtivo("");
    setStackDetectada([]);
  }

  function novaConversa() {
    const conversa = criarConversa();
    setConversas((atuais) => [
      conversa,
      ...atuais.filter(
        (item) => item.chat_id || temPergunta(item),
      ),
    ]);
    setConversaAtivaId(conversa.id);
    setPergunta("");
    setErroOperacao("");
    setPaginaAtual("chat");
    fecharMenu();
  }

  async function selecionarConversa(id) {
    const conversa = conversas.find((item) => item.id === id);
    if (!conversa) return;

    setConversaAtivaId(id);
    setPergunta("");
    setErroOperacao("");
    setPaginaAtual("chat");
    fecharMenu();

    if (!conversa.chat_id || conversa.mensagens.length) return;

    setConversaCarregandoId(id);
    try {
      const dados = await obterConversa(conversa.chat_id);
      setConversas((atuais) =>
        atuais.map((item) =>
          item.id === id
            ? { ...item, mensagens: converterHistorico(dados) }
            : item,
        ),
      );
    } catch (error) {
      setErroOperacao(error.message);
    } finally {
      setConversaCarregandoId(null);
    }
  }

  function adicionarMensagem(conversaId, mensagem) {
    setConversas((atuais) =>
      atuais.map((conversa) =>
        conversa.id === conversaId
          ? {
              ...conversa,
              mensagens: [...conversa.mensagens, mensagem],
            }
          : conversa,
      ),
    );
  }

  function adotarChatId(conversaId, chatId, idProjeto) {
    const novoId = String(chatId);
    setConversas((atuais) =>
      atuais.map((conversa) =>
        conversa.id === conversaId
          ? {
              ...conversa,
              id: novoId,
              chat_id: chatId,
              project_id: idProjeto || null,
            }
          : conversa,
      ),
    );
    setConversaAtivaId((atual) =>
      atual === conversaId ? novoId : atual,
    );
    setConversaCarregandoId((atual) =>
      atual === conversaId ? novoId : atual,
    );
    return novoId;
  }

  async function enviarPergunta(texto = pergunta) {
    const perguntaEnviada = texto.trim();

    if (!perguntaEnviada || carregando || !conversaAtiva) return;

    let conversaId = conversaAtiva.id;
    let chatId = conversaAtiva.chat_id;
    const idProjeto = conversaAtiva.project_id || "";
    const mensagemUsuario = criarMensagem(
      "usuario",
      perguntaEnviada,
    );

    setPergunta("");
    setErroOperacao("");
    setPaginaAtual("chat");
    fecharMenu();
    setConversas((atuais) =>
      atuais.map((conversa) => {
        if (conversa.id !== conversaId) return conversa;
        return {
          ...conversa,
          titulo: temPergunta(conversa)
            ? conversa.titulo
            : perguntaEnviada.slice(0, 45),
          mensagens: [...conversa.mensagens, mensagemUsuario],
        };
      }),
    );
    setConversaCarregandoId(conversaId);

    try {
      try {
        const dados = await consultarArtigos(perguntaEnviada, {
          chatId,
          projectId: idProjeto,
        });
        chatId = dados.chat_id;
        conversaId = adotarChatId(
          conversaId,
          chatId,
          idProjeto,
        );
        const artigos = dados.artigos ?? [];
        adicionarMensagem(
          conversaId,
          criarMensagem(
            "ia",
            artigos.length
              ? `Encontrei ${artigos.length} artigo(s) relacionado(s):`
              : "Não encontrei artigos relacionados. Tente utilizar outros termos.",
            { artigos },
          ),
        );
      } catch (error) {
        adicionarMensagem(
          conversaId,
          criarMensagem(
            "ia",
            `Não foi possível buscar artigos: ${error.message}`,
          ),
        );
        if ([400, 401, 403, 404, 422].includes(error.status)) {
          return;
        }
      }

      try {
        const resposta = await perguntarAoAssistente(
          perguntaEnviada,
          {
            chatId,
            projectId: idProjeto,
          },
        );
        chatId = resposta.chat_id;
        conversaId = adotarChatId(
          conversaId,
          chatId,
          idProjeto,
        );
        adicionarMensagem(
          conversaId,
          criarMensagem(
            "ia",
            resposta.message?.content ||
              "O assistente não retornou uma resposta textual.",
            {
              sources: resposta.message?.sources ?? [],
            },
          ),
        );
      } catch (error) {
        adicionarMensagem(
          conversaId,
          criarMensagem(
            "ia",
            `Não foi possível consultar o assistente: ${error.message}`,
          ),
        );
      }
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
              Pesquise tecnologias, converse com o assistente e consulte
              seu histórico salvo.
            </p>
            {erroOperacao && (
              <p className="chat-error" role="alert">
                {erroOperacao}
              </p>
            )}
          </header>

          <MessageList
            mensagens={mensagens}
            carregando={conversaCarregandoId === conversaAtivaId}
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
      return <FeedPage repositorioAtivo={repositorioAtivo} />;
    }

    if (paginaAtual === "tendencias") return <EmAltaPage />;

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

    if (paginaAtual === "alertas") {
      return <AlertasPage repositorioAtivo={repositorioAtivo} />;
    }

    return null;
  }

  const classeLayout =
    paginaAtual === "chat"
      ? "chat-layout"
      : "chat-layout chat-layout--page";
  const propriedadesSidebar = {
    paginaAtual,
    aoNavegar: navegar,
    repositorioAtivo,
    usuario,
    aoSair,
  };

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
        <Sidebar {...propriedadesSidebar} />
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