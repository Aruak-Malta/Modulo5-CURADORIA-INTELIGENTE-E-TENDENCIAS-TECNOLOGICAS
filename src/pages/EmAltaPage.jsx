
import { useEffect, useState } from "react";
import { buscarEmAlta } from "../services/emAltaApi";
import "./EmAltaPage.css";

const CATEGORIAS = [
  "geral",
  "Inteligência Artificial",
  "Desenvolvimento",
  "Segurança",
  "DevOps",
  "Computação Quântica",
  "Outros",
];

function formatarData(valor) {
  if (!valor) return "Data indisponível";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "Data indisponível";
  }

  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function EmAltaPage() {
  const [categoria, setCategoria] = useState("geral");
  const [artigos, setArtigos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [total, setTotal] = useState(0);
  const [analisados, setAnalisados] = useState(0);
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const [metodoRanking, setMetodoRanking] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [atualizacao, setAtualizacao] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function carregar() {
      setCarregando(true);
      setErro("");

      try {
        const dados = await buscarEmAlta({
          categoria,
          limite: 30,
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        setArtigos(dados.artigos ?? []);
        setCategorias(dados.categorias ?? []);
        setTotal(dados.total ?? 0);
        setAnalisados(dados.artigos_analisados ?? 0);
        setAtualizadoEm(dados.atualizado_em ?? null);
        setMetodoRanking(dados.metodo_ranking ?? "");
      } catch (error) {
        if (controller.signal.aborted) return;

        setErro(
          error.message ||
            "Não foi possível carregar as tendências.",
        );

        setArtigos([]);
        setCategorias([]);
        setTotal(0);
        setAnalisados(0);
        setAtualizadoEm(null);
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    carregar();

    return () => controller.abort();
  }, [categoria, atualizacao]);

  const destaque = artigos[0];
  const restantes = artigos.slice(1);

  return (
    <main className="em-alta-page">
      <header className="em-alta-header">
        <div>
          <h1>Em Alta</h1>
          <p>
            Notícias e tendências tecnológicas classificadas
            por relevância e atualidade.
          </p>
        </div>

        <button
          type="button"
          className="em-alta-atualizar"
          onClick={() =>
            setAtualizacao((valor) => valor + 1)
          }
          disabled={carregando}
        >
          {carregando ? "Atualizando..." : "Atualizar"}
        </button>
      </header>

      <div className="em-alta-content">
        <section className="em-alta-resumo">
          <div>
            <span>Artigos analisados</span>
            <strong>{analisados}</strong>
          </div>

          <div>
            <span>Resultados da categoria</span>
            <strong>{total}</strong>
          </div>

          <div>
            <span>Categorias identificadas</span>
            <strong>{categorias.length}</strong>
          </div>
        </section>

        <section className="em-alta-filtros">
          <h2>Explorar tendências</h2>

          <div className="em-alta-categorias">
            {CATEGORIAS.map((item) => (
              <button
                key={item}
                type="button"
                className={
                  categoria === item
                    ? "em-alta-categoria ativa"
                    : "em-alta-categoria"
                }
                onClick={() => setCategoria(item)}
                aria-pressed={categoria === item}
              >
                {item === "geral" ? "Todas" : item}
              </button>
            ))}
          </div>
        </section>

        {erro && (
          <div className="em-alta-erro" role="alert">
            {erro}
          </div>
        )}

        {carregando && (
          <div className="em-alta-vazio" role="status">
            Carregando tendências tecnológicas...
          </div>
        )}

        {!carregando && !erro && artigos.length === 0 && (
          <div className="em-alta-vazio">
            <h3>Nenhum artigo encontrado</h3>
            <p>
              Ainda não há publicações classificadas nesta
              categoria. Execute o coletor ou selecione outra
              categoria.
            </p>
          </div>
        )}

        {!carregando && !erro && destaque && (
          <>
            <section className="em-alta-destaque">
              <div className="em-alta-destaque-titulo">
                <h2>Destaque principal</h2>
                <span>1º lugar</span>
              </div>

              <article className="em-alta-principal">
                <div className="em-alta-card-top">
                  <span className="em-alta-tag">
                    {destaque.categoria}
                  </span>

                  <span className="em-alta-fonte">
                    {destaque.fonte}
                  </span>
                </div>

                <h3>{destaque.titulo}</h3>

                <p>
                  {destaque.resumo ||
                    "Resumo não disponível."}
                </p>

                <div className="em-alta-card-bottom">
                  <span>
                    {formatarData(
                      destaque.data_publicacao,
                    )}
                  </span>

                  <a
                    href={destaque.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ler publicação
                  </a>
                </div>
              </article>
            </section>

            <section className="em-alta-ranking">
              <h2>Ranking de tendências</h2>

              {restantes.length === 0 ? (
                <p>
                  Não há outros artigos nesta categoria.
                </p>
              ) : (
                <div className="em-alta-grid">
                  {restantes.map((artigo, indice) => (
                    <article
                      key={artigo.link}
                      className="em-alta-card"
                    >
                      <div className="em-alta-card-top">
                        <span className="em-alta-posicao">
                          #{indice + 2}
                        </span>

                        <span className="em-alta-tag">
                          {artigo.categoria}
                        </span>
                      </div>

                      <h3>{artigo.titulo}</h3>

                      <p>
                        {artigo.resumo ||
                          "Resumo não disponível."}
                      </p>

                      <div className="em-alta-card-bottom">
                        <span>
                          {artigo.fonte} ·{" "}
                          {formatarData(
                            artigo.data_publicacao,
                          )}
                        </span>

                        <a
                          href={artigo.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Ler artigo
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        <footer className="em-alta-rodape">
          {atualizadoEm && (
            <p>
              Ranking calculado em:{" "}
              {new Date(atualizadoEm).toLocaleString(
                "pt-BR",
              )}
            </p>
          )}

          {metodoRanking && <p>{metodoRanking}</p>}

          <p>
            O botão Atualizar recalcula o ranking com os
            artigos já armazenados. Novas publicações são
            adicionadas pelo coletor automático do backend.
          </p>
        </footer>
      </div>
    </main>
  );
}
