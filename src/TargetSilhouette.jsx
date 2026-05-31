import { FIGURES } from './figures';

export default function TargetSilhouette({ figureId }) {
  if (!figureId) return null;
  const fig = FIGURES.find((f) => f.id === figureId);
  if (!fig) return null;

  // Compute bounding box across all shapes
  const allPts = fig.shapes.flat();
  const xs = allPts.map(([x]) => x);
  const ys = allPts.map(([, y]) => y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  const pad = 16;
  const w = maxX - minX + pad * 2;
  const h = maxY - minY + pad * 2;
  const ox = -minX + pad;
  const oy = -minY + pad;

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
      <svg width={w} height={h} style={{ display: 'block' }}>
        {fig.shapes.map((shape, i) => (
          <polygon
            key={i}
            points={shape.map(([x, y]) => `${x + ox},${y + oy}`).join(' ')}
            fill="rgba(80,80,80,0.13)"
            stroke="rgba(80,80,80,0.32)"
            strokeWidth="1.5"
          />
        ))}
        <text
          x={w / 2}
          y={h + 16}
          textAnchor="middle"
          fontSize="12"
          fill="#999"
          fontFamily="sans-serif"
        >
          {fig.emoji} {fig.label}
        </text>
      </svg>
    </div>
  );
}
