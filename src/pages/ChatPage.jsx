
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ArticleCard from "../components/ArticleCard";
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

export default function ChatPage() {
  const [paginaAtual, setPaginaAtual] = useState("chat");
  const [pergunta, setPergunta] = useState("");

  const [mensagens, setMensagens] = useState(() => [
    criarMensagem(
      "ia",
      "Olá! Sou o assistente de curadoria. Pergunte sobre uma tecnologia para encontrar artigos relacionados."
    ),
  ]);

  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(false);

  function navegar(pagina) {
    if (pagina === "chat" || paginas[pagina]) {
      setPaginaAtual(pagina);
    }
  }

  async function enviarPergunta(texto = pergunta) {
    const perguntaEnviada = texto.trim();

    if (!perguntaEnviada || carregando) {
      return;
    }

    setPaginaAtual("chat");
    setPergunta("");

    setMensagens((atuais) => [
      ...atuais,
      criarMensagem("usuario", perguntaEnviada),
    ]);

    setHistorico((atuais) =>
      [
        perguntaEnviada,
        ...atuais.filter((item) => item !== perguntaEnviada),
      ].slice(0, 5)
    );

    setCarregando(true);

    try {
      const dados = await consultarArtigos(perguntaEnviada);
      const artigos = dados.artigos ?? [];

      setMensagens((atuais) => [
        ...atuais,
        criarMensagem(
          "ia",
          artigos.length
            ? `Encontrei ${artigos.length} artigo(s) relacionado(s):`
            : "Não encontrei artigos. Tente utilizar outros termos.",
          { artigos }
        ),
      ]);
    } catch (erro) {
      console.error("Erro ao consultar API:", erro);

      setMensagens((atuais) => [
        ...atuais,
        criarMensagem(
          "ia",
          "Não consegui acessar a API de curadoria. Tente novamente."
        ),
      ]);
    } finally {
      setCarregando(false);
    }
  }

  function enviarFormulario(evento) {
    evento.preventDefault();
    enviarPergunta();
  }

  function novaConversa() {
    setPaginaAtual("chat");
    setMensagens([
      criarMensagem(
        "ia",
        "Nova conversa. Sobre qual tecnologia você quer pesquisar?"
      ),
    ]);
    setPergunta("");
  }

  function renderizarHistorico() {
    return (
      <aside className="history">
        <button
          className="new-chat-button"
          type="button"
          onClick={novaConversa}
        >
          + Nova conversa
        </button>

        <p className="section-label">
          CONSULTAS RECENTES
        </p>

        {historico.length === 0 ? (
          <p className="history__empty">
            Suas perguntas recentes aparecerão aqui.
          </p>
        ) : (
          historico.map((item) => (
            <button
              className="history-item"
              type="button"
              key={item}
              onClick={() => enviarPergunta(item)}
              disabled={carregando}
              title={item}
            >
              {item}
            </button>
          ))
        )}
      </aside>
    );
  }

  function renderizarChat() {
    return (
      <main className="chat">
        <header className="chat-header">
          <h1>Chat com IA</h1>
          <p>
            Pergunte sobre tecnologias e encontre artigos relacionados.
          </p>
        </header>

        <section className="messages" aria-live="polite">
          {mensagens.map((mensagem) => (
            <article
              className={`message message--${mensagem.tipo}`}
              key={mensagem.id}
            >
              <p>{mensagem.texto}</p>

              {mensagem.artigos?.map((artigo) => (
                <ArticleCard
                  key={artigo.link}
                  artigo={artigo}
                />
              ))}
            </article>
          ))}

          {carregando && (
            <p className="loading">
              Buscando artigos...
            </p>
          )}
        </section>

        <div className="composer-area">
          {mensagens.length === 1 && (
            <div className="suggestions">
              {sugestoes.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => enviarPergunta(item)}
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
    );
  }

  function renderizarPagina() {
    const pagina = paginas[paginaAtual];

    if (!pagina) {
      return null;
    }

    return (
      <main className="chat">
        <header className="chat-header">
          <h1>{pagina.titulo}</h1>
          <p>{pagina.descricao}</p>
        </header>

        <section className="messages">
          <p>
            Esta funcionalidade será implementada
            na próxima etapa do projeto.
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

      {paginaAtual === "chat" ? (
        <>
          {renderizarHistorico()}
          {renderizarChat()}
        </>
      ) : (
        renderizarPagina()
      )}
    </div>
  );
}
