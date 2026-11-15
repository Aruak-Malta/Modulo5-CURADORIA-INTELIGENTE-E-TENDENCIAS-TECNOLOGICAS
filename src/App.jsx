
import { useState } from "react";

import ChatPage from "./pages/ChatPage";
import {
  fazerLogin,
  verificarSessao,
  encerrarSessao,
} from "./services/authApi";

const DESENVOLVIMENTO = import.meta.env.DEV;

const estilos = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(15, 23, 42, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    backdropFilter: "blur(3px)",
  },

  modal: {
    width: "100%",
    maxWidth: "370px",
    background: "#ffffff",
    borderRadius: "12px",
    padding: "28px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    color: "#172033",
  },

  titulo: {
    fontSize: "22px",
    margin: "0 0 10px",
    fontWeight: 700,
  },

  descricao: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: 1.6,
    marginBottom: "24px",
  },

  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "7px",
  },

  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    marginBottom: "17px",
    boxSizing: "border-box",
    fontSize: "14px",
  },

  botao: {
    padding: "11px 18px",
    border: "none",
    borderRadius: "7px",
    background: "#202c62",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
  },

  secundario: {
    padding: "11px 18px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    background: "#fff",
    color: "#172033",
    cursor: "pointer",
  },

  erro: {
    color: "#dc2626",
    fontSize: "13px",
    marginBottom: "15px",
  },

  barra: {
    position: "fixed",
    right: "20px",
    bottom: "20px",
    zIndex: 100,
  },
};

export default function App() {
  const [autenticado, setAutenticado] = useState(false);

  const [modalAberto, setModalAberto] = useState(
    !DESENVOLVIMENTO,
  );

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(evento) {
    evento.preventDefault();

    if (carregando) return;

    setCarregando(true);
    setErro("");

    try {
      await fazerLogin(email, senha);
      await verificarSessao();

      setAutenticado(true);
      setModalAberto(false);
      setSenha("");
    } catch (falha) {
      encerrarSessao();
      setAutenticado(false);

      setErro(
        falha instanceof Error
          ? falha.message
          : "Falha na autenticação.",
      );
    } finally {
      setCarregando(false);
    }
  }

  function sair() {
    encerrarSessao();
    setAutenticado(false);
    setSenha("");
    setErro("");
    setModalAberto(true);
  }

  return (
    <>
      <ChatPage />

      {DESENVOLVIMENTO && !modalAberto && (
        <div style={estilos.barra}>
          <button
            type="button"
            style={estilos.botao}
            onClick={() => setModalAberto(true)}
          >
            {autenticado
              ? "Minha sessão"
              : "Testar login do Módulo 1"}
          </button>
        </div>
      )}

      {modalAberto && (
        <div style={estilos.overlay}>
          <section
            style={estilos.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-login"
          >
            <h2
              id="titulo-login"
              style={estilos.titulo}
            >
              {autenticado
                ? "Sessão autenticada"
                : "Acesso restrito"}
            </h2>

            <p style={estilos.descricao}>
              {autenticado
                ? "Você está conectado com sua conta do Módulo 1."
                : "Entre com sua conta do Módulo 1 para acessar a Curadoria Inteligente."}
            </p>

            {!autenticado ? (
              <form onSubmit={entrar}>
                <label
                  htmlFor="login-email"
                  style={estilos.label}
                >
                  E-mail
                </label>

                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(evento) =>
                    setEmail(evento.target.value)
                  }
                  style={estilos.input}
                  placeholder="Seu e-mail"
                />

                <label
                  htmlFor="login-senha"
                  style={estilos.label}
                >
                  Senha
                </label>

                <input
                  id="login-senha"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={senha}
                  onChange={(evento) =>
                    setSenha(evento.target.value)
                  }
                  style={estilos.input}
                  placeholder="Sua senha"
                />

                {erro && (
                  <p role="alert" style={estilos.erro}>
                    {erro}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="submit"
                    disabled={carregando}
                    style={estilos.botao}
                  >
                    {carregando
                      ? "Entrando..."
                      : "Entrar"}
                  </button>

                  {DESENVOLVIMENTO && (
                    <button
                      type="button"
                      style={estilos.secundario}
                      onClick={() =>
                        setModalAberto(false)
                      }
                    >
                      Continuar desenvolvendo
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  style={estilos.botao}
                  onClick={() =>
                    setModalAberto(false)
                  }
                >
                  Continuar
                </button>

                <button
                  type="button"
                  style={estilos.secundario}
                  onClick={sair}
                >
                  Sair
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
