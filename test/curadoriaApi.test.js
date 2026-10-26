import assert from "node:assert/strict";
import test from "node:test";

import { consultarArtigos } from "../src/services/curadoriaApi.js";

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

test("propaga erro quando a API responde com falha", async (context) => {
  context.mock.method(globalThis, "fetch", async () => ({
    ok: false,
    status: 503,
  }));

  await assert.rejects(
    consultarArtigos("computação quântica"),
    { message: "A API respondeu com erro 503" },
  );
});
