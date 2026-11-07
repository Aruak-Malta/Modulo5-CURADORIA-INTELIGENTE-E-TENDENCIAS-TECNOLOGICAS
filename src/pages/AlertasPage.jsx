
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { buscarAlertas } from "../services/alertasApi";
import "./AlertasPage.css";

const GRAVIDADES = {
  critico: "Crítico",
  alto: "Alto",
  medio: "Médio",
};

function formatarData(valor) {
  if (!valor) return "Data indisponível";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "Data indisponível";
  }

  return data.toLocaleDateString("pt-BR");
}

export default function AlertasPage({
  repositorioAtivo = "",
}) {
  const [alertas, setAlertas] = useState([]);
  const [stack, setStack] = useState([]);
  const [total, setTotal] = useState(0);
  const [artigosAnalisados, setArtigosAnalisados] =
    useState(0);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [atualizacao, setAtualizacao] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function carregarAlertas() {
      setCarregando(true);
      setErro("");

      try {
        const dados = await buscarAlertas({
          repositorio: repositorioAtivo,
          limite: 20,
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        setAlertas(dados.alertas ?? []);
        setStack(dados.stack_monitorada ?? []);
        setTotal(dados.total ?? 0);
        setArtigosAnalisados(
          dados.artigos_analisados ?? 0,
        );
      } catch (error) {
        if (controller.signal.aborted) return;

        setErro(
          error.message ||
            "Não foi possível carregar os alertas.",
        );
        setAlertas([]);
        setStack([]);
        setTotal(0);
        setArtigosAnalisados(0);
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    carregarAlertas();

    return () => controller.abort();
  }, [repositorioAtivo, atualizacao]);

  return (
    <main className="alertas-page">
      <header className="alertas-header">
        <div>
          <h1>Alertas de Segurança</h1>
          <p>
            Acompanhe publicações sobre possíveis
            vulnerabilidades e atualizações de segurança.
          </p>
        </div>

        <button
          type="button"
          className="alertas-atualizar"
          onClick={() =>
            setAtualizacao((valor) => valor + 1)
          }
          disabled={carregando}
        >
          {carregando
            ? "Atualizando..."
            : "Atualizar alertas"}
        </button>
      </header>

      <div className="alertas-content">
        <section className="alertas-resumo">
          <div className="alertas-indicador">
            <span>Possíveis alertas</span>
            <strong>{total}</strong>
          </div>

          <div className="alertas-indicador">
            <span>Artigos analisados</span>
            <strong>{artigosAnalisados}</strong>
          </div>

          <div className="alertas-indicador">
            <span>Tecnologias monitoradas</span>
            <strong>{stack.length}</strong>
          </div>
        </section>

        {repositorioAtivo && (
          <section className="alertas-repositorio">
            <h2>Repositório monitorado</h2>

            <a
              href={`https://github.com/${repositorioAtivo}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {repositorioAtivo}
            </a>

            {stack.length > 0 && (
              <div className="alertas-stack">
                {stack.map((tecnologia) => (
                  <span key={tecnologia}>
                    {tecnologia}
                  </span>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="alertas-resultados">
          <h2>Publicações identificadas</h2>

          {erro && (
            <div className="alertas-erro" role="alert">
              {erro}
            </div>
          )}

          {carregando && (
            <div className="alertas-vazio" role="status">
              Analisando publicações de segurança...
            </div>
          )}

          {!carregando && !erro && alertas.length === 0 && (
            <div className="alertas-vazio">
              <h3>Nenhum alerta identificado</h3>

              <p>
                Não foram encontradas publicações que
                atendam aos critérios atuais de
                monitoramento.
              </p>

              <p>
                Isso não garante a ausência de
                vulnerabilidades no projeto.
              </p>
            </div>
          )}

          {!carregando && !erro && alertas.length > 0 && (
            <div className="alertas-grid">
              {alertas.map((alerta) => (
                <article
                  className="alerta-card"
                  key={alerta.link}
                >
                  <div className="alerta-card-top">
                    <span
                      className={`alerta-gravidade alerta-gravidade--${alerta.gravidade}`}
                    >
                      {GRAVIDADES[alerta.gravidade] ??
                        alerta.gravidade}
                    </span>

                    <span className="alerta-fonte">
                      {alerta.fonte}
                    </span>
                  </div>

                  <h3>{alerta.titulo}</h3>

                  <p>
                    {alerta.descricao ||
                      "Descrição não disponível."}
                  </p>

                  <div className="alertas-stack">
                    {alerta.tecnologias.map(
                      (tecnologia) => (
                        <span key={tecnologia}>
                          {tecnologia}
                        </span>
                      ),
                    )}
                  </div>

                  <div className="alerta-card-bottom">
                    <span>
                      {formatarData(
                        alerta.data_publicacao,
                      )}
                    </span>

                    <a
                      href={alerta.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver publicação
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <p className="alertas-aviso">
          Os alertas são classificações preliminares
          baseadas em notícias e palavras-chave. Não
          representam uma confirmação de vulnerabilidades
          no repositório.
        </p>
      </div>
    </main>
  );
}

AlertasPage.propTypes = {
  repositorioAtivo: PropTypes.string,
};
