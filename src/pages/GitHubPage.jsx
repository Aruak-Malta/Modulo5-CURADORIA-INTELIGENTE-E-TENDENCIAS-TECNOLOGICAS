
import { useState } from "react";
import PropTypes from "prop-types";

import {
  salvarRepositorioUsuario,
  listarRepositoriosUsuario,
  listarRecomendacoesUsuario,
} from "../services/curadoriaApi";

import "./GitHubPage.css";

function normalizarRepositorio(valor) {
  return valor
    .trim()
    .replace(/^https?:\/\/github\.com\//i, "")
    .replace(/\/+$/, "");
}

function validarRepositorio(valor) {
  return /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(valor);
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
  const [recomendacoes, setRecomendacoes] = useState([]);

  async function carregarIntegracao() {
    setErro("");
    setCarregando(true);

    try {
      const [dadosRepositorios, dadosRecomendacoes] =
        await Promise.all([
          listarRepositoriosUsuario(),
          listarRecomendacoesUsuario(),
        ]);

      const repositorioSalvo =
        dadosRepositorios.repositorios?.[0];

      if (!repositorioSalvo) {
        setErro("Nenhum repositório salvo para sua conta.");
        return;
      }

      const repositorio = normalizarRepositorio(
        repositorioSalvo.repositorio,
      );

      setRepositorioDigitado(repositorio);

      aoConectar({
        repositorio,
        stack: repositorioSalvo.stack_detectada ?? [],
      });

      const grupos = new Map();

      for (const artigo of dadosRecomendacoes.recomendacoes ?? []) {
        const grupo = grupos.get(artigo.tecnologia) ?? [];
        grupo.push(artigo);
        grupos.set(artigo.tecnologia, grupo);
      }

      setRecomendacoes(
        [...grupos].map(([tecnologia, artigos]) => ({
          tecnologia,
          artigos,
        })),
      );
    } catch (error) {
      setErro(error.message || "Erro ao carregar integração.");
    } finally {
      setCarregando(false);
    }
  }

  async function conectar(evento) {
    evento.preventDefault();

    const repositorio = normalizarRepositorio(
      repositorioDigitado,
    );

    if (!validarRepositorio(repositorio)) {
      setErro(
        "Informe um repositório válido: usuario/repositorio.",
      );
      return;
    }

    setErro("");
    setCarregando(true);

    try {
      const resultado = await salvarRepositorioUsuario(
        repositorio,
      );

      setRecomendacoes(resultado.recomendacoes ?? []);

      aoConectar({
        repositorio: resultado.repositorio,
        stack: resultado.stack_detectada ?? [],
      });

    } catch (error) {
      setErro(
        error.message ||
          "Não foi possível conectar o repositório.",
      );
    } finally {
      setCarregando(false);
    }
  }

  function remover() {
    setRepositorioDigitado("");
    setRecomendacoes([]);
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
          tecnologias utilizadas.
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
                setRepositorioDigitado(evento.target.value)
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
                ? "Salvando integração..."
                : "Salvar repositório"}
            </button>

            <button
              type="button"
              className="github-secondary-button"
              onClick={carregarIntegracao}
              disabled={carregando}
            >
              Carregar integração salva
            </button>
          </form>

          {erro && (
            <div className="github-error" role="alert">
              {erro}
            </div>
          )}

          <p className="github-help">
            O Módulo 5 salva o repositório, a stack e
            as recomendações no PostgreSQL, associados
            à sua conta autenticada pelo Módulo 1.
            O repositório precisa ser público.
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
                Nenhuma tecnologia conhecida foi
                identificada no repositório.
              </p>
            )}

            {recomendacoes.length > 0 && (
              <div className="github-recommendations">
                <h3>Recomendações salvas</h3>

                {recomendacoes.map((grupo) => (
                  <section key={grupo.tecnologia}>
                    <strong>{grupo.tecnologia}</strong>

                    <ul>
                      {grupo.artigos.map((artigo) => (
                        <li key={artigo.link}>
                          <a
                            href={artigo.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {artigo.titulo}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
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
                Limpar seleção desta sessão
              </button>
            </div>

            <p className="github-help">
              Limpar a seleção não exclui os dados
              armazenados no PostgreSQL.
            </p>
          </section>
        )}

        <section className="github-info">
          <h2>Como funciona a personalização?</h2>

          <p>
            O agente analisa arquivos de configuração
            do repositório, identifica tecnologias
            utilizadas e prioriza notícias relacionadas
            à stack detectada.
          </p>

          <div className="github-steps">
            <div>
              <strong>1. Repositório</strong>
              <span>Leitura de arquivos públicos.</span>
            </div>

            <div>
              <strong>2. Tecnologias</strong>
              <span>
                Identificação de linguagens,
                frameworks e ferramentas.
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
