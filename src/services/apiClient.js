import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "./authSession.js";

export const API_BASE_URL = (
  import.meta.env?.VITE_API_URL ||
  "https://agente-tendencias-tecnologicas-fyd3bzerc9a2cqcu.chilecentral-01.azurewebsites.net/consultas"
)
  .replace(/\/+$/, "")
  .replace(/\/consultas$/, "");

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function mensagemDeErro(resposta) {
  let dados;

  try {
    dados = await resposta.json();
  } catch (erro) {
    if (!(erro instanceof SyntaxError)) {
      throw erro;
    }
  }

  const detalhe = dados?.detail;
  const mensagem = typeof detalhe === "string"
    ? detalhe
    : Array.isArray(detalhe)
      ? detalhe.map((item) => item.msg).filter(Boolean).join("; ")
      : `Erro HTTP ${resposta.status}`;

  return new ApiError(mensagem, resposta.status);
}

async function renovarToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  const resposta = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if ([400, 401, 403].includes(resposta.status)) {
    clearTokens();
    return false;
  }
  if (!resposta.ok) {
    throw await mensagemDeErro(resposta);
  }

  const tokens = await resposta.json();
  saveTokens(tokens);
  return true;
}

let renovacaoEmAndamento;

async function tentarRenovarToken() {
  if (!renovacaoEmAndamento) {
    renovacaoEmAndamento = renovarToken().finally(() => {
      renovacaoEmAndamento = undefined;
    });
  }
  return renovacaoEmAndamento;
}

export async function apiRequest(
  caminho,
  {
    method = "GET",
    json,
    signal,
    headers: headersInput,
    includeAuth = true,
    allowRefresh = true,
  } = {},
) {
  const headers = new Headers(headersInput);
  headers.set("Accept", "application/json");
  if (json !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (includeAuth) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const resposta = await fetch(`${API_BASE_URL}${caminho}`, {
    method,
    headers,
    body: json === undefined ? undefined : JSON.stringify(json),
    signal,
  });

  if (
    resposta.status === 401 &&
    includeAuth &&
    allowRefresh &&
    !caminho.startsWith("/auth/refresh") &&
    getRefreshToken()
  ) {
    if (await tentarRenovarToken()) {
      return apiRequest(caminho, {
        method,
        json,
        signal,
        headers: headersInput,
        includeAuth,
        allowRefresh: false,
      });
    }
  }

  if (resposta.status === 401 && includeAuth) {
    clearTokens();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("curadoria:session-expired"));
    }
  }

  if (!resposta.ok) throw await mensagemDeErro(resposta);
  if (resposta.status === 204) return null;
  return resposta.json();
}
