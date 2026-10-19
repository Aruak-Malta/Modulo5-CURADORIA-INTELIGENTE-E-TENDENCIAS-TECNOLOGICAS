const API_URL = "https://agente-tendencias-tecnologicas-fyd3bzerc9a2cqcu.chilecentral-01.azurewebsites.net/consultas";

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
