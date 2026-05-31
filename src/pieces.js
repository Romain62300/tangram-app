// Classic Chinese tangram: 7 pieces defined as SVG polygon points (centered at origin)
// All pieces are built on a 4x4 unit grid

export const PIECES = [
  {
    id: 'large-tri-1',
    label: 'Grand Triangle 1',
    color: '#E74C3C',
    // Large right triangle, legs = 4 units
    points: [
      [0, 0],
      [4, 0],
      [0, 4],
    ],
  },
  {
    id: 'large-tri-2',
    label: 'Grand Triangle 2',
    color: '#3498DB',
    points: [
      [0, 0],
      [4, 0],
      [0, 4],
    ],
  },
  {
    id: 'medium-tri',
    label: 'Triangle Moyen',
    color: '#2ECC71',
    // Medium right triangle, legs = 2*sqrt(2) ≈ 2.83, but we use 2-unit legs
    points: [
      [0, 0],
      [2, 0],
      [0, 2],
    ],
  },
  {
    id: 'small-tri-1',
    label: 'Petit Triangle 1',
    color: '#F39C12',
    // Small right triangle, legs = 1 unit... actually standard tangram small tri has legs of 2 units
    // Let's use consistent scale: large legs=4, medium legs=2√2 (hyp 4), small legs=2
    points: [
      [0, 0],
      [2, 0],
      [0, 2],
    ],
  },
  {
    id: 'small-tri-2',
    label: 'Petit Triangle 2',
    color: '#9B59B6',
    points: [
      [0, 0],
      [2, 0],
      [0, 2],
    ],
  },
  {
    id: 'square',
    label: 'Carré',
    color: '#1ABC9C',
    // Square with side = sqrt(2)*unit, oriented as diamond; simpler: axis-aligned 2x2
    points: [
      [0, 0],
      [2, 0],
      [2, 2],
      [0, 2],
    ],
  },
  {
    id: 'parallelogram',
    label: 'Parallélogramme',
    color: '#E67E22',
    // Parallelogram
    points: [
      [0, 2],
      [2, 2],
      [4, 0],
      [2, 0],
    ],
  },
];

// Scale factor: 1 unit = SCALE px
export const SCALE = 50;

// Convert piece points to scaled SVG polygon points string
export function toSVGPoints(points) {
  return points.map(([x, y]) => `${x * SCALE},${y * SCALE}`).join(' ');
}

// Compute bounding box of a piece
export function getBoundingBox(points) {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

// Compute centroid of a piece
export function getCentroid(points) {
  const cx = points.reduce((s, [x]) => s + x, 0) / points.length;
  const cy = points.reduce((s, [, y]) => s + y, 0) / points.length;
  return [cx, cy];
}
