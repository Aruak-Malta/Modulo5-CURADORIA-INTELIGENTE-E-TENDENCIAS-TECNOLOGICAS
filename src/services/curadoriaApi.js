const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/consultas";

export async function consultarArtigos(pergunta) {
  const resposta = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pergunta }),
  });

  if (!resposta.ok) {
    throw new Error(`A API respondeu com erro ${resposta.status}`);
  }

  return resposta.json();
}