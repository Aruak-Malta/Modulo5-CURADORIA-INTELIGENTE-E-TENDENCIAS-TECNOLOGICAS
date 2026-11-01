
const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "https://agente-tendencias-tecnologicas-fyd3bzerc9a2cqcu.chilecentral-01.azurewebsites.net/consultas"
).replace(/\/+$/, "").replace(/\/consultas$/, "");

export async function buscarFeed() {
  const resposta = await fetch(`${API_BASE_URL}/feed`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!resposta.ok) {
    throw new Error(
      `Erro ao carregar feed: ${resposta.status}`
    );
  }

  const dados = await resposta.json();

  return {
    artigos: dados.artigos ?? [],
    total: dados.total ?? 0,
    fontesConsultadas: dados.fontes_consultadas ?? [],
    fontesIndisponiveis: dados.fontes_indisponiveis ?? [],
  };
}
