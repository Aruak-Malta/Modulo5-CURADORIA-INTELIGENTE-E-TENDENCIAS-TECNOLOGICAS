import { apiRequest } from "./apiClient.js";

export function consultarArtigos(pergunta, { chatId, projectId } = {}) {
  return apiRequest("/consultas", {
    method: "POST",
    json: {
      pergunta,
      ...(chatId ? { chat_id: chatId } : {}),
      ...(projectId ? { project_id: projectId } : {}),
    },
  });
}

export function perguntarAoAssistente(
  pergunta,
  { chatId, projectId } = {},
) {
  return apiRequest("/assistente", {
    method: "POST",
    json: {
      pergunta,
      ...(chatId ? { chat_id: chatId } : {}),
      ...(projectId ? { project_id: projectId } : {}),
    },
  });
}

export function listarConversas(projectId) {
  const parametros = new URLSearchParams();
  if (projectId) parametros.set("project_id", projectId);
  const query = parametros.toString();
  return apiRequest(`/conversas${query ? `?${query}` : ""}`);
}

export function obterConversa(chatId) {
  return apiRequest(`/conversas/${encodeURIComponent(chatId)}`);
}

export function salvarRepositorioProjeto(projectId, repositorio) {
  return apiRequest(
    `/projetos/${encodeURIComponent(projectId)}/repositorios`,
    {
      method: "POST",
      json: { repositorio },
    },
  );
}

export function listarRepositoriosProjeto(projectId) {
  return apiRequest(
    `/projetos/${encodeURIComponent(projectId)}/repositorios`,
  );
}

export function listarRecomendacoesProjeto(projectId) {
  return apiRequest(
    `/projetos/${encodeURIComponent(projectId)}/recomendacoes`,
  );
}
