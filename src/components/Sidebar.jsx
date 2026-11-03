import { useState } from "react";
import PropTypes from "prop-types";
import "./SidebarGithub.css";

export default function Sidebar({
  paginaAtual = "chat",
  aoNavegar,
  repositorioAtivo,
  aoConectarRepositorio,
  aoRemoverRepositorio,
}) {
  const [repositorioDigitado, setRepositorioDigitado] =
    useState(repositorioAtivo || "");
  const [erro, setErro] = useState("");

  function conectar(evento) {
    evento.preventDefault();

    const valor = repositorioDigitado
      .trim()
      .replace(/^https?:\/\/github\.com\//i, "")
      .replace(/\/+$/, "");

    const valido =
      /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(
        valor,
      );

    if (!valido) {
      setErro("Use usuario/repositorio.");
      return;
    }

    setErro("");
    setRepositorioDigitado(valor);
    aoConectarRepositorio(valor);
  }

  function remover() {
    setRepositorioDigitado("");
    setErro("");
    aoRemoverRepositorio();
  }

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
            paginaAtual === "feed"
              ? "nav-item--active"
              : ""
          }`}
          onClick={() => aoNavegar("feed")}
        >
          Feed
        </button>

        <button
          type="button"
          className={`nav-item ${
            paginaAtual === "tendencias"
              ? "nav-item--active"
              : ""
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
            paginaAtual === "chat"
              ? "nav-item--active"
              : ""
          }`}
          onClick={() => aoNavegar("chat")}
        >
          Chat
        </button>
      </nav>

      <section className="sidebar-github">
        <p className="section-label">INTEGRAÇÕES</p>

        <div className="sidebar-github-title">
          <span>GitHub</span>
          <span
            className={
              repositorioAtivo
                ? "sidebar-github-indicator sidebar-github-indicator--active"
                : "sidebar-github-indicator"
            }
          />
        </div>

        <p className="sidebar-github-description">
          Personalize as notícias utilizando a
          stack de um repositório público.
        </p>

        <form
          className="sidebar-github-form"
          onSubmit={conectar}
        >
          <label htmlFor="github-repository">
            Repositório
          </label>

          <input
            id="github-repository"
            value={repositorioDigitado}
            onChange={(evento) =>
              setRepositorioDigitado(
                evento.target.value,
              )
            }
            placeholder="usuario/projeto"
            autoComplete="off"
            spellCheck={false}
          />

          <button
            type="submit"
            className="sidebar-github-apply"
          >
            Aplicar repositório
          </button>
        </form>

        {erro && (
          <p className="sidebar-github-error" role="alert">
            {erro}
          </p>
        )}

        {repositorioAtivo && (
          <div className="sidebar-github-connected">
            <span>Repositório selecionado</span>

            <a
              href={`https://github.com/${repositorioAtivo}`}
              target="_blank"
              rel="noopener noreferrer"
              title={repositorioAtivo}
            >
              {repositorioAtivo}
            </a>

            <button
              type="button"
              className="sidebar-github-remove"
              onClick={remover}
            >
              Remover repositório
            </button>
          </div>
        )}
      </section>

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
  repositorioAtivo: PropTypes.string.isRequired,
  aoConectarRepositorio: PropTypes.func.isRequired,
  aoRemoverRepositorio: PropTypes.func.isRequired,
};
