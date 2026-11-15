import { apiRequest } from "./apiClient.js";

export function entrar(username, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    json: {
      username,
      password,
    },
    includeAuth: false,
    allowRefresh: false,
  });
}

export function verificarMfa(dados) {
  return apiRequest("/auth/mfa/verify", {
    method: "POST",
    json: dados,
    includeAuth: false,
    allowRefresh: false,
  });
}

export function obterSessao() {
  return apiRequest("/auth/session");
}

export function sair() {
  return apiRequest("/auth/logout", {
    method: "POST",
    json: {},
  });
}
