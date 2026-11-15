
import PropTypes from "prop-types";

export default function Sidebar({
  paginaAtual = "chat",
  aoNavegar,
  repositorioAtivo = "",
  usuario,
  aoSair,
}) {
  const itens = [
    {
      secao: "CONTEÚDO",
      paginas: [
        { id: "feed", nome: "Feed" },
        { id: "tendencias", nome: "Em alta" },
      ],
    },
    {
      secao: "INTELIGÊNCIA ARTIFICIAL",
      paginas: [
        { id: "chat", nome: "Chat" },
      ],
    },
    {
      secao: "INTEGRAÇÕES",
      paginas: [
        { id: "github", nome: "GitHub" },
      ],
    },
    {
      secao: "MONITORAMENTO",
      paginas: [
        { id: "alertas", nome: "Alertas de Segurança" },
      ],
    },
  ];

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
        {itens.map((grupo) => (
          <div key={grupo.secao}>
            <p className="section-label">
              {grupo.secao}
            </p>

            {grupo.paginas.map((pagina) => (
              <button
                key={pagina.id}
                type="button"
                className={`nav-item ${
                  paginaAtual === pagina.id
                    ? "nav-item--active"
                    : ""
                }`}
                onClick={() => aoNavegar(pagina.id)}
              >
                {pagina.nome}

                {pagina.id === "github" && (
                  <span
                    title={
                      repositorioAtivo
                        ? "Repositório conectado"
                        : "Nenhum repositório conectado"
                    }
                    style={{
                      display: "inline-block",
                      width: "8px",
                      height: "8px",
                      marginLeft: "8px",
                      borderRadius: "50%",
                      background: repositorioAtivo
                        ? "#16a34a"
                        : "#a0a5b5",
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-account">
        <div className="sidebar-account__identity">
          <strong>{usuario.display_name}</strong>
          <span>{usuario.email}</span>
        </div>
        <button type="button" onClick={aoSair}>
          Sair
        </button>
      </div>

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
  repositorioAtivo: PropTypes.string,
  usuario: PropTypes.shape({
    display_name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
  aoSair: PropTypes.func.isRequired,
};
