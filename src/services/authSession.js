const ACCESS_TOKEN_KEY = "curadoria.access_token";
const REFRESH_TOKEN_KEY = "curadoria.refresh_token";

function getStorage() {
  return globalThis.sessionStorage ?? null;
}

export function getAccessToken() {
  return getStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
}

export function getRefreshToken() {
  return getStorage()?.getItem(REFRESH_TOKEN_KEY) ?? null;
}

export function hasAccessToken() {
  return Boolean(getAccessToken());
}

export function saveTokens(tokenResponse) {
  if (
    typeof tokenResponse?.access_token !== "string" ||
    !tokenResponse.access_token
  ) {
    throw new Error("O serviço de identidade não retornou um token válido.");
  }

  const storage = getStorage();
  if (!storage) {
    throw new Error("O armazenamento de sessão não está disponível.");
  }
  storage.setItem(ACCESS_TOKEN_KEY, tokenResponse.access_token);

  if (typeof tokenResponse.refresh_token === "string") {
    storage.setItem(REFRESH_TOKEN_KEY, tokenResponse.refresh_token);
  } else {
    storage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function clearTokens() {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(ACCESS_TOKEN_KEY);
  storage.removeItem(REFRESH_TOKEN_KEY);
}
