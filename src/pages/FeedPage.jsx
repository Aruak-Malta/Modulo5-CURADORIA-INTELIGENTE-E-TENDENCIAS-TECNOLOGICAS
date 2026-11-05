
import { useEffect, useMemo, useState } from "react";
import {
  buscarCategorias,
  buscarFeed,
} from "../services/feedApi";
import "./FeedPage.css";

const CATEGORIAS_PADRAO = [
  { id: "geral", nome: "Todos" },
  {
    id: "inteligencia-artificial",
    nome: "Inteligência Artificial",
  },
  {
    id: "desenvolvimento",
    nome: "Desenvolvimento de Software",
  },
  { id: "seguranca", nome: "Segurança" },
  { id: "devops", nome: "DevOps e Infraestrutura" },
  {
    id: "computacao-quantica",
    nome: "Computação Quântica",
  },
];

function formatarData(valor) {
  if (!valor) {
    return "Data indisponível";
  }

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "Data indisponível";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(data);
}

function validarRepositorio(valor) {
  return /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(valor);
}

export default function FeedPage() {
  const [categorias, setCategorias] = useState(
    CATEGORIAS_PADRAO,
  );
  const [categoria, setCategoria] = useState("geral");
  const [repositorioDigitado, setRepositorioDigitado] =
    useState("");
  const [repositorioAtivo, setRepositorioAtivo] =
    useState("");
  const [artigos, setArtigos] = useState([]);
  const [stackDetectada, setStackDetectada] = useState([]);
  const [fontesIndisponiveis, setFontesIndisponiveis] =
    useState([]);
  const [idioma, setIdioma] = useState("todos");
  const [fonte, setFonte] = useState("Todas");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [erroRepositorio, setErroRepositorio] =
    useState("");
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const [revisao, setRevisao] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function carregarCategorias() {
      try {
        const resultado = await buscarCategorias(
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setCategorias(resultado);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(
            "Erro ao carregar categorias:",
            error,
          );
        }
      }
    }

    carregarCategorias();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function carregar() {
      setCarregando(true);
      setErro("");

      try {
        const dados = await buscarFeed({
          categoria,
          repositorio: repositorioAtivo,
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setArtigos(dados.artigos);
        setStackDetectada(dados.stackDetectada);
        setFontesIndisponiveis(
          dados.fontesIndisponiveis,
        );
        setAtualizadoEm(new Date());
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setArtigos([]);
        setStackDetectada([]);
        setErro(
          error.message ||
            "Não foi possível carregar as publicações.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    carregar();

    return () => controller.abort();
  }, [categoria, repositorioAtivo, revisao]);

  const fontes = useMemo(
    () =>
      [
        "Todas",
        ...new Set(
          artigos.map((artigo) => artigo.fonte),
        ),
      ],
    [artigos],
  );

  const artigosFiltrados = useMemo(
    () =>
      artigos.filter((artigo) => {
        const correspondeIdioma =
          idioma === "todos" ||
          artigo.idioma === idioma;

        const correspondeFonte =
          fonte === "Todas" ||
          artigo.fonte === fonte;

        return correspondeIdioma && correspondeFonte;
      }),
    [artigos, idioma, fonte],
  );

  const nomeCategoria =
    categorias.find((item) => item.id === categoria)
      ?.nome ?? "Feed";

  const limite = categoria === "geral" ? 10 : 5;

  function selecionarCategoria(novaCategoria) {
    setCategoria(novaCategoria);
    setFonte("Todas");
    setIdioma("todos");
  }

  function conectarRepositorio(evento) {
    evento.preventDefault();

    const valor = repositorioDigitado
      .trim()
      .replace(/^https?:\/\/github\.com\//i, "")
      .replace(/\/+$/, "");

    if (!validarRepositorio(valor)) {
      setErroRepositorio(
        "Informe um repositório no formato usuario/projeto.",
      );
      return;
    }

    setErroRepositorio("");
    setRepositorioDigitado(valor);
    setRepositorioAtivo(valor);
    setRevisao((atual) => atual + 1);
  }

  function desconectarRepositorio() {
    setRepositorioDigitado("");
    setRepositorioAtivo("");
    setStackDetectada([]);
    setErroRepositorio("");
  }

  function atualizar() {
    setRevisao((atual) => atual + 1);
  }

  return (
    <main className="feed-page">
      <header className="feed-header">
        <div>
          <h1>Feed de Tecnologia</h1>
          <p>
            Notícias em português e inglês, organizadas
            por tema e personalizadas pela stack GitHub.
          </p>
        </div>

        <button
          type="button"
          className="feed-refresh"
          onClick={atualizar}
          disabled={carregando}
        >
          {carregando ? "Atualizando..." : "Atualizar feed"}
        </button>
      </header>

      <div className="feed-content">
        <section className="feed-github">
          <div className="feed-github-heading">
            <div>
              <h2>Seu repositório GitHub</h2>
              <p>
                Informe um repositório público para receber
                recomendações relacionadas às tecnologias
                utilizadas no projeto.
              </p>
            </div>

            <span className="feed-github-status">
              {repositorioAtivo
                ? "Repositório informado"
                : "Não conectado"}
            </span>
          </div>

          <form
            className="feed-github-form"
            onSubmit={conectarRepositorio}
          >
            <input
              type="text"
              value={repositorioDigitado}
              onChange={(evento) =>
                setRepositorioDigitado(
                  evento.target.value,
                )
              }
              placeholder="usuario/repositorio"
              aria-label="Repositório GitHub"
              spellCheck={false}
            />

            <button type="submit" disabled={carregando}>
              Aplicar repositório
            </button>

            {repositorioAtivo && (
              <button
                type="button"
                className="feed-github-remove"
                onClick={desconectarRepositorio}
              >
                Remover
              </button>
            )}
          </form>

          {erroRepositorio && (
            <p className="feed-github-error" role="alert">
              {erroRepositorio}
            </p>
          )}

          {repositorioAtivo && (
            <div className="feed-repository-detail">
              <a
                href={`https://github.com/${repositorioAtivo}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {repositorioAtivo}
              </a>

              {stackDetectada.length > 0 ? (
                <div className="feed-stack">
                  {stackDetectada.map((tecnologia) => (
                    <span
                      className="feed-stack-item"
                      key={tecnologia}
                    >
                      {tecnologia}
                    </span>
                  ))}
                </div>
              ) : (
                !carregando &&
                !erro && (
                  <p className="feed-stack-empty">
                    Nenhuma tecnologia foi identificada
                    nos arquivos analisados.
                  </p>
                )
              )}
            </div>
          )}
        </section>

        <section className="feed-categories">
          <h2>Explorar por categoria</h2>

          <div
            className="feed-category-list"
            aria-label="Categorias de tecnologia"
          >
            {categorias.map((item) => (
              <button
                key={item.id}
                type="button"
                className={
                  categoria === item.id
                    ? "feed-category feed-category--active"
                    : "feed-category"
                }
                onClick={() =>
                  selecionarCategoria(item.id)
                }
                aria-pressed={
                  categoria === item.id
                }
              >
                {item.nome}
              </button>
            ))}
          </div>
        </section>

        <section className="feed-toolbar">
          <div>
            <h2>{nomeCategoria}</h2>
            <p>
              Até {limite} recomendações
              {repositorioAtivo
                ? " personalizadas para seu projeto"
                : " de tecnologia"}
              .
            </p>
          </div>

          {atualizadoEm && (
            <span className="feed-updated">
              Atualizado às{" "}
              {atualizadoEm.toLocaleTimeString(
                "pt-BR",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                },
              )}
            </span>
          )}
        </section>

        <div className="feed-controls">
          <div className="feed-control">
            <label htmlFor="feed-idioma">
              Idioma
            </label>
            <select
              id="feed-idioma"
              value={idioma}
              onChange={(evento) =>
                setIdioma(evento.target.value)
              }
            >
              <option value="todos">
                Português e inglês
              </option>
              <option value="pt">Português</option>
              <option value="en">Inglês</option>
            </select>
          </div>

          <div className="feed-control">
            <label htmlFor="feed-fonte">
              Fonte
            </label>
            <select
              id="feed-fonte"
              value={
                fontes.includes(fonte)
                  ? fonte
                  : "Todas"
              }
              onChange={(evento) =>
                setFonte(evento.target.value)
              }
            >
              {fontes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <span className="feed-count">
            {artigosFiltrados.length} de{" "}
            {artigos.length} artigos
          </span>
        </div>

        {erro && (
          <div className="feed-error" role="alert">
            {erro}
          </div>
        )}

        {fontesIndisponiveis.length > 0 &&
          !erro && (
            <div className="feed-warning">
              Algumas fontes não responderam:{" "}
              {fontesIndisponiveis.join(", ")}.
            </div>
          )}

        {carregando ? (
          <div
            className="feed-empty"
            role="status"
          >
            Buscando publicações e analisando
            recomendações...
          </div>
        ) : !erro && artigosFiltrados.length === 0 ? (
          <div className="feed-empty">
            Nenhuma publicação disponível para
            os filtros selecionados.
          </div>
        ) : !erro ? (
          <section
            className="feed-grid"
            aria-label="Artigos recomendados"
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

                  <span className="feed-language">
                    {artigo.idioma === "pt"
                      ? "Português"
                      : "Inglês"}
                  </span>
                </div>

                <h3>{artigo.titulo}</h3>

                <div className="feed-card-bottom">
                  <span className="feed-date">
                    {formatarData(
                      artigo.data_publicacao,
                    )}
                  </span>

                  <a
                    className="feed-card-link"
                    href={artigo.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ler publicação
                  </a>
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
