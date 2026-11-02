
import PropTypes from "prop-types";

export default function MessageInput({
  pergunta,
  aoAlterarPergunta,
  aoEnviar,
  carregando = false,
}) {
  function enviarFormulario(evento) {
    evento.preventDefault();

    if (!carregando && pergunta.trim()) {
      aoEnviar();
    }
  }

  function pressionarTecla(evento) {
    if (
      evento.key === "Enter" &&
      !evento.shiftKey &&
      !evento.nativeEvent.isComposing
    ) {
      evento.preventDefault();

      if (!carregando && pergunta.trim()) {
        aoEnviar();
      }
    }
  }

  return (
    <form
      className="composer"
      onSubmit={enviarFormulario}
    >
      <textarea
        value={pergunta}
        onChange={(evento) =>
          aoAlterarPergunta(evento.target.value)
        }
        onKeyDown={pressionarTecla}
        placeholder="Pergunte sobre uma tecnologia..."
        aria-label="Digite sua pergunta"
        rows={1}
      />

      <button
        type="submit"
        disabled={!pergunta.trim() || carregando}
        aria-label="Enviar pergunta"
      >
        ↑
      </button>
    </form>
  );
}

MessageInput.propTypes = {
  pergunta: PropTypes.string.isRequired,
  aoAlterarPergunta: PropTypes.func.isRequired,
  aoEnviar: PropTypes.func.isRequired,
  carregando: PropTypes.bool,
};
