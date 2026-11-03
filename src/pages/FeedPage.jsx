import { useEffect, useMemo, useState } from "react";
import { buscarFeed } from "../services/feedApi";
import "./FeedPage.css";

function formatarData(data) {
  if (!data) {
    return "Data não disponível";
  }

  const dataConvertida = new Date(data);

  if (Number.isNaN(dataConvertida.getTime())) {
    return "Data não disponível";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(dataConvertida);
}

export default function FeedPage() {
  const [artigos, setArtigos] = useState([]);
  const [fontes, setFontes] = useState([]);
  const [fonteSelecionada, setFonteSelecionada] =
    useState("Todas");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [atualizadoEm, setAtualizadoEm] = useState(null);

  async function carregarFeed(signal) {
    setCarregando(true);
    setErro("");

    try {
      const dados = await buscarFeed({ signal });

      if (signal?.aborted) {
        return;
      }

      setArtigos(dados.artigos);

      const fontesDisponiveis = [
        ...new Set(
          dados.artigos.map((artigo) => artigo.fonte)
        ),
      ].sort();

      setFontes(fontesDisponiveis);
      setAtualizadoEm(new Date());
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      console.error("Erro ao carregar feed:", error);
      setErro(
        "Não foi possível carregar o feed. Verifique a conexão com o backend."
      );
    } finally {
      if (!signal?.aborted) {
        setCarregando(false);
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    carregarFeed(controller.signal);

    return () => {
      controller.abort();
    };
  }, []);

  const artigosFiltrados = useMemo(() => {
    if (fonteSelecionada === "Todas") {
      return artigos;
    }

    return artigos.filter(
      (artigo) => artigo.fonte === fonteSelecionada
    );
  }, [artigos, fonteSelecionada]);

  return (
    <main className="feed-page">
      <header className="feed-header">
        <div>
          <h1>Feed de Tecnologia</h1>
          <p>
            Acompanhe artigos, notícias e tendências
            tecnológicas de diferentes fontes.
          </p>
        </div>

        <button
          className="feed-refresh"
          type="button"
          onClick={() => carregarFeed()}
          disabled={carregando}
        >
          {carregando ? "Atualizando..." : "Atualizar feed"}
        </button>
      </header>

      <div className="feed-content">
        <section className="feed-toolbar">
          <div>
            <h2>Publicações recentes</h2>
            <p>
              {artigosFiltrados.length} publicação(ões)
              encontrada(s)
            </p>
          </div>

          {atualizadoEm && (
            <span className="feed-updated">
              Atualizado às{" "}
              {atualizadoEm.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </section>

        <div
          className="feed-filters"
          aria-label="Filtrar publicações por fonte"
        >
          {["Todas", ...fontes].map((fonte) => (
            <button
              key={fonte}
              type="button"
              className={
                fonteSelecionada === fonte
                  ? "feed-filter feed-filter--active"
                  : "feed-filter"
              }
              onClick={() => setFonteSelecionada(fonte)}
            >
              {fonte}
            </button>
          ))}
        </div>

        {erro && (
          <div className="feed-error" role="alert">
            {erro}
          </div>
        )}

        {carregando && artigos.length === 0 && (
          <div className="feed-empty" role="status">
            Carregando publicações...
          </div>
        )}

        {!carregando &&
          !erro &&
          artigosFiltrados.length === 0 && (
            <div className="feed-empty">
              Nenhuma publicação encontrada para
              esta fonte.
            </div>
          )}

        <section
          className="feed-grid"
          aria-label="Artigos do feed"
        >
          {artigosFiltrados.map((artigo) => (
            <article
              className="feed-card"
              key={artigo.link}
            >
              <div className="feed-card-top">
                <span className="feed-source">
                  {artigo.fonte}
                </span>

                <span className="feed-date">
                  {formatarData(
                    artigo.data_publicacao
                  )}
                </span>
              </div>

              <h3>{artigo.titulo}</h3>

              <a
                href={artigo.link}
                target="_blank"
                rel="noopener noreferrer"
                className="feed-card-link"
              >
                Ler publicação
                <span aria-hidden="true"> ↗</span>
              </a>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
