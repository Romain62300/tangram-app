
import { FIGURES } from './figures';

export default function TargetSilhouette({ figureId }) {
  if (!figureId) return null;

  const fig = FIGURES.find((f) => f.id === figureId);

  if (!fig || !Array.isArray(fig.shapes) || fig.shapes.length === 0) {
    return null;
  }

  const allPts = fig.shapes.flat();

  if (allPts.length === 0) return null;

  const xs = allPts.map(([x]) => x);
  const ys = allPts.map(([, y]) => y);

  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  const padding = 16;
  const labelHeight = 28;

  const width = maxX - minX + padding * 2;
  const shapeHeight = maxY - minY + padding * 2;
  const height = shapeHeight + labelHeight;

  const offsetX = -minX + padding;
  const offsetY = -minY + padding;

  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        left: 20,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ display: 'block', overflow: 'visible' }}
        role="img"
        aria-label={`Silhouette : ${fig.label}`}
      >
        {fig.shapes.map((shape, index) => (
          <polygon
            key={index}
            points={shape
              .map(([x, y]) => `${x + offsetX},${y + offsetY}`)
              .join(' ')}
            fill="rgba(80,80,80,0.13)"
            stroke="rgba(80,80,80,0.32)"
            strokeWidth="1.5"
          />
        ))}

        <text
          x={width / 2}
          y={shapeHeight + 12}
          textAnchor="middle"
          fontSize="12"
          fill="#777"
          fontFamily="sans-serif"
        >
          {fig.emoji} {fig.label}
        </text>
      </svg>
    </div>
  );
}
