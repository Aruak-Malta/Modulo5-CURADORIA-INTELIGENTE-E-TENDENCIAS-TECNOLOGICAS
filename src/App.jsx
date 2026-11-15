import { useEffect, useState } from "react";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import { obterSessao, sair } from "./services/authApi";
import { clearTokens, hasAccessToken } from "./services/authSession";

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(true);
  const [erroSessao, setErroSessao] = useState("");

  useEffect(() => {
    let ativo = true;

    async function verificarSessao() {
      if (!hasAccessToken()) {
        setVerificando(false);
        return;
      }

      try {
        const sessao = await obterSessao();

        if (ativo) {
          setUsuario(sessao);
        }
      } catch (error) {
        if (!ativo) return;

        if (error.status === 401) {
          clearTokens();
        }

        setErroSessao(error.message);
      } finally {
        if (ativo) {
          setVerificando(false);
        }
      }
    }

    verificarSessao();

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    function encerrarPorExpiracao() {
      setUsuario(null);
      setErroSessao("Sua sessão expirou. Entre novamente.");
    }

    window.addEventListener(
      "curadoria:session-expired",
      encerrarPorExpiracao,
    );

    return () => {
      window.removeEventListener(
        "curadoria:session-expired",
        encerrarPorExpiracao,
      );
    };
  }, []);

  async function encerrarSessao() {
    let erro = "";

    try {
      await sair();
    } catch (error) {
      erro = `A sessão local foi encerrada, mas o logout remoto falhou: ${error.message}`;
    } finally {
      clearTokens();
      setUsuario(null);
      setErroSessao(erro);
    }
  }

  if (verificando) {
    return (
      <main className="login-page">
        <p role="status">Verificando sessão...</p>
      </main>
    );
  }

  if (!usuario) {
    return (
      <LoginPage
        initialError={erroSessao}
        onAuthenticated={(sessao) => {
          setErroSessao("");
          setUsuario(sessao);
        }}
      />
    );
  }

  return (
    <ChatPage
      usuario={usuario}
      aoSair={encerrarSessao}
    />
  );
}
