
import PropTypes from "prop-types";

export default function ChatHistory({
  conversas,
  conversaAtivaId,
  aoNovaConversa,
  aoSelecionarConversa,
}) {
  return (
    <aside className="history">
      <button
        className="new-chat-button"
        type="button"
        onClick={aoNovaConversa}
      >
        + Nova conversa
      </button>

      <p className="section-label">
        CONVERSAS RECENTES
      </p>

      {conversas.length === 0 ? (
        <p className="history__empty">
          Nenhuma conversa encontrada.
        </p>
      ) : (
        conversas.map((conversa) => (
          <button
            key={conversa.id}
            className={`history-item ${
              conversa.id === conversaAtivaId
                ? "history-item--active"
                : ""
            }`}
            type="button"
            onClick={() =>
              aoSelecionarConversa(conversa.id)
            }
            aria-current={
              conversa.id === conversaAtivaId
                ? "page"
                : undefined
            }
            title={conversa.titulo}
          >
            {conversa.titulo}
          </button>
        ))
      )}
    </aside>
  );
}

ChatHistory.propTypes = {
  conversas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      titulo: PropTypes.string.isRequired,
    })
  ).isRequired,
  conversaAtivaId: PropTypes.string.isRequired,
  aoNovaConversa: PropTypes.func.isRequired,
  aoSelecionarConversa: PropTypes.func.isRequired,
};
