
const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://agente-tendencias-tecnologicas-fyd3bzerc9a2cqcu.chilecentral-01.azurewebsites.net/consultas"
)
  .replace(/\/+$/, "")
  .replace(/\/consultas$/, "");

async function requisitar(caminho, signal) {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!resposta.ok) {
    let mensagem = `Erro HTTP ${resposta.status}`;

    try {
      const dados = await resposta.json();

      if (typeof dados.detail === "string") {
        mensagem = dados.detail;
      }
    } catch {
      mensagem = `Erro HTTP ${resposta.status}`;
    }

    throw new Error(mensagem);
  }

  return resposta.json();
}

export async function buscarFeed({
  categoria = "geral",
  repositorio = "",
  signal,
} = {}) {
  const parametros = new URLSearchParams();

  if (categoria && categoria !== "geral") {
    parametros.set("categoria", categoria);
  }

  if (repositorio.trim()) {
    parametros.set("repositorio", repositorio.trim());
  }

  const query = parametros.toString();
  const caminho = query ? `/feed?${query}` : "/feed";

  const dados = await requisitar(caminho, signal);

  return {
    artigos: dados.artigos ?? [],
    total: dados.total ?? 0,
    categoria: dados.categoria ?? categoria,
    repositorio: dados.repositorio ?? null,
    stackDetectada: dados.stack_detectada ?? [],
    fontesConsultadas: dados.fontes_consultadas ?? [],
    fontesIndisponiveis: dados.fontes_indisponiveis ?? [],
  };
}

export async function buscarCategorias(signal) {
  const dados = await requisitar("/categorias", signal);

  return [
    { id: "geral", nome: "Todos" },
    ...(dados.categorias ?? []),
  ];
}

export async function detectarStack(repositorio, signal) {
  const parametros = new URLSearchParams({
    repositorio: repositorio.trim(),
  });

  const dados = await requisitar(
    `/github/stack?${parametros}`,
    signal,
  );

  return {
    repositorio: dados.repositorio,
    stackDetectada: dados.stack_detectada ?? [],
    arquivosAnalisados: dados.arquivos_analisados ?? [],
  };
}
