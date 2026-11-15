
const AUTH_URL =
  "https://mod1-auth.whitemeadow-deba1090.brazilsouth.azurecontainerapps.io";

let accessToken = null;

export function obterToken() {
  return accessToken;
}

export function definirToken(token) {
  accessToken = token;
}

export function encerrarSessao() {
  accessToken = null;
}

export async function fazerLogin(email, senha) {
  const formulario = new URLSearchParams();

  formulario.set("username", email.trim());
  formulario.set("password", senha);

  const resposta = await fetch(
    `${AUTH_URL}/auth/token`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: formulario,
    },
  );

  if (!resposta.ok) {
    if (resposta.status === 401) {
      throw new Error("E-mail ou senha incorretos.");
    }

    throw new Error(
      `Erro na autenticação (HTTP ${resposta.status}).`,
    );
  }

  const dados = await resposta.json();

  if (!dados.access_token) {
    throw new Error("Token não recebido.");
  }

  definirToken(dados.access_token);

  return dados;
}

export async function verificarSessao() {
  const token = obterToken();

  if (!token) {
    throw new Error("Sessão não autenticada.");
  }

  const resposta = await fetch(
    `${AUTH_URL}/auth/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!resposta.ok) {
    if (resposta.status === 401) {
      encerrarSessao();
    }

    throw new Error("Não foi possível validar a sessão.");
  }

  return resposta.json();
}
