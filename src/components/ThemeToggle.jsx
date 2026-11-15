import { useEffect, useState } from "react";

function obterTemaInicial() {
  try {
    const temaSalvo = localStorage.getItem("modulo5-tema");

    if (temaSalvo === "dark" || temaSalvo === "light") {
      return temaSalvo;
    }
  } catch {
    return "light";
  }

  return "light";
}

export default function ThemeToggle() {
  const [tema, setTema] = useState(obterTemaInicial);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      tema,
    );

    document.documentElement.style.colorScheme = tema;

    try {
      localStorage.setItem("modulo5-tema", tema);
    } catch {
      return;
    }
  }, [tema]);

  function alternarTema() {
    setTema((anterior) =>
      anterior === "dark" ? "light" : "dark",
    );
  }

  const modoEscuro = tema === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={alternarTema}
      aria-label={
        modoEscuro
          ? "Ativar modo claro"
          : "Ativar modo escuro"
      }
      aria-pressed={modoEscuro}
      title={
        modoEscuro
          ? "Ativar modo claro"
          : "Ativar modo escuro"
      }
    >
      <span
        className="theme-toggle-icon"
        aria-hidden="true"
      >
        {modoEscuro ? "☀" : "☾"}
      </span>

      <span className="theme-toggle-label">
        {modoEscuro ? "Modo claro" : "Modo escuro"}
      </span>
    </button>
  );
}
