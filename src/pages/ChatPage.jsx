
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatHistory from "../components/ChatHistory";
import MessageList from "../components/MessageList";
import { consultarArtigos } from "../services/curadoriaApi";
import "./ChatPage.css";

const sugestoes = [
  "Artigos sobre machine learning",
  "Tendências em desenvolvimento de software",
  "Novidades sobre inteligência artificial",
];

const paginas = {
  feed: {
    titulo: "Feed de Tecnologia",
    descricao: "Acompanhe artigos e novidades da sua stack.",
  },
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
        "Olá! Sou o assistente de curadoria. Sobre qual tecnologia você quer pesquisar?"
      ),
    ],
  };
}

function temPergunta(conversa) {
  return conversa.mensagens.some(
    (mensagem) => mensagem.tipo === "usuario"
  );
}

export default function ChatPage() {
  const [paginaAtual, setPaginaAtual] = useState("chat");

  const [conversas, setConversas] = useState(
    () => [criarConversa()]
  );

  const [conversaAtivaId, setConversaAtivaId] = useState(
    () => conversas[0].id
  );

  const [pergunta, setPergunta] = useState("");
  const [conversaCarregandoId, setConversaCarregandoId] =
    useState(null);

  const conversaAtiva = conversas.find(
    (conversa) => conversa.id === conversaAtivaId
  );

  const mensagens = conversaAtiva?.mensagens ?? [];
  const carregando = conversaCarregandoId !== null;

  // Apenas conversas com perguntas aparecem no histórico.
  const historico = conversas.filter(temPergunta);

  function navegar(pagina) {
    if (pagina === "chat" || paginas[pagina]) {
      setPaginaAtual(pagina);
    }
  }

  function novaConversa() {
    // Impede criar várias conversas vazias.
    if (conversaAtiva && !temPergunta(conversaAtiva)) {
      setPergunta("");
      setPaginaAtual("chat");
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
  }

  function selecionarConversa(id) {
    const existe = conversas.some(
      (conversa) => conversa.id === id
    );

    if (!existe) return;

    setConversaAtivaId(id);
    setPergunta("");
    setPaginaAtual("chat");
  }

  function adicionarMensagem(conversaId, mensagem) {
    setConversas((atuais) =>
      atuais.map((conversa) => {
        if (conversa.id !== conversaId) {
          return conversa;
        }

        return {
          ...conversa,
          mensagens: [
            ...conversa.mensagens,
            mensagem,
          ],
        };
      })
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

    const mensagemUsuario = criarMensagem(
      "usuario",
      perguntaEnviada
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
      })
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
          { artigos }
        )
      );
    } catch (erro) {
      console.error("Erro ao consultar API:", erro);

      adicionarMensagem(
        id,
        criarMensagem(
          "ia",
          "Não consegui acessar a API de curadoria. Tente novamente."
        )
      );
    } finally {
      setConversaCarregandoId(null);
    }
  }

  function enviarFormulario(evento) {
    evento.preventDefault();
    enviarPergunta();
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

            <form
              className="composer"
              onSubmit={enviarFormulario}
            >
              <textarea
                value={pergunta}
                onChange={(evento) =>
                  setPergunta(evento.target.value)
                }
                onKeyDown={(evento) => {
                  if (
                    evento.key === "Enter" &&
                    !evento.shiftKey &&
                    !evento.nativeEvent.isComposing
                  ) {
                    evento.preventDefault();
                    enviarPergunta();
                  }
                }}
                placeholder="Pergunte sobre uma tecnologia..."
                aria-label="Digite sua pergunta"
                rows={1}
              />

              <button
                type="submit"
                disabled={!pergunta.trim() || carregando}
                aria-label="Enviar pergunta"
              >
                ↑
              </button>
            </form>

            <small className="composer-hint">
              Enter envia · Shift+Enter quebra a linha
            </small>
          </div>
        </main>
      </>
    );
  }

  function renderizarPagina() {
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
            Esta funcionalidade será implementada
            nas próximas etapas do projeto.
          </p>
        </section>
      </main>
    );
  }

  return (
    <div className="chat-layout">
      <Sidebar
        paginaAtual={paginaAtual}
        aoNavegar={navegar}
      />

      {paginaAtual === "chat"
        ? renderizarChat()
        : renderizarPagina()}
    </div>
  );
}
