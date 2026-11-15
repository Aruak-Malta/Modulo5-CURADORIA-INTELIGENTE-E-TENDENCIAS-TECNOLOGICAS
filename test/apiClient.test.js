import assert from "node:assert/strict";
import test from "node:test";

import { apiRequest } from "../src/services/apiClient.js";
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "../src/services/authSession.js";

function usarArmazenamentoDeSessao(context) {
  const propriedadeAnterior = Object.getOwnPropertyDescriptor(
    globalThis,
    "sessionStorage",
  );
  const valores = new Map();
  const armazenamento = {
    getItem: (chave) => valores.get(chave) ?? null,
    setItem: (chave, valor) => valores.set(chave, String(valor)),
    removeItem: (chave) => valores.delete(chave),
  };

  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: armazenamento,
  });
  context.after(() => {
    if (propriedadeAnterior) {
      Object.defineProperty(
        globalThis,
        "sessionStorage",
        propriedadeAnterior,
      );
    } else {
      delete globalThis.sessionStorage;
    }
  });
}

test("envia o Bearer e renova a sessão após 401", async (context) => {
  usarArmazenamentoDeSessao(context);
  saveTokens({
    access_token: "access-antigo",
    refresh_token: "refresh-antigo",
  });
  const chamadas = [];

  context.mock.method(globalThis, "fetch", async (url, options) => {
    chamadas.push({ url, options });

    if (url.endsWith("/auth/refresh")) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          access_token: "access-novo",
          refresh_token: "refresh-novo",
        }),
      };
    }

    if (options.headers.get("Authorization") === "Bearer access-antigo") {
      return {
        ok: false,
        status: 401,
        json: async () => ({ detail: "Token expirado" }),
      };
    }

    return {
      ok: true,
      status: 200,
      json: async () => ({ conversas: [] }),
    };
  });

  const resultado = await apiRequest("/conversas");

  assert.deepEqual(resultado, { conversas: [] });
  assert.equal(chamadas.length, 3);
  assert.equal(
    chamadas[0].options.headers.get("Authorization"),
    "Bearer access-antigo",
  );
  assert.equal(
    chamadas[2].options.headers.get("Authorization"),
    "Bearer access-novo",
  );
  assert.equal(getAccessToken(), "access-novo");
  assert.equal(getRefreshToken(), "refresh-novo");
});

test("remove tokens quando o refresh também é recusado", async (context) => {
  usarArmazenamentoDeSessao(context);
  saveTokens({
    access_token: "access-antigo",
    refresh_token: "refresh-revogado",
  });

  context.mock.method(globalThis, "fetch", async (url) => ({
    ok: false,
    status: 401,
    json: async () => ({
      detail: url.endsWith("/auth/refresh")
        ? "Refresh revogado"
        : "Token expirado",
    }),
  }));

  await assert.rejects(apiRequest("/conversas"), {
    message: "Token expirado",
    status: 401,
  });
  assert.equal(getAccessToken(), null);
  assert.equal(getRefreshToken(), null);
});
