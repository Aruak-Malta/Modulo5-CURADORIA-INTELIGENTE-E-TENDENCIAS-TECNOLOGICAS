import { useState } from "react";
import {
  entrar,
  obterSessao,
  verificarMfa,
} from "../services/authApi";
import { clearTokens, saveTokens } from "../services/authSession";
import "./LoginPage.css";

const MODULO1_FRONTEND =
  "https://green-river-02e44e810.2.azurestaticapps.net";

export default function LoginPage({
  onAuthenticated,
  initialError = "",
}) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [codigo, setCodigo] = useState("");
  const [usarCodigoRecuperacao, setUsarCodigoRecuperacao] =
    useState(false);
  const [desafio, setDesafio] = useState("");
  const [erro, setErro] = useState(initialError);
  const [carregando, setCarregando] = useState(false);

  async function concluirLogin(tokens) {
    if (tokens?.mfa_required && tokens.challenge_token) {
      setDesafio(tokens.challenge_token);
      setSenha("");
      setCodigo("");
      return;
    }

    saveTokens(tokens);
    try {
      const usuario = await obterSessao();
      onAuthenticated(usuario);
    } catch (error) {
      clearTokens();
      throw error;
    }
  }

  async function enviarLogin(evento) {
    evento.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const resultado = await entrar(email.trim(), senha);
      await concluirLogin(resultado);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  async function enviarCodigoMfa(evento) {
    evento.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const resultado = await verificarMfa({
        challenge_token: desafio,
        ...(usarCodigoRecuperacao
          ? { recovery_code: codigo.trim() }
          : { code: codigo.trim() }),
      });
      setDesafio("");
      await concluirLogin(resultado);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  function cancelarMfa() {
    setDesafio("");
    setCodigo("");
    setErro("");
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <span aria-hidden="true">✦</span>
          <div>
            <strong>Curadoria IA</strong>
            <small>Módulo 5</small>
          </div>
        </div>

        {desafio ? (
          <>
            <h1>Confirme sua identidade</h1>
            <p className="login-description">
              Digite o código de autenticação para concluir o acesso.
            </p>

            <form className="login-form" onSubmit={enviarCodigoMfa}>
              <label htmlFor="mfa-code">
                {usarCodigoRecuperacao
                  ? "Código de recuperação"
                  : "Código MFA"}
              </label>
              <input
                id="mfa-code"
                type="text"
                value={codigo}
                onChange={(evento) => setCodigo(evento.target.value)}
                autoComplete="one-time-code"
                required
                disabled={carregando}
              />
              <button type="submit" disabled={carregando}>
                {carregando ? "Verificando..." : "Confirmar"}
              </button>
            </form>

            <button
              className="login-text-button"
              type="button"
              onClick={() =>
                setUsarCodigoRecuperacao((atual) => !atual)
              }
              disabled={carregando}
            >
              {usarCodigoRecuperacao
                ? "Usar código do autenticador"
                : "Usar código de recuperação"}
            </button>
            <button
              className="login-text-button"
              type="button"
              onClick={cancelarMfa}
              disabled={carregando}
            >
              Voltar ao login
            </button>
          </>
        ) : (
          <>
            <h1>Entre na sua conta</h1>
            <p className="login-description">
              Use sua conta do Módulo 1 para acessar o histórico e os projetos.
            </p>

            <form className="login-form" onSubmit={enviarLogin}>
              <label htmlFor="login-email">E-mail</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
                autoComplete="username"
                required
                disabled={carregando}
              />

              <label htmlFor="login-password">Senha</label>
              <input
                id="login-password"
                type="password"
                value={senha}
                onChange={(evento) => setSenha(evento.target.value)}
                autoComplete="current-password"
                required
                disabled={carregando}
              />

              <button type="submit" disabled={carregando}>
                {carregando ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <p className="login-signup">
              Ainda não tem conta?{" "}
              <a
                href={MODULO1_FRONTEND}
                target="_blank"
                rel="noopener noreferrer"
              >
                Criar conta no Módulo 1
              </a>
            </p>
          </>
        )}

        {erro && (
          <p className="login-error" role="alert">
            {erro}
          </p>
        )}
      </section>
    </main>
  );
}

