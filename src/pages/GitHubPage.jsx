
import { useState } from "react";
import PropTypes from "prop-types";
import { detectarStack } from "../services/feedApi";
import "./GitHubPage.css";

function normalizarRepositorio(valor) {
  return valor
    .trim()
    .replace(/^https?:\/\/github\.com\//i, "")
    .replace(/\/+$/, "");
}

function validarRepositorio(valor) {
  return /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(
    valor,
  );
}

export default function GitHubPage({
  repositorioAtivo,
  stackDetectada,
  aoConectar,
  aoRemover,
  aoAbrirFeed,
}) {
  const [repositorioDigitado, setRepositorioDigitado] =
    useState(repositorioAtivo || "");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function conectar(evento) {
    evento.preventDefault();

    const repositorio = normalizarRepositorio(
      repositorioDigitado,
    );

    if (!validarRepositorio(repositorio)) {
      setErro(
        "Informe um repositório válido no formato usuario/repositorio.",
      );
      return;
    }

    setErro("");
    setCarregando(true);

    try {
      const resultado = await detectarStack(
        repositorio,
      );

      aoConectar({
        repositorio: resultado.repositorio,
        stack: resultado.stackDetectada,
      });
    } catch (error) {
      setErro(
        error.message ||
          "Não foi possível analisar o repositório.",
      );
    } finally {
      setCarregando(false);
    }
  }

  function remover() {
    setRepositorioDigitado("");
    setErro("");
    aoRemover();
  }

  return (
    <main className="github-page">
      <header className="github-header">
        <h1>Integração com GitHub</h1>
        <p>
          Conecte um repositório público para receber
          notícias e recomendações relacionadas às
          tecnologias utilizadas no seu projeto.
        </p>
      </header>

      <div className="github-content">
        <section className="github-panel">
          <div className="github-panel-heading">
            <div>
              <h2>Repositório GitHub</h2>
              <p>
                Informe o nome do repositório ou cole
                seu endereço completo do GitHub.
              </p>
            </div>

            <span
              className={`github-status ${
                repositorioAtivo
                  ? "github-status--connected"
                  : ""
              }`}
            >
              {repositorioAtivo
                ? "Conectado"
                : "Não conectado"}
            </span>
          </div>

          <form
            className="github-form"
            onSubmit={conectar}
          >
            <label htmlFor="github-repository">
              Repositório
            </label>

            <input
              id="github-repository"
              type="text"
              value={repositorioDigitado}
              onChange={(evento) =>
                setRepositorioDigitado(
                  evento.target.value,
                )
              }
              placeholder="usuario/repositorio"
              autoComplete="off"
              spellCheck={false}
              disabled={carregando}
            />

            <button
              type="submit"
              className="github-primary-button"
              disabled={carregando}
            >
              {carregando
                ? "Analisando repositório..."
                : "Conectar repositório"}
            </button>
          </form>

          {erro && (
            <div
              className="github-error"
              role="alert"
            >
              {erro}
            </div>
          )}

          <p className="github-help">
            O repositório precisa ser público.
            Nenhuma senha ou token GitHub é necessário.
          </p>
        </section>

        {repositorioAtivo && (
          <section className="github-panel">
            <div className="github-panel-heading">
              <div>
                <h2>Repositório conectado</h2>

                <a
                  className="github-repository-link"
                  href={`https://github.com/${repositorioAtivo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {repositorioAtivo}
                </a>
              </div>
            </div>

            <h3>Stack detectada</h3>

            {stackDetectada.length > 0 ? (
              <div className="github-stack">
                {stackDetectada.map((tecnologia) => (
                  <span
                    className="github-stack-item"
                    key={tecnologia}
                  >
                    {tecnologia}
                  </span>
                ))}
              </div>
            ) : (
              <p className="github-help">
                O repositório foi acessado, mas
                nenhuma tecnologia conhecida foi
                identificada nos arquivos analisados.
              </p>
            )}

            <div className="github-actions">
              <button
                type="button"
                className="github-primary-button"
                onClick={aoAbrirFeed}
              >
                Ver recomendações
              </button>

              <button
                type="button"
                className="github-secondary-button"
                onClick={remover}
              >
                Desconectar repositório
              </button>
            </div>
          </section>
        )}

        <section className="github-info">
          <h2>Como funciona a personalização?</h2>

          <p>
            O agente analisa arquivos de configuração
            do repositório, identifica tecnologias
            utilizadas e aumenta a prioridade de
            notícias relacionadas à stack detectada.
          </p>

          <div className="github-steps">
            <div>
              <strong>1. Repositório</strong>
              <span>
                Leitura de arquivos públicos.
              </span>
            </div>

            <div>
              <strong>2. Tecnologias</strong>
              <span>
                Identificação de frameworks,
                linguagens e ferramentas.
              </span>
            </div>

            <div>
              <strong>3. Recomendações</strong>
              <span>
                Feed personalizado por relevância.
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

GitHubPage.propTypes = {
  repositorioAtivo: PropTypes.string.isRequired,
  stackDetectada: PropTypes.arrayOf(
    PropTypes.string,
  ).isRequired,
  aoConectar: PropTypes.func.isRequired,
  aoRemover: PropTypes.func.isRequired,
  aoAbrirFeed: PropTypes.func.isRequired,
};
