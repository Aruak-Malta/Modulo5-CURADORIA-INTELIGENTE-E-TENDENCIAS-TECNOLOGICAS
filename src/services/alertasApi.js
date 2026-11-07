
const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000"
)
  .replace(/\/+$/, "")
  .replace(/\/consultas$/, "");

export async function buscarAlertas({
  repositorio = "",
  limite = 20,
  signal,
} = {}) {
  const parametros = new URLSearchParams();

  parametros.set("limite", String(limite));

  if (repositorio.trim()) {
    parametros.set("repositorio", repositorio.trim());
  }

  const resposta = await fetch(
    `${API_URL}/alertas?${parametros.toString()}`,
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
