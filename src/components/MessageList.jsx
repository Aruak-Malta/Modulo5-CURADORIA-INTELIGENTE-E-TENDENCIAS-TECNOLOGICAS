
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
        </article>
      ))}

      {carregando && (
        <p className="loading" role="status">
          Buscando artigos...
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
