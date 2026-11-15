import assert from "node:assert/strict";
import test from "node:test";

import {
  consultarArtigos,
  perguntarAoAssistente,
} from "../src/services/curadoriaApi.js";

test("envia a pergunta e retorna os artigos da API", async (context) => {
  const artigos = [{ titulo: "Artigo de teste", link: "https://example.com" }];
  let requisicao;

  context.mock.method(globalThis, "fetch", async (url, options) => {
    requisicao = { url, options };
    return {
      ok: true,
      json: async () => ({ artigos }),
    };
  });

  const resposta = await consultarArtigos("computação quântica");

  assert.equal(requisicao.url, "https://agente-tendencias-tecnologicas-fyd3bzerc9a2cqcu.chilecentral-01.azurewebsites.net/consultas");
  assert.equal(requisicao.options.method, "POST");
  assert.deepEqual(JSON.parse(requisicao.options.body), {
    pergunta: "computação quântica",
  });
  assert.deepEqual(resposta.artigos, artigos);
});

test("envia projeto e conversa às rotas persistentes", async (context) => {
  let requisicao;

  context.mock.method(globalThis, "fetch", async (url, options) => {
    requisicao = { url, options };
    return {
      ok: true,
      json: async () => ({
        chat_id: 17,
        message: { content: "Resposta" },
      }),
    };
  });

  await perguntarAoAssistente("Analise o projeto", {
    chatId: 17,
    projectId: "7a1d0f4e-2b6c-4c1e-9f3a-5d8e7c6b4a01",
  });

  assert.ok(requisicao.url.endsWith("/assistente"));
  assert.deepEqual(JSON.parse(requisicao.options.body), {
    pergunta: "Analise o projeto",
    chat_id: 17,
    project_id: "7a1d0f4e-2b6c-4c1e-9f3a-5d8e7c6b4a01",
  });
});

test("propaga erro quando a API responde com falha", async (context) => {
  context.mock.method(globalThis, "fetch", async () => ({
    ok: false,
    status: 503,
    json: async () => ({ detail: "Banco indisponível" }),
  }));

  await assert.rejects(
    consultarArtigos("computação quântica"),
    { message: "Banco indisponível", status: 503 },
  );
});
