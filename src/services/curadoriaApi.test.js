import assert from "node:assert/strict";
import { test } from "node:test";
import { consultarArtigos } from "./curadoriaApi.js";

test("sends the question as JSON and returns the API response", async (context) => {
  const dados = { artigos: [{ titulo: "Artigo", link: "https://example.com" }] };
  const fetchMock = context.mock.method(
    globalThis,
    "fetch",
    async () => ({
      ok: true,
      json: async () => dados,
    }),
  );

  assert.deepEqual(await consultarArtigos("inteligência artificial"), dados);
  assert.equal(fetchMock.mock.calls.length, 1);
  assert.deepEqual(fetchMock.mock.calls[0].arguments, [
    "http://127.0.0.1:8000/consultas",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pergunta: "inteligência artificial" }),
    },
  ]);
});

test("throws when the API responds with an error", async (context) => {
  context.mock.method(globalThis, "fetch", async () => ({
    ok: false,
    status: 503,
  }));

  await assert.rejects(
    consultarArtigos("teste"),
    new Error("A API respondeu com erro 503"),
  );
});
