
import PropTypes from "prop-types";
import ArticleCard from "./ArticleCard";

export default function MessageList({
  mensagens,
  carregando = false,
}) {
  return (
    <section
      className="messages"
      aria-label="Mensagens da conversa"
      aria-live="polite"
    >
      {mensagens.map((mensagem) => (
        <article
          key={mensagem.id}
          className={`message message--${mensagem.tipo}`}
        >
          <p>{mensagem.texto}</p>

          {mensagem.artigos?.map((artigo) => (
            <ArticleCard
              key={artigo.link}
              artigo={artigo}
            />
          ))}

          {mensagem.sources?.length > 0 && (
            <div className="message-sources">
              <strong>Fontes do assistente</strong>
              <ul>
                {mensagem.sources.map((source, index) => {
                  const arquivo =
                    source.file || source.path || source.source || "Fonte";
                  const linhas = source.lines
                    ? ` · linhas ${source.lines}`
                    : "";

                  return (
                    <li key={`${arquivo}-${index}`}>
                      <span>
                        {arquivo}
                        {linhas}
                      </span>
                      {source.excerpt && <p>{source.excerpt}</p>}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </article>
      ))}

      {carregando && (
        <p className="loading" role="status">
          Consultando artigos e assistente...
        </p>
      )}
    </section>
  );
}

MessageList.propTypes = {
  mensagens: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      tipo: PropTypes.oneOf(["usuario", "ia"]).isRequired,
      texto: PropTypes.string.isRequired,
      sources: PropTypes.arrayOf(
        PropTypes.shape({
          file: PropTypes.string,
          path: PropTypes.string,
          source: PropTypes.string,
          lines: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
          ]),
          excerpt: PropTypes.string,
        }),
      ),
      artigos: PropTypes.arrayOf(
        PropTypes.shape({
          titulo: PropTypes.string.isRequired,
          link: PropTypes.string.isRequired,
        })
      ),
    })
  ).isRequired,
  carregando: PropTypes.bool,
};
