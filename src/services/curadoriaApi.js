
import { apiRequest } from "./apiClient.js";

// ==========================================
// CONSULTAS DE ARTIGOS
// ==========================================

export function consultarArtigos(
  pergunta,
  { chatId, projectId } = {},
) {
  return apiRequest("/consultas", {
    method: "POST",
    json: {
      pergunta,
      ...(chatId ? { chat_id: chatId } : {}),
      ...(projectId ? { project_id: projectId } : {}),
    },
  });
}

// ==========================================
// ASSISTENTE DO MÓDULO 7
// ==========================================

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

// ==========================================
// HISTÓRICO DE CONVERSAS
// ==========================================

export function listarConversas(projectId) {
  const parametros = new URLSearchParams();

  if (projectId) {
    parametros.set("project_id", projectId);
  }

  const query = parametros.toString();

  return apiRequest(
    `/conversas${query ? `?${query}` : ""}`,
  );
}

export function obterConversa(chatId) {
  return apiRequest(
    `/conversas/${encodeURIComponent(chatId)}`,
  );
}

// ==========================================
// GITHUB — MÓDULO 5
// ==========================================

// Salva o repositório associado ao usuário
// autenticado pelo Módulo 1.
export function salvarRepositorioUsuario(repositorio) {
  return apiRequest("/github/repositorios", {
    method: "POST",
    json: { repositorio },
  });
}

// Lista os repositórios do usuário.
export function listarRepositoriosUsuario() {
  return apiRequest("/github/repositorios");
}

// Recupera recomendações salvas.
export function listarRecomendacoesUsuario() {
  return apiRequest("/github/recomendacoes");
}

// ==========================================
// COMPATIBILIDADE COM ROTAS ANTIGAS
// ==========================================

export function salvarRepositorioProjeto(
  projectId,
  repositorio,
) {
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
