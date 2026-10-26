import PropTypes from "prop-types";

export default function ArticleCard({ artigo }) {
  return (
    <a
      className="article-card"
      href={artigo.link}
      target="_blank"
      rel="noreferrer"
    >
      <strong>{artigo.titulo}</strong>
      <span>{artigo.link}</span>
    </a>
  );
}

ArticleCard.propTypes = {
  artigo: PropTypes.shape({
    link: PropTypes.string.isRequired,
    titulo: PropTypes.string.isRequired,
  }).isRequired,
};