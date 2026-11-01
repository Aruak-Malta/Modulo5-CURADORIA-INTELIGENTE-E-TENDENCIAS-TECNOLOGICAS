import PropTypes from "prop-types";

export default function Sidebar({
  paginaAtual = "chat",
  aoNavegar,
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand__icon">✦</span>

        <div>
          <strong>Curadoria IA</strong>
          <small>Módulo 5</small>
        </div>
      </div>

      <nav aria-label="Navegação principal">
        <p className="section-label">CONTEÚDO</p>

        <button
          type="button"
          className={`nav-item ${
            paginaAtual === "feed" ? "nav-item--active" : ""
          }`}
          onClick={() => aoNavegar("feed")}
        >
          Feed
        </button>

        <button
          type="button"
          className={`nav-item ${
            paginaAtual === "tendencias" ? "nav-item--active" : ""
          }`}
          onClick={() => aoNavegar("tendencias")}
        >
          Em alta
        </button>

        <p className="section-label">
          INTELIGÊNCIA ARTIFICIAL
        </p>

        <button
          type="button"
          className={`nav-item ${
            paginaAtual === "chat" ? "nav-item--active" : ""
          }`}
          onClick={() => aoNavegar("chat")}
        >
          Chat
        </button>
      </nav>

      <div className="api-status">
        <span />
        API de curadoria
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  paginaAtual: PropTypes.string,
  aoNavegar: PropTypes.func.isRequired,
};

