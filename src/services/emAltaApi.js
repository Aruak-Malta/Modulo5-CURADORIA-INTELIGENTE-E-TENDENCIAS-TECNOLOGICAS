
const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000"
)
  .replace(/\/+$/, "")
  .replace(/\/consultas$/, "");

export async function buscarEmAlta({
  categoria = "geral",
  limite = 20,
  signal,
} = {}) {
  const parametros = new URLSearchParams({
    limite: String(limite),
  });

  if (categoria && categoria !== "geral") {
    parametros.set("categoria", categoria);
  }

  const resposta = await fetch(
    `${API_URL}/em-alta?${parametros.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal,
    },
  );

  if (!resposta.ok) {
    let mensagem = `Erro HTTP ${resposta.status}`;

    try {
      const dados = await resposta.json();

      if (typeof dados.detail === "string") {
        mensagem = dados.detail;
      }
    } catch {
      mensagem = `Erro HTTP ${resposta.status}`;
    }

    throw new Error(mensagem);
  }

  return resposta.json();
}
