import { FIGURES } from './figures';

export default function FigureLibrary({ activeFigureId, onSelect, onClose }) {
  return (
    <div className="figure-library">
      <div className="lib-header">
        <span>Figures cibles</span>
        <button className="lib-close" onClick={onClose}>✕</button>
      </div>
      <div className="lib-grid">
        <button
          className={`lib-item ${activeFigureId === null ? 'active' : ''}`}
          onClick={() => onSelect(null)}
        >
          <span className="lib-emoji">∅</span>
          <span className="lib-label">Aucune</span>
        </button>
        {FIGURES.map((fig) => (
          <button
            key={fig.id}
            className={`lib-item ${activeFigureId === fig.id ? 'active' : ''}`}
            onClick={() => onSelect(fig.id)}
          >
            <span className="lib-emoji">{fig.emoji}</span>
            <span className="lib-label">{fig.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
